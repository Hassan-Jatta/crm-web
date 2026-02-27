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

export default function ContactDetailPage() {
  const { id } = useParams(); 
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch(`http://localhost:4000/contacts/${id}`);
        if (!response.ok) throw new Error("Impossible de charger la fiche client.");
        const data = await response.json();
        setContact(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchContact();
  }, [id]);

  if (loading) return <p style={{ padding: '40px' }}>Chargement de la fiche...</p>;
  if (error || !contact) return <p style={{ padding: '40px', color: 'red' }}>{error || "Contact introuvable"}</p>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => router.back()} style={{ marginBottom: '20px', padding: '10px', cursor: 'pointer', background: '#eee', border: '1px solid #ccc', borderRadius: '5px' }}>
        ⬅ Retour à la liste
      </button>

      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #eaeaea' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>{contact.prenom} {contact.nom}</h1>
        <p style={{ color: '#666', marginTop: 0 }}>Client depuis le {new Date(contact.date_creation).toLocaleDateString('fr-FR')}</p>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>📞 Coordonnées</h3>
            <p><strong>Email :</strong> {contact.email}</p>
            <p><strong>Téléphone :</strong> {contact.telephone || 'Non renseigné'}</p>
            <p><strong>Entreprise :</strong> 🏢 {contact.entreprise ? contact.entreprise.nom_societe : 'Client particulier'}</p>
          </div>

          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>👟 Profil Acheteur</h3>
            <p><strong>Pointure :</strong> {contact.pointure ? `${contact.pointure} EU` : 'Inconnue'}</p>
            <p><strong>Marque Favorite :</strong> {contact.marque_preferee || 'Aucune'}</p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>📜 Historique (Leads & Commandes)</h3>
        <p style={{ color: '#888', fontStyle: 'italic' }}>Les données de commandes et d'opportunités s'afficheront ici lors des prochaines phases.</p>
      </div>
    </div>
  );
}