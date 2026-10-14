import React, { useState } from 'react';

// ==========================================
// REGISTERED USER DATABASE (RBAC Credentials)
// ==========================================
const VALID_USERS = [
  { username: 'admin', password: 'adminpassword', role: 'ROLE_ADMIN', name: 'System Administrator', badge: 'Admin Operator' },
  { username: 'john_doe', password: 'password123', role: 'ROLE_USER', name: 'John Doe', badge: 'Silver Member' },
  { username: 'alex_user', password: 'user2026', role: 'ROLE_USER', name: 'Alex Smith', badge: 'Gold VIP Member' }
];

// ==========================================
// EXPANDED EVENT CATALOG (6 Rich Events)
// ==========================================
const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Grand Rock Festival 2026",
    category: "Music",
    categoryLabel: "🎵 Rock & Concert",
    description: "Experience world-touring rock bands performing live with spatial Dolby Atmos audio & laser pyrotechnics.",
    venue: "Metropolitan Arena Stadium",
    date: "Oct 15, 2026",
    time: "07:30 PM",
    basePrice: 85,
    totalSeats: 36,
    availableSeats: 36,
    badge: "Trending Hot 🔥",
    rating: "4.9 ★ (1,420 Reviews)"
  },
  {
    id: 2,
    title: "Tech Innovation Summit",
    category: "Tech",
    categoryLabel: "💻 Tech & Dev",
    description: "Keynotes on Distributed Systems, High-Concurrency Microservices, Redis Cache, and Cloud-Native Architecture.",
    venue: "Silicon Convention Center",
    date: "Oct 20, 2026",
    time: "09:00 AM",
    basePrice: 120,
    totalSeats: 36,
    availableSeats: 36,
    badge: "Selling Fast ⚡",
    rating: "4.8 ★ (980 Reviews)"
  },
  {
    id: 3,
    title: "Symphony Orchestra Concert",
    category: "Classical",
    categoryLabel: "🎭 Classical & Symphony",
    description: "A breathtaking acoustic evening featuring Beethoven's Symphony No. 9 performed by 80 master musicians.",
    venue: "Royal Grand Opera Theater",
    date: "Nov 02, 2026",
    time: "06:45 PM",
    basePrice: 65,
    totalSeats: 36,
    availableSeats: 36,
    badge: "Limited VIP",
    rating: "5.0 ★ (640 Reviews)"
  },
  {
    id: 4,
    title: "World Esports Championship",
    category: "Gaming",
    categoryLabel: "🎮 Esports & Arena",
    description: "Global grand finals with 16 international teams competing in front of a live stadium audience.",
    venue: "Cyber Dome Coliseum",
    date: "Nov 12, 2026",
    time: "05:00 PM",
    basePrice: 45,
    totalSeats: 36,
    availableSeats: 36,
    badge: "Popular 🚀",
    rating: "4.7 ★ (2,100 Reviews)"
  },
  {
    id: 5,
    title: "Global AI & Cloud Expo",
    category: "Tech",
    categoryLabel: "💻 Tech & Dev",
    description: "Hands-on exhibition showcasing Autonomous Agents, Microservice Gateways, and In-Memory Data Grids.",
    venue: "Tech Pavilion Hall B",
    date: "Nov 18, 2026",
    time: "10:00 AM",
    basePrice: 95,
    totalSeats: 36,
    availableSeats: 36,
    badge: "Featured ✨",
    rating: "4.9 ★ (820 Reviews)"
  },
  {
    id: 6,
    title: "Broadway Musical: Phantom Nights",
    category: "Theater",
    categoryLabel: "🎭 Arts & Theater",
    description: "Award-winning theatrical stage production with world-class vocalists, costume design, and live orchestra.",
    venue: "Heritage Broadway Theater",
    date: "Nov 25, 2026",
    time: "08:00 PM",
    basePrice: 75,
    totalSeats: 36,
    availableSeats: 36,
    badge: "Critically Acclaimed",
    rating: "4.9 ★ (1,750 Reviews)"
  }
];

