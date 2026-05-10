FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8003

CMD ["node", "-r", "dotenv/config", "src/index.js"]