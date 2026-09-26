# Recurring expenses

## Goal
A user can create an expense that repeats monthly and see its occurrences in the monthly list and the monthly report like any other expense.

## Decisions
- One recurring template is stored. Occurrences are computed on demand when a month is listed or reported. No future rows are written.
- Cadence: monthly, on a day of month (1 to 31). Days past the end of a month clamp to the last day.
- Optional `endDate` (YYYY-MM-DD). Absent means indefinite. No occurrences before `startDate`.
- New resource: `POST /recurring` { description, amountCents, category, dayOfMonth, startDate, endDate? } and `GET /recurring`.
- `GET /expenses?month=YYYY-MM` merges occurrences with regular expenses. Occurrence id is `<templateId>-<YYYY-MM>`, with `recurring: true`.
- `GET /reports/monthly` includes occurrences.

## Conventions
Money in integer cents. Dates as YYYY-MM-DD strings on the API. Business time zone America/Los_Angeles. Error shape { error: { code, message } }. Validate input, 400 on bad input. Test file next to every new route (node:test). No new dependencies. No new `any`.

## Out of scope
Editing or deleting templates. Web page changes. Weekly or yearly cadence.
