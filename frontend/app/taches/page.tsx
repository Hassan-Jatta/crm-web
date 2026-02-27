'use client';

import { useEffect, useState } from 'react';

interface Contact { id_contact: string; nom: string; prenom: string; }
interface Utilisateur { id_utilisateur: string; nom_prenom: string; role: string; }
interface Lead { id_lead: string; statut: string; montant_estime: number; }

interface Tache {
  id_tache: string;
  titre: string;
  description?: string;
  date_echeance: string;
  statut: string;
  type_tache: string;
  id_utilisateur?: string;
  id_contact?: string;
  id_lead?: string;
  contact?: Contact;
  utilisateur?: Utilisateur;
}

export default function TachesPage() {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [dateEcheance, setDateEcheance] = useState('');
  const [statut, setStatut] = useState('À faire');
  const [typeTache, setTypeTache] = useState('Appel');
  const [idContact, setIdContact] = useState('');
  const [idUtilisateur, setIdUtilisateur] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [resTaches, resContacts, resUtilisateurs] = await Promise.all([
        fetch('http://localhost:4000/taches'),
        fetch('http://localhost:4000/contacts'),
        fetch('http://localhost:4000/utilisateurs')
      ]);
      setTaches(await resTaches.json());
      setContacts(await resContacts.json());
      setUtilisateurs(await resUtilisateurs.json());
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // On convertit la date locale en format ISO pour la base de données
    const isoDate = new Date(dateEcheance).toISOString();

    const data = {
      titre, description: description || null, date_echeance: isoDate,
      statut, type_tache: typeTache,
      id_contact: idContact || null, id_utilisateur: idUtilisateur || null,
    };

    const url = editingId ? `http://localhost:4000/taches/${editingId}` : 'http://localhost:4000/taches';
    await fetch(url, {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    resetForm();
    fetchData();
  };

  const handleEdit = (tache: Tache) => {
    setEditingId(tache.id_tache);
    setTitre(tache.titre);
    setDescription(tache.description || '');
    // Formatage de la date pour l'input datetime-local
    setDateEcheance(new Date(tache.date_echeance).toISOString().slice(0, 16));
    setStatut(tache.statut);
    setTypeTache(tache.type_tache);
    setIdContact(tache.id_contact || '');
    setIdUtilisateur(tache.id_utilisateur || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitre(''); setDescription(''); setDateEcheance('');
    setStatut('À faire'); setTypeTache('Appel'); setIdContact(''); setIdUtilisateur('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    await fetch(`http://localhost:4000/taches/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // Fonction pour savoir si une tâche est en retard
  const isRetard = (date: string, statut: string) => {
    if (statut === 'Terminé') return false;
    return new Date(date) < new Date();
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>📅 Gestion des Tâches & Rappels</h1>

      {/* --- FORMULAIRE --- */}
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>{editingId ? '✏️ Modifier la tâche' : '➕ Ajouter une tâche'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
          
          <input type="text" placeholder="Titre (ex: Relancer pour devis)" value={titre} onChange={(e) => setTitre(e.target.value)} required style={{ padding: '10px', gridColumn: '1 / -1' }}/>
          
          <select value={typeTache} onChange={(e) => setTypeTache(e.target.value)} required style={{ padding: '10px' }}>
            <option value="Appel">📞 Appel</option>
            <option value="Email">✉️ Email</option>
            <option value="Rendez-vous">🤝 Rendez-vous</option>
            <option value="Rappel">⏰ Rappel divers</option>
          </select>

          <input type="datetime-local" value={dateEcheance} onChange={(e) => setDateEcheance(e.target.value)} required style={{ padding: '10px' }}/>

          <select value={idContact} onChange={(e) => setIdContact(e.target.value)} style={{ padding: '10px' }}>
            <option value="">-- Concerne quel client ? (Optionnel) --</option>
            {contacts.map(c => <option key={c.id_contact} value={c.id_contact}>{c.prenom} {c.nom}</option>)}
          </select>

          <select value={idUtilisateur} onChange={(e) => setIdUtilisateur(e.target.value)} style={{ padding: '10px' }}>
            <option value="">-- Assigner à (Optionnel) --</option>
            {utilisateurs.map(u => <option key={u.id_utilisateur} value={u.id_utilisateur}>{u.nom_prenom}</option>)}
          </select>

          <select value={statut} onChange={(e) => setStatut(e.target.value)} required style={{ padding: '10px' }}>
            <option value="À faire">À faire</option>
            <option value="Terminé">Terminé</option>
          </select>

          <button type="submit" style={{ gridColumn: '1 / -1', padding: '10px', background: 'black', color: 'white', borderRadius: '5px' }}>
            {editingId ? 'Mettre à jour' : 'Enregistrer la tâche'}
          </button>
        </form>
      </div>

      {/* --- LISTE DES TÂCHES --- */}
      <h3>Ma To-Do List</h3>
      {loading ? <p>Chargement...</p> : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {taches.map(tache => {
            const retard = isRetard(tache.date_echeance, tache.statut);
            
            return (
              <div key={tache.id_tache} style={{ border: `2px solid ${retard ? '#ff4444' : '#ddd'}`, opacity: tache.statut === 'Terminé' ? 0.6 : 1, padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', background: 'white' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', textDecoration: tache.statut === 'Terminé' ? 'line-through' : 'none' }}>
                    {tache.type_tache === 'Appel' && '📞'} {tache.type_tache === 'Email' && '✉️'} {tache.type_tache === 'Rendez-vous' && '🤝'} {tache.type_tache === 'Rappel' && '⏰'} {tache.titre}
                  </h4>
                  
                  <p style={{ margin: 0, fontSize: '14px', color: retard ? '#ff4444' : '#666', fontWeight: retard ? 'bold' : 'normal' }}>
                    Échéance : {new Date(tache.date_echeance).toLocaleString('fr-FR')} {retard && ' (EN RETARD 🚨)'}
                  </p>
                  
                  {tache.contact && <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>👤 Client : {tache.contact.prenom} {tache.contact.nom}</p>}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {tache.statut !== 'Terminé' && (
                    <button onClick={() => { setEditingId(tache.id_tache); setStatut('Terminé'); handleSubmit({ preventDefault: () => {} } as any); }} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '5px', cursor: 'pointer' }}>
                      ✅ Fait
                    </button>
                  )}
                  <button onClick={() => handleEdit(tache)} style={{ background: '#f0ad4e', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '5px' }}>Modif</button>
                  <button onClick={() => handleDelete(tache.id_tache)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '5px' }}>Suppr</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}