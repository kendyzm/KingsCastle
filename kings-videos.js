(() => {
  const DATA_URL = "data/videos.json";
  const $ = (id) => document.getElementById(id);
  let allVideos = [];
  let activeCategory = "All";
  let searchTerm = "";

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
  const dateText = (s) => {
    if (!s) return "Date unavailable";
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? "Date unavailable" :
      new Intl.DateTimeFormat("en-US", {month:"short", day:"numeric", year:"numeric"}).format(d);
  };
  const card = (v) => `
    <article class="feature-card auto-video-card">
      <a class="auto-video-thumb" href="video.html?v=${encodeURIComponent(v.id)}" aria-label="Watch ${esc(v.title)}">
        <img src="${esc(v.thumbnail)}" alt="" loading="lazy">
        <span class="auto-video-play">▶</span>
      </a>
      <div class="card-meta"><span>${esc(v.category)}</span><span>${esc(dateText(v.publishedAt))}</span></div>
      <h3><a href="video.html?v=${encodeURIComponent(v.id)}">${esc(v.title)}</a></h3>
      <p class="auto-video-channel">${esc(v.channelTitle)}</p>
      <a class="read-link" href="video.html?v=${encodeURIComponent(v.id)}">WATCH VIDEO ↗</a>
    </article>`;
  function filtered() {
    return allVideos.filter(v => {
      const categoryOK = activeCategory === "All" || v.category === activeCategory;
      const haystack = `${v.title} ${v.channelTitle} ${v.description} ${v.category}`.toLowerCase();
      return categoryOK && haystack.includes(searchTerm.toLowerCase());
    });
  }
  function renderGrid(target, videos) {
    if (!target) return;
    target.innerHTML = videos.length ? videos.map(card).join("") :
      '<p class="muted">No videos match this filter yet. Try another category or search.</p>';
  }
  function renderLibrary() {
    const target = $("video-library");
    if (!target) return;
    const categories = ["All", ...new Set(allVideos.map(v => v.category).filter(Boolean))];
    const filteredVideos = filtered();
    target.innerHTML = `
      <div class="auto-video-toolbar">
        <input id="video-search" type="search" placeholder="Search videos, channels, players…" value="${esc(searchTerm)}" aria-label="Search videos">
        <div class="auto-video-filters">${categories.map(c => `<button type="button" class="auto-video-filter ${c===activeCategory?"active":""}" data-category="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      </div>
      <p class="source-note">Showing ${filteredVideos.length} of ${allVideos.length} videos · Automatically collected from YouTube</p>
      <div class="video-grid auto-video-grid">${filteredVideos.map(card).join("") || '<p class="muted">No videos match this filter yet.</p>'}</div>`;
    const input = $("video-search");
    if (input) input.addEventListener("input", e => { searchTerm = e.target.value; renderLibrary(); const next=$("video-search"); if(next){next.focus(); next.setSelectionRange(searchTerm.length,searchTerm.length);} });
    target.querySelectorAll("[data-category]").forEach(btn => btn.addEventListener("click", () => { activeCategory=btn.dataset.category; renderLibrary(); }));
  }
  function renderDetail() {
    const target = $("video-detail");
    if (!target) return;
    const id = new URLSearchParams(location.search).get("v");
    const video = allVideos.find(v => v.id === id);
    if (!video) {
      target.innerHTML = '<p class="muted">This video is not in the current feed. <a href="videos.html">Return to all videos</a>.</p>';
      return;
    }
    document.title = `${video.title} | Kings Castle`;
    target.innerHTML = `
      <p class="eyebrow">${esc(video.category)} · ${esc(dateText(video.publishedAt))}</p>
      <h1>${esc(video.title)}</h1>
      <p class="muted">Uploaded by ${esc(video.channelTitle)}</p>
      <div class="auto-video-player"><iframe src="${esc(video.embedUrl)}" title="${esc(video.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
      <p>${esc(video.description)}</p>
      <p><a class="read-link" href="${esc(video.url)}" target="_blank" rel="noopener">OPEN ON YOUTUBE ↗</a></p>`;
  }
  fetch(DATA_URL, {cache:"no-store"})
    .then(r => { if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      allVideos = Array.isArray(data.videos) ? data.videos : [];
      renderLibrary();
      renderGrid($("home-videos"), allVideos.slice(0,3));
      renderDetail();
      const stamp = $("videos-updated");
      if (stamp && data.updatedAt) stamp.textContent = `Feed last updated: ${new Date(data.updatedAt).toLocaleString()}`;
    })
    .catch(err => {
      console.error("Could not load Kings Castle video feed", err);
      const lib=$("video-library");
      if(lib) lib.innerHTML='<p class="muted">The video feed is temporarily unavailable. Please check back soon.</p>';
      const home=$("home-videos");
      if(home) home.innerHTML='<p class="muted">Video feed temporarily unavailable.</p>';
    });
})();
