import dotenv from "dotenv";
import express from "express";
// import axios from "axios";
// Import the routes
import routes from "./routes/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY;
console.log("API Keys2:", API_KEY);

if (!API_KEY) {
  console.error("⚠️ API_KEY não definida no .env");
  process.exit(1); // Encerra a aplicação se a API_KEY não estiver carregada
}
console.log("✅ API Key carregada:", API_KEY);

// Middleware para servir arquivos estáticos do front-end
app.use(express.static("client/dist"));

// Middleware para permitir JSON e URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para conectar rotas
app.use(routes);

/**
 * 🌤️ Rota para buscar a previsão do tempo
 */


app.post('/api/weather', (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  console.log(`Saving city: ${city}`);
  return res.status(201).json({ message: 'City saved successfully' });
});


// Start the server on the port
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
