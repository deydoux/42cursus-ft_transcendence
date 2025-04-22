import {defineConfig, loadEnv} from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  const env = loadEnv('', process.cwd());

  const DEV = env.NODE_ENV === 'development';

  return {
    root: 'src/client',
    plugins: [tailwindcss()],
    mode: DEV ? 'development' : 'production',
    build: {
      outDir: '../../dist',
      emptyOutDir: true,
      minify: false,
      sourcemap: DEV,
    },
  };
});
