'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Utilisateur {
  id_utilisateur: string;
  nom_prenom: string;
  email: string;
  role: string;
  date_creation: string;
}

export default function EquipePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);

  // États du formulaire
  const [showForm, setShowForm] = useState(false);
  const [idEdit, setIdEdit] = useState<string | null>(null);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [role, setRole] = useState('Commercial');
  const [formMessage, setFormMessage] = useState('');

  // 🛡️ SÉCURITÉ : On bloque l'accès si on n'est pas Admin
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      router.push('/'); // On le renvoie à l'accueil
    }
  }, [user, router]);

  const fetchUtilisateurs = async () => {
    try {
      const res = await fetch('http://localhost:4000/utilisateurs');
      if (res.ok) setUtilisateurs(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') fetchUtilisateurs();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage('Enregistrement... ⏳');

    const data: any = { nom_prenom: nom, email, role };
    // On n'envoie le mot de passe que s'il est rempli (pour ne pas l'écraser lors d'une modif)
    if (motDePasse) data.mot_de_passe = motDePasse; 

    try {
      const url = idEdit ? `http://localhost:4000/utilisateurs/${idEdit}` : 'http://localhost:4000/utilisateurs';
      const method = idEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Erreur d'enregistrement");

      setFormMessage(idEdit ? '✅ Compte mis à jour !' : '✅ Collaborateur ajouté !');
      resetForm();
      fetchUtilisateurs();
      setTimeout(() => setFormMessage(''), 3000);
    } catch (err: any) {
      setFormMessage(`❌ Erreur : ${err.message}`);
    }
  };

  const handleEdit = (u: Utilisateur) => {
    setIdEdit(u.id_utilisateur);
    setNom(u.nom_prenom);
    setEmail(u.email);
    setRole(u.role);
    setMotDePasse(''); // On laisse vide par sécurité
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (id === user?.id_utilisateur) {
      alert("Vous ne pouvez pas supprimer votre propre compte Admin !");
      return;
    }
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet accès ?")) return;
    
    await fetch(`http://localhost:4000/utilisateurs/${id}`, { method: 'DELETE' });
    fetchUtilisateurs();
  };

  const resetForm = () => {
    setIdEdit(null); setNom(''); setEmail(''); setMotDePasse(''); setRole('Commercial'); setShowForm(false);
  };

  if (user?.role !== 'Admin') return null; // Sécurité anti-clignotement
  if (loading) return <p style={{ padding: '40px' }}>Chargement de l'équipe...</p>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 10px 0' }}>👔 Gestion des collaborateurs</h1>
          <p style={{ margin: 0, color: '#666' }}>Gérez les accès et les rôles de vos collaborateurs.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          style={{ padding: '10px 20px', background: showForm ? '#ccc' : 'black', color: showForm ? 'black' : 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {showForm ? '❌ Annuler' : '➕ Nouvel Employé'}
        </button>
      </div>

      {/* --- FORMULAIRE --- */}
      {showForm && (
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '30px', borderTop: '4px solid #9c27b0' }}>
          <h3 style={{ marginTop: 0 }}>{idEdit ? '✏️ Modifier l\'accès' : '🔐 Créer un compte'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            <input type="text" placeholder="Prénom et Nom (ex: Jean Dupont)" value={nom} onChange={(e) => setNom(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            
            <input type="email" placeholder="Email professionnel" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            
            <input type="password" placeholder={idEdit ? "Nouveau mot de passe (laisser vide si inchangé)" : "Mot de passe provisoire"} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required={!idEdit} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }}>
              <option value="Standard">Standard (Lecture/Service Client)</option>
              <option value="Commercial">Commercial (Ventes & Leads)</option>
              <option value="Admin">Admin (Tous les droits)</option>
            </select>

            <button type="submit" style={{ gridColumn: '1 / -1', padding: '12px', background: '#9c27b0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {idEdit ? 'Mettre à jour le collaborateur' : 'Créer les accès'}
            </button>
            {formMessage && <p style={{ gridColumn: '1 / -1', margin: 0, fontWeight: 'bold', color: formMessage.includes('✅') ? 'green' : 'red', textAlign: 'center' }}>{formMessage}</p>}
          </form>
        </div>
      )}

      {/* --- LISTE DES UTILISATEURS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {utilisateurs.map((u) => {
          let roleColor = '#0066cc'; // Commercial
          if (u.role === 'Admin') roleColor = '#9c27b0';
          if (u.role === 'Standard') roleColor = '#4CAF50';

          return (
            <div key={u.id_utilisateur} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: `4px solid ${roleColor}`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{u.nom_prenom}</h3>
                <span style={{ background: `${roleColor}15`, color: roleColor, padding: '4px 8px', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 'bold' }}>{u.role}</span>
              </div>
              <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>✉️ {u.email}</p>
              <p style={{ margin: '5px 0 15px 0', fontSize: '0.8rem', color: '#999' }}>Créé le {new Date(u.date_creation).toLocaleDateString('fr-FR')}</p>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <button onClick={() => handleEdit(u)} style={{ flex: 1, background: '#f5f5f5', border: '1px solid #ddd', padding: '6px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>✏️ Modifier</button>
                <button onClick={() => handleDelete(u.id_utilisateur)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>❌</button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}