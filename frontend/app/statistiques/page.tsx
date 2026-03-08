'use client';

import { useEffect, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function StatistiquesPage() {
  const [loading, setLoading] = useState(true);
  
  // Données traitées pour les graphiques
  const [dataCA, setDataCA] = useState<any[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [dataCommerciaux, setDataCommerciaux] = useState<any[]>([]);
  
  // KPIs globaux
  const [kpi, setKpi] = useState({
    caTotal: 0,
    pipelineTotal: 0,
    tauxConversion: 0,
    totalClients: 0
  });

  const COULEURS_SOURCES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff99e6'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resCmd, resLeads, resContacts, resUsers] = await Promise.all([
          fetch(process.env.NEXT_PUBLIC_API_URL + '/commandes'),
          fetch(process.env.NEXT_PUBLIC_API_URL + '/leads'),
          fetch(process.env.NEXT_PUBLIC_API_URL + '/contacts'),
          fetch(process.env.NEXT_PUBLIC_API_URL + '/utilisateurs')
        ]);

        const commandes = await resCmd.json();
        const leads = await resLeads.json();
        const contacts = await resContacts.json();
        const utilisateurs = await resUsers.json();

        // 1. CALCUL DES KPIs GLOBAUX
        const caTotal = commandes
          .filter((c: any) => c.statut_paiement === 'Payé')
          .reduce((sum: number, c: any) => sum + Number(c.montant_total), 0);

        const pipelineTotal = leads
          .filter((l: any) => l.statut !== 'Gagné' && l.statut !== 'Perdu')
          .reduce((sum: number, l: any) => sum + (Number(l.montant_estime) || 0), 0);

        const leadsGagnes = leads.filter((l: any) => l.statut === 'Gagné').length;
        const leadsTotaux = leads.length;
        const tauxConversion = leadsTotaux > 0 ? (leadsGagnes / leadsTotaux) * 100 : 0;

        setKpi({
          caTotal,
          pipelineTotal,
          tauxConversion,
          totalClients: contacts.length
        });

        // 2. ÉVOLUTION DU CA (Graphique Courbe)
        // On regroupe par mois (simplifié pour la démo)
        const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const caParMois: { [key: string]: number } = {};
        
        commandes.filter((c: any) => c.statut_paiement === 'Payé').forEach((c: any) => {
          const date = new Date(c.date_commande);
          const mois = moisNoms[date.getMonth()];
          caParMois[mois] = (caParMois[mois] || 0) + Number(c.montant_total);
        });

        const caChartData = Object.keys(caParMois).map(mois => ({
          mois,
          CA: caParMois[mois]
        }));
        setDataCA(caChartData);

        // 3. SOURCES DES LEADS (Marketing - Graphique Camembert)
        const sourcesCount: { [key: string]: number } = {};
        leads.forEach((l: any) => {
          const source = l.source || 'Inconnu';
          sourcesCount[source] = (sourcesCount[source] || 0) + 1;
        });

        const sourcesChartData = Object.keys(sourcesCount).map(source => ({
          name: source,
          valeur: sourcesCount[source]
        }));
        setDataSources(sourcesChartData);

        // 4. PERFORMANCE COMMERCIAUX (Graphique Barres)
        const ventesParCommercial: { [key: string]: number } = {};
        leads.filter((l: any) => l.statut === 'Gagné').forEach((l: any) => {
          const nomComm = l.utilisateur ? l.utilisateur.nom_prenom : 'Non assigné';
          ventesParCommercial[nomComm] = (ventesParCommercial[nomComm] || 0) + (Number(l.montant_estime) || 0);
        });

        const commChartData = Object.keys(ventesParCommercial).map(nom => ({
          nom,
          Ventes: ventesParCommercial[nom]
        }));
        setDataCommerciaux(commChartData);

      } catch (err) {
        console.error("Erreur stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p style={{ padding: '40px' }}>Génération des graphiques... 📊</p>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '2.2rem' }}>📈 Tableau de Bord Analytique</h1>
        <p style={{ margin: 0, color: '#666' }}>Analysez vos performances commerciales, marketing et financières.</p>
      </div>

      {/* --- KPI GLOBAUX --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #0066cc' }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Chiffre d'Affaires Total</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#0066cc' }}>{kpi.caTotal.toFixed(2)} €</h2>
        </div>
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #ff9800' }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Valeur du Pipeline</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#ff9800' }}>{kpi.pipelineTotal.toFixed(2)} €</h2>
        </div>
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #4CAF50' }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Taux de Conversion</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#4CAF50' }}>{kpi.tauxConversion.toFixed(1)} %</h2>
        </div>
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #9c27b0' }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Base Clients</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#9c27b0' }}>{kpi.totalClients}</h2>
        </div>
      </div>

      {/* --- GRILLE DES GRAPHIQUES --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
        
        {/* GRAPHIQUE 1 : Évolution CA */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>💰 Évolution des Ventes (CA par mois)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <LineChart data={dataCA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="mois" stroke="#888" />
                <YAxis stroke="#888" tickFormatter={(value) => `${value}€`} />
                <Tooltip formatter={(value: any) => [`${Number(value || 0).toFixed(2)} €`, 'Chiffre d\'affaires']} />
                <Line type="monotone" dataKey="CA" stroke="#0066cc" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPHIQUE 2 : Sources Marketing */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🎯 Origine des Leads</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={dataSources} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="valeur">
                  {dataSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COULEURS_SOURCES[index % COULEURS_SOURCES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* GRAPHIQUE 3 : Classement Commerciaux */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🏆 Performance de l'équipe (CA généré)</h3>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer>
            <BarChart data={dataCommerciaux} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="nom" stroke="#888" />
              <YAxis stroke="#888" tickFormatter={(value) => `${value}€`} />
              <Tooltip formatter={(value: any) => [`${Number(value || 0).toFixed(2)} €`, 'Ventes réalisées']} cursor={{ fill: '#f5f5f5' }} />
              <Bar dataKey="Ventes" fill="#4CAF50" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}