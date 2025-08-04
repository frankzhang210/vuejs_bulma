import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

import { getWeatherByCity, processWeatherData } from './weather.service.js';

app.get('/weather/city/:city', async (req, res) => {
    try {
        const city = req.params.city;

        console.log('--city--', city)

        const weatherData = await getWeatherByCity(city);      

        const processedData = processWeatherData(weatherData);
        res.status(200).json(processedData);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`MCP Server running on http://localhost:${PORT}`);
});