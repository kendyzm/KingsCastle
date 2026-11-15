document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  const videos = (window.KINGS_CASTLE_VIDEOS || []).slice().sort((a,b) => new Date(b.date) - new Date(a.date));
  const escapeHTML = (value) => String(value || "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
  const card = (v) => `<article class="video-card">
    <a class="video-thumb" href="video.html?id=${encodeURIComponent(v.id)}">
      <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="${escapeHTML(v.title)} thumbnail" loading="lazy">
      <span class="play">▶</span>
    </a>
    <p class="card-meta">${escapeHTML(v.category)}</p>
    <h3><a href="video.html?id=${encodeURIComponent(v.id)}">${escapeHTML(v.title)}</a></h3>
    <p class="video-description">${escapeHTML(v.description)}</p>
    <a class="read-link" href="video.html?id=${encodeURIComponent(v.id)}">WATCH VIDEO ↗</a>
  </article>`;
  const home = document.getElementById("home-videos");
  if (home) home.innerHTML = videos.slice(0,3).map(card).join("");
  const library = document.getElementById("video-library");
  if (library) library.innerHTML = videos.length ? videos.map(card).join("") : "<p class='notice'>Videos will appear here when added to the content file.</p>";

  const news = window.KINGS_CASTLE_NEWS || [];
  const newsMarkup = news.map((item, i) => `<article class="story-row news-story">
    <div class="story-number">${String(i+1).padStart(2,"0")}</div>
    <div><p class="card-meta">${escapeHTML(item.category)} · ESPN · ${escapeHTML(item.date)}</p>
      <h2><a href="${escapeHTML(item.url)}" target="_blank" rel="noopener">${escapeHTML(item.title)}</a></h2>
      <p>${escapeHTML(item.description)}</p>
    </div>
    <a class="read-link" href="${escapeHTML(item.url)}" target="_blank" rel="noopener">READ AT ESPN ↗</a>
  </article>`).join("");
  const newsList = document.getElementById("espn-news-list");
  if (newsList) newsList.innerHTML = newsMarkup || "<p class='notice'>No articles added yet.</p>";
  const homeNews = document.getElementById("home-espn-news");
  if (homeNews) homeNews.innerHTML = news.slice(0,3).map(item => `<article class="mini-news">
    <p class="card-meta">ESPN · ${escapeHTML(item.date)}</p>
    <h3><a href="${escapeHTML(item.url)}" target="_blank" rel="noopener">${escapeHTML(item.title)}</a></h3>
    <p>${escapeHTML(item.description)}</p>
    <a class="read-link" href="${escapeHTML(item.url)}" target="_blank" rel="noopener">READ AT ESPN ↗</a>
  </article>`).join("");

  const params = new URLSearchParams(location.search);
  const videoId = params.get("id");
  const video = videos.find(v => v.id === videoId);
  const player = document.getElementById("video-detail");
  if (player && video) {
    document.title = `${video.title} | Kings Castle`;
    player.innerHTML = `<p class="eyebrow">${escapeHTML(video.category)}</p>
      <h1>${escapeHTML(video.title)}</h1>
      <p class="video-detail-description">${escapeHTML(video.description)}</p>
      <div class="embed-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${video.id}" title="${escapeHTML(video.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>
      <p><a class="read-link" href="https://youtu.be/${video.id}" target="_blank" rel="noopener">OPEN ON YOUTUBE ↗</a></p>`;
  } else if (player) {
    player.innerHTML = "<h1>Video not found</h1><p>Return to the <a href='videos.html'>video library</a>.</p>";
  }
});
