'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
}

interface ModeleEmail {
  id_modele: string;
  nom_modele: string;
  sujet: string;
  corps: string;
}

export default function ContactDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [modeles, setModeles] = useState<ModeleEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sujet, setSujet] = useState('');
  const [corps, setCorps] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [messageEnvoi, setMessageEnvoi] = useState('');

  useEffect(() => {
    // 🟢 CORRECTION 1 : Il manquait le mot "return;"
    if (!id) return;

    const fetchDonnees = async () => {
      try {
        // 🟢 CORRECTION 2 : Les fameux guillemets (backticks) ont été remis
        const [resContact, resModeles] = await Promise.all([
          fetch(`http://localhost:4000/contacts/${id}`),
          fetch(`http://localhost:4000/modeles-email`)
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

  const handleModeleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modeleId = e.target.value;
    if (!modeleId) { setSujet(''); setCorps(''); return; }
    
    const modeleChoisi = modeles.find(m => m.id_modele === modeleId);
    if (modeleChoisi && contact) {
      setSujet(modeleChoisi.sujet);
      // 🟢 CORRECTION 3 : Les guillemets (backticks) ont été remis ici aussi
      setCorps(`Bonjour ${contact.prenom},\n\n` + modeleChoisi.corps);
    }
  };

  const handleEnvoyerEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    setEnvoiEnCours(true);
    setMessageEnvoi('Envoi en cours... ⏳');

    try {
      const response = await fetch('http://localhost:4000/communications/envoyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_destinataire: contact.email,
          sujet: sujet,
          corps: corps,
          id_contact: contact.id_contact,
        }),
      });

      if (!response.ok) throw new Error("Échec de l'envoi");
      setMessageEnvoi('✅ Email envoyé et enregistré !');
      setSujet(''); setCorps('');
    } catch (err: any) {
      setMessageEnvoi(`❌ Erreur : ${err.message}`);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (loading) return <p style={{ padding: '40px' }}>Chargement de la fiche...</p>;
  if (error || !contact) return <p style={{ padding: '40px', color: 'red' }}>{error || "Contact introuvable"}</p>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => router.push('/contacts')} style={{ marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '5px' }}>
        ⬅ Retour à l'annuaire
      </button>

      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px', border: '1px solid #eaeaea' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>{contact.prenom} {contact.nom}</h1>
        <p style={{ color: '#666' }}>Client depuis le {new Date(contact.date_creation).toLocaleDateString('fr-FR')}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0' }}>📞 Coordonnées</h3>
            <p><strong>Entreprise :</strong> 🏢 {contact.entreprise ? contact.entreprise.nom_societe : 'Client particulier'}</p>
            <p><strong>Email :</strong> {contact.email}</p>
            <p><strong>Tél :</strong> {contact.telephone || 'Non renseigné'}</p>
          </div>
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>👟 Profil</h3>
            <p><strong>Pointure :</strong> {contact.pointure ? `${contact.pointure} EU` : 'Inconnue'}</p>
            <p><strong>Marque :</strong> {contact.marque_preferee || 'Aucune'}</p>
          </div>
        </div>
      </div>

      <div style={{ background: '#e6f2ff', padding: '25px', borderRadius: '10px', border: '2px solid #0066cc' }}>
        <h3 style={{ marginTop: 0 }}>✉️ Envoyer un email</h3>
        <form onSubmit={handleEnvoyerEmail} style={{ display: 'grid', gap: '15px' }}>
          <select onChange={handleModeleChange} style={{ padding: '10px', borderRadius: '5px' }}>
            <option value="">-- Utiliser un modèle --</option>
            {modeles.map(m => <option key={m.id_modele} value={m.id_modele}>{m.nom_modele}</option>)}
          </select>
          <input type="text" placeholder="Sujet" value={sujet} onChange={(e) => setSujet(e.target.value)} required style={{ padding: '10px', borderRadius: '5px' }} />
          <textarea placeholder="Message..." value={corps} onChange={(e) => setCorps(e.target.value)} required rows={6} style={{ padding: '10px', borderRadius: '5px', fontFamily: 'inherit' }} />
          <button type="submit" disabled={envoiEnCours} style={{ padding: '12px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            {envoiEnCours ? 'Envoi...' : '🚀 Envoyer l\'email'}
          </button>
          {messageEnvoi && <p style={{ fontWeight: 'bold', color: messageEnvoi.includes('✅') ? 'green' : 'red' }}>{messageEnvoi}</p>}
        </form>
      </div>
    </div>
  );
}