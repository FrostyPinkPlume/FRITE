// Créer une ligne de tableau
export function table_line(gare, horaire, pk, vitesse, is_debug = false, is_static_point = false, point_pos = "") {
    let line = ""; // Valeur qui contiendra toute la ligne du tableau
    line += `<tr data-km=${pk[0]["pk"]} data-horaire=${horaire}>`; // Ouverture de la balise tr (ligne) avec les valeurs pour le calcul d'intervalles
    line += `<td>${gare}</td>`; // Case pour le nom de la gare
    line += `<td>${horaire}</td>`; // Case pour l'horaire

    // Gestion de la valeur pk qui doit etre de la forme [{code_ligne: X, pk: Y}] avec la structure entre crochet pouvant être reprise à plusieurs reprises
    line += `<td>`; // Ouverture de la balise pour la case des pks
    pk.forEach(localisation_gare => { // Pour chaque entrée dans la localisation de la gare pour cette ligne
        line += `<div>${is_debug ? "Ligne " + localisation_gare.code_ligne : ""} km${localisation_gare.pk}</div>`;
    });
    line += `</td>`; // Fermeture de la balise pour la case des pks

    line += `<td class="topAlignment">${vitesse !== "-" ? vitesse + " km/h" : "-"}</td>`; // Case pour la vitesse. Affiche - si rien
    line += `<td class="vitesse-colonne ${is_static_point ? "limite-immutable " + point_pos : ""} topAlignment"></td>`;
    line += "</tr>";

    return line;
}