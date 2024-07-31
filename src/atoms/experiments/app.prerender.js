import request from "request-promise"

export async function render() {

	const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct','Nov','Dec']

    let docurl = "https://interactive.guim.co.uk/docsdata-test/1n-3zzDMk8Yh5zVymEO5I0xIjzrKFkmkxCgKaSbXTzBc.json"

	const doc = await request({"uri":docurl, json:true});

    let html = ``
    doc.chapters.forEach(element => {

        // const dateArr = element.date.split('/')
        // const date = `${dateArr[0]} ${months[parseInt(dateArr[1]) -1]} ${dateArr[2]}`

        if(element.chapter)
        {

            html += `<div class="scroll-text__inner">
                <div class="scroll-text__div">
                    ${element.headingText && `<h2>${element.headingText}</h2>`}
                    <p>${element.bodyText}</p>
                    ${element.img ? `<img class="gv-scrolly-image" src="${element.img}" alt="" />`: ''}
                </div>
            </div>`
        }
		else{
			html += `<div class="scroll-text__inner"></div>`
		}
    });

    return `<link href='https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css' rel='stylesheet' />
    <div id="scrolly-1">
    <div class='gv-load gv-load-prompt'>
        Loading...
    </div>
    <div class='gv-load gv-loader-wrapper'>
        <div class='gv-loader'></div>
    </div>
    <div class="scroll-wrapper">
	    <div class="scroll-inner">
            <div id="gv-wrapper"></div>
            <svg id="svg-wrapper" class="locator-svg" style="position:absolute; top:0px; z-index: 1; pointer-events:none"></svg>
        </div>
        <div class="scroll-text">
            ${html}
        </div>
	</div>
	</div>`
}
