import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
const HISTORY_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'searchHistory.json');
// TODO: Define a City class with name and id properties
class City {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}
// TODO: Complete the HistoryService class
class HistoryService {
    // TODO: Define a read method that reads from the searchHistory.json file
    async read() {
        try {
            const data = await fs.readFile(HISTORY_FILE_PATH, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error reading history file:', error);
            return [];
        }
    }
    // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
    async write(cities) {
        try {
            await fs.writeFile(HISTORY_FILE_PATH, JSON.stringify(cities, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('Error writing to history file:', error);
        }
    }
    // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
    async getCities() {
        return await this.read();
    }
    // TODO Define an addCity method that adds a city to the searchHistory.json file
    async addCity(cityName) {
        const cities = await this.read();
        if (cities.some((c) => c.name.toLowerCase() === cityName.toLowerCase())) {
            return;
        }
        const newCity = { name: cityName, id: uuidv4() };
        cities.push(newCity);
        await this.write(cities);
    }
    // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
    async removeCity(id) {
        let cities = await this.read();
        cities = cities.filter((city) => city.id !== id);
        await this.write(cities);
    }
}
export default new HistoryService();
