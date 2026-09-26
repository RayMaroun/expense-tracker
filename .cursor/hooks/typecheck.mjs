import { execSync } from "node:child_process";
let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  let loop = 0;
  try { loop = JSON.parse(input).loop_count || 0; } catch {}
  if (loop >= 2) { console.log("{}"); return; }
  try {
    execSync("npm run typecheck", { stdio: "pipe" });
    console.log("{}");
  } catch (e) {
    const out = String(e.stdout || e.stderr).slice(-1500);
    console.log(JSON.stringify({ followup_message: "npm run typecheck failed after your changes:\n" + out + "\nFix the type errors, then run npm run typecheck again and confirm it passes." }));
  }
});
