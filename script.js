/* ================================================
   SkyPulse — script.js
   Uses emoji icons — no external icon font needed.

   HOW IT WORKS:
   1. User searches a city → handleSearch() runs
   2. fetchWeather() calls TWO OpenWeatherMap endpoints:
      /weather  → current conditions
      /forecast → 3-hour steps for 5 days
   3. Each populate___() function fills one section of the page
   ================================================ */




const BASE_URL = "https://api.openweathermap.org/data/2.5";

// ── ELEMENT REFERENCES ─────────────────────────────────────────────────────

// Inputs / UI controls
const cityInput      = document.getElementById("city-input");
const searchBtn      = document.getElementById("search-btn");
const errorMsg       = document.getElementById("error-msg");
const loadingOverlay = document.getElementById("loading-overlay");
const welcomeScreen  = document.getElementById("welcome-screen");
const dashboard      = document.getElementById("dashboard");
const btnCelsius     = document.getElementById("btn-celsius");
const btnFahrenheit  = document.getElementById("btn-fahrenheit");

// Topbar
const topbarCity = document.getElementById("topbar-city");
const topbarTime = document.getElementById("topbar-time");

// Sidebar snapshot
const sidebarIcon = document.getElementById("sidebar-icon");
const sidebarTemp = document.getElementById("sidebar-temp");
const sidebarCity = document.getElementById("sidebar-city");
const sidebarDesc = document.getElementById("sidebar-desc");
const sidebarDate = document.getElementById("sidebar-date");

// Hero (current weather card)
const heroTemp    = document.getElementById("hero-temp");
const heroDesc    = document.getElementById("hero-desc");
const heroFeels   = document.getElementById("hero-feels");
const heroDate    = document.getElementById("hero-date");
const heroIcon    = document.getElementById("hero-icon");
const heroCity    = document.getElementById("hero-city");
const heroSunrise = document.getElementById("hero-sunrise");
const heroSunset  = document.getElementById("hero-sunset");

// Quick stats (right column)
const qsHumidity = document.getElementById("qs-humidity");
const qsWind     = document.getElementById("qs-wind");
const qsVis      = document.getElementById("qs-vis");
const qsPressure = document.getElementById("qs-pressure");

// Highlights grid
const hlFeels    = document.getElementById("hl-feels");
const hlFeelsSub = document.getElementById("hl-feels-sub");
const hlHumidity = document.getElementById("hl-humidity");
const hlHumBar   = document.getElementById("hl-hum-bar");
const hlWind     = document.getElementById("hl-wind");
const hlWindDir  = document.getElementById("hl-wind-dir");
const hlPressure = document.getElementById("hl-pressure");
const hlVis      = document.getElementById("hl-vis");
const hlVisSub   = document.getElementById("hl-vis-sub");
const hlMin      = document.getElementById("hl-min");
const hlMax      = document.getElementById("hl-max");

// Lists
const forecastGrid = document.getElementById("forecast-grid");
const hourlyList   = document.getElementById("hourly-list");


// ── STATE ───────────────────────────────────────────────────────────────────
let currentUnit = "metric"; // "metric" = Celsius | "imperial" = Fahrenheit
let lastCity    = "";       // remember last search so unit toggle works


// ──  EVENT LISTENERS ─────────────────────────────────────────────────────────

// Search button click
searchBtn.addEventListener("click", handleSearch);

// Press Enter inside input
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

// Switch to Celsius
btnCelsius.addEventListener("click", () => {
  if (currentUnit !== "metric") {
    currentUnit = "metric";
    btnCelsius.classList.add("active");
    btnFahrenheit.classList.remove("active");
    if (lastCity) fetchWeather(lastCity); // re-fetch with new unit
  }
});

// Switch to Fahrenheit
btnFahrenheit.addEventListener("click", () => {
  if (currentUnit !== "imperial") {
    currentUnit = "imperial";
    btnFahrenheit.classList.add("active");
    btnCelsius.classList.remove("active");
    if (lastCity) fetchWeather(lastCity);
  }
});


// ──  QUICK SEARCH (city pills on welcome screen) ─────────────────────────────
// Called via onclick="" in HTML
function quickSearch(city) {
  cityInput.value = city;
  fetchWeather(city);
}


// ──  HANDLE SEARCH ──────────────────────────────────────────────────────────
function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) return; // do nothing if input is empty
  hideError();
  fetchWeather(city);
}


