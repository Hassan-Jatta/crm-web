'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// --- INTERFACES ---
interface Communication { id_communication: string; canal: string; objet_email: string; corps_email: string; date_envoi: string; }
interface Tache { id_tache: string; titre: string; type_tache: string; statut: string; date_echeance: string; }
interface Lead { id_lead: string; statut: string; source?: string; montant_estime?: number; date_creation: string; }
interface Produit { marque: string; modele: string; }
interface CommandeProduit { quantite: number; prix_unitaire_facture: number; produit: Produit; }
interface Commande { id_commande: string; montant_total: string; statut_paiement: string; date_commande: string; commande_produit: CommandeProduit[]; }

interface Contact {
  id_contact: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  pointure?: number;
  marque_preferee?: string;
  date_creation: string;
  entreprise?: { nom_societe: string };
  communication?: Communication[];
  tache?: Tache[];
  lead?: Lead[];
  commande?: Commande[];
}

interface ModeleEmail { id_modele: string; nom_modele: string; sujet: string; corps: string; }

export default function ContactDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [modeles, setModeles] = useState<ModeleEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États Email
  const [sujet, setSujet] = useState('');
  const [corps, setCorps] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [messageEnvoi, setMessageEnvoi] = useState('');

  // États Tâche
  const [titreTache, setTitreTache] = useState('');
  const [typeTache, setTypeTache] = useState('Appel');
  const [dateEcheance, setDateEcheance] = useState('');

  // --- CHARGEMENT DES DONNÉES ---
  const fetchContactSeul = async () => {
    const resContact = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts/${id}`);
    if (resContact.ok) setContact(await resContact.json());
  };

  useEffect(() => {
    if (!id) return;
    const fetchDonnees = async () => {
      try {
        const [resContact, resModeles] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/modeles-email`)
        ]);
        if (!resContact.ok) throw new Error('Contact introuvable');
        setContact(await resContact.json());
        if (resModeles.ok) setModeles(await resModeles.json());
      } catch (err: any) { 
        setError(err.message); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchDonnees();
  }, [id]);

  // --- ACTIONS EMAILS ---
  const handleModeleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modeleId = e.target.value;
    if (!modeleId) { setSujet(''); setCorps(''); return; }
    const modeleChoisi = modeles.find(m => m.id_modele === modeleId);
    if (modeleChoisi && contact) {
      setSujet(modeleChoisi.sujet);
      setCorps(`Bonjour ${contact.prenom},\n\n` + modeleChoisi.corps);
    }
  };

  const handleEnvoyerEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    setEnvoiEnCours(true);
    setMessageEnvoi('Envoi en cours... ⏳');
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/communications/envoyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_destinataire: contact.email, sujet, corps, id_contact: contact.id_contact }),
      });
      if (!response.ok) throw new Error("Échec de l'envoi");
      setMessageEnvoi('✅ Email envoyé !'); 
      setSujet(''); 
      setCorps('');
      await fetchContactSeul();
      setTimeout(() => setMessageEnvoi(''), 3000);
    } catch (err: any) { 
      setMessageEnvoi(`❌ Erreur : ${err.message}`); 
    } finally { 
      setEnvoiEnCours(false); 
    }
  };

  // --- ACTIONS TÂCHES ---
  const handleAjouterTache = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !dateEcheance) return;
    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL + '/taches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          titre: titreTache, 
          type_tache: typeTache, 
          date_echeance: new Date(dateEcheance).toISOString(), 
          statut: 'À faire', 
          id_contact: contact.id_contact 
        }),
      });
      setTitreTache(''); 
      setDateEcheance(''); 
      await fetchContactSeul();
    } catch (err: any) { 
      alert(err.message); 
    }
  };

  const handleChangerStatutTache = async (idTache: string, statutActuel: string) => {
    const nouveauStatut = statutActuel === 'À faire' ? 'Terminé' : 'À faire';
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/taches/${idTache}`, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ statut: nouveauStatut }) 
    });
    await fetchContactSeul();
  };

  // --- UTILITAIRES ---
  const getStatutStyle = (statut: string) => {
    switch(statut.toLowerCase()) {
      case 'nouveau lead': return { bg: '#e3f2fd', color: '#1565c0' };
      case 'gagné': return { bg: '#c8e6c9', color: '#1b5e20' };
      case 'perdu': return { bg: '#ffcdd2', color: '#b71c1c' };
      default: return { bg: '#fff9c4', color: '#f57f17' };
    }
  };

  if (loading) return <p style={{ padding: '40px' }}>Chargement de la fiche...</p>;
  if (error || !contact) return <p style={{ padding: '40px', color: 'red' }}>{error || "Contact introuvable"}</p>;

  const tachesAFaire = contact.tache?.filter(t => t.statut === 'À faire') || [];
  const totalDepense = contact.commande?.filter(c => c.statut_paiement === 'Payé').reduce((sum, cmd) => sum + parseFloat(cmd.montant_total), 0) || 0;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* BOUTONS DE NAVIGATION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => router.push('/contacts')} style={{ padding: '10px 15px', cursor: 'pointer', background: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          ⬅ Retour à l'annuaire
        </button>
        <button onClick={() => router.push('/commandes')} style={{ padding: '10px 15px', cursor: 'pointer', background: '#0066cc', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          💳 Aller à la Caisse
        </button>
      </div>

      {/* --- EN-TÊTE DU CONTACT --- */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #eaeaea', position: 'relative' }}>
        {totalDepense > 0 && (
          <div style={{ position: 'absolute', top: '30px', right: '30px', textAlign: 'right' }}>
            <span style={{ display: 'block', color: '#888', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Total dépensé</span>
            <span style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>{totalDepense.toFixed(2)} €</span>
          </div>
        )}
        
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>{contact.prenom} {contact.nom}</h1>
        <p style={{ color: '#666' }}>Client depuis le {new Date(contact.date_creation).toLocaleDateString('fr-FR')}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', paddingRight: '150px' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0' }}>📞 Coordonnées</h3>
            <p style={{ margin: '5px 0' }}><strong>Email :</strong> {contact.email}</p>
            <p style={{ margin: '5px 0' }}><strong>Tél :</strong> {contact.telephone || 'Non renseigné'}</p>
          </div>
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>👟 Profil Acheteur</h3>
            <p style={{ margin: '5px 0' }}><strong>Pointure :</strong> {contact.pointure ? `${contact.pointure} EU` : 'Inconnue'}</p>
            <p style={{ margin: '5px 0' }}><strong>Marque :</strong> {contact.marque_preferee || 'Aucune'}</p>
          </div>
        </div>
      </div>

      {/* --- SECTION CENTRALE : B2B & B2C --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        
        {/* OPPORTUNITÉS (B2B) */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: '4px solid #4CAF50' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>💰 Devis en cours ({contact.lead?.length || 0})</h3>
          {!contact.lead || contact.lead.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Aucune opportunité.</p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {contact.lead.map(lead => {
                const style = getStatutStyle(lead.statut);
                return (
                  <div key={lead.id_lead} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                    <div>
                      <span style={{ background: style.bg, color: style.color, padding: '4px 10px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{lead.statut}</span>
                      <p style={{ margin: '8px 0 0 0', fontWeight: 'bold', fontSize: '1.1rem' }}>{lead.montant_estime ? `${lead.montant_estime} €` : 'À définir'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COMMANDES (B2C) */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: '4px solid #0066cc' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>🛒 Historique d'achats ({contact.commande?.length || 0})</h3>
          {!contact.commande || contact.commande.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Aucune commande passée.</p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {contact.commande.map(cmd => {
                const isPaye = cmd.statut_paiement === 'Payé';
                return (
                  <div key={cmd.id_commande} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', borderLeft: `4px solid ${isPaye ? '#4CAF50' : '#ff9800'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: '#0066cc', fontSize: '1.2rem' }}>{cmd.montant_total} €</strong>
                      <span style={{ fontSize: '0.85rem', color: isPaye ? '#4CAF50' : '#ff9800', fontWeight: 'bold', background: isPaye ? '#e8f5e9' : '#fff3e0', padding: '3px 8px', borderRadius: '10px' }}>
                        {cmd.statut_paiement}
                      </span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#555' }}>
                      {cmd.commande_produit.map((cp, idx) => (
                        <li key={idx}>{cp.quantite}x {cp.produit.marque} {cp.produit.modele}</li>
                      ))}
                    </ul>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#888', textAlign: 'right' }}>
                      Le {new Date(cmd.date_commande).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* --- SECTION BASSE : ACTIONS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        
        {/* EMAIL */}
        <div style={{ background: '#e6f2ff', padding: '25px', borderRadius: '10px', border: '1px solid #b3d9ff' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#0055cc' }}>✉️ Envoyer un email</h3>
          <form onSubmit={handleEnvoyerEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select onChange={handleModeleChange} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #99c2ff', outline: 'none' }}>
              <option value="">-- Utiliser un modèle (Optionnel) --</option>
              {modeles.map(m => <option key={m.id_modele} value={m.id_modele}>{m.nom_modele}</option>)}
            </select>
            <input type="text" placeholder="Sujet de l'email" value={sujet} onChange={(e) => setSujet(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #99c2ff', outline: 'none' }} />
            <textarea placeholder="Votre message..." value={corps} onChange={(e) => setCorps(e.target.value)} required rows={5} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #99c2ff', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
            <button type="submit" disabled={envoiEnCours} style={{ padding: '12px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: envoiEnCours ? 'not-allowed' : 'pointer' }}>
              {envoiEnCours ? 'Envoi en cours... ⏳' : 'Envoyer l\'email'}
            </button>
            {messageEnvoi && <p style={{ margin: 0, fontWeight: 'bold', color: messageEnvoi.includes('✅') ? 'green' : 'red', textAlign: 'center' }}>{messageEnvoi}</p>}
          </form>
        </div>

        {/* TÂCHES */}
        <div style={{ background: '#fff9e6', padding: '25px', borderRadius: '10px', border: '1px solid #ffe680' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#b38f00' }}>⏰ Relances & Tâches</h3>
          <form onSubmit={handleAjouterTache} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <input type="text" placeholder="Ex: Rappeler pour le devis" value={titreTache} onChange={(e) => setTitreTache(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #e6cc00', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={typeTache} onChange={(e) => setTypeTache(e.target.value)} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #e6cc00', flex: 1, outline: 'none' }}>
                <option value="Appel">📞 Appel</option>
                <option value="Email">✉️ Email</option>
                <option value="Rendez-vous">🤝 Rendez-vous</option>
              </select>
              <input type="date" value={dateEcheance} onChange={(e) => setDateEcheance(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #e6cc00', flex: 1, outline: 'none' }} />
            </div>
            <button type="submit" style={{ padding: '12px', background: '#ffcc00', color: 'black', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              ➕ Planifier
            </button>
          </form>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tachesAFaire.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>Aucune tâche en cours.</p>
            ) : (
              tachesAFaire.map(tache => (
                <div key={tache.id_tache} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #ffe680' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{tache.type_tache === 'Appel' ? '📞' : tache.type_tache === 'Email' ? '✉️' : '🤝'}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>{tache.titre}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Pour le {new Date(tache.date_echeance).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <button onClick={() => handleChangerStatutTache(tache.id_tache, tache.statut)} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    ✔ Fait
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}