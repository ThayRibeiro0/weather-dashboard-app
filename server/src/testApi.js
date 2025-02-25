import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

console.log("API Key carregada:", process.env.API_KEY); 

const city = "New York";
const apiKey = "6792d6d5fac9e90a91335222ec3b7deb";
const baseUrl = process.env.API_BASE_URL || "https://api.openweathermap.org/data/2.5";

const url = `${baseUrl}/weather?q=${city}&appid=${apiKey}&units=metric`;

console.log("Testando API com URL:", url);

axios.get(url)
  .then(response => {
    console.log("Resposta da API:", response.data);
  })
  .catch(error => {
    console.error("Erro ao chamar API:", error.response ? error.response.data : error.message);
  });
