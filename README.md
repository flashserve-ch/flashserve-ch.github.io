# FlashServe — site web officiel

Site vitrine de FlashServe, en français et en anglais.
Adresse : **https://flashserve-ch.github.io**

Le site est publié automatiquement par **GitHub Pages** à chaque modification de la branche `main` (compter 1 à 2 minutes).

## Contenu du dossier

| Fichier / dossier | Rôle |
|---|---|
| `index.html` | Page d'accueil en **français** |
| `en/index.html` | Page d'accueil en **anglais** |
| `404.html` | Page affichée quand une adresse n'existe pas |
| `assets/css/styles.css` | Le design : couleurs, typographie, mise en page, animation |
| `assets/js/main.js` | Petits réglages de navigation (le site fonctionne aussi sans) |
| `assets/img/` | Logos (SVG) et images de partage réseaux sociaux (`og-fr.png`, `og-en.png`) |
| `assets/fonts/` | Police Inter, hébergée sur le site (licence SIL OFL incluse) |
| `favicon.*`, `apple-touch-icon.png`, `icon-*.png`, `site.webmanifest` | Icônes d'onglet et de téléphone |
| `robots.txt`, `sitemap.xml` | Informations pour Google |
| `.well-known/security.txt` | Contact à utiliser pour signaler un problème de sécurité |
| `.nojekyll` | Indique à GitHub de publier les fichiers tels quels |

## Modifier un texte

1. Ouvrir le fichier sur GitHub (`index.html` pour le français, `en/index.html` pour l'anglais).
2. Cliquer sur l'icône **crayon** (Edit this file).
3. Modifier le texte entre les balises, sans toucher aux `<` `>`.
4. Cliquer sur **Commit changes**. Le site se met à jour en 1 à 2 minutes.

Pensez à faire la même modification dans les **deux langues**.
Après une modification de `styles.css` ou `main.js`, augmentez le numéro `?v=1.0.0` dans les deux pages HTML pour que les visiteurs reçoivent la nouvelle version.

## Couleurs de la marque

| Nom | Code | Usage |
|---|---|---|
| Bleu marine | `#0B1F3A` | Couleur principale, logo, textes |
| Bleu FlashServe | `#2E75B6` | Accents, signal BLE, périmètre |
| Glacier | `#EEF3F9` | Fonds clairs |
| Or | `#E3B341` | Réservé à l'offre pilote |

## Sécurité

- Le site ne collecte **aucune donnée** : pas de formulaire, pas de cookies, pas de statistiques, aucun service externe.
- Les contacts passent par des liens e-mail vers `flashserve@icloud.com`.
- Une politique de sécurité du contenu (CSP) bloque tout script ou style qui ne vient pas du site lui-même. Si un jour vous ajoutez un outil externe (statistiques, carte, vidéo…), il faudra l'autoriser dans la balise `Content-Security-Policy` des pages.
- Ce repository est **public** : ne jamais y déposer de mot de passe, de clé ou de document interne.

## Brancher plus tard le domaine flashserve.ch

1. Acheter `flashserve.ch` chez un registraire (ex. Infomaniak).
2. Dans **Settings → Pages → Custom domain** du repository, saisir `flashserve.ch`, puis suivre les indications DNS de GitHub.
3. Cocher **Enforce HTTPS** une fois le certificat prêt.
4. Remplacer `https://flashserve-ch.github.io/` par `https://flashserve.ch/` dans les pages HTML, `sitemap.xml`, `robots.txt` et `.well-known/security.txt`.
