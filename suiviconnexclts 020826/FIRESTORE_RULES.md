# Règles de sécurité Firestore — projet riseappli-prod

Ce fichier documente les règles **actuellement en place** (avec système de
rôles `canWrite()`), pour que le prochain ajout de collection soit simple à
intégrer sans tout redécouvrir.

## Règles actuelles

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() {
      return request.auth != null;
    }

    function canWrite() {
      return isAuth() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
        in ["Administrateur", "Agent"];
    }

    match /chauffeurs/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /vehicules/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /reservations/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /depenses/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /maintenances/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /factures/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /reglements/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /clients/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /contrats/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /settings/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /presence/{sessionId} {
      allow read: if isAuth();
      allow create: if isAuth();
      allow update, delete: if isAuth();
    }
    match /users/{userId} {
      allow read: if isAuth();
      allow create: if isAuth();
      allow update: if isAuth() && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "Administrateur"
      );
      allow delete: if isAuth() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "Administrateur";
    }
    match /entreprises/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /contacts/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
    match /prospects/{id} {
      allow read: if isAuth();
      allow write: if canWrite();
    }
  }
}
```

**Note sur `users`** : la règle `create` est volontairement ouverte à tout
utilisateur connecté (pas seulement Administrateur/Agent), car la
synchronisation de présence (`risePresenceSync.ts`, utilisée par toutes les
déclinaisons de FleetGest) a besoin de créer son propre profil `users` lors
d'une première connexion, sans forcément être elle-même déjà Administrateur.
Seules les **modifications** d'un profil existant restent réservées au
propriétaire du compte ou à un Administrateur.

## Ajouter une nouvelle collection

Le principe : chaque collection a besoin de son propre bloc `match`, sinon
Firestore refuse tout accès par défaut. Le patron standard utilisé partout
ici :

```
match /nom_de_la_collection/{id} {
  allow read: if isAuth();
  allow write: if canWrite();
}
```

Copiez ce bloc, remplacez `nom_de_la_collection`, ajoutez-le avant la
dernière accolade fermante du fichier, puis **Publier**.

## Comment publier

1. Console Firebase → Firestore Database → onglet **Règles**
2. Remplacez tout le contenu par la version à jour ci-dessus
3. Cliquez sur **Publier**
