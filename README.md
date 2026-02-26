# Electro-Mart

> Full-stack e-commerce demo (Express + Vite + React + Drizzle)
 Team :
    N. Samhitha 
    M. Raajitha Krishna
    N. Harish 
    M. Sashank

## Overview

This repository contains a full-stack sample application named Electro-Mart. It includes a Node/Express backend (TypeScript) and a Vite-powered React frontend under `client/`.

## Deployed Link

https://electro-mart--samhithanalamat.replit.app/admin

## Requirements

- Node.js (v18+ recommended)
- PostgreSQL (if using the local DB features)

## Install

Install dependencies from the project root:

```bash
npm install
```

## Development

Run the server in development mode (uses `tsx`):

```bash
npm run dev
```

This runs the backend in development. The frontend is located in `client/` and is Vite-based; open a second terminal and from `client/` run the appropriate dev command if needed.

## Build & Start

Build the project:

```bash
npm run build
```

Start the production server (after build):

```bash
npm run start
```

## Database

If using Drizzle, push migrations/schema with:

```bash
npm run db:push
```

## Other useful scripts

- `npm run check` — TypeScript type check

## Project Structure (high level)

- `server/` — Express server entry and API
- `client/` — React + Vite frontend
- `script/` — build helpers
- `shared/` — shared routes and schema definitions

## Contributing

Feel free to open issues or PRs. Keep changes focused and run the dev server to verify behavior.

## License

MIT
