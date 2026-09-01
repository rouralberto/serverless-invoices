# docker build . -t serverless-invoices
# docker run -p 80:8080 -d serverless-invoices

FROM node:16

RUN npm install -g http-server

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY src/config/app.config.example.js ./src/config/app.config.js

RUN npm run build

EXPOSE 8080

CMD ["http-server", "dist"]