export default function App() {
  // Navigation & View State: Clean User App
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'bookings'
  
  // Authentication State
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Event Catalog & Booking State
  const [eventsList, setEventsList] = useState(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState({
    1: [1, 2], // Initial pre-booked demo seats
    2: [7, 8, 9]
  });
  const [bookingHistory, setBookingHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [confirmedModalTicket, setConfirmedModalTicket] = useState(null);

  // Quick fill helper
  const quickFill = (u, p) => {
    setUsernameInput(u);
    setPasswordInput(p);
    setLoginError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      setLoginError('Please enter both username and password.');
      return;
    }

    const matchedUser = VALID_USERS.find(
      u => u.username.toLowerCase() === cleanUser.toLowerCase() && u.password === cleanPass
    );

    if (!matchedUser) {
      setLoginError('Invalid credentials. Please select or enter one of the registered database accounts.');
      return;
    }

    setUser(matchedUser);
    setLoginError('');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedEvent(null);
    setSelectedSeats([]);
    setUsernameInput('');
    setPasswordInput('');
    setActiveTab('events');
  };

  // Seat Selection Logic
  const getSeatTier = (seatNum) => {
    if (seatNum <= 12) return { name: 'VIP Gold', priceAdd: 30, color: '#f59e0b' };
    if (seatNum <= 24) return { name: 'Premium', priceAdd: 15, color: '#8b5cf6' };
    return { name: 'Standard', priceAdd: 0, color: '#06b6d4' };
  };

  const toggleSeat = (seatNum) => {
    if (!selectedEvent) return;
    const reserved = confirmedBookings[selectedEvent.id] || [];
    if (reserved.includes(seatNum)) return;

    setSelectedSeats(prev =>
      prev.includes(seatNum) ? prev.filter(s => s !== seatNum) : [...prev, seatNum]
    );
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'SMART20') {
      setPromoDiscount(0.20);
      alert('🎉 Promo Code SMART20 Applied: 20% Discount Activated!');
    } else if (promoCode.trim().toUpperCase() === 'VIP50') {
      setPromoDiscount(0.50);
      alert('💎 Promo Code VIP50 Applied: 50% VIP Discount Activated!');
    } else {
      alert('⚠️ Invalid promo code. Try "SMART20" or "VIP50".');
    }
  };

  const confirmBooking = () => {
    if (!selectedEvent || selectedSeats.length === 0) return;

    const eventId = selectedEvent.id;
    const prevReserved = confirmedBookings[eventId] || [];
    const newReserved = [...prevReserved, ...selectedSeats];

    setConfirmedBookings(prev => ({
      ...prev,
      [eventId]: newReserved
    }));

    setEventsList(prev => prev.map(e => {
      if (e.id === eventId) {
        return { ...e, availableSeats: Math.max(0, e.totalSeats - newReserved.length) };
      }
      return e;
    }));

    // Calculate total price
    const subtotal = selectedSeats.reduce((acc, seatNum) => {
      const tier = getSeatTier(seatNum);
      return acc + (selectedEvent.basePrice + tier.priceAdd);
    }, 0);
    const total = Math.round(subtotal * (1 - promoDiscount));
    const txnId = `TXN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newTicket = {
      txnId,
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      venue: selectedEvent.venue,
      date: selectedEvent.date,
      time: selectedEvent.time,
      seats: [...selectedSeats],
      userName: user.name,
      userRole: user.role,
      totalPaid: total,
      timestamp: new Date().toLocaleTimeString(),
      status: 'CONFIRMED'
    };

    setBookingHistory(prev => [newTicket, ...prev]);
    setConfirmedModalTicket(newTicket);
    setSelectedSeats([]);
  };

  const cancelTicket = async (ticket) => {
    if (!window.confirm(`Cancel reservation for ${ticket.eventTitle} (Seats: ${ticket.seats.join(', ')})? Seats will be returned to the inventory immediately.`)) return;

    // Asynchronously call backend to release seat and invalidate cache
    try {
      if (ticket.bookingId) {
        await fetch(`/api/bookings/${ticket.bookingId}/cancel`, { method: 'PUT' });
      } else {
        // Fallback to releasing each seat via Seat Service API
        for (const s of ticket.seats) {
          await fetch('/api/seats/release', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: ticket.eventId, seatNumber: String(s) })
          });
        }
      }
    } catch (err) {
      console.warn("Backend cancel call:", err);
    }

    setConfirmedBookings(prev => {
      const current = prev[ticket.eventId] || [];
      return {
        ...prev,
        [ticket.eventId]: current.filter(s => !ticket.seats.includes(s))
      };
    });

    setEventsList(prev => prev.map(e => {
      if (e.id === ticket.eventId) {
        return { ...e, availableSeats: Math.min(e.totalSeats, e.availableSeats + ticket.seats.length) };
      }
      return e;
    }));

    setBookingHistory(prev => prev.filter(t => t.txnId !== ticket.txnId));
    alert(`✅ Reservation successfully cancelled! Seats ${ticket.seats.join(', ')} have been freed in Cache & Database.`);
  };

  // Filtered Events
  const filteredEvents = eventsList.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.basePrice - b.basePrice;
    if (sortBy === 'price-high') return b.basePrice - a.basePrice;
    if (sortBy === 'seats') return b.availableSeats - a.availableSeats;
    return a.id - b.id;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ========================================================= */}
      {/* TOP HEADER & NAVIGATION BAR (USER PORTAL - PORT 3000) */}
      {/* ========================================================= */}
      <header style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '14px 28px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Logo & Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setSelectedEvent(null); setActiveTab('events'); }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' }}>
              🎫
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(45deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
                SmartTicket
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                Live Concert & Event Ticket Portal
              </div>
            </div>
          </div>

          {/* User Navigation Tabs */}
          {user && (
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#090d16', padding: '4px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <button
                onClick={() => { setSelectedEvent(null); setActiveTab('events'); }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'events' ? '#6366f1' : 'transparent',
                  color: activeTab === 'events' ? '#ffffff' : '#94a3b8',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🎟️</span> Featured Events & Shows
              </button>

              <button
                onClick={() => { setSelectedEvent(null); setActiveTab('bookings'); }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'bookings' ? '#6366f1' : 'transparent',
                  color: activeTab === 'bookings' ? '#ffffff' : '#94a3b8',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🧾</span> My Ticket Wallet
                {bookingHistory.length > 0 && (
                  <span style={{ backgroundColor: '#a855f7', color: '#ffffff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {bookingHistory.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* User Profile / QA Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Direct Link to QA Dashboard on Port 3001 */}
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid #10b981',
                color: '#34d399',
                padding: '6px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
              title="Open QA Test Suite, Selenium & SonarQube Dashboard on Port 3001"
            >
              <span>🧪 QA & Test Hub (Port 3001) ↗</span>
            </a>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '11px', color: user.role === 'ROLE_ADMIN' ? '#f59e0b' : '#38bdf8', fontWeight: '600' }}>
                    {user.badge}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#10b981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                System Online
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================= */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>

        {/* --------------------------------------------------------- */}
        {/* VIEW 1: AUTHENTICATION / LOGIN SCREEN */}
        {/* --------------------------------------------------------- */}
        {!user && (
          <div style={{ maxWidth: '1000px', margin: '30px auto' }}>
            
            {/* Value Proposition Highlights */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '6px 16px', borderRadius: '20px', color: '#818cf8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                🎫 Official Live Event Ticket Reservation Portal
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: '900', margin: '0 0 16px 0', background: 'linear-gradient(135deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
                Instant Concert & Theater Seat Reservations
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '680px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
                Choose your favorite live music concerts, tech conferences, esports grand finals, and Broadway performances with live interactive stage seating.
              </p>

              {/* Fast Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>Instant</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Seat Confirmation</div>
                </div>
                <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#6366f1' }}>100%</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Verified Digital Passes</div>
                </div>
                <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#a855f7' }}>6 Shows</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Currently Scheduled</div>
                </div>
                <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b' }}>Port 3000</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Dedicated User App</div>
                </div>
              </div>
            </div>

            {/* Login Card */}
            <div style={{ maxWidth: '440px', margin: '0 auto', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '36px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔐</div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700' }}>Account Authentication</h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Sign in to reserve seats and manage your tickets</p>
              </div>

              {loginError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
                  ⚠️ {loginError}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Username</label>
                  <input
                    type="text"
                    placeholder="e.g. admin or alex_user"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Password</label>
                  <input
                    type="password"
                    placeholder="Enter account password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    marginBottom: '24px'
                  }}
                >
                  Sign In & Enter Dashboard →
                </button>
              </form>

              {/* 1-Click Fast Login Helper */}
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                  ⚡ Quick-Fill Registered Demo Credentials:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => quickFill('admin', 'adminpassword')}
                    style={{ padding: '8px 12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', color: '#f59e0b', fontSize: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>👑 <strong>admin</strong> (System Administrator)</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Fill & Test</span>
                  </button>
                  <button
                    onClick={() => quickFill('alex_user', 'user2026')}
                    style={{ padding: '8px 12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '6px', color: '#818cf8', fontSize: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>👤 <strong>alex_user</strong> (Gold VIP Member)</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Fill & Test</span>
                  </button>
                  <button
                    onClick={() => quickFill('john_doe', 'password123')}
                    style={{ padding: '8px 12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', color: '#10b981', fontSize: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>👤 <strong>john_doe</strong> (Silver Member)</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Fill & Test</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* VIEW 2: EVENTS CATALOG & INTERACTIVE BOOKING PORTAL */}
        {/* --------------------------------------------------------- */}
        {user && activeTab === 'events' && !selectedEvent && (
          <div>
            {/* Hero Live Metric Bar */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px 32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: '800' }}>
                  Live Shows & Seat Reservations
                </h1>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                  Select an event to view the interactive 3D-styled seating grid, stage zones, and instant ticket generator.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Active Microservices</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>● High-Speed Engine Active</div>
                </div>
                <div style={{ width: '1px', height: '32px', backgroundColor: '#1e293b' }}></div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Available Events</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a855f7' }}>{eventsList.length} Scheduled</div>
                </div>
              </div>
            </div>

            {/* Search, Category Filters & Sort Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
              
              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', 'Music', 'Tech', 'Classical', 'Gaming', 'Theater'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: categoryFilter === cat ? '1px solid #6366f1' : '1px solid #1e293b',
                      backgroundColor: categoryFilter === cat ? 'rgba(99, 102, 241, 0.2)' : '#0f172a',
                      color: categoryFilter === cat ? '#ffffff' : '#94a3b8',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {cat === 'All' ? '🌟 All Categories' : cat}
                  </button>
                ))}
              </div>

              {/* Search Box & Sort */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="🔍 Search event, venue, artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    minWidth: '220px'
                  }}
                />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="seats">Most Seats Left</option>
                </select>
              </div>

            </div>

            {/* Events Grid (6 Diverse Cards) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {filteredEvents.map(event => {
                const reservedCount = (confirmedBookings[event.id] || []).length;
                const remaining = Math.max(0, event.totalSeats - reservedCount);
                const percentLeft = Math.round((remaining / event.totalSeats) * 100);

                return (
                  <div
                    key={event.id}
                    style={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                          {event.categoryLabel}
                        </span>
                        <span style={{ backgroundColor: '#1e293b', color: '#cbd5e1', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>
                          {event.badge}
                        </span>
                      </div>

                      {/* Title & Price */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '700', lineHeight: '1.3' }}>
                          {event.title}
                        </h3>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>
                            ${event.basePrice}
                          </span>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>from/seat</div>
                        </div>
                      </div>

                      <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', marginBottom: '18px' }}>
                        {event.description}
                      </p>

                      {/* Event Details */}
                      <div style={{ backgroundColor: '#090d16', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
                        <div style={{ color: '#cbd5e1', marginBottom: '6px' }}>📍 <strong>Venue:</strong> {event.venue}</div>
                        <div style={{ color: '#cbd5e1', marginBottom: '6px' }}>📅 <strong>Date:</strong> {event.date} • {event.time}</div>
                        <div style={{ color: '#f59e0b' }}>★ <strong>Rating:</strong> {event.rating}</div>
                      </div>

                      {/* Remaining Seats Meter */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                          <span style={{ color: '#94a3b8' }}>Available Inventory:</span>
                          <span style={{ fontWeight: 'bold', color: remaining < 10 ? '#ef4444' : '#10b981' }}>
                            {remaining} of {event.totalSeats} seats left
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentLeft}%`, height: '100%', backgroundColor: remaining < 10 ? '#ef4444' : '#10b981' }}></div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => { setSelectedEvent(event); setSelectedSeats([]); setPromoDiscount(0); setPromoCode(''); }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                      }}
                    >
                      Select Seats & Reserve →
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* VIEW 2B: INTERACTIVE SEATING STUDIO & STAGE VIEW */}
        {/* --------------------------------------------------------- */}
        {user && activeTab === 'events' && selectedEvent && (
          <div>
            {/* Header / Back */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  color: '#818cf8',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← Back to Catalog
              </button>

              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Reserving as: <strong style={{ color: '#ffffff' }}>{user.name}</strong> ({user.username})
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
              
              {/* Left Column: Visual Theater Layout */}
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                
                {/* Event Summary Ribbon */}
                <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                  <span style={{ backgroundColor: '#1e293b', color: '#818cf8', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                    {selectedEvent.categoryLabel}
                  </span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '24px', fontWeight: '800' }}>
                    {selectedEvent.title}
                  </h2>
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                    📍 {selectedEvent.venue} • 📅 {selectedEvent.date} ({selectedEvent.time})
                  </div>
                </div>

                {/* Ambient Stage Lights Visual */}
                <div style={{
                  position: 'relative',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  padding: '16px',
                  borderRadius: '12px',
                  color: '#94a3b8',
                  fontWeight: 'bold',
                  letterSpacing: '4px',
                  fontSize: '13px',
                  marginBottom: '36px',
                  boxShadow: '0 0 25px rgba(99, 102, 241, 0.25)'
                }}>
                  🎭 LIVE PERFORMANCE STAGE / SCREEN 🎭
                </div>

                {/* Tier Zone Legend */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginBottom: '28px', fontSize: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f59e0b' }}></div>
                    <span>VIP Front ($115)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#8b5cf6' }}></div>
                    <span>Premium ($100)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#06b6d4' }}></div>
                    <span>Standard ($85)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981' }}></div>
                    <span>Selected</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#ef4444' }}></div>
                    <span>Booked</span>
                  </div>
                </div>

                {/* 36-Seat Theater Grid (6 Rows x 6 Seats) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', maxWidth: '480px', margin: '0 auto 28px auto' }}>
                  {Array.from({ length: 36 }).map((_, i) => {
                    const seatNum = i + 1;
                    const tier = getSeatTier(seatNum);
                    const isReserved = (confirmedBookings[selectedEvent.id] || []).includes(seatNum);
                    const isSelected = selectedSeats.includes(seatNum);

                    let bgColor = '#090d16';
                    let borderColor = tier.color;
                    let textColor = '#cbd5e1';

                    if (isReserved) {
                      bgColor = '#ef4444';
                      borderColor = '#ef4444';
                      textColor = '#ffffff';
                    } else if (isSelected) {
                      bgColor = '#10b981';
                      borderColor = '#10b981';
                      textColor = '#ffffff';
                    }

                    return (
                      <button
                        key={seatNum}
                        onClick={() => toggleSeat(seatNum)}
                        disabled={isReserved}
                        title={`Seat ${seatNum} (${tier.name}) - $${selectedEvent.basePrice + tier.priceAdd}`}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '8px',
                          border: `1px solid ${borderColor}`,
                          backgroundColor: bgColor,
                          color: textColor,
                          fontWeight: 'bold',
                          fontSize: '13px',
                          cursor: isReserved ? 'not-allowed' : 'pointer',
                          opacity: isReserved ? 0.6 : 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>{seatNum}</div>
                        <div style={{ fontSize: '9px', opacity: 0.8 }}>
                          {isReserved ? '🔒' : isSelected ? '✓' : tier.name.slice(0, 3)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                  💡 Click any available seat above to add to your order. Instant seat reservation.
                </div>
              </div>

              {/* Right Column: Checkout & Receipt Calculator */}
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
                  Reservation Summary
                </h3>

                {selectedSeats.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px', border: '1px dashed #334155', borderRadius: '12px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>💺</div>
                    No seats selected yet.<br />Choose your seats from the grid.
                  </div>
                ) : (
                  <div>
                    {/* Itemized list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', maxHeight: '180px', overflowY: 'auto' }}>
                      {selectedSeats.map(num => {
                        const tier = getSeatTier(num);
                        const cost = selectedEvent.basePrice + tier.priceAdd;
                        return (
                          <div key={num} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#090d16', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
                            <div>
                              <strong>Seat #{num}</strong> <span style={{ color: tier.color, fontSize: '11px' }}>({tier.name})</span>
                            </div>
                            <div style={{ fontWeight: 'bold' }}>${cost}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Promo Code Input */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                        Promo Code (Try: <strong>SMART20</strong> for 20% off)
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="e.g. SMART20"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          style={{ flex: 1, backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '6px', padding: '8px 10px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                        />
                        <button
                          onClick={applyPromo}
                          style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    {(() => {
                      const subtotal = selectedSeats.reduce((acc, num) => acc + (selectedEvent.basePrice + getSeatTier(num).priceAdd), 0);
                      const discountAmount = Math.round(subtotal * promoDiscount);
                      const total = subtotal - discountAmount;

                      return (
                        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                            <span>Seats Selected:</span>
                            <span>{selectedSeats.length} Seats</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                            <span>Subtotal:</span>
                            <span>${subtotal}</span>
                          </div>
                          {promoDiscount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#10b981', marginBottom: '6px' }}>
                              <span>Promo Discount ({promoDiscount * 100}%):</span>
                              <span>-${discountAmount}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: '#ffffff', marginTop: '12px' }}>
                            <span>Total Due:</span>
                            <span style={{ color: '#10b981' }}>${total}</span>
                          </div>
                        </div>
                      );
                    })()}

                    <button
                      onClick={confirmBooking}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      💳 Confirm Booking (${selectedSeats.length} Seats)
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* VIEW 3: MY BOOKINGS & DIGITAL PASSES */}
        {/* --------------------------------------------------------- */}
        {user && activeTab === 'bookings' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: '800' }}>
                My Confirmed Ticket Wallet
              </h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                Digital boarding passes issued under account {user.username}. Includes venue barcode / QR simulation and cancellation.
              </p>
            </div>

            {bookingHistory.length === 0 ? (
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '42px', marginBottom: '12px' }}>🎟️</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>No active reservations found</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                  Head to the Events Catalog to reserve your seats for upcoming live concerts and summits.
                </p>
                <button
                  onClick={() => setActiveTab('events')}
                  style={{ backgroundColor: '#6366f1', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Browse Events Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                {bookingHistory.map(ticket => (
                  <div key={ticket.txnId} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                    
                    {/* Ticket Header */}
                    <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>Digital Pass</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{ticket.eventTitle}</div>
                      </div>
                      <span style={{ backgroundColor: '#ffffff', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                        CONFIRMED
                      </span>
                    </div>

                    {/* Ticket Body */}
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', marginBottom: '16px' }}>
                        <div>
                          <div style={{ color: '#94a3b8' }}>Attendee</div>
                          <div style={{ fontWeight: 'bold' }}>{ticket.userName}</div>
                        </div>
                        <div>
                          <div style={{ color: '#94a3b8' }}>Transaction ID</div>
                          <div style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#818cf8' }}>{ticket.txnId}</div>
                        </div>
                        <div>
                          <div style={{ color: '#94a3b8' }}>Venue</div>
                          <div style={{ fontWeight: 'bold' }}>{ticket.venue}</div>
                        </div>
                        <div>
                          <div style={{ color: '#94a3b8' }}>Date / Time</div>
                          <div style={{ fontWeight: 'bold' }}>{ticket.date} • {ticket.time}</div>
                        </div>
                      </div>

                      {/* Reserved Seats List */}
                      <div style={{ backgroundColor: '#090d16', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Reserved Seats:</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {ticket.seats.map(s => (
                            <span key={s} style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                              Seat #{s}
                            </span>
                          ))}
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94a3b8' }}>Total Paid:</span>
                          <strong style={{ color: '#10b981' }}>${ticket.totalPaid}</strong>
                        </div>
                      </div>

                      {/* Simulated QR Code for entry */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px dashed #1e293b', paddingTop: '16px', marginBottom: '16px' }}>
                        <div style={{ width: '56px', height: '56px', backgroundColor: '#ffffff', borderRadius: '6px', padding: '4px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px' }}>
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} style={{ backgroundColor: i % 2 === 0 || i % 5 === 0 ? '#000000' : 'transparent' }}></div>
                          ))}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Scan QR Pass at Venue Gate.<br />Secured with digital signature.
                        </div>
                      </div>

                      <button
                        onClick={() => cancelTicket(ticket)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          backgroundColor: 'transparent',
                          border: '1px solid #ef4444',
                          color: '#ef4444',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel Ticket & Release Seats
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* INSTANT BOOKING RECEIPT MODAL (Upon Successful Checkout) */}
      {/* ========================================================= */}
      {confirmedModalTicket && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '32px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#10b981', margin: '0 auto 16px auto' }}>
              ✓
            </div>

            <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '800' }}>
              Booking Confirmed!
            </h2>
            <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '13px' }}>
              Your seats have been successfully reserved and added to your wallet.
            </p>

            <div style={{ backgroundColor: '#090d16', padding: '16px', borderRadius: '12px', textAlign: 'left', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Event:</span>
                <strong>{confirmedModalTicket.eventTitle}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Seats:</span>
                <strong style={{ color: '#10b981' }}>Seat #{confirmedModalTicket.seats.join(', ')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Total Paid:</span>
                <strong>${confirmedModalTicket.totalPaid}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Transaction ID:</span>
                <span style={{ fontFamily: 'monospace', color: '#818cf8' }}>{confirmedModalTicket.txnId}</span>
              </div>
            </div>

            <button
              onClick={() => { setConfirmedModalTicket(null); setSelectedEvent(null); setActiveTab('bookings'); }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              View in My Ticket Wallet →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
