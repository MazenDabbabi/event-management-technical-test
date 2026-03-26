# Event Management – Test technique

Application complète de gestion d'évènements composée de :

- un **backend** Node/Express + PostgreSQL
- une interface **web** (Next.js) pour gérer les évènements
- une application **mobile** (React Native / Expo) pour que les utilisateurs consultent et réservent des évènements

## Structure du projet

- `backend/` : API REST (authentification, évènements, inscriptions)
- `events-web/` : interface d'administration web
- `events-mobile/` : application mobile client (Expo)

## Prérequis

- Node.js 18+
- Un compte PostgreSQL (par ex. Neon, Supabase…)

## Backend

1. Aller dans le dossier :

	```bash
	cd backend
	npm install
	```

2. Configurer `.env` (voir l'exemple existant) :

	- `PORT` – port HTTP (ex. `3000`)
	- `DATABASE_URL` – URL de connexion PostgreSQL
	- `JWT_SECRET` – clé secrète JWT

3. Lancer l'API :

	```bash
	node index.js
	```

Endpoints principaux :

- `POST /register` – création de compte
- `POST /login` – connexion (retourne un token et les infos user)
- `GET /events` / `GET /events/:id` – liste et détail d'un évènement
- `POST /events` / `DELETE /events/:id` – gestion des évènements
- `POST /events/:id/register` – inscrire un utilisateur
- `GET /users/:id/events` – évènements auxquels un utilisateur est inscrit

## Web (admin)

1. Dans `events-web/` :

	```bash
	cd events-web
	npm install
	```

2. Créer `.env.local` avec :

	```bash
	NEXT_PUBLIC_API_URL=http://localhost:3000
	```

3. Lancer le serveur de dev :

	```bash
	npm run dev
	```

Interface principale : création / suppression d'évènements et consultation des utilisateurs inscrits.

## Mobile (Expo)

1. Dans `events-mobile/` :

	```bash
	cd events-mobile
	npm install
	```

2. Copier `.env.example` vers `.env` et ajuster :

	```bash
	EXPO_PUBLIC_API_URL=http://<IP_DE_VOTRE_PC>:3000
	```

3. Démarrer l'app Expo :

	```bash
	npx expo start
	```

Fonctionnalités principales côté mobile :

- liste des évènements
- consultation du détail
- inscription à un évènement
- indication visuelle des évènements déjà réservés

## Notes

- Le backend doit être accessible depuis le mobile (utiliser l'adresse IP locale, pas `localhost`).
- Les schémas de base de données doivent contenir les tables `users`, `events` et `event_users`.