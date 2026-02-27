# 👟 Kicks - CRM Web Full SaaS pour la revente de Sneakers

Bienvenue sur le dépôt officiel de **Kicks**, une application web full-stack développée dans le cadre de notre projet de création d'un CRM moderne orienté Communication Digitale. 

Ce CRM est spécialement conçu pour une entreprise spécialisée dans la vente de sneakers, permettant de centraliser les données clients, de gérer un pipeline de ventes sur-mesure et d'automatiser les campagnes marketing.

---

## 🚀 Fonctionnalités Principales

Notre application intègre les modules suivants :
* **🔐 Gestion des utilisateurs :** Authentification sécurisée (JWT, mots de passe hashés) et gestion fine des rôles (Admin, Commercial, Standard).
* **👥 Gestion des contacts et entreprises :** Fiches clients détaillées incluant des données spécifiques au secteur (pointure, marque préférée).
* **📊 Pipeline et Funnel de vente :** Suivi visuel des leads ("prospects") avec des statuts personnalisés pour les "drops" (Nouveau, Qualification, Proposition, Négociation, Gagné/Perdu).
* **📅 Gestion des tâches :** Planification des appels et rendez-vous pour le suivi commercial.
* **✉️ Automatisation Marketing :** Programmation d'emails automatiques et alertes de restock grâce à l'intégration de l'API Brevo.
* **📈 Tableau de bord analytique :** Visualisation des KPI (Chiffre d'affaires, taux de conversion, ROI marketing).

---

## 🛠️ Stack Technique & Architecture SaaS

Ce projet repose sur une architecture cloud moderne "zéro serveur à gérer" assurant scalabilité et déploiement continu :

* **Frontend :** React.js + Next.js (pour une interface UI/UX moderne et responsive)
* **Backend :** Node.js + NestJS (API REST robuste)
* **Base de données :** PostgreSQL hébergée sur Supabase (BaaS)
* **Emailing :** Brevo (via API/SMTP)
* **Déploiement / Hébergement :** Vercel (Frontend & Backend)
* **Gestion de version :** Git & GitHub

---

## 📂 Structure du Projet

```text
├── frontend/       # Application React / Next.js
├── backend/        # API REST Node.js / NestJS
├── docs/           # Documentation (MCD, UML, Rapport)
└── README.md       # Ce fichier