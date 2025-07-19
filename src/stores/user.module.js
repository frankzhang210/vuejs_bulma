import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        isAuthenticated: false,
        user: {
            id: null,
            name: null,
            email: null,
            picture: null,
            token: null
        },
        lastLogin: null
    }),
    actions: {
        loginWithGoogle(response) {
            
            // The response now contains a JWT token in the credential field
            const token = response.credential;
            
            // Parse the JWT token (it's in format header.payload.signature)
            // We need the payload part which is the second part
            try {
                // Decode the base64 encoded payload
                const payload = JSON.parse(atob(token.split('.')[1]));
                
                // Extract user information from the decoded payload
                const { sub, name, email, picture, given_name, family_name } = payload;
                
                this.user = {
                    id: sub,
                    name: name || `${given_name} ${family_name}`.trim(),
                    email: email,
                    picture: picture,
                    token: token
                };
                
                this.isAuthenticated = true;
                this.lastLogin = new Date().toISOString();
                
                // Store token in localStorage for persistence
                localStorage.setItem('googleToken', token);
                
                console.log('User logged in:', this.user);
            } catch (error) {
                console.error('Error parsing Google login response:', error);
                // Handle the error appropriately
            }
        },

        logout() {
            // Clear user data
            this.user = {
                id: null,
                name: null,
                email: null,
                picture: null,
                token: null
            };

            this.isAuthenticated = false;

            // Remove token from localStorage
            localStorage.removeItem('googleToken');
        },

        // Check if user has a stored token on app initialization
        checkAuth() {
            const token = localStorage.getItem('googleToken');
            if (token) {
                // Here you would typically validate the token with your backend
                // For now, we'll just set the authenticated state
                this.isAuthenticated = true;
                this.user.token = token;
                // Note: We don't have the user profile info here
                // In a real app, you might want to fetch the user profile from your backend
            }
        }
    },
    getters: {
        isLoggedIn: (state) => state.isAuthenticated,
        userProfile: (state) => state.user,
        userName: (state) => state.user.name || 'Guest',
        userPicture: (state) => state.user.picture
    }
})