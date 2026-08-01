import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Table, TableHead, TableRow, TableTableCell, TableBody, TableCell, Chip, Box, CircularProgress, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { bookingApi } from '../api/bookingApi';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingApi.getUserBookings(1);
      setBookings(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (booking) => {
    const text = `=====================================\n` +
      `           SMARTTICKET RECEIPT        \n` +
      `=====================================\n` +
      `Transaction ID: ${booking.transactionId}\n` +
      `Date & Time:    ${booking.bookingTime}\n` +
      `Event Title:    ${booking.event?.title || 'Avengers: Secret Wars Premiere'}\n` +
      `Seat Number:    ${booking.seat?.seatNumber}\n` +
      `Status:         ${booking.status}\n` +
      `=====================================\n` +
      `Thank you for using SmartTicket System!`;
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Receipt-${booking.transactionId}.txt`;
    document.body.appendChild(element);
    element.click();
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
        My Booking History
      </Typography>

      <Paper sx={{ background: 'rgba(30, 41, 59, 0.8)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Table>
          <TableHead sx={{ background: 'rgba(15, 23, 42, 0.9)' }}>
            <TableRow>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Transaction ID</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Event</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Seat</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Booking Time</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Receipt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ color: '#6366f1', fontWeight: 600 }}>{row.transactionId}</TableCell>
                  <TableCell sx={{ color: '#f8fafc' }}>{row.event?.title || 'Event'}</TableCell>
                  <TableCell sx={{ color: '#a855f7', fontWeight: 700 }}>{row.seat?.seatNumber}</TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{new Date(row.bookingTime).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownloadReceipt(row)} sx={{ color: '#a855f7' }}>
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#64748b', py: 4 }}>
                  No bookings found yet. Pick an event to book tickets!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
