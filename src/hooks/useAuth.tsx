import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  userRoles: AppRole[];
  allowedPaths: string[];
  homePage: string;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [allowedPaths, setAllowedPaths] = useState<string[]>([]);
  const [homePage, setHomePage] = useState<string>("/");
  const [isAdmin, setIsAdmin] = useState(false);
  const fetchCounter = useRef(0);

  // Cache security config to avoid async DB calls during critical auth events
  const screenSecurityEnabledRef = useRef<boolean>(true); // Default to true (safe)
  const lastFetchedUserIdRef = useRef<string | null>(null);
  // Ref to track if roles are loaded, avoiding stale closure issues in useEffect
  const hasRolesLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await (supabase as any).rpc("get_app_config", { p_key: 'screen_security_enabled' });
        if (data !== null) screenSecurityEnabledRef.current = data;
      } catch (e) {
        console.error("Failed to load screen security config", e);
      }
    };
    fetchConfig();
  }, []);

  const fetchUserRolesAndPermissions = async (userId: string, force = false) => {
    const currentFetchId = ++fetchCounter.current;

    // MEMOIZATION CHECK: If we already fetched for this user and have roles, skip unless forced.
    if (!force && userId === lastFetchedUserIdRef.current && hasRolesLoadedRef.current) {
      console.log(`[AUTH] [#${currentFetchId}] Skipping: Roles already loaded for user ${userId.substring(0, 4)}...`);
      setLoading(false);
      return;
    }

    // OPTIMISTIC LOAD: Try to load from localStorage
    if (!hasRolesLoadedRef.current) {
      try {
        const cached = localStorage.getItem('bluebay_auth_metadata');
        if (cached) {
          const meta = JSON.parse(cached);
          if (meta && meta.userRoles) {
            setIsAdmin(meta.isAdmin);
            setUserRoles(meta.userRoles);
            setAllowedPaths(meta.allowedPaths);
            setHomePage(meta.homePage);

            // Mark as loaded so we don't flicker
            hasRolesLoadedRef.current = true;
            lastFetchedUserIdRef.current = userId;

            console.log(`[AUTH] [#${currentFetchId}] Optimistic load from cache successful.`);

            // IMPORTANT: Unblock UI immediately
            setLoading(false);
          }
        }
      } catch (e) {
        console.error("[AUTH] Failed to load cache", e);
      }
    }

    // DECISION: Block or Background?
    // If we have roles loaded (from cache or previous fetch), we run validation in BACKGROUND.
    // If we have nothing, we MUST AWAIT (block) to prevent unauthorized access or flickering.
    const runInBackground = hasRolesLoadedRef.current;

    // The core validation logic
    const performRpcCheck = async () => {
      const isHidden = document.hidden;

      try {
        // FAST CHECK: If security is OFF and we are hidden, return immediately
        if (isHidden && screenSecurityEnabledRef.current === false) {
          console.log(`[AUTH] [#${currentFetchId}] Skipped (Screen Security OFF + Hidden)`);
          return;
        }

        console.log(`[AUTH] [#${currentFetchId}] fetchUserRolesAndPermissions (RPC) - Hidden: ${isHidden}, Force: ${force}, Background: ${runInBackground}`);

        const TIMEOUT_MS = isHidden ? 60000 : 15000;
        const fetchPromise = (supabase as any).rpc("get_user_auth_metadata", { p_user_id: userId });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Auth metadata timeout")), TIMEOUT_MS)
        );

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) throw error;

        if (data) {
          // Verify if we are still the relevant fetch
          if (currentFetchId !== fetchCounter.current) return;

          const authMetadata = {
            isAdmin: data.is_admin,
            userRoles: data.is_admin ? ["user", "admin"] : ["user"],
            allowedPaths: data.allowed_paths || [],
            homePage: data.home_page || "/"
          };

          // Apply updates
          setIsAdmin(authMetadata.isAdmin);
          setUserRoles(authMetadata.userRoles as AppRole[]);
          setAllowedPaths(authMetadata.allowedPaths);
          setHomePage(authMetadata.homePage);

          // Update cache
          localStorage.setItem('bluebay_auth_metadata', JSON.stringify(authMetadata));
          lastFetchedUserIdRef.current = userId;
          hasRolesLoadedRef.current = true;

          console.log(`[AUTH] [#${currentFetchId}] RPC Metadata validated.`);
        }
      } catch (err: any) {
        if (currentFetchId !== fetchCounter.current) return;

        // Ignore AbortErrors and Timeouts in Resilient Mode
        if (err.name === 'AbortError') return;

        // If it's a timeout and we are in background mode (already have roles), just log warning
        if (err.message === 'Auth metadata timeout' && hasRolesLoadedRef.current) {
          console.warn(`[AUTH] [#${currentFetchId}] Timeout in background validation. Keeping existing session.`);
          return;
        }

        console.error("[AUTH] Error in fetchUserRolesAndPermissions:", err);

        // Only invalidate if we are NOT in background mode (i.e. we truly failed to load anything)
        // If we are in background mode, we keep the stale (cached) data rather than crashing the UI.
        if (!hasRolesLoadedRef.current) {
          setIsAdmin(false);
          setUserRoles(["user"]);
          setAllowedPaths([]);
          setHomePage("/");
          localStorage.removeItem('bluebay_auth_metadata');
          hasRolesLoadedRef.current = false;
        }
      } finally {
        // Ensure loading is cleared if we were blocking
        if (!runInBackground && currentFetchId === fetchCounter.current) {
          setLoading(false);
          console.log(`[AUTH] [#${currentFetchId}] Loading set to false (Blocking finished).`);
        }
      }
    };

    if (runInBackground) {
      // STALE-WHILE-REVALIDATE: Fire and forget
      performRpcCheck();
    } else {
      // BLOCKING: Wait for result
      await performRpcCheck();
    }
  };

  const refreshRoles = async () => {
    if (user?.id) {
      await fetchUserRolesAndPermissions(user.id, true);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("[AUTH] Effect mounting");

    const initialize = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          // Background validation (will update state if changed, or use cache if available)
          await fetchUserRolesAndPermissions(initialSession.user.id);
        } else {
          setLoading(false);
          console.log("[AUTH] Loading state cleared (no initial session)");
        }
      } catch (err) {
        console.error("[AUTH] Init error:", err);
        setLoading(false);
      }
      // No finally block here, fetchUserRolesAndPermissions handles loading state
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        console.log(`[AUTH] Event: ${event}`);

        const currentUser = currentSession?.user ?? null;
        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
          // If we are already loading or have loaded THIS user, skip redundant fetch
          // unless it's a SIGNED_IN event which implies a fresh login
          const isFreshLogin = event === 'SIGNED_IN';
          const alreadyProcessing = fetchCounter.current > 0 && loading;

          if (!alreadyProcessing || isFreshLogin) {
            console.log(`[AUTH] Event ${event}: Fetching roles...`);
            setLoading(true);
            await fetchUserRolesAndPermissions(currentUser.id);
          } else {
            console.log(`[AUTH] Event ${event}: Skipping redundant fetch`);
          }
        } else {
          setUserRoles([]);
          setAllowedPaths([]);
          setHomePage("/");
          setIsAdmin(false);
          setLoading(false);
          console.log(`[AUTH] Event ${event}: Loading cleared (no user)`);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Re-verify auth when tab becomes visible (to handle cases where we skipped checks)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // If already loading, let the current process finish. Don't queue another one.
      if (loading) {
        console.log("[AUTH] Tab visible, but already loading. Skipping re-verify.");
        return;
      }

      if (!document.hidden && user) {
        console.log("[AUTH] Tab became visible: Re-verifying session compatibility...");
        // Optional: Check session validity or refresh roles if they might be stale
        // We soft-refresh to ensure we didn't miss a logout or permission change
        await fetchUserRolesAndPermissions(user.id);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, loading]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    try {
      setUserRoles([]);
      setIsAdmin(false);
      setAllowedPaths([]);
      setHomePage("/");
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      // Force clear local session state regardless of API result
      setSession(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAdmin,
      userRoles,
      allowedPaths,
      homePage,
      signUp,
      signIn,
      signOut,
      refreshRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
