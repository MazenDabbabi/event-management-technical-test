"use client";

import React, { useEffect, useMemo, useState } from "react";
import Topbar from "./components/Topbar";
import EventForm from "./components/EventForm";
import EventsSection from "./components/EventsSection";

export default function Page() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiUrlOk = typeof baseUrl === "string" && baseUrl.trim().length > 0;

  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [clientsByEventId, setClientsByEventId] = useState<Record<string, any[]>>({});
  const [loadingClientsEventId, setLoadingClientsEventId] = useState<string | number | null>(null);
  const [clientsError, setClientsError] = useState("");

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && description.trim().length > 0 && date.trim().length > 0;
  }, [title, description, date]);

  async function fetchEvents() {
    if (!baseUrl) return;
    setLoadingEvents(true);
    setEventsError("");
    try {
      const res = await fetch(`${baseUrl}/events`);
      if (!res.ok) throw new Error(`Failed to load events (${res.status})`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setEventsError(err?.message || "Unknown error while loading events");
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !baseUrl) return;
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
      if (created?.id != null) setEvents((prev) => [created, ...prev]);
      else await fetchEvents();

      setTitle("");
      setDescription("");
      setDate("");
    } catch (err: any) {
      setEventsError(err?.message || "Unknown error while adding event");
    } finally {
      setLoadingEvents(false);
    }
  }

  async function deleteEvent(eventId: string | number) {
    if (!eventId || !baseUrl) return;
    setEventsError("");
    setLoadingEvents(true);
    try {
      const res = await fetch(`${baseUrl}/events/${eventId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete event (${res.status})`);
      setClientsByEventId((prev) => {
        const next = { ...prev };
        delete next[String(eventId)];
        return next;
      });
      setEvents((prev) => prev.filter((ev) => String(ev.id) !== String(eventId)));
    } catch (err: any) {
      setEventsError(err?.message || "Unknown error while deleting event");
    } finally {
      setLoadingEvents(false);
    }
  }

  async function fetchClients(eventId: string | number) {
    if (!eventId || !baseUrl) return;
    setClientsError("");
    setLoadingClientsEventId(eventId);
    try {
      const res = await fetch(`${baseUrl}/events/${eventId}/users`);
      if (!res.ok) throw new Error(`Failed to load clients (${res.status})`);
      const data = await res.json();
      setClientsByEventId((prev) => ({
        ...prev,
        [String(eventId)]: Array.isArray(data) ? data : [],
      }));
    } catch (err: any) {
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
          onTitleChange={(e : any) => setTitle(e.target.value)}
          onDescriptionChange={(e : any) => setDescription(e.target.value)}
          onDateChange={(e : any) => setDate(e.target.value)}
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
