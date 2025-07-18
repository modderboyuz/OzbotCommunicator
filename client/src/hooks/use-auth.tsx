import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, type AuthUser } from "@/lib/auth";
import { useTelegram } from "@/hooks/use-telegram";

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: telegramUser, isTelegramWebApp, isReady } = useTelegram();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is coming from Telegram Web App
        if (isTelegramWebApp && isReady && telegramUser && !user) {
          // Auto-login with Telegram user data - check role from database
          try {
            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ telegram_id: telegramUser.id })
            });
            
            if (response.ok) {
              const { user: dbUser } = await response.json();
              const authUser: AuthUser = {
                id: dbUser.id,
                phone: dbUser.phone,
                first_name: dbUser.first_name,
                last_name: dbUser.last_name,
                telegram_username: dbUser.telegram_username,
                telegram_id: dbUser.telegram_id,
                role: dbUser.role, // Use actual role from database
                type: 'telegram'
              };
              
              login(authUser);
              console.log('Auto-logged in via Telegram Web App with role:', dbUser.role);
            } else {
              // Fallback to client role if user not found in database
              const authUser: AuthUser = {
                id: telegramUser.id.toString(),
                phone: `tg_${telegramUser.id}`,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name || '',
                telegram_username: telegramUser.username,
                telegram_id: telegramUser.id,
                role: 'client',
                type: 'telegram'
              };
              
              login(authUser);
              console.log('Auto-logged in via Telegram Web App as client (not in DB)');
            }
          } catch (error) {
            console.error('Failed to check user role:', error);
          }
        } else {
          // Regular auth check
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isTelegramWebApp && isReady) {
      checkAuth();
    } else if (!isTelegramWebApp) {
      checkAuth();
    }
  }, [isTelegramWebApp, isReady, telegramUser]);

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('telegram_id', userData.telegram_id?.toString() || '');
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
