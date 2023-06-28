import sveltePreprocess from 'svelte-preprocess';
import { fileURLToPath } from 'url'
import { resolve } from "path";

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const libPath = resolve(__dirname, 'src/lib');

export default {
    preprocess: sveltePreprocess({
        scss: {
            includePaths: ['shared/styles'],
            prependData: `@import "${libPath}/styles/mq.scss"; @import "${libPath}/styles/fonts.scss";`,
        },
    }),
    compilerOptions: {
        hydratable: true,
    },
};