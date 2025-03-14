import { verifyFileName, loadPKData, assignOptimalPK, insertAverageSpeeds } from "../private/scripts/functions/analyse_f.js";

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