# Walkthrough: SmartTicket - Concurrent Ticket Booking & Reservation System

We have designed, implemented, and verified **SmartTicket**, a production-grade full-stack concurrent ticket reservation system built with **Java 21 / Spring Boot 3** on the backend and **React / Material UI / Chart.js** on the frontend.

---

## 1. Key Accomplishments

### Backend Architecture & Concurrency Control
- **Strict Layered Organization**: Organized clean Java package hierarchy:
  - `cmd`: [Application.java](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/cmd/Application.java) main application entry point.
  - `controller`: [AuthController](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/controller/AuthController.java), [EventController](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/controller/EventController.java), [SeatController](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/controller/SeatController.java), [BookingController](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/controller/BookingController.java), [DashboardController](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/controller/DashboardController.java), [SimulationController](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/controller/SimulationController.java).
  - `services`: [AuthService](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/services/AuthService.java), [EventService](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/services/EventService.java), [SeatService](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/services/SeatService.java), [BookingService](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/services/BookingService.java), [DashboardService](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/services/DashboardService.java).
  - `repository`: [UserRepository](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/repository/UserRepository.java), [EventRepository](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/repository/EventRepository.java), [SeatRepository](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/repository/SeatRepository.java), [BookingRepository](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/repository/BookingRepository.java), [LogRepository](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/repository/LogRepository.java).
  - `model`: JPA entities [User](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/model/User.java), [Event](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/model/Event.java), [Seat](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/model/Seat.java), [Booking](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/model/Booking.java), [TransactionLog](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/model/TransactionLog.java), [PerformanceMetric](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/model/PerformanceMetric.java).
- **Optimistic Concurrency Control (OCC)**: `Seat` entity incorporates JPA `@Version private Long version;`. If 100 users attempt to book Seat A12 simultaneously, exactly one transaction succeeds while others encounter version mismatch.
- **Exponential Backoff Retry Engine**: [RetryManager.java](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/concurrency/RetryManager.java) calculates exponential backoff ($50\text{ms}, 100\text{ms}, 200\text{ms}$ with random jitter) across 3 attempts before raising `SeatAlreadyBookedException`.
- **Multi-Threaded Simulator Engine**: [SimulationService.java](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/simulation/SimulationService.java) executes concurrent thread pools ($100$, $200$, $500$, $1000$ worker threads) using `ExecutorService` and `CountDownLatch` to benchmark throughput and conflict rates.
- **Unique Transaction ID Generator**: [TransactionIdGenerator.java](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend/src/main/java/com/smartticket/utils/TransactionIdGenerator.java) generates unique transaction IDs formatted as `TXN-YYYYMMDD-XXXXX`.

### Frontend Analytics & Seat Selection Interface
- **Dynamic Seat Selection Map**: Interactive SVG / Grid visual seat layout displaying real-time availability states:
  - **Green**: Available
  - **Yellow**: Reserved / Currently Selected
  - **Red**: Booked
- **Performance Analytics Dashboard**: Live metrics summary cards and Chart.js line, bar, and doughnut charts for visualizing throughput, response time under thread load, and retry distributions.
- **Concurrency Simulator Panel**: Interactive Admin interface to configure thread count and trigger real-time system benchmark simulations.

---

## 2. File Verification & Project Paths

The project has been established in `C:\Users\HP\.gemini\antigravity-ide\scratch\SmartTicket`:

- **Backend Location**: [SmartTicket/backend](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/backend)
- **Frontend Location**: [SmartTicket/frontend](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/frontend)
- **Docker Deployment**: [docker-compose.yml](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/docker-compose.yml)

### Recommended Action for User:
Set `C:\Users\HP\.gemini\antigravity-ide\scratch\SmartTicket` as your active workspace directory in your IDE.
