import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@shared/routes';
import { User } from '@shared/schema';
import { apiFetch } from '@/lib/api';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: any, isAdmin?: boolean) => void;
  register: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (!token) return null;
      try {
        return await apiFetch(api.auth.me.path);
      } catch (error) {
        localStorage.removeItem('auth_token');
        setToken(null);
        return null;
      }
    },
    enabled: !!token,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ credentials, isAdmin }: { credentials: any, isAdmin?: boolean }) => {
      const path = isAdmin ? api.auth.adminLogin.path : api.auth.login.path;
      const res = await apiFetch(path, {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      return res;
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      
      if (data.user.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/');
      }
    },
    onError: (error: Error) => {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch(api.auth.register.path, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return res;
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast({ title: "Account created!", description: "Welcome to ElectroMart." });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    }
  });

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    queryClient.setQueryData(['auth', 'me'], null);
    queryClient.clear();
    setLocation('/auth');
    toast({ title: "Logged out", description: "You have been logged out successfully." });
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      isLoading,
      login: (credentials, isAdmin) => loginMutation.mutate({ credentials, isAdmin }),
      register: (data) => registerMutation.mutate(data),
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
