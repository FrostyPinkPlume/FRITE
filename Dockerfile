# Utiliser une image Node.js légère
FROM node:18-alpine

# Installer Python 3 et les dépendances
RUN apk add --no-cache python3 py3-pip

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers nécessaires
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copier le reste des fichiers
COPY . .

# Installer les dépendances Python
RUN pip3 install --no-cache-dir -r private/scripts/houat_analyzer/requirements.txt

# Exposer le port utilisé par ton serveur
EXPOSE 36088

# Lancer l'application
CMD ["node", "server.js"]
