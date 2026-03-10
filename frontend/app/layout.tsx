'use client'; 

import { usePathname } from 'next/navigation';
import Navbar from './components/Navbar'; 
import { AuthProvider } from './context/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // ⚠️ ATTENTION : Si ta page de login est sur "/", modifie ici pour : pathname === '/'
  const isLoginPage = pathname === '/login'

  return (
    <html lang="fr">
      {/* 1. On enlève le "display: flex" du body pour éviter que la barre se mette à gauche */}
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f5f7fa', fontFamily: 'sans-serif' }}>
        
        <AuthProvider>
          
          {/* 2. On crée un conteneur qui s'empile de haut en bas (column) */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            {/* 3. La barre de navigation s'affiche en haut (sauf sur le login) */}
            {!isLoginPage && <Navbar />}

            {/* 4. Le contenu principal prend tout le reste de la place, sans marge à gauche ! */}
            <main style={{ 
              flex: 1, 
              width: '100%', 
              // On garde 0 padding sur le login pour ton image plein écran, sinon on met 40px pour aérer le CRM
              padding: isLoginPage ? '0' : '40px', 
              boxSizing: 'border-box' 
            }}>
              {children}
            </main>

          </div>

        </AuthProvider>

      </body>
    </html>
  );
}