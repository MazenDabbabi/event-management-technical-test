import React from "react";

export default function Topbar({ baseUrl }) {
  return (
    <div className="topbar">
      <div>
        <h1 className="brandTitle">Event Manager - Web</h1>
        <p className="brandSub">
          API: <code>{baseUrl}</code>
        </p>
      </div>
    </div>
  );
}
