import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { toast } from '@/lib/toast';

export type UserRole = 'project_owner' | 'team_leader' | 'member' | 'stakeholder';

export interface AuthUser {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Role: UserRole;
  JobTitle?: string;
  ProfileUrl?: string;
  LastLogin?: string;
}

export function useAuth(requiredRole?: UserRole | UserRole[]) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function verifyAuth() {
      try {
        const token = localStorage.getItem('taskup_token');
        
        if (!token) {
          setLoading(false);
          router.push('/login');
          return;
        }

        const response = await api.get('/auth/me');
        const userData = response.data;
        setUser(userData);
        
        // Check if user has required role
        if (requiredRole) {
          const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
          
          if (!roles.includes(userData.Role)) {
            toast.error('You do not have permission to access this page');
            router.push('/dashboard');
            return;
          }
        }
        
        setLoading(false);
        setInitialized(true);
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('taskup_token');
        setLoading(false);
        router.push('/login');
      }
    }

    verifyAuth();
  }, [router, requiredRole]);

  const logout = () => {
    localStorage.removeItem('taskup_token');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, initialized, logout };
}