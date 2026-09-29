# PayCore — Digital Wallet & Payment Management Platform

PayCore is an enterprise-grade digital wallet and payment management platform built with a high-performance **Java 21 / Spring Boot 3.3.4** backend, **Spring Data JPA / Hibernate**, **Spring Security (JWT)**, **MySQL 8.x**, and a modern, responsive **React 19** frontend.

---

## 1. Project Architecture Overview

PayCore adopts a strict layered architecture:

```text
PayCore/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/paycore/
│       │   │   ├── config/          # DataInitializer, SecurityConfig, CORS
│       │   │   ├── controller/      # AuthController, CustomerController, AdminController
│       │   │   ├── dto/             # Clean request & response DTOs with Bean Validation
│       │   │   ├── entity/          # User, Wallet, Transaction, Enums
│       │   │   ├── exception/       # GlobalExceptionHandler, InsufficientBalanceException, etc.
│       │   │   ├── repository/      # UserRepository, WalletRepository, TransactionRepository
│       │   │   ├── security/        # JWT Filter, Token Provider, UserPrincipal
│       │   │   └── service/         # AuthService, WalletService, DepositService, TransferService, AdminService
│       │   └── resources/
│       │       └── application.yml  # Datasource, JWT, and Admin configuration
│       └── test/                    # TransferServiceTest, AuthServiceTest
├── src/                             # React 19 Frontend with Dual Engine API Client
│   ├── components/                  # Navigation, Modals, Stat Cards, Transaction Table
│   ├── context/                     # AuthContext, NotificationContext
│   ├── pages/                       # Landing, Register, Login, Dashboard, Transfer, Deposit, Admin, Reports
│   └── services/                    # Unified API Client supporting live cloud and local Spring Boot
└── README.md
```

---

## 2. Key Features

- **Role-Based Access Control (RBAC)**: Distinct permissions for `ROLE_ADMIN` and `ROLE_CUSTOMER`.
- **Predefined Administrator Account**: Automatically seeded upon application startup (`admin` / `admin`).
- **Customer Verification Lifecycle**: `VERIFICATION_PENDING` → `APPROVED` / `REJECTED` / `SUSPENDED`.
- **Atomic Wallet Management**:
  - Automatically provisions a unique wallet account (`PAYWALLET100001`) on approval.
  - Strict `BigDecimal` precision (19, 2) preventing floating-point rounding errors.
  - `@Lock(LockModeType.PESSIMISTIC_WRITE)` preventing concurrent double-spending race conditions.
- **Dynamic Receiver Lookup**: Validates recipient account number in real-time, displaying safe masked information before authorization.
- **Two-Factor Transaction Password**: Separate hashed transaction password required to authorize fund debits.
- **Auditable Transaction Ledger**: Full provenance tracking for every deposit and transfer with unique references (`PCX8A92K72`).
- **Live Admin Intelligence**: Dynamic aggregate metrics, system-wide liquidity calculations (`SUM(active wallet balances)`), and transaction filtering.

---

## 3. Technology Stack

### Backend
- **Language**: Java 21 (or Java 17+)
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security 6 with stateless JWT authentication & BCrypt password hashing
- **Persistence**: Spring Data JPA / Hibernate ORM
- **Database**: MySQL 8.x
- **Validation**: Jakarta Bean Validation (`@NotBlank`, `@DecimalMin`, `@Pattern`, `@Past`)
- **Build Tool**: Apache Maven

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4, Plus Jakarta Sans typography, tabular numerals
- **Icons**: Lucide React
- **Animations**: Motion & Canvas Confetti

---

## 4. Acceptance Scenario Walkthrough

The platform satisfies the complete acceptance lifecycle:

