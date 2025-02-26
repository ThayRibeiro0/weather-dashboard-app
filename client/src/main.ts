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

const fetchWeather = async (city: string) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=SUA_API_KEY`
    );

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("🔥 Dados brutos da API:", data); // <---- Adicione isso

    if (!data || !data.list) {
      throw new Error("Nenhuma previsão encontrada para esta cidade.");
    }

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

const saveCityToHistory = async (cityName: string) => {
  await fetch("/api/weather/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ city: cityName }),
  });
};

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
    console.error("❌ Erro: Dados inválidos em renderCurrentWeather:", currentWeather);
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

const renderSearchHistory = async () => {
  const historyList = await fetchSearchHistory();
  console.log("Histórico de busca carregado:", historyList);

  if (searchHistoryContainer) {
    searchHistoryContainer.innerHTML = "";

    if (!historyList.length) {
      searchHistoryContainer.innerHTML =
        '<p class="text-center">No Previous Search History</p>';
    }

    // * Start at end of history array and count down to show the most recent cities at the top.
    for (let i = historyList.length - 1; i >= 0; i--) {
      const historyItem = buildHistoryListItem(historyList[i]);
      searchHistoryContainer.append(historyItem);
    }
  }
};

/*

Helper Functions

*/

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

/*

Initial Render

*/

const getAndRenderHistory = () =>
  fetchSearchHistory().then(renderSearchHistory);

searchForm?.addEventListener("submit", handleSearchFormSubmit);
searchHistoryContainer?.addEventListener("click", handleSearchHistoryClick);

getAndRenderHistory();
