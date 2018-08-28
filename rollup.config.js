import string from 'rollup-plugin-string';
import nodeResolve from 'rollup-plugin-node-resolve';
import { terser }  from 'rollup-plugin-terser';

export default [{
  input: 'game.js',
  context: 'window',
  output: {
    file: 'dist/game.js',
    format: 'iife',
    sourcemap: 'inline',
  },
  plugins: [
    
    string({
      include: ['**/*.css', '**/*.json'],
    }),
    nodeResolve({ jsnext: true }),
    terser({mangle:{ toplevel: true, module: true },compress:true,keep_fnames: false, nameCache: null})
  ],
}];
