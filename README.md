[![stability-beta](https://img.shields.io/badge/stability-beta-33bbff.svg)](https://github.com/mkenney/software-guides/blob/master/STABILITY-BADGES.md#beta)

## What is this?

This is an opinionated template for creating interactive atoms. It uses [Vite](https://vitejs.dev/) in combination with [Rollup](https://rollupjs.org/guide/en/) for a smooth development experience and fast builds.

* 💡 Instant local dev server start (no bundling required)
* ⚡️ Instant visual feedback through [Hot Module Replacement (HMR)](https://vitejs.dev/guide/features.html#hot-module-replacement)
* 🔧 Built-in support for [Svelte](https://svelte.dev/) and [Preact](https://preactjs.com/)
* 📝 Prerendering enabled by default
* 📦 Effortless deployment


## How to use the template

### Prerequisites
The template is compatible with Node 16+. You can install new versions of node using [NVM](https://github.com/nvm-sh/nvm#installing-and-updating). 

### Getting started

1. Click the "Use this template" button on this page to create a new repository.
2. Clone the repo 
3. Install dependencies: `npm install`

To start the dev server:
```
npm run dev
```

To build for production:
```
npm run build
```

Builds will be placed in the `/build` directory.

### Deployment

Fill out `project.config.js`:

```js
{
    "title": "Title of your interactive",
    "path": "year/month/unique-title"
}
```

To deploy to the Interactives S3 bucket you need AWS credentials for the Interactives account in your command line. You can get these from the Guardian's permissions manager system [Janus](https://janus.gutools.co.uk/). You need to be assigned these permissions and be on a Guardian network or VPN to see them on Janus. 

By default you'll want to run this command:
```
npm run deploy:live
```

But __if you're making changes to an atom that has already been published__, it is advisable to use:
```
npm run deploy:preview
```

This will make the changes visible in composer preview, but not on the live page, allowing the atom to be tested before being published to the live page.

Running the deploy task will output the url to be embedded in Composer.

To verify that deploy was picked up sucessfully:
```
npm run deploylog:live
```
Or:
```
npm run deploylog:preview
```

## Project structure

The files that make up your interactive atom live in the `/src` directory. This is what a typical src directory looks like:

* `/assets`
* `/atoms`
* `/lib`

### Assets
The recommended place for putting any static assets (Images, JSON, etc.). These assets are shared between atoms and can be referenced using `__assetsPath__`. For example:

```html
<img src="__assetsPath__/guardian-logo.svg" alt="Guardian logo"/>
```
The __assetsPath__ string is automatically replaced with the correct path when running the dev server or building for production.  

### Atoms
Each directory in the `/atoms` folder represents a single interactive atom. To create a new atom, duplicate an existing atom and give it a descriptive name.

When embedding multiple atoms on the same Composer page, make sure you use unique CSS IDs for each atom in their respective `main.html` files.

```html
<div id="some-unique-id">
    {{ html }}
</div>
```

You will need to change this ID in `app.js` too.

```js
const app = new Atom({
    target: document.getElementById('some-unique-id'),
    hydrate: true,
    props: {},
});
```

### Lib
Source files that are shared by multiple atoms should be placed in the `/lib` folder. These files should be referenced using the `$lib` import alias. For example:

```js
import SharedComponent from "$lib/components/SharedComponent.svelte";
```

## Preact support

[Preact](https://preactjs.com/) support is enabled by default. It relies on the Preact plugin for Vite (`@preact/preset-vite`) in `vite.config.js`

The `app.js` remains the entry point for the atom. Here's an example of what it would look like when using Preact:

```js
import './styles/main.scss';
import { render } from 'preact';
import Atom from './components/Atom';

render(<Atom />, document.getElementById("gv-atom"));
```

And here's an example of what `app.prerender.js` should look like:

```js
import renderToString from 'preact-render-to-string';
import mainHTML from './main.html?raw';
import Atom from './components/Atom';

export function render() {
    const html = renderToString(<Atom />);
    return mainHTML.replace("{{ html }}", html);
}
```

## Troubleshooting

### Using React modules with Preact breaks prerendering

If you want to use React modules with Preact, you need to set `ssr.noExternal` to `true` in `vite.config.js`. This ensures that import statements in dependencies are properly aliased to `preact/compat`.

See [Vite documentation](https://vitejs.dev/guide/ssr.html#ssr-externals) for more details.

## Supported browsers 

A list of browsers that the guardian supports can be found here: [https://www.theguardian.com/help/recommended-browsers](https://www.theguardian.com/help/recommended-browsers)
