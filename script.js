// API key και URLs
const apiKey = "7dbf2343f7322eec20ac794c64868053";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

// Επιλογή στοιχείων HTML
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const errorBox = document.querySelector(".error");
const weatherBox = document.querySelector(".weather");
const dateTimeDiv = document.querySelector(".date-time");
const forecastContainer = document.querySelector(".forecast");
const body = document.body;

// Τελευταία πόλη από localStorage ή προεπιλογή
let lastCity = localStorage.getItem("lastCity") || "Athens";

// Αντιστοίχιση καιρικών συνθηκών σε εικόνες
const weatherIcons = {
    "Clouds": "images/clouds.png",
    "Clear": "images/clear.png",
    "Rain": "images/rain.png",
    "Drizzle": "images/drizzle.png",
    "Mist": "images/mist.png",
    "Snow": "images/snow.png",
    "Thunderstorm": "images/thunderstorm.png",
    "Haze": "images/fog.png",
    "Fog": "images/fog.png",
    "Smoke": "images/fog.png",
    "Dust": "images/dust.png",
    "Sand": "images/dust.png",
    "Ash": "images/dust.png",
    "Squall": "images/tornado.png",
    "Tornado": "images/tornado.png"
};

// Αντιστοίχιση καιρικών συνθηκών σε background εικόνες
const weatherBackgrounds = {
    "Clear": "url('images/backgrounds/clear.jpg')",
    "Clouds": "url('images/backgrounds/clouds.jpg')",
    "Mist": "url('images/backgrounds/mist.jpg')",
    "Rain": "url('images/backgrounds/rain.jpg')",
    "Snow": "url('images/backgrounds/snow.jpg')",
    "Thunderstorm": "url('images/backgrounds/thunderstorm.jpg')",
    "default": "url('images/backgrounds/default.jpg')"
};

// Συνάρτηση ελέγχου καιρού
async function checkWeather(city) {
    if (city.trim() === "") return;
    try {
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
        if (response.status === 404) {
            errorBox.style.display = "block";
            errorBox.textContent = "Invalid city name";
            weatherBox.style.display = "none";
            return;
        }

        const data = await response.json();
        console.log("Current weather API data:", data);  // Εμφάνιση raw δεδομένων κονσόλα

        // Αποθήκευση τελευταίας πόλης
        localStorage.setItem("lastCity", city);

        // Ενημέρωση στοιχείων καιρού
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        weatherIcon.src = weatherIcons[data.weather[0].main] || "images/default.jpg";

        // Αλλαγή background
        const weatherMain = data.weather[0].main;
        body.style.backgroundImage = weatherBackgrounds[weatherMain] || weatherBackgrounds["default"];
        body.style.backgroundSize = "cover";
        body.style.backgroundRepeat = "no-repeat";
        body.style.backgroundPosition = "center";

        // Τοπική ώρα
        const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
        const localTime = new Date(utc + (data.timezone * 1000));
        const hours = localTime.getHours().toString().padStart(2, '0');
        const minutes = localTime.getMinutes().toString().padStart(2, '0');
        dateTimeDiv.textContent = `Local Time: ${hours}:${minutes}`;

        weatherBox.style.display = "block";
        errorBox.style.display = "none";

        // Φόρτωση πρόγνωσης
        checkForecast(city);

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Συνάρτηση πρόγνωσης καιρού (5 ημέρες, ώρα 12:00)
async function checkForecast(city) {
    try {
        const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
        const data = await response.json();
        console.log("Forecast API data:", data);  // Εμφάνιση raw δεδομένων κονσόλα

        forecastContainer.innerHTML = "";

        const dailyData = {};
        data.list.forEach(entry => {
            const [date, time] = entry.dt_txt.split(" ");
            if (time === "12:00:00") {
                dailyData[date] = entry;
            }
        });

        Object.values(dailyData).slice(0, 5).forEach(day => {
            const dayElement = document.createElement("div");
            dayElement.classList.add("forecast-day");
            dayElement.innerHTML = `
                <p>${new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "long" })}</p>
                <img src="${weatherIcons[day.weather[0].main] || "images/default.jpg"}" alt="weather icon">
                <p>${Math.round(day.main.temp)}°C</p>
            `;
            forecastContainer.appendChild(dayElement);
        });
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

// Event listeners για αναζήτηση
searchBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && searchBox.value.trim() !== "") {
        checkWeather(searchBox.value);
    }
});

searchBtn.addEventListener("click", () => {
    if (searchBox.value.trim() !== "") {
        checkWeather(searchBox.value);
    }
});

// Φόρτωση με τελευταία πόλη και αυτόματη ανανέωση κάθε 60 δευτ.
window.addEventListener("load", () => {
    checkWeather(lastCity);
    setInterval(() => {
        checkWeather(lastCity);
    }, 60000);
});
