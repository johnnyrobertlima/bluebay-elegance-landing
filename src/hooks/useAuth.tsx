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
    // We use Refs to avoid stale closure issues in onAuthStateChange callback.
    if (!force && userId === lastFetchedUserIdRef.current && hasRolesLoadedRef.current) {
      console.log(`[AUTH] [#${currentFetchId}] Skipping: Roles already loaded for user ${userId.substring(0, 4)}...`);
      setLoading(false); // Ensure we are not stuck
      return;
    }

    // OPTIMISTIC LOAD (Universal): Try to load from localStorage to unblock UI immediately
    // This runs for INITIAL_LOAD, SIGNED_IN, and VISIBILITY_CHANGE if not memoized.
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
            setLoading(false); // Unblock UI immediately!

            // Mark as loaded so we don't flicker
            hasRolesLoadedRef.current = true;
            // Mark as fetched so subsequent calls (e.g. SIGNED_IN) skip redundant RPCs
            lastFetchedUserIdRef.current = userId;

            console.log(`[AUTH] [#${currentFetchId}] Optimistic load from cache successful.`);
          }
        }
      } catch (e) {
        console.error("[AUTH] Failed to load cache", e);
      }
    }

    // 0. Check visibility state to adjust timeout strategy (Browser throttles background tabs)
    const isHidden = document.hidden;

    try {
      // FAST CHECK: If security is OFF and we are hidden, return immediately (Synchronous)
      if (isHidden && screenSecurityEnabledRef.current === false) {
        console.log(`[AUTH] [#${currentFetchId}] Skipped (Screen Security OFF + Hidden)`);
        // Do not fetch, do not invalidate.
        // Just ensure loading is false so UI shows whatever state we have.
        return;
      }

      console.log(`[AUTH] [#${currentFetchId}] fetchUserRolesAndPermissions - Hidden: ${isHidden}, Force: ${force}`);

      // Use a single SECURITY DEFINER RPC
      // Increased timeouts to tolerate slow networks/databases
      const TIMEOUT_MS = isHidden ? 60000 : 15000;

      const fetchPromise = (supabase as any).rpc("get_user_auth_metadata", { p_user_id: userId });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Auth metadata timeout")), TIMEOUT_MS)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) throw error;

      if (data) {
        const authMetadata = {
          isAdmin: data.is_admin,
          userRoles: data.is_admin ? ["user", "admin"] : ["user"],
          allowedPaths: data.allowed_paths || [],
          homePage: data.home_page || "/"
        };

        setIsAdmin(authMetadata.isAdmin);
        setUserRoles(authMetadata.userRoles as AppRole[]);
        setAllowedPaths(authMetadata.allowedPaths);
        setHomePage(authMetadata.homePage);

        // CACHE: Save to localStorage for instant load next time
        localStorage.setItem('bluebay_auth_metadata', JSON.stringify(authMetadata));

        // Mark as cached
        lastFetchedUserIdRef.current = userId;
        hasRolesLoadedRef.current = true;

        console.log(`[AUTH] [#${currentFetchId}] Metadata loaded (and cached):`, {
          isAdmin: data.is_admin,
          homePage: data.home_page,
          pathsCount: data.allowed_paths?.length
        });
      }
    } catch (err: any) {
      if (currentFetchId !== fetchCounter.current) {
        console.log(`[AUTH] [#${currentFetchId}] Ignored error (replaced)`);
        return;
      }

      // Ignore AbortErrors
      if (err.name === 'AbortError') {
        console.log(`[AUTH] [#${currentFetchId}] Request aborted.`);
        return;
      }

      // RESILIENCE: If it's a timeout and we already have roles (via Ref), allow "stale" state.
      // This uses Ref to be safe against stale closures too.
      // Actually userRoles state might be stale here too if closure is stale? 
      // Yes! 'fetchUserRolesAndPermissions' is stale.
      // BUT hasRolesLoadedRef is mutable and fresh.
      if ((err.message === 'Auth metadata timeout') && hasRolesLoadedRef.current) {
        console.warn(`[AUTH] [#${currentFetchId}] Timeout, but keeping existing session state (Resilient Mode).`);
      } else {
        console.error("[AUTH] Error in fetchUserRolesAndPermissions:", err);

        // Only invalidate if we really failed hard and have no fallback
        if (!hasRolesLoadedRef.current) {
          // Check if we have localStorage backup before failing? 
          // Actually, we usually load LS at start. If we are here, it means LS might be empty or we failed re-verify.

          setIsAdmin(false);
          setUserRoles(["user"]);
          setAllowedPaths([]);
          setHomePage("/");
          localStorage.removeItem('bluebay_auth_metadata'); // Clear bad cache
          hasRolesLoadedRef.current = false;
        }
      }
    } finally {
      if (currentFetchId === fetchCounter.current) {
        setLoading(false);
        console.log(`[AUTH] [#${currentFetchId}] Loading set to false.`);
      }
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
