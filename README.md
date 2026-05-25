```bash
 ████████╗ ████████╗ ████████╗ 
██╔═════██╗██╔════██╗██╔════██╗
██║     ██║████████╔╝████████╔╝
██║     ██║██╔═══██╗ ██╔════██╗
╚████████╔╝██║   ╚██╗████████╔╝
 ╚═══════╝ ╚═╝    ╚═╝╚═══════╝
```
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 📋 Table of Contents

- [What is Orb?](#-what-is-orb)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)

---

## 💡 What is Orb?

Orb is a **virtual digital wallet** — think of it as a UPI/Paytm clone built entirely for learning and demonstration. Every registered user automatically receives a wallet loaded with **₹1,00,000 in virtual ORB currency**. From there, you can send money to other users, scan QR codes, and track your transaction history — all within a responsive web interface that works on both mobile browsers and laptops.

> ⚠️ **No real money is ever involved.** All transactions are internal database operations only.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | Register & login with JWT access + refresh tokens |
| 💰 **Auto Wallet** | ₹1,00,000 virtual balance credited on every new signup |
| 💸 **P2P Transfers** | Send money to any user by wallet tag or username search |
| 🔒 **Transfer PIN** | Every transaction requires a 4-digit PIN for security |
| 📷 **QR Payments** | Generate your wallet QR; scan others' QR to prefill send form |
| 📜 **Transaction History** | Paginated history with sent/received filters and a spending chart |
| 🔔 **Notifications** | In-app + email alerts on every incoming transfer |
| 🛡️ **Account Lock** | Auto-locks after 5 failed login attempts |
| 📱 **Responsive UI** | Mobile-first design — works on any screen size |

---

## 🛠 Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.x**
- Spring Security · Spring Data JPA · Hibernate
- JWT (access + refresh tokens) · BCrypt password hashing
- ZXing (QR code generation) · JavaMail / SendGrid (email)
- Bucket4j (rate limiting) · Swagger / OpenAPI (API docs)
- Lombok · MapStruct · SLF4J + Logback

### Frontend
- **React 18** (Vite build) + **TailwindCSS**
- React Router v6 · Axios (with JWT interceptors)
- Zustand (global state) · Recharts (spending chart)
- jsQR (camera-based QR scanner) · React Hot Toast

### Database & Infrastructure
- **PostgreSQL 15** · Flyway migrations · HikariCP connection pool
- H2 (in-memory, tests only)
- **Railway** (backend + DB hosting) · **Vercel** (frontend hosting)
- GitHub Actions (CI pipeline)

---

## 🗄 Database Schema

Four tables, all money values stored as `DECIMAL(15,2)` — never float.

```
USERS                           WALLETS
─────────────────────           ──────────────────────────
id            UUID  PK          id               UUID  PK
email         VARCHAR UNIQUE     user_id          UUID  FK→users
username      VARCHAR UNIQUE     balance          DECIMAL(15,2) DEFAULT 100000.00
password_hash TEXT               currency         VARCHAR DEFAULT 'ORB'
full_name     VARCHAR(200)       wallet_tag       VARCHAR UNIQUE
failed_attempts INT DEFAULT 0   transfer_pin_hash VARCHAR
is_active     BOOLEAN            is_locked        BOOLEAN
created_at    TIMESTAMP          created_at       TIMESTAMP


TRANSACTIONS                    NOTIFICATIONS
─────────────────────────────   ──────────────────────────
id                UUID  PK      id          UUID  PK
sender_wallet_id  UUID  FK      user_id     UUID  FK→users
receiver_wallet_id UUID FK      type        ENUM(TRANSFER, SECURITY)
amount            DECIMAL(15,2) title       VARCHAR(200)
type              ENUM(TRANSFER) message    TEXT
status            ENUM(SUCCESS, FAILED)     is_read  BOOLEAN
note              TEXT           created_at TIMESTAMP
reference_id      VARCHAR UNIQUE
created_at        TIMESTAMP
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 15 (installed locally)
- Maven

### 1. Clone the repository

```bash
git clone https://github.com/Mitxh13/Orb.git
cd Orb
```

### 2. Set up the database

```sql
CREATE DATABASE orb_db;
```

### 3. Configure the backend

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/orb_db
    username: YOUR_DB_USER
    password: YOUR_DB_PASSWORD

jwt:
  secret: YOUR_JWT_SECRET_KEY   # min 32 chars
  expiration: 86400000           # 24h in ms

mail:
  username: YOUR_EMAIL
  password: YOUR_APP_PASSWORD
```

### 4. Run the backend

```bash
./mvnw spring-boot:run
```

Backend starts at `http://localhost:8080`  
Swagger UI available at `http://localhost:8080/swagger-ui.html`

### 5. Run the frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

```bash
npm run dev
```

Frontend starts at `http://localhost:5173`

---

## 📡 API Reference

Full interactive docs are available at `/swagger-ui.html` when the backend is running.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Create account + auto-seed ₹1L wallet |
| `POST` | `/api/auth/login` | ❌ | Login, get JWT |
| `POST` | `/api/auth/refresh` | ❌ | Refresh access token |
| `GET` | `/api/users/me` | ✅ | Get own profile |
| `PUT` | `/api/users/me` | ✅ | Update profile |
| `GET` | `/api/users/search?username=` | ✅ | Search users by username |
| `GET` | `/api/wallet/me` | ✅ | Get wallet balance & tag |
| `GET` | `/api/wallet/qr` | ✅ | Get wallet QR as base64 image |
| `POST` | `/api/transactions/send` | ✅ | Send money to another user |
| `GET` | `/api/transactions` | ✅ | Paginated transaction history |

---

## 📁 Project Structure

```
Orb/
├── backend/                        # Spring Boot application
│   └── src/main/java/com/orb/
│       ├── controller/             # REST controllers
│       ├── service/                # Business logic
│       ├── repository/             # JPA repositories
│       ├── entity/                 # DB entities
│       ├── dto/                    # Request / response DTOs
│       └── config/                 # Security, CORS, JWT config
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/           # Flyway SQL migrations
│
├── frontend/                       # React + Vite app
│   └── src/
│       ├── pages/                  # Route-level pages
│       ├── components/             # Reusable UI components
│       ├── store/                  # Zustand state
│       ├── api/                    # Axios API calls
│       └── hooks/                  # Custom React hooks
│
└── README.md
```

---

## ⚙️ Key Engineering Decisions

**Atomic transfers** — P2P money movement uses `@Transactional`. Both the debit and credit either succeed together or roll back completely. No partial state ever.

**Wallet creation in same transaction as user save** — if the DB write fails mid-way, you won't end up with a user who has no wallet.

**Decimal, not float** — all monetary values use `DECIMAL(15,2)` in PostgreSQL to avoid floating-point precision bugs.

**Async email** — notification emails are sent via `@Async` so they never block the API response.

**Transfer PIN is BCrypt hashed** — stored the same way as passwords; never logged or returned in any API response.

---

## 📄 License

[MIT](./LICENSE) — free to use, modify, and distribute.

---

<div align="center">
  If you liked the project — give it a ⭐.
</div>
