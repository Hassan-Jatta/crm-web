'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();


  const navItems = [
    { name: '📊 Tableau de bord', path: '/' },
    { name: '📇 Clients', path: '/contacts' },
    { name: '🎯 Pipeline commercial', path: '/leads' },
    { name: '📅 Tâches', path: '/taches' },
    { name: '📦 Inventaire', path: '/produits' },
    { name: '💳 Commandes', path: '/commandes' }, 
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: '📈 Statistiques', path: '/statistiques' });
    navItems.push({ name: '👔 Equipe', path: '/equipe' });
  }



  const getInitials = (name?: string) => {
    if (!name) return '👤';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <nav style={{ 
      width: '260px', 
      backgroundColor: '#111827', 
      color: 'white', 
      padding: '20px', 
      boxSizing: 'border-box', // 🟢 Empêche le menu de déborder de l'écran
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      position: 'fixed', 
      left: 0, 
      top: 0 
    }}>
      
      {/* 1. EN-TÊTE / LOGO */}
      <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '10px' }}>
        <h2 style={{ fontSize: '2rem', margin: '0', letterSpacing: '-1px', color: '#fff' }}>
          KICKS
        </h2>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px' }}>
          CRM System
        </span>
      </div>

      {/* 2. PROFIL UTILISATEUR (Remonté ici !) */}
      <div style={{ marginBottom: '30px', paddingBottom: '25px', borderBottom: '1px solid #374151', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: user?.role === 'Admin' ? '#9c27b0' : '#0066cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {getInitials(user?.nom_prenom)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>{user?.nom_prenom || 'Chargement...'}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#4CAF50' }}>{user?.role || 'Connecté'}</p>
          </div>
        </div>

        <button 
          onClick={logout} 
          style={{ padding: '10px', background: '#374151', color: '#fca5a5', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', transition: 'background 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.background = '#4b5563'}
          onMouseOut={(e) => e.currentTarget.style.background = '#374151'}
        >
        Me déconnecter
        </button>
      </div>

      {/* 3. LIENS DE NAVIGATION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          
          return (
            <Link key={item.path} href={item.path} style={{
              textDecoration: 'none',
              color: isActive ? 'white' : '#9ca3af',
              backgroundColor: isActive ? '#374151' : 'transparent',
              padding: '12px 15px',
              borderRadius: '8px',
              fontSize: '1.05rem',
              fontWeight: isActive ? 'bold' : 'normal',
              transition: 'all 0.2s ease-in-out',
              borderLeft: isActive ? '4px solid #4CAF50' : '4px solid transparent'
            }}>
              {item.name}
            </Link>
          );
        })}
      </div>
      
    </nav>
  );
}