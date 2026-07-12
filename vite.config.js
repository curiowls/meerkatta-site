import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        useCases: resolve(__dirname, 'use-cases/index.html'),
        useCaseDictation: resolve(__dirname, 'use-cases/ai-dictation-for-mac/index.html'),
        useCaseThoughtCapture: resolve(__dirname, 'use-cases/thought-capture/index.html'),
        useCaseVocabulary: resolve(__dirname, 'use-cases/custom-vocabulary/index.html'),
        useCaseWorkflows: resolve(__dirname, 'use-cases/ai-workflows/index.html'),
        about: resolve(__dirname, 'about/index.html'),
        pricing: resolve(__dirname, 'pricing/index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html'),
        refund: resolve(__dirname, 'refund/index.html'),
        pay: resolve(__dirname, 'pay/index.html'),
        padsandbox: resolve(__dirname, 'padsandbox/index.html'),
        welcome: resolve(__dirname, 'welcome/index.html'),
      },
    },
  },
})
