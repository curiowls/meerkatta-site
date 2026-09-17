import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: { proxy: { '/api/': 'http://127.0.0.1:5202' } },
  optimizeDeps: { esbuildOptions: { target: ['es2022', 'safari16', 'chrome100', 'firefox100'] } },
  build: {
    target: ['es2022', 'safari16', 'chrome100', 'firefox100'],
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        journal: resolve(__dirname, 'journal/index.html'),
        journalFuture: resolve(__dirname, "journal/when-thought-needs-more-than-text/index.html"),
        journal0: resolve(__dirname, 'journal/catch-an-unfinished-thought/index.html'),
        journal1: resolve(__dirname, 'journal/speak-a-useful-first-draft/index.html'),
        journal2: resolve(__dirname, 'journal/return-to-what-you-capture/index.html'),

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
