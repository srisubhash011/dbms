import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip, Container } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SpeedIcon from '@mui/icons-material/Speed';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="sticky" sx={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters justifycontent="space-between">
          <Box display="flex" alignItems="center" gap={1.5} component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
            <ConfirmationNumberIcon sx={{ fontSize: 32, color: '#6366f1' }} />
            <Typography variant="h6" fontWeight="bold" sx={{ background: 'linear-gradient(45deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SmartTicket
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, ml: 4 }}>
            <Button component={Link} to="/events" startIcon={<ConfirmationNumberIcon />} sx={{ color: isActive('/events') ? '#a855f7' : '#94a3b8', fontWeight: isActive('/events') ? 700 : 500 }}>
              Events
            </Button>
            <Button component={Link} to="/dashboard" startIcon={<DashboardIcon />} sx={{ color: isActive('/dashboard') ? '#a855f7' : '#94a3b8', fontWeight: isActive('/dashboard') ? 700 : 500 }}>
              Analytics
            </Button>
            <Button component={Link} to="/simulation" startIcon={<SpeedIcon />} sx={{ color: isActive('/simulation') ? '#a855f7' : '#94a3b8', fontWeight: isActive('/simulation') ? 700 : 500 }}>
              Concurrency Simulator
            </Button>
            {user && (
              <Button component={Link} to="/history" startIcon={<HistoryIcon />} sx={{ color: isActive('/history') ? '#a855f7' : '#94a3b8', fontWeight: isActive('/history') ? 700 : 500 }}>
                My Bookings
              </Button>
            )}
            {isAdmin && (
              <Button component={Link} to="/admin" startIcon={<AdminPanelSettingsIcon />} sx={{ color: isActive('/admin') ? '#ec4899' : '#f43f5e', fontWeight: 700 }}>
                Admin Portal
              </Button>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {user ? (
              <>
                <Chip label={user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'} color={user.role === 'ROLE_ADMIN' ? 'secondary' : 'primary'} size="small" variant="outlined" />
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                  {user.name}
                </Typography>
                <Button variant="outlined" color="error" size="small" startIcon={<LogoutIcon />} onClick={logoutUser}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" variant="outlined" color="primary" startIcon={<LoginIcon />}>
                  Login
                </Button>
                <Button component={Link} to="/register" variant="contained" sx={{ background: 'linear-gradient(45deg, #6366f1, #a855f7)' }}>
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
