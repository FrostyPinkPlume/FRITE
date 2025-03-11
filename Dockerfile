# Utiliser une image Node.js légère
FROM node:18-alpine

# Installer Python 3 et pip
RUN apk add --no-cache python3 py3-pip

# Créer un environnement virtuel Python
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Installer les dépendances Python dans le venv
COPY private/scripts/houat_analyzer/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers nécessaires
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copier le reste des fichiers
COPY . .

# Exposer le port utilisé par ton serveur
EXPOSE 36088

# Lancer l'application
CMD ["node", "server.js"]
