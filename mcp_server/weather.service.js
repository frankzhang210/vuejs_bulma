/**
 * Weather Service - Handles communication with the OpenWeatherMap API
 */

// Base URL
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const API_KEY = "78f74f285ffda2dfd594091f81c56354"; // todo: replace with your api key

/**
 * @param {string} city or zip code
 * @returns {Promise}
 */
export const getWeatherByCity = async (city) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

    try {
        const response = await fetch(
            `${API_BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`,
            { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to get weather data');
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to get weather data:', error);
        throw error;
    }
}

/**
 * @param {Object} data - Raw weather data
 * @returns {Array} - Processed 7-day weather forecast data
 */
export const processWeatherData = (data) => {
    if (!data || !data.list) {
        return [];
    }

    // The free API from OpenWeatherMap returns forecasts at 3-hour intervals
    // We need to group them by day and take the average for each day
    const dailyData = {};

    data.list.forEach(item => {
        // Extract the date part (YYYY-MM-DD)
        const date = item.dt_txt.split(' ')[0];

        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                icons: [],
                descriptions: [],
                humidities: [],
                windSpeeds: [],
                date: new Date(date).toLocaleDateString()
            };
        }

        dailyData[date].temps.push(item.main.temp);
        dailyData[date].icons.push(item.weather[0].icon);
        dailyData[date].descriptions.push(item.weather[0].description);
        dailyData[date].humidities.push(item.main.humidity);
        dailyData[date].windSpeeds.push(item.wind.speed);
    });

    // Calculate the average temperature and most common weather icon for each day
    return Object.values(dailyData).map(day => {
        // Calculate average temperature
        const avgTemp = day.temps.reduce((sum, temp) => sum + temp, 0) / day.temps.length;

        // Calculate average humidity
        const avgHumidity = day.humidities.reduce((sum, humidity) => sum + humidity, 0) / day.humidities.length;

        // Calculate average wind speed
        const avgWindSpeed = day.windSpeeds.reduce((sum, speed) => sum + speed, 0) / day.windSpeeds.length;

        // Find the most common weather icon
        const iconCounts = {};
        day.icons.forEach(icon => {
            iconCounts[icon] = (iconCounts[icon] || 0) + 1;
        });

        let mostCommonIcon = day.icons[0];
        let maxCount = 0;

        Object.entries(iconCounts).forEach(([icon, count]) => {
            if (count > maxCount) {
                mostCommonIcon = icon;
                maxCount = count;
            }
        });

        // Find the most common weather description
        const descriptionCounts = {};
        day.descriptions.forEach(desc => {
            descriptionCounts[desc] = (descriptionCounts[desc] || 0) + 1;
        });

        let mostCommonDescription = day.descriptions[0];
        maxCount = 0;

        Object.entries(descriptionCounts).forEach(([desc, count]) => {
            if (count > maxCount) {
                mostCommonDescription = desc;
                maxCount = count;
            }
        });

        return {
            date: day.date,
            temp: Math.round(avgTemp),
            icon: mostCommonIcon,
            description: mostCommonDescription,
            iconUrl: `https://openweathermap.org/img/wn/${mostCommonIcon}@2x.png`,
            humidity: Math.round(avgHumidity),
            windSpeed: parseFloat(avgWindSpeed.toFixed(1))
        };
    }).slice(0, 7);
};