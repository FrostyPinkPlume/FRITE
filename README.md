# 🚆 FRITE

Fiches Rapides Integrant un Tracé d'Efficacité

FRITE est un outil d’analyse des fiches HOUAT (Horaires Utiles À Tous).  
Il extrait automatiquement les horaires de passage, associe les points kilométriques (PK) aux gares détectées et calcule les vitesses moyennes entre chaque gare.

> **⚠ Avertissement :** Cet outil est **non officiel** et **n'est pas affilié à la SNCF** ni à toute autre entreprise ferroviaire.  
> **Les résultats affichés sont purement informatifs et ne remplacent pas une étude de ligne validée par un professionnel.**  
> Voir la section [Clause de non-responsabilité](#📜-clause-de-non-responsabilité) pour plus de détails.


---

## 📥 Installation et utilisation

### 🐋 Lancer avec Docker (recommandé)

1. **Construire l'image Docker** :
```
docker build -t frostypinkplume/frite
```

2. **Lancer le conteneur** :
```
docker run -p 36088:36088 --name houat-analyzer -d houat-analyzer
```

3. **Connection au serveur**
Ouvrez votre navigateur et entrez \<ip de votre serveur\>:36088

> **À propos de l'hébergement de l'image**
> Je sais que le fait d'avoir à build l'image docker est loin d'être la solution la plus simple, en particulier quand il faut mettre à jour. Mais je souhaite pousser encore le développement avant de pleinement me permettre de poster quelque part l'image.


### **🖥 Lancer en local**
1. **Installer les dépendances** :
```
npm install
```

2. **Créer un environnement Python et installer les dépendances** :
```
python3 -m venv private/scripts/houat_analyzer/venv
source private/scripts/houat_analyzer/venv/bin/activate
pip install -r private/scripts/houat_analyzer/requirements.txt
```

3. **Lancer le serveur** :
```
node server.js
```

4. **Connection au serveur**
Ouvrez votre navigateur et entrez localhost:36088 si c'est en local ou \<ip de votre serveur\>:36088 si vous avez hebergé le site sur un serveur.


---

## 📌 Fonctionnalités

- ✅ Extraction automatique des horaires de passage.
- ✅ Association des gares et PKs (Point Kilométrique).
- ✅ Calcul des vitesses moyennes entre chaque gare.
- ✅ Affichage des résultats dans une interface simple.

- ❓ Corrélation avec les vitesses limites selon la catégorie
- ❓ Association avec les déclivités

- ❌ HTTPS
- ❌ Récupération des infos du train (numéro de train, catégorie, etc...)


---

## 📜 Clause de non-responsabilité

Cet outil est un outil d'analyse non officiel, destiné uniquement à un usage personnel et informatif.
Il n'est en aucun cas affilié à la SNCF ni à toute autre entreprise ferroviaire et n’exploite ni ne revendique leurs marques, logos ou données officielles.

Les données utilisées ne sont ni vérifiées, ni validées, ni approuvées par une quelconque autorité ferroviaire.
Elles proviennent de documents pouvant contenir des erreurs, approximations ou incohérences, et leur traitement est automatisé, sans contrôle humain.

Cet outil ne doit en aucun cas être utilisé à des fins professionnelles, opérationnelles ou réglementaires.
Tout usage des données générées doit être validé par un responsable métier spécialisé en conduite ferroviaire et recoupé avec des études officielles.

L’auteur de cet outil ne pourra être tenu responsable d’aucun dommage, accident ou conséquence découlant de son utilisation.

Pour toute information fiable et à jour, veuillez vous référer aux documents officiels des entreprises ferroviaires.

### Clause en cas de modification, fork ou redistribution

Si cet outil est modifié, forké ou redistribué, que ce soit pour un usage personnel ou un déploiement public, toute responsabilité légale ou technique liée aux versions dérivées incombe entièrement aux personnes ou entités réalisant ces modifications.

L’auteur du projet d’origine ne pourra être tenu responsable des conséquences d’une version modifiée, que ce soit en termes de fonctionnalités, de fiabilité des données, ou d’impact juridique.

Toute personne redistribuant une version modifiée de cet outil devra gérer sa propre clause de non-responsabilité, en s’assurant qu’elle est conforme aux réglementations applicables et aux obligations liées à la licence GNU Affero General Public License (AGPL-3.0).

En modifiant ou redistribuant ce projet, vous reconnaissez que l’auteur d’origine n’a aucune responsabilité quant aux évolutions apportées, à leur impact ou aux conséquences de leur déploiement.


---

## 📝 Licence

Ce projet est distribué sous la licence GNU Affero General Public License (AGPL-3.0).
Cela signifie que toute modification ou utilisation du projet sur un serveur public oblige à publier les modifications sous la même licence.

https://www.gnu.org/licenses/agpl-3.0.fr.html#license-text