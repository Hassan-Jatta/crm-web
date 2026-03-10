'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // On ne masque pas la Navbar sur la page de connexion, on ne la rend juste pas !
  if (!user) return null;

  const navLinks = [
    { name: '📊 Tableau de bord', href: '/' },
    { name: '📇 Clients', href: '/contacts' },
    { name: '🎯 Pipeline commercial', href: '/leads' },
    { name: '📅 Tâches', href: '/taches' },
    { name: '📦 Inventaire', href: '/produits' },
    { name: '💳 Commandes', href: '/commandes' },
  ];

  // Seul l'Admin voit les onglets Statistiques et Équipe
  if (user.role === 'Admin') {
    navLinks.push({ name: '📈 Statistiques', href: '/statistiques' });
    navLinks.push({ name: '👔 Équipe', href: '/equipe' });
  }

  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 40px', 
      height: '70px', 
      backgroundColor: '#111827',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      
      {/* GAUCHE : Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'white' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-1px', fontWeight: '900' }}>
            KICKS
          </h2>
        </Link>

        {/* CENTRE : Liens de navigation */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.name} 
                href={link.href}
                style={{
                  textDecoration: 'none',
                  color: isActive ? 'white' : '#9ca3af',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 'bold' : '500',
                  transition: 'all 0.2s ease'
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* DROITE : Profil & Déconnexion */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>{user.nom_prenom}</p>
          <span style={{ fontSize: '0.75rem', backgroundColor: '#4CAF50', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>
            {user.role}
          </span>
        </div>
        <button 
          onClick={logout}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #4b5563',
            color: '#d1d5db',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Déconnexion
        </button>
      </div>

    </nav>
  );
}