import request from "request-promise"
import fs from "fs"

export async function render() {

	

	const doc = await request({"uri":'https://interactive.guim.co.uk/docsdata-test/1Dabx4Lqs0ZgecD4Xo2TUib7G-N9XkuDEhBcaHkIDCaE.json', json:true});

   	fs.writeFileSync(`src/assets/doc.json`, JSON.stringify(doc));

    let html = ``
    doc.chapters.forEach(element => {


        if(element.chapter)
        {
            html += `<div class="scroll-text__inner">
                <div class="scroll-text__div">
                    <time>${element.date.indexOf('[') != -1 ? '' :  element.date}</time>
                    <h2>${element.headingText}</h2>
                    <p>${element.bodyText}</p>
                </div>
            </div>`
        }
		else{
			html += `<div class="scroll-text__inner"></div>`
		}
    });

    return `<link href='https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css' rel='stylesheet' />
    <div id="scrolly-1">
    <div class="scroll-wrapper">
	    <div class="scroll-inner">
            <div id="gv-wrapper"></div>
            <svg id="svg-wrapper" style="position:absolute; top:0px; z-index: 1; pointer-events:none"></svg>
			<div class="header-wrapper">
				<div class="header-background"></div>
				<div class="header-wrapper__content">
					<div class="loading-overlay__inner">Loading</div>
					<div class="header-wrapper__content__labels"></div>
					<h1 class="content__headline" id="content__headline"></h1>
					<div class="scroll-text__fixed__header"></div>
					<div class="header-wrapper__byline"></div>
					<div class="header-wrapper__date"></div>
					<div class="header-wrapper__meta__social"></div>
				</div>
			</div>
        </div>
        <div class="scroll-text">
            ${html}
        </div>
	</div>
	</div>`
}
