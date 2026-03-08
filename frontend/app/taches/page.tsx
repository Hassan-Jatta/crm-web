'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../context/AuthContext';

interface Contact { id_contact: string; nom: string; prenom: string; }
// 🟢 Ajout de id_utilisateur dans l'interface
interface Tache { id_tache: string; titre: string; type_tache: string; statut: string; date_echeance: string; contact?: Contact; id_utilisateur?: string; }

export default function TachesPage() {
  const { user } = useAuth();
  const [taches, setTaches] = useState<Tache[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire (Modale)
  const [showModal, setShowModal] = useState(false);
  const [dateSelectionnee, setDateSelectionnee] = useState('');
  const [titre, setTitre] = useState('');
  const [typeTache, setTypeTache] = useState('Appel');
  const [idContact, setIdContact] = useState('');

  const fetchData = async () => {
    try {
      const [resTaches, resContacts] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL + '/taches'),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/contacts')
      ]);
      setTaches(await resTaches.json());
      setContacts(await resContacts.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateClick = (arg: any) => {
    setDateSelectionnee(arg.dateStr); 
    setTitre('');
    setShowModal(true);
  };

  const handleEventClick = async (arg: any) => {
    const idTache = arg.event.id;
    const action = window.prompt("Que voulez-vous faire ?\nTapez '1' pour marquer comme Terminé ✅\nTapez '2' pour Supprimer ❌");
    
    if (action === '1') {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/taches/${idTache}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'Terminé' })
      });
      fetchData();
    } else if (action === '2') {
      if (window.confirm("Sûr de vouloir supprimer cette tâche ?")) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/taches/${idTache}`, { method: 'DELETE' });
        fetchData();
      }
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre || !dateSelectionnee) return;

    await fetch(process.env.NEXT_PUBLIC_API_URL + '/taches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titre,
        type_tache: typeTache,
        statut: 'À faire',
        date_echeance: new Date(dateSelectionnee).toISOString(),
        id_contact: idContact || null,
        id_utilisateur: user?.id_utilisateur // 🟢 On lie la tâche au vendeur connecté !
      })
    });

    setShowModal(false);
    fetchData();
  };

  // 🟢 LE FILTRE MAGIQUE : On ne garde que les tâches de l'utilisateur connecté
  // (Optionnel : si tu veux que l'Admin voie tout le monde, tu peux faire :
  // const mesTaches = user?.role === 'Admin' ? taches : taches.filter(t => t.id_utilisateur === user?.id_utilisateur); )
  const mesTaches = taches.filter(t => t.id_utilisateur === user?.id_utilisateur);

  const events = mesTaches.map((t) => {
    const icon = t.type_tache === 'Appel' ? '📞' : t.type_tache === 'Email' ? '✉️' : t.type_tache === 'Rendez-vous' ? '🤝' : '⏰';
    const nomClient = t.contact ? ` - ${t.contact.prenom} ${t.contact.nom}` : '';
    
    const couleur = t.statut === 'Terminé' ? '#4CAF50' : '#ff9800';

    return {
      id: t.id_tache,
      title: `${icon} ${t.titre}${nomClient}`,
      date: t.date_echeance.split('T')[0], 
      backgroundColor: couleur,
      borderColor: couleur,
      textColor: 'white',
      extendedProps: { statut: t.statut }
    };
  });

  if (loading) return <p style={{ padding: '40px' }}>Chargement de l'agenda...</p>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>📅 Mon Planning</h1>
          <p style={{ margin: 0, color: '#666' }}>Gérez vos propres tâches et relances clients.</p>
        </div>
        <button onClick={() => { setDateSelectionnee(new Date().toISOString().split('T')[0]); setShowModal(true); }} style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          ➕ Nouvelle Tâche
        </button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          locale="fr"
          firstDay={1} 
          events={events} 
          dateClick={handleDateClick} 
          eventClick={handleEventClick} 
          height="75vh"
        />
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Planifier une action</h2>
            
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* 🟢 LA DATE EST MAINTENANT MODIFIABLE */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Date de l'action</label>
                <input 
                  type="date" 
                  value={dateSelectionnee} 
                  onChange={(e) => setDateSelectionnee(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
                />
              </div>

              <input type="text" placeholder="Titre (ex: Rappeler pour le devis)" value={titre} onChange={(e) => setTitre(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
              
              <select value={typeTache} onChange={(e) => setTypeTache(e.target.value)} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }}>
                <option value="Appel">📞 Appel</option>
                <option value="Email">✉️ Email</option>
                <option value="Rendez-vous">🤝 Rendez-vous</option>
                <option value="Rappel">⏰ Rappel interne</option>
              </select>

              <select value={idContact} onChange={(e) => setIdContact(e.target.value)} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }}>
                <option value="">-- Lier à un client (Optionnel) --</option>
                {contacts.map(c => <option key={c.id_contact} value={c.id_contact}>{c.prenom} {c.nom}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: '#f5f5f5', color: '#333', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}