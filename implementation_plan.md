# Implementation Plan: SmartTicket - Concurrent Ticket Booking & Reservation System

SmartTicket is a high-concurrency ticket booking and reservation web platform built with Java 21 / Spring Boot on the backend and React + Material UI / Chart.js on the frontend. It features Optimistic Concurrency Control (OCC) using JPA `@Version`, Exponential Backoff retry mechanics, multi-threaded stress simulation via Java `ExecutorService`, comprehensive performance metrics logging, and a real-time analytics dashboard.

## Technical Architecture & Design Decisions

### Backend Layering (as explicitly requested)
- `cmd`: Contains `Application.java` (main application entry point).
- `controller`: REST endpoints calling Services.
- `services`: Business logic, transaction boundaries, OCC handling, calling Repository functions.
- `repository`: JPA Data Repositories with custom queries / methods.
- `model`: Entity definitions mapping DB schemas (`User`, `Event`, `Seat`, `Booking`, `TransactionLog`, `PerformanceMetric`).
- `dto`: Request/Response objects.
- `concurrency`: OCCManager, RetryManager, DeadlockHandler, TimeoutHandler.
- `simulation`: Multi-threaded booking simulator (`ConcurrentBookingSimulator`).
- `config`, `exception`, `utils`: Security, JWT, CORS, Exception handlers, Transaction ID generator (`TXN-YYYYMMDD-XXXXX`).

### Concurrency Mechanics
1. **Optimistic Concurrency Control (OCC)**: `Seat` entity uses `@Version private Long version`.
2. **Exponential Backoff**: When `ObjectOptimisticLockingFailureException` occurs during simultaneous booking attempts, `RetryManager` retries up to $N$ attempts with exponential backoff delay (e.g. 50ms, 100ms, 200ms) with jitter.
3. **Simulation Engine**: `SimulationService` triggers $100$, $200$, $500$, or $1000$ concurrent worker threads using `ExecutorService` attempting to book randomly or specifically selected seats to measure conflicts, retries, response time, CPU/Memory metrics, deadlocks, and timeouts.

### Frontend Features
- **Auth**: Login / Register with JWT, Role-based view switching (Admin / User).
- **Event Browsing & Dynamic Seat Layout**: Interactive SVG / Grid visual seat map with real-time state colors (Green = Available, Yellow = Selected/Reserved, Red = Booked).
- **Performance Analytics Dashboard**: Live metrics cards (Total Bookings, Conflicts, Retries, Deadlocks, Timeouts, Avg Response Time) and Chart.js visualizations (Occupancy, Status split, Thread performance).
- **Multi-threaded Simulator UI**: Admin interface to configure simulation thread count ($100$–$1000$), trigger execution, and visualize real-time benchmark results.

---

## User Review Required

> [!IMPORTANT]
> - Database: H2 database configured in MySQL compatibility mode will be included by default for quick standalone out-of-the-box execution, alongside MySQL Docker compose & application-mysql properties for seamless production deployment.
> - Workspace Directory: Work will be located in `C:\Users\HP\.gemini\antigravity-ide\scratch\SmartTicket`.

---

## Proposed Plan of Action

### Phase 1: Spring Boot Backend Foundation & Concurrency Engine
1. Initialize Spring Boot project structure (`pom.xml`, `cmd/Application.java`, `config/`).
2. Implement Models (`User`, `Event`, `Seat` with `@Version`, `Booking`, `TransactionLog`, `PerformanceMetric`).
3. Implement Repositories & DTOs.
4. Implement Concurrency Engine (`OCCManager`, `RetryManager`, `DeadlockHandler`, `TimeoutHandler`).
5. Implement Services (`AuthService`, `EventService`, `SeatService`, `BookingService`, `DashboardService`, `SimulationService`).
6. Implement Controllers & REST API endpoints.
7. Implement JWT Security (`SecurityConfig`, `JwtConfig`, `JwtAuthenticationFilter`).

### Phase 2: React Frontend UI & Analytics Dashboard
1. Initialize Vite React project with Material UI, Chart.js, Axios, React Router.
2. Build Design System & Layout (Navbar, Sidebar, Themes, Glassmorphic Dashboard cards).
3. Build Components: Dynamic interactive `SeatGrid`, `EventCard`, `DashboardCards`, `PerformanceCharts`.
4. Build Pages: `Login`, `Register`, `Events`, `SeatSelection`, `BookingHistory`, `Dashboard`, `AdminPanel`, `Simulation`.

### Phase 3: Verification & Integration Testing
1. Test multi-threaded concurrency booking logic.
2. Run simulation engine tests with 100+ concurrent threads to verify backoff retry logic and conflict logging.
3. Validate API Swagger docs and frontend components.

---

## Verification Plan

### Automated & Unit Tests
- Spring Boot test suite validating OCC locks under concurrent execution.
- JUnit simulation test confirming only 1 booking succeeds when 50 threads compete for 1 seat.

### Manual Verification
- Visual inspection of dynamic seat map updates.
- Execution of multi-threaded simulation from frontend Admin panel and monitoring live chart updates.
