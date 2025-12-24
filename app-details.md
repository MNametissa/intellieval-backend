# EXPLICATION DÉTAILLÉE DES FEATURES - Plateforme d'Évaluation de l'Enseignement

## 1. VISION GLOBALE DU PROJET

### 1.1 Objectif Principal
Créer une plateforme universitaire qui permet d'**évaluer la qualité de l'enseignement** de manière anonyme et structurée, tout en offrant un espace de **partage de ressources pédagogiques** entre enseignants et étudiants.

### 1.2 Problématiques Résolues
- **Pour l'administration** : Obtenir des données fiables sur la qualité de l'enseignement pour prendre des décisions éclairées
- **Pour les enseignants** : Recevoir des retours constructifs pour améliorer leur pédagogie et suivre leur évolution dans le temps
- **Pour les étudiants** : Pouvoir s'exprimer anonymement et accéder facilement aux supports de cours

### 1.3 Principes Fondamentaux
- **Anonymat total** : Les évaluations sont strictement anonymes pour encourager l'honnêteté
- **Temps réel** : Les résultats sont visibles immédiatement au fur et à mesure des soumissions
- **Simplicité** : Interface intuitive, processus fluides, pas de complexité inutile
- **Priorité évaluation** : Le partage de cours est secondaire, l'évaluation est le cœur du système

---

## 2. ARCHITECTURE GÉNÉRALE

### 2.1 Séparation Frontend/Backend

**Backend (NestJS)** : Cerveau du système
- Gère toute la logique métier
- Stocke et traite les données
- Expose des API REST pour le frontend
- Garantit la sécurité et l'anonymat

**Frontend (Next.js)** : Interface utilisateur
- Présente les données de manière visuelle
- Collecte les informations des utilisateurs
- Communique avec le backend via HTTP
- Adapte l'affichage selon le rôle (Admin, Enseignant, Étudiant)

### 2.2 Organisation Hiérarchique des Données

```
Université
  └── Département (ex: Informatique, Mathématiques)
       └── Filière (ex: Licence Info L3, Master Data Science)
            ├── Étudiants inscrits à cette filière
            └── Matières (ex: Mathématiques Avancées, Algèbre)
                 └── Enseignant(s) responsable(s)
```

**Points importants** :
- Une matière appartient à UNE filière et UN département
- Un enseignant peut avoir plusieurs matières
- Un étudiant est inscrit à UNE filière
- Les cours (fichiers) sont liés à une matière

---

## 3. FEATURES BACKEND DÉTAILLÉES

### 3.1 AUTHENTIFICATION & GESTION DES RÔLES

#### Fonctionnement de l'authentification
Lorsqu'un utilisateur se connecte :
1. Il fournit son email et mot de passe
2. Le backend vérifie les identifiants dans la base de données
3. Si valides, le backend génère un **jeton JWT** (JSON Web Token)
4. Ce jeton contient : l'identité de l'utilisateur, son rôle, son département, sa filière
5. Le frontend stocke ce jeton et l'envoie à chaque requête suivante
6. Le backend vérifie le jeton pour autoriser ou refuser l'accès

#### Les trois rôles

**ADMIN** : Accès complet
- Peut voir et gérer tous les utilisateurs
- Peut créer et gérer les campagnes d'évaluation
- Peut créer les questionnaires
- Voit les statistiques globales de toute l'université
- Peut exporter toutes les données
- Peut consulter et télécharger tous les cours

**ENSEIGNANT** : Accès limité à ses données
- Peut uploader des cours pour ses matières
- Reçoit uniquement SES résultats d'évaluation
- Voit l'historique de SES évaluations passées
- Ne peut pas voir les résultats des autres enseignants
- Peut consulter tous les cours (pour inspiration pédagogique)

**ÉTUDIANT** : Accès minimal et ciblé
- Peut remplir les évaluations de manière anonyme
- Voit les résultats agrégés uniquement pour SES matières (ceux de sa filière)
- Peut consulter et télécharger les cours de SA filière uniquement
- Ne peut pas voir les données brutes ou individuelles

