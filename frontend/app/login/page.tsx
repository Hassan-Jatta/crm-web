'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/utilisateurs');
      const utilisateurs = await res.json();

      const userTrouve = utilisateurs.find((u: any) => u.email === email && u.mot_de_passe === password);

      if (userTrouve) {
        // Petit délai artificiel pour l'effet "pro" du chargement
        setTimeout(() => {
          login({
            id_utilisateur: userTrouve.id_utilisateur,
            nom_prenom: userTrouve.nom_prenom,
            email: userTrouve.email,
            role: userTrouve.role,
          });
        }, 800);
      } else {
        setErreur('Identifiants incorrects. Veuillez réessayer.');
        setLoading(false);
      }
    } catch (err) {
      setErreur('Erreur de connexion au serveur.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#fff' }}>
      
      {/* PARTIE GAUCHE : L'Image de marque (Visible uniquement sur grand écran) */}
      <div style={{ 
        flex: 1, 
        backgroundImage: 'linear-gradient(rgba(17, 24, 39, 0.7), rgba(17, 24, 39, 0.9)), url("https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=2000&auto=format&fit=crop")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '3.5rem', margin: '0 0 20px 0', letterSpacing: '-2px', fontWeight: '900' }}>
          👟 KICKS
        </h2>
        <p style={{ fontSize: '1.5rem', margin: 0, maxWidth: '500px', lineHeight: '1.4', color: '#e5e7eb' }}>
          Gérez votre empire de la sneaker. 
          <br /><span style={{ color: '#4CAF50', fontWeight: 'bold' }}>Vendez plus. Gérez mieux.</span>
        </p>
        
        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>© 2026 Kicks CRM - Portail Collaborateur interne.</p>
        </div>
      </div>

      {/* PARTIE DROITE : Le Formulaire */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#111827' }}>Bienvenue 👋</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '1.05rem' }}>
              Veuillez vous identifier pour accéder à votre espace de travail.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>Adresse email </label>
              <input 
                type="email" 
                placeholder="prenom.nom@kicks.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' }} 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>Mot de passe</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' }} 
              />
            </div>

            {erreur && (
              <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '10px 15px', borderRadius: '4px' }}>
                <p style={{ color: '#b91c1c', margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>{erreur}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '16px', 
                background: loading ? '#9ca3af' : '#111827', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                marginTop: '10px',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Connexion en cours... ⏳' : 'Accéder au CRM'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}