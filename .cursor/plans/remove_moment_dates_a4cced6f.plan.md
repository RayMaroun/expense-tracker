---
name: Remove moment dates
overview: Replace moment in the live app with date-fns (and @date-fns/tz only where the business time zone is used), keeping current date math and formatted strings the same. packages/legacy-clients stays on moment.
todos:
  - id: deps
    content: Swap moment for date-fns / @date-fns/tz in live package.json files, lockfile, and the web import map
    status: completed
  - id: shared-dates
    content: Rewrite packages/shared/src/dates.ts with date-fns, preserving local time and moment-style day diffs
    status: completed
  - id: api-routes
    content: Migrate expenses.ts and reports.ts, using @date-fns/tz only for America/Los_Angeles
    status: completed
  - id: web
    content: Format expense dates in app.ts with date-fns and rebuild dist
    status: completed
  - id: verify
    content: Typecheck, test, and confirm the expenses page still renders the same dates
    status: completed
isProject: false
---

# Remove moment from the live app

Moment stays in [packages/legacy-clients](packages/legacy-clients) (untouched, still in the lockfile). Live code in shared, api, and web switches to `date-fns` v4. `@date-fns/tz` is used only for `America/Los_Angeles` in the reports route. Helpers that are local today stay local, so outputs do not shift when the server zone is not Los Angeles.

## Dependencies and import map

- [packages/shared/package.json](packages/shared/package.json): drop `moment`, add `date-fns`.
- [packages/api/package.json](packages/api/package.json): drop `moment` and `moment-timezone`, add `date-fns` and `@date-fns/tz`.
- [packages/web/package.json](packages/web/package.json): drop `moment`, add `date-fns`.
- Run `npm install` at the repo root so [package-lock.json](package-lock.json) updates. `moment` remains only because legacy-clients depends on it.
- [packages/web/index.html](packages/web/index.html) import map: remove the `moment` esm.sh URL and add `date-fns` at the same version npm installs (browser loads [packages/web/dist/app.js](packages/web/dist/app.js) with no bundler).

## [packages/shared/src/dates.ts](packages/shared/src/dates.ts)

Same function names and local-time meaning. Format tokens:

- `YYYY-MM-DD` → `yyyy-MM-dd`
- `MMMM D, YYYY` → `MMMM d, yyyy`
- `startOf("month")` / `endOf("month")` → `startOfMonth` / `endOfMonth` (return `Date`, including `23:59:59.999` at month end)
- `isSame(..., "month")` → `isSameMonth`

`daysBetween` stays a truncated count of 24-hour periods (`differenceInMilliseconds` / `86_400_000`, toward zero, matching `moment#diff(..., "days")`). `differenceInDays` would change `GET /reports/monthly`'s `days` whenever the Los Angeles end-of-month instant falls on the next local calendar day.

`today()` returns `new Date()` (nothing in the live app calls it). Signatures that are rewritten drop `any` in favor of `Date | string | number`.

## [packages/api/src/routes/expenses.ts](packages/api/src/routes/expenses.ts)

- Month filter: `format(date, "yyyy-MM")` on the stored date (local), same as `moment(e.date).format("YYYY-MM")`.
- `POST`: falsy `body.date` is now (`new Date()`); otherwise `parseISO`. Persist `toISOString()`, same as `moment(...).toISOString()`.
- `GET /:id`: `format(..., "EEEE, MMMM do yyyy")` for `dddd, MMMM Do YYYY` (English ordinals, no extra comma).

## [packages/api/src/routes/reports.ts](packages/api/src/routes/reports.ts)

Keep `BUSINESS_TZ = "America/Los_Angeles"` and use `tz()` / `TZDate` from `@date-fns/tz`.

- Default month: `format(new Date(), "yyyy-MM", { in: tz(BUSINESS_TZ) })`.
- Month bounds: build the 1st of that month **in Los Angeles** with `new TZDate(year, monthIndex, 1, BUSINESS_TZ)`, then `startOfMonth` / `endOfMonth`. Do not `parseISO("YYYY-MM-01")` first; that parses as local midnight and can land in the previous Los Angeles month.
- Inclusive range: `isWithinInterval` (same as `isBetween(..., "[]")` at millisecond precision). Stored `YYYY-MM-DD` values stay local instants, as `moment(e.date)` does today.
- `from` / `to` strings: format a plain `Date` (`new Date(instant)`), i.e. the server local calendar date. `moment(from).format` drops the zone; formatting the `TZDate` directly would print the Los Angeles date instead.
- `days` stays `daysBetween(from, to) + 1`.
- Last N days: `startOfDay(subDays(now, n, { in: zone }), { in: zone })`, strict `isAfter`, and `since` formatted on that zoned value so the calendar date stays Los Angeles (the cutoff moment is zoned today).

## [packages/web/src/app.ts](packages/web/src/app.ts)

`format(parseISO(item.date), "EEE, MMM d")` for `ddd, MMM D` (for example `Wed, Sep 2`). API dates are already `YYYY-MM-DD` from `formatDate`.

Do not edit `dist/` by hand. `tsc -b` rewrites the tracked [packages/web/dist/app.js](packages/web/dist/app.js).

## Checks

- `npm run typecheck` and `npm test` (no package test scripts today; the root script no-ops).
- Load the expenses page and confirm September 2026 rows still show short dates and the same totals. Invalid dates will throw from `format` where moment returned the string `"Invalid date"`; live data is valid `YYYY-MM-DD`.
