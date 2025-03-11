// Import de express
import express from 'express';

// Creation du routeur
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('pages/index');
})

// Exportation du routeur à importer dans une application express
export default router;