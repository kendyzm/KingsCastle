(() => {
  const DATA_URL = "data/games.json";
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  const dateFmt = (value) => {
    if (!value) return "Date TBD";
    const dateOnly = /^\\d{4}-\\d{2}-\\d{2}$/.test(value);
    const d = new Date(dateOnly ? `${value}T12:00:00` : value);
    return Number.isNaN(d.getTime()) ? "Date TBD" :
      new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: dateOnly ? "America/Los_Angeles" : "America/Los_Angeles" }).format(d);
  };
  const timeFmt = (value) => {
    if (!value || /^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" :
      new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles", timeZoneName: "short" }).format(d);
  };
  const setText = (id, value) => { if ($(id)) $(id).textContent = value; };

  function render(data) {
    const games = Array.isArray(data.games) ? data.games : [];
    const completed = games.filter(g => g.status === "final" && Number.isFinite(g.kingsScore) && Number.isFinite(g.opponentScore));
    const upcoming = games.filter(g => g.status !== "final").sort((a,b) => new Date(a.date) - new Date(b.date));
    const wins = completed.filter(g => g.result === "W").length;
    const losses = completed.filter(g => g.result === "L").length;
    const last = completed.slice().sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    const next = upcoming[0];

    setText("season-record", `${wins}–${losses}`);
    setText("record-caption", `${completed.length} games completed · ${data.seasonLabel || "Regular season"}`);
    setText("last-score", last ? `${last.kingsScore}–${last.opponentScore}` : "—");
    setText("last-game-caption", last ? `${last.opponent} · ${dateFmt(last.date)}` : "No completed games yet");
    setText("next-opponent", next ? `vs ${next.opponent}` : "Season complete");
    setText("next-game-caption", next ? `${dateFmt(next.date)}${next.time ? " · " + timeFmt(next.time) : ""} · ${next.venue || (next.isHome ? "Golden 1 Center" : "Away")}` : "No upcoming games listed");
    setText("season-label", data.seasonLabel || "NBA REGULAR SEASON");

    const body = $("games-table-body");
    if (body) {
      const rows = completed.slice().sort((a,b) => new Date(b.date) - new Date(a.date));
      body.innerHTML = rows.length ? rows.map(g => `
        <tr>
          <td>${esc(dateFmt(g.date))}</td>
          <td>${esc(g.opponent)}</td>
          <td>${g.isHome ? "Home" : "Away"}</td>
          <td class="score">SAC ${esc(g.kingsScore)} – ${esc(g.opponentAbbr)} ${esc(g.opponentScore)}</td>
          <td><span class="result ${g.result === "W" ? "win" : "loss"}">${esc(g.result)}</span></td>
        </tr>`).join("") : '<tr><td colspan="5">No completed games are available yet.</td></tr>';
      if (next) {
        body.insertAdjacentHTML("beforeend", `
          <tr class="scheduled-game">
            <td>${esc(dateFmt(next.date))}</td>
            <td>${esc(next.opponent)}</td>
            <td>${next.isHome ? "Home" : "Away"}</td>
            <td class="score">${esc(next.statusLabel || "Scheduled")}${next.time ? " · " + esc(timeFmt(next.time)) : ""}</td>
            <td>—</td>
          </tr>`);
      }
    }

    if (next) {
      setText("upcoming-title", `${next.isHome ? `${next.opponent} AT` : "KINGS AT"} KINGS`);
      setText("upcoming-details", `${dateFmt(next.date)}${next.time ? " · " + timeFmt(next.time) : ""} · ${next.venue || (next.isHome ? "Golden 1 Center · Sacramento" : "Away")}`);
    } else {
      setText("upcoming-title", "NO UPCOMING GAMES");
      setText("upcoming-details", "Check back when the next schedule is published.");
    }
    setText("data-updated", data.updatedAt ? `Data last updated: ${new Date(data.updatedAt).toLocaleString()}` : "");
  }

  fetch(DATA_URL, { cache: "no-store" })
    .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
    .then(render)
    .catch(error => {
      console.error("Kings Castle schedule could not be loaded:", error);
      setText("season-record", "Unavailable");
      setText("record-caption", "Schedule data could not be loaded");
      setText("last-score", "—");
      setText("last-game-caption", "Try again later");
      setText("next-opponent", "—");
      setText("next-game-caption", "Schedule unavailable");
      const body = $("games-table-body");
      if (body) body.innerHTML = '<tr><td colspan="5">Schedule data is temporarily unavailable. Please check back soon.</td></tr>';
    });
})();
