'use client';

import { useEffect, useState } from 'react';

interface Contact { id_contact: string; nom: string; prenom: string; }
interface Utilisateur { id_utilisateur: string; nom_prenom: string; role: string; }

interface Lead {
  id_lead: string;
  id_contact?: string;
  id_utilisateur?: string;
  statut: string;
  source?: string;
  montant_estime?: number;
  contact?: Contact;
  utilisateur?: Utilisateur;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recherche, setRecherche] = useState('');

  // États du formulaire
  const [idContact, setIdContact] = useState('');
  const [idUtilisateur, setIdUtilisateur] = useState('');
  const [statut, setStatut] = useState('Nouveau lead');
  const [source, setSource] = useState('');
  const [montant, setMontant] = useState('');
  
  const [formMessage, setFormMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // 🟢 On charge les 3 listes en même temps !
      const [resLeads, resContacts, resUtilisateurs] = await Promise.all([
        fetch('http://localhost:4000/leads'),
        fetch('http://localhost:4000/contacts'),
        fetch('http://localhost:4000/utilisateurs')
      ]);
      
      if (!resLeads.ok || !resContacts.ok || !resUtilisateurs.ok) throw new Error('Erreur réseau');
      
      setLeads(await resLeads.json());
      setContacts(await resContacts.json());
      setUtilisateurs(await resUtilisateurs.json());
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
    setFormMessage(editingId ? 'Modification...' : 'Ajout...');

    const leadData = {
      id_contact: idContact || null,
      id_utilisateur: idUtilisateur || null,
      statut: statut,
      source: source || null,
      montant_estime: montant ? parseFloat(montant) : null,
    };

    try {
      const url = editingId ? `http://localhost:4000/leads/${editingId}` : 'http://localhost:4000/leads';
      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) throw new Error("Erreur de sauvegarde.");
      setFormMessage(editingId ? '✅ Lead mis à jour !' : '✅ Lead créé !');
      resetForm();
      fetchData(); 
    } catch (err: any) {
      setFormMessage(`❌ Erreur : ${err.message}`);
    }
  };

  const handleEditClick = (lead: Lead) => {
    setEditingId(lead.id_lead);
    setIdContact(lead.id_contact || '');
    setIdUtilisateur(lead.id_utilisateur || '');
    setStatut(lead.statut);
    setSource(lead.source || '');
    setMontant(lead.montant_estime ? lead.montant_estime.toString() : '');
    setFormMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setIdContact(''); setIdUtilisateur(''); setStatut('Nouveau'); setSource(''); setMontant('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette opportunité ?")) return;
    try {
      await fetch(`http://localhost:4000/leads/${id}`, { method: 'DELETE' });
      setLeads(leads.filter(l => l.id_lead !== id));
    } catch (err: any) {
      alert("Erreur de suppression");
    }
  };

  // Fonction pour colorer les statuts
  const getStatutStyle = (statut: string) => {
    switch(statut.toLowerCase()) {
      case 'nouveau lead': return { bg: '#e3f2fd', color: '#1565c0' }; // Bleu très clair
      case 'qualification': return { bg: '#bbdefb', color: '#0d47a1' }; // Bleu moyen
      case 'proposition': return { bg: '#e1bee7', color: '#4a148c' }; // Violet
      case 'négociation': return { bg: '#ffe0b2', color: '#e65100' }; // Orange
      case 'paiement en attente': return { bg: '#fff9c4', color: '#f57f17' }; // Jaune
      case 'gagné': return { bg: '#c8e6c9', color: '#1b5e20' }; // Vert
      case 'perdu': return { bg: '#ffcdd2', color: '#b71c1c' }; // Rouge
      default: return { bg: '#f5f5f5', color: '#333' };
    }
  };

  const leadsFiltres = leads.filter((lead) => {
    const txt = recherche.toLowerCase();
    return (
      lead.statut.toLowerCase().includes(txt) ||
      (lead.source && lead.source.toLowerCase().includes(txt)) ||
      (lead.contact && `${lead.contact.prenom} ${lead.contact.nom}`.toLowerCase().includes(txt)) ||
      (lead.utilisateur && lead.utilisateur.nom_prenom.toLowerCase().includes(txt))
    );
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🎯 Gestion des Opportunités (Leads)</h1>

      {/* --- FORMULAIRE --- */}
      <div style={{ background: editingId ? '#e6f2ff' : '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: editingId ? '2px solid #0066cc' : 'none' }}>
        <h3>{editingId ? '✏️ Modifier l\'opportunité' : '➕ Nouvelle Opportunité'}</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
          
          <select value={idContact} onChange={(e) => setIdContact(e.target.value)} required style={{ padding: '10px' }}>
            <option value="">-- Choisir un Client --</option>
            {contacts.map(c => <option key={c.id_contact} value={c.id_contact}>{c.prenom} {c.nom}</option>)}
          </select>

          <select value={idUtilisateur} onChange={(e) => setIdUtilisateur(e.target.value)} style={{ padding: '10px' }}>
            <option value="">-- Assigner un Commercial --</option>
            {utilisateurs.map(u => <option key={u.id_utilisateur} value={u.id_utilisateur}>{u.nom_prenom} ({u.role})</option>)}
          </select>

          <select value={statut} onChange={(e) => setStatut(e.target.value)} required style={{ padding: '10px' }}>
            <option value="Nouveau lead">Nouveau lead</option>
            <option value="Qualification">Qualification</option>
            <option value="Proposition">Proposition</option>
            <option value="Négociation">Négociation</option>
            <option value="Paiement en attente">Paiement en attente</option>
            <option value="Gagné">Gagné</option>
            <option value="Perdu">Perdu</option>
          </select>

          <input type="number" placeholder="Montant estimé (€)" value={montant} onChange={(e) => setMontant(e.target.value)} style={{ padding: '10px' }}/>
          
          <input type="text" placeholder="Source (ex: Instagram, Recommandation...)" value={source} onChange={(e) => setSource(e.target.value)} style={{ padding: '10px', gridColumn: '1 / -1' }}/>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '10px', background: editingId ? '#0066cc' : 'black', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
              {editingId ? 'Mettre à jour' : 'Créer l\'opportunité'}
            </button>
            {editingId && <button type="button" onClick={resetForm} style={{ padding: '10px', background: '#ccc', borderRadius: '5px' }}>Annuler</button>}
          </div>
        </form>
        {formMessage && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{formMessage}</p>}
      </div>

      <input type="text" placeholder="🔍 Rechercher (statut, client, commercial...)" value={recherche} onChange={(e) => setRecherche(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ccc' }} />

      <h3>Pipeline des ventes ({leadsFiltres.length})</h3>
      {loading && <p>Chargement...</p>}
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {leadsFiltres.map((lead) => {
          const style = getStatutStyle(lead.statut);
          
          return (
            <div key={lead.id_lead} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              
              <div>
                <span style={{ background: style.bg, color: style.color, padding: '4px 10px', borderRadius: '15px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {lead.statut}
                </span>
                
                <h4 style={{ margin: '10px 0 5px 0', fontSize: '1.2rem' }}>
                  {lead.contact ? `Deal avec ${lead.contact.prenom} ${lead.contact.nom}` : 'Client inconnu'}
                </h4>
                
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  💰 {lead.montant_estime ? `${lead.montant_estime} €` : 'Montant inconnu'} 
                  {lead.source && ` | 📍 Source : ${lead.source}`}
                </p>
                
                {lead.utilisateur && (
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#888' }}>
                    👤 Géré par : {lead.utilisateur.nom_prenom}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => handleEditClick(lead)} style={{ background: '#f0ad4e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' }}>Modifier</button>
                <button onClick={() => handleDelete(lead.id_lead)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' }}>Supprimer</button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}