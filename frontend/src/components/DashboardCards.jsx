import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SpeedIcon from '@mui/icons-material/Speed';
import LoopIcon from '@mui/icons-material/Loop';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TimerIcon from '@mui/icons-material/Timer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export default function DashboardCards({ summary }) {
  if (!summary) return null;

  const cards = [
    { title: "Total Bookings", value: summary.totalBookings, icon: <ConfirmationNumberIcon />, color: '#6366f1' },
    { title: "Revenue Generated", value: `$${summary.totalRevenue}`, icon: <AttachMoneyIcon />, color: '#10b981' },
    { title: "Avg Booking Time", value: `${summary.averageBookingTimeMs} ms`, icon: <SpeedIcon />, color: '#3b82f6' },
    { title: "OCC Retries", value: summary.totalRetries, icon: <LoopIcon />, color: '#f59e0b' },
    { title: "Lock Conflicts", value: summary.totalConflicts, icon: <WarningAmberIcon />, color: '#ec4899' },
    { title: "Timeouts / Deadlocks", value: `${summary.totalTimeouts} / ${summary.totalDeadlocks}`, icon: <TimerIcon />, color: '#ef4444' }
  ];

  return (
    <Grid container spacing={3} mb={4}>
      {cards.map((card, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <Card sx={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4
          }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: `${card.color}20`, color: card.color }}>
                {card.icon}
              </Avatar>
              <Box>
                <Typography variant="body2" color="#94a3b8" fontWeight={500}>
                  {card.title}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#f8fafc" mt={0.5}>
                  {card.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
