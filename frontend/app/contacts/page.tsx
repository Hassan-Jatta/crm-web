'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

// --- INTERFACES ---
interface Entreprise { id_entreprise: string; nom_societe: string; secteur_activite?: string; type_entreprise?: string; }
interface Contact { id_contact: string; nom: string; prenom: string; email?: string; telephone?: string; id_entreprise?: string; entreprise?: Entreprise; }

export default function ContactsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'B2C' | 'B2B'>('B2C');
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState('');

  // --- ÉTATS DES FORMULAIRES ---
  const [showForm, setShowForm] = useState(false);
  
  // États Formulaire Contact
  const [c_id, setC_id] = useState<string | null>(null);
  const [c_nom, setC_nom] = useState('');
  const [c_prenom, setC_prenom] = useState('');
  const [c_email, setC_email] = useState('');
  const [c_telephone, setC_telephone] = useState('');
  const [c_id_entreprise, setC_id_entreprise] = useState('');

  // États Formulaire Entreprise
  const [e_id, setE_id] = useState<string | null>(null);
  const [e_nom, setE_nom] = useState('');
  const [e_secteur, setE_secteur] = useState('');
  const [e_type, setE_type] = useState('');

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = async () => {
    try {
      const [resContacts, resEntreprises] = await Promise.all([
        fetch('http://localhost:4000/contacts'),
        fetch('http://localhost:4000/entreprises')
      ]);
      if (resContacts.ok) setContacts(await resContacts.json());
      if (resEntreprises.ok) setEntreprises(await resEntreprises.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- SOUMISSION : CONTACT ---
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { nom: c_nom, prenom: c_prenom, email: c_email || null, telephone: c_telephone || null, id_entreprise: c_id_entreprise || null };
    const url = c_id ? `http://localhost:4000/contacts/${c_id}` : 'http://localhost:4000/contacts';
    
    await fetch(url, {
      method: c_id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    setShowForm(false); resetContactForm(); fetchData();
  };

  // --- SOUMISSION : ENTREPRISE ---
  const handleSubmitEntreprise = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { nom_societe: e_nom, secteur_activite: e_secteur || null, type_entreprise: e_type || null };
    const url = e_id ? `http://localhost:4000/entreprises/${e_id}` : 'http://localhost:4000/entreprises';
    
    await fetch(url, {
      method: e_id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    setShowForm(false); resetEntrepriseForm(); fetchData();
  };

  // --- ACTIONS ---
  const handleEditContact = (c: Contact) => {
    setC_id(c.id_contact); setC_nom(c.nom); setC_prenom(c.prenom); 
    setC_email(c.email || ''); setC_telephone(c.telephone || ''); 
    setC_id_entreprise(c.id_entreprise || ''); setShowForm(true);
  };

  const handleEditEntreprise = (e: Entreprise) => {
    setE_id(e.id_entreprise); setE_nom(e.nom_societe); 
    setE_secteur(e.secteur_activite || ''); setE_type(e.type_entreprise || ''); 
    setShowForm(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("Supprimer ce contact ?")) return;
    await fetch(`http://localhost:4000/contacts/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeleteEntreprise = async (id: string) => {
    if (!window.confirm("Supprimer cette entreprise ?")) return;
    await fetch(`http://localhost:4000/entreprises/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const resetContactForm = () => { setC_id(null); setC_nom(''); setC_prenom(''); setC_email(''); setC_telephone(''); setC_id_entreprise(''); };
  const resetEntrepriseForm = () => { setE_id(null); setE_nom(''); setE_secteur(''); setE_type(''); };

  // --- FILTRES ---
  const contactsFiltres = contacts.filter(c => c.nom.toLowerCase().includes(recherche.toLowerCase()) || c.prenom.toLowerCase().includes(recherche.toLowerCase()));
  const entreprisesFiltrees = entreprises.filter(e => e.nom_societe?.toLowerCase().includes(recherche.toLowerCase()));

  if (loading) return <p style={{ padding: '40px' }}>Chargement de l'annuaire...</p>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 10px 0' }}>📇 Gestion des clients</h1>
          <p style={{ margin: 0, color: '#666' }}>Gérez vos relations particuliers et partenaires commerciaux.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input type="text" placeholder="🔍 Rechercher..." value={recherche} onChange={(e) => setRecherche(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minWidth: '250px' }} />
          <button 
            onClick={() => { activeTab === 'B2C' ? resetContactForm() : resetEntrepriseForm(); setShowForm(!showForm); }} 
            style={{ padding: '10px 20px', background: showForm ? '#ccc' : 'black', color: showForm ? 'black' : 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {showForm ? '❌ Fermer' : (activeTab === 'B2C' ? '➕ Nouveau Contact' : '➕ Nouvelle Entreprise')}
          </button>
        </div>
      </div>

      {/* --- LES ONGLETS --- */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
        <button onClick={() => { setActiveTab('B2C'); setShowForm(false); }} style={{ padding: '10px 20px', background: activeTab === 'B2C' ? '#111827' : 'transparent', color: activeTab === 'B2C' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}>
          👤 Particuliers ({contacts.length})
        </button>
        <button onClick={() => { setActiveTab('B2B'); setShowForm(false); }} style={{ padding: '10px 20px', background: activeTab === 'B2B' ? '#0066cc' : 'transparent', color: activeTab === 'B2B' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}>
          🏢 Entreprises ({entreprises.length})
        </button>
      </div>

      {/* --- FORMULAIRE DYNAMIQUE (Caché par défaut) --- */}
      {showForm && (
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: `2px solid ${activeTab === 'B2C' ? '#111827' : '#0066cc'}` }}>
          <h3 style={{ marginTop: 0 }}>{activeTab === 'B2C' ? (c_id ? '✏️ Modifier le contact' : '➕ Ajouter un contact') : (e_id ? '✏️ Modifier l\'entreprise' : '➕ Ajouter une entreprise')}</h3>
          
          {activeTab === 'B2C' ? (
            <form onSubmit={handleSubmitContact} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="text" placeholder="Prénom" value={c_prenom} onChange={(e) => setC_prenom(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Nom" value={c_nom} onChange={(e) => setC_nom(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <input type="email" placeholder="Email" value={c_email} onChange={(e) => setC_email(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Téléphone" value={c_telephone} onChange={(e) => setC_telephone(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <select value={c_id_entreprise} onChange={(e) => setC_id_entreprise(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', gridColumn: '1 / -1' }}>
                <option value="">-- Lier à une entreprise (Optionnel) --</option>
                {entreprises.map(e => <option key={e.id_entreprise} value={e.id_entreprise}>{e.nom_societe}</option>)}
              </select>
              <button type="submit" style={{ gridColumn: '1 / -1', padding: '12px', background: '#111827', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Enregistrer</button>
            </form>
          ) : (
            <form onSubmit={handleSubmitEntreprise} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="text" placeholder="Nom de la société" value={e_nom} onChange={(e) => setE_nom(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', gridColumn: '1 / -1' }} />
              <input type="text" placeholder="Secteur (ex: Retail)" value={e_secteur} onChange={(e) => setE_secteur(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <select value={e_type} onChange={(e) => setE_type(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                <option value="">-- Type --</option>
                <option value="Fournisseur">Fournisseur</option>
                <option value="Client B2B">Client B2B</option>
                <option value="Partenaire">Partenaire</option>
              </select>
              <button type="submit" style={{ gridColumn: '1 / -1', padding: '12px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Enregistrer</button>
            </form>
          )}
        </div>
      )}

      {/* --- LISTE DES CARTES --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        
        {activeTab === 'B2C' && contactsFiltres.map((contact) => (
          <div key={contact.id_contact} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '4px solid #111827', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{contact.prenom} {contact.nom}</h3>
            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>✉️ {contact.email || 'Pas d\'email'}</p>
            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>📞 {contact.telephone || 'Pas de tel'}</p>
            {contact.entreprise && <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#0066cc', fontWeight: 'bold' }}>🏢 {contact.entreprise.nom_societe}</p>}
            
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #eee' }}>
              {/* 🟢 LE FAMEUX BOUTON VERS LA FICHE DÉTAILLÉE */}
              <Link href={`/contacts/${contact.id_contact}`} style={{ flex: 1, textAlign: 'center', background: '#f5f5f5', color: '#333', textDecoration: 'none', padding: '6px', borderRadius: '5px', fontSize: '0.85rem', fontWeight: 'bold' }}>👁️ Fiche</Link>
              <button onClick={() => handleEditContact(contact)} style={{ background: '#f0ad4e', color: 'white', border: 'none', padding: '6px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>✏️</button>
              {user?.role === 'Admin' && <button onClick={() => handleDeleteContact(contact.id_contact)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '6px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>❌</button>}
            </div>
          </div>
        ))}

        {activeTab === 'B2B' && entreprisesFiltrees.map((entreprise) => (
          <div key={entreprise.id_entreprise} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '4px solid #0066cc', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🏢 {entreprise.nom_societe}</h3>
            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>💼 {entreprise.secteur_activite || 'Secteur inconnu'}</p>
            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>🏷️ {entreprise.type_entreprise || 'Type inconnu'}</p>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #eee' }}>
              <button onClick={() => handleEditEntreprise(entreprise)} style={{ flex: 1, background: '#f0ad4e', color: 'white', border: 'none', padding: '6px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>✏️ Modifier</button>
              {user?.role === 'Admin' && <button onClick={() => handleDeleteEntreprise(entreprise.id_entreprise)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '6px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>❌</button>}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}