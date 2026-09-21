# Architecture notes

## Package boundaries
- `packages/shared` is the only place that knows about money and date formats.
  `api` and `web` call it. They never format dates or money themselves.
- `packages/api` owns the HTTP routes and the in-memory data. It imports from `shared`.
- `packages/web` renders what the API returns. It imports formatting helpers from `shared`.

## Money
- All money is integer cents end to end: `1250` means $12.50.
- The API returns cents. The web page formats them with `formatCents` for display.
- Input from a form or request body is converted once, at the edge, with `dollarsToCents`.

## Dates
- Dates travel across the API as ISO strings (`2026-09-02`).
- Parse with `parseISO` where a `Date` is needed. Format with `format(date, "yyyy-MM-dd")` for output.
- Never send a `Date` object or a timestamp over the API.

## Things that have gone wrong before
- Formatting money in a route handler instead of `shared`, so two routes rounded differently.
- Comparing dates as strings across time zones. Parse first.