// ──  FETCH DATA FROM API ────────────────────────────────────────────────────
// Promise.all fires BOTH requests at the same time — faster!
async function fetchWeather(city) {
  showLoading(true);
  lastCity = city;

  const currentURL  = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
  const forecastURL = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`;

  try {
    // Send both requests simultaneously
    const [curRes, fcRes] = await Promise.all([
      fetch(currentURL),
      fetch(forecastURL),
    ]);

    // If either fails (bad city name, network issue) throw error
    if (!curRes.ok || !fcRes.ok) throw new Error("City not found");

    // .json() turns the raw response into a JavaScript object
    const curData = await curRes.json();
    const fcData  = await fcRes.json();

    // Fill each section of the page
    populateSidebar(curData);
    populateHero(curData);
    populateQuickStats(curData);
    populateHighlights(curData);
    populateForecast(fcData);
    populateHourly(fcData);
    updateTopbar(curData);

    // Hide welcome, show dashboard
    welcomeScreen.style.display = "none";
    dashboard.style.display     = "block";

  } catch (err) {
    showError();
  } finally {
    showLoading(false); // always hide loading, even on error
  }
}


// ──  POPULATE FUNCTIONS ─────────────────────────────────────────────────────

/* Sidebar snapshot card */
function populateSidebar(data) {
  const sym = unit();
  sidebarIcon.textContent = weatherEmoji(data.weather[0].id);
  sidebarTemp.textContent = `${Math.round(data.main.temp)}${sym}`;
  sidebarCity.textContent = `${data.name}, ${data.sys.country}`;
  sidebarDesc.textContent = data.weather[0].description;
  sidebarDate.textContent = niceDate();
}

/* Hero (main big card) */
function populateHero(data) {
  const sym = unit();
  heroTemp.textContent    = `${Math.round(data.main.temp)}${sym}`;
  heroDesc.textContent    = data.weather[0].description;
  heroFeels.textContent   = `Feels like ${Math.round(data.main.feels_like)}${sym}`;
  heroDate.textContent    = niceDate();
  heroIcon.textContent    = weatherEmoji(data.weather[0].id);
  heroCity.textContent    = `${data.name}, ${data.sys.country}`;
  heroSunrise.textContent = unixToTime(data.sys.sunrise, data.timezone);
  heroSunset.textContent  = unixToTime(data.sys.sunset,  data.timezone);

  // Update browser tab title
  document.title = `${Math.round(data.main.temp)}${sym} · ${data.name} — SkyPulse`;
}

/* Quick stat cards in right column */
function populateQuickStats(data) {
  const spd = currentUnit === "metric" ? "m/s" : "mph";
  qsHumidity.textContent = `${data.main.humidity}%`;
  qsWind.textContent     = `${data.wind.speed} ${spd}`;
  qsVis.textContent      = `${(data.visibility / 1000).toFixed(1)} km`;
  qsPressure.textContent = `${data.main.pressure} hPa`;
}

/* Highlights grid */
function populateHighlights(data) {
  const sym  = unit();
  const spd  = currentUnit === "metric" ? "m/s" : "mph";
  const feels   = Math.round(data.main.feels_like);
  const humidity = data.main.humidity;
  const vis  = (data.visibility / 1000).toFixed(1);

  hlFeels.textContent    = `${feels}${sym}`;
  hlFeelsSub.textContent = feelsLabel(feels);

  hlHumidity.textContent  = `${humidity}%`;
  hlHumBar.style.width    = `${humidity}%`; // CSS transition animates this

  hlWind.textContent    = `${data.wind.speed} ${spd}`;
  hlWindDir.textContent = `Direction: ${compassDir(data.wind.deg ?? 0)}`;

  hlPressure.textContent = `${data.main.pressure} hPa`;

  hlVis.textContent    = `${vis} km`;
  hlVisSub.textContent = visLabel(parseFloat(vis));

  hlMin.textContent = `${Math.round(data.main.temp_min)}${sym}`;
  hlMax.textContent = `${Math.round(data.main.temp_max)}${sym}`;
}

/* 5-day forecast cards */
function populateForecast(data) {
  const sym = unit();
  forecastGrid.innerHTML = "";

  // Group the API's 3-hour entries by calendar date
  const days = {};
  data.list.forEach((entry) => {
    const key = entry.dt_txt.split(" ")[0]; // "2024-06-15"
    if (!days[key]) days[key] = [];
    days[key].push(entry);
  });

  // Build one card per day (up to 5)
  Object.keys(days).slice(0, 5).forEach((dateKey) => {
    const entries = days[dateKey];
    const temps   = entries.map((e) => e.main.temp);
    const high    = Math.round(Math.max(...temps));
    const low     = Math.round(Math.min(...temps));

    // Use the noon entry for the icon (most representative of the day)
    const sample = entries.find((e) => e.dt_txt.includes("12:00:00")) || entries[0];
    const emoji  = weatherEmoji(sample.weather[0].id);
    const desc   = sample.weather[0].description;
    const day    = shortDay(dateKey);

    const card = document.createElement("div");
    card.className = "fc-card glass";
    card.innerHTML = `
      <span class="fc-day">${day}</span>
      <span class="fc-icon">${emoji}</span>
      <span class="fc-desc">${desc}</span>
      <span class="fc-high">${high}${sym}</span>
      <span class="fc-low">${low}${sym}</span>
    `;
    forecastGrid.appendChild(card);
  });
}

/* Hourly forecast (next 24 hours = first 8 entries × 3h) */
function populateHourly(data) {
  const sym = unit();
  hourlyList.innerHTML = "";

  data.list.slice(0, 8).forEach((entry, i) => {
    const time  = unixToTime(entry.dt, data.city.timezone);
    const temp  = Math.round(entry.main.temp);
    const emoji = weatherEmoji(entry.weather[0].id);

    const item = document.createElement("div");
    item.className = `hr-item glass${i === 0 ? " now" : ""}`;
    item.innerHTML = `
      <span class="hr-time">${i === 0 ? "Now" : time}</span>
      <span class="hr-icon">${emoji}</span>
      <span class="hr-temp">${temp}${sym}</span>
    `;
    hourlyList.appendChild(item);
  });
}

/* Topbar city + live clock */
function updateTopbar(data) {
  topbarCity.textContent = `${data.name}, ${data.sys.country}`;
  tickClock();
  clearInterval(window._clock);
  window._clock = setInterval(tickClock, 60000);
}
function tickClock() {
  topbarTime.textContent = `· ${new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit"
  })}`;
}



/* Current unit symbol */
function unit() {
  return currentUnit === "metric" ? "°C" : "°F";
}

/* Nice readable date: "Monday, Jun 15" */
function niceDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric"
  });
}

/* Convert Unix timestamp + timezone offset → "8:30 AM" */
function unixToTime(ts, tzOffset) {
  const d   = new Date((ts + tzOffset) * 1000);
  const h   = d.getUTCHours();
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const ap  = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${min} ${ap}`;
}

