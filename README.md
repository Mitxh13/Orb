```bash
 ████████╗ ████████╗ ████████╗ 
██╔═════██╗██╔════██╗██╔════██╗
██║     ██║████████╔╝████████╔╝
██║     ██║██╔═══██╗ ██╔════██╗
╚████████╔╝██║   ╚██╗████████╔╝
 ╚═══════╝ ╚═╝    ╚═╝╚═══════╝
```

<div align="center">
  <strong>A virtual digital wallet — send, receive & track money like UPI, but with fictional ORB currency.</strong>
</div>

<br/>

<div align="center">

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

[Live Demo](#) · [API Docs (Swagger)](#api-documentation) · [Report Bug](https://github.com/Mitxh13/Orb/issues) · [Request Feature](https://github.com/Mitxh13/Orb/issues)

</div>

---

## 💡 What is Orb?

**Orb** is a full-stack, production-grade **peer-to-peer payment simulator** — think of it as a UPI/Paytm clone built entirely for learning and portfolio demonstration. Every new user is auto-credited **₹1,00,000** in virtual **ORB** currency. From there, you can send money to friends, scan QR codes, track your spending with interactive charts, and receive real-time notifications — all inside a responsive, mobile-first web interface.

> **⚠️ Disclaimer:** No real money is ever involved. All balances and transactions are internal database operations using fictional "ORB" currency. This is a portfolio/learning project, not a fintech product.

### Why Orb?

I built Orb to prove I could architect a full-stack fintech application from scratch — not just the happy-path UI, but the hard parts that actually matter: **atomic transactions** that can never lose money, **cryptographic PIN verification**, **JWT auth with silent refresh**, and a codebase organized with the same discipline you'd find in a production payments service. Every design decision — from `BigDecimal` over `double` to `@Transactional` rollback guarantees — is a deliberate engineering choice, not a tutorial shortcut.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security
- JWT access + refresh token flow with silent renewal
- BCrypt password hashing (never stored plain)
- Account auto-locks after 5 failed login attempts
- Separate 4-digit transfer PIN (BCrypt hashed)
- Per-IP rate limiting (Bucket4j — 20 req/min)
- CORS locked to exact frontend origin
- Sensitive fields scrubbed from all logs

</td>
<td width="50%">

### 💸 Payments & Wallet
- **₹1,00,000** auto-seeded wallet on every signup
- Atomic P2P transfers — debit + credit in one `@Transactional`
- Self-transfer guard, balance pre-check, PIN verification
- Unique wallet tag (`@username42`) for easy discovery
- Every transaction gets a UUID reference ID
- Balance rollback guaranteed on any mid-transfer failure

</td>
</tr>
<tr>
<td width="50%">

### 📊 History & Insights
- Paginated transaction history with sent/received filters
- Date range filtering for custom views
- Monthly spending bar chart (Recharts)
- Transaction reference IDs for audit trail

</td>
<td width="50%">

### 📱 User Experience
- Mobile-first responsive design (works on any screen)
- QR code generation (ZXing) + camera scanner (jsQR)
- Real-time notification bell with unread badge
- Async email alerts on incoming transfers
- Toast notifications for all user actions

</td>
</tr>
</table>

---

## 🛠 Tech Stack

<table>
<tr>
<th align="center">Backend</th>
<th align="center">Frontend</th>
<th align="center">Infrastructure</th>
</tr>
<tr>
<td valign="top">

**Java 17+** · **Spring Boot 3.5**
- Spring Security (filter chain, JWT)
- Spring Data JPA + Hibernate ORM
- Flyway (version-controlled migrations)
- PostgreSQL (JDBC driver)
- JJWT (token signing + validation)
- BCrypt (passwords & PINs)
- ZXing (QR code → base64 PNG)
- Bucket4j (rate limiting)
- Lombok + MapStruct
- springdoc-openapi (Swagger UI)
- SLF4J + Logback (structured logging)
- JavaMail / SendGrid (async email)

</td>
<td valign="top">

**React 18** · **Vite**
- TailwindCSS (utility-first, mobile-first)
- React Router v6 (protected routes)
- Axios (JWT interceptor + auto-refresh)
- Zustand (global state management)
- Recharts (spending visualizations)
- jsQR (camera-based QR scanner)
- React Hot Toast (notifications)

</td>
<td valign="top">

**PostgreSQL 15+**
- DECIMAL(15,2) for all money
- UUID primary keys
- Flyway-managed schema
- H2 (test-only, PG mode)

**CI/CD**
- GitHub Actions (`mvn test` on push)
- Railway (backend + managed DB)
- Vercel (frontend CDN)

</td>
</tr>
</table>

---

## 🗄 Database Schema

Four tables, all monetary values stored as `DECIMAL(15,2)` — never `float` or `double`.

```
┌──────────────────────────┐       ┌────────────────────────────────┐
│         USERS            │       │           WALLETS              │
├──────────────────────────┤       ├────────────────────────────────┤
│ id          UUID    PK   │◄──┐   │ id              UUID      PK  │
│ email       VARCHAR UQ   │   │   │ user_id         UUID      FK  │──┐
│ username    VARCHAR UQ   │   │   │ balance         DECIMAL(15,2) │  │
│ password_hash   TEXT     │   │   │ currency        VARCHAR  'ORB'│  │
│ full_name   VARCHAR(200) │   │   │ wallet_tag      VARCHAR  UQ   │  │
│ failed_attempts  INT     │   │   │ transfer_pin_hash VARCHAR     │  │
│ is_active   BOOLEAN      │   │   │ is_locked       BOOLEAN       │  │
│ created_at  TIMESTAMP    │   │   │ created_at      TIMESTAMP     │  │
└──────────────────────────┘   │   └────────────────────────────────┘  │
                               │                                       │
┌──────────────────────────────┴───┐  ┌────────────────────────────────┘
│        NOTIFICATIONS             │  │     TRANSACTIONS               │
├──────────────────────────────────┤  ├────────────────────────────────┤
│ id          UUID         PK      │  │ id                UUID    PK   │
│ user_id     UUID         FK→users│  │ sender_wallet_id  UUID    FK   │
│ type        VARCHAR(20)          │  │ receiver_wallet_id UUID   FK   │
│ title       VARCHAR(200)         │  │ amount        DECIMAL(15,2)    │
│ message     TEXT                 │  │ type          VARCHAR(20)      │
│ is_read     BOOLEAN              │  │ status        VARCHAR(20)      │
│ created_at  TIMESTAMP            │  │ note          TEXT             │
└──────────────────────────────────┘  │ reference_id  VARCHAR(64) UQ  │
                                      │ created_at    TIMESTAMP       │
                                      └───────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Java | 17+ | `java -version` to verify |
| Node.js | 18+ | `node -v` to verify |
| PostgreSQL | 15+ | Running locally on port 5432 |
| Maven | 3.9+ | Included via `mvnw` wrapper — no global install needed |

### 1. Clone the repository

```bash
git clone https://github.com/Mitxh13/Orb.git
cd Orb
```

### 2. Create the database

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE orb_db;
```

### 3. Configure environment

Create a file `src/main/resources/application-local.yml` (git-ignored) or set environment variables:

```yaml
# application-local.yml (optional — overrides defaults)
spring:
  datasource:
    username: your_pg_user      # default: postgres
    password: your_pg_password  # default: postgres

jwt:
  secret: YourSuperSecretKeyThatIsAtLeast32Characters

# Email (optional — app works without it, notifications just save to DB)
spring:
  mail:
    username: your_email@gmail.com
    password: your_app_password
```

Or use environment variables: `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `MAIL_USERNAME`, `MAIL_PASSWORD`.

### 4. Run the backend

```bash
./mvnw spring-boot:run
# Windows: .\mvnw.cmd spring-boot:run
```

Backend starts at **http://localhost:8080**
Flyway auto-creates all 4 tables on first boot.

### 5. Run the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

```bash
npm run dev
```

Frontend starts at **http://localhost:5173**

### 6. You're live! 🎉

Open `http://localhost:5173`, register an account, and you'll see ₹1,00,000 in your wallet.

---

## 📡 API Reference

Full interactive documentation is available at **[/swagger-ui.html](http://localhost:8080/swagger-ui.html)** when the backend is running.

Every endpoint returns a standard response envelope:
```json
{ "success": true,  "message": "Transfer successful", "data": { ... } }
{ "success": false, "message": "Insufficient balance", "data": null }
```

### Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/auth/register` | ❌ | Create account + auto-seed ₹1,00,000 wallet |
| `POST` | `/api/auth/login` | ❌ | Login → receive JWT access + refresh tokens |
| `POST` | `/api/auth/refresh` | ❌ | Exchange refresh token for new access token |
| `GET` | `/api/users/me` | 🔒 | Fetch own profile |
| `PUT` | `/api/users/me` | 🔒 | Update full name |
| `GET` | `/api/users/search?username=` | 🔒 | Search users by username |
| `GET` | `/api/wallet/me` | 🔒 | Balance, wallet tag, currency |
| `GET` | `/api/wallet/qr` | 🔒 | Wallet QR code as base64 PNG |
| `POST` | `/api/transactions/send` | 🔒 | Send money: `{ receiverWalletTag, amount, pin, note }` |
| `GET` | `/api/transactions?page=0&size=10` | 🔒 | Paginated transaction history |

**Status codes:** `200` success · `201` created · `400` bad request · `401` unauthorized · `403` forbidden · `404` not found · `409` conflict · `429` rate limited · `500` server error

---

## 🔒 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      EVERY REQUEST                          │
├─────────────────────────────────────────────────────────────┤
│  Rate Limiter (Bucket4j) → 20 req/min/IP                   │
│       ↓                                                     │
│  CORS Filter → exact origin only, never "*"                 │
│       ↓                                                     │
│  JwtAuthFilter (OncePerRequestFilter)                       │
│       ↓                                                     │
│  Spring Security Filter Chain                               │
│       ↓                                                     │
│  @Valid DTO Validation                                      │
│       ↓                                                     │
│  Controller → Service → Repository                          │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Protection |
|-------|-----------|
| **Passwords** | BCrypt hashed — never stored, logged, or returned in responses |
| **Transfer PIN** | Separate BCrypt hash, verified on every send, never exposed |
| **JWT** | HS256 signed, 24h access / 7d refresh, secret ≥ 32 chars via env var |
| **Account Lock** | Auto-locks after 5 consecutive failed logins |
| **Rate Limiting** | Bucket4j — 20 requests/min per IP |
| **CORS** | Locked to exact frontend origin — never `*` |
| **Input** | `@Valid` on every request DTO, server-side validation |
| **Logging** | `password_hash` and `transfer_pin_hash` scrubbed from all output |
| **HTTPS** | Enforced by Railway + Vercel in production |

---

## 💰 P2P Transfer Flow

The most critical path in the app — designed so **money can never be lost**, even on a server crash:

```
POST /api/transactions/send
 │
 ├─ 1. Validate JWT → identify sender
 ├─ 2. Verify transfer PIN (BCrypt.matches)
 ├─ 3. Look up receiver by wallet_tag
 ├─ 4. Guard: sender ≠ receiver (block self-transfer)
 ├─ 5. Guard: sender.balance ≥ amount (fail fast)
 │
 ├─ @Transactional ─────────────────────────────────┐
 │    ├─ sender.balance  -= amount      (debit)     │
 │    ├─ receiver.balance += amount     (credit)    │
 │    └─ INSERT transaction (status = SUCCESS)      │
 │                                                   │
 │    Any exception → FULL ROLLBACK                  │
 │    (no partial state — ever)                      │
 └───────────────────────────────────────────────────┘
 │
 ├─ @Async: email notification to receiver (non-blocking)
 └─ Return { success, referenceId, newBalance }
```

---

## 📁 Project Structure

```
Orb/
├── src/main/java/com/orb/
│   ├── config/             # SecurityConfig · JwtConfig · CorsConfig · AsyncConfig · OpenApiConfig
│   ├── controller/         # AuthController · UserController · WalletController · TransactionController
│   ├── dto/                # RegisterRequest · LoginResponse · SendRequest · WalletDTO · ApiResponse<T>
│   ├── entity/             # User · Wallet · Transaction · Notification
│   ├── exception/          # GlobalExceptionHandler · InsufficientBalanceException · InvalidTransferException
│   ├── mapper/             # UserMapper · WalletMapper · TransactionMapper (MapStruct)
│   ├── repository/         # UserRepository · WalletRepository · TransactionRepository
│   ├── security/           # JwtAuthFilter · JwtUtil · UserDetailsServiceImpl
│   └── service/            # AuthService · WalletService · TransactionService · NotificationService
│
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/       # V1__create_users  V2__create_wallets  V3__create_transactions  V4__create_notifications
│
├── src/test/               # JUnit 5 + Mockito (H2 in PostgreSQL mode)
├── .github/workflows/      # CI — mvn test on every push
│
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance + JWT interceptor
│   │   ├── components/     # Navbar · BalanceCard · TransactionItem · QRModal
│   │   ├── hooks/          # useAuth · useWallet
│   │   ├── pages/          # Login · Register · Dashboard · Send · History · QR · Notifications · Profile
│   │   ├── store/          # useAuthStore · useWalletStore (Zustand)
│   │   └── utils/          # formatCurrency · formatDate
│   └── package.json
│
├── pom.xml
├── mvnw / mvnw.cmd         # Maven wrapper — no global Maven install needed
└── README.md
```

---

## 🧪 Running Tests

Tests run against an in-memory **H2 database in PostgreSQL compatibility mode** — no local PostgreSQL needed.

```bash
./mvnw test
# Windows: .\mvnw.cmd test
```

Test coverage includes:
- ✅ User registration + atomic wallet creation
- ✅ Login / JWT generation / token refresh
- ✅ P2P transfer happy path (balances update correctly)
- ✅ Insufficient balance rejection
- ✅ Self-transfer blocked
- ✅ Invalid PIN rejection
- ✅ Account lock after 5 failed logins
- ✅ Input validation on all DTOs

---

## 🚢 Deployment

### Backend → Railway

1. Push repo to GitHub
2. Connect Railway to your GitHub repo
3. Set environment variables in Railway dashboard:
   ```
   DB_USERNAME=<railway-provided>
   DB_PASSWORD=<railway-provided>
   JWT_SECRET=<your-secret-min-32-chars>
   MAIL_USERNAME=<sendgrid-api-key>
   MAIL_PASSWORD=<sendgrid-password>
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
4. Railway auto-detects the Maven project and deploys

### Frontend → Vercel

1. Import the `frontend/` directory in Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```

---

## ⚙️ Engineering Decisions

| Decision | Why |
|----------|-----|
| **`BigDecimal`, never `double`** | Floating-point arithmetic causes silent precision drift in currency calculations. `BigDecimal` with `DECIMAL(15,2)` is the only correct representation for money. |
| **User + Wallet in one `@Transactional`** | A user must never exist without a wallet, even if the server crashes mid-registration. One transaction guarantees atomicity. |
| **Debit + Credit in one `@Transactional`** | A partial transfer (money debited but not credited) must be structurally impossible. The `@Transactional` annotation guarantees full rollback on any exception. |
| **Transfer PIN ≠ login password** | Separate BCrypt hash stored on the wallet row. Even if a session is hijacked, money can't move without the PIN. |
| **`@Async` email notifications** | JavaMail/SendGrid calls add 1–3s of latency. `@Async` moves them off the request thread so the API responds instantly. |
| **`OncePerRequestFilter` for JWT** | Spring's filter chain can invoke a filter more than once in some configurations. `OncePerRequestFilter` guarantees exactly one execution per request. |
| **Flyway, not Hibernate DDL** | `ddl-auto: validate` ensures Hibernate never silently modifies the schema. All migrations are version-controlled SQL files. |
| **MapStruct, not manual mapping** | Compile-time entity ↔ DTO mapping eliminates runtime reflection overhead and catches mapping errors at build time. |
| **H2 in PostgreSQL mode for tests** | Tests run fast without needing a real database, but SQL compatibility ensures test behavior matches production. |

---

## 📄 License

[MIT](./LICENSE) — free to use, modify, and distribute.

---

<div align="center">
  <br/>
  <strong>Built with ☕ and clean architecture.</strong>
  <br/><br/>
  If you found this useful — give it a ⭐
  <br/><br/>
  <a href="https://github.com/Mitxh13">@Mitxh13</a>
</div>
