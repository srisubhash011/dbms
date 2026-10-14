import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, CircularProgress, Alert } from '@mui/material';
import EventCard from '../components/EventCard';
import { eventApi } from '../api/eventApi';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventApi.getAllEvents();
      setEvents(data);
    } catch (err) {
      // Offline fallback mock data for instant frontend visualization
      setEvents([
        { id: 1, title: "Grand Rock Festival 2026", description: "Experience top rock bands performing live with immersive spatial audio.", venue: "Arena Stadium, Sector 4", date: "2026-10-15", time: "19:00", price: 85, totalSeats: 100, availableSeats: 42 },
        { id: 2, title: "Tech Innovation Summit", description: "Keynote speeches and live workshops on Distributed Systems & Cloud Infrastructure.", venue: "Convention Center, Hall A", date: "2026-10-20", time: "10:00", price: 120, totalSeats: 80, availableSeats: 18 },
        { id: 3, title: "Symphony Orchestra Concert", description: "A classical evening presenting Beethoven's Symphony No. 9 by world-class musicians.", venue: "Grand Opera Theater", date: "2026-11-02", time: "18:30", price: 60, totalSeats: 120, availableSeats: 65 }
      ]);
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
      <Box mb={4}>
        <Typography variant="h3" fontWeight="bold" color="#f8fafc" gutterBottom>
          Featured Events & Movies
        </Typography>
        <Typography variant="h6" color="#94a3b8">
          Browse upcoming shows, pick seats, and experience instant transactional reservation.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <EventCard event={event} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
