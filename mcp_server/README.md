# MCP Server

This is a Node.js server to mimic the MCP (Model Context Protocol) server. 
Below are the instructions to set up and run the server.

## Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

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

## API Endpoints
- `/weather/city/:city`: Fetch weather data by city or zipcode

## License
This project is licensed under the MIT License.