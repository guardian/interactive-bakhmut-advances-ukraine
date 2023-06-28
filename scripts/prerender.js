import { createServer as createViteServer } from 'vite'
import path from 'path';
import fs from 'fs';

const atomName = process.env.ATOM_NAME;

export function prerender(options = {}) {
    const plugin =  {
        name: 'vite-plugin-prerender',
        apply: 'build',

        async generateBundle() {
            const vite = await createViteServer({
                server: { middlewareMode: true },
                appType: 'custom'
            });

            const { render } = await vite.ssrLoadModule(path.join(atomName, 'app.prerender.js'));
            const mainHTML = await render();

            this.emitFile({
                type: 'asset',
                fileName: 'main.html',
                source: mainHTML
            });

            vite.close();
        },
    };

    return plugin;
}
