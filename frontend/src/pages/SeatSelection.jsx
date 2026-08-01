import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import SeatGrid from '../components/SeatGrid';
import { eventApi } from '../api/eventApi';
import { bookingApi } from '../api/bookingApi';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

export default function SeatSelection() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadSeatsOnly, 3000); // Live poll seat availability updates
    return () => clearInterval(interval);
  }, [eventId]);

  const loadData = async () => {
    try {
      const [evt, stList] = await Promise.all([
        eventApi.getEventById(eventId),
        eventApi.getSeats(eventId)
      ]);
      setEvent(evt);
      setSeats(stList);
    } catch (err) {
      setError('Failed to fetch event or seats');
    } finally {
      setLoading(false);
    }
  };

  const loadSeatsOnly = async () => {
    try {
      const stList = await eventApi.getSeats(eventId);
      setSeats(stList);
    } catch (err) {}
  };

  const handleBookTicket = async () => {
    if (!selectedSeat) return;
    setBookingLoading(true);
    setError('');
    try {
      const res = await bookingApi.bookTicket({
        eventId: Number(eventId),
        seatId: selectedSeat.id,
        seatNumber: selectedSeat.seatNumber,
        userId: 1
      });
      setBookingSuccess(res);
      loadData(); // Refresh seat states
    } catch (err) {
      setError(err.response?.data?.message || 'Seat Already Booked. Retrying... Attempt 1, Attempt 2, Attempt 3 failed due to OCC Lock.');
    } finally {
      setBookingLoading(false);
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
      {event && (
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" color="#f8fafc">
            {event.title}
          </Typography>
          <Typography variant="body1" color="#94a3b8" mt={0.5}>
            {event.venue} | Date: {event.date} | Time: {event.time}
          </Typography>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <SeatGrid seats={seats} selectedSeat={selectedSeat} onSelectSeat={setSelectedSeat} />
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 4, background: 'rgba(30, 41, 59, 0.8)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography variant="h6" fontWeight="bold" color="#f8fafc" mb={3}>
              Booking Summary
            </Typography>

            {selectedSeat ? (
              <Box display="flex" flexDirection="column" gap={2} mb={4}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="#94a3b8">Selected Seat:</Typography>
                  <Typography fontWeight="bold" color="#a855f7">{selectedSeat.seatNumber}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="#94a3b8">Status:</Typography>
                  <Chip label="Selected" color="warning" size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="#94a3b8">OCC JPA Version:</Typography>
                  <Typography color="#cbd5e1">{selectedSeat.version || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" borderTop="1px solid rgba(255,255,255,0.1)" pt={2}>
                  <Typography variant="h6" color="#f8fafc">Total Amount:</Typography>
                  <Typography variant="h6" color="#10b981" fontWeight="bold">${event?.price}</Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="#64748b" mb={4}>
                Please click an available green seat on the map to proceed with booking.
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={!selectedSeat || bookingLoading}
              onClick={handleBookTicket}
              startIcon={<ConfirmationNumberIcon />}
              sx={{ py: 1.5, background: 'linear-gradient(45deg, #6366f1, #a855f7)', fontWeight: 700, borderRadius: 2 }}
            >
              {bookingLoading ? 'Processing OCC Transaction...' : 'Confirm & Pay'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Modal */}
      <Dialog open={Boolean(bookingSuccess)} onClose={() => setBookingSuccess(null)} PaperProps={{ sx: { background: '#0f172a', color: '#fff', borderRadius: 4, p: 2 } }}>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#10b981', mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">Booking Confirmed!</Typography>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={1.5} sx={{ bg: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="#94a3b8">Transaction ID:</Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="#6366f1">{bookingSuccess?.transactionId}</Typography>
            <Typography variant="body2" color="#94a3b8">Seat Number:</Typography>
            <Typography variant="body1" fontWeight="bold" color="#fff">{bookingSuccess?.seatNumber}</Typography>
            <Typography variant="body2" color="#94a3b8">Execution Time:</Typography>
            <Typography variant="body1" color="#10b981">{bookingSuccess?.executionTimeMs} ms (Retries: {bookingSuccess?.retriesAttempted})</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button variant="contained" onClick={() => navigate('/history')} sx={{ background: 'linear-gradient(45deg, #6366f1, #a855f7)' }}>
            View Receipt in History
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
