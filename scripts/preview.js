import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const html = `
<link rel="stylesheet" type="text/css" href="./style.css">
<div id="gv-atom"></div>
<script type="module" src="./main.js"></script>
`;

fs.writeFileSync(path.join('build/default', 'index.html'), html);

serve();

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}
    
    if (server) return;
    server = spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
    });

    process.on('SIGTERM', toExit);
    process.on('exit', toExit);
}