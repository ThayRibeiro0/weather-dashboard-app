# Weather Dashboard App 🌦️

A weather dashboard application that provides users with real-time weather information for cities around the world. Users can search for current weather conditions and view a 5-day forecast. The app is designed to be responsive, working seamlessly on both mobile and desktop devices.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [License](#license)

## Description

This Weather Dashboard App allows users to:

- Search for weather data by city name.
- View current weather information such as temperature, humidity, wind speed, and more.
- See a 5-day forecast with detailed data for each day.
- Save recent searches in a history list for easy access.
- Display weather information using data from the OpenWeather API.

## Installation

### Clone the Repository

1. Clone the repository to your local machine:

```bash
   git clone https://github.com/ThayRibeiro0/weather-dashboard-app.git
```

2. Navigate to the project directory:

```bash
    cd weather-dashboard-app
```

3. Install Dependencies:

    To install the necessary dependencies for both the client and server, run:

```bash
    npm install
```

This command will install all dependencies listed in package.json for both the backend and frontend.

## Usage

### Running the App Locally

To run the application locally, use the following command to start both the client and server:

``` bash
    npm run start:dev
```

This will start the development servers for both the front-end (React) and back-end (Node.js) applications. The client-side application will be available at http://localhost:3000, and the server will be running at http://localhost:3001.

## Build the Project

To build the project for production, run:

```bash
    npm run build
```

This will compile and bundle the front-end code for production use.

## Deployment

To deploy the application, you can follow these steps:

- Push your changes to GitHub.
- Connect your repository to a deployment platform Render: https://render.com/
- Set the build command to *npm run render-build*.
- Set the start command to *npm run start*.

## Technologies Used

- Frontend: React.js, Bootstrap, FontAwesome
- Backend: Node.js, Express.js
- Database: In-memory storage for search history
- API: OpenWeather API
- Tools: TypeScript, npm, nodemon, concurrently, wait-on

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/ThayRibeiro0/weather-dashboard-app/blob/main/LICENSE) file for more information.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the GitHub repository.