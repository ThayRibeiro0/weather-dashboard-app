import "./styles/jass.css";

// * All necessary DOM elements selected
const searchForm: HTMLFormElement = document.getElementById(
  "search-form"
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  "search-input"
) as HTMLInputElement;
const todayContainer = document.querySelector("#today") as HTMLDivElement;
const forecastContainer = document.querySelector("#forecast") as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  "history"
) as HTMLDivElement;
const heading: HTMLHeadingElement = document.getElementById(
  "search-title"
) as HTMLHeadingElement;
const weatherIcon: HTMLImageElement = document.getElementById(
  "weather-img"
) as HTMLImageElement;
const tempEl: HTMLParagraphElement = document.getElementById(
  "temp"
) as HTMLParagraphElement;
const windEl: HTMLParagraphElement = document.getElementById(
  "wind"
) as HTMLParagraphElement;
const humidityEl: HTMLParagraphElement = document.getElementById(
  "humidity"
) as HTMLParagraphElement;
/*

API Calls

*/

const fetchTodayWeather = async (city: string) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    if (!response.ok)
      throw new Error(`Erro ao buscar clima: ${response.statusText}`);
    const data = await response.json();
    renderTodayWeather(data);
  } catch (error) {
    console.error("Erro ao buscar dados do clima atual:", error);
  }
};


const renderTodayWeather = (currentWeather: any): void => {
  if (!currentWeather || !currentWeather.main) {
    console.error(
      "❌ Erro: Dados inválidos em renderTodayWeather:",
      currentWeather
    );
    return;
  }

  const city = currentWeather.name;
  const date = new Date(currentWeather.dt * 1000).toLocaleDateString();
  const tempC = currentWeather.main.temp;
  const windSpeed = currentWeather.wind.speed;
  const humidity = currentWeather.main.humidity;
  const icon = currentWeather.weather[0].icon;
  const description = currentWeather.weather[0].description;

  // Criando um novo container para adicionar sem sobrescrever
  const weatherDiv = document.createElement("div");
  weatherDiv.classList.add("weather-entry");

  const cityHeading = document.createElement("h3");
  cityHeading.textContent = `${city} (${date})`;

  const tempEl = document.createElement("p");
  tempEl.textContent = `🌡️ Temp: ${tempC.toFixed(1)} °C`;

  const windEl = document.createElement("p");
  windEl.textContent = `💨 Wind: ${windSpeed.toFixed(1)} km/h`;

  const humidityEl = document.createElement("p");
  humidityEl.textContent = `💧 Humidity: ${humidity}%`;

  const weatherIcon = document.createElement("img");
  weatherIcon.setAttribute(
    "src",
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute("alt", description);

  // Adicionando os elementos na div criada
  weatherDiv.append(cityHeading, weatherIcon, tempEl, windEl, humidityEl);

  // Adiciona os dados novos SEM apagar os anteriores
  if (todayContainer) {
    todayContainer.appendChild(weatherDiv);
  }
}

const API_KEY = import.meta.env.VITE_API_KEY;
const fetchWeather = async (city: string) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("🔥 Dados brutos da API:", data);

    if (!data || !data.list) {
      throw new Error("Nenhuma previsão encontrada para esta cidade.");
    }

    // 🔥 Atualiza os dados na tela após receber a resposta da API
    updateWeatherDisplay(data);

    return data;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return null;
  }
};


searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = searchInput.value.trim();
  if (city) {
    console.log(`🔍 Buscando previsão para: ${city}`);
    await fetchForecast(city);
  }
});

