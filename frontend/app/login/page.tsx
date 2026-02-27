'use client'; // Obligatoire dans Next.js pour utiliser des états (useState)

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Fonction pour s'inscrire
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Veuillez remplir l'email et le mot de passe.");
      return;
    }

    setLoading(true);
    setMessage('');
    
    // 1. On demande à Supabase de créer le compte sécurisé
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage(`Erreur Supabase : ${authError.message}`);
      setLoading(false);
      return;
    }

    try {
      await fetch('http://localhost:4000/utilisateurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          nom_prenom: email.split('@')[0],
        }),
      });

      setMessage('Inscription réussie ! Ton profil "standard" a été créé. Tu peux te connecter.');
    } catch (err) {
      console.error(err)
      setMessage('Le compte est créé mais le profil backend a échoué.');
    }

    setLoading(false);
  };

  // Fonction pour se connecter
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Veuillez remplir l'email et le mot de passe.");
      return;
    }

    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });


    if (error) {
      setMessage(`Erreur : ${error.message}`);
    } else {
      setMessage('Connexion réussie ! Redirection...');
      router.push('/dashboard'); // On redirigera vers le tableau de bord
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Connexion au CRM</h1>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="Ton email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
          required
        />
        <input
          type="password"
          placeholder="Ton mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
          required
        />
        
        <button onClick={handleSignIn} disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Chargement...' : 'Se connecter'}
        </button>
        
        <button onClick={handleSignUp} disabled={loading} style={{ padding: '10px', cursor: 'pointer', background: 'transparent', border: '1px solid black' }}>
          Créer un compte
        </button>
      </form>

      {/* Affichage des messages d'erreur ou de succès */}
      {message && <p style={{ marginTop: '20px', color: message.includes('Erreur') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}