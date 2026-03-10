import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Nettoyage des anciennes données...');
  
  // On efface dans le bon ordre (les enfants avant les parents pour respecter les relations)
  await prisma.commande_produit.deleteMany();
  await prisma.commande.deleteMany();
  await prisma.tache.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.entreprise.deleteMany();
  await prisma.produit.deleteMany();
  
  console.log('🌱 Démarrage du Seeding Kicks CRM...');

  // 1. Gestion de l'Utilisateur Commercial (Upsert = Met à jour ou Crée)
  const commercial = await prisma.utilisateur.upsert({
    where: { email: 'alexandre.v@kicks.com' },
    update: {}, // S'il existe déjà, on ne change rien
    create: {
      nom_prenom: 'Alexandre Ventes',
      email: 'alexandre.v@kicks.com',
      mot_de_passe: 'géré_par_supabase',
      role: 'Commercial'
    }
  });
  console.log('✅ Commercial prêt');

  // 2. Création de l'Inventaire (la suite de ton code actuel...)
  const p1 = await prisma.produit.create({
    data: { 
      modele: 'Air Jordan 1 Retro High OG Chicago', 
      marque: 'Nike / Jordan', 
      prix_unitaire: 180.00, 
      stock_disponible: 45,
      image_url: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?q=80&w=800&auto=format&fit=crop'
    },
  });
  const p2 = await prisma.produit.create({
    data: { 
      modele: 'Dunk Low Retro White Black (Panda)', 
      marque: 'Nike', 
      prix_unitaire: 120.00, 
      stock_disponible: 150,
      image_url: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=800&auto=format&fit=crop'
    },
  });
  const p3 = await prisma.produit.create({
    data: { 
      modele: 'Yeezy Boost 350 V2 Bone', 
      marque: 'Adidas', 
      prix_unitaire: 230.00, 
      stock_disponible: 12,
      image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop'
    },
  });
  console.log('✅ Produits ajoutés avec images');

  // 3. Création des Entreprises partenaires
  const ent1 = await prisma.entreprise.create({
    data: { nom_societe: 'SneakerX Paris', secteur_activite: 'Retail', type_entreprise: 'Boutique Indépendante' },
  });
  const ent2 = await prisma.entreprise.create({
    data: { nom_societe: 'Foot Locker Europe', secteur_activite: 'Grande Distribution', type_entreprise: 'Franchise' },
  });
  console.log('✅ Entreprises créées');

  // 4. Création des Contacts (liés aux entreprises)
  const c1 = await prisma.contact.create({
    data: { prenom: 'Léa', nom: 'Dubois', email: 'lea@sneakerx.fr', telephone: '0611223344', pointure: 38.5, marque_preferee: 'Nike', id_entreprise: ent1.id_entreprise },
  });
  const c2 = await prisma.contact.create({
    data: { prenom: 'Marc', nom: 'Antoine', email: 'm.antoine@footlocker.com', telephone: '0799887766', pointure: 44, marque_preferee: 'Adidas', id_entreprise: ent2.id_entreprise },
  });
  const c3 = await prisma.contact.create({
    data: { prenom: 'Hugo', nom: 'Resell', email: 'hugo.invest@gmail.com', telephone: '0655443322', pointure: 42.5, marque_preferee: 'Jordan' }, // Sans entreprise
  });
  console.log('✅ Contacts créés');

  // 5. Création du Pipeline de Leads
  const lead1 = await prisma.lead.create({
    data: { statut: 'En Négociation', source: 'Salon Sneakerness', montant_estime: 4500.00, id_contact: c1.id_contact, id_utilisateur: commercial.id_utilisateur },
  });
  await prisma.lead.create({
    data: { statut: 'Nouveau', source: 'Site Web', montant_estime: 15000.00, id_contact: c2.id_contact, id_utilisateur: commercial.id_utilisateur },
  });
  await prisma.lead.create({
    data: { statut: 'Gagné', source: 'Recommandation', montant_estime: 2300.00, id_contact: c3.id_contact, id_utilisateur: commercial.id_utilisateur },
  });
  console.log('✅ Pipeline de leads généré');

  // 6. Création de Tâches
  await prisma.tache.create({
    data: { titre: 'Relancer Léa pour le restock', description: 'Vérifier si elle veut les Panda', date_echeance: new Date('2026-03-20T10:00:00Z'), statut: 'À faire', type_tache: 'Appel', id_contact: c1.id_contact, id_utilisateur: commercial.id_utilisateur, id_lead: lead1.id_lead },
  });
  await prisma.tache.create({
    data: { titre: 'Préparer le contrat Foot Locker', date_echeance: new Date('2026-03-12T14:00:00Z'), statut: 'En cours', type_tache: 'Email', id_contact: c2.id_contact, id_utilisateur: commercial.id_utilisateur },
  });
  console.log('✅ Tâches assignées');

  // 7. Création d'une VRAIE Commande (avec ses produits)
  const commande1 = await prisma.commande.create({
    data: {
      id_contact: c3.id_contact,
      montant_total: 2300.00,
      statut_paiement: 'Payé',
      // On insère directement les produits liés à cette commande !
      commande_produit: {
        create: [
          { id_produit: p3.id_produit, quantite: 10, prix_unitaire_facture: 230.00 } // 10 Yeezy
        ]
      }
    }
  });
  console.log('✅ Commande avec lignes de facturation créée');

  console.log('🎉 TOUT EST PRÊT ! La base de données est remplie.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });