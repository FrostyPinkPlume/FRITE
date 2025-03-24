// Fonction principale dans la gestion de la colonne de vitesse moyenne par intervalle
function dessinerIntervalles() {
    const limites = $(".limite-immutable").add($(".limite-dynamique")); // récupérer toutes les limites
    
    dessinerPoints();
    dessinerLigne();
    calculsMoyennes(limites);
}

function dessinerPoints() {
    $(".vitesse-colonne").empty(); // Vider le body de la colonne
    $(".limite-dynamique").html("<div class='interval-element dynamic-point'></div>"); // Ajouter un point
    $(".limite-immutable").html("<div class='interval-element static-point'></div>"); // Ajouter une barre verticale
}

function dessinerLigne() {
    const cases = $(".vitesse-colonne"); 

    for (let i = 0; i < cases.length - 1 ; i++) { // Pour chaque case dans la colonne des vitesses d'intervalle ( sauf la derniere ligne)
        const boite = $(cases[i]);
        
        boite.append('<div class="ligne-vitesse" style="height:' + (cases[i].clientHeight + 10) + 'px;"></div>')
    }
}

function calculsMoyennes(limites) {
    for (let i = 1; i < limites.length; i++) { // Pour chaque limite d'intervalle en commençant par la seconde (la premiere limite ne peux pas demander à la précédente ses donénes)
        const derniereLimiteIntervalle = $(limites[i-1]);
        const limiteIntervalle = $(limites[i]);

        const distance = Math.abs(limiteIntervalle.parent().data("km") - derniereLimiteIntervalle.parent().data("km")); // Récupérer la distance a partir des données stockées dans data-km de la ligne (parent de la case de tableau) (Mise en valeur absolue pour éviter les vitesses négatives)
        const temps = (parseTime(limiteIntervalle.parent().data("horaire")) - parseTime(derniereLimiteIntervalle.parent().data("horaire")))/3600000; // Récupère le temps (en heure) entre lmes deux limites

        ajouterLabel(limiteIntervalle, (distance / temps).toFixed(0));
        //console.log((distance / temps).toFixed(1));
    }
}

function ajouterLabel(td, vitesse){
    //td.append('<div class="vitesse-label">' + String(vitesse) + ' km/h</div>');
    td.append('<span>' + String(vitesse) + '</span>')
}

function parseTime(horaire) { // Transforme l'horaire en format "HH.mm" en timestamp
    let [heures, minutes] = String(horaire).split('.').map(Number);
    let date = new Date();
    date.setHours(heures, minutes, 0, 0);
    return date.getTime();
}

$(document).on("click", ".vitesse-colonne", function() {
    if (!$(this).hasClass("limite-immutable")) {
        $(this).toggleClass("limite-dynamique");
        dessinerIntervalles();
    }
});

$(function() {
    $(".vitesse-colonne")

    dessinerIntervalles();
});