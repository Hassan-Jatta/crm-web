'use client';

import { useEffect, useState } from 'react';

// L'interface correspond à ton schema.prisma
interface Entreprise {
  id_entreprise: string;
  nom_societe: string;
  secteur_activite?: string;
  type_entreprise?: string;
}

export default function EntreprisesPage() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recherche, setRecherche] = useState('');

  // États du formulaire
  const [nomSociete, setNomSociete] = useState('');
  const [secteurActivite, setSecteurActivite] = useState('');
  const [typeEntreprise, setTypeEntreprise] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchEntreprises = async () => {
    try {
      const response = await fetch('http://localhost:4000/entreprises');
      if (!response.ok) throw new Error('Erreur de récupération');
      const data = await response.json();
      setEntreprises(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(editingId ? 'Modification en cours...' : 'Ajout en cours...');

    const entrepriseData = {
      nom_societe: nomSociete,
      secteur_activite: secteurActivite || null,
      type_entreprise: typeEntreprise || null,
    };

    try {
      const url = editingId ? `http://localhost:4000/entreprises/${editingId}` : 'http://localhost:4000/entreprises';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entrepriseData),
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement.");

      setFormMessage(editingId ? '✅ Entreprise modifiée !' : '✅ Entreprise ajoutée !');
      resetForm();
      fetchEntreprises(); 
    } catch (err: any) {
      setFormMessage(`❌ Erreur : ${err.message}`);
    }
  };

  const handleEditClick = (entreprise: Entreprise) => {
    setEditingId(entreprise.id_entreprise);
    setNomSociete(entreprise.nom_societe);
    setSecteurActivite(entreprise.secteur_activite || '');
    setTypeEntreprise(entreprise.type_entreprise || '');
    setFormMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setNomSociete(''); setSecteurActivite(''); setTypeEntreprise('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer cette entreprise ?")) return;
    try {
      const response = await fetch(`http://localhost:4000/entreprises/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      setEntreprises(entreprises.filter(e => e.id_entreprise !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const entreprisesFiltrees = entreprises.filter((entreprise) => {
    const texte = recherche.toLowerCase();
    return (
      entreprise.nom_societe.toLowerCase().includes(texte) ||
      (entreprise.secteur_activite && entreprise.secteur_activite.toLowerCase().includes(texte)) ||
      (entreprise.type_entreprise && entreprise.type_entreprise.toLowerCase().includes(texte))
    );
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🏢 Gestion des Entreprises (B2B)</h1>

      {/* --- FORMULAIRE --- */}
      <div style={{ background: editingId ? '#e6f2ff' : '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: editingId ? '2px solid #0066cc' : 'none' }}>
        <h3>{editingId ? '✏️ Modifier l\'entreprise' : '➕ Ajouter une entreprise'}</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
          <input type="text" placeholder="Nom de la société (ex: Nike France)" value={nomSociete} onChange={(e) => setNomSociete(e.target.value)} required style={{ padding: '8px', gridColumn: '1 / -1' }}/>
          
          <input type="text" placeholder="Secteur d'activité (ex: Retail, Logistique...)" value={secteurActivite} onChange={(e) => setSecteurActivite(e.target.value)} style={{ padding: '8px' }}/>
          
          <select value={typeEntreprise} onChange={(e) => setTypeEntreprise(e.target.value)} style={{ padding: '8px' }}>
            <option value="">Sélectionner un type...</option>
            <option value="Fournisseur">Fournisseur / Marque</option>
            <option value="Client B2B">Client B2B (Gros)</option>
            <option value="Partenaire">Partenaire / Média</option>
            <option value="Prestataire">Prestataire</option>
          </select>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '10px', background: editingId ? '#0066cc' : 'black', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
              {editingId ? 'Mettre à jour' : 'Sauvegarder l\'entreprise'}
            </button>
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
        placeholder="🔍 Rechercher une entreprise..." 
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}
      />

      <h3>Liste des Entreprises ({entreprisesFiltrees.length})</h3>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {entreprisesFiltrees.map((entreprise) => (
          <div key={entreprise.id_entreprise} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '1.2rem' }}>{entreprise.nom_societe}</strong> 
              <br />
              {entreprise.type_entreprise && <span style={{ background: '#eee', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', marginRight: '10px' }}>{entreprise.type_entreprise}</span>}
              {entreprise.secteur_activite && <span style={{ color: '#666', fontSize: '14px' }}>{entreprise.secteur_activite}</span>}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleEditClick(entreprise)} style={{ background: '#f0ad4e', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>
                Modifier
              </button>
              <button onClick={() => handleDelete(entreprise.id_entreprise)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}