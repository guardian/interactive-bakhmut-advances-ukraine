import Atom from './components/Atom.svelte';
import mainHTML from './main.html?raw';

export function render() {
	const { html } = Atom.render({
		name: 'prerendered atom',
	});

	return mainHTML.replace("{{ html }}", html);
}
