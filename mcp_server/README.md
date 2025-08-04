# MCP Server

This is a Node.js server designed to mimic the MCP (Model Context Protocol) server to facilitate the integration of the Vue.js frontend with the OpenWeatherMap API.

## Prerequisites
- Node.js (version 14 or higher)

## Installation and Running the Server
1. Navigate to the `mcp_server` directory:
   ```bash
   cd mcp_server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```

## MCP Endpoint
- `http://localhost:3000/mcp/invoke`
    
    ```
    {
        "tool": "getWeatherByCity",
        "parameters": { "city": "Seattle" }
    }
    ```

- `http/weather/city/:city`: Regular API to fetch weather data by city or zipcode

## License
This project is licensed under the MIT License.