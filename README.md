# Expense Tracker

A small monorepo: a shared library, an HTTP API, and a web page that lists expenses.

```
packages/shared   types, money helpers, date helpers   (used by api and web)
packages/api      Express HTTP API
packages/web      a plain HTML page that calls the api
packages/legacy-clients   partner API clients and reconciliation reports
```

## Run it

```bash
npm install
npm run typecheck
npm run api      # http://localhost:3000/expenses
npm run web      # http://localhost:5173
```

## Scripts

- `npm run typecheck` compiles every package without emitting files.
