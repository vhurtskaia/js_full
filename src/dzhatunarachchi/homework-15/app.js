"use strict";

const CONFIG = {
  apiKey: "f1f1ec79",
  baseUrl: "https://www.omdbapi.com/",
  debounceMs: 400,
  minQueryLength: 2
};

const searchInput = document.getElementById("searchInput");
const resultsArea = document.getElementById("resultsArea");
const spinner = document.getElementById("spinner");

let debounceTimer = null;
let activeController = null;


function setSpinner(visible) {
  spinner.hidden = !visible;
}

function renderMessage(html, className) {
  resultsArea.innerHTML = `<p class="${className}">${html}</p>`;
}

function renderHint() {
  renderMessage(
    "Напишіть щось у полі вище — наприклад, «matrix» або «dune».",
    "hint"
  );
}

function renderEmpty(query) {
  renderMessage(
    `За запитом «${escapeHtml(query)}» нічого не знайдено. Спробуйте іншу назву.`,
    "empty"
  );
}

function renderError(title, detail) {
  renderMessage(
    `<strong>${escapeHtml(title)}</strong>${escapeHtml(detail)}`,
    "error"
  );
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const FALLBACK_POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">
       <rect width="100%" height="100%" fill="#241318"/>
       <text x="50%" y="50%" fill="#9c8570" font-family="sans-serif"
             font-size="16" text-anchor="middle">Без постера</text>
     </svg>`
  );

function renderResults(movies) {
  const cardsHtml = movies
    .map((movie) => {
      const poster =
        movie.Poster && movie.Poster !== "N/A" ? movie.Poster : FALLBACK_POSTER;
      return `
        <article class="ticket">
          <div class="ticket__poster-wrap">
            <img
              class="ticket__poster"
              src="${poster}"
              alt="Постер: ${escapeHtml(movie.Title)}"
              loading="lazy"
              onerror="this.src='${FALLBACK_POSTER}'"
            >
            <span class="ticket__type">${escapeHtml(movie.Type)}</span>
          </div>
          <div class="ticket__perforation"></div>
          <div class="ticket__info">
            <h3 class="ticket__title">${escapeHtml(movie.Title)}</h3>
            <div class="ticket__meta">
              <span>${escapeHtml(movie.Year)}</span>
              <span class="dot"></span>
              <span>IMDb ${escapeHtml(movie.imdbID)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  resultsArea.innerHTML = `<div class="grid">${cardsHtml}</div>`;
}


async function searchMovies(query, signal) {
  const url = `${CONFIG.baseUrl}?apikey=${encodeURIComponent(
    CONFIG.apiKey
  )}&s=${encodeURIComponent(query)}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Сервер відповів статусом ${response.status}`);
  }

  const data = await response.json();


  if (data.Response === "False") {
    return { movies: [], apiError: data.Error };
  }

  return { movies: data.Search, apiError: null };
}


function handleInput() {
  const query = searchInput.value.trim();

  clearTimeout(debounceTimer);

  if (activeController) {
    activeController.abort();
    activeController = null;
  }

  if (query.length === 0) {
    setSpinner(false);
    renderHint();
    return;
  }

  if (query.length < CONFIG.minQueryLength) {
    setSpinner(false);
    renderMessage("Введіть щонайменше 2 символи…", "hint");
    return;
  }

  if (CONFIG.apiKey === "YOUR_OMDB_API_KEY") {
    setSpinner(false);
    renderError(
      "Потрібен API-ключ",
      "Відкрийте app.js і вставте свій безкоштовний ключ з omdbapi.com/apikey.aspx у CONFIG.apiKey."
    );
    return;
  }

  debounceTimer = setTimeout(() => runSearch(query), CONFIG.debounceMs);
}

async function runSearch(query) {
  const controller = new AbortController();
  activeController = controller;

  setSpinner(true);

  try {
    const { movies, apiError } = await searchMovies(query, controller.signal);


    if (controller.signal.aborted) return;

    if (apiError) {
      renderEmpty(query);
      return;
    }

    renderResults(movies);
  } catch (error) {
    if (error.name === "AbortError") return; // це наш власний debounce-скасунок, не помилка

    console.error("Помилка пошуку фільмів:", error);
    renderError(
      "Не вдалося виконати пошук",
      "Перевірте з'єднання з інтернетом і спробуйте ще раз."
    );
  } finally {
    if (!controller.signal.aborted) setSpinner(false);
  }
}


searchInput.addEventListener("input", handleInput);
