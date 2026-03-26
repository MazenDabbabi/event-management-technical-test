import React from "react";
import { formatDateForInput } from "../../lib/dateUtils";

export default function EventsSection({
  events,
  loadingEvents,
  clientsByEventId,
  clientsError,
  loadingClientsEventId,
  onFetchClients,
  onDeleteEvent,
}) {
  return (
    <section className="card cardPad">
      <div className="listHeader">
        <h3>Liste des évènements</h3>
        <span className="badge">{events.length} total</span>
      </div>

      {loadingEvents ? (
        <div className="empty">Chargement...</div>
      ) : events.length === 0 ? (
        <div className="empty">Aucun événement pour le moment. Ajoute-en un à gauche.</div>
      ) : (
        <ul className="eventsList">
          {events.map((ev) => {
            const eventId = ev.id;
            const clients = clientsByEventId[eventId] ?? null;
            const clientsLoading = loadingClientsEventId === eventId;
            return (
              <li key={String(eventId)} className="eventCard">
                <div className="eventTop">
                  <div>
                    <div className="eventTitle">{ev.title}</div>
                    <p className="eventDesc">{ev.description}</p>
                    <div className="eventMeta">
                      Date: <code>{formatDateForInput(ev.date)}</code>
                    </div>
                  </div>

                  <div className="splitActions">
                    <button
                      type="button"
                      className="btn btnGhost"
                      onClick={() => onFetchClients(eventId)}
                      disabled={clientsLoading}
                    >
                      {clientsLoading ? "Loading clients..." : clients ? "Refresh clients" : "Voir clients"}
                    </button>
                    <button
                      type="button"
                      className="btn btnDanger"
                      onClick={() => onDeleteEvent(eventId)}
                      disabled={loadingEvents}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                {clientsError ? <div className="error">{clientsError}</div> : null}

                {clients ? (
                  <div className="clientsSection">
                    <div className="clientsTitle">Clients inscrits</div>
                    {clients.length === 0 ? (
                      <div className="empty" style={{ padding: 0 }}>
                        Aucun client pour cet événement.
                      </div>
                    ) : (
                      <ul className="clientsList">
                        {clients.map((u) => (
                          <li key={String(u.id)} style={{ marginBottom: 6 }}>
                            {u.email}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
