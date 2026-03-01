'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Entreprise {
  id_entreprise: string;
  nom_societe: string;
}

interface Contact {
  id_contact: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  pointure?: number;
  marque_preferee?: string;
  id_entreprise?: string;
  entreprise?: { nom_societe: string };
}

export default function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recherche, setRecherche] = useState('');

  // États du formulaire
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [pointure, setPointure] = useState('');
  const [marque, setMarque] = useState('');
  const [idEntreprise, setIdEntreprise] = useState(''); 
  const [formMessage, setFormMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [resContacts, resEntreprises] = await Promise.all([
        fetch('http://localhost:4000/contacts'),
        fetch('http://localhost:4000/entreprises')
      ]);
      
      if (!resContacts.ok || !resEntreprises.ok) throw new Error('Erreur de récupération');
      
      setContacts(await resContacts.json());
      setEntreprises(await resEntreprises.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(editingId ? 'Modification en cours...' : 'Ajout en cours...');

    const contactData = {
      nom, prenom, email,
      telephone: telephone || null,
      pointure: pointure ? parseFloat(pointure) : null,
      marque_preferee: marque || null,
      id_entreprise: idEntreprise || null,
    };

    try {
      const url = editingId ? `http://localhost:4000/contacts/${editingId}` : 'http://localhost:4000/contacts';
      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement.");
      setFormMessage(editingId ? '✅ Contact modifié !' : '✅ Contact ajouté !');
      resetForm();
      fetchData(); 
    } catch (err: any) {
      setFormMessage(`❌ Erreur : ${err.message}`);
    }
  };

  const handleEditClick = (contact: Contact) => {
    setEditingId(contact.id_contact);
    setNom(contact.nom); setPrenom(contact.prenom); setEmail(contact.email);
    setTelephone(contact.telephone || '');
    setPointure(contact.pointure ? contact.pointure.toString() : '');
    setMarque(contact.marque_preferee || '');
    setIdEntreprise(contact.id_entreprise || '');
    setFormMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setNom(''); setPrenom(''); setEmail(''); setTelephone(''); 
    setPointure(''); setMarque(''); setIdEntreprise('');
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer ce client ?")) return;
    try {
      const response = await fetch(`http://localhost:4000/contacts/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      setContacts(contacts.filter(contact => contact.id_contact !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const contactsFiltres = contacts.filter((contact) => {
    const texteRecherche = recherche.toLowerCase();
    return (
      contact.nom.toLowerCase().includes(texteRecherche) ||
      contact.prenom.toLowerCase().includes(texteRecherche) ||
      contact.email.toLowerCase().includes(texteRecherche) ||
      (contact.entreprise && contact.entreprise.nom_societe.toLowerCase().includes(texteRecherche)) // 🟢 On peut même chercher par nom d'entreprise !
    );
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📇 Gestion des Contacts</h1>

      <div style={{ background: editingId ? '#e6f2ff' : '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>{editingId ? '✏️ Modifier le client' : '➕ Ajouter un nouveau client'}</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
          <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required style={{ padding: '8px' }}/>
          <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required style={{ padding: '8px' }}/>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={editingId !== null} style={{ padding: '8px', gridColumn: '1 / -1' }} />
          
          {/* MENU DÉROULANT DES ENTREPRISES */}
          <select value={idEntreprise} onChange={(e) => setIdEntreprise(e.target.value)} style={{ padding: '8px', gridColumn: '1 / -1' }}>
            <option value="">-- Aucune entreprise (Client particulier) --</option>
            {entreprises.map(ent => (
              <option key={ent.id_entreprise} value={ent.id_entreprise}>{ent.nom_societe}</option>
            ))}
          </select>

          <input type="tel" placeholder="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} style={{ padding: '8px' }}/>
          <input type="number" step="0.5" placeholder="Pointure (ex: 42.5)" value={pointure} onChange={(e) => setPointure(e.target.value)} style={{ padding: '8px' }}/>
          <input type="text" placeholder="Marque préférée" value={marque} onChange={(e) => setMarque(e.target.value)} style={{ padding: '8px', gridColumn: '1 / -1' }}/>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '10px', background: editingId ? '#0066cc' : 'black', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
              {editingId ? 'Mettre à jour' : 'Sauvegarder'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '10px', background: '#ccc', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>Annuler</button>
            )}
          </div>
        </form>
        {formMessage && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{formMessage}</p>}
      </div>

      <input type="text" placeholder="🔍 Rechercher un client..." value={recherche} onChange={(e) => setRecherche(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ccc' }} />

      <h3>Liste de mes clients ({contactsFiltres.length})</h3>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {contactsFiltres.map((contact) => (
          <div key={contact.id_contact} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{contact.prenom} {contact.nom}</strong> 
              
              {/* On affiche le nom de l'entreprise s'il y en a une */}
              {contact.entreprise && (
                <span style={{ marginLeft: '10px', background: '#e0e0e0', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>
                  🏢 {contact.entreprise.nom_societe}
                </span>
              )}

              <br />✉️ {contact.email} {contact.telephone && `| 📞 ${contact.telephone}`}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.location.href = `/contacts/${contact.id_contact}`} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Fiche</button>
              <button onClick={() => handleEditClick(contact)} style={{ background: '#f0ad4e', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Modifier</button>
              {user?.role === 'Admin' && (
                <button onClick={() => handleDeleteContact(contact.id_contact)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Supprimer</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}