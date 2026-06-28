# EDEM Backoffice

Site web du projet de recherche **EDEM** (explicabilité de l'IA agricole). Le projet
comprend un site public et un panneau d'administration adossés à une API
Node.js/Express et une base de données MySQL.

## Prérequis

- **Node.js** 18 ou supérieur
- **MySQL** 5.7 / 8.0 (ou MariaDB)
- **npm**

## Installation locale

```bash
# 1. Installer les dépendances
npm install

# 2. Créer la base de données dans MySQL
#    (les tables sont créées automatiquement au premier démarrage)
mysql -u root -p -e "CREATE DATABASE edem_db CHARACTER SET utf8mb4;"

# 3. Créer le fichier .env à la racine et le configurer (voir ci-dessous)

# 4. Démarrer le serveur
node server/index.js
# → http://localhost:3000

# 5. Créer le compte admin initial (une seule fois)
node seed.js
# Admin : michele@etis.fr / changeme123  (à changer immédiatement)
```

Il n'y a pas d'étape de build : le serveur sert les fichiers statiques directement.

## Configuration (`.env`)

Créez un fichier `.env` à la racine du projet :

```
JWT_SECRET=un_secret_long_et_aleatoire
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=edem_db
```

| Variable      | Description                                              |
| ------------- | ------------------------------------------------------- |
| `JWT_SECRET`  | Clé secrète de signature des tokens JWT (obligatoire)   |
| `PORT`        | Port d'écoute du serveur (défaut : 3000)                |
| `DB_HOST`     | Hôte MySQL                                               |
| `DB_USER`     | Utilisateur MySQL                                        |
| `DB_PASSWORD` | Mot de passe MySQL                                       |
| `DB_NAME`     | Nom de la base de données                               |

> ⚠️ En production, générez un `JWT_SECRET` long et aléatoire, par exemple :
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Structure

```
server/   — API Express (auth, publications, users, uploads, news) + accès MySQL
public/   — Site public (servi sur /)
admin/    — Panneau d'administration (servi sur /admin/)
seed.js   — Création du compte admin initial
```

## Déploiement en production

Le projet est une application Node.js classique. Voici les étapes générales,
quelle que soit la plateforme (VPS, serveur dédié, PaaS).

### 1. Préparer le serveur

- Installer Node.js (18+) et MySQL.
- Cloner le dépôt et installer les dépendances de production :

```bash
git clone <url-du-depot> edem-backoffice
cd edem-backoffice
npm install --production
```

### 2. Base de données

- Créer la base : `CREATE DATABASE edem_db CHARACTER SET utf8mb4;`
- Créer un utilisateur MySQL dédié (n'utilisez pas `root` en production) :

```sql
CREATE USER 'edem'@'localhost' IDENTIFIED BY 'mot_de_passe_fort';
GRANT ALL PRIVILEGES ON edem_db.* TO 'edem'@'localhost';
FLUSH PRIVILEGES;
```

Les tables sont créées automatiquement au premier démarrage
(`server/db.js → initTables()`).

### 3. Variables d'environnement

Renseigner le fichier `.env` avec les valeurs de production (voir la section
Configuration). **Ne jamais committer le `.env`.**

### 4. Lancer avec un gestionnaire de processus

Utilisez **PM2** pour garder le serveur en vie et le relancer automatiquement :

```bash
npm install -g pm2

pm2 start server/index.js --name edem
pm2 save               # sauvegarde la liste des process
pm2 startup            # génère le script de démarrage au boot
```

Commandes utiles : `pm2 logs edem`, `pm2 restart edem`, `pm2 stop edem`.

### 5. Initialiser le compte admin

Une seule fois, après le premier démarrage :

```bash
node seed.js
```

Puis connectez-vous sur `/admin/login.html` et **changez immédiatement le mot de
passe** par défaut.

### 6. Reverse proxy (Nginx) + HTTPS

Placez Nginx devant l'application Node pour gérer le domaine et le HTTPS :

```nginx
server {
    listen 80;
    server_name votre-domaine.fr;

    client_max_body_size 10M;   # autorise les uploads jusqu'à 10 Mo

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activez ensuite le HTTPS gratuitement avec **Certbot / Let's Encrypt** :

```bash
sudo certbot --nginx -d votre-domaine.fr
```

### 7. Fichiers uploadés

Les images et PDF envoyés via l'admin sont stockés dans `public/uploads/`.
Pensez à **inclure ce dossier dans vos sauvegardes** (en plus de la base de
données) et à le conserver lors des mises à jour du code.

## Mise à jour en production

```bash
git pull
npm install --production
pm2 restart edem
```