#### Système de protection des routes
Chaque endpoint du backend est protégé :
- Certains nécessitent juste d'être connecté (token valide)
- D'autres nécessitent un rôle spécifique (ex: seul ADMIN peut créer une campagne)
- Le backend vérifie automatiquement et bloque les accès non autorisés

---

### 3.2 IMPORT MASSIF D'UTILISATEURS

#### Pourquoi cette fonctionnalité ?
Une université peut avoir des centaines ou milliers d'utilisateurs. Créer manuellement chaque compte serait impossible. L'import permet de charger tous les utilisateurs en une seule fois.

#### Comment ça fonctionne ?

**Étape 1 : Préparation du fichier**
L'admin prépare un fichier Excel ou CSV avec toutes les informations :
- Type d'utilisateur (Étudiant, Enseignant, Admin)
- Nom, prénom, email
- Département d'appartenance
- Filière (pour les étudiants)
- Matières associés (pour les enseignants)

**Étape 2 : Upload et parsing**
- L'admin upload le fichier via l'interface web
- Le backend reçoit le fichier et le lit ligne par ligne
- Il extrait les données de chaque colonne

**Étape 3 : Validation**
Le backend vérifie chaque ligne :
- Tous les champs obligatoires sont-ils présents ?
- L'email est-il au bon format ?
- Le département existe-t-il dans la base ?
- La filière existe-t-elle ?
- Y a-t-il des doublons (même email déjà existant) ?

**Étape 4 : Création des comptes**
Pour chaque ligne valide :
- Un compte utilisateur est créé
- Un mot de passe par défaut est généré (à changer à la première connexion)
- Le mot de passe est haché (chiffré) avant stockage
- L'utilisateur est associé à son département et sa filière
- Les enseignants sont liés à leurs matières

**Étape 5 : Rapport**
Le backend renvoie un rapport à l'admin :
- Nombre de comptes créés avec succès
- Liste des erreurs (ligne X : email invalide, ligne Y : département inexistant)

#### Gestion des erreurs
Si une ligne a une erreur, elle est ignorée, mais les autres lignes valides sont quand même traitées. L'admin reçoit le détail de ce qui n'a pas fonctionné pour corriger.

---

### 3.3 CRÉATION ET GESTION DES QUESTIONNAIRES

#### Qu'est-ce qu'un questionnaire ?
C'est un ensemble de questions standardisées qui seront posées aux étudiants pour évaluer un matière ou un enseignant.

#### Structure d'un questionnaire

Un questionnaire contient :
- Un **titre** (ex: "Évaluation pédagogique standard")
- Une **description** optionnelle
- Une **liste de questions** ordonnées

Chaque question a :
- Un **texte** (ex: "Le contenu du cours était-il clair ?")
- Un **type** : soit "Note sur 5 étoiles", soit "Commentaire libre"
- Un **ordre** d'affichage (question 1, 2, 3...)
- Un **caractère obligatoire** ou optionnel

#### Exemple concret de questionnaire

```
Titre : Évaluation de l'enseignement - Semestre 1

Questions :
1. [Étoiles] La clarté du contenu enseigné (obligatoire)
2. [Étoiles] La qualité de la pédagogie de l'enseignant (obligatoire)
3. [Étoiles] La disponibilité de l'enseignant pour répondre aux questions (obligatoire)
4. [Étoiles] L'organisation du cours (optionnel)
5. [Commentaire] Vos suggestions d'amélioration (optionnel)
6. [Commentaire] Ce que vous avez le plus apprécié (optionnel)
```

#### Création d'un questionnaire

L'admin utilise une interface visuelle :
- Il saisit le titre et la description
- Il ajoute des questions une par une
- Il peut réorganiser l'ordre par glisser-déposer
- Il peut prévisualiser le rendu avant de sauvegarder
- Une fois créé, le questionnaire est stocké et peut être réutilisé pour plusieurs campagnes

#### Réutilisabilité
Un même questionnaire peut être utilisé pour :
- Plusieurs campagnes différentes
- Différents semestres
- Différents départements

Cela garantit la **cohérence** des évaluations dans le temps et facilite les comparaisons.

---

### 3.4 CRÉATION ET GESTION DES CAMPAGNES

