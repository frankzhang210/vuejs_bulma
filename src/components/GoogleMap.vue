<template>
    <div class="container">
        <section class="section">
            <h1 class="title">Google Maps Integration</h1>

            <!-- Address Search Box -->
            <div class="box mb-4">
                <div class="field has-addons">
                    <div class="control is-expanded">
                        <input class="input" type="text" v-model="localSearchAddress" placeholder="Enter an address"
                            @keyup.enter="doSearchAddress">
                    </div>
                    <div class="control">
                        <button class="button is-primary" @click="doSearchAddress"
                            :class="{ 'is-loading': isSearching }">
                            <span class="icon">
                                <i class="fas fa-search"></i>
                            </span>
                            <span>Search</span>
                        </button>
                    </div>
                </div>
                <p v-if="searchError" class="help is-danger">{{ searchError }}</p>
            </div>

            <!-- Map Container -->
            <div class="box">
                <div class="map-container" id="google-map-container">
                    <div v-if="!isGoogleMapsLoaded" class="map-loading">
                        <p class="has-text-centered">
                            <span class="icon is-large">
                                <i class="fas fa-spinner fa-pulse"></i>
                            </span>
                            <br>
                            Loading Google Maps...
                        </p>
                    </div>
                    <GMapMap :center="center" :zoom="12" map-type-id="terrain"
                        style="width: 100%; height: 500px; display: block;" ref="mapRef">
                        <GMapMarker :position="center" :clickable="true" :draggable="true" @drag="updatePosition" />
                    </GMapMap>
                </div>
                <div class="mt-3" v-if="localCurrentAddress">
                    <p><strong>Current Address:</strong> {{ localCurrentAddress }}</p>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeMount, watch } from 'vue'
import { useLocationStore } from '@/stores/location.module'

