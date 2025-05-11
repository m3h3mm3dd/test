import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { useRouter } from 'next/navigation';

type UserRole = 'project_owner' | 'team_leader' | 'member' | 'stakeholder';

interface User {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Role: UserRole;
  ProfileUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isProjectOwner: boolean;
  isTeamLeader: boolean;
  isMember: boolean;
  isStakeholder: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem('taskup_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('taskup_token');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { Email: email, Password: password });
      localStorage.setItem('taskup_token', response.data.access_token);
      
      // Get user data
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
      
      router.push('/dashboard');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('taskup_token');
    setUser(null);
    router.push('/login');
  };

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.Role);
    }
    
    return user.Role === role;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isProjectOwner: user?.Role === 'project_owner',
      isTeamLeader: user?.Role === 'team_leader',
      isMember: user?.Role === 'member',
      isStakeholder: user?.Role === 'stakeholder',
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}