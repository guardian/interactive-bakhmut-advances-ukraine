import './styles/main.scss';
import { Map as mapGl } from 'maplibre-gl';
import style from '$assets/style.json'

// enable this when creating an atom for the article template
// import '$lib/helpers/resizeFrame';

// create scrollbar width CSS variable
import '$lib/helpers/scrollbarWidth';

import { feature } from 'topojson-client';
import labels from '$assets/labels.json'
import ukraine from '$assets/UKR_adm0.json'
import Locator from '$lib/helpers/Locator.js'
import ScrollyTeller from "$lib/helpers/scrollyteller.js"
import bakhmut from "$assets/bakhmut-shape.json"
import doc from "$assets/doc.json"
//import * as Promise from "es6-promise"

//console.log(Promise)
const dates = doc.chapters.map(d => {

//Clean dates to be read as strings

    if(d.date){
        let value
        d.date.indexOf('/') != -1 ? value = d.date : value = '-'
        return value
    }

}).filter(d => d != undefined)

//------------------------INITIALIZE MEASSURES--------------------------------

const isMobile = window.matchMedia('(max-width: 600px)').matches;
const width = window.innerWidth;
const height = window.innerHeight;

const svg = document.getElementById('svg-wrapper');
svg.style.width = width + "px";
svg.style.height = height + "px";

const locatorWidth = isMobile ? 120 : 200;
const locatorHeight = isMobile ? 120 : 200;

let map;

//------------------------HEADER----------------------------------------------

let header = document.querySelector('.header-wrapper')
let subjectLabels = null;
let headline = null;
let standfirst = null;
let byline = null;
let details = null;
let social = null;

if (window.location.protocol == 'https:' || window.location.protocol == 'http:') {

	subjectLabels = document.querySelector('.content__labels ').innerHTML;
	headline = document.querySelector('[data-gu-name="headline"] h1').innerHTML;
	standfirst = document.querySelector('[data-gu-name="standfirst"] p').innerHTML;
	byline = document.querySelector('[data-link-name="byline"] div');
	details = document.querySelector('[data-gu-name="meta"]').innerText.split('\n');
	social = document.querySelector('.meta__social').innerHTML;
	document.querySelector('.header-wrapper__date').innerHTML = details[1];
	

}
else {

	headline = document.querySelector('.headline.selectable').innerHTML;
	standfirst = document.querySelector('.standfirst.selectable p').innerHTML;
	byline = document.querySelector('.meta__byline');
	details = document.querySelector('.meta__published__date');
	document.querySelector('.header-wrapper__date').appendChild(details)

	if(getMobileOperatingSystem() == 'Android'){
		document.querySelector('.scroll-text__fixed').style.top = '56px';
	}
	
}

document.querySelector('.header-wrapper__byline').appendChild(byline);
document.querySelector('.header-wrapper__content__labels').innerHTML = subjectLabels
document.querySelector(".header-wrapper__content .content__headline").innerHTML = headline;
document.querySelector(".header-wrapper__content .scroll-text__fixed__header").innerHTML = standfirst;
document.querySelector('.header-wrapper__meta__social').innerHTML = social;

//-------------------------feed map styles with extra data------------------------

style.sources.labels.data = labels;
style.sources.bakhmut.data = bakhmut;

//-------------------------set up the scrolly-------------------------------------

const scrolly = new ScrollyTeller({
	parent:  document.querySelector("#scrolly-1"),
	triggerTop: 0.75, // percentage from the top of the screen that the trigger should fire
	triggerTopMobile: 0.75,
	transparentUntilActive: true
})

//--------------------helpers-------------------------------
//from https://maplibre.org/maplibre-gl-js-docs/example/animate-camera-around-point/

let reqAnimation;
let rotation = 0;
let current = 0;

function rotateCamera() {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    map.rotateTo((rotation / 50) % 360, { duration: 0 });
    rotation++
    // Request the next frame of the reqAnimation.
    reqAnimation = requestAnimationFrame(rotateCamera);
}



//-------------------------preload map--------------------------------------------

