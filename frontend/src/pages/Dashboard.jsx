import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import DashboardCards from '../components/DashboardCards';
import PerformanceCharts from '../components/PerformanceCharts';
import { dashboardApi } from '../api/dashboardApi';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [sum, perf, lg] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getPerformance(),
        dashboardApi.getLogs()
      ]);
      setSummary(sum);
      setMetrics(perf);
      setLogs(lg);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" fontWeight="bold" color="#f8fafc" mb={3}>
        Concurrency & System Performance Analytics
      </Typography>

      <DashboardCards summary={summary} />
      <PerformanceCharts metrics={metrics} summary={summary} />

      {/* Transaction Logs Table */}
      <Box mt={6}>
        <Typography variant="h5" fontWeight="bold" color="#f8fafc" mb={2}>
          Real-Time Transaction Log Stream
        </Typography>
        <Paper sx={{ background: 'rgba(30, 41, 59, 0.8)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Table size="small">
            <TableHead sx={{ background: 'rgba(15, 23, 42, 0.9)' }}>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Thread Name</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Transaction ID</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Exec Time (ms)</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Retries</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.slice(0, 10).map((log) => (
                <TableRow key={log.id}>
                  <TableCell sx={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{log.threadName}</TableCell>
                  <TableCell sx={{ color: '#6366f1' }}>{log.transactionId}</TableCell>
                  <TableCell sx={{ color: '#10b981' }}>{log.executionTimeMs} ms</TableCell>
                  <TableCell sx={{ color: '#f59e0b' }}>{log.retryCount}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.status}
                      color={log.status === 'SUCCESS' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>{log.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Container>
  );
}
