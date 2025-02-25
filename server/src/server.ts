import dotenv from "dotenv";
import express from "express";
import axios from "axios";
// Import the routes
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY;

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
app.get("/forecast", async (req, res) => {
  const city = req.query.q as string; // Assegura que `city` é uma string

  if (!city) {
    console.error("❌ Nenhuma cidade foi especificada na requisição.");
    return res.status(400).json({ error: "Cidade não especificada" });
  }

  console.log(`🔍 Buscando previsão para: ${city}`);

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    console.log("✅ Previsão obtida com sucesso!");
    return res.json(response.data); // Envia os dados da API para o front-end
  } catch (error) {
    console.error("⚠️ Erro ao buscar a previsão do tempo:", error);

    if (axios.isAxiosError(error)) {
      // Se for um erro do Axios, podemos acessar `error.response`
      return res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao buscar dados da API" });
    } else {
      // Se for outro erro genérico, retornamos erro interno do servidor
      return res.status(500).json({ error: "Erro inesperado ao processar a requisição" });
    }
  }
});

app.post('/api/weather/save', (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  console.log(`Saving city: ${city}`);
  return res.status(201).json({ message: 'City saved successfully' });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// Start the server on the port
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
