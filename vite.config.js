import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-web': 'react-native-web',
    },
  },
  server: {
    host: true,
    port: 8083,
  },
  build: {
    outDir: 'dist',
  },
});