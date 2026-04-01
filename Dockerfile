FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main.js"]
