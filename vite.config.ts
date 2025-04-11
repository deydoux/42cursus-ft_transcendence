import {defineConfig, loadEnv} from 'vite';

export default defineConfig(() => {
  const env = loadEnv('', process.cwd());

  const DEV = env.NODE_ENV === 'development';
  const PROD = !DEV;

  return {
    root: 'src/client',
    mode: DEV ? 'development' : 'production',
    build: {
      outDir: '../../dist',
      emptyOutDir: true,
      minify: PROD,
    },
  };
});
