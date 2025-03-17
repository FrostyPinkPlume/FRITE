// Dépendances
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Constantes
const __filename = fileURLToPath(import.meta.url); // Récupérer __filename en ES Modules pour la ligne suivante
const __dirname = path.dirname(__filename); // Récupérer __dirname en ES Modules

const cacheRepository = path.join(__dirname, '../../../cache/');

// Fonction pour vérifier si un cache existe deja pour un nom de fichier donné en entrée
// Répond par true ou false
export function doCacheExist(filename) {  
    return fs.existsSync(path.join(cacheRepository, filename + '.cache'));
}

export function writeInCache(filename, data){
    try {
        // Vérifie si le répertoire existe, sinon le crée
        if (!fs.existsSync(cacheRepository)) {
            fs.mkdirSync(cacheRepository, { recursive: true }); // Crée récursivement le dossier
        }

        // Écrit dans le fichier
        fs.writeFileSync(
                path.join(cacheRepository, filename + '.cache'), // cach
                JSON.stringify(data), // Données mise en JSON
                'utf-8' // Encodage
        )
        return 0;
    } catch {
        return null;
    }
}

export function getInCache(filename) {
    try {
        return JSON.parse(fs.readFileSync(
                path.join(cacheRepository, filename + '.cache'),
                'utf-8' // Encodage
        ));
    } catch (err) {
        return null;
    }
}