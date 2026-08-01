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
      setError('Failed to load events. Make sure Spring Boot backend is running on port 8080.');
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
