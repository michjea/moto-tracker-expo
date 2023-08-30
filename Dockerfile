# Utiliser une image de base Node.js
FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 19000 19001

# Démarrer l'application Expo

ENTRYPOINT ["npm", "run"]
CMD ["web"]