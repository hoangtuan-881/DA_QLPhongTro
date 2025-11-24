/**
 * Auth Context
 * Global authentication state management
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authService, LoginRequest, RegisterRequest } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/http-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (maQuyen: number) => boolean;
  hasAnyRole: (maQuyens: number[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const controller = new AbortController();

    const initializeAuth = async () => {
      try {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          // Get stored user
          const storedUser = authService.getStoredUser();

          if (storedUser) {
            setUser(storedUser);

            // Refresh user data from server
            try {
              const freshUser = await authService.getCurrentUser(controller.signal);
              setUser(freshUser);
            } catch (error: any) {
              // Only handle non-cancelled errors
              if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                // If refresh fails, clear auth state
                console.error('Failed to refresh user:', error);
                setUser(null);
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup: abort request if component unmounts
    return () => {
      controller.abort();
    };
  }, []);

  const login = async (credentials: LoginRequest): Promise<User> => {
    try {
      const user = await authService.login(credentials);
      setUser(user);
      return user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    try {
      const user = await authService.register(data);
      setUser(user);
      return user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const hasRole = (maQuyen: number): boolean => {
    return user?.MaQuyen === maQuyen;
  };

  const hasAnyRole = (maQuyens: number[]): boolean => {
    return user ? maQuyens.includes(user.MaQuyen) : false;
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
