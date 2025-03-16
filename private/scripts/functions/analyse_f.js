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
        if (parts.length === 3) { // Il doit y avoir 3 parties
            const gare = parts[0].trim(); // La valeur gare vaut la première partie du split (trim enleve des espace potentiels autour)
            const code_ligne = parseInt(parts[1].trim()); // Récupérer le code ligne
            const pk = parseFloat(parts[2].trim()); // La valeur pk vaut la deuxieme partie du split (trim enleve des espace potentiels autour)

            if (pkMap.has(gare)) { // Si il existe deja dans la map une gare
                let existingArray = pkMap.get(gare); // Récupérer le tableau existant
                existingArray.push({ code_ligne, pk }); // Ajouter un nouvel objet au tableau
            } else {
                pkMap.set(gare, [{ code_ligne, pk }]); // Créer une nouvelle entrée sous forme de tableau
            }
        }
    }

    return pkMap;
}


// Fonction pour choisir le meilleur PK basé sur les gares avant et après
// Prend en entrée les données parsées contenant la gare, l'horaire et les différents pk
// Retourne des données parsées avec un pk séléctionné pour chaque gare
export function getLineContinuity(parsedData) {
    for (let i = 0; i < parsedData.length; i++) {
        let currentEntry = parsedData[i];

        // Si la gare a plusieurs code de ligne, il faut vérifier si il ne faut en garder qu'un seul (traversée d'une gare où plusieurs ligne se rejoignent sans biffurquer vers une autre ligne) ou en garder 2 (biffurcation vers une autre ligne)
        // Pour cela on compare à la gare en amont (si elle existe) et à la gare actuel quel code est commun
        // Puis on compare à la gare en aval (si elle existe) quelle est son code de ligne et on le garde sur la gare (si c'est le même que la gare en amont, on passera juste les opérations)
        if (currentEntry.pk.length > 1) { 
            let filtered_entry = [];

            // Récupérer les codes de ligne de la gare actuelle
            const codeList = new Set(currentEntry.pk.map(entry => entry.code_ligne));

            // Récupérer les gares en amont et en aval si elles existent
            const gare_amont = parsedData[i - 1] || null;
            const gare_aval = parsedData[i + 1] || null;

            // Récupérer les codes de ligne des gares en amont et en aval
            const gare_amont_codes = gare_amont ? gare_amont.pk.map(entry => entry.code_ligne) : [];
            const gare_aval_codes = gare_aval ? gare_aval.pk.map(entry => entry.code_ligne) : [];

            // Trouver les codes de ligne communs avec la gare en amont
            const code_commun_amont = gare_amont_codes.filter(code => codeList.has(code));

            // Trouver les codes de ligne communs avec la gare en aval
            const code_commun_aval = gare_aval_codes.filter(code => codeList.has(code));

            // Étape 1 : Garder l'assignation de la gare amont
            if (code_commun_amont.length > 0) {
                filtered_entry = currentEntry.pk.filter(entry => code_commun_amont.includes(entry.code_ligne));
            }

            // Étape 2 : Si bifurcation, ajouter aussi l'assignation de la gare aval
            if (code_commun_aval.length > 0 && !code_commun_amont.some(code => code_commun_aval.includes(code))) {
                const pk_aval = currentEntry.pk.filter(entry => code_commun_aval.includes(entry.code_ligne));
                filtered_entry.push(...pk_aval);
            }

            // Remplacer les PK de la gare actuelle par ceux sélectionnés
            parsedData[i].pk = filtered_entry;
        }
    }

    return parsedData;
}

// Fonction pour calculer et insérer les vitesses moyennes entre chaque gare
// Prend en entrée les données parsées contenant la gare, l'horaire et le meilleur pk
// Retourne des données parsées avec la vitessse moyenne avec la gare précédente
export function insertAverageSpeeds(parsedData) {
    for (let i = 1; i < parsedData.length; i++) { // Commence à 1 car la première gare n'a pas de précédente
        // Récupérer les lignes des gares i et i-1
        const lignes_gare_i = parsedData[i].pk.map(entry => entry.code_ligne);
        const lignes_gare_amont = parsedData[i-1].pk.map(entry => entry.code_ligne);

        // Transformation en set
        const set_gare_i = new Set(lignes_gare_i);

        // Trouver le code de ligne commun avec la gare en amont
        const code_commun_amont = lignes_gare_amont.filter(code => set_gare_i.has(code));

        if (code_commun_amont.length == 0) { // Il n'y a pas de code de ligne en commun avec la gare en amont, donc la vitesse n'est pas calculée
            parsedData[i].vitesse = "-";
        } else { // Sinon on va faire des calculs de vitesse
            const ligne_commune = code_commun_amont.length > 0 ? code_commun_amont[0] : null;

            // Récupération des pk pour cette ligne commune
            const pkI = parsedData[i].pk.find(entry => entry.code_ligne === ligne_commune)?.pk;
            const pkAmont = parsedData[i-1].pk.find(entry => entry.code_ligne === ligne_commune)?.pk;

            // Récupérer en ms les horaires
            const timeI = parseTime(parsedData[i].horaire);
            const timeAmont = parsedData[i - 1].depart 
                ? parseTime(parsedData[i - 1].depart)  // Si la gare précédente a un horaire de départ, on le prend
                : parseTime(parsedData[i - 1].horaire); // Sinon, on prend l'heure de passage

            // Récupérer la distance et le temps
            const deltaPk = Math.abs(pkI - pkAmont);
            const deltaTimeHour = (timeI - timeAmont)/3600000;

            // Vitesse = distance sur temps. Mais on doit vérifier qu'on a bien des valeurs valides (si le temps vaut 0 alors la vitesse serait infinie)
            if (deltaTimeHour > 0 && !isNaN(deltaPk) && !isNaN(deltaTimeHour)) {
                parsedData[i].vitesse = parseFloat((deltaPk / deltaTimeHour).toFixed(1)); // Arrondi à 1 décimale
            } else {
                parsedData[i].vitesse = "-"; // Si le temps est nul ou qu'il manque des valeurs, on met "-"
            }

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


/*
Fonction de vérification de la variable file récupérée dans /analyse avec la méthode GET

Retourne : 
0 si c'est ok
1 Si fileName est non défini ou un string vide
2 Si c'est un array
3 Si ce n'est pas de la forme [une suite de chiffre].pdf
*/
export function verifyFileName(fileName) {
    const regex = /^[0-9]+\.pdf$/;// Déclaration de la regex pour le test #3
        
    // Vérifier si fileName est conforme
    if (!fileName || fileName === "") { // Vérification si le nom du fichier est spécifié
        return 1;
    }
    else if(Array.isArray(fileName)) { // Est ce que fileName est un array (plusieurs champs field spécifiés dans l'URI)
        return 2;
    }
    else if (!regex.test(fileName)) { // Est ce que la variable field n'est bien constituée que du fichier pdf (protection contre les accès non autorisés)
        return 3;
    }
    else {
        return 0 // Tout est OK
    } 
}