const fetchForecast = async (city: string) => {
  try {
    const response = await fetch(`/api/weather/forecast?q=${city}`);
    const data = await response.json();

    if (data.list) {
      const filteredForecast = processForecastData(data);
      renderForecast(filteredForecast); // Atualiza a UI com os 5 dias corretos
    } else {
      console.error("No forecast data received.");
    }
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
};

const processForecastData = (forecastData: any) => {
  if (!forecastData?.list || forecastData.list.length === 0) {
    console.error("🚨 Dados inválidos no forecastData!", forecastData);
    return [];
  }

  const uniqueDays = new Set<string>(); // Para armazenar datas únicas
  const dailyForecasts: any[] = []; // Lista das previsões diárias

  console.log("📅 Lista de previsões brutas:", forecastData.list); // <---- Adicione isso

  forecastData.list.forEach((forecast: any) => {
    const date = forecast.dt_txt.split(" ")[0]; // Pegando só a data (YYYY-MM-DD)

    // Se o dia ainda não foi registrado, pegamos o primeiro horário disponível (06:00, 12:00, etc.)
    if (!uniqueDays.has(date)) {
      uniqueDays.add(date);
      dailyForecasts.push({
        date,
        temp: forecast.main?.temp ?? "N/A",
        wind: forecast.wind?.speed ?? "N/A",
        humidity: forecast.main?.humidity ?? "N/A",
        icon: forecast.weather?.[0]?.icon || "",
        description: forecast.weather?.[0]?.description || "No description",
      });
    }
  });

  console.log(
    "✅ Previsão processada corretamente:",
    dailyForecasts.slice(0, 5)
  );
  return dailyForecasts.slice(0, 5); // Retorna os primeiros 5 dias
};

const fetchSearchHistory = async () => {
  const response = await fetch("/api/weather/history", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

// Função para salvar uma cidade no histórico do localStorage
const deleteCityFromHistory = async (id: string) => {
  await fetch(`/api/weather/history/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: any): void => {
  if (!currentWeather || !currentWeather.main) {
    console.error(
      "❌ Erro: Dados inválidos em renderCurrentWeather:",
      currentWeather
    );
    return;
  }

  const city = currentWeather.name;
  const date = new Date(currentWeather.dt * 1000).toLocaleDateString();

  const tempF = (currentWeather.main.temp * 9) / 5 + 32;
  const windSpeed = currentWeather.wind.speed;
  const humidity = currentWeather.main.humidity;

  // Atualiza elementos diretamente
  heading.textContent = `${city} (${date})`;
  tempEl.textContent = `Temp: ${tempF.toFixed(2)} °F`;
  windEl.textContent = `Wind: ${windSpeed.toFixed(2)} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  // Limpa e adiciona os elementos na div #today
  if (todayContainer) {
    todayContainer.innerHTML = ""; // Limpa conteúdo antigo
    todayContainer.append(heading, weatherIcon, tempEl, windEl, humidityEl);
  }
};
console.log("Weather Dashboard App", todayContainer);
// renderCurrentWeather(weatherData);
const renderForecast = (forecast: any): void => {
  console.log("Forecast data received:", forecast);
  const headingCol = document.createElement("div");
  const heading = document.createElement("h4");

  headingCol.setAttribute("class", "col-12");
  heading.textContent = "5-Day Forecast:";
  headingCol.append(heading);

  if (forecastContainer) {
    forecastContainer.innerHTML = "";
    forecastContainer.append(headingCol);
  }

  const todayContainer = document.getElementById("today");

  if (todayContainer) {
    todayContainer.innerHTML = ""; // Limpa o conteúdo do container

    const cityName = searchInput.value.trim(); // Pegue dinamicamente da API
    const date = new Date().toLocaleDateString(); // Data no formato MM/DD/YYYY
    const iconCode = "10d";
    const weatherIcon = `https://openweathermap.org/img/w/${iconCode}.png`; // Exemplo de emoji (substitua por um ícone real da API)
    const temperature = 75; // Pegue o valor real da API
    const windSpeed = 10; // Pegue o valor real da API
    const humidity = 50; // Pegue o valor real da API

    // Criando um elemento para exibir as informações
    const headingCol = document.createElement("div");

    headingCol.innerHTML = `
    <h2>${cityName.charAt(0).toUpperCase() + cityName.slice(1)} (${date}) 
    <img src="${weatherIcon}" alt="Weather Icon"></h2>
    <p>Temperature: ${temperature} °F</p>
    <p>Wind: ${windSpeed} MPH</p>
    <p>Humidity: ${humidity}%</p>
`;

    todayContainer.appendChild(headingCol);
  }

  for (let i = 0; i < forecast.length; i++) {
    renderForecastCard(forecast[i]);
  }
};

const renderForecastCard = (forecast: any) => {
  console.log("🌤️ Dados do forecast recebido para renderizar:", forecast);

  const date = forecast.date || "No date";
  const temp = forecast.temp !== "N/A" ? `${forecast.temp} °C` : "N/A";
  const humidity =
    forecast.humidity !== "N/A" ? `${forecast.humidity} %` : "N/A";
  const windSpeed = forecast.wind !== "N/A" ? `${forecast.wind} km/h` : "N/A";

  const icon = forecast.icon
    ? `https://openweathermap.org/img/w/${forecast.icon}.png`
    : "";
  const iconDescription = forecast.description || "No description";

  // Criar os elementos do card
  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } =
    createForecastCard();

  // Adiciona os dados no card
  cardTitle.textContent = date;
  weatherIcon.setAttribute("src", icon);
  weatherIcon.setAttribute("alt", iconDescription);
  tempEl.textContent = `Temp: ${temp}`;
  windEl.textContent = `Wind: ${windSpeed}`;
  humidityEl.textContent = `Humidity: ${humidity}`;

  if (forecastContainer) {
    forecastContainer.append(col);
  }
};

// **Chamar essa função após cada pesquisa para atualizar o histórico**
// Exemplo: handleSearchHistory("New York");

/*

Helper Functions

*/

function updateWeatherDisplay(newData: any) {
  const weatherContainer = document.getElementById('weather-data');

  if (!weatherContainer || !newData) return;

  // Limpa os dados anteriores
  weatherContainer.innerHTML = '';

  // Renderiza os novos dados
  newData.list.forEach((item: any) => {
    const weatherElement = document.createElement('div');
    weatherElement.innerHTML = `
      <p><strong>${new Date(item.dt * 1000).toLocaleString()}</strong></p>
      <p>Temperatura: ${(item.main.temp - 273.15).toFixed(2)}°C</p>
      <p>Clima: ${item.weather[0].description}</p>
      <hr>
    `;
    weatherContainer.appendChild(weatherElement);
  });
}


const createForecastCard = () => {
  const col = document.createElement("div");
  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const cardTitle = document.createElement("h5");
  const weatherIcon = document.createElement("img");
  const tempEl = document.createElement("p");
  const windEl = document.createElement("p");
  const humidityEl = document.createElement("p");

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add("col-auto");
  card.classList.add(
    "forecast-card",
    "card",
    "text-white",
    "bg-primary",
    "h-100"
  );
  cardBody.classList.add("card-body", "p-2");
  cardTitle.classList.add("card-title");
  tempEl.classList.add("card-text");
  windEl.classList.add("card-text");
  humidityEl.classList.add("card-text");

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement("button");
  btn.setAttribute("type", "button");
  btn.setAttribute("aria-controls", "today forecast");
  btn.classList.add("history-btn", "btn", "btn-secondary", "col-10");
  btn.textContent = city;

  return btn;
};

const createDeleteButton = () => {
  const delBtnEl = document.createElement("button");
  delBtnEl.setAttribute("type", "button");
  delBtnEl.classList.add(
    "fas",
    "fa-trash-alt",
    "delete-city",
    "btn",
    "btn-danger",
    "col-2"
  );

  delBtnEl.addEventListener("click", handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = () => {
  const div = document.createElement("div");
  div.classList.add("display-flex", "gap-2", "col-12", "m-1");
  return div;
};

const buildHistoryListItem = (city: any) => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

/*

Event Handlers

*/

const handleSearchFormSubmit = async (event: Event) => {
  event.preventDefault();
  const city = searchInput.value.trim();
  if (!city) return;

  console.log(`Buscando previsão para: ${city}`);
  const forecastData = await fetchWeather(city);
  console.log("🌤️ Dados da previsão recebidos:", forecastData);

  if (!forecastData || !forecastData.list) {
    console.warn("⚠️ Nenhum dado de previsão recebido, tentando novamente...");
    return;
  }

  const processedData = processForecastData(forecastData);
  console.log("Previsão processada:", processedData);

  // Call renderCurrentWeather with the current weather data
  if (forecastData && forecastData.city) {
    renderCurrentWeather(forecastData);
  }
};

const handleSearchHistoryClick = (event: any) => {
  if (event.target.matches(".history-btn")) {
    const city = event.target.textContent;
    fetchWeather(city).then(getAndRenderHistory);
  }
};

const handleDeleteHistoryClick = (event: any) => {
  event.stopPropagation();
  const cityID = JSON.parse(event.target.getAttribute("data-city")).id;
  deleteCityFromHistory(cityID).then(getAndRenderHistory);
};

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = searchInput.value.trim();
  if (city) {
    console.log(`🔍 Buscando clima para: ${city}`);
    await fetchTodayWeather(city);
    await fetchForecast(city);
    await saveCityToHistory(city);
  }
});


// SAVE ITEMS TO HISTORY

// Function to save city weather data in localStorage
function saveWeatherData(cityName: string, weatherData: any) {
  let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");

  // Remove duplicate city entries
  history = history.filter((entry: any) => entry.city !== cityName);

  // Add new city data
  history.push({ city: cityName, weather: weatherData });

  // Save updated history in localStorage
  localStorage.setItem("searchHistory", JSON.stringify(history));

  // Refresh search history buttons
  updateHistoryButtons();
}

// Function to load weather data when clicking a city in the history
function loadWeatherFromHistory(cityName: string) {
  let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  const cityData = history.find((entry: any) => entry.city === cityName);

  if (cityData) {
    updateWeatherUI(cityName, cityData.weather);
  }
}

// Function to update the UI with weather data
function updateWeatherUI(cityName: string, weatherData: any) {
  document.getElementById("cityName")!.textContent = `${cityName} (${weatherData.date})`;
  document.getElementById("temperature")!.textContent = `Temperature: ${weatherData.temp} °F`;
  document.getElementById("wind")!.textContent = `Wind: ${weatherData.wind} MPH`;
  document.getElementById("humidity")!.textContent = `Humidity: ${weatherData.humidity}%`;

  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "<h4>5-Day Forecast:</h4>";

  weatherData.forecast.forEach((day: any) => {
    const forecastItem = document.createElement("div");
    forecastItem.className = "forecast-item";
    forecastItem.innerHTML = `
      <p><strong>${day.date}</strong></p>
      <p>${day.description}</p>
      <p>Temp: ${day.temp} °C</p>
      <p>Wind: ${day.wind} km/h</p>
      <p>Humidity: ${day.humidity} %</p>
    `;
    forecastContainer.appendChild(forecastItem);
  });
}

// Function to update history buttons
function updateHistoryButtons() {
  const historyContainer = document.getElementById("history");
  historyContainer.innerHTML = ""; // Clear previous buttons

  let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");

  history.forEach((entry: any) => {
    const button = document.createElement("button");
    button.className = "list-group-item list-group-item-action history-btn";
    button.textContent = entry.city;
    
    // Clicking the button loads the weather data
    button.onclick = () => loadWeatherFromHistory(entry.city);
    
    historyContainer.appendChild(button);
  });
}

// Load history buttons on page load
document.addEventListener("DOMContentLoaded", updateHistoryButtons);

function saveCityWeather(cityName: string, weatherData: any) {
  let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");

  // Verifica se a cidade já está salva para não duplicar
  const existingIndex = history.findIndex((item: any) => item.city === cityName);
  if (existingIndex !== -1) {
    history[existingIndex] = { city: cityName, data: weatherData };
  } else {
    history.push({ city: cityName, data: weatherData });
  }

  localStorage.setItem("searchHistory", JSON.stringify(history));

  renderHistoryButtons(); // Atualiza os botões na tela
}

function renderHistoryButtons() {
  const historyContainer = document.getElementById("history");
  if (!historyContainer) return;

  historyContainer.innerHTML = ""; // Limpa antes de adicionar os botões

  let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");

  history.forEach((item: any) => {
    const btn = document.createElement("button");
    btn.className = "list-group-item list-group-item-action history-btn";
    btn.textContent = item.city;

    btn.addEventListener("click", () => {
      displayWeather(item.city, item.data);
    });

    historyContainer.appendChild(btn);
  });
}
//teste


// Initial Render


// Obtém o elemento onde o histórico será renderizado
const historyContainer = document.getElementById("history");

// Função para salvar uma cidade no histórico do localStorage


const saveCityToHistory = (city: string) => {
  if (!city) return;

  // Obtém o histórico atual ou um array vazio se for null
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");

  // Verifica se a cidade já está no histórico para evitar duplicatas
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }

  // Atualiza a exibição do histórico
  getAndRenderHistory();
};




// Função para recuperar e exibir o histórico
const getAndRenderHistory = () => {
  if (!historyContainer) {
    console.error("Elemento #history não encontrado no DOM.");
    return;
  }

  // Limpa a lista atual antes de renderizar novamente
  historyContainer.innerHTML = "";

  // Obtém o histórico do localStorage
  const searchHistory = JSON.parse(
    localStorage.getItem("searchHistory") || "[]"
  );

  // Cria os botões para cada cidade salva no histórico
  searchHistory.forEach((city: string) => {
    const historyItem = document.createElement("button");
    historyItem.textContent = city;
    historyItem.classList.add(
      "list-group-item",
      "list-group-item-action",
      "history-btn"
    );

    // Adiciona um evento para buscar a previsão ao clicar no histórico
    historyItem.addEventListener("click", () => {
      console.log(`🔄 Recarregando dados para: ${city}`);
      fetchWeather(city).then(() => {
        getAndRenderHistory();
      });
    });

    historyContainer.appendChild(historyItem);
  });
};

// Função para limpar todo o histórico
const clearHistory = () => {
  localStorage.removeItem("searchHistory");
  getAndRenderHistory(); // Atualiza a interface
};

// Adiciona um botão para limpar o histórico
const createClearButton = () => {
  if (!historyContainer) return;

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Clear History";
  clearBtn.classList.add("btn", "btn-danger", "mt-2");
  clearBtn.addEventListener("click", clearHistory);

  historyContainer.appendChild(clearBtn);
};

// Chama essa função ao carregar a página para exibir o histórico salvo
document.addEventListener("DOMContentLoaded", () => {
  getAndRenderHistory();
  createClearButton();
});

// Adiciona a cidade ao histórico quando o usuário faz uma pesquisa
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = searchInput.value.trim();
  if (city) {
    console.log(`🔍 Buscando clima para: ${city}`);
    await fetchWeather(city);
    saveCityToHistory(city);
  }
});

// Certifique-se de que os eventos são adicionados apenas uma vez
if (searchForm) {
  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = searchInput.value.trim();
    if (city) {
      console.log(`🔍 Buscando clima para: ${city}`);
      await fetchTodayWeather(city);
      await fetchForecast(city);
      await saveCityToHistory(city);
      await getAndRenderHistory(); // Atualiza o histórico após salvar
    }
  });
}

if (searchHistoryContainer) {
  searchHistoryContainer.addEventListener("click", handleSearchHistoryClick);
}




// Chamar o histórico na inicialização
getAndRenderHistory();
function displayWeather(city: any, data: any) {
  throw new Error("Function not implemented.");
}

