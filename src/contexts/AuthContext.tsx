
import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "student" | "professor" | "alumni";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
}

interface AuthContextType {
  currentUser: User | null;
  signIn: (email: string, password: string, role: UserRole) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock databases for each user role
const studentDb: User[] = [
  {
    id: "s1",
    name: "John Doe",
    email: "john@university.edu",
    role: "student",
    profilePicture: "https://i.pravatar.cc/150?u=john"
  }
];

const professorDb: User[] = [
  {
    id: "p1",
    name: "Dr. Jane Smith",
    email: "jane@university.edu",
    role: "professor",
    profilePicture: "https://i.pravatar.cc/150?u=jane"
  }
];

const alumniDb: User[] = [
  {
    id: "a1",
    name: "Alex Johnson",
    email: "alex@company.com",
    role: "alumni",
    profilePicture: "https://i.pravatar.cc/150?u=alex"
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem("unilink_user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let userFound = null;
      
      switch (role) {
        case "student":
          userFound = studentDb.find(user => user.email === email);
          break;
        case "professor":
          userFound = professorDb.find(user => user.email === email);
          break;
        case "alumni":
          userFound = alumniDb.find(user => user.email === email);
          break;
      }
      
      if (userFound) {
        setCurrentUser(userFound);
        localStorage.setItem("unilink_user", JSON.stringify(userFound));
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      const emailExists = 
        studentDb.some(u => u.email === email) || 
        professorDb.some(u => u.email === email) || 
        alumniDb.some(u => u.email === email);
      
      if (emailExists) {
        throw new Error("Email already in use");
      }
      
      // Create new user
      const newUser: User = {
        id: `${role[0]}${Date.now()}`,
        name,
        email,
        role,
        profilePicture: `https://i.pravatar.cc/150?u=${email}`
      };
      
      // Add to appropriate database (in real app, this would be a server call)
      switch (role) {
        case "student":
          studentDb.push(newUser);
          break;
        case "professor":
          professorDb.push(newUser);
          break;
        case "alumni":
          alumniDb.push(newUser);
          break;
      }
      
      // Auto sign in
      setCurrentUser(newUser);
      localStorage.setItem("unilink_user", JSON.stringify(newUser));
      
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem("unilink_user");
  };

  return (
    <AuthContext.Provider value={{ currentUser, signIn, signUp, signOut, isLoading, error }}>
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
