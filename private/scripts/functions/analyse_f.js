import fs from 'fs';

// Chargement des points kilométriques dans une Map.
// Prend en entré le chemin vers le csv gares.csv
// Ressort une map des gares et leurs différents pks. Cette map a en clé le nom de la gare et en valeur un array contenant les différents PK associés à la gare
export function loadPKData(csvFilePath) {
    const pkMap = new Map();
    const data = fs.readFileSync(csvFilePath, 'utf8'); // Lecture du fichier gares.csv
    const lines = data.split('\n'); // Récupération des données ligne par ligne

    for (const line of lines) { // Pour chaque ligne
        const parts = line.split(';'); // Couper la ligne au  niveau du ";"
        if (parts.length === 2) { // Il doit y avoir 2 parties
            const gare = parts[0].trim(); // La valeur gare vaut la première partie du split (trim enleve des espace potentiels autour)
            const pk = parseFloat(parts[1].trim()); // La valeur pk vaut la deuxieme partie du split (trim enleve des espace potentiels autour)

            if (pkMap.has(gare)) { // Si il existe deja dans la map une gare
                pkMap.get(gare).push(pk); // Ajouter un PK existant à la liste
            } else {
                pkMap.set(gare, [pk]); // Créer une nouvelle entrée avec un tableau.
            }
        }
    }

    return pkMap;
}


// Fonction pour choisir le meilleur PK basé sur les gares avant et après
// Prend en entrée les données parsées contenant la gare, l'horaire et les différents pk
// Retourne des données parsées avec un pk séléctionné pour chaque gare
export function assignOptimalPK(parsedData) {
    for (let i = 0; i < parsedData.length; i++) {
        let currentEntry = parsedData[i];

        // Si la gare a plusieurs PKs, on doit choisir le plus proche
        if (Array.isArray(currentEntry.pk) && currentEntry.pk.length > 1) {
            let pkList = currentEntry.pk;

            // PK de la gare précédente (si dispo)
            let pkBefore = i > 0 ? parsedData[i - 1].pk : null;
            pkBefore = Array.isArray(pkBefore) ? pkBefore[0] : pkBefore; // Si plusieurs PKs, on prend le premier

            // PK de la gare suivante (si dispo)
            let pkAfter = i < parsedData.length - 1 ? parsedData[i + 1].pk : null;
            pkAfter = Array.isArray(pkAfter) ? pkAfter[0] : pkAfter; // Si plusieurs PKs, on prend le premier

            // Trouver le PK le plus proche entre `pkBefore` et `pkAfter`
            let bestPK = pkList[0]; // Par défaut, on prend le premier

            if (pkBefore !== null && pkAfter !== null) {
                // Chercher le PK le plus proche des deux bornes
                bestPK = pkList.reduce((prev, curr) =>
                    (Math.abs(curr - pkBefore) < Math.abs(prev - pkBefore) ||
                     Math.abs(curr - pkAfter) < Math.abs(prev - pkAfter)) ? curr : prev
                );
            } else if (pkBefore !== null) {
                // Se fier uniquement au PK avant si après n'existe pas
                bestPK = pkList.reduce((prev, curr) =>
                    Math.abs(curr - pkBefore) < Math.abs(prev - pkBefore) ? curr : prev
                );
            } else if (pkAfter !== null) {
                // Se fier uniquement au PK après si avant n'existe pas
                bestPK = pkList.reduce((prev, curr) =>
                    Math.abs(curr - pkAfter) < Math.abs(prev - pkAfter) ? curr : prev
                );
            }

            // Remplacer la liste de PKs par le meilleur choix
            currentEntry.pk = bestPK;
        }
    }

    return parsedData;
}

// Fonction pour calculer et insérer les vitesses moyennes entre chaque gare
// Prend en entrée les données parsées contenant la gare, l'horaire et le meilleur pk
// Retourne des données parsées avec la vitessse moyenne avec la gare précédente
export function insertAverageSpeeds(parsedData) {
    for (let i = 1; i < parsedData.length; i++) { // Commence à 1 car la première gare n'a pas de précédente
        let gareA = parsedData[i - 1];
        let gareB = parsedData[i];

        // Vérifier que les PKs et horaires sont bien définis
        if (gareA.pk !== null && gareB.pk !== null && gareA.horaire && gareB.horaire) {
            let pkA = gareA.pk;
            let pkB = gareB.pk;

            let timeA = parseTime(gareA.horaire);
            let timeB = parseTime(gareB.horaire);

            let deltaPK = Math.abs(pkB - pkA); // Distance en km
            let deltaTime = (timeB - timeA) / 3600000; // Temps en heures

            if (deltaTime > 0) {
                gareB.vitesse = (deltaPK / deltaTime).toFixed(1) + " km/h"; // Ajouter vitesse à la gare B
            } else {
                gareB.vitesse = "-"; // Cas où la durée est nulle
            }
        } else {
            gareB.vitesse = "-"; // Cas où des données sont manquantes
        }
    }

    // La première gare n'a pas de vitesse, on met un tiret
    parsedData[0].vitesse = "-";

    return parsedData;
}


// Fonction pour convertir l'horaire (hh.mm) en timestamp
function parseTime(horaire) {
    let [heures, minutes] = horaire.split('.').map(Number);
    let date = new Date();
    date.setHours(heures, minutes, 0, 0);
    return date.getTime();
}