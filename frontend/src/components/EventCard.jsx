import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { useNavigate } from 'react-router-dom';

export default function EventCard({ event }) {
  const navigate = useNavigate();

  return (
    <Card sx={{
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 4,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 12px 30px rgba(99, 102, 241, 0.25)',
        border: '1px solid rgba(99, 102, 241, 0.4)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" fontWeight="bold" color="#f8fafc">
            {event.title}
          </Typography>
          <Chip
            label={`$${event.price}`}
            sx={{ background: 'linear-gradient(45deg, #10b981, #059669)', color: '#fff', fontWeight: 700, borderRadius: 2 }}
          />
        </Box>

        <Typography variant="body2" color="#94a3b8" mb={2} sx={{ minHeight: 40 }}>
          {event.description}
        </Typography>

        <Box display="flex" flexDirection="column" gap={1} mb={3}>
          <Box display="flex" alignItems="center" gap={1} color="#cbd5e1">
            <LocationOnIcon fontSize="small" sx={{ color: '#6366f1' }} />
            <Typography variant="body2">{event.venue}</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={3}>
            <Box display="flex" alignItems="center" gap={1} color="#cbd5e1">
              <CalendarMonthIcon fontSize="small" sx={{ color: '#a855f7' }} />
              <Typography variant="body2">{event.date}</Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} color="#cbd5e1">
              <AccessTimeIcon fontSize="small" sx={{ color: '#ec4899' }} />
              <Typography variant="body2">{event.time}</Typography>
            </Box>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} borderTop="1px solid rgba(255,255,255,0.05)">
          <Box display="flex" alignItems="center" gap={1}>
            <EventSeatIcon fontSize="small" color="action" />
            <Typography variant="caption" color={event.availableSeats > 0 ? '#10b981' : '#ef4444'} fontWeight="bold">
              {event.availableSeats} / {event.totalSeats} Available
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={() => navigate(`/seats/${event.id}`)}
            disabled={event.availableSeats <= 0}
            sx={{
              background: event.availableSeats > 0 ? 'linear-gradient(45deg, #6366f1, #a855f7)' : '#334155',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600
            }}
          >
            {event.availableSeats > 0 ? 'Select Seats' : 'Sold Out'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
