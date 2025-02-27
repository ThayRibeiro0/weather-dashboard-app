
import { Router } from "express";
import axios from 'axios';
import historyService from "../../service/historyService.js";
import weatherService from "../../service/weatherService.js";

const router = Router();

router.post("/api", async (req, res) => {
  console.log("Received POST request:", req.body);
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: "City name is required" });
    }

    const API_KEY = process.env.API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: "API Key is missing" });
    }

    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    console.log("Fetching weather from:", url);

    const response = await axios.get(url);
    return res.json(response.data);
  } catch (error: any) {
    console.error("Erro ao buscar o clima:", error.response?.data || error.message);
    return res.status(500).json({ error: "Error retrieving weather information" });
  }
});

router.get("/forecast", async (req, res) => {
  const city = req.query.city || req.query.q; // Aceita "city" ou "q"

  if (!city || typeof city !== "string") {
    console.error("❌ Nenhuma cidade foi especificada na requisição.");
    return res.status(400).json({ error: "Cidade não especificada" });
  }

  console.log(`🔍 Buscando previsão para: ${city}`);

  const API_KEY = process.env.API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    console.log("✅ Previsão obtida com sucesso!");
    return res.json(response.data);
  } catch (error) {
    console.error("⚠️ Erro ao buscar a previsão do tempo:", error);

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao buscar dados da API" });
    } else {
      return res.status(500).json({ error: "Erro inesperado ao processar a requisição" });
    }
  }
});




// TODO: POST Request with city name to retrieve weather data
router.post("/weather", async (req, res) => {
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