#### Qu'est-ce qu'une campagne ?
Une campagne est une **période d'évaluation** où les étudiants sont invités à remplir des questionnaires pour évaluer certaines matières ou enseignants.

#### Composants d'une campagne

**Informations générales** :
- Titre (ex: "Évaluation Semestre 1 - 2024")
- Description optionnelle
- Dates de début et de fin

**Questionnaire** :
- Sélection du questionnaire à utiliser (parmi ceux existants)

**Cibles d'évaluation** :
L'admin choisit CE qui sera évalué :
- **Option 1** : Des matières spécifiques (ex: Math Avancées, Physique Quantique, Algèbre)
- **Option 2** : Des enseignants spécifiques (ex: Prof. Martin, Prof. Dupont)

#### Cycle de vie d'une campagne

**Création** : L'admin configure tous les paramètres

**Activation automatique** :
- Avant la date de début : campagne inactive (invisible pour les étudiants)
- À la date de début : campagne devient active automatiquement
- Pendant la période : les étudiants peuvent répondre
- À la date de fin : campagne se clôture automatiquement

**Pendant l'activation** :
- Les étudiants concernés voient la campagne dans leur interface
- Ils peuvent remplir le questionnaire
- Les résultats s'agrègent en temps réel
- Les enseignants et admin voient les statistiques se mettre à jour

**Après clôture** :
- Plus de soumission possible
- Les résultats restent consultables
- Les données sont archivées pour l'historique

#### Logique de ciblage des étudiants

Comment le système sait quels étudiants doivent remplir quelle évaluation ?

**Si la campagne cible un matière** (ex: Math Avancées) :
- Le système identifie la filière de cet matière (ex: Licence Info L3)
- Tous les étudiants inscrits à cette filière reçoivent l'évaluation
- Seuls ces étudiants peuvent remplir le questionnaire

**Si la campagne cible un enseignant** :
- Le système identifie toutes les matières de cet enseignant
- Tous les étudiants de toutes les filières concernées peuvent évaluer

#### Exemple concret

```
Campagne : "Évaluation mi-semestre Informatique"
Dates : 15/01/2025 au 31/01/2025
Questionnaire : "Évaluation pédagogique standard"
Cibles : 
  - Matière "Math Avancées" (Licence Info L3)
  - Matière "Algorithmique" (Licence Info L3)
  - Matière "Bases de données" (Licence Info L3)

Résultat : Tous les étudiants de Licence Info L3 verront 3 questionnaires à remplir (un par matière)
```

---

### 3.5 SOUMISSION ANONYME DES ÉVALUATIONS

#### Le défi de l'anonymat
C'est la feature la plus critique du système. Les étudiants doivent pouvoir donner leur avis honnêtement sans crainte de représailles. Le système doit garantir qu'il est **techniquement impossible** de relier une réponse à un étudiant.

#### Comment fonctionne l'anonymat ?

**Principe clé** : Séparation totale entre identité et réponse

**Lors de l'affichage des évaluations disponibles** :
- L'étudiant se connecte avec son compte (authentification normale)
- Le backend vérifie sa filière et ses matières
- Il lui envoie la liste des campagnes actives qui le concernent
- L'étudiant voit "Vous avez 3 évaluations à compléter"

**Lors du remplissage** :
- L'étudiant clique sur une évaluation
- Il remplit le questionnaire (étoiles + commentaires)
- Il clique sur "Soumettre"

**Lors de la soumission (LE MOMENT CRITIQUE)** :
- Le frontend prépare les données à envoyer
- **IMPORTANT** : Le frontend NE JOINT PAS le token d'authentification à cette requête
- Le frontend envoie uniquement :
    - L'ID de la campagne
    - L'ID de la cible (matière ou enseignant évalué)
    - Les réponses (notes et commentaires)
    - L'ID de la filière (pour les statistiques, mais sans lien à l'étudiant)

**Côté backend lors de la réception** :
- Le backend reçoit les données
- Il ne peut PAS savoir quel étudiant a envoyé cela (pas de token)
- Il vérifie juste que les données sont valides (campagne existe, réponses cohérentes)
- Il stocke les réponses dans une table totalement dissociée des comptes utilisateurs
- Le timestamp de soumission est même légèrement randomisé (+/- 30 minutes) pour éviter toute corrélation temporelle

