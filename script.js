// Utility to choose weather emoji based on code or temperature
function getWeatherIcon(code, temp){
    if(temp >= 30) return "☀️";
    if(temp >= 20) return "🌤️";
    if(temp >= 10) return "⛅";
    if(temp >= 0) return "🌧️";
    return "❄️";
}

function showLoading() {
    document.getElementById("weather").innerHTML = "Loading...";
    document.getElementById("forecast").innerHTML = "";
}

async function getWeather() {
    const city = document.getElementById("city").value;
    if(!city) return alert("Enter a city");
    showLoading();
    try {
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
        const geoData = await geo.json();
        if(!geoData.results) throw "City not found";
        const { latitude, longitude, name } = geoData.results[0];
        fetchWeather(latitude, longitude, name);
    } catch(err){
        document.getElementById("weather").innerHTML = "Error: " + err;
    }
}

function getLocationWeather() {
    if(navigator.geolocation){
        showLoading();
        navigator.geolocation.getCurrentPosition(pos=>{
            fetchWeather(pos.coords.latitude,pos.coords.longitude,"Your Location");
        });
    } else alert("Geolocation not supported");
}

async function fetchWeather(lat, lon, place){
    try{
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
        );
        const data = await res.json();
        const current = data.current_weather;
        const daily = data.daily;

        // Display current
        document.getElementById("weather").innerHTML = `
            <h3>${place}</h3>
            <h1>${getWeatherIcon(current.weathercode,current.temperature)} ${current.temperature}°C</h1>
            <p>💨 Wind: ${current.windspeed} km/h</p>
            <button onclick="location.reload()">Refresh</button>
        `;

        // Display 5-day forecast
        let forecastHTML = "";
        for(let i=0;i<5;i++){
            const date = new Date(daily.time[i]);
            const dayName = date.toLocaleDateString("en-US",{ weekday: "short" });
            forecastHTML += `
                <div class="day">
                    <strong>${dayName}</strong><br>
                    ${getWeatherIcon(daily.weathercode[i],daily.temperature_2m_max[i])}<br>
                    ${daily.temperature_2m_max[i]}°/${daily.temperature_2m_min[i]}°
                </div>
            `;
        }
        document.getElementById("forecast").innerHTML = forecastHTML;

    } catch{
        document.getElementById("weather").innerHTML = "Failed to load weather.";
    }
}
