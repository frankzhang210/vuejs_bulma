<template>
    <div class="container">
        <div class="notification is-info is-light">
            <p><strong>Natural Language Search</strong></p>
            <p>Enter a natural language request to load either weather or map.</p>
            <p>Examples:</p>
            <ul>
                <li>"Show me the weather in New York" → Loads weather component.</li>
                <li>"Display a map of Tokyo" → Loads map component.</li>
            </ul>
        </div>


        <div class="field has-addons mb-4">
            <div class="control is-expanded has-icons-left">
                <input class="input is-medium" type="text" v-model="userInput"
                    placeholder="Enter city name or US ZIP code" @keyup.enter="handleSubmit">
                <span class="icon is-small is-left">
                    <i class="fas fa-search"></i>
                </span>
            </div>
            <div class="control">
                <button class="button is-primary is-medium" @click="handleSubmit">
                    <span class="icon">
                        <i class="fas fa-search"></i>
                    </span>
                    <span>Search</span>
                </button>
            </div>
        </div>

        {{ extractedLocation }}
        <div v-if="showWeather">
            <WeatherForecast :location="extractedLocation" />
        </div>
        <div v-else-if="showMap">
            <GoogleMap :location="extractedLocation" />
        </div>
    </div>
</template>

<script>
import { defineAsyncComponent, ref, onMounted } from 'vue';
import { extractLocationFromText } from '@/api/cohere.service';
import { useLocationStore } from '@/stores/location.module';
import nlp from 'compromise';

export default {
    components: {
        WeatherForecast: defineAsyncComponent(() => import('../components/WeatherForecast.vue')),
        GoogleMap: defineAsyncComponent(() => import('@/components/GoogleMap.vue')),
    },
    setup() {
        const locationStore = useLocationStore();
        const userInput = ref('');
        const showWeather = ref(false);
        const showMap = ref(false);
        const extractedLocation = ref('');

        const handleSubmit = async () => {

            // Try to extract city or state using NLP
            const doc = nlp(userInput.value);
            const places = doc.places().out('array');
            if (places.length > 0) {
                extractedLocation.value = places[0];
                console.log('-nlp-', extractedLocation.value)
                locationStore.updateWeatherLocation(extractedLocation.value.trim());
                locationStore.updateMapLocation({ address: extractedLocation.value });
            } else {
                // Try to extract ZIP code using regex
                const zipRegex = /\b\d{5}(?:-\d{4})?\b/g;
                const zipMatch = userInput.value.match(zipRegex);
                if (zipMatch) {
                    extractedLocation.value = zipMatch[0];
                    console.log('-zip-', extractedLocation.value)
                    locationStore.updateWeatherLocation(extractedLocation.value.trim());
                    locationStore.updateMapLocation({ address: extractedLocation.value });
                } else {
                    // Fallback to Cohere API if local extraction fails
                    try {
                        extractedLocation.value = await extractLocationFromText(userInput.value);
                        locationStore.updateMapLocation({ address: extractedLocation.value });
                        console.log('-cohere-', extractedLocation.value)
                        locationStore.updateWeatherLocation(extractedLocation.value.trim().split(',')[0]);
                    } catch (error) {
                        console.error('Failed to extract location:', error);
                        return;
                    }
                }
            }

            // Determine if the request is for weather or map
            if (userInput.value.toLowerCase().includes('map')) {
                if(showMap.value == true) {
                    return
                }

                showMap.value = true
                showWeather.value = false
            } else {
                if(showWeather.value == true){
                    return
                } 

                showWeather.value = true
                showMap.value = false
            }
        };

        onMounted(() => {
            if (locationStore.cityName) {
                extractedLocation.value = locationStore.cityName;
            }
        });

        return {
            userInput,
            showWeather,
            showMap,
            extractedLocation,
            handleSubmit
        };
    }
};
</script>