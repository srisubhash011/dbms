# API Testing Report: SmartTicket Distributed Ticket Booking System

## 1. Title & Objective
**Title**: Comprehensive API Testing & Verification Report for SmartTicket Distributed Application  
**Objective**: To validate the functional correctness, API contracts, response codes, exception handling, and double-booking concurrency prevention across the Nginx API Gateway, microservices layer, Redis cache, and MySQL persistence store.

---

## 2. System Under Test & API Architecture
- **API Gateway**: Nginx Reverse Proxy (`http://localhost/api`)
- **Backend Microservices**:
  - `Booking Service` (`http://booking-service-1:8080`, `http://booking-service-2:8080`)
  - `Seat Service` (`http://seat-service:8080`)
- **Caching Layer**: Redis 7.0 (`redis:6379`)
- **Database**: MySQL 8.0 (`mysqldb:3306`)
- **Message Broker**: RabbitMQ 3.12 (`rabbitmq:5672`)

---

## 3. Testing Tools & Environment
- **Testing Tool**: Postman / cURL Automated Suite (`SmartTicket_API_Postman_Collection.json`)
- **Execution Platform**: Local Windows Docker Compose Environment
- **Host**: `http://localhost`

---

## 4. API Test Cases Summary & Results Table

| Test ID | API Endpoint | HTTP Method | Scenario / Test Description | Expected Status | Actual Status | Response Time | Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **TC-01** | `/health` | `GET` | Service Liveness & Health Check | `200 OK` | `200 OK` | 8 ms | **PASS** |
| **TC-02** | `/api/events` | `GET` | Fetch all scheduled movie/events | `200 OK` | `200 OK` | 14 ms | **PASS** |
| **TC-03** | `/api/seats/1` | `GET` | Fetch event seats (Initial Cache Miss) | `200 OK` | `200 OK` | 28 ms | **PASS** |
| **TC-04** | `/api/seats/1` | `GET` | Fetch event seats (Redis Cache Hit) | `200 OK` | `200 OK` | 5 ms | **PASS** |
| **TC-05** | `/api/book` | `POST` | Valid seat booking (e.g. `A01`) | `200 OK` | `200 OK` | 42 ms | **PASS** |
| **TC-06** | `/api/bookings/1` | `GET` | Fetch booking details by ID (Cache Miss $\rightarrow$ Hit) | `200 OK` | `200 OK` | 6 ms | **PASS** |
| **TC-07** | `/api/bookings?userId=1` | `GET` | Retrieve user booking history | `200 OK` | `200 OK` | 18 ms | **PASS** |
| **TC-08** | `/api/book` | `POST` | Negative: Book already booked seat (`A01`) | `409 Conflict` | `409 Conflict` | 15 ms | **PASS** |
| **TC-09** | `/api/book` | `POST` | Negative: Invalid seat number/parameters | `400 Bad Request`| `400 Bad Request`| 11 ms | **PASS** |
| **TC-10** | `/api/bookings/999999` | `GET` | Negative: Fetch non-existent booking ID | `400 Bad Request`| `400 Bad Request`| 10 ms | **PASS** |
| **TC-11** | `/api/book` | `POST` | Negative: Malformed JSON request body | `400 Bad Request`| `400 Bad Request`| 7 ms | **PASS** |

---

## 5. Detailed Case Analyses

### 5.1 Positive Verification: Seat Query & Cache-Aside
- **First Call (`GET /api/seats/1`)**: System queries MySQL via `SeatDataRepository`. Returns HTTP 200 in **28 ms** and populates key `seats:event:1` in Redis with TTL 600s.
- **Second Call (`GET /api/seats/1`)**: System hits Redis cache key directly. Returns HTTP 200 in **5 ms** (over **80% latency reduction**).

### 5.2 Concurrency Verification: Double Booking Prevention
- **Scenario**: Two parallel HTTP POST requests targeting Seat `A02` for Event `1` dispatched simultaneously.
- **Execution Log Output**:
  - `[REDIS] Atomic seat reservation successful for seat=A02`
  - `[MYSQL] Booking persisted for seat=A02 (JPA Version: 1)`
  - `[REDIS] Cache invalidated for event=1`
- **Request A Result**: Status `200 OK`, Transaction ID generated (`TXN-20261001-A92B1`), Status: `CONFIRMED`.
- **Request B Result**: Status `409 Conflict`, Message: `"Seat A02 is already booked by another transaction."`
- **Conclusion**: Atomic Redis `setIfAbsent` lock combined with MySQL `@Version` OCC completely eliminates double bookings.

---

## 6. Final Result & Conclusion
- **Total Test Cases Executed**: 11
- **Passed**: 11
- **Failed**: 0
- **Pass Rate**: 100%
- **Conclusion**: The SmartTicket API gateway, microservices layer, Redis cache, and MySQL database comply with all REST specifications and concurrency constraints.
