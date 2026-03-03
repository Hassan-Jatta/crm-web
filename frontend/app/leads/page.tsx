'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Contact { id_contact: string; nom: string; prenom: string; }
interface Utilisateur { id_utilisateur: string; nom_prenom: string; role: string; }
interface Lead { id_lead: string; id_contact?: string; id_utilisateur?: string; statut: string; source?: string; montant_estime?: number; contact?: Contact; utilisateur?: Utilisateur; }

const COLONNES = [
  'Nouveau lead', 
  'Qualification', 
  'Proposition', 
  'Négociation', 
  'Paiement en attente', 
  'Gagné', 
  'Perdu'
];

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // États du formulaire
  const [idContact, setIdContact] = useState('');
  const [idUtilisateur, setIdUtilisateur] = useState('');
  const [statut, setStatut] = useState('Nouveau lead');
  const [source, setSource] = useState('');
  const [montant, setMontant] = useState('');

  const fetchData = async () => {
    try {
      const [resLeads, resContacts, resUtilisateurs] = await Promise.all([
        fetch('http://localhost:4000/leads'),
        fetch('http://localhost:4000/contacts'),
        fetch('http://localhost:4000/utilisateurs')
      ]);
      setLeads(await resLeads.json());
      setContacts(await resContacts.json());
      setUtilisateurs(await resUtilisateurs.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- SOUMISSION DU FORMULAIRE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = {
      id_contact: idContact || null,
      id_utilisateur: idUtilisateur || null,
      statut, source: source || null, montant_estime: montant ? parseFloat(montant) : null,
    };

    const url = editingId ? `http://localhost:4000/leads/${editingId}` : 'http://localhost:4000/leads';
    await fetch(url, {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });

    resetForm();
    setShowForm(false);
    fetchData(); 
  };

  const handleEditClick = (lead: Lead) => {
    setEditingId(lead.id_lead); setIdContact(lead.id_contact || ''); setIdUtilisateur(lead.id_utilisateur || '');
    setStatut(lead.statut); setSource(lead.source || ''); setMontant(lead.montant_estime ? lead.montant_estime.toString() : '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null); setIdContact(''); setIdUtilisateur(''); setStatut('Nouveau lead'); setSource(''); setMontant('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette opportunité ?")) return;
    await fetch(`http://localhost:4000/leads/${id}`, { method: 'DELETE' });
    setLeads(leads.filter(l => l.id_lead !== id));
  };

  // --- LOGIQUE DU GLISSER-DÉPOSER (DRAG & DROP) 🟢 ---
  const handleDragStart = (e: React.DragEvent, id_lead: string) => {
    e.dataTransfer.setData('lead_id', id_lead);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Nécessaire pour autoriser le "drop"
  };

  const handleDrop = async (e: React.DragEvent, nouveauStatut: string) => {
    e.preventDefault();
    const id_lead = e.dataTransfer.getData('lead_id');
    if (!id_lead) return;

    // 1. Mise à jour visuelle instantanée (Optimistic UI)
    setLeads(leads.map(lead => lead.id_lead === id_lead ? { ...lead, statut: nouveauStatut } : lead));

    // 2. Mise à jour dans la base de données
    await fetch(`http://localhost:4000/leads/${id_lead}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: nouveauStatut })
    });
  };

  // --- DESIGN DES COLONNES ---
  const getHeaderColor = (statut: string) => {
    switch(statut) {
      case 'Nouveau lead': return '#2196F3'; // Bleu
      case 'Qualification': return '#03A9F4'; // Bleu clair
      case 'Proposition': return '#9C27B0'; // Violet
      case 'Négociation': return '#FF9800'; // Orange
      case 'Paiement en attente': return '#FFC107'; // Jaune
      case 'Gagné': return '#4CAF50'; // Vert
      case 'Perdu': return '#F44336'; // Rouge
      default: return '#9E9E9E';
    }
  };

  const leadsFiltres = leads.filter(l => 
    l.source?.toLowerCase().includes(recherche.toLowerCase()) || 
    l.contact?.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    l.contact?.prenom.toLowerCase().includes(recherche.toLowerCase())
  );

  if (loading) return <p style={{ padding: '40px' }}>Chargement du Pipeline...</p>;

  return (
    <div style={{ padding: '30px 40px', paddingLeft: '60px', boxSizing: 'border-box', fontFamily: 'sans-serif', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER & ACTIONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>🎯 Pipeline des ventes</h1>
          <p style={{ margin: 0, color: '#666' }}>Glissez et déposez les cartes pour faire avancer vos opportunités.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input type="text" placeholder="🔍 Rechercher..." value={recherche} onChange={(e) => setRecherche(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minWidth: '250px' }} />
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ padding: '10px 20px', background: showForm ? '#ccc' : 'black', color: showForm ? 'black' : 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {showForm ? '❌ Fermer' : '➕ Nouvelle Opportunité'}
          </button>
        </div>
      </div>

      {/* FORMULAIRE FLOTTANT */}
      {showForm && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '2px solid #0066cc' }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? '✏️ Modifier l\'opportunité' : '➕ Créer un deal'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px', display: 'block' }}>Client *</label>
              <select value={idContact} onChange={(e) => setIdContact(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                <option value="">-- Choisir --</option>
                {contacts.map(c => <option key={c.id_contact} value={c.id_contact}>{c.prenom} {c.nom}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px', display: 'block' }}>Montant estimé (€)</label>
              <input type="number" value={montant} onChange={(e) => setMontant(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}/>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px', display: 'block' }}>Source</label>
              <input type="text" placeholder="Ex: Instagram" value={source} onChange={(e) => setSource(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}/>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px', display: 'block' }}>Statut initial</label>
              <select value={statut} onChange={(e) => setStatut(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                {COLONNES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" style={{ padding: '11px 20px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Enregistrer
            </button>
          </form>
        </div>
      )}

      {/* --- LE TABLEAU KANBAN --- */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', flex: 1, paddingBottom: '20px' }}>
        {COLONNES.map(colonne => {
          const leadsColonne = leadsFiltres.filter(l => l.statut === colonne);
          const totalArgent = leadsColonne.reduce((sum, l) => sum + (Number(l.montant_estime) || 0), 0);

          return (
            <div 
              key={colonne} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, colonne)}
              style={{ background: '#e5e7eb', flex: 1, minWidth: '160px', borderRadius: '8px', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}
            >
              {/* EN-TÊTE DE COLONNE AFFINÉ */}
              <div style={{ padding: '10px', background: 'white', borderTop: `4px solid ${getHeaderColor(colonne)}`, borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <strong style={{ fontSize: '0.85rem', color: '#333', textTransform: 'uppercase', lineHeight: '1.2' }}>{colonne}</strong>
                <span style={{ background: '#eee', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>{leadsColonne.length}</span>
              </div>
              
              {totalArgent > 0 && (
                <div style={{ padding: '6px 10px', background: '#f9fafb', fontSize: '0.8rem', color: '#666', borderBottom: '1px solid #ddd', fontWeight: 'bold', textAlign: 'center' }}>
                  💰 {totalArgent.toFixed(2)} €
                </div>
              )}

              {/* ZONE DES CARTES (DROPPABLE) */}
              <div style={{ padding: '10px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {leadsColonne.map(lead => (
                  <div 
                    key={lead.id_lead} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, lead.id_lead)}
                    style={{ background: 'white', padding: '10px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'grab', borderLeft: `4px solid ${getHeaderColor(lead.statut)}` }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>{lead.contact ? `${lead.contact.prenom} ${lead.contact.nom}` : 'Client Inconnu'}</strong>
                      {lead.montant_estime && <span style={{ color: '#0066cc', fontWeight: 'bold', fontSize: '0.85rem' }}>{Number(lead.montant_estime).toFixed(2)} €</span>}
                    </div>
                    
                    {lead.source && <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#666' }}>📍 {lead.source}</p>}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                      <button onClick={() => handleEditClick(lead)} style={{ background: 'none', border: 'none', color: '#f0ad4e', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}>✏️ Modif</button>
                      
                      {user?.role === 'Admin' && (
                        <button onClick={() => handleDelete(lead.id_lead)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}>❌</button>
                      )}
                  </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}