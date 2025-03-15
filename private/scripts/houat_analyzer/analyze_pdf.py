import sys
import json
import pdfplumber
import re

def extract_schedule(pdf_path):
    data = []
    last_explicit_station = None  # Dernière gare nommée explicitement (non "-")
    first_entry = None  # Première gare à inclure
    last_entry = None  # Dernière gare à inclure
    seen_stations = set()  # Pour éviter les doublons

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                lines = text.split("\n")
                for line in lines:
                    parts = line.split()
                    
                    if len(parts) < 4:
                        continue  # Trop court pour être une ligne valide

                    # Trouver les parties via une regex qui prend les gares avec espaces
                    match = re.match(r"^(.+?)(?:\s\(.+\))?\s+(\S{2})\s+(?:\S{2,3})\s+(\d{2}\.\d{2})(?:\s+(\d{2}\.\d{2}))?(?:\s\[.\])?(?:\sr\d)?$", line)
                    if not match:
                        continue
                    
                    gare, point, horaire, depart = match.groups()

                    if depart is not None:
                        print(f"Départ trouvé : {depart}")

                    # Si c'est un "-", on le remplace par la dernière gare explicite connue
                    if gare == "-":
                        if last_explicit_station:
                            gare = last_explicit_station
                        else:
                            continue  # Si aucune gare explicite avant, on ignore

                    # Mettre à jour la dernière gare explicite rencontrée
                    last_explicit_station = gare

                    # Stocker la première et dernière ligne indépendamment des critères BV/00
                    entry = {"gare": gare, "horaire": horaire, "depart": depart}
                    if first_entry is None:
                        first_entry = entry
                    last_entry = entry  # Toujours écrasé pour obtenir la dernière

                    # Vérifier si on garde cette gare (uniquement "BV" ou "00")
                    if point in ["BV", "00"] or depart is not None:
                        if gare not in seen_stations:
                            data.append(entry)
                            seen_stations.add(gare)

    # Ajouter la première et dernière gare indépendamment des critères BV/00
    if first_entry and first_entry["gare"] not in seen_stations:
        data.insert(0, first_entry)
        seen_stations.add(first_entry["gare"])
    if last_entry and last_entry["gare"] not in seen_stations:
        data.append(last_entry)
        seen_stations.add(last_entry["gare"])

    return data

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Aucun fichier fourni"}))
        sys.exit(1)

    pdf_file = sys.argv[1]
    horaires = extract_schedule(pdf_file)

    print(json.dumps(horaires))
    sys.exit(0)
