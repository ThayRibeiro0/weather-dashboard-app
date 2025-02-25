import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// TODO: Define an interface for the Coordinates object
  interface Coordinates {
    lat: number;
    lon: number;
  }

// TODO: Define a class for the Weather object
class Weather {
  constructor(
    public temperature: number, 
    public description: string,
    public city: string
  ) {}
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  // TODO: Create fetchLocationData method
  // private async fetchLocationData(query: string) {}
  // TODO: Create destructureLocationData method
  // private destructureLocationData(locationData: Coordinates): Coordinates {}
  // TODO: Create buildGeocodeQuery method
  // private buildGeocodeQuery(): string {}
  // TODO: Create buildWeatherQuery method
  // private buildWeatherQuery(coordinates: Coordinates): string {}
  // TODO: Create fetchAndDestructureLocationData method
  // private async fetchAndDestructureLocationData() {}
  // TODO: Create fetchWeatherData method
  // private async fetchWeatherData(coordinates: Coordinates) {}
  // TODO: Build parseCurrentWeather method
  // private parseCurrentWeather(response: any) {}
  // TODO: Complete buildForecastArray method
  // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}
  // TODO: Complete getWeatherForCity method
  // async getWeatherForCity(city: string) {}

  private baseGeoURL = 'https://api.openweathermap.org/geo/1.0/direct';
  private API_KEY = process.env.OPEN_WEATHER_API_KEY || '';

  private async fetchLocationData(query: string): Promise<any> {
    const url = this.buildGeocodeQuery(query);
    const response = await fetch(url);
    return response.json();
  }

  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData[0]?.lat,
      lon: locationData[0]?.lon
    };
  }

  private buildGeocodeQuery(query: string): string {
    return `${this.baseGeoURL}?q=${query}&limit=1&appid=${this.API_KEY}`;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.API_KEY}`;
  }

  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    console.log("Fetching forecast data from:", url); // Log para depuração
    const response = await fetch(url);
    const data: any = await response.json();
  
    if (data.cod !== "200") {
      console.error("Forecast unavailable:", data);
      throw new Error("Forecast data is not available");
    }
  
    return data;
  }
  

  private parseCurrentWeather(response: any): Weather {
    console.log("Parsing weather response:", response); // Debugging log
  
    if (!response || !response.main || !response.weather || !response.name) {
      console.error("Invalid weather response:", response);
      throw new Error("Weather data is not available");
    }
  
    return new Weather(
      response.main.temp,
      response.weather[0].description,
      response.name
    );
  }
  

private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
  console.log("Weather API Response:", weatherData);
  return weatherData.map((data: any) => new Weather(
      data.main.temp, 
      data.weather[0].description, 
      currentWeather.city
  ));
}

async getWeatherForCity(city: string): Promise<Weather[]> {
  try {
    console.log('Fetching forecast data for city:', city);
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherResponse = await this.fetchWeatherData(coordinates);
    
    console.log("Weather API Response:", weatherResponse);

    if (!weatherResponse || !weatherResponse.list) {
      throw new Error("Invalid forecast data received from API");
    }

    console.log("Forecast available: Sim");
    
    const currentWeather = this.parseCurrentWeather(weatherResponse.list[0]);
    return this.buildForecastArray(currentWeather, weatherResponse.list);
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    console.log("Forecast available: Não");
    throw new Error("Failed to fetch forecast data");
  }
}

}

export default new WeatherService();