1. **Admin Sign-In**: Authenticate using `admin` / `admin`.
2. **Customer Registration**: Register Rahul Sharma with valid Indian phone and 12-digit Aadhaar.
3. **Pending Verification**: Rahul logs in and is greeted with the `VERIFICATION_PENDING` notice.
4. **Admin Approval**: Admin reviews Rahul's registration in Customer Management and clicks **Approve**.
5. **Wallet Activation**: Rahul logs in to see his active wallet (`PAYWALLET100001`) with initial balance `₹0.00`.
6. **Cash Deposit**: Rahul deposits `₹1,000.00`. Wallet balance updates atomically to `₹1,000.00`.
7. **Second Customer Provisioning**: Register and approve Amit Sharma (`PAYWALLET100002`).
8. **Live Recipient Lookup**: Rahul types `PAYWALLET100002` — receiver name "Amit Sharma" is dynamically displayed.
9. **Authorized Transfer**: Rahul sends `₹400.00` after confirming his transaction password (`123456`).
10. **Updated Balances**: Rahul: `₹600.00`, Amit: `₹400.00`.
11. **Dual History Visibility**: Rahul's ledger records **SENT ₹400.00**, while Amit's ledger records **RECEIVED ₹400.00**.
12. **Insufficient Balance Guard**: Rahul attempts to send `₹700.00` while possessing `₹600.00`. The transfer is rejected with error: `Insufficient balance. Available: ₹600.00, Requested: ₹700.00`.
13. **Admin Dashboard Real-Time Sync**: System reflects live total balance (`₹1,000.00`), customer counts, and transaction counts.

---

## 5. Local Setup Instructions

### Prerequisites
- Java 21 or Java 17 JDK
- Apache Maven 3.9+
- MySQL 8.0+
- Node.js 18+ and npm

### 1. MySQL Database Setup
Open your MySQL terminal or GUI client:
```sql
CREATE DATABASE paycore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Backend Credentials
Edit `backend/src/main/resources/application.yml` or set environment variables:
```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/paycore?useSSL=false&serverTimezone=UTC"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="your_mysql_password"
export JWT_SECRET="9a4f2c8d3b7a1e6f4c8b2d0e5a9f3c7b1d4e6a8f2c5d7e9b1a3c5e7f9a2b4c6d"
```

### 3. Run Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
The Spring Boot REST server will start on `http://localhost:8080`.

### 4. Run Frontend (React)
```bash
# In the project root
npm install
npm run dev
```
Open `http://localhost:3000` (or `http://localhost:5173`) in your browser.

---

## 6. REST API Reference

| Method | Endpoint | Access | Description |
|:-------|:---------|:-------|:------------|
| `POST` | `/api/auth/register` | Public | Register customer account (status: PENDING) |
| `POST` | `/api/auth/login` | Public | Authenticate customer via customer ID or email |
| `POST` | `/api/auth/admin-login` | Public | Authenticate administrator |
| `GET`  | `/api/customer/profile` | Customer | Retrieve masked profile information |
| `GET`  | `/api/customer/wallet` | Customer | Retrieve active wallet details |
| `GET`  | `/api/customer/balance` | Customer | Retrieve dynamic wallet balance |
| `GET`  | `/api/customer/receiver/{accountNumber}` | Customer | Look up and verify recipient account |
| `POST` | `/api/customer/deposit` | Customer | Credit wallet via cash deposit |
| `POST` | `/api/customer/transfer` | Customer | Execute atomic peer-to-peer transfer |
| `GET`  | `/api/customer/transactions` | Customer | Retrieve paginated user ledger |
| `GET`  | `/api/admin/dashboard` | Admin | Retrieve dynamic system metrics & liquidity |
| `GET`  | `/api/admin/customers` | Admin | Search and filter registered customers |
| `GET`  | `/api/admin/customers/{id}` | Admin | View complete customer audit profile |
| `PUT`  | `/api/admin/customers/{id}/approve` | Admin | Approve customer and provision wallet |
| `PUT`  | `/api/admin/customers/{id}/reject` | Admin | Reject customer application |
| `PUT`  | `/api/admin/customers/{id}/suspend` | Admin | Freeze customer account and wallet |
| `GET`  | `/api/admin/transactions` | Admin | System-wide paginated transaction ledger |
| `GET`  | `/api/admin/reports` | Admin | Financial, customer, and wallet summary reports |
