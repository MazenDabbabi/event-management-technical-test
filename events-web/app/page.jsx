"use client";

import React, { useEffect, useMemo, useState } from "react";
import Topbar from "./components/Topbar";
import EventForm from "./components/EventForm";
import EventsSection from "./components/EventsSection";

export default function Page() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiUrlOk = typeof baseUrl === "string" && baseUrl.trim().length > 0;

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [clientsByEventId, setClientsByEventId] = useState({});
  const [loadingClientsEventId, setLoadingClientsEventId] = useState(null);
  const [clientsError, setClientsError] = useState("");

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && description.trim().length > 0 && date.trim().length > 0;
  }, [title, description, date]);

  async function fetchEvents() {
    setLoadingEvents(true);
    setEventsError("");
    try {
      const res = await fetch(`${baseUrl}/events`);
      if (!res.ok) throw new Error(`Failed to load events (${res.status})`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setEventsError(err?.message || "Unknown error while loading events");
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addEvent(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setEventsError("");
    setLoadingEvents(true);
    try {
      const payload = { title, description, date };
      const res = await fetch(`${baseUrl}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to add event (${res.status})`);
      const created = await res.json();
      // Optimistic update: prepend if we got an id, otherwise just refresh.
      if (created?.id != null) setEvents((prev) => [created, ...prev]);
      else await fetchEvents();

      setTitle("");
      setDescription("");
      setDate("");
    } catch (err) {
      setEventsError(err?.message || "Unknown error while adding event");
    } finally {
      setLoadingEvents(false);
    }
  }

  async function deleteEvent(eventId) {
    if (!eventId) return;
    setEventsError("");
    setLoadingEvents(true);
    try {
      const res = await fetch(`${baseUrl}/events/${eventId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete event (${res.status})`);
      setClientsByEventId((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      setEvents((prev) => prev.filter((ev) => String(ev.id) !== String(eventId)));
    } catch (err) {
      setEventsError(err?.message || "Unknown error while deleting event");
    } finally {
      setLoadingEvents(false);
    }
  }

  async function fetchClients(eventId) {
    if (!eventId) return;
    setClientsError("");
    setLoadingClientsEventId(eventId);
    try {
      const res = await fetch(`${baseUrl}/events/${eventId}/users`);
      if (!res.ok) throw new Error(`Failed to load clients (${res.status})`);
      const data = await res.json();
      setClientsByEventId((prev) => ({ ...prev, [eventId]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      setClientsError(err?.message || "Unknown error while loading clients");
    } finally {
      setLoadingClientsEventId(null);
    }
  }

  if (!apiUrlOk) {
    return (
      <div className="container containerFull">
        <div className="topbar">
          <div>
            <h1 className="brandTitle">Event Manager - Web</h1>
            <p className="brandSub">
              Missing environment variable <code>NEXT_PUBLIC_API_URL</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container containerFull">
      <Topbar baseUrl={baseUrl} />

      <div className="layout">
        <EventForm
          title={title}
          description={description}
          date={date}
          canSubmit={canSubmit}
          loadingEvents={loadingEvents}
          eventsError={eventsError}
          onTitleChange={(e) => setTitle(e.target.value)}
          onDescriptionChange={(e) => setDescription(e.target.value)}
          onDateChange={(e) => setDate(e.target.value)}
          onSubmit={addEvent}
        />

        <EventsSection
          events={events}
          loadingEvents={loadingEvents}
          clientsByEventId={clientsByEventId}
          clientsError={clientsError}
          loadingClientsEventId={loadingClientsEventId}
          onFetchClients={fetchClients}
          onDeleteEvent={deleteEvent}
        />
      </div>
    </div>
  );
}