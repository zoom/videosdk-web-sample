import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs, { copyFileSync, existsSync, mkdirSync } from 'fs';
import { glob } from 'glob';
import svgr from 'vite-plugin-svgr';

const processorDir = resolve(__dirname, 'src/processor');
const workerFiles = fs.readdirSync(processorDir).filter((file) => file.endsWith('processor.ts'));

// Build entry points for processors
const processorsInput: Record<string, string> = workerFiles.reduce((acc, file) => {
  const workerName = file.replace('.ts', '');
  acc[workerName] = resolve(processorDir, file);
  return acc;
}, {});

// Custom plugin to copy VideoSDK lib files
const copyVideoSDKLibPlugin = () => {
  return {
    name: 'copy-videosdk-lib',
    buildStart() {
      // Copy VideoSDK lib files during build
      const sourceDir = resolve(__dirname, 'node_modules/@zoom/videosdk/dist/lib');
      const targetDir = resolve(__dirname, 'public/lib');

      if (existsSync(sourceDir)) {
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }

        const files = glob.sync('**/*', { cwd: sourceDir, nodir: true });
        files.forEach((file: string) => {
          const srcFile = resolve(sourceDir, file);
          const destFile = resolve(targetDir, file);
          const destDir = resolve(destFile, '..');

          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }

          try {
            copyFileSync(srcFile, destFile);
          } catch (error) {
            console.warn(`Failed to copy ${file}:`, error);
          }
        });
      }
    }
  };
};

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'named',
        ref: true,
        svgo: false,
        titleProp: true
      },
      include: '**/*.svg'
    }),
    copyVideoSDKLibPlugin()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        streaming: resolve(__dirname, 'streaming.html'),
        ...processorsInput
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'main' || chunkInfo.name === 'streaming') {
            return 'assets/[name]-[hash].js';
          }
          return 'assets/processors/[name].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith('.css')) {
            return 'assets/[name]-[hash].css';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
    // https: false // Set to true and configure with SSL certs if needed
  },
  publicDir: 'public',
  define: {
    'process.env': {}
  }
});
