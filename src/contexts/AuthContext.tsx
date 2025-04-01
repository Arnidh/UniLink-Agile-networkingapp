
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

export type UserRole = "student" | "professor" | "alumni";

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  bio?: string;
  university?: string;
  department?: string;
  profile_picture?: string;
  graduation_year?: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  currentUser: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data?.user) {
        await fetchProfile(data.user.id);
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in."
        });
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred while signing in",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Your account has been successfully created."
      });
    } catch (error: any) {
      setError(error.message || "Failed to sign up");
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred while signing up",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      toast({
        title: "Signed out",
        description: "You've been successfully signed out."
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      profile, 
      session,
      isLoading, 
      error, 
      signIn, 
      signUp, 
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
