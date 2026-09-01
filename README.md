# Serverless Invoices

A free, open-source invoicing tool for freelancers and small businesses.

Data is stored in your browser — no server required. Run it locally or host it yourself.

Built with [Vue.js](https://vuejs.org/) and [Bootstrap](https://getbootstrap.com/).

> Originally created by [Moku](https://github.com/mokuappio/serverless-invoices). This fork is independently maintained.

## Features

- **Truly serverless** — data stored in your browser only, no network requests
- **No hosting required** — works locally
- **Invoices**
  - Create & manage invoices
  - Track invoices by status and due date
  - Multiple custom taxes, late fees
  - Print to PDF
  - Customizable logo and template (CSS)
  - Duplicate invoices
  - Written-off status tracking
- **Bank accounts**
- **Clients**
  - Create & manage clients
  - Custom fields
  - Client search and ranking
- **Company details**
  - Edit default company details
  - Custom fields
  - Default taxes
- **Dashboard**
  - Quick totals overview
  - Monthly summaries
  - Financial year summaries
  - Customer rankings
- **S3 backup** — automatic JSON backup to AWS S3
- **Export & import** JSON data
- **Dark and light mode**
- **PWA support**
- **Backend adapters**
  - Browser Storage (default)
  - WordPress
  - Custom HTTP API

## Requirements

- Node 16.18+
- Docker (optional, for containerized setup)

## Project Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create app config

```bash
cp src/config/app.config.example.js src/config/app.config.js
```

### 3. Development

```bash
npm run serve
```

### 4. Production build

```bash
npm run build
```

### 5. Lint

```bash
npm run lint
```

## Run with Docker

### Quick start (production build)

```bash
git clone https://github.com/rouralberto/serverless-invoices.git
cd serverless-invoices
docker build . -t serverless-invoices
docker run -p 80:8080 -d --rm serverless-invoices
```

You can add a shell alias for quick access:

```bash
echo "alias serverless-invoices='docker run -p 80:8080 -d --rm serverless-invoices'" >> ~/.zshrc
source ~/.zshrc
```

### Development with Docker Compose

The included `docker-compose.yml` sets up a dev environment with hot reload behind a reverse proxy.

1. Copy and adjust the Vue config:
   ```bash
   cp vue.config.js.example vue.config.js
   ```

2. Create a `docker-compose.override.yml` for your local environment variables (AWS credentials, etc.). See `.env.example` for available variables.

3. Start:
   ```bash
   docker compose up
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VUE_APP_AWS_REGION` | AWS region for S3 backup | — |
| `VUE_APP_AWS_ACCESS_KEY_ID` | AWS access key | — |
| `VUE_APP_AWS_SECRET_ACCESS_KEY` | AWS secret key | — |
| `VUE_APP_BUCKET_NAME` | S3 bucket name | — |

## Configuration Files

| File | Created from | Purpose |
|------|-------------|---------|
| `src/config/app.config.js` | `app.config.example.js` | Storage adapter config |
| `vue.config.js` | `vue.config.js.example` | Dev server & PWA config |
| `docker-compose.override.yml` | — | Local Docker overrides |

## License

MIT — see [LICENSE](LICENSE).
