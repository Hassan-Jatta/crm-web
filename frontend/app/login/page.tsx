'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false); // 🟢 Le bouton bascule (Connexion / Inscription)
  
  const [nom, setNom] = useState(''); // Utilisé que pour l'inscription
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [erreur, setErreur] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setSuccess('');
    setLoading(true);

    try {
      if (!isSignUp) {
        // ==========================================
        // 🔵 MODE CONNEXION
        // ==========================================
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw new Error("Identifiants incorrects.");

        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/utilisateurs');
        if (!res.ok) throw new Error("Erreur de communication avec le serveur.");
        const utilisateurs = await res.json();
        
        const userTrouve = utilisateurs.find((u: any) => u.email === email);

        if (userTrouve) {
          setTimeout(() => {
            login({
              id_utilisateur: userTrouve.id_utilisateur,
              nom_prenom: userTrouve.nom_prenom,
              email: userTrouve.email,
              role: userTrouve.role,
            });
          }, 800);
        } else {
          throw new Error("Profil introuvable dans l'annuaire.");
        }

      } else {
        // ==========================================
        // 🟢 MODE INSCRIPTION
        // ==========================================
        
        // 1. On crée le compte sécurisé dans Supabase
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw new Error(`Erreur Supabase: ${authError.message}`);

        // 2. On crée le profil public dans la base de données (rôle "Commercial" par défaut)
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/utilisateurs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nom_prenom: nom, 
            email: email, 
            role: 'Commercial' // 🔒 Sécurité : Rôle limité par défaut !
          }),
        });

        if (!res.ok) throw new Error("Erreur lors de la création du profil.");

        // 3. Succès !
        setSuccess("✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
        setIsSignUp(false); // On remet le formulaire en mode "Connexion"
        setPassword(''); // On vide le mot de passe par sécurité
      }

    } catch (err: any) {
      setErreur(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#fff' }}>
      
      {/* PARTIE GAUCHE */}
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
        <h2 style={{ fontSize: '3.5rem', margin: '0 0 20px 0', letterSpacing: '-2px', fontWeight: '900' }}>👟 KICKS</h2>
        <p style={{ fontSize: '1.5rem', margin: 0, maxWidth: '500px', lineHeight: '1.4', color: '#e5e7eb' }}>
          Gérez votre empire de la sneaker. <br /><span style={{ color: '#4CAF50', fontWeight: 'bold' }}>Vendez plus. Gérez mieux.</span>
        </p>
        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>© 2026 Kicks CRM - Portail Collaborateur interne.</p>
        </div>
      </div>

      {/* PARTIE DROITE */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#111827' }}>
              {isSignUp ? 'Créer un compte ✨' : 'Bienvenue 👋'}
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '1.05rem' }}>
              {isSignUp ? 'Rejoignez l\'équipe Kicks CRM.' : 'Veuillez vous identifier pour accéder à votre espace.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Champ NOM affiché uniquement à l'inscription */}
            {isSignUp && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>Prénom et Nom</label>
                <input type="text" placeholder="Jean Dupont" value={nom} onChange={(e) => setNom(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' }} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>Adresse email</label>
              <input type="email" placeholder="prenom.nom@kicks.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>Mot de passe</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' }} />
            </div>

            {erreur && (
              <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '10px 15px', borderRadius: '4px' }}>
                <p style={{ color: '#b91c1c', margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>{erreur}</p>
              </div>
            )}

            {success && (
              <div style={{ background: '#f0fdf4', borderLeft: '4px solid #22c55e', padding: '10px 15px', borderRadius: '4px' }}>
                <p style={{ color: '#15803d', margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>{success}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{ padding: '16px', background: loading ? '#9ca3af' : '#111827', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
              {loading ? 'Chargement... ⏳' : (isSignUp ? "M'inscrire" : 'Accéder au CRM')}
            </button>
          </form>

          {/* Lien pour basculer entre Inscription et Connexion */}
          <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.95rem', color: '#6b7280' }}>
            {isSignUp ? "Vous avez déjà un compte ? " : "Vous n'avez pas de compte ? "}
            <span 
              onClick={() => { setIsSignUp(!isSignUp); setErreur(''); setSuccess(''); }} 
              style={{ color: '#4CAF50', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isSignUp ? "Se connecter" : "S'inscrire"}
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}