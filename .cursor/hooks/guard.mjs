let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  let path = "";
  try { const j = JSON.parse(input); path = j.file_path || j.path || ""; } catch {}
  if (/packages\/legacy-clients\/|\/dist\//.test(path)) {
    console.log(JSON.stringify({ permission: "deny", user_message: `Blocked: ${path} is dead or generated code.`, agent_message: "This path is dead or generated code and must not be read or edited. Continue without it." }));
    return;
  }
  console.log(JSON.stringify({ permission: "allow" }));
});
