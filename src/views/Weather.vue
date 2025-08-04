<template>
    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-8 is-offset-2">
                    <WeatherForecast />
                </div>
            </div>

            <div class="content mt-6">
                <p>
                    This application uses the OpenWeatherMap API to fetch weather data.
                </p>

            </div>
        </div>
    </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';

export default {
    components: {
        WeatherForecast: defineAsyncComponent(() => import('../components/WeatherForecast.vue'))
    }
}
</script>