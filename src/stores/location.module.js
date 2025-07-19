import { defineStore } from 'pinia'

export const useLocationStore = defineStore('location', {
    state: () => ({
        weatherLocation: {
            city: '' // Only city name for weather
        },
        mapLocation: {
            coordinates: null,  // { lat, lng }
            address: '',       // Full address for map
        },
        lastUpdated: null
    }),
    actions: {
        updateWeatherLocation(city) {
            this.weatherLocation.city = city;
            this.lastUpdated = new Date().toISOString();
        },
        updateMapLocation(payload) {
            this.mapLocation.coordinates = payload.coordinates;
            this.mapLocation.address = payload.address;
            this.lastUpdated = new Date().toISOString();
        }
    },
    getters: {
        formattedAddress: (state) => state.mapLocation.address || '',
        hasLocation: (state) => !!state.mapLocation.coordinates,
        cityName: (state) => state.weatherLocation.city || ''
    }
})