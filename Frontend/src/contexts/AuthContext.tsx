import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, streaksAPI } from "@/services/api";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  currentStreak: number;
  longestStreak: number;
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const authStatus = localStorage.getItem("isAuthenticated");
      
      if (token && authStatus === "true") {
        try {
          // Verify token and get user data from backend
          const response = await authAPI.getMe();
          if (response.success && response.data) {
            setIsAuthenticated(true);
            setUser(response.data.user);
            if (response.data.streak) {
              setCurrentStreak(response.data.streak.currentStreak || 0);
              setLongestStreak(response.data.streak.longestStreak || 0);
            }
          }
        } catch (error) {
          // Token invalid, clear auth
          localStorage.removeItem("authToken");
          localStorage.removeItem("isAuthenticated");
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        // Store token
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("isAuthenticated", "true");
        
        // Update state
        setIsAuthenticated(true);
        setUser(response.data.user);
        
        // Update streak
        if (response.data.streak) {
          setCurrentStreak(response.data.streak.currentStreak || 0);
          setLongestStreak(response.data.streak.longestStreak || 0);
        }
        
        toast.success("Login successful!");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.register(name, email, password);
      
      if (response.success && response.data) {
        // Store token
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("isAuthenticated", "true");
        
        // Update state
        setIsAuthenticated(true);
        setUser(response.data.user);
        
        // Update streak
        if (response.data.streak) {
          setCurrentStreak(response.data.streak.currentStreak || 0);
          setLongestStreak(response.data.streak.longestStreak || 0);
        }
        
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    setUser(null);
    setCurrentStreak(0);
    setLongestStreak(0);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentStreak, longestStreak, user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
