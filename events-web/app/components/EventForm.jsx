import React from "react";

export default function EventForm({
  title,
  description,
  date,
  canSubmit,
  loadingEvents,
  eventsError,
  onTitleChange,
  onDescriptionChange,
  onDateChange,
  onSubmit,
}) {
  return (
    <aside className="card cardPad">
      <h2 className="cardTitle">Ajouter un évènement</h2>

      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label>Title</label>
          <input className="input" value={title} onChange={onTitleChange} />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            className="textarea"
            value={description}
            onChange={onDescriptionChange}
            rows={3}
          />
        </div>

        <div className="field">
          <label>Date</label>
          <input type="date" className="input" value={date} onChange={onDateChange} />
        </div>

        <div className="actionsRow">
          <button type="submit" className="btn btnPrimary" disabled={!canSubmit || loadingEvents}>
            {loadingEvents ? "Chargement..." : "Ajouter"}
          </button>
        </div>
      </form>

      {eventsError ? <div className="error">{eventsError}</div> : null}
      <p className="helpLine">
        Remplis le formulaire puis clique <b>Voir clients</b> sur un événement.
      </p>
    </aside>
  );
}
