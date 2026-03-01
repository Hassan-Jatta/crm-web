'use client'; // Le layout devient un composant client pour utiliser le hook de chemin

import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login'; // On vérifie si on est sur la page de connexion

  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f5f7fa', fontFamily: 'sans-serif', display: 'flex' }}>
        
  
        <AuthProvider>
          
          {!isLoginPage && <Sidebar />}

          <main style={{ 
            marginLeft: isLoginPage ? '0' : '260px', 
            width: isLoginPage ? '100%' : 'calc(100% - 260px)', 
            minHeight: '100vh' 
          }}>
            {children}
          </main>

        </AuthProvider>

      </body>
    </html>
  );
}