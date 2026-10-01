# Complete System Documentation & Project History: SmartTicket - Distributed Ticket Booking & Reservation System

---

## Executive Overview & Quick Reference

| Attribute | Details |
| :--- | :--- |
| **Project Title** | SmartTicket - Concurrent & Distributed Ticket Booking & Reservation System |
| **Domain** | Distributed Systems & High-Concurrency Transactional Web Applications |
| **Primary Goal** | Solve ticket overbooking under peak load using Optimistic Concurrency Control (OCC) and transition a monolithic application into a fault-tolerant, horizontally scalable microservice architecture with Redis caching. |
| **Frontend Stack** | React.js (Vite), Material UI (MUI v5), Chart.js, Axios, React Router DOM v6 |
| **Backend Stack** | Java 21, Spring Boot 3.2, Spring MVC, Spring Data JPA, Spring AMQP, Spring Data Redis |
| **Middleware & Infra**| Nginx (API Gateway / Load Balancer), Redis 7.0 (In-Memory Cache Layer), RabbitMQ (AMQP Message Broker), MySQL 8.0, Docker & Docker Compose |
| **Project Location**| `C:\Users\HP\.gemini\antigravity-ide\scratch\SmartTicket` |

---

## 1. Problem Statement

### 1.1 The High-Concurrency Overbooking Problem
When popular events (such as movie premieres, concert tours, or flight reservations) go on sale, thousands of users simultaneously select and attempt to purchase the exact same seat (e.g., Seat `A12`) within milliseconds.

In a naive database application lacking strict concurrency controls:
1. **Thread 1 (User A)** checks if Seat `A12` is `AVAILABLE` $\rightarrow$ DB returns `AVAILABLE`.
2. **Thread 2 (User B)** checks if Seat `A12` is `AVAILABLE` $\rightarrow$ DB returns `AVAILABLE` simultaneously.
3. Both threads update Seat `A12` to `BOOKED` and generate confirmed payment receipts.
4. **Result**: A double-booking disaster occurs where two customers paid for the same physical seat.

### 1.2 The Monolithic & Direct Database Bottleneck Problem
In a single monolithic server architecture (`User` $\rightarrow$ `Monolith App` $\rightarrow$ `Database`):
- High user traffic causes CPU spikes and thread pool exhaustion on the single backend process.
- Direct database access for every read query creates a bottleneck on MySQL disk I/O.
- Non-critical operations (such as sending email/SMS notifications) block the main web thread, increasing request latency.
- If the single backend application process crashes, the entire reservation platform suffers total downtime.

---

## 2. What We Did: Monolithic Java Implementation

To address the double-booking problem, we first designed a clean, layered monolithic Java 21 / Spring Boot application implementing **Optimistic Concurrency Control (OCC)** and **Exponential Backoff Retries**.

### 2.1 Backend Package Architecture
We organized the codebase into strict layers as requested:
```text
services/booking-service/src/main/java/com/smartticket/
├── cmd/                # Application.java (Spring Boot main entry point)
├── controller/         # REST Controllers (AuthController, EventController, SeatController, BookingController, DashboardController, SimulationController)
├── services/           # Business logic & Transaction orchestration (AuthService, EventService, SeatService, BookingService, DashboardService)
├── repository/         # Data Repositories (SeatDataRepository, BookingDataRepository, JPA Repositories)
├── model/              # Database entities (User, Event, Seat, Booking, TransactionLog, PerformanceMetric)
├── dto/                # Request and Response Data Transfer Objects
├── concurrency/        # OCCManager, RetryManager, DeadlockHandler, TimeoutHandler
├── simulation/         # SimulationService & ConcurrentBookingSimulator (ExecutorService multi-threaded stress tester)
├── config/             # SecurityConfig, JwtConfig, CorsConfig, InitialDataSeeder, RestTemplateConfig
├── utils/              # TransactionIdGenerator, LoggerUtil, PerformanceCalculator
└── exception/          # SeatAlreadyBookedException, BookingException, GlobalExceptionHandler
```

### 2.2 Optimistic Concurrency Control (OCC) in Java
Instead of using heavy pessimistic database row locks (which degrade throughput), we implemented OCC on the `Seat` entity using JPA's `@Version` annotation:

```java
@Entity
@Table(name = "seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "seat_number", nullable = false)
    private String seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status;

    @Version // <--- Optimistic Concurrency Lock Field
    @Column(nullable = false)
    private Long version;
}
```

