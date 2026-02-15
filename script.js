const getWeatherBtn = document.getElementById('get-weather-btn');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Weather Code Interpretation (WMO Code)
function getWeatherDescription(code) {
    const codes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return codes[code] || 'Unknown';
}

function formatDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
}

function showError(message) {
    errorMessage.classList.remove('hidden');
    weatherCard.classList.add('hidden');
    errorText.textContent = message;
}

function showWeather(data, lat, lon) {
    errorMessage.classList.add('hidden');
    weatherCard.classList.remove('hidden');
    getWeatherBtn.innerHTML = 'Update Location';

    // Update UI elements
    document.getElementById('location-text').textContent = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
    document.getElementById('date-text').textContent = formatDate();
    document.getElementById('temperature').textContent = Math.round(data.temperature);
    document.getElementById('condition-text').textContent = getWeatherDescription(data.weathercode);
    document.getElementById('wind-speed').textContent = `${data.windspeed} km/h`;
    document.getElementById('wind-dir').textContent = `${data.winddirection}°`;
}

async function fetchWeather(lat, lon) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);

        if (!response.ok) {
            throw new Error('Weather service unavailable');
        }

        const data = await response.json();
        showWeather(data.current_weather, lat, lon);

    } catch (error) {
        showError('Failed to fetch weather data. Please try again.');
        console.error(error);
    } finally {
        getWeatherBtn.disabled = false;
        getWeatherBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5"/><path d="M3 12a9 9 0 0 0 15 6.7L22 14"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/><path d="m6.34 17.66-1.41 1.41"/></svg>
            Update Weather
        `;
    }
}

getWeatherBtn.addEventListener('click', () => {
    getWeatherBtn.disabled = true;
    getWeatherBtn.textContent = 'Locating...';
    errorMessage.classList.add('hidden');

    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        getWeatherBtn.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            getWeatherBtn.textContent = 'Loading Weather...';
            // Simulate a reverse geocoding or just use coords for now (Open-Meteo takes coords)
            fetchWeather(latitude, longitude);
        },
        (error) => {
            let msg = 'Unable to retrieve your location.';
            if (error.code === error.PERMISSION_DENIED) {
                msg = 'Location permission denied. Please allow access.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                msg = 'Location information is unavailable.';
            } else if (error.code === error.TIMEOUT) {
                msg = 'The request to get user location timed out.';
            }
            showError(msg);
            getWeatherBtn.disabled = false;
            getWeatherBtn.innerHTML = 'Try Again';
        }
    );
});
