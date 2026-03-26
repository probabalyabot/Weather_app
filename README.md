<<<<<<< HEAD
# SkyPulse — Weather Dashboard

A modern, responsive weather application that provides real-time weather information, hourly forecasts, and 5-day weather predictions using the OpenWeatherMap API.

## 🌟 Features

- **Real-time Weather Data** – Search for any city and get current conditions instantly
- **Detailed Highlights** – View feels-like temperature, humidity, wind speed, pressure, visibility, and sunrise/sunset times
- **Hourly Forecast** – 24-hour forecast with temperature and weather conditions at 3-hour intervals
- **5-Day Forecast** – Multi-day weather predictions with high/low temperatures
- **Unit Toggle** – Switch between Celsius and Fahrenheit on the fly
- **Responsive Design** – Beautiful, modern UI with smooth animations and glassmorphism effects
- **Dark Theme** – Easy on the eyes with a sleek dark interface
- **Error Handling** – Clear feedback when cities are not found

## 🛠 Technologies Used

- **HTML5** – Semantic markup
- **CSS3** – Advanced styling with CSS variables, flexbox, and grid
- **JavaScript (Vanilla)** – No frameworks; pure fetch API for requests
- **OpenWeatherMap API** – Real-time weather data
- **Weather Icons CDN** – Professional weather icon set
- **Google Fonts** – Syne (headings) and DM Sans (body) fonts

## 📦 Project Structure

```
weather_app/
├── index.html          # Main HTML file with structure
├── style.css           # All styling (variables, layouts, animations)
├── script.js           # JavaScript logic (API calls, DOM updates)
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A free API key from [OpenWeatherMap](https://openweathermap.org/api)

### Installation

1. **Clone or download this project**
   ```bash
   git clone <repository-url>
   cd weather_app
   ```

2. **Get an OpenWeatherMap API Key**
   - Visit [OpenWeatherMap API](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key from your dashboard

3. **Add your API key to the script**
   - Open `script.js`
   - Find line 12: `const API_KEY = "..."`
   - Replace the existing key with your own

4. **Open in a browser**
   - Open `index.html` in your browser
   - Or use a local server (recommended):
     ```bash
     python -m http.server 8000
     # Then visit http://localhost:8000
     ```

## 💻 How to Use

1. **Search for a City**
   - Type a city name in the search box on the left sidebar
   - Press Enter or click the search button
   - Weather data loads instantly

2. **Toggle Temperature Units**
   - Click **°C** or **°F** buttons at the top to switch units
   - All temperatures update automatically

3. **View Sections**
   - **Dashboard** – Current weather and highlights
   - **Hourly** – 24-hour forecast
   - **Forecast** – 5-day weather predictions
   - Navigate using sidebar links

## 📊 API Endpoints Used

The app makes requests to two OpenWeatherMap endpoints:

- **Current Weather** – `https://api.openweathermap.org/data/2.5/weather`
- **5-Day Forecast** – `https://api.openweathermap.org/data/2.5/forecast`

Both use your API key and support metric (Celsius) and imperial (Fahrenheit) units.

## 🎨 Design Features

- **Glassmorphism UI** – Frosted glass card effect with backdrop blur
- **Smooth Animations** – Fade-in effects and hover transitions
- **Responsive Layout** – Adapts to tablets and mobile devices
- **CSS Variables** – Easy theme customization via `:root` variables
- **Accessible Colors** – High contrast dark theme for readability

## 📱 Responsive Breakpoints

- **Desktop** – Full sidebar + content layout
- **Tablet** (≤1100px) – Adjusted grid layouts
- **Mobile** (≤768px) – Sidebar becomes collapsible top bar
- **Small Mobile** (≤480px) – Single-column layouts

## 🔧 Customization

### Change Color Theme
Edit CSS variables in `style.css` (lines 7-24):
```css
:root {
  --accent: #4f9cf9;        /* Main accent color */
  --bg-main: #0f1117;       /* Main background */
  --bg-sidebar: #13161f;    /* Sidebar background */
  /* ... more variables */
}
```

### Adjust Card Styling
Modify radius, shadows, and transparency in the variables section for a different aesthetic.

## 🐛 Troubleshooting

**"City not found" error**
- Check spelling of the city name
- Try a major city (New York, London, Tokyo)
- Some small towns may not be in the OpenWeatherMap database

**Data not loading**
- Verify your API key is correct and active
- Check browser console for error messages (F12)
- Ensure you have internet connectivity

**API key not working**
- Confirm the key was copied correctly
- Wait a few minutes after generating a new key (propagation delay)
- Check your OpenWeatherMap account status

## 📄 License

This project is open source and available for personal and educational use.

## 🙏 Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons from [Weather Icons by Erik Flowers](https://erikflowers.github.io/weather-icons/)
- Fonts from [Google Fonts](https://fonts.google.com/)

## 📧 Support

For issues or questions, feel free to open an issue or contact the developer.
=======
# Weather_app
Web programming project
>>>>>>> 5a031a69decdf24faf5f235d2932e432d7fdc2bd
