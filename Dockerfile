# docker build . -t serverless-invoices
# docker run -p 80:8080 -d serverless-invoices

FROM node:24-alpine

RUN npm install -g http-server

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 8080

# Unknown paths fall back to index.html so client-side routes like /invoices survive a reload.
CMD ["http-server", "dist", "--proxy", "http://localhost:8080?"]
