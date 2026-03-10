# Kicks CRM

**Kicks CRM** est une application web full-stack B2B/B2C conçue sur-mesure pour les professionnels de la revente de sneakers (retailers, grossistes, et indépendants). Elle centralise la gestion de l'inventaire, le suivi du pipeline commercial, et la gestion des tâches au sein d'une interface moderne et sécurisée.

---

## ✨ Fonctionnalités Principales

* **🔐 Authentification Sécurisée & RBAC :** Gestion des accès selon 3 rôles (Administrateur, Commercial, Standard) via Supabase Auth.
* **📦 Gestion d'Inventaire :** Catalogue visuel des produits avec images, suivi des stocks en temps réel et alertes de rupture.
* **📇 Annuaire Contacts & Entreprises :** Base de données clients B2B et B2C, incluant les spécificités du secteur (pointure, marque préférée).
* **🎯 Pipeline Commercial (Leads) :** Suivi des opportunités de vente par statuts (*Nouveau, En Négociation, Gagné*).
* **✅ Suivi des Tâches :** To-Do list intégrée pour ne manquer aucune relance ou rendez-vous client.
* **📊 Tableau de Bord (Dashboard) :** Synthèse de l'activité avec les KPI majeurs calculés en temps réel.

---

## 🛠️ Stack Technique (Architecture Headless)

### Frontend (Client)
* **Framework :** Next.js (React) avec App Router
* **Langage :** TypeScript
* **Hébergement :** Vercel
* **Styling :** CSS in JS / Composants React purs

### Backend (Serveur)
* **Framework :** NestJS
* **Langage :** TypeScript
* **ORM :** Prisma
* **Hébergement :** Render

### Base de données & Services
* **Base de données :** PostgreSQL (hébergée chez Supabase)
* **Authentification :** Supabase Auth

---

## 🚀 Installation & Lancement en Local

### 1. Prérequis
* [Node.js](https://nodejs.org/) (version 18 ou supérieure)
* Un compte [Supabase](https://supabase.com/) actif

### 2. Cloner le dépôt
```bash
git clone [https://github.com/Hassan-Jatta/crm-web.git](https://github.com/Hassan-Jatta/crm-web.git)
cd crm-web
```

### 3. Configuration du Backend (API)

Ouvrez un terminal et placez-vous dans le dossier backend :

```bash
cd backend
npm install
```

Créez un fichier .env à la racine du dossier backend et ajoutez l'URL de connexion à votre base de données Supabase (Transaction connection pooler) :

```bash
DATABASE_URL="postgresql://postgres.[VOTRE_ID_SUPABASE]:[VOTRE_MOT_DE_PASSE]@[aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true](https://aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true)"
```

Initialisez la base de données via Prisma :

```bash
# Pousse le schéma dans la base de données
npx prisma db push

# Génère le client typé Prisma
npx prisma generate
```

Lancez le serveur backend :

```bash
npm run start:dev
```

Le backend sera accessible sur http://localhost:3001.

### Configuration 

Ouvrez un nouveau terminal et placez-vous dans le dossier frontend :

```bash
cd frontend
npm install
```

Créez un fichier .env.local à la racine du dossier frontend pour lier les environnements :

```bash
# Lien vers l'API backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Clés publiques Supabase
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_ID_SUPABASE.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_secrete_anon_key
```

Lancez l'interface utilisateur :

```bash
npm run dev
```

Le frontend sera accessible sur http://localhost:3000.

## 📂 Architecture du Projet


```bash
crm-web/
├── backend/                  # Application NestJS (API RESTful)
│   ├── prisma/               # Modèles de BDD (schema.prisma) & Script de Seed
│   └── src/                  # Modules métiers (Contrôleurs, Services, DTOs, Entités)
└── frontend/                 # Application Next.js (Interface UI)
    ├── app/                  # Routes principales (Pages du CRM)
    ├── components/           # Composants UI globaux (Top Navbar, etc.)
    ├── context/              # Gestion des états globaux (AuthContext)
    └── lib/                  # Configuration des services externes (Client Supabase)
```

## 👨‍💻 Auteur

Développé par **Hassan Jatta**.