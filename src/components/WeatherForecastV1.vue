<template>
    <div class="mb-6">
        <div class="box has-background-white-bis">
            <h2 class="title is-4 has-text-primary">
                <span class="icon-text">
                    <span class="icon">
                        <i class="fas fa-cloud-sun"></i>
                    </span>
                    <span>7-Day Weather Forecast</span>
                </span>
            </h2>

            <div class="field has-addons mb-4">
                <div class="control is-expanded has-icons-left">
                    <input class="input is-medium" type="text" v-model="searchQuery"
                        placeholder="Enter city name or US ZIP code" @keyup.enter="searchWeather">
                    <span class="icon is-small is-left">
                        <i class="fas fa-search"></i>
                    </span>
                </div>
                <div class="control">
                    <button class="button is-primary is-medium" @click="searchWeather"
                        :class="{ 'is-loading': isLoading }" :disabled="isLoading">
                        <span class="icon">
                            <i class="fas fa-search"></i>
                        </span>
                        <span>Search</span>
                    </button>
                </div>
            </div>

            <div v-if="error" class="notification is-danger is-light">
                <button class="delete" @click="clearError"></button>
                <span class="icon-text">
                    <span class="icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </span>
                    <span>{{ error }}</span>
                </span>
            </div>

            <div v-if="isLoading && !error" class="has-text-centered my-5 py-5">
                <div class="is-flex is-justify-content-center">
                    <div class="button is-large is-text" style="width: 50px; height: 50px; border: none;"></div>
                </div>
                <p class="mt-4 is-size-5">Fetching weather data...</p>
            </div>

            <div v-if="weatherData.length > 0 && !isLoading" class="mt-5">
                <div class="is-flex is-align-items-center mb-4">
                    <span class="icon is-medium mr-2">
                        <i class="fas fa-map-marker-alt has-text-danger"></i>
                    </span>
                    <h3 class="subtitle is-4 mb-0"> {{ locationName }}</h3>
                </div>

                <div class="columns is-multiline is-variable is-2">
                    <div v-for="(day, index) in weatherData" :key="index"
                        class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen">
                        <div class="card has-background-white">
                            <header class="card-header has-background-primary-light">
                                <p class="card-header-title is-centered">
                                    {{ day.date }}
                                </p>
                            </header>
                            <div class="card-content has-text-centered py-5">
                                <div class="is-flex is-justify-content-center mb-3">
                                    <img :src="day.iconUrl" :alt="day.description" style="width: 80px; height: 80px;">
                                </div>
                                <p class="title is-2 mb-2">{{ day.temp }}°C</p>
                                <p class="subtitle is-6 has-text-grey">{{ day.description }}</p>
                            </div>
                            <footer class="card-footer">
                                <a class="card-footer-item" @click="showDetails(day)">
                                    <span class="icon-text">
                                        <span class="icon has-text-info">
                                            <i class="fas fa-info-circle"></i>
                                        </span>
                                        <span>Detail</span>
                                    </span>
                                </a>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="noResults && !isLoading && !error" class="notification is-info is-light">
                <span class="icon-text">
                    <span class="icon">
                        <i class="fas fa-info-circle"></i>
                    </span>
                    <span>No weather data found. Please try another city or postal code.</span>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, getCurrentInstance, onMounted } from 'vue';
import { getWeatherByCity, getWeatherByZipCode, processWeatherData } from '@/api/weather.service';
import { useLocationStore } from '@/stores/location.module';
import { useRouter } from 'vue-router';

export default {

    setup() {
        const searchQuery = ref('');
        const weatherData = ref([]);
        const isLoading = ref(false);
        const error = ref('');
        const locationName = ref('');

        const { proxy } = getCurrentInstance();
        const locationStore = useLocationStore();

        // Initialize search query with stored city name if available
        onMounted(() => {
            if (locationStore.cityName) {
                searchQuery.value = locationStore.cityName;
            }
        });

        const noResults = computed(() => {
            return weatherData.value.length === 0 && searchQuery.value !== '' && !isLoading.value;
        });

        const searchWeather = async () => {
            if (!searchQuery.value.trim()) {
                error.value = 'Please enter a city name or postal code.';
                return;
            }

            error.value = '';
            isLoading.value = true;
            weatherData.value = [];

            try {
                let data = await getWeatherByCity(searchQuery.value.trim());    // city supports zipcode but zipcode api doesn't support city
                // data = await getWeatherByZipCode(searchQuery.value.trim());

                locationName.value = data.city?.name || 'Unknown location';

                weatherData.value = processWeatherData(data);

                // Store location data for weather (city only)
                locationStore.updateWeatherLocation(searchQuery.value.trim());

                if (weatherData.value.length === 0) {
                    error.value = 'Unable to fetch weather forecast data';
                }
            } catch (err) {
                error.value = `Failed to fetch weather data: ${err.message}`;
                weatherData.value = [];
            } finally {
                isLoading.value = false;
            }
        };

        const clearError = () => {
            error.value = '';
        };

        const showDetails = (day) => {
            // selectedDay.value = day;
            proxy.$buefy.dialog.alert({
                title: `Weather Detail for ${day.date}`,
                message: `
                    <div class="content">
                        <p><strong>Temperature:</strong> ${day.temp}°C</p>
                        <p><strong>Weather:</strong> ${day.description}</p>
                        <p><strong>Humidity:</strong> ${day.humidity}%</p>
                        <p><strong>Wind Speed:</strong> ${day.windSpeed} m/s</p>
                    </div>
                `,
                confirmText: 'Close',
                type: 'is-info',
                hasIcon: true,
                ariaRole: 'alertdialog',
                ariaModal: true
            });
        };

        return {
            searchQuery,
            weatherData,
            isLoading,
            error,
            locationName,
            noResults,
            searchWeather,
            clearError,
            showDetails,
        };
    }
};
</script>

<style scoped>
/* Card hover effects */
.card {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 8px;
    overflow: hidden;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

/* Improved tab styles */
.tabs.is-toggle li.is-active a {
    background-color: #3273dc;
    border-color: #3273dc;
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
    .title.is-2 {
        font-size: 1.75rem !important;
    }
}
</style>