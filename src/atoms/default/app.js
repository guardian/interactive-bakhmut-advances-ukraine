import './styles/main.scss';
import Atom from './components/Atom.svelte';

// enable this when creating an atom for the article template
// import '$lib/helpers/resizeFrame';

// create scrollbar width CSS variable
import '$lib/helpers/scrollbarWidth';


const app = new Atom({
	target: document.getElementById('gv-atom'),
	hydrate: true,
	props: {},
});

export default app;