import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import Inspect from 'vite-plugin-inspect'
import path from "path";
import autoprefixer from "autoprefixer";
import { viteStaticCopy } from 'vite-plugin-static-copy';
import replace from '@rollup/plugin-replace';
import { testHarness } from "./scripts/testHarness.js";
import { prerender } from "./scripts/prerender.js";
import preact from "@preact/preset-vite";

const assetsPath = process.env.ATOM_ASSETS_PATH || "";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        '$lib': path.resolve(__dirname, "src/lib"),
        '$assets': path.resolve(__dirname, "src/assets"),
      },
    },
    esbuild: {
      // remove console.log and debugger statements from production builds
      drop: ["debugger"],
      pure: ["console.log", "console.error", "console.warn", "console.debug", "console.trace"],
    },
    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
      devSourcemap: true,
    },
    plugins: [
      replace({
        values: {
          __assetsPath__: assetsPath,
        },
        preventAssignment: true,
      }),

      svelte({
        configFile: path.resolve(__dirname, "svelte.config.js"),
      }),

      preact(),

      testHarness(),

      // generate prerendered HTML
      // NOTE: Only works when you don't reference 'document' or 'window' in Svelte components.
      // If you really need to use either of those, disable prerendering here.
      prerender(),

      viteStaticCopy({
        targets: [
          {
            src: path.resolve(__dirname, 'src/assets/**/*'),
            dest: path.resolve(__dirname, `build/assets`)
          }
        ]
      }),
      
      Inspect(),
    ],
    root: path.resolve(__dirname, "src/atoms"),
    publicDir: path.resolve(__dirname, "src/assets"),
    build: {
      copyPublicDir: false,
      sourcemap: true,
      target: "es2015",
      emptyOutDir: true,
      cssCodeSplit: false,
      rollupOptions: {
        input: path.resolve(__dirname, `src/atoms/${mode}/app.js`),
        output: {
          dir: path.resolve(__dirname, `build/${mode}`),
          entryFileNames: "[name].js",
          assetFileNames: "style.[ext]",
          format: 'iife',
        },
      },
    },
    ssr: {
      // Dependences are not run through Vite's transform module by default.
      // In some cases, you might want to uncomment this setting, e.g. when
      // you want a React module to work with preact/compat aliasing.
      // noExternal: true,
    }
  };
});
