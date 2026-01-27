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

  const fetchUserRolesAndPermissions = async (userId: string) => {
    const currentFetchId = ++fetchCounter.current;
    console.log(`[AUTH] [#${currentFetchId}] fetchUserRolesAndPermissions (Single RPC)`);

    try {
      // Use a single SECURITY DEFINER RPC with a 5s heartbeat timeout to prevent hangs
      const fetchPromise = (supabase as any).rpc("get_user_auth_metadata", { p_user_id: userId });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Auth metadata timeout")), 10000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) throw error;

      if (data) {
        setIsAdmin(data.is_admin);
        setUserRoles(data.is_admin ? ["user", "admin"] : ["user"]);
        setAllowedPaths(data.allowed_paths || []);
        setHomePage(data.home_page || "/");
        console.log(`[AUTH] [#${currentFetchId}] Metadata loaded:`, {
          isAdmin: data.is_admin,
          homePage: data.home_page,
          pathsCount: data.allowed_paths?.length
        });
      }

    } catch (err) {
      if (currentFetchId === fetchCounter.current) {
        console.error("[AUTH] Error in fetchUserRolesAndPermissions:", err);
        // Fallback safe state to prevent infinite loading
        setIsAdmin(false);
        setUserRoles(["user"]);
        setAllowedPaths([]);
        setHomePage("/");
      } else {
        console.log(`[AUTH] [#${currentFetchId}] Ignored error (replaced by #${fetchCounter.current})`);
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
      await fetchUserRolesAndPermissions(user.id);
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
