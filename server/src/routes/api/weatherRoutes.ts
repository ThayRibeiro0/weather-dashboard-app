import { Router } from "express";
import axios from 'axios';
import historyService from "../../service/historyService.js";
import weatherService from "../../service/weatherService.js";

const router = Router();

router.post("/api/weather", async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: "City name is required" });
    }

    const API_KEY = process.env.API_KEY || 'SUA_CHAVE_AQUI';
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;

    const response = await axios.get(url);
    return res.json(response.data);

  } catch (error: any) {
    console.error("Erro na API do clima:", error.response?.data || error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.message });
    } else {
      return res.status(500).json({ error: "Erro ao buscar informações do clima" });
    }
  }
});

// TODO: POST Request with city name to retrieve weather data
router.post("/", async (req, res) => {
  const city = req.body.city;
  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const weather = await weatherService.getWeatherForCity(city);

    // TODO: save city to search history
    await historyService.addCity(city);

    return res.status(200).json(weather);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Weather API error:", error.message);
    } else {
      console.error("Weather API error:", error);
    }
    return res
      .status(500)
      .json({ error: "Error retrieving weather information" });
  }
});

// TODO: GET weather data from city name
router.get("/weather", async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const weather = await weatherService.getWeatherForCity(String(city));
    return res.status(200).json(weather);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Weather API error:", error.message);
    } else {
      console.error("Weather API error:", error);
    }
    return res
      .status(500)
      .json({ error: "Error retrieving weather information" });
  }
});

// TODO: GET search history
router.get("/history", async (_req, res) => {
  try {
    const cities = await historyService.getCities();
    res.status(200).json(cities);
  } catch (error) {
    console.error(
      "History retrieval error:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: "Error retrieving search history" });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete("/history/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "City ID is required" });
  }

  try {
    await historyService.removeCity(id);
    return res
      .status(200)
      .json({ message: "City removed from search history" });
  } catch (error) {
    console.error(
      "Delete history error:",
      error instanceof Error ? error.message : error
    );
    return res
      .status(500)
      .json({ error: "Error removing city from search history" });
  }
});

export default router;
