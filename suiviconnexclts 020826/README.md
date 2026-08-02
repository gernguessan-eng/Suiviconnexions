# RISE · Presence — Tableau de bord des connexions

Application React connectée en **temps réel** (Firestore `onSnapshot`) à
votre projet Firebase `riseappli-prod`. Dès qu'un document change dans
`presence`, `users` ou `entreprises`, tous les écrans se mettent à jour
automatiquement, sans rechargement de page.

## 1. Menus inclus

| Menu | Contenu |
|---|---|
| **Utilisateurs connectés** | Les 4 cartes KPI demandées + la liste temps réel des sessions actives (avec application, clôture et suppression manuelle) |
| **Historique des connexions** | Journal complet de toutes les sessions (connexion, déconnexion, durée), avec recherche et suppression |
| **Entreprises** | Création d'entreprises, assignation des utilisateurs, statistiques par entreprise **et par utilisateur** |
| **Statistiques** | Connexions par jour (7 derniers jours) + classement des entreprises les plus actives |
| **Alertes** | Sessions anormalement longues, entreprises inactives — calculées automatiquement, ou lues depuis une collection `alertes` si vous en créez une |
| **Carnet d'adresses** | Fournisseurs, garages, assureurs, clients, partenaires... — création, modification, suppression, recherche et filtres par type, temps réel |
| **Comptes** | Gestion des comptes utilisateurs : rôle, entreprise, applications connectées, réinitialisation de mot de passe, création de nouveaux comptes |
| **Prospects** | Suivi de prospection commerciale : tableau éditable en ligne (entreprise, statut, démo, RDV, notes) + KPI et graphiques de répartition |

### Les 4 cartes KPI (page "Utilisateurs connectés")

1. 👤 **Utilisateurs connectés** — nombre d'utilisateurs distincts avec `statut: "Connecté"`
2. 📅 **Connexions aujourd'hui** — nombre de sessions dont `connexion` est aujourd'hui
3. 🏢 **Entreprises connectées** — nombre d'entreprises distinctes ayant ≥1 utilisateur en ligne
4. ⏱ **Temps moyen de connexion aujourd'hui** — moyenne de (déconnexion − connexion) sur les sessions du jour (utilise l'heure actuelle si l'utilisateur est encore connecté)

Tous ces calculs sont automatiques et se recalculent en direct — voir
`src/utils/presenceStats.js`.

## 2. Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrez ensuite `http://localhost:5173`. Tant que Firebase n'est pas
configuré, une bannière orange vous l'indique en haut de chaque page.

## 3. Configurer votre projet Firebase

