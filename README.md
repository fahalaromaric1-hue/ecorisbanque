# Ecorise Banque — Banque en ligne (démo)

Application de démonstration bancaire responsive en JavaScript vanilla.

## Fonctionnalités

- Connexion client et espace **administrateur**
- **Persistance** des comptes (localStorage)
- Tableau de bord : solde, historique, filtres, **recherche**, export relevé
- **Notifications toast** et indicateur de chargement
- Transferts / prêts désactivés (messages métier)
- Modification admin du nom et du solde (relevé synchronisé)
- Mobile : solde en avant, 5 opérations + « Montrer plus », graphique repliable
- Page **Mon profil** unifiée (profil + notifications)

## Hébergement Render (comptes partagés en ligne)

1. Poussez ce dossier sur GitHub.
2. Sur [Render](https://render.com), cliquez **New → Blueprint** et sélectionnez le dépôt.
3. Render lit `render.yaml` et crée :
   - un **Web Service** Node.js (gratuit)
   - une base **PostgreSQL** (gratuite, expire après 30 jours)
4. Une fois déployé, ouvrez l’URL Render (ex. `https://ecorisbanque.onrender.com`).

Les modifications admin sont stockées en PostgreSQL et visibles depuis tous les navigateurs.

> **Note Render gratuit :** le service peut mettre ~30 s à répondre après inactivité. La base Postgres gratuite expire après 30 jours (export possible avant).

## Utilisation locale

Lancez le serveur (obligatoire pour partager les comptes entre navigateurs) :

```bash
npm start
```

Puis ouvrez [http://localhost:8765](http://localhost:8765).

Les modifications admin (nom, solde) sont enregistrées dans `accounts.json` et visibles depuis tout navigateur connecté au même serveur.

> Sans serveur (`index.html` seul ou `python -m http.server`), les données restent dans le **localStorage** du navigateur et ne se synchronisent pas.

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Client | `ingofranc@gmail.com` | `franc123` |
| Client | `md` | `2222` |
| Admin | `fahalaromaric1@gmail.com` | `franc123` |

## Fichiers

- `index.html` — interface
- `app.js` — logique applicative
- `styles.css` — mise en page
- `server.js` — serveur local + API comptes partagés
- `accounts.json` — données comptes clients (partagées)

## Note

Démo locale uniquement : pas de vraie sécurité bancaire. Les données sont stockées dans le navigateur.
