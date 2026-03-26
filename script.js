/* ================================================
   SkyPulse — script.js
   Connects to OpenWeatherMap API and updates the UI.

   HOW IT WORKS (quick overview):
   1. User types a city and clicks Search (or presses Enter).
   2. We call the OpenWeatherMap API (two endpoints):
      - /weather  → current conditions
      - /forecast → 5-day / hourly forecast
   3. We take the JSON response and display it on the page.

   BEGINNER TIP: JSON = JavaScript Object Notation.
   The API sends back data in this format and we read it
   like: data.main.temp  or  data.weather[0].description
   ================================================ */


// ── ① YOUR API KEY ────────────────────────────────────────────────────────────
// Sign up free at https://openweathermap.org/api
// Replace the string below with your own key:
const API_KEY = "bae452a422f7a39c9041a275d3f55b9a";

// Base URL for the API (both endpoints start here)
const BASE_URL = "https://api.openweathermap.org/data/2.5";


// ── ② GRAB HTML ELEMENTS ──────────────────────────────────────────────────────
// We store references to elements we'll update, so we don't
// have to call getElementById() every single time.

const cityInput    = document.getElementById("city-input");
const searchBtn    = document.getElementById("search-btn");
const errorMsg     = document.getElementById("error-msg");

// Sidebar snapshot
const sidebarTemp  = document.getElementById("sidebar-temp");
const sidebarDesc  = document.getElementById("sidebar-desc");
const sidebarCity  = document.getElementById("sidebar-city");
const sidebarDate  = document.getElementById("sidebar-date");
const sidebarIcon  = document.getElementById("sidebar-icon");

// Top bar
const topbarCity     = document.getElementById("topbar-city");
const topbarSubtitle = document.getElementById("topbar-subtitle");

// Highlights
const hFeels    = document.getElementById("h-feels");
const hFeelDesc = document.getElementById("h-feels-desc");
const hHumidity = document.getElementById("h-humidity");
const humBar    = document.getElementById("hum-bar");
const hWind     = document.getElementById("h-wind");
const hWindDir  = document.getElementById("h-wind-dir");
const hPressure = document.getElementById("h-pressure");
const hVis      = document.getElementById("h-visibility");
const hVisDesc  = document.getElementById("h-vis-desc");
const hSunrise  = document.getElementById("h-sunrise");
const hSunset   = document.getElementById("h-sunset");

// Lists populated dynamically
const hourlyList   = document.getElementById("hourly-list");
const forecastGrid = document.getElementById("forecast-grid");

// Panels
const loadingOverlay = document.getElementById("loading-overlay");
const welcomeScreen  = document.getElementById("welcome-screen");
const dashboard      = document.getElementById("dashboard");

// Unit toggle buttons
const btnCelsius    = document.getElementById("btn-celsius");
const btnFahrenheit = document.getElementById("btn-fahrenheit");


// ── ③ STATE VARIABLES ─────────────────────────────────────────────────────────
// These variables hold data between function calls.

let currentUnit = "metric";  // "metric" = Celsius, "imperial" = Fahrenheit
let lastCity    = "";        // remember the last searched city (to allow unit switching)


// ── ④ EVENT LISTENERS ─────────────────────────────────────────────────────────

// Search on button click
searchBtn.addEventListener("click", () => {
  handleSearch();
});

// Search when user presses Enter key inside the input
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSearch();
});

// Unit toggle — switch between Celsius and Fahrenheit
btnCelsius.addEventListener("click", () => {
  if (currentUnit !== "metric") {
    currentUnit = "metric";
    btnCelsius.classList.add("active");
    btnFahrenheit.classList.remove("active");
    // Re-fetch data in the new unit
    if (lastCity) fetchWeather(lastCity);
  }
});

btnFahrenheit.addEventListener("click", () => {
  if (currentUnit !== "imperial") {
    currentUnit = "imperial";
    btnFahrenheit.classList.add("active");
    btnCelsius.classList.remove("active");
    if (lastCity) fetchWeather(lastCity);
  }
});


// ── ⑤ MAIN SEARCH HANDLER ────────────────────────────────────────────────────

function handleSearch() {
  const city = cityInput.value.trim(); // remove extra spaces

  if (!city) return; // do nothing if input is empty

  hideError();
  fetchWeather(city);
}


// ── ⑥ FETCH WEATHER DATA ─────────────────────────────────────────────────────
// This calls BOTH API endpoints at the same time using Promise.all().
// Promise.all([a, b]) waits for BOTH requests to finish before continuing.

