import _ from 'lodash';
import { normalizePath } from 'vite';
import { readFile } from 'fs/promises';
import path from 'path';
import { listDirectories } from './utils/fileSystem.js';
import config from '../project.config.js';

export function testHarness(options = {}) {
    let root;

    const plugin =  {
        name: 'vite-plugin-testharness',
        apply: 'serve',
        
        configResolved(config) {
            root = config.root;
        },

        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                let url = null;
                try {
                    url = decodeURI(req.url);
                } catch (error) {
                    // catch the use of <%= path %>
                    if (req.url.includes('%3C%=%20path%20%%3E')) {
                        console.error('The use of <%= path %> is not supported in this template. Please use __assetsPath__ instead')
                    }
                    console.error('Invalid url:', req.url);
                    return next();
                }

                const path = normalizePath(url);

                if (path === '/' || path.startsWith('/atoms/')) {

                    let template = await plugin.load(path);
                    if (!template) {
                        console.log('Could not find html for path', path);
                        return next();
                    }

                    let mainHTML = await loadMainHTML(path, server);
                    if (mainHTML) {
                        mainHTML = await server.transformIndexHtml('/', mainHTML);
                    }

                    // Apply lodash templating
                    const result = await plugin.transformTemplateHTML(template, mainHTML, path);           
                    res.end(result);
                } else {
                    return next();
                }
            });
        },

        async load(id) {
            let match;

            if (id === '/') {
                return readFile('./harness/index.html', 'utf8');
            } else if (id.match(/^\/atoms\/[^\/]+\/$/)) { // match '/atoms/{atom}/'
                return readFile('./harness/templates.html', 'utf8');
            } else if (match = id.match(/^\/atoms\/[^\/]+\/([^\/]+)\/$/)) { // match '/atoms/{atom}/{template}/'
                return readFile(`./harness/templates/${match[1]}.html`, 'utf8');
            }
            return null;
        },

        async transformTemplateHTML(templateHTML, mainHTML, id) {
            if (id === '/') {
                const atomDirectories = await listDirectories(root);
                return _.template(templateHTML)({
                    atoms: atomDirectories,
                });
            } else if (id.match(/^\/atoms\/[^\/]+\/[^\/]+\/$/)) {
                const atom = resolveAtom(id);
        
                return _.template(templateHTML)({
                    title: config.title,
                    headline: config.placeholders.headline,
                    standfirst: config.placeholders.standfirst,
                    paragraphStyle: config.placeholders.paragraphBefore ? 'display: block;' : 'display: none;',
                    paragraphBefore: config.placeholders.paragraphBefore,
                    html: mainHTML,
                    js: path.join(root, atom, 'app.js'),
                })
            }
        
            return templateHTML;
        }
    };

    return plugin;
}

function resolveAtom(id) {
    const pathComponents = id.split('/').slice(1);
    if (pathComponents[0] === 'atoms') {
        return pathComponents[1];
    }

    return null;
}

async function loadMainHTML(id, server) {
    const atomName = resolveAtom(id);
    if (atomName) {
        const { render } = await server.ssrLoadModule(path.join(atomName, 'app.prerender.js'))
        return render();
    }

    return null;
}