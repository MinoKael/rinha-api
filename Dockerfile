FROM node:21-alpine

WORKDIR /app

COPY . .

EXPOSE 3000

RUN npm install

CMD ["node", "main.js"]