**Résultat** :
- Une ligne est ajoutée dans la table "Evaluations"
- Cette ligne contient les réponses, l'ID de la campagne, l'ID de la cible
- Elle ne contient AUCUN identifiant étudiant, AUCUNE adresse IP, AUCUNE métadonnée permettant identification

#### Prévention des doublons

Comment empêcher un étudiant de répondre plusieurs fois si on ne trace pas son identité ?

**Solution côté frontend** :
- Quand l'étudiant soumet une évaluation, le frontend marque localement (dans le navigateur) que cette évaluation est complétée
- La prochaine fois qu'il se connecte, cette évaluation n'apparaît plus dans sa liste

**Solution côté backend (optionnelle et temporaire)** :
- Le backend peut utiliser un "fingerprint" technique (combinaison d'informations techniques du navigateur + IP)
- Ce fingerprint est haché et utilisé uniquement pour limiter à 1 soumission par campagne
- Ce fingerprint est supprimé après clôture de la campagne (pas de stockage long terme)

#### Garanties techniques
- Aucun log serveur ne contient d'information identifiante lors de la soumission
- Les adresses IP ne sont pas enregistrées
- Les timestamps sont floutés
- La base de données elle-même ne permet pas de retrouver qui a dit quoi

---

### 3.6 AGRÉGATION ET CALCUL DES RÉSULTATS

#### Qu'est-ce que l'agrégation ?
L'agrégation consiste à **compiler toutes les réponses individuelles** pour produire des statistiques globales : moyennes, distributions, tendances.

#### Calculs effectués en temps réel

**Pour chaque question de type "Étoiles"** :
- Calcul de la **note moyenne** (somme de toutes les notes / nombre de réponses)
    - Exemple : 5 étudiants notent 5, 4, 5, 3, 5 → Moyenne = 4.4/5
- Calcul de la **distribution** (combien ont donné 1, 2, 3, 4, 5 étoiles)
    - Exemple : 1★: 0, 2★: 0, 3★: 1, 4★: 1, 5★: 3

**Pour chaque question de type "Commentaire"** :
- Collecte de tous les commentaires
- Affichage anonymisé (sans ordre chronologique pour éviter toute déduction)

**Agrégations par niveau** :

**Niveau Matière** :
- Moyenne globale de l'enseignement
- Moyenne par question
- Nombre total de réponses
- Liste des commentaires

**Niveau Enseignant** :
- Moyenne globale de l'enseignant (moyenne de tous ses matières)
- Comparaison entre ses différents matières
- Tendances d'un semestre à l'autre

**Niveau Filière** :
- Moyenne de toutes les matières de la filière
- Classement des matières

**Niveau Département** :
- Moyenne générale du département
- Comparaison entre filières

**Niveau Université** :
- Statistiques globales
- Comparaison entre départements

#### Temps réel : comment ?

**Approche technique** :
- À chaque nouvelle soumission, les calculs sont refaits (ou incrémentés)
- Les résultats sont mis en cache pour éviter de recalculer à chaque consultation
- Le cache est invalidé à chaque nouvelle soumission
- Les dashboards se rafraîchissent automatiquement (polling toutes les 30 secondes ou WebSocket)

**Exemple concret** :
```
T0 : Campagne démarre, 0 réponses
     Dashboard affiche : "Aucune réponse pour le moment"

T1 : Étudiant 1 soumet (note 4/5)
     Dashboard affiche : 1 réponse, moyenne 4.0/5

T2 : Étudiant 2 soumet (note 5/5)
     Dashboard se met à jour : 2 réponses, moyenne 4.5/5

T3 : Étudiant 3 soumet (note 3/5)
     Dashboard se met à jour : 3 réponses, moyenne 4.0/5

...et ainsi de suite en temps réel
```

#### Optimisation des performances
- Les moyennes sont calculées par la base de données (requêtes SQL avec AVG, COUNT, GROUP BY)
- Les résultats fréquemment consultés sont mis en cache (Redis ou en mémoire)
- Le cache expire après X minutes ou lors de nouvelles soumissions

---

### 3.7 DASHBOARDS ET ANALYTICS

#### Dashboard Admin : Vue d'ensemble

**Métriques principales** :
- Nombre total de réponses reçues toutes campagnes confondues
- Taux de participation moyen (réponses reçues / réponses attendues)
- Satisfaction globale (moyenne générale de l'université en étoiles)

**Graphiques et visualisations** :
- **Participation par filière** : Graphique en barres montrant combien d'étudiants ont participé par filière
- **Évolution dans le temps** : Courbe montrant l'évolution de la satisfaction sur plusieurs semestres
- **Distribution des notes** : Histogramme montrant combien de 1★, 2★, 3★, 4★, 5★
- **Tableau comparatif** : Liste des matières ou enseignants avec leurs moyennes

**Filtres dynamiques** :
L'admin peut filtrer toutes ces données par :
- Département
- Filière
- Période (semestre, année)
- Enseignant spécifique
- Matière spécifique

**Drill-down (navigation détaillée)** :
- Clic sur un département → Vue détaillée de ce département
- Clic sur une filière → Liste des matières de cette filière
- Clic sur un matière → Détails complets (toutes les questions, tous les commentaires)

#### Dashboard Enseignant : Vue personnelle

**Vue d'accueil** :
- Liste de ses matières avec note moyenne pour chacun
- Identification rapide des points forts et faibles

**Détails par matière** :
Quand l'enseignant clique sur un matière :
- Nombre total de réponses reçues
- Note moyenne globale
- Note moyenne par question (avec graphique radar)
    - Exemple : Clarté: 4.5★, Pédagogie: 4.0★, Disponibilité: 4.8★
- Distribution des notes par question
- Tous les commentaires anonymes (pagination)

**Historique pédagogique** :
- Graphique courbe montrant l'évolution des notes sur plusieurs semestres
- Tableau de comparaison période N vs période N-1
- Identification des tendances :
    - Amélioration (+) : note en hausse de 0.5★ ou plus
    - Stable (=) : variation de moins de 0.5★
    - Détérioration (-) : note en baisse de 0.5★ ou plus

**Analyse qualitative** :
- Les commentaires sont regroupés et affichés
- L'enseignant peut lire tous les retours anonymes
- Il peut identifier les thèmes récurrents (manuellement pour MVP, automatiquement avec ML en post-MVP)

#### Dashboard Étudiant : Vue agrégée

**Objectif** : Permettre aux étudiants de voir les résultats globaux, pas pour noter les enseignants publiquement, mais pour avoir une vision partagée de la qualité.

**Affichage** :
- Liste de toutes les matières de sa filière
- Note moyenne (étoiles) pour chaque matière
- Possibilité de comparer entre matières
- Accès aux commentaires anonymisés (ce que les autres étudiants ont dit)

**Restriction** :
L'étudiant ne voit les résultats QUE si :
- Il a lui-même complété l'évaluation
- OU la campagne est clôturée

Cela encourage la participation : "Pour voir les résultats, participez d'abord !"

---

### 3.8 GESTION DES COURS (UPLOAD ET CONSULTATION)

#### Upload de cours par l'enseignant

**Processus** :
1. L'enseignant se connecte
2. Il accède à sa section "Mes cours"
3. Il clique sur "Ajouter un cours"
4. Il sélectionne :
    - L'matière concerné (parmi ses matières)
    - Le fichier à uploader (PDF, PPT, DOCX)
    - Un titre descriptif
    - Une description optionnelle (ex: "Chapitre 3 : Les intégrales")
5. Il valide

**Traitement backend** :
- Réception du fichier
- Validation :
    - Format accepté ? (PDF, PPT, PPTX, DOC, DOCX)
    - Taille raisonnable ? (limite 50 MB)
    - Matière appartient bien à cet enseignant ?
- Stockage du fichier sur le serveur (système de fichiers local)
- Génération d'un chemin d'accès sécurisé
- Sauvegarde des métadonnées en base de données :
    - Titre, description
    - Chemin du fichier sur le serveur
    - Matière associé
    - Date d'upload
    - Enseignant auteur

**Organisation** :
Les cours sont classés par matière :
```
Math Avancées
  ├── Chapitre 1 : Dérivées (PDF, uploadé le 10/01)
  ├── Chapitre 2 : Primitives (PDF, uploadé le 17/01)
  └── TD Corrigés (PDF, uploadé le 24/01)

Algorithmique
  ├── Introduction (PPT, uploadé le 05/01)
  └── Complexité (PDF, uploadé le 12/01)
```

#### Consultation par les étudiants

**Accès** :
- L'étudiant se connecte
- Il voit une section "Mes cours"
- Il voit uniquement les cours des matières de SA filière

**Fonctionnalités** :
- Liste des cours avec titre, nom de l'enseignant, date
- Recherche par mot-clé (dans les titres)
- Filtrage par matière
- Visualisation en ligne (si le format le permet, ex: PDF dans le navigateur)
- Téléchargement direct

**Sécurité** :
- L'accès aux fichiers est contrôlé par le backend avec vérification du token JWT
- Seuls les utilisateurs autorisés (étudiants de la filière ou enseignants) peuvent accéder
- Le serveur vérifie les permissions avant de servir le fichier

#### Gestion par l'admin

L'admin peut :
- Voir tous les cours de toute l'université
- Télécharger n'importe quel cours
- Rechercher par enseignant, département, filière

---

### 3.9 EXPORT DES DONNÉES

#### Pourquoi exporter ?

L'admin peut avoir besoin de :
- Présenter des données lors de réunions (rapports Word, Excel)
- Partager avec des instances supérieures
- Faire des analyses externes (Excel, logiciels statistiques)
- Archiver les données

#### Formats d'export

**Excel (.xlsx)** :
- Fichier structuré avec plusieurs onglets :
    - Onglet 1 : Métadonnées de la campagne
    - Onglet 2 : Résultats agrégés par matière
    - Onglet 3 : Détails par question
    - Onglet 4 : Liste des commentaires
- Avec mise en forme (couleurs, graphiques si possible)

**CSV (.csv)** :
- Format brut, facile à importer dans d'autres systèmes
- Un fichier par type de données

#### Contenu exporté

**Export d'une campagne complète** :
- Titre, dates, nombre de réponses
- Pour chaque matière évalué :
    - Nom de l'enseignement
    - Enseignant
    - Note moyenne globale
    - Note moyenne par question
    - Distribution des notes
    - Tous les commentaires

**Export personnalisé** :
L'admin peut sélectionner :
- Une période (semestre, année)
- Un département ou une filière
- Un enseignant spécifique
- Quelles colonnes inclure

**Génération du fichier** :
1. L'admin clique sur "Exporter"
2. Le backend compile les données
3. Il génère le fichier Excel/CSV
4. Le fichier est téléchargé automatiquement

---

## 4. FEATURES FRONTEND DÉTAILLÉES

### 4.1 LANDING PAGE

**Objectif** : Présenter la plateforme aux visiteurs et encourager la connexion

**Contenu** :
- **Section Hero** :
    - Titre accrocheur : "Améliorez la qualité de l'enseignement avec des évaluations anonymes"
    - Sous-titre explicatif
    - Bouton "Se connecter"

- **Section Features** (3 colonnes) :
    - Icône + Titre + Description
    - Feature 1 : "Évaluations anonymes et sécurisées"
    - Feature 2 : "Dashboards en temps réel pour tous"
    - Feature 3 : "Partage de ressources pédagogiques"

- **Section Call-to-Action** :
    - Bouton de connexion répété
    - Lien contact ou FAQ

**Design** :
- Responsive (adapté mobile, tablette, desktop)
- Design moderne et épuré
- Couleurs liées à l'identité de l'université

---

### 4.2 INTERFACE ADMIN

#### Page Dashboard
- Visualisation immédiate de l'état du système
- Cartes de métriques (4 cartes en haut)
- Graphiques interactifs
- Navigation rapide vers les autres sections

#### Page Gestion Utilisateurs
- Tableau avec liste de tous les utilisateurs
- Filtres : rôle, département, filière
- Recherche par nom/email
- Actions : modifier, désactiver
- Bouton "Import CSV" pour importer en masse

#### Page Créer/Gérer Questionnaires
- Liste des questionnaires existants
- Bouton "Créer nouveau"
- Interface de création :
    - Champs titre/description
    - Ajout de questions par glisser-déposer
    - Choix type de question (étoiles/commentaire)
    - Réorganisation facile
    - Prévisualisation en temps réel

#### Page Créer/Gérer Campagnes
- Liste des campagnes (actives, futures, passées)
- Bouton "Créer campagne"
- Formulaire multi-étapes :
    1. Infos générales
    2. Sélection questionnaire
    3. Choix cibles (multi-select avec recherche)
    4. Validation finale

#### Page Consultation Cours
- Tableau de tous les cours uploadés
- Filtres : département, filière, enseignant
- Recherche
- Bouton téléchargement pour chaque cours

---

### 4.3 INTERFACE ENSEIGNANT

#### Page Dashboard
- Vue d'ensemble de ses évaluations
- Cartes avec ses matières et notes moyennes
- Graphique d'évolution temporelle
- Accès rapide aux commentaires

#### Page Détails Évaluation
- Résultats détaillés pour un matière choisi
- Graphiques par question
- Liste des commentaires avec pagination
- Possibilité de filtrer par campagne/période

#### Page Historique Pédagogique
- Graphique courbe multi-périodes
- Tableau comparatif
- Indicateurs de tendance (↑ ↓ →)

#### Page Upload Cours
- Zone drag & drop pour fichiers
- Formulaire : titre, description, matière
- Liste de ses cours uploadés
- Actions : modifier, supprimer

---

### 4.4 INTERFACE ÉTUDIANT

#### Page Dashboard
- Liste des évaluations à compléter (si campagnes actives)
- Résultats agrégés de ses matières
- Accès rapide aux cours

#### Page Remplir Évaluation
- Affichage du questionnaire
- Questions avec étoiles cliquables (interaction visuelle)
- Zones de texte pour commentaires
- Validation avant soumission
- Message de confirmation après envoi

#### Page Résultats Agrégés
- Liste de ses matières avec notes moyennes
- Graphiques de comparaison
- Commentaires anonymisés des autres étudiants

#### Page Mes Cours
- Liste des cours de sa filière
- Filtrage par matière
- Recherche
- Boutons consultation/téléchargement

---

## 5. FLUX MÉTIER COMPLETS

### 5.1 FLUX COMPLET D'UNE CAMPAGNE D'ÉVALUATION

**Phase 1 : Préparation (Admin)**
1. Admin se connecte
2. Import des utilisateurs si pas encore fait (CSV)
3. Création du questionnaire :
    - Questions standardisées
    - Sauvegarde
4. Création de la campagne :
    - Titre : "Évaluation Semestre 1 - 2025"
    - Dates : 15/01/2025 au 31/01/2025
    - Questionnaire : "Standard pédagogique"
    - Cibles : 20 matières du département Info
    - Validation

**Phase 2 : Activation automatique (Système)**
- Le 15/01/2025 à 00h00, la campagne devient active
- Le système identifie tous les étudiants concernés (filières des matières ciblées)
- Notification optionnelle (email/in-app) envoyée aux étudiants

**Phase 3 : Participation (Étudiants)**
- Étudiant se connecte
- Il voit "3 évaluations en attente"
- Il clique sur la première
- Il remplit le questionnaire (étoiles + commentaires)
- Il soumet de manière anonyme
- Confirmation : "Merci, votre évaluation a été prise en compte"
- Il peut consulter les résultats agrégés (après avoir soumis)

**Phase 4 : Monitoring temps réel (Admin + Enseignants)**
- Admin suit la progression :
    - 150 réponses reçues / 300 attendues (50%)
    - Satisfaction moyenne : 4.2/5
    - Participation par filière visible
- Enseignants voient leurs résultats se mettre à jour au fil de l'eau

**Phase 5 : Clôture (Système)**
- Le 31/01/2025 à 23h59, la campagne se clôture automatiquement
- Plus aucune soumission possible
- Résultats finaux figés

**Phase 6 : Exploitation (Enseignants + Admin)**
- Enseignants analysent leurs résultats détaillés
- Admin exporte les données pour rapport institutionnel
- Enseignants consultent leur historique et identifient axes d'amélioration

**Phase 7 : Amélioration continue**
- Enseignant note : "Note faible sur 'Organisation du cours'"
- Il ajuste sa pédagogie pour le semestre suivant
- Lors de la prochaine campagne, il compare les résultats

---

### 5.2 FLUX COMPLET DU PARTAGE DE COURS

**Côté Enseignant**
1. Enseignant crée son support de cours (PDF sur son ordinateur)
2. Il se connecte à la plateforme
3. Section "Mes cours" > "Ajouter un cours"
4. Il remplit :
    - Matière : "Math Avancées"
    - Titre : "Chapitre 3 - Intégrales"
    - Description : "Cours magistral et exercices"
    - Fichier : upload du PDF
5. Validation
6. Le système stocke le fichier sur le serveur
7. Le cours apparaît dans sa liste

**Côté Système**
- Le fichier est stocké de manière sécurisée sur le serveur
- Un chemin d'accès unique est généré
- Les métadonnées sont enregistrées en base
- Les étudiants de la filière "Licence Info L3" sont notifiés (optionnel)

**Côté Étudiant**
1. Étudiant se connecte
2. Section "Mes cours"
3. Il voit "Nouveau cours disponible : Chapitre 3 - Intégrales"
4. Il clique dessus
5. Options :
    - Lire en ligne (PDF s'affiche dans le navigateur)
    - Télécharger (fichier téléchargé sur son ordinateur)

---

## 6. ASPECTS TECHNIQUES FONDAMENTAUX (SANS CODE)

### 6.1 Communication Frontend-Backend

**Modèle requête-réponse** :
- Le frontend envoie des requêtes HTTP au backend
- Le backend traite et renvoie une réponse JSON
- Le frontend affiche les données reçues

**Exemple concret** :
```
Étudiant clique sur "Mes évaluations disponibles"
  → Frontend envoie : GET /campaigns/available
  → Backend reçoit, vérifie le token JWT, identifie l'étudiant, sa filière
  → Backend cherche les campagnes actives pour cette filière
  → Backend renvoie : [{ id: 1, title: "...", ... }, { id: 2, ... }]
  → Frontend affiche la liste à l'écran
```

### 6.2 Stockage des Données

**Base de données relationnelle (PostgreSQL)** :
- Tables structurées : Users, Departments, Filieres, Subjects, Campaigns, Questionnaires, Evaluations, Courses
- Relations entre tables (clés étrangères)
- Requêtes SQL pour lire/écrire/agréger les données

**Stockage fichiers (Serveur local)** :
- Les fichiers de cours ne sont PAS dans la base de données
- Ils sont stockés sur le système de fichiers du serveur
- La base contient juste le chemin du fichier

### 6.3 Sécurité

**Authentification** : Vérifier que l'utilisateur est bien qui il prétend être
**Autorisation** : Vérifier que l'utilisateur a le droit de faire ce qu'il demande
**Anonymat** : Garantir qu'aucune donnée sensible ne peut être reliée
**Validation** : Vérifier que les données reçues sont correctes (pas de valeurs absurdes, pas de failles de sécurité)

---

## 7. BÉNÉFICES DU SYSTÈME

### Pour l'Université
- Données objectives sur la qualité de l'enseignement
- Identification des matières à améliorer
- Prise de décisions éclairées
- Suivi de l'évolution dans le temps

### Pour les Enseignants
- Retours constructifs et anonymes
- Identification claire des points à améliorer
- Suivi de leur progression pédagogique
- Reconnaissance de leurs points forts

### Pour les Étudiants
- Possibilité de s'exprimer librement
- Transparence sur la qualité des matières
- Accès centralisé aux ressources pédagogiques
- Sentiment d'être écouté

---

Ce système constitue un cercle vertueux : les étudiants évaluent → les enseignants s'améliorent → la qualité de l'enseignement augmente → les étudiants en bénéficient.