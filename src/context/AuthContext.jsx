
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!error) {
        setUser(data.session?.user ?? null);
      }

      setLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // CREATE A NEW ACCOUNT
  const signUp = async (fullName, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) throw error;

    return data;
  };

  // LOGIN WITH EMAIL AND PASSWORD
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw error;

    setUser(data.user);
    return data;
  };

  // RESEND EMAIL VERIFICATION
  const resendVerification = async (email) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) throw error;

    return true;
  };

  // SIGN OUT
  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signUp,
    login,
    resendVerification,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
