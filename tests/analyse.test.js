import { verifyFileName, loadPKData, getLineContinuity, insertAverageSpeeds } from "../private/scripts/functions/analyse_f.js";

describe("verifyFileName", () => {
    test("Retourne 1 si fileName est null ou vide", () => {
        expect(verifyFileName(null)).toBe(1);
        expect(verifyFileName("")).toBe(1);
    });

    test("Retourne 2 si fileName est un array", () => {
        expect(verifyFileName(["123.pdf", "456.pdf"])).toBe(2);
    });

    test("Retourne 3 si fileName n'est pas valide", () => {
        expect(verifyFileName("test.pdf")).toBe(3);
        expect(verifyFileName("123.txt")).toBe(3);
        expect(verifyFileName("coucou")).toBe(3);
    });

    test("Retourne 0 si fileName est valide", () => {
        expect(verifyFileName("123.pdf")).toBe(0);
    });
});




// Déclaration des sets de données pour le test suivant
const setA = [ // Une gare simple, une gare avec une bifurcation sans la prendre, une gare simple
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },  // Une seule ligne à cette gare
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }, { code_ligne: 2, pk: 16 }] }, // Traversée de gare de jonction avec une autre ligne
    { gare: "C", pk: [{ code_ligne: 1, pk: 20 }] }  // Retour à une seule ligne à cette gare
];

const setB = [ // Une gare simple, une gare avec plusieurs bifurcations sans la prendre, une gare simple
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },  // Une seule ligne à cette gare
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }, { code_ligne: 2, pk: 16 }, { code_ligne: 3, pk: 0 }, { code_ligne: 4, pk: 254.3 }] }, // Traversée de gare de jonction avec plusieurs autres lignes
    { gare: "C", pk: [{ code_ligne: 1, pk: 20 }] }  // Retour à une seule ligne à cette gare
];

const setC = [ // Une gare simple, une gare avec une bifurcation en la prenant, une gare simple
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },  // Une seule ligne à cette gare
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }, { code_ligne: 2, pk: 146 }] }, // Prise de bifurcation à une gare avec une biffurcation
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }] }  // Retour à une seule ligne à cette gare sur le meme code de ligne que la biffurcation
];

const setD = [ // Une gare simple, une gare avec une bifurcation en la prenant, une gare simple
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },  // Une seule ligne à cette gare
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }, { code_ligne: 2, pk: 146 }, { code_ligne: 3, pk: 0 }] }, // Prise de bifurcation à une gare avec plusieurs biffurcations
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }] }  // Retour à une seule ligne à cette gare sur le meme code de ligne que la biffurcation
];

const setE = [ // Que des gares avec biffurcations
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }, { code_ligne: 3, pk: 58 }] },  // Une gare avec une jonction en amont
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }, { code_ligne: 2, pk: 146 }] }, // Prise de bifurcation à une gare avec une biffurcation
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }, { code_ligne: 4, pk: 0 }] }  // Une gare avec une jonction en aval
];

const setF = [ // Biffurcation hors gare
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },  // Gare normale
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }] }, // Gare normale
    // On peut imaginer une biffurcation qui ne se fait pas en gare, dans ce cas, il n'y a pas de code de ligne en commun avec les gares
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }] },  // Gare normale
    { gare: "D", pk: [{ code_ligne: 2, pk: 142 }] }  // Gare normale
]

const setG = [ // Biffurcation hors gare mais la gare précédent est une gare de jonction de plusieurs lignes
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },  // Gare normale
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }, { code_ligne: 4, pk: 0 }] }, // Gare de jonction
    // On peut imaginer une biffurcation qui ne se fait pas en gare, dans ce cas, il n'y a pas de code de ligne en commun avec les gares
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }] },  // Gare normale
    { gare: "D", pk: [{ code_ligne: 2, pk: 142 }] }  // Gare normale
]

