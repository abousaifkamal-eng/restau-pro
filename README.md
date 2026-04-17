# 🍽️ RestauPro — Guide de déploiement

## Connexion Super Administrateur
- **Identifiant :** `admin`
- **Mot de passe :** `admin123`
- Sur l'écran de login → cliquez **"👑 Administration"** (pas un restaurant)

## Comptes par défaut (restaurant "Le Bistro Parisien")
| Rôle | Login | MDP |
|------|-------|-----|
| 📋 Gérant | `gerant` | `1234` |
| 👨‍🍳 Cuisinier | `chef` | `1234` |
| 💳 Caissier | `caisse` | `1234` |
| 🍽️ Serveur | `serveur` | `1234` |

---

## 🚀 Déploiement sur Vercel (gratuit, 10 minutes)

### Étape 1 — Créer un compte GitHub
1. Allez sur [github.com](https://github.com) → "Sign up"
2. Créez un compte gratuit

### Étape 2 — Mettre le projet sur GitHub
1. Allez sur [github.com/new](https://github.com/new)
2. Nom du dépôt : `restau-pro`
3. Cliquez "Create repository"
4. Sur la page suivante, cliquez "uploading an existing file"
5. Glissez-déposez **tout le contenu** du dossier `restau-pro`
6. Cliquez "Commit changes"

### Étape 3 — Déployer sur Vercel
1. Allez sur [vercel.com](https://vercel.com) → "Sign up with GitHub"
2. Cliquez "Add New Project"
3. Sélectionnez votre dépôt `restau-pro`
4. Framework : **Vite** (détecté automatiquement)
5. Cliquez **"Deploy"**
6. Dans 2 minutes vous avez une URL du type `https://restau-pro-xxx.vercel.app`

---

## 📱 Installer sur téléphone Android

1. Ouvrez l'URL dans **Chrome**
2. Menu ⋮ (3 points) → **"Ajouter à l'écran d'accueil"**
3. Confirmez → l'icône RestauPro apparaît sur votre bureau

## 📱 Installer sur iPhone

1. Ouvrez l'URL dans **Safari** (pas Chrome)
2. Bouton partage (carré avec flèche) → **"Sur l'écran d'accueil"**
3. Confirmez → l'icône RestauPro apparaît

## 💻 Installer sur PC (Windows/Mac)

1. Ouvrez l'URL dans **Chrome**
2. Cliquez l'icône 💻 dans la barre d'adresse
3. Ou menu ⋮ → "Installer RestauPro"
4. L'app s'ouvre en fenêtre indépendante

---

## 🔒 Changer le mot de passe admin

Dans le fichier `src/App.jsx`, ligne ~10, modifiez :
```js
superAdmin: { username: "admin", password: "VOTRE_NOUVEAU_MOT_DE_PASSE" },
```
Puis redéployez sur Vercel (automatique à chaque push GitHub).

---

## 📡 Synchronisation temps réel entre téléphones

La synchronisation fonctionne **entre onglets du même navigateur** via BroadcastChannel.

Pour une vraie synchronisation **entre différents appareils** (téléphone du gérant + tablette cuisine), il faudra ajouter un backend (Firebase ou Supabase — gratuit). Contactez-moi si vous souhaitez cette évolution.

---

## 🛠️ Développement local (optionnel)

Si vous avez Node.js installé :
```bash
cd restau-pro
npm install
npm run dev
# → http://localhost:5173
```
