import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
// base './' makes the build work at any path, e.g. https://<user>.github.io/<repo>/
export default defineConfig({ base: './', plugins: [react(), viteSingleFile()], build: { chunkSizeWarningLimit: 5000 } });
