```bash
 ████████╗ ████████╗ ████████╗ 
██╔═════██╗██╔════██╗██╔════██╗
██║     ██║████████╔╝████████╔╝
██║     ██║██╔═══██╗ ██╔════██╗
╚████████╔╝██║   ╚██╗████████╔╝
 ╚═══════╝ ╚═╝    ╚═╝╚═══════╝
```

<div align="center">

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

</div>

---

## Overview

**Orb** is a full-stack virtual digital wallet — a UPI/Paytm-style peer-to-peer payment simulator built on a fictional currency called **ORB**. Every user is auto-credited 1,00,000 virtual balance on signup, can send money to other users by wallet tag or QR code, view transaction history with spending charts, and receive email alerts on incoming transfers. No real money and no real payment rails are ever involved — every "transaction" is an internal database update. This is a portfolio and learning project built with production-grade architecture and discipline.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [P2P Transfer Flow](#p2p-transfer-flow)
- [Security](#security)
- [Engineering Decisions](#engineering-decisions)
- [Deployment](#deployment)
- [License](#license)

---

## Features

**Authentication and Security**
- JWT access and refresh token flow with silent renewal
- BCrypt password hashing (never stored or logged plain)
- Separate 4-digit transfer PIN stored as a separate BCrypt hash
- Account auto-lock after 5 consecutive failed login attempts
- Per-IP rate limiting via Bucket4j (20 requests per minute)
- CORS locked to exact frontend origin, never wildcard
- Input validation on every request DTO
- Sensitive fields scrubbed from all log output

**Payments and Wallet**
- 1,00,000 ORB auto-seeded wallet on every signup
- Atomic P2P transfers — debit, credit, and transaction insert in one `@Transactional` block
- Self-transfer guard and balance pre-check before any debit
- Transfer PIN verified with `BCrypt.matches()` on every send
- Unique wallet tag (e.g. `@rahul42`) for user discovery
- UUID reference ID generated per transaction

**History and Insights**
- Paginated transaction history with sent and received filter tabs
- Date range filtering
- Monthly spending bar chart via Recharts
- Transaction reference IDs for audit trail

**User Experience**
- Mobile-first responsive design that works on any screen size
- QR code generation via ZXing and camera-based scanning via jsQR
- Notification bell with unread badge
- Async email alerts on incoming transfers (never blocks the API response)
- Toast notifications for all user actions

---

## Tech Stack

**Backend — Java 17+ / Spring Boot 3.5**

| Library | Purpose |
|---|---|
| Spring Boot 3.5 | Core framework, auto-config, embedded Tomcat |
| Spring Security | Auth filter chain, route protection |
| Spring Data JPA | Repository pattern |
| Hibernate ORM | Entity-to-table mapping |
| Flyway | Version-controlled SQL migrations |
| PostgreSQL | Primary database (JDBC driver) |
| JJWT | JWT creation, signing, validation |
| BCrypt (Spring Security) | Password and transfer PIN hashing |
| ZXing | QR code generation as base64 PNG |
| JavaMail / SendGrid | Transactional email on incoming transfers |
| Bucket4j | Per-IP rate limiting |
| Lombok | Boilerplate reduction |
| MapStruct | Compile-time entity-to-DTO mapping |
| springdoc-openapi | Auto-generated API docs at `/swagger-ui.html` |
| SLF4J + Logback | Structured logging |

**Frontend — React 18 / Vite**

| Library | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Dev server and build tool |
| TailwindCSS | Utility-first CSS, mobile-first |
| React Router v6 | Client routing and protected route guards |
| Axios | HTTP client with JWT interceptor and auto-refresh |
| Zustand | Global state management |
| Recharts | Monthly spending bar chart |
| jsQR | Camera-based QR scanner |
| React Hot Toast | Success and error toasts |

**Testing**

| Library | Purpose |
|---|---|
| JUnit 5 + Mockito | Unit and integration tests |
| H2 | In-memory DB for tests only, running in PostgreSQL compatibility mode |

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Java | 17 or higher | `java -version` to verify |
| Node.js | 18 or higher | `node -v` to verify |
| PostgreSQL | 15 or higher | Running locally on port 5432 |
| Maven | 3.9+ | Included via `mvnw` wrapper — no global install needed |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mitxh13/Orb.git
cd Orb
```

### 2. Create the database

Connect to PostgreSQL and run:

```sql
CREATE DATABASE orb_db;
```

### 3. Configure the backend

The application reads credentials from environment variables with sensible defaults for local development. You can either set environment variables or create an untracked `application-local.yml`:

**Option A — Environment variables:**

```bash
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=YourSuperSecretKeyThatIsAtLeast32Characters
```

**Option B — Local config file** (git-ignored):

Create `src/main/resources/application-local.yml`:

```yaml
spring:
  datasource:
    username: your_pg_user
    password: your_pg_password

jwt:
  secret: YourSuperSecretKeyThatIsAtLeast32Characters
```

Email configuration is optional. The app works without it — notifications simply save to the database.

### 4. Run the backend

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
.\mvnw.cmd spring-boot:run
```

The backend starts at `http://localhost:8080`. Flyway automatically creates all 4 tables on first boot. Swagger UI is live at `http://localhost:8080/swagger-ui.html`.

### 5. Run the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8080
```

```bash
npm run dev
```

The frontend starts at `http://localhost:5173`.

### 6. Verify

Open `http://localhost:5173`, register an account, and confirm your wallet shows a balance of 1,00,000 ORB.

---

## Running Tests

Tests run against an in-memory H2 database in PostgreSQL compatibility mode. No local PostgreSQL instance is needed.

```bash
./mvnw test
```

On Windows:

```bash
.\mvnw.cmd test
```

Test coverage includes:
- User registration with atomic wallet creation
- Login, JWT generation, and token refresh
- P2P transfer happy path with correct balance updates
- Insufficient balance rejection
- Self-transfer blocked
- Invalid PIN rejection
- Account lock after 5 failed logins
- Input validation on all DTOs

---

## Project Structure

```
Orb/
├── src/main/java/com/orb/
│   ├── config/             SecurityConfig, JwtConfig, CorsConfig, AsyncConfig, OpenApiConfig
│   ├── controller/         AuthController, UserController, WalletController, TransactionController
│   ├── dto/                RegisterRequest, LoginResponse, SendRequest, WalletDTO, ApiResponse<T>
│   ├── entity/             User, Wallet, Transaction, Notification
│   ├── exception/          GlobalExceptionHandler, InsufficientBalanceException, InvalidTransferException
│   ├── mapper/             UserMapper, WalletMapper, TransactionMapper (MapStruct, compile-time)
│   ├── repository/         UserRepository, WalletRepository, TransactionRepository
│   ├── security/           JwtAuthFilter, JwtUtil, UserDetailsServiceImpl
│   └── service/            AuthService, WalletService, TransactionService, NotificationService
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-test.yml
│   └── db/migration/
│       ├── V1__create_users_table.sql
│       ├── V2__create_wallets_table.sql
│       ├── V3__create_transactions_table.sql
│       └── V4__create_notifications_table.sql
│
├── src/test/               JUnit 5 + Mockito (H2 in PostgreSQL mode)
├── .github/workflows/      CI — mvn test on every push to main
│
├── frontend/
│   ├── src/
│   │   ├── api/            Axios instance, JWT interceptor, per-feature API functions
│   │   ├── components/     Navbar, BalanceCard, TransactionItem, QRModal
│   │   ├── hooks/          useAuth, useWallet
│   │   ├── pages/          Login, Register, Dashboard, Send, History, QR, Notifications, Profile
│   │   ├── store/          useAuthStore, useWalletStore (Zustand)
│   │   └── utils/          formatCurrency, formatDate
│   └── package.json
│
├── pom.xml
├── mvnw / mvnw.cmd
└── README.md
```

---

## Database Schema

Four tables. All monetary values stored as `DECIMAL(15,2)`. UUIDs as native PostgreSQL `UUID` type.

```
USERS                                WALLETS
────────────────────────             ─────────────────────────────
id              UUID  PK             id                UUID  PK
email           VARCHAR(255) UQ      user_id           UUID  FK → users
username        VARCHAR(255) UQ      balance           DECIMAL(15,2) DEFAULT 100000.00
password_hash   TEXT                 currency          VARCHAR(10) DEFAULT 'ORB'
full_name       VARCHAR(200)         wallet_tag        VARCHAR(64) UQ
failed_attempts INT DEFAULT 0        transfer_pin_hash VARCHAR(255)
is_active       BOOLEAN DEFAULT true is_locked         BOOLEAN DEFAULT false
created_at      TIMESTAMP            created_at        TIMESTAMP


TRANSACTIONS                         NOTIFICATIONS
──────────────────────────────       ─────────────────────────
id                 UUID  PK         id          UUID  PK
sender_wallet_id   UUID  FK         user_id     UUID  FK → users
receiver_wallet_id UUID  FK         type        VARCHAR(20)
amount             DECIMAL(15,2)    title       VARCHAR(200)
type               VARCHAR(20)      message     TEXT
status             VARCHAR(20)      is_read     BOOLEAN DEFAULT false
note               TEXT             created_at  TIMESTAMP
reference_id       VARCHAR(64) UQ
created_at         TIMESTAMP
```

Schema is managed by Flyway. Migrations V1 through V4 are frozen once applied. Any future schema change ships as a new migration file (V5, V6, etc.).

---

## API Reference

Full interactive documentation is available at [`/swagger-ui.html`](http://localhost:8080/swagger-ui.html) when the backend is running.

**Standard response envelope** — every endpoint uses this:

```json
{ "success": true,  "message": "Transfer successful", "data": { ... } }
{ "success": false, "message": "Insufficient balance", "data": null }
```

**Endpoints**

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| POST | `/api/auth/register` | No | Create account, auto-seed 1,00,000 wallet |
| POST | `/api/auth/login` | No | Authenticate, return access and refresh tokens |
| POST | `/api/auth/refresh` | No | Exchange refresh token for new access token |
| GET | `/api/users/me` | JWT | Fetch own profile |
| PUT | `/api/users/me` | JWT | Update full name |
| GET | `/api/users/search?username=` | JWT | Search users by username |
| GET | `/api/wallet/me` | JWT | Balance, wallet tag, currency |
| GET | `/api/wallet/qr` | JWT | Wallet QR as base64 PNG |
| POST | `/api/transactions/send` | JWT | Body: `{ receiverWalletTag, amount, pin, note }` |
| GET | `/api/transactions?page=0&size=10` | JWT | Paginated history, filterable by type and date |

**Status codes:** 200 success, 201 created, 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 409 conflict, 429 rate limited, 500 server error.

---

## Authentication Flow

```
1. POST /api/auth/register
2. Server creates User + Wallet inside one @Transactional method
3. Server returns { accessToken, refreshToken, user }
4. Frontend stores tokens, attaches on every request:
     Authorization: Bearer <accessToken>
5. JwtAuthFilter (extends OncePerRequestFilter) validates the token on every protected route
6. On 401, frontend calls POST /api/auth/refresh
7. Gets a new accessToken, retries the original request silently
```

Access tokens expire after 24 hours. Refresh tokens expire after 7 days. The JWT secret is loaded from an environment variable and must be at least 32 characters.

---

## P2P Transfer Flow

The most critical path in the application. Designed so that money can never be lost, even on a server crash mid-operation.

```
POST /api/transactions/send
 |
 |-- 1. Validate JWT, identify sender
 |-- 2. Verify transfer PIN (BCrypt.matches vs transfer_pin_hash)
 |-- 3. Look up receiver by wallet_tag
 |-- 4. Guard: sender != receiver (block self-transfer)
 |-- 5. Guard: sender.balance >= amount (fail fast with 400)
 |
 |-- @Transactional BEGIN
 |      |-- sender.balance -= amount      (debit)
 |      |-- receiver.balance += amount     (credit)
 |      |-- INSERT transaction row (status = SUCCESS)
 |-- @Transactional COMMIT
 |      (any exception anywhere above causes full rollback)
 |
 |-- @Async: send email notification to receiver (non-blocking)
 |-- Return { success, referenceId, newBalance }
```

---

## Security

| Area | Implementation |
|---|---|
| Passwords | BCrypt hashed. Never stored, logged, or returned in any response. |
| Transfer PIN | Separate BCrypt hash stored on the wallet row. Verified on every transfer. Never returned in any API response. |
| JWT | HS256 signed. 24-hour access tokens, 7-day refresh tokens. Secret loaded from environment variable, minimum 32 characters. |
| Account lock | `failed_attempts` counter on User entity. Account locked (`is_active = false`) after 5 consecutive bad logins. |
| Rate limiting | Bucket4j. 20 requests per minute per IP in production. |
| CORS | Exact frontend origin only. Never `*`, especially with `allowCredentials(true)`. |
| Input validation | `@Valid` on every request DTO. Server-side validation on all fields. |
| Logging | `password_hash` and `transfer_pin_hash` excluded from all log output. |
| HTTPS | Enforced by Railway and Vercel in production. |

---

## Engineering Decisions

| Decision | Rationale |
|---|---|
| `BigDecimal`, never `double` | Floating-point arithmetic causes silent precision drift in currency calculations. `BigDecimal` with `DECIMAL(15,2)` guarantees exact math. BigDecimal values are always constructed from String, never from double literals. |
| User + Wallet in one `@Transactional` | A user must never exist without a wallet, even if the server crashes mid-registration. One transaction guarantees atomicity. |
| Debit + Credit in one `@Transactional` | A partial transfer (money debited but not credited) must be structurally impossible. Full rollback on any exception. |
| Transfer PIN is not the login password | Separate BCrypt hash stored on the wallet row. Even if a session is hijacked, money cannot move without the PIN. |
| `@Async` email notifications | JavaMail and SendGrid calls add 1 to 3 seconds of latency. `@Async` moves them off the request thread so the API responds instantly. |
| `OncePerRequestFilter` for JWT | Spring's filter chain can invoke a filter more than once in some configurations. `OncePerRequestFilter` guarantees exactly one execution per request. |
| Flyway, not Hibernate DDL | `ddl-auto: validate` ensures Hibernate never silently modifies the schema. All migrations are version-controlled SQL files. A migration that has already run is never edited. |
| MapStruct, not manual mapping | Compile-time entity-to-DTO mapping eliminates runtime reflection overhead and catches mapping errors at build time. |
| H2 in PostgreSQL mode for tests | Tests run fast without needing a real database, but SQL compatibility ensures test behavior matches production. |

---

## Deployment

### Backend — Railway

1. Push the repository to GitHub.
2. Connect Railway to the GitHub repository.
3. Set environment variables in the Railway dashboard:
   ```
   DB_USERNAME=<railway-provided>
   DB_PASSWORD=<railway-provided>
   JWT_SECRET=<your-secret-min-32-chars>
   MAIL_USERNAME=<sendgrid-api-key>
   MAIL_PASSWORD=<sendgrid-password>
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
4. Railway auto-detects the Maven project and deploys.

### Frontend — Vercel

1. Import the `frontend/` directory in Vercel.
2. Set build command: `npm run build`.
3. Set output directory: `dist`.
4. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```

---

## License

[MIT](./LICENSE) — free to use, modify, and distribute.

---

<div align="center">
  <strong>Built with clean architecture and production-grade discipline.</strong>
  <br/><br/>
  <a href="https://github.com/Mitxh13">@Mitxh13</a>
</div>
