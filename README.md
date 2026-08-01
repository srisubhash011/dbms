# SmartTicket - Concurrent Ticket Booking & Reservation System

SmartTicket is a high-concurrency, enterprise-grade ticket booking and reservation platform built with **Java 21 / Spring Boot 3** on the backend and **React.js / Material UI / Chart.js** on the frontend. 

It handles massive concurrent user traffic using **Optimistic Concurrency Control (OCC)**, **Exponential Backoff Retries**, **Deadlock & Timeout Handling**, and features an in-app **Multi-Threaded Concurrency Simulator** powered by Java's `ExecutorService`.

---

## Key Features

- **JWT Authentication & Role-Based Access Control**: Secure login/register flow for both `USER` and `ADMIN` roles.
- **Event & Venue Management**: Admins can create, edit, and delete events with dynamic ticket pricing and seat allocation.
- **Interactive Visual Seat Grid Map**: Dynamic SVG/Grid seat selector with real-time availability indicator:
  - **Green**: Available
  - **Yellow**: Reserved / Selected
  - **Red**: Booked
- **Optimistic Concurrency Control (OCC)**: Built with JPA `@Version` locking to guarantee data integrity when hundreds of users attempt booking the same seat simultaneously.
- **Exponential Backoff Retry Engine**: Automatic retry mechanism with randomized jitter to handle version conflicts gracefully.
- **Multi-Threaded Concurrency Simulator**: Admin dashboard tool to simulate $100$, $200$, $500$, or $1000$ concurrent threads competing for seats in real-time.
- **Analytics & Health Dashboard**: Live metrics cards and Chart.js graphs displaying throughput, OCC conflict rates, execution response times, CPU/Memory usage, and transaction log streams.
- **Downloadable Receipts**: Generates instant booking confirmation receipts.

---

## 🛠️ Technology Stack

### Backend
- **Java 21**
- **Spring Boot 3.2** (Spring MVC, Spring Data JPA, Spring Security)
- **Database**: H2 (In-Memory default) & MySQL 8.0 support
- **Connection Pool**: HikariCP
- **Security**: JWT (`jjwt 0.11.5`) & BCrypt Password Hashing
- **Build Tool**: Maven

### Frontend
- **React.js** (Vite Scaffold)
- **UI Framework**: Material UI (MUI v5) & Glassmorphic Custom Styling
- **Charts & Data Visualization**: Chart.js & `react-chartjs-2`
- **HTTP Client**: Axios with JWT Bearer Interceptors
- **Routing**: React Router DOM v6

---

## Backend Layer Architecture

The backend strictly follows a layered architecture:

```text
smartticket-backend/src/main/java/com/smartticket/
│
├── cmd/                # Main Application Entry Point (Application.java)
├── controller/         # REST Controllers (Auth, Event, Seat, Booking, Dashboard, Simulation)
├── services/           # Core Business Logic & Concurrency Orchestration
├── repository/         # JPA Repositories (User, Event, Seat, Booking, Log, Performance)
├── model/              # Database Schema Entities (User, Event, Seat, Booking, Log, Metric)
├── dto/                # Data Transfer Objects (Requests & Responses)
├── concurrency/        # OCC Manager, Retry Manager, Deadlock & Timeout Handlers
├── simulation/         # Multi-Threaded Stress Test Simulator Engine
├── config/             # Security, JWT, CORS & Data Seeder Configurations
├── utils/              # Transaction ID Generator & Performance Metrics Calculators
└── exception/          # Custom Exception Classes & Global Controller Advice Handler
```

---

## Concurrency Execution Flow

```text
Thread 1 (User A)  ──┐
                     ├──► Seat A12 (Version = 3) ──► Lock Acquired ──► Version = 4 (SUCCESS)
Thread 2 (User B)  ──┘
                     └──► Seat A12 (Version = 3) ──► Version Mismatch ──► Retry with Backoff ──► Seat Already Booked
```

1. Multiple worker threads target the exact same seat simultaneously.
2. The transaction attempts commit via JPA `@Version`.
3. The winning thread succeeds and increments the version counter.
4. Losing threads catch `ObjectOptimisticLockingFailureException`.
5. `RetryManager` delays execution exponentially ($50\text{ms}, 100\text{ms}, 200\text{ms} + \text{jitter}$) across 3 attempts before raising `SeatAlreadyBookedException`.

---

## 🚀 Getting Started

### Prerequisites
- **JDK 21**
- **Node.js** (v18 or higher)
- **Maven**
- **Docker & Docker Compose** (Optional for MySQL)

---

### Running Locally

#### 1. Start Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
> The backend server runs on `http://localhost:8080`. H2 Console is available at `http://localhost:8080/h2-console`.

#### 2. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
> The frontend application runs on `http://localhost:5173`.

---

### Running via Docker Compose

To launch Spring Boot together with MySQL in Docker containers:

```bash
docker-compose up --build
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user/admin account |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/events` | Retrieve list of all scheduled events |
| `POST` | `/api/events` | Admin create new event |
| `GET` | `/api/seats/{eventId}` | Get real-time seat availability & versions |
| `POST` | `/api/book` | Execute concurrent transactional booking request |
| `GET` | `/api/bookings` | Retrieve user booking history |
| `GET` | `/api/dashboard` | Fetch high-level performance metrics summary |
| `POST` | `/api/simulation/run` | Trigger multi-threaded ExecutorService simulation |
| `GET` | `/api/logs` | Fetch real-time transaction log stream |
| `GET` | `/api/performance` | Fetch benchmark performance history |

---

## 📄 License
This project is open-source under the MIT License.
