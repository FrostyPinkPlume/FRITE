// Importation des dépendances
import express from 'express';

// Importations relatives a la gestion des fichiers reçus
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { loadPKData,assignOptimalPK,insertAverageSpeeds } from '../scripts/functions/analyse_f.js' // Importe les fonctions relatives a ces routes

import { spawn } from 'child_process'; // Permet l'appel de l'analyseur python


// Constantes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvFilePath = path.join(__dirname, '../../private/data/gares.csv'); // Chemin vers gares.csv pour gestion des PKs

const uploadDir = path.join(__dirname, '../../uploads'); // Chemin vers le dossier de stockage temporaire des fiches HOUAT


// Vérifier si le dossier d'upload existe, sinon le créer
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


const pkData = loadPKData(csvFilePath); // Charger les PKs en mémoire
console.log(`[INFO] Données PK chargées : ${pkData.size} gares avec PK.`);

// Configurer Multer pour stocker temporairement les fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Enregistrer dans /uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Changer le nom du fichier reçu par un nom unique
    }
});
const upload = multer({ storage });


// Creation du routeur
const router = express.Router();


// Routes

// Route POST pour /analyse. Reception des giches HOUAT et analyse
router.post('/', upload.single('houat'), (req, res) => {
    if (!req.file) {
        return res.status(400).send("Aucun fichier reçu.");
    }

    const filePath = req.file.path; // Chemin du fichier sauvegardé

    console.log(`Fichier reçu : ${filePath}`);

    // Rediriger vers la page de résultat (on passera les données plus tard)
    res.redirect(`/analyse?file=${encodeURIComponent(req.file.filename)}`); // Pratique Post -> Redirect -> Get avec le fichier 
});


// Route GET pour /analyse.
router.get('/', async (req, res) => {
    const fileName = req.query.file; // Récupération du nom du fichier

    // Vérifier si fileName est conforme
    if (!fileName) { // Vérification si le nom du fichier est spécifié
        return res.render('pages/analyse', { file: null, data: null });
    }
    if(Array.isArray(fileName)) { // Est ce que fileName est un array (plusieurs champs field spécifiés dans l'URI)
        return res.render('pages/analyse', { file: null, erreur: "Vous ne pouvez précisez qu'une fiche HOUAT à la fois." });
    }
    const regex = /^[0-9]+\.pdf$/;
    if (! regex.test(fileName)) { // Est ce que la variable field n'est bien constituée que du fichier pdf (protection contre les accès non autorisés)
        return res.render('pages/analyse', { file: null, erreur: "La ressource demandée est invalide." });
    }

    // Vérifier si le fichier pdf existe
    if (!fs.existsSync(path.join(uploadDir, fileName))) {
        return res.render('pages/analyse', { file: null, erreur: "Le fichier demandé n'existe pas/plus. Ce site étant encore en développement précoce, votre fichier a peut-être été nettoyé du système lors d'un redéploiement. Veuillez m'en excuser" });
    }

    // Récupérer le chemin vers le fichier
    const filePath = path.join(uploadDir, fileName);

    // Appeler le script Python avec un environnement virtuel python (pour gestion des dépendances)
    const pythonProcess = spawn(
        path.join(__dirname, '../../private/scripts/houat_analyzer/venv/bin/python'), 
        [path.join(__dirname, '../../private/scripts/houat_analyzer/analyze_pdf.py'), filePath]
    );

    // Récupération de la sortie standard du script python
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Récupération de la sortie d'erreur standard du script python
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Erreur Python : ${data}`);
    });

    // Script à la fin du fonctionnement du script python
    pythonProcess.on('close', (code) => {
        // Si le code de sortie n'est pas "OK" (différent de 0)
        if (code !== 0) {
            return res.render('pages/analyse', { file: fileName, data: null });
        }
        
        // Code de sorti est OK, essayer de parser les donner JSON, sinon affiche l'erreur du parsing JSON
        try {
            let parsedData = JSON.parse(output);

            // Associe les gares aux PKs
            parsedData = parsedData
            .map(entry => ({
                ...entry,
                pk: pkData.get(entry.gare) || null  // Associer les PKs si trouvés
            }))
            .filter(entry => entry.pk !== null); // Supprimer les gares sans PK

            // Appel de la fonction d'assignation optimal des PK pour sélectionner parmis les pk lequel est le plus adapté
            parsedData = assignOptimalPK(parsedData);

            // Appliquer les calculs et insérer les vitesses moyennes
            parsedData = insertAverageSpeeds(parsedData);

            res.render('pages/analyse', { file: fileName, data: parsedData });
        } catch (error) {
            console.error("Erreur parsing JSON :", error);
            res.render('pages/analyse', { file: fileName, data: null });
        }
    });
})


// Exportation du routeur à importer dans une application express
export default router;