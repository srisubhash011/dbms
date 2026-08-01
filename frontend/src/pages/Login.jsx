import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert, MenuItem } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('user@smartticket.com');
  const [password, setPassword] = useState('user123');
  const [role, setRole] = useState('ROLE_USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      loginUser(data);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(12px)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" color="#f8fafc" mb={1}>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="#94a3b8" textAlign="center" mb={4}>
          Sign in to access SmartTicket concurrency portal
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              variant="outlined"
              sx={{ input: { color: '#fff' } }}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              variant="outlined"
              sx={{ input: { color: '#fff' } }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<LoginIcon />}
              sx={{ py: 1.5, background: 'linear-gradient(45deg, #6366f1, #a855f7)', fontWeight: 700, borderRadius: 2 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>
        </form>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="#94a3b8">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none' }}>
              Register Here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
