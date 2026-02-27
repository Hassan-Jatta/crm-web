'use client';

import { useEffect, useState } from 'react';

interface Contact {
  id_contact: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  pointure?: number;
  marque_preferee?: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
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
  const [formMessage, setFormMessage] = useState('');
  
  // Mémorise si on est en train de modifier un contact (et lequel)
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      const response = await fetch('http://localhost:4000/contacts');
      if (!response.ok) throw new Error('Erreur de récupération');
      const data = await response.json();
      setContacts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Cette fonction gère l'ajout et la modification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(editingId ? 'Modification en cours...' : 'Ajout en cours...');

    const contactData = {
      nom,
      prenom,
      email,
      telephone: telephone || null,
      pointure: pointure ? parseFloat(pointure) : null,
      marque_preferee: marque || null,
    };

    try {
      // Si editingId existe, on fait un PATCH (Modifier), sinon un POST (Ajouter)
      const url = editingId ? `http://localhost:4000/contacts/${editingId}` : 'http://localhost:4000/contacts';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement.");

      setFormMessage(editingId ? '✅ Contact modifié !' : '✅ Contact ajouté !');
      
      // On vide le formulaire et on sort du mode édition
      resetForm();
      fetchContacts(); 
      
    } catch (err: any) {
      setFormMessage(`❌ Erreur : ${err.message}`);
    }
  };

  // 🟢 NOUVEAU : Fonction pour remplir le formulaire quand on clique sur "Modifier"
  const handleEditClick = (contact: Contact) => {
    setEditingId(contact.id_contact);
    setNom(contact.nom);
    setPrenom(contact.prenom);
    setEmail(contact.email);
    setTelephone(contact.telephone || '');
    setPointure(contact.pointure ? contact.pointure.toString() : '');
    setMarque(contact.marque_preferee || '');
    setFormMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonte la page tout en haut
  };

  // Fonction pour vider le formulaire et annuler la modification
  const resetForm = () => {
    setEditingId(null);
    setNom(''); setPrenom(''); setEmail(''); setTelephone(''); setPointure(''); setMarque('');
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
      (contact.marque_preferee && contact.marque_preferee.toLowerCase().includes(texteRecherche))
    );
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📇 Gestion des Contacts</h1>

      {/* --- FORMULAIRE --- */}
      <div style={{ background: editingId ? '#e6f2ff' : '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: editingId ? '2px solid #0066cc' : 'none' }}>
        <h3>{editingId ? '✏️ Modifier le client' : '➕ Ajouter un nouveau client'}</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
          <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required style={{ padding: '8px' }}/>
          <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required style={{ padding: '8px' }}/>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '8px', gridColumn: '1 / -1' }} disabled={editingId !== null} />
          <input type="tel" placeholder="Téléphone (optionnel)" value={telephone} onChange={(e) => setTelephone(e.target.value)} style={{ padding: '8px' }}/>
          <input type="number" step="0.5" placeholder="Pointure (ex: 42.5)" value={pointure} onChange={(e) => setPointure(e.target.value)} style={{ padding: '8px' }}/>
          <input type="text" placeholder="Marque préférée (optionnel)" value={marque} onChange={(e) => setMarque(e.target.value)} style={{ padding: '8px', gridColumn: '1 / -1' }}/>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '10px', background: editingId ? '#0066cc' : 'black', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
              {editingId ? 'Mettre à jour le contact' : 'Sauvegarder le contact'}
            </button>
            
            {/* Bouton Annuler (visible uniquement si on modifie) */}
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '10px', background: '#ccc', color: 'black', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
                Annuler
              </button>
            )}
          </div>
        </form>
        {formMessage && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{formMessage}</p>}
      </div>

      <input 
        type="text" 
        placeholder="🔍 Rechercher un client (nom, email, marque...)" 
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}
      />

      <h3>Liste de mes clients ({contactsFiltres.length})</h3>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {contactsFiltres.map((contact) => (
          <div key={contact.id_contact} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{contact.prenom} {contact.nom}</strong> 
              <br />✉️ {contact.email} {contact.telephone && `| 📞 ${contact.telephone}`}
              {(contact.pointure || contact.marque_preferee) && (
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#555' }}>
                  👟 Pointure: {contact.pointure || '?'} | ❤️ Marque: {contact.marque_preferee || '?'}
                </p>
              )}
            </div>

            {/* LES BOUTONS D'ACTION */}
            <div style={{ display: 'flex', gap: '10px' }}>

              <button 
                onClick={() => window.location.href = `/contacts/${contact.id_contact}`}
                style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
              >
                Voir la fiche
              </button>

              <button 
                onClick={() => handleEditClick(contact)}
                style={{ background: '#f0ad4e', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
              >
                Modifier
              </button>
              
              <button 
                onClick={() => handleDeleteContact(contact.id_contact)}
                style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
              >
                Supprimer
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}