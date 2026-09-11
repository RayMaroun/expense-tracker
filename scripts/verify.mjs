// Cross-platform readiness check. Usage: npm run verify -- 3   (checks readiness for Module 3)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const module = Number(process.argv[2] || 0);
const root = process.cwd();
const has = (p) => existsSync(join(root, p));
const filesIn = (p) => (has(p) ? readdirSync(join(root, p)) : []);
const contains = (p, text) => has(p) && readFileSync(join(root, p), "utf8").includes(text);

const checks = [];
if (module >= 3) {
  const rules = filesIn(".cursor/rules");
  for (const r of ["plan-first.mdc","no-moment.mdc","money.mdc","ts-strict.mdc","architecture.mdc"])
    checks.push([`.cursor/rules/${r} exists`, rules.includes(r)]);
  checks.push([".cursor/rules/legacy-style.mdc removed", !rules.includes("legacy-style.mdc")]);
  checks.push(["docs/ARCHITECTURE.md exists", has("docs/ARCHITECTURE.md")]);
  checks.push(["packages/shared no longer imports moment", !contains("packages/shared/src/dates.ts","from \"moment\"")]);
}
if (module >= 4) {
  checks.push([".cursorignore exists", has(".cursorignore")]);
  checks.push([".cursorignore excludes packages/legacy-clients", contains(".cursorignore","legacy-clients")]);
  checks.push([".cursor/mcp.json exists", has(".cursor/mcp.json")]);
  checks.push(["packages/api no longer imports moment", !contains("packages/api/src/routes/reports.ts","from \"moment\"")]);
}
if (module >= 5) {
  checks.push(["packages/web no longer imports moment", !contains("packages/web/src/app.ts","from \"moment\"")]);
  checks.push(["tests exist", filesIn("packages/shared/test").length > 0 || filesIn("packages/shared/src").some(f => f.endsWith(".test.ts"))]);
}
if (module < 3) {
  checks.push(["repository present", has("package.json")]);
  checks.push(["node_modules installed", has("node_modules")]);
}

let ok = true;
for (const [label, pass] of checks) { console.log(`${pass ? "  ok " : " MISSING "} ${label}`); ok &&= pass; }
console.log(ok ? `\nReady for Module ${module || 1}.` : `\nNot ready for Module ${module}. Catch up with: git checkout m${module}-start`);
process.exit(ok ? 0 : 1);