---

## 3. What We Did Till Now: Distributed Microservices & Redis Caching Transformation

To prepare this project for your **Distributed Systems** college defense, we transformed the application into a **Fault-Tolerant, Scalable Distributed Microservices Architecture** with a dedicated **Redis Caching & Data-Access Layer**.

### 3.1 Distributed Architecture Diagram

```text
                           ┌──────────────────────────────────────────┐
                           │   React Frontend Web App (Port 3000)     │
                           └────────────────────┬─────────────────────┘
                                                │ REST / HTTP
                                                ▼
                           ┌──────────────────────────────────────────┐
                           │ Nginx Gateway / Load Balancer (Port 80)  │
                           └───────────┬──────────────────┬───────────┘
                                       │                  │
                    Round-Robin Load   │                  │ Direct Proxy Route
                    Balancing          ▼                  ▼
                           ┌───────────────────────┐  ┌──────────────────┐
                           │   Booking Service 1   │  │   Seat Service   │
                           └───────────┬───────────┘  └────────┬─────────┘
                                       │                       │
                           ┌───────────┴───────────┐           │
                           │   Booking Service 2   │           │
                           └───────────┬───────────┘           │
                                       │ REST Inter-Service    │
                                       └───────────┬─────────┘
                                                   │
                                                   ▼
                                       ┌───────────────────────┐
                                       │  Data Access Layer    │
                                       └───────────┬───────────┘
                                                   │
                        ┌──────────────────────────┴──────────────────────────┐
                        ▼                                                     ▼
            ┌───────────────────────┐                             ┌───────────────────────┐
            │  Redis Cache (6379)   │                             │  MySQL Database (3306)│
            └───────────────────────┘                             └───────────────────────┘

       [Asynchronous Messaging Decoupling via RabbitMQ]
       
       Booking Service 1/2 ──(BookingConfirmed Event)──► RabbitMQ (5672) ──► Notification Service
```

### 3.2 Microservice & Layer Decomposition

1. **Database Access Restriction & Repository Layer**:
   - Neither Controllers nor Business Services connect directly to MySQL or Redis.
   - Dedicated repository wrappers (`SeatDataRepository`, `BookingDataRepository`) handle all Redis cache queries, atomic locks, and MySQL JPA persistence calls.

2. **Redis Caching & Write-Through Invalidation Strategy**:
   - **Read Operations (Cache-Aside)**: Queries check Redis (`GET seats:event:{id}`) first. On **Cache HIT**, returns cached JSON payload instantly in $<5\text{ms}$. On **Cache MISS**, queries MySQL, writes to Redis with 10-minute TTL, and returns data.
   - **Write & Booking Operations**: To prevent race conditions, the repository performs an atomic Redis reservation check (`opsForValue().setIfAbsent("lock:seat:{eventId}:{seatNumber}", "RESERVED", 30s)`). If successful, MySQL JPA `@Version` OCC persists the transaction. Upon commit, Redis invalidates the stale seats cache (`DEL seats:event:{id}`).

3. **Booking Service (`services/booking-service`)**:
   - Handles user bookings, transaction IDs, and coordinates payment confirmation.
   - Calls `Seat Service` over HTTP (`http://seat-service:8080/api/seats/reserve`).
   - Publishes `BookingConfirmed` JSON events to **RabbitMQ** (`booking.events` exchange).
   - Horizontally scaled across multiple instances (`booking-service-1` and `booking-service-2`).

4. **Seat Service (`services/seat-service`)**:
   - Manages seat grid layouts, seat state management, atomic Redis locks, and JPA `@Version` OCC locks.

5. **Notification Service (`services/notification-service`)**:
   - Independent asynchronous service listening to RabbitMQ queue `notification.queue`.

6. **Nginx API Gateway / Load Balancer (`nginx/nginx.conf`)**:
   - Listens on port `80` as the unified entry point and round-robin load balances `/api/book` requests.

---

## 4. How Request Processing & Execution Travel Through the System (Viva Explanation Guide)

During your Distributed Systems viva examination, explain request routing using this exact step-by-step narrative:

1. **User Action**: The user selects Seat `A12` on the React Frontend (`:3000`) and clicks **Confirm & Pay**.
2. **API Gateway (Nginx)**: The HTTP POST request hits Nginx at `http://localhost/api/book`. Nginx selects an available Booking Service instance (e.g. `booking-service-1`) using round-robin load balancing.
3. **Booking Service**: `booking-service-1` receives the request, generates a unique Transaction ID (`TXN-20261001-A92B1`), and makes a synchronous HTTP POST call to `http://seat-service:8080/api/seats/reserve`.
4. **Data Access & Redis Atomic Lock**: `Seat Service` delegates to `SeatDataRepository`. The repository executes an atomic Redis `setIfAbsent("lock:seat:1:A12", "RESERVED", 30s)`.
   - If another thread already acquired the lock, Redis returns `false`, immediately stopping double bookings.
5. **Durable Persistence (MySQL)**: If the Redis atomic lock succeeds, `SeatDataRepository` updates MySQL. Hibernate checks `@Version`. If version matches, MySQL updates status to `BOOKED` and increments version to `4`.
6. **Cache Invalidation**: Upon successful MySQL commit, `SeatDataRepository` invalidates the stale seats cache in Redis (`DEL seats:event:1`).
7. **Asynchronous Notification (RabbitMQ)**: `booking-service-1` publishes a `BookingConfirmed` JSON event to RabbitMQ exchange `booking.events`.
8. **Notification Consumption**: `Notification Service` picks up the event asynchronously from `notification.queue` and logs receipt without delaying the user's HTTP response.

---

## 5. College Defense Verification & Demonstration Scenarios

Run these manual test scenarios to demonstrate every required concept:

### Scenario A: Normal Ticket Booking Flow & Redis Log Output
1. Open browser to [http://localhost:3000](http://localhost:3000).
2. Click **Events** $\rightarrow$ Click **Select Seats** $\rightarrow$ Pick Seat `A01` $\rightarrow$ Click **Confirm & Pay**.
3. **Observe Logs**: `docker logs -f smartticket_seat_service`
   - `[REDIS] Atomic seat reservation successful for seat=A01`
   - `[MYSQL] Booking persisted for seat=A01 (JPA Version: 1)`
   - `[REDIS] Cache invalidated for event=1`

### Scenario B: Redis Cache Hit vs Cache Miss Demonstration
1. Fetch seat availability for Event 1: `http://localhost/api/seats/1`.
2. **First Call**: Observe log `[REDIS] Cache MISS seats for event 1` $\rightarrow$ MySQL queried (Latency: ~28 ms).
3. **Second Call**: Re-fetch `http://localhost/api/seats/1`.
4. Observe log `[REDIS] Cache HIT seats for event 1` $\rightarrow$ Redis returns payload (Latency: ~4 ms, 80%+ speedup).

### Scenario C: Nginx Load Balancing Demonstration
1. View logs in side-by-side terminals:
   - Terminal 1: `docker logs -f smartticket_booking_service_1`
   - Terminal 2: `docker logs -f smartticket_booking_service_2`
2. Perform 4 seat bookings in the UI.
3. **Expected Result**: Logs show `[BOOKING-SERVICE-1]` and `[BOOKING-SERVICE-2]` alternating in processing requests.

### Scenario D: High-Concurrency Double-Booking Defense
1. In the React UI, navigate to `/simulation`.
2. Select **500 Concurrent Threads** targeting Seat `A05`.
3. Click **Run Simulation**.
4. **Expected Result**: Exactly **1** booking succeeds while 499 threads receive atomic Redis/OCC rejections (`409 Conflict`).

### Scenario E: Redis Failure & Graceful Fallback
1. Stop the Redis container: `docker stop smartticket_redis`.
2. Perform a seat booking from [http://localhost:3000](http://localhost:3000).
3. **Expected Result**: System logs `[REDIS] Redis unavailable. Fallback to MySQL.` and safely completes the booking using MySQL OCC without corrupting booking states.

---

## 6. How to Run & Stop the Application

### Start Entire System
```powershell
docker compose up --build
```

### Stop System
```powershell
docker compose down -v
```

---

## 7. Summary of Artifacts & Test Reports Created

- **Postman API Test Collection**: `SmartTicket_API_Postman_Collection.json`
- **k6 Load Test Script**: `load_test_script.js`
- **API Testing Report**: [API_TESTING_REPORT.md](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/API_TESTING_REPORT.md)
- **Performance Load Testing Report**: [PERFORMANCE_LOAD_TEST_REPORT.md](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/PERFORMANCE_LOAD_TEST_REPORT.md)
- **Project README**: [README.md](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/README.md)