/* "2024-06-15" → "Mon" */
function shortDay(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
}

/* Wind degrees (0-360) → compass label */
function compassDir(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

/* Visibility in km → human label */
function visLabel(km) {
  if (km >= 10) return "Clear visibility";
  if (km >= 5)  return "Good visibility";
  if (km >= 2)  return "Moderate";
  return "Poor visibility";
}

/* Feels-like temperature → comfort label */
function feelsLabel(temp) {
  const hot  = currentUnit === "metric" ? 35 : 95;
  const warm = currentUnit === "metric" ? 25 : 77;
  const cool = currentUnit === "metric" ? 15 : 59;
  const cold = currentUnit === "metric" ? 5  : 41;
  if (temp >= hot)  return "🔥 Very hot";
  if (temp >= warm) return "😎 Warm & pleasant";
  if (temp >= cool) return "🌤 Comfortable";
  if (temp >= cold) return "🧥 Cool";
  return "🥶 Cold";
}

/*
  Map OpenWeatherMap condition ID → emoji
  Full ID list: https://openweathermap.org/weather-conditions

  IDs are grouped:
  2xx = Thunderstorm
  3xx = Drizzle
  5xx = Rain
  6xx = Snow
  7xx = Atmosphere (fog, mist, haze…)
  800 = Clear sky
  80x = Clouds
*/
function weatherEmoji(id) {
  if (id >= 200 && id < 300) return "⛈️";   // thunderstorm
  if (id >= 300 && id < 400) return "🌦️";   // drizzle
  if (id >= 500 && id < 510) return "🌧️";   // rain
  if (id === 511)             return "🌨️";   // freezing rain
  if (id >= 520 && id < 600) return "🌧️";   // shower rain
  if (id >= 600 && id < 700) return "❄️";   // snow
  if (id >= 700 && id < 800) return "🌫️";   // fog / mist / haze
  if (id === 800)             return "☀️";   // clear sky
  if (id === 801)             return "🌤️";   // few clouds
  if (id === 802)             return "⛅";   // scattered clouds
  if (id >= 803)              return "☁️";   // broken / overcast
  return "🌤️";                              // fallback
}


// ── LOADING & ERROR ────────────────────────────────────────────────────────

function showLoading(on) {
  loadingOverlay.style.display = on ? "flex" : "none";
}

function showError() {
  errorMsg.style.display = "block";
  setTimeout(hideError, 4000); // auto-hide after 4 seconds
}

function hideError() {
  errorMsg.style.display = "none";
}


// ──  INIT ────────────────────────────────────────────────────────────────────
// Set sidebar date on page load
sidebarDate.textContent = niceDate();
