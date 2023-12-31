import request from "request-promise"

export async function render() {

	const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct','Nov','Dec']

	const doc = await request({"uri":'https://interactive.guim.co.uk/docsdata-test/1Dabx4Lqs0ZgecD4Xo2TUib7G-N9XkuDEhBcaHkIDCaE.json', json:true});

    let html = ``
    doc.chapters.forEach(element => {

        const dateArr = element.date.split('/')
        const date = `${dateArr[0]} ${months[parseInt(dateArr[1]) -1]} ${dateArr[2]}`

        if(element.chapter)
        {
            let headerDate

            if (element.chapter === '11') headerDate = 'Today'
            else if (element.chapter !== '6' && element.date) headerDate = date
            else headerDate = ''

            html += `<div class="scroll-text__inner">
                <div class="scroll-text__div">
                    <time>${headerDate}</time>
                    ${element.headingText && `<h2>${element.headingText}</h2>`}
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
    <div class='gv-scrollarrow'><img src='__assetsPath__/downarrow.svg' /></div>
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
