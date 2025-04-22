import {defineConfig, loadEnv} from 'vite';
import tailwindcss from '@tailwindcss/vite';

loadEnv('', process.cwd());
const DEV = process.env.VITE_USER_NODE_ENV === 'development';

export default defineConfig({
  root: 'src/client',
  plugins: [tailwindcss()],
  mode: DEV ? 'development' : 'production',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    minify: false,
    sourcemap: DEV,
  },
});
