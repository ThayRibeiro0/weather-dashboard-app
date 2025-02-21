import dotenv from "dotenv";
import express from "express";
import axios from 'axios';
// Import the routes
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const API_KEY = process.env.API_KEY;
const city = 'New York';
const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;

axios.get(url)
.then(response => {
  console.log("API response: ", response.data);
})
.catch(error => {
  console.error("API error: ", error.response?.data || error.message);
});

// TODO: Serve static files of entire client dist folder
app.use(express.static("client/dist"));

// TODO: Implement middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO: Implement middleware to connect the routes
app.use(routes);

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
