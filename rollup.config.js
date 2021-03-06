// this file will not afect the sandbox but will
// afect the deployment and dowload

import svelte from "rollup-plugin-svelte";
import replace from '@rollup/plugin-replace';
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "index.js",
  output: {
    sourcemap: true,
    format: "es",
    name: "app",
    dir: "public/build",
    //file: "public/bundle.js",
  },
  manualChunks: (moduleName) => {
    if (moduleName.includes("node_modules")) {
      return "vendor"
    }
    if (moduleName.includes("src/")) {
      return "webapp"
    }
  },
  plugins: [
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: css => {
        css.write("bundle.css");
      }
    }),
    // replace tokens on compile,
    // needed for accessing prod env vars
    production && replace({
      'ENV.SHEET_ID': `'${process.env.SHEET_ID}'`,
      'ENV.EMAIL': `'${process.env.EMAIL}'`,
      'ENV.WA_NUMBER': `'${process.env.WA_NUMBER}'`,
    }),
    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve(),
    commonjs(),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ]
};
