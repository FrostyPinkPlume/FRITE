// Dépendances
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';


// Déclaration de constantes
const port = 36088; // Port d'écoute HTTP

const __filename = fileURLToPath(import.meta.url); // Récupérer __filename en ES Modules pour la ligne suivante
const __dirname = path.dirname(__filename); // Récupérer __dirname en ES Modules

const app = express(); // Déclaration express


// Indiquer l'utilsiation d'EJS à express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'private', 'views')); // Spécifier le répertoire où se trouvent les vues


// Importation des routes
import indexRoutes from './private/routes/index.js';
import analyseRoutes from './private/routes/analyse.js';


// Importation des middleware
app.use(express.json()); // Activer le parsing json des requetes
app.use('/assets',express.static('public')); // Rendre public le repertoire "public" pour accès (images, style, scripts)

app.use(express.urlencoded({ extended: true })); // Gérer les fichiers correctement


// Journalisation
app.set('trust proxy', true); // Permet d'utiliser X-Forwarded-For

app.use((req, res, next) => {
    const start = Date.now(); // Pour calculer le temps de traitement
    res.on('finish', () => {
        const duration = Date.now() - start;
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
        const userName = '-';
        console.log(
            `${clientIp} - ${userName} [${new Date().toISOString()}] "${req.method} ${req.originalUrl} ${req.protocol}" ${res.statusCode} - ${duration}ms`
        );
    });
    next();
});


// Routes
app.use('/',indexRoutes);
app.use('/analyse',analyseRoutes);

// Peties routes
app.get('/about', async (req, res) => {
    res.render('pages/about');
})

// Activation du service web
app.listen(port, () => {
    console.log(new Date().toISOString()+` : running ${port}`);
})