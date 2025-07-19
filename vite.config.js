import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default ({ mode }) => {
    return defineConfig({
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            }
        },
        plugins: [
            vue()            
        ],
    })
}