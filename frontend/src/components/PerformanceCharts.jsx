import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Grid, Paper, Typography, Box } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function PerformanceCharts({ metrics, summary }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
      }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  // Response Time Line Chart Data
  const labels = metrics && metrics.length > 0
    ? metrics.map((m, i) => `Run #${i + 1} (${m.totalThreads} Threads)`)
    : ['Run #1', 'Run #2', 'Run #3', 'Run #4', 'Run #5'];

  const responseTimeData = {
    labels,
    datasets: [
      {
        label: 'Avg Response Time (ms)',
        data: metrics && metrics.length > 0 ? metrics.map(m => m.averageResponseMs) : [12.4, 45.2, 110.8, 240.5, 410.2],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Thread Performance Breakdown Bar Chart Data
  const threadPerfData = {
    labels,
    datasets: [
      {
        label: 'Success Bookings',
        data: metrics && metrics.length > 0 ? metrics.map(m => m.successfulBookings) : [100, 180, 420, 780, 850],
        backgroundColor: '#22c55e'
      },
      {
        label: 'OCC Conflicts',
        data: metrics && metrics.length > 0 ? metrics.map(m => m.conflicts) : [0, 20, 80, 220, 150],
        backgroundColor: '#ef4444'
      }
    ]
  };

  // Booking Status Doughnut Data
  const statusDoughnutData = {
    labels: ['Confirmed Bookings', 'Failed/Conflict Retries'],
    datasets: [
      {
        data: summary ? [summary.confirmedBookings, summary.totalConflicts + summary.totalRetries] : [130, 25],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 0
      }
    ]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, background: 'rgba(30, 41, 59, 0.7)', borderRadius: 4, height: 340 }}>
          <Typography variant="h6" color="#f8fafc" fontWeight="bold" mb={2}>
            Thread Response Time vs Load
          </Typography>
          <Box height={250}>
            <Line data={responseTimeData} options={chartOptions} />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, background: 'rgba(30, 41, 59, 0.7)', borderRadius: 4, height: 340 }}>
          <Typography variant="h6" color="#f8fafc" fontWeight="bold" mb={2}>
            Concurrent Simulation Throughput
          </Typography>
          <Box height={250}>
            <Bar data={threadPerfData} options={chartOptions} />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, background: 'rgba(30, 41, 59, 0.7)', borderRadius: 4, height: 320 }}>
          <Typography variant="h6" color="#f8fafc" fontWeight="bold" mb={2}>
            Booking Status Distribution
          </Typography>
          <Box height={220} display="flex" justifyContent="center">
            <Doughnut data={statusDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