const setH = [ // Biffurcation hors gare mais la gare précédent et suivant la biffurcation sont des gares de jonction de plusieurs lignes
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },  // Gare normale
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }, { code_ligne: 4, pk: 0 }] }, // Gare de jonction
    // On peut imaginer une biffurcation qui ne se fait pas en gare, dans ce cas, il n'y a pas de code de ligne en commun avec les gares
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }, { code_ligne: 3, pk: 58 }] },  // Gare de jonction
    { gare: "D", pk: [{ code_ligne: 2, pk: 142 }] }  // Gare normale
]


// Déclaration des résultats attendus pour le test suivant
const expectedA = [
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }] }, // Garde la continuité sur la ligne 1
    { gare: "C", pk: [{ code_ligne: 1, pk: 20 }] }
];

const expectedB = [
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }] }, // Garde la continuité sur la ligne 1
    { gare: "C", pk: [{ code_ligne: 1, pk: 20 }] }
];

const expectedC = [
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }, { code_ligne: 2, pk: 146 }] }, // Passe sur la ligne 2
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }] }
];

const expectedD = [
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }, { code_ligne: 2, pk: 146 }] }, // Passe sur la ligne 2, ne pas garder la ligne 3
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }] }
];

const expectedE = [
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] }, // Garde une seule ligne
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }, { code_ligne: 2, pk: 146 }] }, // Change pour la ligne 2
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }] }  // Continue sur la ligne 2
];

const expectedF = [
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },  // Gare normale
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }] }, // Gare normale
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }] },  // Gare normale, rien ne doit avoir changé
    { gare: "D", pk: [{ code_ligne: 2, pk: 142 }] }  // Gare normale
];

const expectedG = [
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },  // Gare normale
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }] }, // Gare de jonction mais l'algo doit uniquement avoir pris la valeur en commun donc avec la gare en amont mais pas en aval
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }] },  // Gare normale
    { gare: "D", pk: [{ code_ligne: 2, pk: 142 }] }  // Gare normale
];

const expectedH = [
    { gare: "A", pk: [{ code_ligne: 1, pk: 10 }] },  // Gare normale
    { gare: "B", pk: [{ code_ligne: 1, pk: 15 }] }, // Gare de jonction mais l'algo doit uniquement avoir pris la valeur en commun donc avec la gare en amont mais pas en aval
    { gare: "C", pk: [{ code_ligne: 2, pk: 150 }] },  // Gare de jonction, pareil que pour la précédent, on ne se rattache qu'à ce que l'on connait
    { gare: "D", pk: [{ code_ligne: 2, pk: 142 }] }  // Gare normale
];

describe("verifyLineContinuity", () => {
    test("setA - Traverse une jonction sans bifurquer", () => {
        expect(getLineContinuity([...setA])).toEqual(expectedA);
    });

    test("setB - Traverse une jonction avec plusieurs lignes sans bifurquer", () => {
        expect(getLineContinuity([...setB])).toEqual(expectedB);
    });

    test("setC - Prise de biffurcation simple", () => {
        expect(getLineContinuity([...setC])).toEqual(expectedC);
    });

    test("setD - Prise de biffurcation à une gare avec une multitude de biffurcation", () => {
        expect(getLineContinuity([...setD])).toEqual(expectedD);
    });

    test("setE - Prise de biffurcation à une gare entourée de gares avec des biffurcations", () => {
        expect(getLineContinuity([...setE])).toEqual(expectedE);
    });

    test("setF - Prise de biffurcation hors gare sans gare de jonction", () => {
        expect(getLineContinuity([...setF])).toEqual(expectedF);
    });

    test("setG - Prise de biffurcation hors gare avec une gare de jonction en amont", () => {
        expect(getLineContinuity([...setG])).toEqual(expectedG);
    });

    test("setH - Prise de biffurcation hors gare avec une gare de jonction en amont et en aval", () => {
        expect(getLineContinuity([...setH])).toEqual(expectedH);
    });
});