export default {
    setup() {
        const locationStore = useLocationStore()
        // Ensure center always has a valid default value
        const center = ref({ lat: 47.615719, lng: -122.204033 })
        const localSearchAddress = ref('')
        const searchError = ref('')
        const isSearching = ref(false)
        const mapRef = ref(null)
        const localCurrentAddress = ref('')
        const isGoogleMapsLoaded = ref(false)
        const placesService = ref(null)

        // Check if Google Maps API is loaded
        const checkGoogleMapsLoaded = () => {
            return new Promise((resolve, reject) => {
                let checkCount = 0;
                const maxChecks = 20; // Maximum number of checks (10 seconds)

                const checkGoogleMaps = () => {
                    if (window.google && window.google.maps && window.google.maps.places) {
                        console.log("Google Maps API loaded successfully");
                        isGoogleMapsLoaded.value = true;
                        resolve(true);
                    } else {
                        checkCount++;
                        if (checkCount < maxChecks) {
                            console.log(`Waiting for Google Maps API to load... (${checkCount}/${maxChecks})`);
                            setTimeout(checkGoogleMaps, 500); // Check every 500ms
                        } else {
                            console.error("Google Maps API failed to load after multiple attempts");
                            reject(new Error("Google Maps API failed to load"));
                        }
                    }
                };

                checkGoogleMaps();
            });
        };

        // Initialize Places service
        const initPlacesService = () => {
            if (mapRef.value && mapRef.value.$mapObject) {
                placesService.value = new window.google.maps.places.PlacesService(mapRef.value.$mapObject);
                console.log("Places service initialized");
                return true;
            }
            return false;
        };

        // Function to search for a location using Places API
        const doSearchAddress = () => {
            if (!localSearchAddress.value.trim()) {
                searchError.value = 'Please enter an address to search';
                return;
            }

            searchError.value = '';
            isSearching.value = true;

            // Check if Google Maps API is loaded
            if (!isGoogleMapsLoaded.value) {
                checkGoogleMapsLoaded()
                    .then(() => doSearchAddressWithAPI())
                    .catch(error => {
                        searchError.value = `Google Maps API not loaded: ${error.message}`;
                        isSearching.value = false;
                    });
            } else {
                doSearchAddressWithAPI();
            }
        };

        // Search location using the Places API
        const doSearchAddressWithAPI = () => {
            // Initialize Places service if not already done
            if (!placesService.value) {
                if (!initPlacesService()) {
                    searchError.value = 'Map not initialized. Please try again.';
                    isSearching.value = false;
                    return;
                }
            }

            const request = {
                query: localSearchAddress.value,
                fields: ['name', 'geometry', 'formatted_address']
            };

            placesService.value.textSearch(request, (results, status) => {
                isSearching.value = false;

                if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                    const place = results[0];

                    // Check if geometry exists and has valid location
                    if (place.geometry && place.geometry.location) {
                        center.value = {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        };

                        localCurrentAddress.value = `Coordinates: ${center.value.lat.toFixed(6)}, ${center.value.lng.toFixed(6)}`

                        locationStore.updateMapLocation({
                            coordinates: center.value,
                            address: place.formatted_address || place.name
                        });
                    } else {
                        console.log("Place geometry structure:", place.geometry);
                        searchError.value = 'Invalid location data received. Please try a different address.';
                    }
                } else {
                    searchError.value = 'Location not found. Please try a different address.';
                    console.error("Places API error status:", status);
                }
            });
        };

        // Function to update position when marker is dragged
        const updatePosition = (event) => {
            // Ensure we have valid lat/lng methods
            if (event && event.latLng && typeof event.latLng.lat === 'function' && typeof event.latLng.lng === 'function') {
                const position = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                }

                // Ensure we have valid numeric values
                if (typeof position.lat === 'number' && !isNaN(position.lat) &&
                    typeof position.lng === 'number' && !isNaN(position.lng)) {

                    center.value = position

                    // Display coordinates
                    localCurrentAddress.value = `Coordinates: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`

                    // Update Pinia store with new location
                    locationStore.updateMapLocation({
                        coordinates: position,
                        address: localCurrentAddress.value
                    });

                    // Search for nearby places using the standard Places API
                    searchNearbyPlaces(position);
                } else {
                    console.error("Invalid position values:", position);
                }
            } else {
                console.error("Invalid event object or latLng property:", event);
            }
        }

        // Function to search for nearby places
        const searchNearbyPlaces = (position) => {
            // Check if Google Maps API is loaded and Places service is initialized
            if (!isGoogleMapsLoaded.value) {
                console.log("Google Maps API not loaded yet, skipping nearby search");
                return;
            }

            if (!placesService.value && !initPlacesService()) {
                console.error("Places service could not be initialized");
                return;
            }

            const request = {
                location: new window.google.maps.LatLng(position.lat, position.lng),
                radius: 50, // Small radius to get the closest place (in meters)
                type: ['establishment'] // Search for establishments (businesses, landmarks, etc.)
            };
           
        };

        // Check if Google Maps API is loaded before mounting
        onBeforeMount(() => {

            checkGoogleMapsLoaded()
                .catch(error => {
                    console.error("Failed to load Google Maps API:", error);
                    searchError.value = "Google Maps API failed to load. Please refresh the page.";
                });
        });

        // Initialize with coordinates display
        onMounted(() => {

            if (!center.value) {
                center.value = { lat: 40.689247, lng: -74.044502 }
            }

            // Display initial coordinates
            if (center.value && typeof center.value.lat === 'number' && typeof center.value.lng === 'number') {
                localCurrentAddress.value = `Latitude: ${center.value.lat.toFixed(6)}, Longitude: ${center.value.lng.toFixed(6)}`
            } else {
                console.error("Invalid center coordinates in onMounted:", center.value)
                localCurrentAddress.value = "Location coordinates unavailable"
            }

            // Check for stored address in Pinia
            console.log('Location store state:', locationStore.$state);
            if (locationStore.mapLocation.address) {
                localSearchAddress.value = locationStore.mapLocation.address;
            }

            // Wait for Google Maps API to be fully loaded
            checkGoogleMapsLoaded()
                .then(() => {
                    console.log("Google Maps API loaded in onMounted, initializing Places service");

                    // Initialize Places service after a short delay to ensure map is rendered
                    setTimeout(() => {
                        if (initPlacesService()) {
                            // Search for nearby places at the initial position
                            searchNearbyPlaces(center.value);
                        } else {
                            console.error("Failed to initialize Places service");
                        }
                    }, 1000);
                })
                .catch(error => {
                    console.error("Failed to load Google Maps API in onMounted:", error);
                });
        });


        return {
            center,
            localSearchAddress,
            searchError,
            isSearching,
            mapRef,
            localCurrentAddress,
            doSearchAddress,
            updatePosition,
            isGoogleMapsLoaded
        }
    }
}
</script>

<style scoped>
.map-container {
    width: 100%;
    height: 500px;
    margin: 0 auto;
    position: relative;
    min-height: 500px;
    border: 1px solid #ddd;
}

.map-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
}
</style>