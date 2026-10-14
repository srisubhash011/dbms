# SmartTicket Frontend Demo

A standalone, responsive frontend preview for the SmartTicket ticket booking system. It uses hardcoded event and benchmark data and does not require a backend, npm install, or build step.

## Run

Open `index.html` in a modern browser. For browser security policies that block local scripts, run a static server from this folder, for example:

```sh
python -m http.server 5173
```

Then visit `http://localhost:5173`.

## Demo behavior

- Browse and filter three seeded events.
- Open a seat map, select an available seat, and create a local demo booking.
- View tickets saved in this browser using `localStorage`.
- Explore hardcoded dashboard metrics and a client-side hot-seat simulation.
- Reset demo bookings and seat selections from Admin tools.

The page does not call SmartTicket APIs, collect payment, authenticate users, or provide live infrastructure health. Demo metrics mirror the project report and are labeled as a hardcoded snapshot.
