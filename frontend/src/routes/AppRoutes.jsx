import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Events from '../pages/Events';
import SeatSelection from '../pages/SeatSelection';
import Login from '../pages/Login';
import Register from '../pages/Register';
import BookingHistory from '../pages/BookingHistory';
import Dashboard from '../pages/Dashboard';
import Simulation from '../pages/Simulation';
import AdminPanel from '../pages/AdminPanel';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/events" replace />} />
      <Route path="/events" element={<Events />} />
      <Route path="/seats/:eventId" element={<SeatSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/history" element={<BookingHistory />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/simulation" element={<Simulation />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}
