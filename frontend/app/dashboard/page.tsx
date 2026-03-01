'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
      } else {
        setUserEmail(session.user.email || '');
      }
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Tableau de bord CRM 📈</h1>
      {userEmail ? (
        <>
          <p>Bienvenue, <strong>{userEmail}</strong> ! Tu es bien connecté.</p>
          <button 
            onClick={handleLogout} 
            style={{ marginTop: '20px', padding: '10px', cursor: 'pointer', background: '#ff4444', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Se déconnecter
          </button>
        </>
      ) : (
        <p>Vérification de l'accès...</p>
      )}
    </div>
  );
}