import React from 'react';
import { Box, Typography, Tooltip, Paper } from '@mui/material';

export default function SeatGrid({ seats, selectedSeat, onSelectSeat }) {
  const getStatusColor = (status, isSelected) => {
    if (isSelected) return { bg: '#eab308', text: '#000', border: '#ca8a04', label: 'Selected' }; // Yellow
    if (status === 'BOOKED') return { bg: '#ef4444', text: '#fff', border: '#dc2626', label: 'Booked' }; // Red
    if (status === 'RESERVED') return { bg: '#eab308', text: '#000', border: '#ca8a04', label: 'Reserved' }; // Yellow
    return { bg: '#22c55e', text: '#fff', border: '#16a34a', label: 'Available' }; // Green
  };

  return (
    <Paper sx={{ p: 4, background: 'rgba(15, 23, 42, 0.8)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Screen Visual Indicator */}
      <Box sx={{ width: '80%', mx: 'auto', mb: 6, textAlign: 'center' }}>
        <Box sx={{
          height: 12,
          background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.6)'
        }} />
        <Typography variant="caption" sx={{ color: '#64748b', letterSpacing: 3, fontWeight: 700, mt: 1, display: 'block' }}>
          STAGE / CINEMA SCREEN
        </Typography>
      </Box>

      {/* Seat Layout Legend */}
      <Box display="flex" justifyContent="center" gap={4} mb={4}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width: 20, height: 20, borderRadius: 1, background: '#22c55e' }} />
          <Typography variant="body2" color="#94a3b8">Available (Green)</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width: 20, height: 20, borderRadius: 1, background: '#eab308' }} />
          <Typography variant="body2" color="#94a3b8">Selected/Reserved (Yellow)</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width: 20, height: 20, borderRadius: 1, background: '#ef4444' }} />
          <Typography variant="body2" color="#94a3b8">Booked (Red)</Typography>
        </Box>
      </Box>

      {/* Dynamic Grid */}
      <Box display="grid" gridTemplateColumns="repeat(10, 1fr)" gap={2} maxwidth={650} mx="auto">
        {seats.map((seat) => {
          const isSelected = selectedSeat?.id === seat.id;
          const { bg, text, border, label } = getStatusColor(seat.status, isSelected);
          const isBooked = seat.status === 'BOOKED';

          return (
            <Tooltip key={seat.id} title={`Seat ${seat.seatNumber} - ${label} (Version ${seat.version || 0})`} arrow>
              <Box
                onClick={() => !isBooked && onSelectSeat(seat)}
                sx={{
                  aspectRatio: '1',
                  borderRadius: 2,
                  background: bg,
                  border: `2px solid ${border}`,
                  color: text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: isBooked ? 'not-allowed' : 'pointer',
                  opacity: isBooked ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 15px rgba(234, 179, 8, 0.8)' : 'none',
                  '&:hover': {
                    transform: isBooked ? 'none' : 'scale(1.12)',
                    zIndex: 2
                  }
                }}
              >
                {seat.seatNumber}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Paper>
  );
}
