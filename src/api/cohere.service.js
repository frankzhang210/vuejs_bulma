import axios from 'axios';

const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY || process.env.COHERE_API_KEY;
const COHERE_API_URL = 'https://api.cohere.ai/v1/chat';

/**
 * Extracts city, state, and zip code (if available) from user input text using Cohere API.
 * @param {string} text - User input text.
 * @returns {Promise<string>} - Extracted city, state, and zip code (if available).
 */
export const extractLocationFromText = async (text) => {
    try {
        const response = await axios.post(
            COHERE_API_URL,
            {
                model: 'command-r-plus',
                message: `Extract the city, state, and zip code (if available) from the following text: ${text}. Only return the city, state, and zip code if available.`,
                temperature: 0.3,
            },
            {
                headers: {
                    'Authorization': `Bearer ${COHERE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.text.trim();
    } catch (error) {
        console.error('Error calling Cohere API:', error);
        throw error;
    }
};