const renderMap = async (webpEnabled) => {

    // const topoFile = await fetch('__assetsPath__/ukraine-merged-20230614.json')
	// const areas = await topoFile.json();
    // const data = feature(areas, areas.objects['ukraine-merged-20230614']);

	// style.sources.overlays.data = data;

    map = new mapGl({
        container: 'gv-wrapper',
        style: style,
        bounds: [[38.070910,48.557711],[37.953904,48.647324]],
        zoom: 11,
        maxZoom: 12,
        minZoom:4,
        pitch: 45,
        interactive:false,
        //cooperativeGestures:true
    })

	const locator = new Locator(locatorWidth, locatorHeight, ukraine, ukraine.objects.UKR_adm0, map.getBounds(), {x:width - locatorWidth - 10, y:0});
	locator.addLocator(svg)

    map.on('zoomend', () => {
        if(current == 0){
            rotation = 0
            if(!isMobile)rotateCamera()
        }
        else{
            if(!isMobile)cancelAnimationFrame(reqAnimation)
        }
    })

    map.on('load', () =>{

        if(!isMobile)rotateCamera()
        
        
        scrolly.addTrigger({num: 1, do: () => {
            //map.remove();
            current = 0;
            map.fitBounds([[38.070910,48.557711],[37.953904,48.647324]]);
            document.querySelector('.header-wrapper').classList.remove('hide');

        }})

        scrolly.addTrigger({num: 2, do: () => {
            current = 1;
            cancelAnimationFrame(reqAnimation)
            map.fitBounds([[37.4872599076183448,48.5499422913235676],[38.0593925657791559,48.8995789157551712]]);
            document.querySelector('.header-wrapper').classList.add('hide');

        }})

        

            

	// 		if(i != 0){
    //             console.log('i != 0')
                
    //             cancelAnimationFrame(reqAnimation);
    //             rotation = 0;
				
	// 		}
	// 		else{
    //             console.log('i = 0')
                
				
	// 		}


    //           if(current != i)
    //           {
    //             current = i 

    //             if(dates[i] != '-'){

    //                 let date = dates[i].replace(/\//g, '-')

    //                 map.setFilter('overlays', ["match",['get', 'date'], date, true, false]);
    //                 //map.setFilter('russia-control', ["match",['get', 'date'], date, true, false]);

    //             }

    //             if(i == 0 || i == 1){

    //                 map.setFilter('Populated place', ["match",['get', 'name'], ["Bakhmut", "Kramatorsk", "Slovyansk"], true, false]);
    //                 //map.setFilter('Area control', ["match",['get', 'slide'], [1], true, false]);
    //                 map.fitBounds([
    //                     [37.4872599076183448,48.5499422913235676],[38.0593925657791559,48.8995789157551712]
    //                 ]);


    //                 map.setLayoutProperty('overlays', 'visibility', 'none');
    //             }

    //             if(i > 1){

                    
    //                 map.fitBounds([
    //                     [38.070910,48.557711],
    //                     [37.953904,48.647324]
                                
    //                 ]);
    //             }

    //             if(i == 2){
    //                 //const myTimeout = setTimeout(loop(), 5000);
    //                 map.setLayoutProperty('road_major_rail', 'visibility', 'visible');
    //                 map.setLayoutProperty('road_major_rail_bg', 'visibility', 'visible');
    //                 map.setLayoutProperty('Road-label', 'visibility', 'visible');
    //                 map.setLayoutProperty('River-label', 'visibility', 'visible');
    //                 map.setLayoutProperty('Ridge-label', 'visibility', 'visible');
    //             }
    //             else{
    //                 map.setLayoutProperty('Road-label', 'visibility', 'none');
    //                 map.setLayoutProperty('River-label', 'visibility', 'none');
    //                 map.setLayoutProperty('road_major_rail', 'visibility', 'none');
    //                 map.setLayoutProperty('road_major_rail_bg', 'visibility', 'none');
    //                 map.setLayoutProperty('Ridge-label', 'visibility', 'none');
    //             }

    //             if(i >= 2){
    //                 map.setLayoutProperty('bakhmut-dark', "visibility", "visible");
    //                 map.setLayoutProperty('bakhmut-white', "visibility", "none");
    //                 map.setPaintProperty('satellite', "raster-opacity", 0);
    //                 map.setLayoutProperty('overlays', 'visibility', 'visible');
    //                 map.setFilter('Populated place', ["match",['get', 'name'], ["Bakhmut", "Soledar"], true, false]);

    //                 map.setLayoutProperty('Area-control-label', 'visibility', 'visible');
    //                 map.setFilter('Area-control-label', ["match",['get', 'name'], ["Russian\ncontrol"], true, false]);

    //             }
    //             else{
    //                 map.setLayoutProperty('bakhmut-dark', "visibility", "none");
    //                 map.setLayoutProperty('bakhmut-white', "visibility", "visible");
    //                 map.setPaintProperty('satellite', "raster-opacity", 1);
    //                 map.setLayoutProperty('overlays', 'visibility', 'none');

    //                 map.setLayoutProperty('Area-control-label', 'visibility', 'none');
    //             }

    //             if(i>=4){

    //                 map.setFilter('Area-control-label', ["match",['get', 'name'], ["Russian\ncontrol","Ukrainian\nadvance"], true, false]);

    //             }
    //             else{
                    
    //             }

    //           }

    //     })

    scrolly.watchScroll();

    })

}

renderMap()



