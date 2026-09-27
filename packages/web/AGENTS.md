# Web package

This package is plain TypeScript with no framework. Do not introduce React, Vue or any bundler. Keep DOM updates in app.ts. Display money with formatMoney from @expense/shared only.

When checking the page in Cursor's browser, never refresh it with browser_cdp Page.reload. Reload by navigating to the current URL with browser_navigate.
