// Minimal Node.js server: serves index.html and re-validates the login on the server.
// Server-side validation matters because client-side JS can be bypassed
// (disabled, edited in devtools, or the endpoint hit directly with curl).
//
// Run:  node server.js   ->  http://localhost:3000
// No external dependencies; uses only Node's built-in modules.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// Same rules as the client, enforced again here.
function validate(email, password) {
  const errors = [];
  if (typeof email !== "string" || !email.trim()) errors.push("Email is required.");
  else if (!email.includes("@")) errors.push("Email must contain '@'.");
  if (typeof password !== "string" || !password) errors.push("Password is required.");
  else if (password.length < 8) errors.push("Password must be at least 8 characters.");
  return errors;
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    fs.readFile(path.join(__dirname, "index.html"), (err, content) => {
      if (err) { res.writeHead(500); return res.end("Error loading page"); }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    });
    return;
  }

  if (req.method === "POST" && req.url === "/login") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e4) req.destroy(); // basic guard against oversized payloads
    });
    req.on("end", () => {
      let email, password;
      try {
        ({ email, password } = JSON.parse(body));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Invalid request." }));
      }

      const errors = validate(email, password);
      if (errors.length) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: errors.join(" ") }));
      }

      // NOTE: This is a demo. No real auth/DB here. If you added a DB,
      // you'd use parameterized queries (never string concatenation) and
      // compare a bcrypt hash — see README.
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Validation passed (demo — no real account check)." }));
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
