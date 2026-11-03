

// import { defineConfig } from 'vite'
// import react, { reactCompilerPreset } from '@vitejs/plugin-react'
// import babel from '@rolldown/plugin-babel'

// export default defineConfig({
//   plugins: [
//     react(),
//     babel({ presets: [reactCompilerPreset()] })
//   ],
//   server: {
//     host: true,
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'http://192.168.88.13:7000',
//         changeOrigin: true,
//       },
//     },
//     watch: {
//       ignored: ['**/public/**'],
//     },
//   },
// })
















import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.88.13:7000',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['**/public/**'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,   // clears old files on every build
    sourcemap: false,    // don't expose source code on live site
  },
})