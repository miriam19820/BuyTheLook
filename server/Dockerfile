# 1. שימוש בתמונת בסיס קלה ומהירה של Node.js
FROM node:20-alpine

WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .

EXPOSE 3000


CMD ["npm", "run", "dev"]