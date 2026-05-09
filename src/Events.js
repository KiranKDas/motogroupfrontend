import React, { useState, useEffect } from 'react';
import { getUpcomingEvents, getAttendedEvents, createEvent, getMyClubs } from './api';
import { useAuth } from './AuthContext';

export default function Events() {
  const { user } = useAuth();
  const isCaptain = user?.isCaptain;

  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let [upcoming, past] = await Promise.all([
          getUpcomingEvents(),
          getAttendedEvents()
        ]);
        upcoming = upcoming || [];
        past = past || [];

        if (!isCaptain) {
          const clubs = await getMyClubs() || [];
          const captainIds = [...new Set(clubs.map(c => c.captainId || c.CaptainId))].filter(Boolean);
          for (const cId of captainIds) {
            const [up, pa] = await Promise.all([getUpcomingEvents(cId), getAttendedEvents(cId)]);
            upcoming = [...upcoming, ...(up || [])];
            past = [...past, ...(pa || [])];
          }
        }
        setEvents([...upcoming, ...past]);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(error.message || "Failed to load events. Service might be down.");
      }
    };
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const newEvent = { name: eventName, date: new Date(eventDate).toISOString(), location: eventLocation };
      const createdEvent = await createEvent(newEvent);
      setEvents([...events, { ...(createdEvent || newEvent), id: createdEvent?.id || Date.now(), location: eventLocation }]);
      alert("Event created!");
      setEventName(''); setEventDate(''); setEventLocation('');
    } catch (err) {
      setError(err.message || "Error creating event.");
    }
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date || e.Date) >= now);
  const pastEvents = events.filter(e => new Date(e.date || e.Date) < now);

  return (
    <div>
      <h2>Ride Events</h2>
      {error && <p style={{ color: 'var(--danger)' }} className="mb-4">Error: {error}</p>}

      {isCaptain && (
        <div className="card mb-4">
          <h3 className="mb-3">Schedule an Event</h3>
          <form className="inline-form" onSubmit={handleCreateEvent}>
            <input placeholder="Event Name" required value={eventName} onChange={e => setEventName(e.target.value)} />
            <input type="datetime-local" required value={eventDate} onChange={e => setEventDate(e.target.value)} />
            <input placeholder="Location" required value={eventLocation} onChange={e => setEventLocation(e.target.value)} />
            <button type="submit" style={{ position: 'relative', zIndex: 50, cursor: 'pointer' }}>Create Event</button>
          </form>
        </div>
      )}

      <h3 className="mb-3" style={{ marginTop: '20px' }}>Upcoming Events</h3>
      {upcomingEvents.length > 0 ? (
        <div className="grid mb-4">
          {upcomingEvents.map((ev) => (
            <div key={ev.id || ev.Id || Math.random()} className="card">
              <h3 className="mb-2">{ev.name || ev.Name}</h3>
              <p className="text-muted mb-3">{new Date(ev.date || ev.Date).toLocaleString()}<br/>📍 {ev.location || ev.Location}</p>
            </div>
          ))}
        </div>
      ) : <p className="text-muted mb-4">No events found.</p>}

      <h3 className="mb-3" style={{ marginTop: '40px' }}>Ride History</h3>
      {pastEvents.length > 0 ? (
        <div className="grid">
          {pastEvents.map((ev) => (
            <div key={ev.id || ev.Id || Math.random()} className="card">
              <h3 className="mb-2">{ev.name || ev.Name}</h3>
              <p className="text-muted mb-0">{new Date(ev.date || ev.Date).toLocaleString()}<br/>📍 {ev.location || ev.Location}</p>
            </div>
          ))}
        </div>
      ) : <p className="text-muted">No past events.</p>}
    </div>
  );
}