'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext'; // 🟢 1. On importe le contexte !

export default function KicksDashboard() {
  const router = useRouter();
  const { user } = useAuth(); // 🟢 2. On récupère l'utilisateur connecté
  const [loading, setLoading] = useState(true);
  
  // KPI
  const [caMois, setCaMois] = useState(0);
  const [evolutionCa, setEvolutionCa] = useState(0);
  const [nouveauxProspects, setNouveauxProspects] = useState(0);
  const [rdvDuJour, setRdvDuJour] = useState<any[]>([]);
  const [tachesUrgentes, setTachesUrgentes] = useState<any[]>([]);

  // Objectif fictif pour la démo (ex: 10 000€ par mois)
  const OBJECTIF_MENSUEL = 10000;

  useEffect(() => {
    // Si l'utilisateur n'est pas encore chargé, on attend.
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const [resCommandes, resLeads, resTaches] = await Promise.all([
          fetch('http://localhost:4000/commandes'),
          fetch('http://localhost:4000/leads'),
          fetch('http://localhost:4000/taches')
        ]);

        let commandes = await resCommandes.json();
        let leads = await resLeads.json();
        let taches = await resTaches.json();

        // 🟢 3. LE FILTRE MAGIQUE SELON LE RÔLE
        // Si l'utilisateur n'est PAS Admin, on ne garde QUE ses propres données
        if (user.role !== 'Admin') {
          taches = taches.filter((t: any) => t.id_utilisateur === user.id_utilisateur);
          // (Optionnel) Si tes commandes et leads ont aussi un "id_utilisateur", tu peux les filtrer ici :
          // commandes = commandes.filter((c: any) => c.id_utilisateur === user.id_utilisateur);
          // leads = leads.filter((l: any) => l.id_utilisateur === user.id_utilisateur);
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // 1. Calcul du CA du mois en cours (Commandes payées)
        const caDuMois = commandes
          .filter((c: any) => c.statut_paiement === 'Payé' && new Date(c.date_commande).getMonth() === currentMonth && new Date(c.date_commande).getFullYear() === currentYear)
          .reduce((sum: number, c: any) => sum + parseFloat(c.montant_total), 0);
        setCaMois(caDuMois);

        // 2. Calcul du CA du mois précédent
        let lastMonth = currentMonth - 1;
        let yearOfLastMonth = currentYear;
        if (lastMonth < 0) { lastMonth = 11; yearOfLastMonth -= 1; }

        const caMoisPrecedent = commandes
          .filter((c: any) => c.statut_paiement === 'Payé' && new Date(c.date_commande).getMonth() === lastMonth && new Date(c.date_commande).getFullYear() === yearOfLastMonth)
          .reduce((sum: number, c: any) => sum + parseFloat(c.montant_total), 0);

        // 3. Évolution (%)
        if (caMoisPrecedent === 0) {
          setEvolutionCa(caDuMois > 0 ? 100 : 0);
        } else {
          setEvolutionCa(((caDuMois - caMoisPrecedent) / caMoisPrecedent) * 100);
        }

        // 4. Nouveaux Prospects (Leads créés ce mois-ci)
        const prospectsMois = leads.filter((l: any) => new Date(l.date_creation).getMonth() === currentMonth).length;
        setNouveauxProspects(prospectsMois);

        // 5. RDV du jour
        now.setHours(0,0,0,0);
        const rdvAujourdhui = taches.filter((t: any) => {
          const d = new Date(t.date_echeance);
          d.setHours(0,0,0,0);
          return t.statut === 'À faire' && t.type_tache === 'Rendez-vous' && d.getTime() === now.getTime();
        });
        setRdvDuJour(rdvAujourdhui);

        // 6. Tâches urgentes (En retard)
        const urgences = taches.filter((t: any) => t.statut === 'À faire' && new Date(t.date_echeance) < new Date());
        setTachesUrgentes(urgences);

      } catch (err) {
        console.error("Erreur chargement dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]); // 🟢 On relance si l'utilisateur change

  const pourcentageObjectif = Math.min((caMois / OBJECTIF_MENSUEL) * 100, 100).toFixed(1);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>Chargement de l'espace... 👟</div>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '2.5rem', letterSpacing: '-1px' }}>KICKS <span style={{ fontWeight: 'normal', color: '#666' }}>CRM</span></h1>
          <p style={{ margin: 0, color: '#888', fontSize: '1.1rem' }}>
            Bonjour {user?.nom_prenom.split(' ')[0]} ! Voici le résumé de {user?.role === 'Admin' ? 'l\'activité globale' : 'votre activité'}.
          </p>
        </div>
      </div>

      {/* --- KPI PRINCIPAUX --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', borderTop: '4px solid #0066cc' }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>CA du mois</p>
          <h2 style={{ margin: 0, fontSize: '2.2rem', color: '#0066cc' }}>{caMois.toFixed(2)} €</h2>
        </div>

        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', borderTop: `4px solid ${evolutionCa >= 0 ? '#4CAF50' : '#ff4444'}` }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Évolution vs Mois préc.</p>
          <h2 style={{ margin: 0, fontSize: '2.2rem', color: evolutionCa >= 0 ? '#4CAF50' : '#ff4444' }}>
            {evolutionCa >= 0 ? '↗' : '↘'} {Math.abs(evolutionCa).toFixed(1)} %
          </h2>
        </div>

        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', borderTop: '4px solid #ff9800' }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Objectif ({OBJECTIF_MENSUEL}€)</p>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '2.2rem', color: '#333' }}>{pourcentageObjectif} %</h2>
          <div style={{ width: '100%', background: '#eee', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${pourcentageObjectif}%`, background: '#ff9800', height: '100%' }}></div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', borderTop: '4px solid #9c27b0' }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Nouveaux Prospects</p>
          <h2 style={{ margin: 0, fontSize: '2.2rem', color: '#9c27b0' }}>+{nouveauxProspects}</h2>
        </div>

      </div>

      {/* --- SECTIONS D'ACTION DU JOUR --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* RDV DU JOUR */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>🤝 Rendez-vous du jour ({rdvDuJour.length})</h3>
          {rdvDuJour.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Aucun rendez-vous prévu aujourd'hui. Profitez-en pour prospecter !</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {rdvDuJour.map(rdv => (
                <div key={rdv.id_tache} style={{ padding: '15px', background: '#f0f7ff', borderLeft: '4px solid #0066cc', borderRadius: '5px' }}>
                  <strong style={{ display: 'block' }}>{rdv.titre}</strong>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>Prévu pour : {new Date(rdv.date_echeance).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TÂCHES URGENTES */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4444' }}>🚨 Tâches urgentes ({tachesUrgentes.length})</h3>
          {tachesUrgentes.length === 0 ? (
            <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>Super ! Vous êtes à jour dans vos relances.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {tachesUrgentes.slice(0, 5).map(tache => (
                <div key={tache.id_tache} style={{ padding: '15px', background: '#ffebee', borderLeft: '4px solid #ff4444', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block' }}>{tache.type_tache === 'Appel' ? '📞' : '✉️'} {tache.titre}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#d32f2f' }}>Retard depuis le {new Date(tache.date_echeance).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <button onClick={() => router.push('/taches')} style={{ padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ff4444', color: '#ff4444', background: 'white' }}>Traiter</button>
                </div>
              ))}
              {tachesUrgentes.length > 5 && <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#888' }}>+ {tachesUrgentes.length - 5} autres tâches en retard.</p>}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}