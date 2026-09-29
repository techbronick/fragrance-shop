import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin status is cached per user id so token refreshes and duplicate auth
  // events don't re-query admin_users.
  const adminCache = useRef<{ userId: string; isAdmin: boolean } | null>(null);
  const latest = useRef(0);

  const resolveAdmin = async (userId: string): Promise<boolean> => {
    if (adminCache.current?.userId === userId) return adminCache.current.isAdmin;
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      const result = !error && !!data;
      adminCache.current = { userId, isAdmin: result };
      return result;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // `loading` stays true until admin status is known. Flipping it earlier let
  // Admin.tsx see { user, isAdmin: false } for a moment and bounce real admins
  // to the home page ("Access Denied"), intermittently.
  const applySession = async (next: Session | null) => {
    const run = ++latest.current;
    const nextUser = next?.user ?? null;
    const admin = nextUser ? await resolveAdmin(nextUser.id) : false;
    if (run !== latest.current) return; // a newer auth event superseded this one
    setSession(next);
    setUser(nextUser);
    setIsAdmin(admin);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => applySession(session));

    // Supabase warns against awaiting other supabase calls inside this
    // callback (it can deadlock), so defer the work.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => applySession(session), 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // Resolve admin status before returning so the caller can navigate
    // straight to a protected route.
    if (!error) await applySession(data.session);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
