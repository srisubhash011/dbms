import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { eventApi } from '../api/eventApi';

export default function AdminPanel() {
  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('2026-08-15');
  const [time, setTime] = useState('18:00');
  const [totalSeats, setTotalSeats] = useState(50);
  const [price, setPrice] = useState(29.99);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventApi.getAllEvents();
      setEvents(data);
    } catch (err) {}
  };

  const handleCreateEvent = async () => {
    try {
      await eventApi.createEvent({
        title,
        venue,
        date,
        time,
        totalSeats: Number(totalSeats),
        availableSeats: Number(totalSeats),
        price: Number(price),
        description
      });
      setOpenModal(false);
      fetchEvents();
    } catch (err) {}
  };

  const handleDeleteEvent = async (id) => {
    try {
      await eventApi.deleteEvent(id);
      fetchEvents();
    } catch (err) {}
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="#f8fafc">
          Admin Management Portal
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ background: 'linear-gradient(45deg, #ec4899, #8b5cf6)', fontWeight: 700 }}
        >
          Create New Event
        </Button>
      </Box>

      <Paper sx={{ background: 'rgba(30, 41, 59, 0.8)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Table>
          <TableHead sx={{ background: 'rgba(15, 23, 42, 0.9)' }}>
            <TableRow>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Venue</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Date & Time</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Seats (Avail/Total)</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Price</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((e) => (
              <TableRow key={e.id}>
                <TableCell sx={{ color: '#f8fafc', fontWeight: 600 }}>{e.title}</TableCell>
                <TableCell sx={{ color: '#cbd5e1' }}>{e.venue}</TableCell>
                <TableCell sx={{ color: '#cbd5e1' }}>{e.date} {e.time}</TableCell>
                <TableCell sx={{ color: '#10b981', fontWeight: 700 }}>{e.availableSeats} / {e.totalSeats}</TableCell>
                <TableCell sx={{ color: '#a855f7', fontWeight: 700 }}>${e.price}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDeleteEvent(e.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} PaperProps={{ sx: { background: '#0f172a', color: '#fff', borderRadius: 4, width: 500 } }}>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Event Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
            <TextField label="Venue" fullWidth value={venue} onChange={(e) => setVenue(e.target.value)} />
            <TextField label="Date" type="date" fullWidth value={date} onChange={(e) => setDate(e.target.value)} />
            <TextField label="Time" type="time" fullWidth value={time} onChange={(e) => setTime(e.target.value)} />
            <TextField label="Total Seats" type="number" fullWidth value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} />
            <TextField label="Price ($)" type="number" fullWidth value={price} onChange={(e) => setPrice(e.target.value)} />
            <TextField label="Description" multiline rows={2} fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateEvent} sx={{ background: 'linear-gradient(45deg, #6366f1, #a855f7)' }}>Create Event</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
