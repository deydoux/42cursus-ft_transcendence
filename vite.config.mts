import {defineConfig, loadEnv} from 'vite';
import tailwindcss from '@tailwindcss/vite';

const {GOOGLE_ID, VITE_USER_NODE_ENV} = loadEnv('', process.cwd(), '');
const DEV = VITE_USER_NODE_ENV === 'development';

export default defineConfig({
  root: 'src/client',
  plugins: [tailwindcss()],
  mode: DEV ? 'development' : 'production',
  define: {
    __GOOGLE_ID__: JSON.stringify(GOOGLE_ID),
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
  },
});
