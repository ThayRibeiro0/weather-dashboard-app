import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
// TODO: Define a class for the Weather object
class Weather {
    constructor(city, date, icon, iconDescription, tempF, windSpeed, humidity) {
        this.city = city;
        this.date = date;
        this.icon = icon;
        this.iconDescription = iconDescription;
        this.tempF = tempF;
        this.windSpeed = windSpeed;
        this.humidity = humidity;
    }
}
// TODO: Complete the WeatherService class
class WeatherService {
    constructor() {
        this.apiKey = process.env.API_KEY || '';
    }
    // TODO: Define the baseURL, API key, and city name properties
    // TODO: Create fetchLocationData method
    async fetchLocationData(query) {
        const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`);
        return { lat: response.data[0].lat, lon: response.data[0].lon };
    }
    // TODO: Create destructureLocationData method
    // private destructureLocationData(locationData: Coordinates): Coordinates {}
    // TODO: Create buildGeocodeQuery method
    // private buildGeocodeQuery(): string {}
    // // TODO: Create buildWeatherQuery method
    // private buildWeatherQuery(coordinates: Coordinates): string {}
    // TODO: Create fetchAndDestructureLocationData method
    // private async fetchAndDestructureLocationData() {}
    // TODO: Create fetchWeatherData method
    async fetchWeatherData(coordinates) {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`);
        return response.data;
    }
    ;
    // TODO: Build parseCurrentWeather method
    parseCurrentWeather(response) {
        return {
            city: response.city.name,
            date: new Date(response.list[0].dt * 1000).toLocaleDateString(),
            icon: response.list[0].weather[0].icon,
            iconDescription: response.list[0].weather[0].description,
            tempF: response.list[0].main.temp,
            windSpeed: response.list[0].wind.speed,
            humidity: response.list[0].main.humidity,
        };
    }
    // TODO: Complete buildForecastArray method
    buildForecastArray(currentWeather, weatherData) {
        return weatherData.map((item) => ({
            city: currentWeather.city,
            date: new Date(item.dt * 1000).toLocaleDateString(),
            icon: item.weather[0].icon,
            iconDescription: item.weather[0].description,
            tempF: item.main.temp,
            windSpeed: item.wind.speed,
            humidity: item.main.humidity,
        }));
    }
    // TODO: Complete getWeatherForCity method
    async getWeatherForCity(city) {
        const coordinates = await this.fetchLocationData(city);
        const weatherData = await this.fetchWeatherData(coordinates);
        const currentWeather = this.parseCurrentWeather(weatherData);
        const forecast = this.buildForecastArray(currentWeather, weatherData.list.slice(1, 6));
        return [currentWeather, ...forecast];
    }
}
;
export default new WeatherService();
