// Import de express
import express from 'express';

// Creation du routeur
const router = express.Router();

router.get('/', async (req, res) => {
    // Sélectionner un message aléatoire
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    res.render('pages/index', { message: randomMessage });
})

// Exportation du routeur à importer dans une application express
export default router;

// Liste de textes possibles
const messages = [
    "Rouler esprit tranquil !", // Captrain
    "À l'heure sans sablière noire", // Outerwilds
    "A", // Gawr Gura
    "Ride on time",
    "À notre bon plaisir !", // CDL 63
    "Depuis pas longtemps",
    "Pas le temps d'expliquer", // A hat in time
    "With a Little Help from my Friends", // Cyberpunk 2077
    "Attention à Trévor", // GTA 5
    "All we had to do, was follow the damn train CJ!", // GTA san andreas
    "Ce n'est pas pour l'or, mais pour la gloire", // Sea of thieves
    "Country roads, take me home", 
    "Roche et pierre", // DRG ⚒️
    "C'est rasoir", // half life (razor train)
    "De Valadilène à Syberia", // Syberia
    "Drift interdit", // Train drift
    "Sur les voies spirituelles", // Zelda
    "On a rail", // Minecraft
    "En exode, mais sans metro", // Metro exodus
    "La fièvre du transport", // Transport fever
    "Les villes à l'horizon", // Cities skyline
    "Pour les chiots et les chatons", // Satisfactory
    "Un train passe à Stardew Valley", // Stardew valley
    "Trans-Factorio express", // Factorio
];