1. Allez sur [Console Firebase → Paramètres du projet](https://console.firebase.google.com/u/0/project/riseappli-prod/settings/general)
2. Section **Vos applications** → si aucune app Web n'existe, cliquez sur l'icône `</>` pour en créer une
3. Copiez l'objet `firebaseConfig` affiché
4. Collez ses valeurs dans `src/firebaseConfig.js`

## 4. Structure de données réelle (confirmée avec vous)

### `presence/{id}`
```js
{
  connexion:    Timestamp,          // heure de connexion
  deconnexion:  Timestamp,          // heure de déconnexion
  displayName:  "Animateur",
  email:        "gernguessan@gmail.com",
  role:         "Administrateur",
  statut:       "Connecté" | "Déconnecté",
  uid:          "b9IRWAZvhAdLFYCUtwsi2ImBPy52",
  application:  "RiseAppli",        // optionnel — voir note ci-dessous
}
```

⚠️ Le champ `application` n'a pas été confirmé dans vos documents Firestore
— j'ai supposé le nom `application`, avec `"RiseAppli"` comme valeur par
défaut si le champ est absent (visible tel quel dans la colonne
"Application" du menu Utilisateurs connectés). Si le vrai nom de champ ou
les valeurs sont différents chez vous, il suffit de corriger `FIELDS.application`
et `DEFAULT_APPLICATION` dans `src/config/presenceSchema.js`.

### `users/{uid}`
```js
{
  displayName, email, role, uid, createdAt, updatedAt,
  entrepriseId: "rise-sasu",   // ajouté/modifié automatiquement par le menu Entreprises
}
```

### `entreprises/{id}`
```js
{ name: "RISE SASU", createdAt: Timestamp }
```

Tout est centralisé dans **`src/config/presenceSchema.js`** : si un nom de
champ change chez vous, il suffit de le modifier à cet endroit, aucun autre
fichier n'a besoin d'être touché.

## 5. Gérer vos entreprises (aucune manipulation Firestore requise)

Vous n'avez actuellement qu'une seule entreprise, **RISE SASU**, utilisée
automatiquement par défaut pour tout utilisateur sans `entrepriseId`. Quand
vous êtes prêt à ajouter un client :

1. Ouvrez le menu **Entreprises**
2. Champ "Ajouter une entreprise" → tapez le nom → **+ Ajouter**
   (crée un document dans `entreprises`, visible instantanément partout)
3. Toujours sur cette page, section "Assigner les utilisateurs à une
   entreprise" → choisissez la nouvelle entreprise dans le menu déroulant
   en face de chaque utilisateur concerné
   (met à jour `entrepriseId` sur le document `users/{uid}` correspondant)

Les cartes KPI, la page Entreprises et les Statistiques se recalculent
automatiquement, sans rien recharger.

## 6. Connexion (Firebase Authentication)

Comme vos règles Firestore exigent maintenant un utilisateur connecté, le
tableau de bord affiche un écran de connexion avant tout accès aux données.
Utilisez **le même compte** (email/mot de passe ou Google) que celui utilisé
pour vous connecter à R.I.S.E — puisque `request.auth != null` accepte
n'importe quel compte déjà enregistré dans Firebase Authentication de
`riseappli-prod`, pas seulement les documents de la collection `users`.

Si la connexion Google échoue avec une erreur de type "domaine non autorisé",
ajoutez le domaine où vous hébergez ce tableau de bord dans Console Firebase
→ Authentication → Paramètres → Domaines autorisés.

## 7. Sécurité — à lire avant mise en production

Voir **`FIRESTORE_RULES.md`** : le menu Entreprises effectue deux types
d'écriture (création d'entreprise, assignation d'utilisateur), en plus des
lectures temps réel. Les règles fournies limitent précisément ce qui peut
être écrit et par qui.

L'écran de connexion (section 6) protège déjà l'accès. Pour aller plus loin
(réserver l'app à certains rôles seulement, par ex.), voir "Aller plus loin"
plus bas.

## 8. Déploiement

```bash
npm run build
```

Le dossier `dist/` généré peut être déployé sur Firebase Hosting :

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # choisir "dist" comme dossier public, projet riseappli-prod
firebase deploy
```

## 9. Structure du projet

```
src/
  firebaseConfig.js            → vos identifiants Firebase (à remplir)
  firebase.js                   → initialisation de l'app Firebase (Firestore + Auth)
  config/presenceSchema.js      → noms des champs Firestore + entreprise par défaut
  hooks/usePresence.js          → écoute temps réel de la collection presence
  hooks/useUsers.js             → écoute users + assignUserEntreprise()
  hooks/useEntreprises.js       → écoute entreprises + createEntreprise()
  hooks/useAlertesCollection.js → écoute une collection alertes optionnelle
  hooks/useAuth.js               → connexion / déconnexion Firebase Authentication
  utils/enrich.js                → jointure presence → users → entreprises
  utils/presenceStats.js        → calcul des 4 KPI + agrégations
  utils/date.js                  → formatage dates/durées
  context/PresenceContext.jsx   → combine tout, partagé entre les pages
  components/                   → Sidebar, TopBar, KpiCard, LoginScreen, bannières
  pages/                         → les 5 menus de l'application
```

## 10. Sessions "fantômes" (Connecté qui ne se déconnecte jamais)

Si un onglet se ferme, l'app crash, ou le réseau coupe sans que votre
application R.I.S.E ait le temps d'écrire `statut: "Déconnecté"`, la session
reste "Connecté" pour toujours dans Firestore. Ce tableau de bord fait deux
choses pour ça :

- il **repère** ces sessions automatiquement (badge "⚠ probablement
  fantôme" au-delà de 8h, visible sur la page Utilisateurs connectés et
  dans Alertes)
- il permet de les **clôturer manuellement** en un clic (bouton "Clôturer")

C'est un correctif côté lecture/affichage, pas la vraie solution. La vraie
solution se situe dans le code de R.I.S.E qui écrit `presence` : ajouter une
détection de déconnexion fiable, par exemple :
- **Realtime Database + `onDisconnect()`** : Firebase peut détecter nativement
  la perte de connexion (RTDB seulement, pas Firestore directement), puis une
  Cloud Function répercute le changement vers Firestore
- **Heartbeat** : le client écrit un `lastSeenAt` toutes les X minutes tant
  qu'il est ouvert ; une session sans heartbeat récent est considérée hors
  ligne, même si `statut` dit encore "Connecté"

Dites-moi si vous voulez que je vous aide à l'implémenter dans R.I.S.E.

## 11. Menu Comptes — ce qu'il fait et ses limites

Le menu **Comptes** permet de :
- Voir tous les comptes (`users`), leur rôle, leur entreprise, et les applications
  auxquelles ils se sont connectés (déduit de `presence`)
- Changer le rôle ou l'entreprise directement depuis le tableau
- Envoyer un e-mail de réinitialisation de mot de passe
- Créer un nouveau compte (un mot de passe temporaire est généré automatiquement,
  puis un e-mail est envoyé à la personne pour qu'elle le définisse elle-même)

**Limite technique importante** : le bouton "Supprimer" sur un compte ne supprime
que son **profil Firestore** (rôle, entreprise). Il ne supprime **pas** le compte
Firebase Authentication lui-même — depuis une application cliente (sans backend
ni Cloud Function), il est impossible de supprimer le compte de connexion d'un
*autre* utilisateur, pour des raisons de sécurité intrinsèques à Firebase. La
personne concernée pourrait donc techniquement encore se connecter, mais sans
profil tant qu'aucun n'est recréé. Pour une suppression complète et définitive,
il faudrait une Cloud Function avec le SDK Admin — dites-le-moi si vous voulez
qu'on la mette en place.

## 12. Aller plus loin

- Pagination / requêtes limitées si `presence` devient très volumineuse
  (actuellement tout l'historique est chargé)
- Export CSV de l'historique
- Restreindre l'accès par rôle (ex. lecture seule pour certains comptes)
- Vraie collection `alertes` alimentée par une Cloud Function (ex : détecter
  un pic de connexions, une tentative depuis un pays inhabituel, etc.)
- Suppression/renommage d'entreprise depuis l'interface

N'hésitez pas à revenir vers moi pour n'importe lequel de ces points.
