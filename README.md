# Stealth Scraper SaaS

A backend service for scraping web pages, built with NestJS, BullMQ, Prisma, and Playwright. It has an optional stealth mode that tries to reduce detection by anti-bot systems.

## How it works

1. A client submits a scrape request (`POST /tasks`) with a target URL, a scrape type (`FAST` or `STEALTH`), and optional CSS selectors to extract specific content.
2. The task is persisted in PostgreSQL and queued in Redis via BullMQ.
3. A background worker picks up the job, launches a headless Chromium browser (via Playwright + `playwright-extra` with the stealth plugin), navigates to the URL, and simulates basic human-like scrolling.
4. The raw HTML is stored, and if CSS selectors were provided, matching content is extracted with Cheerio and saved as structured data.
5. Clients poll `GET /tasks/:id` to retrieve the task status and result.

## Tech stack

- NestJS (TypeScript): API framework
- BullMQ + Redis: job queue
- Prisma + PostgreSQL: persistence
- Playwright + playwright-extra (stealth plugin): headless browser automation
- Cheerio: HTML parsing / CSS selector extraction
- Swagger: API documentation

## Getting started

### Prerequisites

- Node.js 20+
- pnpm
- Docker (for PostgreSQL and Redis)

### 1. Clone the repository

```bash
git clone git@github.com:linuxhacker228/Stealth_scraper_saas.git
cd Stealth_scraper_saas
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=scraper_db
```

Create a `.env` file in `backend/`:

```
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/scraper_db?schema=public"
```

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL (port 5432) and Redis (port 6379).

### 4. Install dependencies

```bash
cd backend
pnpm install
npx playwright install chromium
```

### 5. Run database migrations

```bash
npx prisma migrate deploy
```

### 6. Start the server

```bash
pnpm run start:dev
```

The API will be available at `http://localhost:3000`.
Interactive API docs (Swagger): `http://localhost:3000/api/docs`

## API

### Create a scrape task

```
POST /tasks
Content-Type: application/json
```

```json
{
  "url": "https://example.com",
  "type": "FAST",
  "options": {
    "pageTitle": "title"
  }
}
```

- `url`: target page to scrape.
- `type`: `FAST` or `STEALTH`.
- `options` *(optional)*: a map of result keys to CSS selectors, used to extract specific text content from the page.

Response:

```json
{ "taskId": "...", "status": "PENDING", "success": true }
```

### Get task status/result

```
GET /tasks/:id
```

Response (once completed):

```json
{
  "id": "...",
  "url": "https://example.com",
  "status": "COMPLETED",
  "type": "FAST",
  "result": {
    "statusCode": 200,
    "rawHtml": "...",
    "parsedData": { "pageTitle": "Example Domain" }
  }
}
```

## Scripts

| Command | Description |
|---|---|
| `pnpm run start:dev` | Start in watch mode |
| `pnpm run build` | Compile for production |
| `pnpm run start:prod` | Run compiled build |
| `pnpm run test` | Run unit tests |
| `pnpm run test:e2e` | Run e2e tests |
| `pnpm run lint` | Lint and autofix |

## Project status

This project is under active development.
