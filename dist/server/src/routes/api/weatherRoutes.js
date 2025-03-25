import { Router } from "express";
const router = Router();
// import HistoryService from '../../service/historyService.js';
import WeatherService from "../../service/weatherService.js";
import historyService from "../../service/historyService.js";
// TODO: POST Request with city name to retrieve weather data
router.post("/", async (req, res) => {
    try {
        const { cityName } = req.body;
        if (!cityName) {
            return res.status(400).json({ error: "City name is required" });
        }
        // TODO: GET weather data from city name
        const weatherData = await WeatherService.getWeatherForCity(cityName);
        // TODO: save city to search history
        const savedCity = await historyService.addCity(cityName);
        return res.json({
            savedCity,
            city: cityName,
            weatherData,
        });
    }
    catch (err) {
        console.error("Error fetching weather data:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// TODO: GET search history
router.get("/history", async (_req, res) => {
    try {
        const history = await historyService.getCities();
        const formattedHistory = history.map(city => ({ id: city.id, name: city.name }));
        res.json(formattedHistory);
    }
    catch (err) {
        console.log('Faild to Return search history:', err);
        res.status(500).json(err);
    }
});
// * BONUS TODO: DELETE city from search history
router.delete("/history/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await historyService.removeCity(id);
        return res.json({ message: 'City removed from history' });
    }
    catch (error) {
        console.error('Error deleting history:', error);
        return res.status(500).json({ error: 'Failed to delete city from search history' });
    }
});
export default router;
