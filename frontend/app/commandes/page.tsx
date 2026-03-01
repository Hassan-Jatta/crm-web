'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface Contact { id_contact: string; nom: string; prenom: string; }
interface Produit { id_produit: string; marque: string; modele: string; prix_unitaire: number; stock_disponible: number; }

interface CommandeProduit {
  produit: Produit;
  quantite: number;
  prix_unitaire_facture: number;
}

interface Commande {
  id_commande: string;
  montant_total: string;
  statut_paiement: string;
  date_commande: string;
  contact?: Contact;
  commande_produit: CommandeProduit[];
}

export default function CommandesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- ÉTATS DU PANIER (LA CAISSE) ---
  const [idContact, setIdContact] = useState('');
  const [statutPaiement, setStatutPaiement] = useState('En attente');
  const [panier, setPanier] = useState<{ produit: Produit, quantite: number }[]>([]);
  const [idProduitSelect, setIdProduitSelect] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [resCmd, resContacts, resProd] = await Promise.all([
        fetch('http://localhost:4000/commandes'),
        fetch('http://localhost:4000/contacts'),
        fetch('http://localhost:4000/produits')
      ]);
      setCommandes(await resCmd.json());
      setContacts(await resContacts.json());
      setProduits(await resProd.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIQUE DU PANIER ---
  const ajouterAuPanier = () => {
    if (!idProduitSelect) return;
    const produitChoisi = produits.find(p => p.id_produit === idProduitSelect);
    if (!produitChoisi) return;

    // On vérifie si le produit est déjà dans le panier
    const indexExist = panier.findIndex(item => item.produit.id_produit === idProduitSelect);
    
    if (indexExist >= 0) {
      // On incrémente la quantité
      const nouveauPanier = [...panier];
      nouveauPanier[indexExist].quantite += 1;
      setPanier(nouveauPanier);
    } else {
      // On ajoute le nouveau produit
      setPanier([...panier, { produit: produitChoisi, quantite: 1 }]);
    }
    setIdProduitSelect(''); // On reset le menu déroulant
  };

  const modifierQuantite = (index: number, delta: number) => {
    const nouveauPanier = [...panier];
    nouveauPanier[index].quantite += delta;
    if (nouveauPanier[index].quantite <= 0) {
      nouveauPanier.splice(index, 1); // On retire l'article si quantité = 0
    }
    setPanier(nouveauPanier);
  };

  const calculerTotal = () => {
    return panier.reduce((total, item) => total + (item.produit.prix_unitaire * item.quantite), 0);
  };

  // --- SOUMISSION DE LA COMMANDE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idContact) { setFormMessage('❌ Veuillez sélectionner un client.'); return; }
    if (panier.length === 0) { setFormMessage('❌ Le panier est vide.'); return; }

    setIsSubmitting(true);
    setFormMessage('Création de la facture... ⏳');

    const total = calculerTotal();

    // On prépare le format attendu par le backend
    const commandeData = {
      id_contact: idContact,
      statut_paiement: statutPaiement,
      montant_total: total,
      produits: panier.map(item => ({
        id_produit: item.produit.id_produit,
        quantite: item.quantite,
        prix_unitaire_facture: item.produit.prix_unitaire // On fige le prix au moment de l'achat !
      }))
    };

    try {
      const response = await fetch('http://localhost:4000/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commandeData),
      });

      if (!response.ok) throw new Error("Erreur lors de la création de la commande.");
      
      setFormMessage('✅ Commande validée avec succès !');
      // On vide la caisse
      setIdContact('');
      setStatutPaiement('En attente');
      setPanier([]);
      fetchData(); // On rafraîchit l'historique
      
      setTimeout(() => setFormMessage(''), 4000);
    } catch (err: any) {
      setFormMessage(`❌ Erreur : ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Annuler et supprimer cette commande ?")) return;
    await fetch(`http://localhost:4000/commandes/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <p style={{ padding: '40px' }}>Chargement de la caisse...</p>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>🛒 Caisse & Commandes</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/produits')} style={{ padding: '10px 15px', cursor: 'pointer', background: '#eee', border: '1px solid #ccc', borderRadius: '5px' }}>📦 Voir le Stock</button>
          <button onClick={() => router.push('/contacts')} style={{ padding: '10px 15px', cursor: 'pointer', background: 'black', color: 'white', border: 'none', borderRadius: '5px' }}>📇 Annuaire</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* --- ZONE GAUCHE : LE POINT DE VENTE (PANIER) --- */}
        {user?.role !== 'Standard' && (
        <div>
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', border: '2px solid #0066cc' }}>
            <h2 style={{ marginTop: 0, color: '#0066cc', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Nouvelle Facture</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>1. Sélectionner le Client 👤</label>
              <select value={idContact} onChange={(e) => setIdContact(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem' }}>
                <option value="">-- Qui achète ? --</option>
                {contacts.map(c => <option key={c.id_contact} value={c.id_contact}>{c.prenom} {c.nom}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>2. Ajouter des articles 👟</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={idProduitSelect} onChange={(e) => setIdProduitSelect(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                  <option value="">-- Choisir une paire dans le stock --</option>
                  {produits.map(p => (
                    <option key={p.id_produit} value={p.id_produit} disabled={p.stock_disponible <= 0}>
                      {p.marque} {p.modele} - {p.prix_unitaire}€ {p.stock_disponible <= 0 ? '(RUPTURE)' : ''}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={ajouterAuPanier} disabled={!idProduitSelect} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: idProduitSelect ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
                  ➕ Ajouter
                </button>
              </div>
            </div>

            {/* LE PANIER */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>🛒 Panier actuel :</h4>
              {panier.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>Le panier est vide.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {panier.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #eee' }}>
                      <div>
                        <strong>{item.produit.marque} {item.produit.modele}</strong>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{item.produit.prix_unitaire} € / unité</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button type="button" onClick={() => modifierQuantite(index, -1)} style={{ padding: '5px 10px', cursor: 'pointer', borderRadius: '3px', border: '1px solid #ccc' }}>-</button>
                        <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantite}</span>
                        <button type="button" onClick={() => modifierQuantite(index, 1)} style={{ padding: '5px 10px', cursor: 'pointer', borderRadius: '3px', border: '1px solid #ccc' }}>+</button>
                        <strong style={{ minWidth: '60px', textAlign: 'right', color: '#0066cc' }}>{(item.produit.prix_unitaire * item.quantite).toFixed(2)} €</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TOTAL ET VALIDATION */}
            <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>TOTAL À PAYER :</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0066cc' }}>{calculerTotal().toFixed(2)} €</span>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>Statut du paiement :</label>
                <select value={statutPaiement} onChange={(e) => setStatutPaiement(e.target.value)} style={{ padding: '10px', borderRadius: '5px', flex: 1, border: '1px solid #ccc', fontWeight: 'bold', color: statutPaiement === 'Payé' ? 'green' : '#ff9800' }}>
                  <option value="En attente">⏳ En attente</option>
                  <option value="Payé">✅ Payé</option>
                  <option value="Annulé">❌ Annulé</option>
                </select>
              </div>

              <button onClick={handleSubmit} disabled={isSubmitting || panier.length === 0} style={{ width: '100%', padding: '15px', background: (isSubmitting || panier.length === 0) ? '#ccc' : '#0066cc', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.2rem', fontWeight: 'bold', cursor: (isSubmitting || panier.length === 0) ? 'not-allowed' : 'pointer' }}>
                {isSubmitting ? 'Validation...' : '💳 Valider la commande'}
              </button>
              {formMessage && <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '15px', color: formMessage.includes('✅') ? 'green' : 'red' }}>{formMessage}</p>}
            </div>
          </div>
        </div>
        )}

        {/* --- ZONE DROITE : HISTORIQUE DES COMMANDES --- */}
        <div>
          <h2 style={{ marginTop: 0 }}>📜 Historique des ventes</h2>
          {commandes.length === 0 ? <p style={{ color: '#888' }}>Aucune vente pour le moment.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {commandes.map(cmd => {
                const isPaye = cmd.statut_paiement === 'Payé';
                return (
                  <div key={cmd.id_commande} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: `5px solid ${isPaye ? '#4CAF50' : '#ff9800'}` }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ background: isPaye ? '#e8f5e9' : '#fff3e0', color: isPaye ? '#2e7d32' : '#e65100', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {cmd.statut_paiement}
                      </span>
                      <span style={{ color: '#888', fontSize: '0.9rem' }}>
                        {new Date(cmd.date_commande).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 5px 0' }}>Client : {cmd.contact ? `${cmd.contact.prenom} ${cmd.contact.nom}` : 'Inconnu'}</h3>
                    <strong style={{ fontSize: '1.4rem', color: '#0066cc', display: 'block', marginBottom: '15px' }}>{cmd.montant_total} €</strong>

                    <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '5px', fontSize: '0.9rem' }}>
                      <strong style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Articles :</strong>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#444' }}>
                        {cmd.commande_produit.map((cp, idx) => (
                          <li key={idx}>
                            {cp.quantite}x {cp.produit.marque} {cp.produit.modele} ({cp.prix_unitaire_facture}€/u)
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ marginTop: '15px', textAlign: 'right' }}>
                      {user?.role === 'Admin' && (  
                        <button onClick={() => handleDelete(cmd.id_commande)} style={{ background: 'none', border: 'none', color: '#ff4444', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>Annuler la facture</button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}