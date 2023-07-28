import './styles/main.scss';
import { Map as mapGl } from 'maplibre-gl';
import style from '$assets/style.json'
import '$lib/helpers/scrollbarWidth';
import { feature } from 'topojson-client';
import labels from '$assets/labels.json'
import ukraine from '$assets/UKR_adm0.json'
import Locator from '$lib/helpers/Locator.js'
import ScrollyTeller from "$lib/helpers/scrollyteller.js"
import bakhmut from "$assets/bakhmut-shape.json"

//------------------------INITIALIZE MEASURES--------------------------------

const isMobile = window.matchMedia('(max-width: 600px)').matches;
const width = window.innerWidth;
const height = window.innerHeight;

const svg = document.getElementById('svg-wrapper');
svg.style.width = width + "px";
svg.style.height = height + "px";

const locatorWidth = isMobile ? 120 : 200;
const locatorHeight = isMobile ? 120 : 200;

let map;

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
    console.log('running render map')

    const topoFile = await fetch('__assetsPath__/ukraine-merged-20230614.json')
    const doc = await (await fetch('https://interactive.guim.co.uk/docsdata-test/1Dabx4Lqs0ZgecD4Xo2TUib7G-N9XkuDEhBcaHkIDCaE.json')).json()
    console.log(doc)

	const areas = await topoFile.json();
    const data = feature(areas, areas.objects['ukraine-merged-20230614']);

	style.sources.overlays.data = data;

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

    const renderOverlays = (date) => {
        map.setLayoutProperty('overlays', 'visibility', 'visible');
        map.setFilter('overlays', ["match", ['get', 'date'], date.replace(/\//g, '-'), true, false]);
    }

    const widerAreaBounds = [[37.4872599076183448, 48.5499422913235676], [38.0593925657791559, 48.8995789157551712]]

    const bakhmutBounds = [
        [38.070910, 48.557711],
        [37.953904, 48.647324]
    ]

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
        console.log('map loaded')

        if (!isMobile) rotateCamera()
        
        scrolly.addTrigger({num: 0, do: (d) => {
            current = 0;
            map.fitBounds(bakhmutBounds)
            map.setLayoutProperty('Populated place', 'visibility', 'none')
            map.setLayoutProperty('overlays', 'visibility', 'none');
            document.querySelectorAll('[data-gu-name="body"]')[0]?.style.setProperty("--opacity", 1);
            document.querySelector('.article__body')?.style.setProperty("--opacity", 1)
            document.querySelector('.locator-svg').style.opacity = 0
        }})

        scrolly.addTrigger({num: 1, do: () => {
            current = 1;
            cancelAnimationFrame(reqAnimation)
            map.fitBounds(widerAreaBounds)
            map.setFilter('Populated place', ["match", ['get', 'name'], ["Bakhmut", "Kramatorsk", "Slovyansk"], true, false]);
            map.setLayoutProperty('Populated place', 'visibility', 'visible');
            map.setLayoutProperty('overlays', 'visibility', 'none');
            document.querySelectorAll('[data-gu-name="body"]')[0]?.style.setProperty("--opacity", 0)
            document.querySelector('.article__body')?.style.setProperty("--opacity", 0)
            document.querySelector('.locator-svg').style.opacity = 1;
        }})

        scrolly.addTrigger({ num: 2, do: () => {
            document.querySelectorAll('[data-gu-name="body"]')[0]?.style.setProperty("--opacity", 0)
            document.querySelector('.article__body')?.style.setProperty("--opacity", 0)
            cancelAnimationFrame(reqAnimation)
            map.fitBounds(bakhmutBounds)
            map.setLayoutProperty('overlays', 'visibility', 'none');
        }})

        scrolly.addTrigger({
            num: 3, do: () => {
                console.log('ads')
                document.querySelectorAll('[data-gu-name="body"]')[0]?.style.setProperty("--opacity", 0)
                document.querySelector('.article__body')?.style.setProperty("--opacity", 0)
                cancelAnimationFrame(reqAnimation)
                map.fitBounds(bakhmutBounds)
                map.setLayoutProperty('Area-control-label', 'visibility', 'none');
                map.setLayoutProperty('overlays', 'visibility', 'none');
            }
        })

        scrolly.addTrigger({
            num: 4, do: () => {
                cancelAnimationFrame(reqAnimation)
                map.fitBounds(bakhmutBounds)
                map.setLayoutProperty('Ridge-label', 'visibility', 'visible')
                map.setLayoutProperty('satellite', 'visibility', 'visible')
                map.setLayoutProperty('bakhmut-dark', "visibility", "none")
                map.setLayoutProperty('Area-control-label', 'visibility', 'none');
                map.setFilter('Area-control-label', ["match", ['get', 'name'], ["Russian\ncontrol", "Ukrainian\nadvance"], false, false]);
                map.setLayoutProperty('overlays', 'visibility', 'none');
            }
        })

        scrolly.addTrigger({
            num: 5, do: () => {
                cancelAnimationFrame(reqAnimation)
                renderOverlays('30/01/2023')
                map.setLayoutProperty('satellite', 'visibility', 'none')
                map.setLayoutProperty('bakhmut-dark', "visibility", "visible")
                map.setLayoutProperty('Area-control-label', 'visibility', 'visible');
                map.setFilter('Area-control-label', ["match",['get', 'name'], ["Russian\ncontrol"], true, false]);

            }
        })

        scrolly.addTrigger({
            num: 6, do: () => {
                cancelAnimationFrame(reqAnimation)
                renderOverlays('30/01/2023')
                map.setLayoutProperty('satellite', 'visibility', 'none')
                map.setLayoutProperty('bakhmut-dark', "visibility", "visible")
                map.setLayoutProperty('Area-control-label', 'visibility', 'visible');
                map.setFilter('Area-control-label', ["match", ['get', 'name'], ["Russian\ncontrol", "Ukrainian\nadvance"], true, false]);

            }
        })

        scrolly.addTrigger({
            num: 7, do: () => {
                renderOverlays('21/05/2023')
            }
        })

        scrolly.addTrigger({
            num: 8, do: () => {
                renderOverlays('30/05/2023')
            }
        })

        scrolly.addTrigger({
            num: 9, do: () => {
                renderOverlays('06/06/2023')
            }
        })

        scrolly.addTrigger({
            num: 10, do: () => {
                renderOverlays('06/06/2023')
            }
        })

        scrolly.addTrigger({
            num: 11, do: () => {
                renderOverlays('27/06/2023')
            }
        })
    })

    scrolly.watchScroll();
}

renderMap()










        

            

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