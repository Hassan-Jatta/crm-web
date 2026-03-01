'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; 

interface Produit {
  id_produit: string;
  marque: string;
  modele: string;
  prix_unitaire: number;
  stock_disponible: number;
}

export default function ProduitsPage() {
  const { user } = useAuth(); 
  
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recherche, setRecherche] = useState('');

  // États du formulaire
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [stock, setStock] = useState('0');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState('');

  const fetchProduits = async () => {
    try {
      const response = await fetch('http://localhost:4000/produits');
      if (!response.ok) throw new Error("Erreur lors du chargement des produits");
      setProduits(await response.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'Admin') return; // Sécurité supplémentaire côté front

    setFormMessage('Sauvegarde en cours... ⏳');

    const produitData = {
      marque,
      modele,
      prix_unitaire: parseFloat(prixUnitaire),
      stock_disponible: parseInt(stock, 10),
    };

    try {
      const url = editingId ? `http://localhost:4000/produits/${editingId}` : 'http://localhost:4000/produits';
      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produitData),
      });

      if (!response.ok) throw new Error("Erreur de sauvegarde");
      
      setFormMessage(editingId ? '✅ Produit mis à jour !' : '✅ Produit ajouté !');
      resetForm();
      fetchProduits();
      setTimeout(() => setFormMessage(''), 3000);
    } catch (err: any) {
      setFormMessage(`❌ Erreur : ${err.message}`);
    }
  };

  const handleEdit = (produit: Produit) => {
    setEditingId(produit.id_produit);
    setMarque(produit.marque);
    setModele(produit.modele);
    setPrixUnitaire(produit.prix_unitaire.toString());
    setStock(produit.stock_disponible.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit du catalogue ?")) return;
    try {
      await fetch(`http://localhost:4000/produits/${id}`, { method: 'DELETE' });
      fetchProduits();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setMarque(''); setModele(''); setPrixUnitaire(''); setStock('0');
  };

  const produitsFiltres = produits.filter(p => 
    p.marque.toLowerCase().includes(recherche.toLowerCase()) || 
    p.modele.toLowerCase().includes(recherche.toLowerCase())
  );

  if (loading) return <p style={{ padding: '40px' }}>Chargement du catalogue...</p>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>📦 Catalogue & Inventaire</h1>
        {user?.role !== 'Admin' && (
          <span style={{ background: '#e3f2fd', color: '#0066cc', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            👁️ Mode Lecture Seule
          </span>
        )}
      </div>

      
      {user?.role === 'Admin' && (
        <div style={{ background: editingId ? '#fff3e0' : 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '40px', border: editingId ? '2px solid #ff9800' : '1px solid #eaeaea' }}>
          <h3 style={{ marginTop: 0, color: editingId ? '#e65100' : 'black' }}>
            {editingId ? '✏️ Modifier le produit' : '➕ Ajouter un nouveau modèle'}
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input type="text" placeholder="Marque (ex: Nike)" value={marque} onChange={(e) => setMarque(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input type="text" placeholder="Modèle (ex: Air Max 95)" value={modele} onChange={(e) => setModele(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Prix de vente unitaire (€)</label>
              <input type="number" step="0.01" min="0" placeholder="Ex: 150.00" value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Stock disponible</label>
              <input type="number" min="0" placeholder="Ex: 10" value={stock} onChange={(e) => setStock(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '12px', background: editingId ? '#ff9800' : 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                {editingId ? 'Mettre à jour le produit' : 'Enregistrer dans le catalogue'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={{ padding: '12px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Annuler</button>
              )}
            </div>
          </form>
          {formMessage && <p style={{ marginTop: '15px', fontWeight: 'bold', color: formMessage.includes('✅') ? 'green' : 'red' }}>{formMessage}</p>}
        </div>
      )}

      {/* --- BARRE DE RECHERCHE --- */}
      <input 
        type="text" 
        placeholder="🔍 Rechercher une marque ou un modèle..." 
        value={recherche} 
        onChange={(e) => setRecherche(e.target.value)} 
        style={{ width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.1rem', boxSizing: 'border-box' }} 
      />

      {/* --- LISTE DES PRODUITS --- */}
      {error ? <p style={{ color: 'red' }}>{error}</p> : (
        <>
          <p style={{ color: '#666', marginBottom: '15px' }}>{produitsFiltres.length} article(s) trouvé(s)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {produitsFiltres.map((produit) => {
              const stock = produit.stock_disponible;
              let stockColor = '#4CAF50';
              let stockText = `${stock} en stock`;
              
              if (stock === 0) { stockColor = '#f44336'; stockText = '❌ Rupture de stock'; } 
              else if (stock <= 5) { stockColor = '#ff9800'; stockText = `⚠️ Plus que ${stock} en stock !`; }

              return (
                <div key={produit.id_produit} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ background: '#eee', padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#555' }}>
                        {produit.marque}
                      </span>
                      <strong style={{ fontSize: '1.2rem', color: '#0066cc' }}>
                        {produit.prix_unitaire} €
                      </strong>
                    </div>
                    
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.4rem' }}>{produit.modele}</h3>
                    
                    <div style={{ padding: '8px 12px', borderRadius: '5px', background: `${stockColor}15`, color: stockColor, fontWeight: 'bold', display: 'inline-block', fontSize: '0.9rem' }}>
                      {stockText}
                    </div>
                  </div>

                  {/* 🟢 4. LE BOUCLIER : Les boutons d'action n'apparaissent QUE pour l'Admin */}
                  {user?.role === 'Admin' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                      <button onClick={() => handleEdit(produit)} style={{ flex: 1, background: '#f5f5f5', color: '#333', border: '1px solid #ccc', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}>✏️ Éditer</button>
                      <button onClick={() => handleDelete(produit.id_produit)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Supprimer</button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}