# Mon tempo

Métronome web pour iPhone : signature (1 à 12 temps), tempo (30 à 250 BPM),
accent sur le premier temps, tap tempo et scanner façon K2000.

**[Ouvrir l'appli](https://nicokosi.github.io/mon-tempo/)**

<img src="docs/apercu.gif" width="280" alt="Aperçu : le scanner rouge balaie à chaque temps, on passe de 4 à 3 temps puis le tempo monte de 100 à 110">

Les réglages vivent dans l'URL (`?bpm=96&beats=3`) : un favori ou un raccourci
sur l'écran d'accueil par morceau.

## Lancer en local

    python3 -m http.server 8000   # puis http://localhost:8000
    node timing.test.mjs          # tests de la logique

## Publier sur GitHub Pages

Settings → Pages → Deploy from a branch → `main`, dossier `/ (root)`.
Sur l'iPhone : ouvrir l'URL dans Safari, Partager → Sur l'écran d'accueil.
