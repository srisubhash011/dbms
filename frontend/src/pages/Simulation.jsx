import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, TextField, Select, MenuItem, Grid, Card, CardContent, CircularProgress, Alert, Chip } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LoopIcon from '@mui/icons-material/Loop';
import TimerIcon from '@mui/icons-material/Timer';
import MemoryIcon from '@mui/icons-material/Memory';
import { dashboardApi } from '../api/dashboardApi';
import { eventApi } from '../api/eventApi';

export default function Simulation() {
  const [threadCount, setThreadCount] = useState(100);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [simulateConflicts, setSimulateConflicts] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    eventApi.getAllEvents().then((evts) => {
      setEvents(evts);
      if (evts.length > 0) setSelectedEventId(evts[0].id);
    });
  }, []);

  const handleRunSimulation = async () => {
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const res = await dashboardApi.runSimulation({
        threadCount: Number(threadCount),
        eventId: Number(selectedEventId),
        simulateConflicts
      });
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Simulation failed to complete.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" color="#f8fafc">
          Multi-Threaded Concurrency Simulator
        </Typography>
        <Typography variant="body1" color="#94a3b8" mt={0.5}>
          Spawns Java ExecutorService worker threads (100, 200, 500, 1000) simultaneously competing for tickets to test OCC locks and Exponential Backoff.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 4, background: 'rgba(30, 41, 59, 0.8)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography variant="h6" fontWeight="bold" color="#f8fafc" mb={3}>
              Simulation Parameters
            </Typography>

            <Box display="flex" flexDirection="column" gap={3}>
              <Box>
                <Typography variant="body2" color="#94a3b8" mb={1}>Thread Pool Count:</Typography>
                <Select
                  fullWidth
                  value={threadCount}
                  onChange={(e) => setThreadCount(e.target.value)}
                  sx={{ color: '#fff' }}
                >
                  <MenuItem value={100}>100 Concurrent Threads</MenuItem>
                  <MenuItem value={200}>200 Concurrent Threads</MenuItem>
                  <MenuItem value={500}>500 Concurrent Threads</MenuItem>
                  <MenuItem value={1000}>1000 Concurrent Threads</MenuItem>
                </Select>
              </Box>

              <Box>
                <Typography variant="body2" color="#94a3b8" mb={1}>Target Event:</Typography>
                <Select
                  fullWidth
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  sx={{ color: '#fff' }}
                >
                  {events.map((e) => (
                    <MenuItem key={e.id} value={e.id}>{e.title}</MenuItem>
                  ))}
                </Select>
              </Box>

              <Button
                variant="contained"
                size="large"
                disabled={running}
                onClick={handleRunSimulation}
                startIcon={running ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                sx={{ py: 1.5, background: 'linear-gradient(45deg, #ec4899, #8b5cf6)', fontWeight: 700, borderRadius: 2 }}
              >
                {running ? 'Running Simulation...' : 'Run Simulation'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={8}>
          {result ? (
            <Box display="flex" flexDirection="column" gap={3}>
              <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />}>
                {result.statusMessage}
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="caption" color="#94a3b8">Successful Bookings</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#10b981" mt={1}>
                        {result.successfulBookings}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="caption" color="#94a3b8">Failed / Retried</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#ef4444" mt={1}>
                        {result.failedBookings}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="caption" color="#94a3b8">Avg Response Time</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#3b82f6" mt={1}>
                        {result.averageResponseMs} ms
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="caption" color="#94a3b8">OCC Conflicts Caught</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#f59e0b" mt={1}>
                        {result.conflicts}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="caption" color="#94a3b8">CPU / Memory Usage</Typography>
                      <Typography variant="h6" fontWeight="bold" color="#a855f7" mt={1}>
                        {result.cpuUsagePercent}% CPU | {result.memoryUsageMb} MB
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="caption" color="#94a3b8">Total Execution Time</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#f43f5e" mt={1}>
                        {result.totalTimeSeconds} sec
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center', background: 'rgba(30, 41, 59, 0.4)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 4 }}>
              <SpeedIcon sx={{ fontSize: 64, color: '#64748b', mb: 2 }} />
              <Typography variant="h6" color="#94a3b8">
                Click "Run Simulation" to start testing multi-threaded concurrent requests
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
