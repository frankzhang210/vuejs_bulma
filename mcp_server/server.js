import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

import { getWeatherByCity, processWeatherData } from './weather.service.js';

// MCP "tool" registry
const tools = {
    getWeatherByCity: async (params) => {
        if (!params.city) throw new Error('city parameter required');

        const raw = await getWeatherByCity(params.city);
        return processWeatherData(raw)
    },

}

// Standard MCP /mcp/invoke endpoint
app.use(express.json());
app.post('/mcp/invoke', async (req, res) => {
    const { tool, parameters } = req.body;

    console.log('-- request --', tool, parameters)
    if (!tool || !tools[tool]) {
        return res.status(400).json({ error: `Unknown tool: ${tool}` });
    }
    try {
        const result = await tools[tool](parameters || {});
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Optionally: legacy endpoints for direct REST calls
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