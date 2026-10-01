import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    read_seats_scenario: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '10s', target: 25 },
        { duration: '20s', target: 50 },
        { duration: '10s', target: 0 },
      ],
      gracefulStop: '5s',
    },
  },
};

export default function () {
  // Scenario 1: Cache hit vs miss read test
  const res = http.get('http://localhost/api/seats/1');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
  });
  sleep(0.1);
}