async function fetchWeather(city) {
  showLoading(true);
  lastCity = city;

  // Build the URLs with the city, API key, and unit system
  const currentURL  = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
  const forecastURL = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`;

  try {
    // fetch() sends a network request; await waits for the response
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentURL),
      fetch(forecastURL),
    ]);

    // If either request fails (wrong city, network error), throw an error
    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error("City not found");
    }

    // .json() converts the raw response text into a JavaScript object
    const currentData  = await currentRes.json();
    const forecastData = await forecastRes.json();

    // Update the whole UI
    updateCurrentWeather(currentData);
    updateHighlights(currentData);
    updateHourlyForecast(forecastData);
    updateForecast(forecastData);

    // Show dashboard, hide welcome screen
    welcomeScreen.style.display = "none";
    dashboard.style.display     = "block";

  } catch (error) {
    // Show error message to user
    showError();
  } finally {
    // Always hide loading (runs even if there was an error)
    showLoading(false);
  }
}


// ── ⑦ UPDATE CURRENT WEATHER (sidebar + topbar) ───────────────────────────────

function updateCurrentWeather(data) {
  const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
  const temp       = Math.round(data.main.temp);
  const desc       = data.weather[0].description;   // e.g. "light rain"
  const city       = `${data.name}, ${data.sys.country}`; // "London, GB"
  const iconCode   = data.weather[0].id;             // numeric weather code

  // Sidebar snapshot
  sidebarTemp.textContent = `${temp}${unitSymbol}`;
  sidebarDesc.textContent = desc;
  sidebarCity.textContent = city;
  sidebarDate.textContent = getFormattedDate();
  sidebarIcon.innerHTML   = `<i class="${getWeatherIconClass(iconCode)}"></i>`;

  // Top bar
  topbarCity.textContent     = city;
  topbarSubtitle.textContent = `${desc} · Updated just now`;

  // Update browser tab title
  document.title = `${temp}${unitSymbol} ${city} — SkyPulse`;
}


// ── ⑧ UPDATE HIGHLIGHTS ───────────────────────────────────────────────────────

function updateHighlights(data) {
  const unitSymbol  = currentUnit === "metric" ? "°C" : "°F";
  const speedUnit   = currentUnit === "metric" ? "m/s" : "mph";

  const feelsLike   = Math.round(data.main.feels_like);
  const humidity    = data.main.humidity;       // percentage
  const windSpeed   = data.wind.speed;
  const windDeg     = data.wind.deg ?? 0;
  const pressure    = data.main.pressure;       // hPa
  const visibility  = (data.visibility / 1000).toFixed(1); // metres → km

  // Sunrise & sunset times (Unix timestamp → readable time)
  const sunrise = formatUnixTime(data.sys.sunrise, data.timezone);
  const sunset  = formatUnixTime(data.sys.sunset,  data.timezone);

  // Populate elements
  hFeels.textContent    = `${feelsLike}${unitSymbol}`;
  hFeelDesc.textContent = getFeelsLikeLabel(feelsLike, currentUnit);

  hHumidity.textContent = `${humidity}%`;
  humBar.style.width    = `${humidity}%`; // animate the progress bar

  hWind.textContent     = `${windSpeed} ${speedUnit}`;
  hWindDir.textContent  = `Direction: ${getWindDirection(windDeg)}`;

  hPressure.textContent = `${pressure} hPa`;

  hVis.textContent      = `${visibility} km`;
  hVisDesc.textContent  = getVisibilityLabel(parseFloat(visibility));

  hSunrise.textContent  = sunrise;
  hSunset.textContent   = sunset;
}


// ── ⑨ UPDATE HOURLY FORECAST ──────────────────────────────────────────────────
// The /forecast endpoint gives data in 3-hour steps for 5 days.
// We take the first 8 entries = 24 hours.

function updateHourlyForecast(data) {
  const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
  const entries    = data.list.slice(0, 8); // first 8 × 3h = 24 hours

  hourlyList.innerHTML = ""; // clear previous content

  entries.forEach((entry, index) => {
    const time    = formatUnixTime(entry.dt, data.city.timezone);
    const temp    = Math.round(entry.main.temp);
    const iconCls = getWeatherIconClass(entry.weather[0].id);

    // Build an hourly card element
    const item = document.createElement("div");
    item.classList.add("hourly-item");
    if (index === 0) item.classList.add("now"); // highlight the first (current) slot

    item.innerHTML = `
      <span class="hour-time">${index === 0 ? "Now" : time}</span>
      <i class="wi ${iconCls} hour-icon"></i>
      <span class="hour-temp">${temp}${unitSymbol}</span>
    `;

    hourlyList.appendChild(item);
  });
}


// ── ⑩ UPDATE 5-DAY FORECAST ──────────────────────────────────────────────────
// The /forecast list has one entry every 3 hours.
// We group them by day and get one card per day.

function updateForecast(data) {
  const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
  forecastGrid.innerHTML = "";

  // Group entries by calendar date
  const days = {}; // { "2024-01-15": [entry, entry, ...], ... }

  data.list.forEach((entry) => {
    // entry.dt_txt looks like "2024-01-15 12:00:00"
    const dateKey = entry.dt_txt.split(" ")[0];
    if (!days[dateKey]) days[dateKey] = [];
    days[dateKey].push(entry);
  });

  // Get up to 5 days (skip today if we already have it)
  const dayKeys = Object.keys(days).slice(0, 5);

  dayKeys.forEach((dateKey) => {
    const entries    = days[dateKey];
    const temps      = entries.map((e) => e.main.temp);
    const maxTemp    = Math.round(Math.max(...temps));
    const minTemp    = Math.round(Math.min(...temps));

    // Use the noon entry (or closest) for the icon & description
    const noonEntry  = entries.find((e) => e.dt_txt.includes("12:00:00")) || entries[0];
    const desc       = noonEntry.weather[0].description;
    const iconCode   = noonEntry.weather[0].id;
    const iconCls    = getWeatherIconClass(iconCode);

    // Format the day name
    const dayName    = formatDayName(dateKey);

    // Build the card
    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.innerHTML = `
      <span class="forecast-day">${dayName}</span>
      <i class="wi ${iconCls} forecast-icon"></i>
      <span class="forecast-desc">${desc}</span>
      <div class="forecast-temps">
        <span class="temp-high">${maxTemp}${unitSymbol}</span>
        <span class="temp-low">${minTemp}${unitSymbol}</span>
      </div>
    `;

    forecastGrid.appendChild(card);
  });
}


// ── ⑪ HELPER FUNCTIONS ────────────────────────────────────────────────────────
// Small utility functions that do one specific task.

// Return today's date as a readable string: "Mon, Jan 15"
function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
  });
}

// Convert a Unix timestamp (seconds) to "HH:MM AM/PM"
// timezoneOffset is in seconds (from the API)
function formatUnixTime(unixTimestamp, timezoneOffset) {
  // Build a UTC date, then apply the city's timezone offset
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  const hours   = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const ampm    = hours >= 12 ? "PM" : "AM";
  const h12     = hours % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

// Convert a date string ("2024-01-15") to a short day name ("Mon")
function formatDayName(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

// Convert wind degrees (0-360) to a compass direction (N, NE, E, etc.)
function getWindDirection(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  const index = Math.round(deg / 45) % 8;
  return dirs[index];
}

// Return a human label based on visibility in km
function getVisibilityLabel(km) {
  if (km >= 10) return "Clear visibility";
  if (km >= 5)  return "Good visibility";
  if (km >= 2)  return "Moderate visibility";
  return "Poor visibility";
}

// Return a label based on feels-like temperature
function getFeelsLikeLabel(temp, unit) {
  const isCelsius = unit === "metric";
  if (isCelsius) {
    if (temp >= 35) return "🔥 Very hot";
    if (temp >= 25) return "😎 Warm";
    if (temp >= 15) return "🌤 Comfortable";
    if (temp >= 5)  return "🧥 Cool";
    return "🥶 Cold";
  } else {
    if (temp >= 95) return "🔥 Very hot";
    if (temp >= 77) return "😎 Warm";
    if (temp >= 59) return "🌤 Comfortable";
    if (temp >= 41) return "🧥 Cool";
    return "🥶 Cold";
  }
}

// Map OpenWeatherMap weather condition ID to a Weather Icons CSS class.
// Full ID list: https://openweathermap.org/weather-conditions
function getWeatherIconClass(id) {
  if (id >= 200 && id < 300) return "wi-thunderstorm";
  if (id >= 300 && id < 400) return "wi-sprinkle";
  if (id >= 500 && id < 510) return "wi-rain";
  if (id === 511)             return "wi-rain-mix";
  if (id >= 520 && id < 600) return "wi-showers";
  if (id >= 600 && id < 700) return "wi-snow";
  if (id >= 700 && id < 800) return "wi-fog";
  if (id === 800)             return "wi-day-sunny";
  if (id === 801)             return "wi-day-cloudy";
  if (id === 802)             return "wi-cloud";
  if (id >= 803)              return "wi-cloudy";
  return "wi-day-sunny"; // fallback
}


// ── ⑫ LOADING & ERROR UI ─────────────────────────────────────────────────────

function showLoading(visible) {
  // Toggle display between flex (visible) and none (hidden)
  loadingOverlay.style.display = visible ? "flex" : "none";
}

function showError() {
  errorMsg.style.display = "flex";
  // Auto-hide after 4 seconds
  setTimeout(hideError, 4000);
}

function hideError() {
  errorMsg.style.display = "none";
}


// ── ⑬ INIT ────────────────────────────────────────────────────────────────────
// Set the date in the sidebar on page load

sidebarDate.textContent = getFormattedDate();