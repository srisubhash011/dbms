# SmartTicket - Distributed Ticket Booking & Reservation Application

SmartTicket is an enterprise-grade **Distributed Ticket Booking Application** engineered for college Distributed Systems projects. It demonstrates Microservices Architecture, Containerization, Load Balancing, Horizontal Scalability, Redis Caching, Asynchronous Messaging, Optimistic Concurrency Control (OCC), and Service Fault Tolerance.

---

## 🏗️ Distributed Architecture Overview

```text
                           ┌─────────────────────────────────────────┐
                           │      React Web Frontend (Port 3000)     │
                           └────────────────────┬────────────────────┘
                                                │ REST / HTTP
                                                ▼
                           ┌─────────────────────────────────────────┐
                           │  Nginx API Gateway / Load Balancer (80) │
                           └───────────┬─────────────────┬───────────┘
                                       │                 │
                Round-Robin Load       │                 │ Direct Proxy Route
                Balancing              ▼                 ▼
                       ┌──────────────────────┐  ┌──────────────────┐
                       │  Booking Service 1   │  │   Seat Service   │
                       └───────────┬──────────┘  └────────┬─────────┘
                                   │                      │
                       ┌───────────┴──────────┐           │
                       │  Booking Service 2   │           │
                       └───────────┬──────────┘           │
                                   │ REST / HTTP          │
                                   └──────────┬───────────┘
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │ Data Access Layer    │
                                   └──────────┬───────────┘
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        ▼                                           ▼
            ┌──────────────────────┐                    ┌──────────────────────┐
            │   Redis Cache (6379) │                    │  MySQL Database(3306)│
            └──────────────────────┘                    └──────────────────────┘

       [Asynchronous Messaging Decoupling via RabbitMQ]
       
       Booking Service 1/2 ──(BookingConfirmed Event)──► RabbitMQ (5672) ──► Notification Service
```

---

## ⚡ Caching Strategy (Redis + MySQL)

1. **Read Operations (Cache-Aside Pattern)**:
   - When a service queries seat layouts or booking details, `SeatDataRepository` / `BookingDataRepository` checks Redis first (`GET seats:event:{id}`).
   - **Cache HIT**: Returns cached JSON payload instantly in $<5\text{ms}$.
   - **Cache MISS**: Queries MySQL, writes JSON to Redis with 10-minute TTL, and returns data.

2. **Write & Booking Strategy (Atomic Lock + Write-Through Invalidation)**:
   - To prevent double bookings across distributed instances, the repository executes an atomic Redis reservation check (`opsForValue().setIfAbsent("lock:seat:{eventId}:{seatNumber}", "RESERVED", 30s)`).
   - Once reserved in Redis, the transaction persists to MySQL using JPA `@Version` Optimistic Concurrency Control (OCC).
   - Upon successful database commit, Redis invalidates the stale event seats cache (`DEL seats:event:{id}`).
   - If MySQL persistence fails, the temporary Redis reservation lock is released safely.

3. **Cache Consistency**:
   - MySQL remains the durable persistent source of truth.
   - Critical reservation data uses atomic Redis checks to prioritize booking correctness over naive speed.

---

## 🚀 Key Distributed Systems Concepts Demonstrated

1. **Microservices Architecture**: Independent domain services (`booking-service`, `seat-service`, `notification-service`).
2. **Horizontal Scalability & Load Balancing**: Nginx distributes traffic across multiple Booking Service instances (`booking-service-1` and `booking-service-2`).
3. **In-Memory Caching**: Redis 7.0 caching layer providing sub-5ms read latencies and atomic reservation locks.
4. **Asynchronous Messaging**: Decoupled event-driven notification dispatch via **RabbitMQ** (`booking.events` topic exchange).
5. **Synchronous Inter-Service REST**: Booking Service communicates with Seat Service over internal Docker network (`http://seat-service:8080`).
6. **Concurrency & OCC Control**: Atomic Redis locks + JPA `@Version` OCC with Exponential Backoff Retries to prevent double bookings.
7. **Fault Tolerance**: Redundant booking nodes and graceful Redis fallback to MySQL.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Material UI (MUI v5), Chart.js
- **Backend Microservices**: Java 21, Spring Boot 3.2, Spring MVC, Spring Data JPA, Spring AMQP, Spring Data Redis
- **Load Balancer / API Gateway**: Nginx Reverse Proxy
- **Caching Layer**: Redis 7.0
- **Message Broker**: RabbitMQ 3.12 (AMQP Protocol & Web Management UI)
- **Database**: MySQL 8.0 with HikariCP connection pooling
- **Containerization**: Docker & Docker Compose

---

## ⚡ How to Build & Run Locally

### Start Entire Distributed Stack with Docker Compose
From the root directory, execute:
```bash
docker compose up --build
```

### Access Running Components
- **Web Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Nginx API Gateway**: [http://localhost/api](http://localhost/api)
- **RabbitMQ Management Dashboard**: [http://localhost:15672](http://localhost:15672) (User: `guest`, Pass: `guest`)
- **Redis Cache**: `localhost:6379`
- **MySQL Database**: `localhost:3306` (User: `root`, Pass: `root`, DB: `smartticketdb`)

---

## 🧪 API Testing & Performance Load Testing

- **Postman API Suite**: Import `SmartTicket_API_Postman_Collection.json` for automated endpoint tests.
- **API Testing Report**: Refer to [API_TESTING_REPORT.md](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/API_TESTING_REPORT.md).
- **Performance Load Report**: Refer to [PERFORMANCE_LOAD_TEST_REPORT.md](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/SmartTicket/PERFORMANCE_LOAD_TEST_REPORT.md).

### Quick k6 Load Test Execution
```bash
k6 run load_test_script.js
```

---

## 🛡️ Service Fault Tolerance

1. **Booking Service Failure**:
   ```bash
   docker stop smartticket_booking_service_1
   ```
   Nginx automatically routes incoming traffic to `booking-service-2` without user disruption.

2. **Notification Service Failure**:
   ```bash
   docker stop smartticket_notification_service
   ```
   Booking events queue safely in RabbitMQ `notification.queue` and are consumed immediately when the service restarts.

3. **Redis Failure & Fallback**:
   If Redis becomes unavailable, the repository logs `[REDIS] Redis unavailable. Fallback to MySQL.` and falls back safely to MySQL OCC without corrupting booking states.

---

## ⚠️ Known Limitations

- **Centralized Persistence**: MySQL remains a centralized database and potential single point of failure (SPOF). Production setups require database replication or sharded clusters.
- **Redis In-Memory State**: Redis is used for high-speed caching and atomic locking; MySQL remains the durable source of truth.
- **Academic Scope**: Designed for local Docker Compose demonstration and Distributed Systems defense.
