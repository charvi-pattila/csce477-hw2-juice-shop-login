# Juice Shop Clone — Login Form

A basic HTML + JavaScript login form that mimics the OWASP Juice Shop login page, built for a web-security homework assignment. It demonstrates both **client-side** and **server-side** input validation.

## What it does

- Renders a login form with **email** and **password** fields.
- **Client-side validation** (in `index.html`): blocks empty submissions, requires the email to contain `@`, and requires the password to be at least 8 characters.
- **Server-side validation** (in `server.js`): re-runs the same checks on the backend, because client-side validation alone can be bypassed (disabled JS, edited DevTools, or hitting the endpoint directly with `curl`).
- Renders the server's response message using `textContent` rather than `innerHTML`, so a message can't inject/execute HTML or scripts (XSS-safe rendering).

This is a **demo**: there is no database and no real account check. See "Notes on real-world security" below for what a production version would add.

## Requirements

- [Node.js](https://nodejs.org/) (v14 or newer). No external packages needed — the server uses only Node's built-in modules.

## How to run

```bash
# 1. Clone the repo
git clone https://github.com/charvi-pattila/csce477-hw2-juice-shop-login.git
cd csce477-hw2-juice-shop-login

# 2. Start the server
node server.js

# 3. Open in a browser
# http://localhost:3000
```

To test the client form on its own without the server, you can also just open `index.html` directly in a browser — but the `/login` request will fail, since that needs the server running.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The login page + client-side validation JS |
| `index-vulnerable.html` | Intentionally insecure copy of the login page that reflects input with `innerHTML` (XSS demo) |
| `server.js` | Node HTTP server + server-side validation (serves `index.html` only) |

## XSS demo (`index-vulnerable.html`)

`index-vulnerable.html` uses the **same** validation rules as the secure page, but after a successful check it writes `"Welcome, " + email` into the page with `innerHTML`. Because the email field only has to contain `@`, an attacker-controlled value can still carry HTML that the browser parses and runs.

The server does not serve this file. Open it directly in a browser (double-click it, or `open index-vulnerable.html` on macOS), then try:

- **Email:** `<img src=x onerror=alert('XSS')>@a.com`
- **Password:** any 8+ characters, e.g. `password123`

An alert box pops up, showing the injected script ran. The secure `index.html` is not affected, because it only ever writes text into the page with `textContent`, so nothing is parsed as HTML.



## Notes on real-world security

This demo has no database or real accounts. A production version would add:

- **Parameterized queries** for any database lookup, never string concatenation, to prevent SQL injection.
- **bcrypt password hashing**: `await bcrypt.hash(password, 12)` on signup (store only the hash) and `await bcrypt.compare(attempt, hash)` on login.
- **Server-assigned roles**: ignore any `role` field sent by the client; new accounts are always `customer`.
- **HTTPS**, rate limiting on `/login`, and a `Content-Security-Policy` header as a backup against XSS.
