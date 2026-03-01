'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// On définit à quoi ressemble un utilisateur connecté
interface Utilisateur {
  id_utilisateur: string;
  nom_prenom: string;
  email: string;
  role: string; // 'Admin', 'Commercial', 'Standard'
}

interface AuthContextType {
  user: Utilisateur | null;
  login: (userData: Utilisateur) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Au chargement, on regarde si quelqu'un est déjà connecté
    const storedUser = localStorage.getItem('kicks_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (pathname !== '/login') {
      // S'il n'y a personne et qu'on n'est pas déjà sur la page login, on l'y renvoie !
      router.push('/login');
    }
  }, [pathname, router]);

  const login = (userData: Utilisateur) => {
    setUser(userData);
    localStorage.setItem('kicks_user', JSON.stringify(userData));
    router.push('/'); // On redirige vers le tableau de bord
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kicks_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Un petit hook personnalisé super pratique pour utiliser l'auth partout
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};