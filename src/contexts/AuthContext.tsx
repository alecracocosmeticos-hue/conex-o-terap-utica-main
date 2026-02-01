import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
type TherapistType = Database['public']['Enums']['therapist_type'];

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  therapist_type: TherapistType | null;
  specialty: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  isRoleLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setUserRole: (role: AppRole, therapistType?: TherapistType) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile | null;
  };

  const fetchRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error fetching role:', error);
      return null;
    }
    if (!data || data.length === 0) {
      return null;
    }
    return data[0].role as AppRole;
  };

  const refreshProfile = async () => {
    if (!user) return;
    const [profileData, roleData] = await Promise.all([
      fetchProfile(user.id),
      fetchRole(user.id)
    ]);
    setProfile(profileData);
    setRole(roleData);
  };

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setRoleLoading(true);
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            const [profileData, roleData] = await Promise.all([
              fetchProfile(session.user.id),
              fetchRole(session.user.id)
            ]);
            setProfile(profileData);
            setRole(roleData);
            setRoleLoading(false);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          setRoleLoading(false);
          setLoading(false);
        }
      }
    );

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setRoleLoading(true);
        Promise.all([
          fetchProfile(session.user.id),
          fetchRole(session.user.id)
        ]).then(([profileData, roleData]) => {
          setProfile(profileData);
          setRole(roleData);
          setRoleLoading(false);
          setLoading(false);
        });
      } else {
        setRoleLoading(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
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
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const setUserRole = async (newRole: AppRole, therapistType?: TherapistType) => {
    if (!user) return { error: new Error('User not authenticated') };

    // Upsert role to handle both insert and update cases
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert(
        { user_id: user.id, role: newRole },
        { onConflict: 'user_id' }
      );

    if (roleError) {
      return { error: roleError as Error };
    }

    // Update profile with therapist type if applicable
    if (newRole === 'therapist' && therapistType) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ therapist_type: therapistType })
        .eq('id', user.id);

      if (profileError) {
        return { error: profileError as Error };
      }
    }

    setRole(newRole);
    await refreshProfile();
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error as Error | null };
  };

  // isRoleLoading: true when we have a user but role hasn't been fetched yet
  const isRoleLoading = loading || (!!user && roleLoading);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        isRoleLoading,
        signUp,
        signIn,
        signOut,
        setUserRole,
        refreshProfile,
        resetPassword,
        updatePassword,
      }}
    >
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
