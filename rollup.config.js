import { terser } from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';
import packageJson from './package.json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/main.ts',
  output: {
    file: packageJson.main,
    name: packageJson.name,
    format: 'cjs',
    sourcemap: true,
  },
  external: [...Object.keys(packageJson.dependencies || {})],
  plugins: [
    peerDepsExternal(),
    json(),
    resolve(),
    typescript({
      typescript: require('typescript'),
    }),
    terser(),
  ],
};
