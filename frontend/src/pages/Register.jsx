import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert, MenuItem } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.register({ name, email, password, role });
      loginUser(data);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(12px)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" color="#f8fafc" mb={1}>
          Create Account
        </Typography>
        <Typography variant="body2" color="#94a3b8" textAlign="center" mb={4}>
          Join SmartTicket high concurrency platform
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              sx={{ input: { color: '#fff' } }}
            />

            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              sx={{ input: { color: '#fff' } }}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              sx={{ input: { color: '#fff' } }}
            />

            <TextField
              select
              label="Account Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
              sx={{ select: { color: '#fff' } }}
            >
              <MenuItem value="USER">User (Standard Ticket Booking)</MenuItem>
              <MenuItem value="ADMIN">Admin (Manage Events & Run Simulator)</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<PersonAddIcon />}
              sx={{ py: 1.5, background: 'linear-gradient(45deg, #6366f1, #a855f7)', fontWeight: 700, borderRadius: 2 }}
            >
              {loading ? 'Creating Account...' : 'Register Now'}
            </Button>
          </Box>
        </form>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="#94a3b8">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none' }}>
              Login Here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
