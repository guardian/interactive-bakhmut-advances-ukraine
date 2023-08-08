import './styles/main.scss'
import { NavigationControl, Map as mapGl } from 'maplibre-gl'
import style from '$assets/style.json'
import '$lib/helpers/scrollbarWidth'
import { feature } from 'topojson-client'
import labels from '$assets/labels.json'
import ukraine from '$assets/UKR_adm0.json'
import Locator from '$lib/helpers/Locator.js'
import ScrollyTeller from "$lib/helpers/scrollyteller.js"
import bakhmut from "$assets/bakhmut-shape.json"
import 'maplibre-gl/dist/maplibre-gl.css';
// import { tileUrls } from '$assets/preloadedTiles.js'

//------------------------INITIALIZE MEASURES--------------------------------

const isMobile = window.matchMedia('(max-width: 600px)').matches
const width = window.innerWidth
const height = window.innerHeight

const svg = document.getElementById('svg-wrapper')
svg.style.width = width + "px"
svg.style.height = height + "px"

const locatorWidth = isMobile ? 120 : 200
const locatorHeight = isMobile ? 120 : 200

let map

//-------------------------feed map styles with extra data------------------------

style.sources.labels.data = labels
style.sources.bakhmut.data = bakhmut

//-------------------------set up the scrolly-------------------------------------

const scrolly = new ScrollyTeller({
	parent:  document.querySelector("#scrolly-1"),
	triggerTop: 0.75, // percentage from the top of the screen that the trigger should fire
	triggerTopMobile: 0.75,
	transparentUntilActive: true
})

//--------------------helpers-------------------------------
//from https://maplibre.org/maplibre-gl-js-docs/example/animate-camera-around-point/

let reqAnimation
let rotation = 0
let current = 0

function rotateCamera() {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    map.rotateTo((rotation / 50) % 360, { duration: 0 })
    rotation++
    // Request the next frame of the reqAnimation.
    reqAnimation = requestAnimationFrame(rotateCamera)
}



//-------------------------preload map--------------------------------------------

const renderMap = async (webpEnabled) => {
    const topoFile = await fetch('__assetsPath__/ukraine_layers_parsed.json')
    // const doc = await (await fetch('https://interactive.guim.co.uk/docsdata-test/1Dabx4Lqs0ZgecD4Xo2TUib7G-N9XkuDEhBcaHkIDCaE.json')).json()
	const areas = await topoFile.json()
    const data = feature(areas, areas.objects['ukraine_layers_parsed'])

	style.sources.overlays.data = data

    map = new mapGl({
        container: 'gv-wrapper',
        style: style,
        bounds: [[38.070910,48.557711],[37.953904,48.647324]],
        zoom: 11,
        maxZoom: 16,
        minZoom:4,
        pitch: 45,
        maxPitch: 85,
        interactive: false,
    })
    let nav = new NavigationControl({ showCompass: true, showZoom: false, visualizePitch: true })
    map.addControl(nav, 'top-left')

    const renderOverlays = (date) => {
        map.setLayoutProperty('overlays', 'visibility', 'visible')
        map.setFilter('overlays', ["match", ['get', 'date'], date.replace(/\//g, '-'), true, false])
    }

    const widerAreaBounds = [[37.4872599076183448, 48.5499422913235676], [38.0593925657791559, 48.8995789157551712]]

    const bakhmutBounds = [
        [38.070910, 48.557711],
        [37.953904, 48.647324]
    ]

    const bakhmutAndSouthBounds = [
        [38.070910, 48.490000],
        [37.898447460053035,48.647324]
    ]

	const locator = new Locator(locatorWidth, locatorHeight, ukraine, ukraine.objects.UKR_adm0, map.getBounds(), {x:width - locatorWidth - 10, y:0})
	locator.addLocator(svg)

    map.on('zoomend', () => {
        // console.log(map.getZoom(), 'zoom')
        // console.log(map.getBounds(), 'bounds')
        // console.log(map.getCenter(), 'center')
        // console.log(map.getBearing(), 'bearing')
        // console.log(map.getPitch(), 'pitch')

        if(current == 0){
            rotation = 0
            if(!isMobile)rotateCamera()
        }
        else{
            if(!isMobile)cancelAnimationFrame(reqAnimation)
        }
    })

    // function preloadTile(url) {
    //     return new Promise((resolve, reject) => {
    //         const img = new Image();
    //         img.onload = () => resolve(url); // Resolve the promise when the tile is loaded
    //         img.onerror = () => reject(new Error(`Failed to load tile: ${url}`));
    //         img.src = url;
    //     });
    // }

    // // Map the array of URLs to an array of promises that preload the tiles
    // const preloadPromises = tileUrls.map(preloadTile);

    // // Use Promise.all to wait for all the tiles to be preloaded
    // Promise.all(preloadPromises)
    //     .then((preloadedTiles) => {
    //         console.log('All tiles have been preloaded');
    //         // Now you can use the preloaded tiles as needed
    //     })
    //     .catch((error) => {
    //         console.error('Error preloading tiles:', error);
    //     });

    map.on('load', () =>{
        console.log('map loaded')

        // if (!isMobile) rotateCamera()
        
        scrolly.addTrigger({num: 0, do: (d) => {
            current = 0
            map.fitBounds(bakhmutBounds)
            map.setLayoutProperty('Populated place', 'visibility', 'none')
            map.setLayoutProperty('overlays', 'visibility', 'none')
            document.querySelectorAll('[data-gu-name="body"]')[0]?.style.setProperty("--opacity", 1)
            document.querySelector('.article__body')?.style.setProperty("--opacity", 1)
            document.querySelector('.locator-svg').style.opacity = 0
            document.querySelector('.maplibregl-ctrl.maplibregl-ctrl-group').style.opacity = 0
        }})

        scrolly.addTrigger({num: 1, do: () => {
            current = 1
            cancelAnimationFrame(reqAnimation)
            map.fitBounds(widerAreaBounds)
            map.setFilter('Populated place', ["match", ['get', 'name'], ["Bakhmut", "Kramatorsk", "Slovyansk"], true, false])
            map.setLayoutProperty('Populated place', 'visibility', 'visible')
            map.setLayoutProperty('overlays', 'visibility', 'none')
            document.querySelectorAll('[data-gu-name="body"]')[0]?.style.setProperty("--opacity", 0)
            document.querySelector('.article__body')?.style.setProperty("--opacity", 0)
            document.querySelector('.locator-svg').style.opacity = 1
            document.querySelector('.maplibregl-ctrl.maplibregl-ctrl-group').style.opacity = 1
        }})

        scrolly.addTrigger({ num: 2, do: () => {
            document.querySelectorAll('[data-gu-name="body"]')[0]?.style.setProperty("--opacity", 0)
            document.querySelector('.article__body')?.style.setProperty("--opacity", 0)
            cancelAnimationFrame(reqAnimation)
            map.fitBounds(widerAreaBounds)
            map.setLayoutProperty('overlays', 'visibility', 'none')
            map.setLayoutProperty('Road-label', 'visibility', 'none')
            map.setLayoutProperty('Ridge-label', 'visibility', 'none')
        }})

        scrolly.addTrigger({
            num: 3, do: () => {
                document.querySelectorAll('[data-gu-name="body"]')[0]?.style.setProperty("--opacity", 0)
                document.querySelector('.article__body')?.style.setProperty("--opacity", 0)
                cancelAnimationFrame(reqAnimation)
                map.setLayoutProperty('Road-label', 'visibility', 'visible')
                map.setLayoutProperty('Area-control-label', 'visibility', 'none')
                map.setLayoutProperty('overlays', 'visibility', 'none')
                map.setLayoutProperty('Ridge-label', 'visibility', 'none')
                // map.fitBounds(bakhmutBounds)
                map.flyTo({ center: { lng: 38.01284542392864, lat: 48.59740813939732 }, bearing: -87.81693712944023, pitch: 60, duration: 1000, zoom: 13.071195853786996 })
            }
        })

        scrolly.addTrigger({
            num: 4, do: () => {
                cancelAnimationFrame(reqAnimation)
                map.setLayoutProperty('Ridge-label', 'visibility', 'visible')
                map.setLayoutProperty('satellite', 'visibility', 'visible')
                map.setLayoutProperty('bakhmut-white', "visibility", "visible")
                map.setLayoutProperty('bakhmut-dark', "visibility", "none")
                map.setLayoutProperty('road_trunk_primary_white', 'visibility', 'visible')
                map.setLayoutProperty('road_secondary_tertiary_white', 'visibility', 'visible')
                map.setLayoutProperty('road_trunk_primary_dark', 'visibility', 'none')
                map.setLayoutProperty('road_secondary_tertiary_dark', 'visibility', 'none')
                map.setLayoutProperty('Area-control-label', 'visibility', 'none')
                map.setFilter('Area-control-label', ["match", ['get', 'name'], ["Russian\ncontrol", "Ukrainian\ncounteroffensive"], false, false])
                map.setFilter('Populated place', ["match", ['get', 'name'], ["Bakhmut", "Kramatorsk", "Slovyansk"], true, false])
                map.setLayoutProperty('overlays', 'visibility', 'none')
                map.setPaintProperty('Populated place', 'text-color', '#fff')
                map.setPaintProperty('Populated place', 'text-halo-color', '#333')
                map.setPaintProperty('Ridge-label', 'text-color', '#fff')
                map.setPaintProperty('Ridge-label', 'text-halo-color', '#333')
                map.flyTo({ center: { lng: 38.01284542392864, lat: 48.59740813939732 }, bearing: -87.81693712944023, pitch: 60, duration: 1000, zoom: 13.071195853786996 })
            }
        })

        scrolly.addTrigger({
            num: 5, do: () => {
                cancelAnimationFrame(reqAnimation)
                map.fitBounds(bakhmutBounds)
                renderOverlays('30/01/2023')
                map.setLayoutProperty('satellite', 'visibility', 'none')
                map.setLayoutProperty('bakhmut-white', "visibility", "none")
                map.setLayoutProperty('bakhmut-dark', "visibility", "visible")
                map.setLayoutProperty('road_trunk_primary_white', 'visibility', 'none')
                map.setLayoutProperty('road_secondary_tertiary_white', 'visibility', 'none')
                map.setLayoutProperty('road_trunk_primary_dark', 'visibility', 'visible')
                map.setLayoutProperty('road_secondary_tertiary_dark', 'visibility', 'visible')
                map.setLayoutProperty('Area-control-label', 'visibility', 'visible')
                map.setFilter('Area-control-label', ["match",['get', 'name'], ["Russian\ncontrol"], true, false])
                map.setFilter('Populated place', ["match", ['get', 'name'], ["Bakhmut", "Kramatorsk", "Slovyansk", "Soledar", "Berkhivka"], true, false])
                map.setPaintProperty('Populated place', 'text-color', '#333')
                map.setPaintProperty('Populated place', 'text-halo-color', '#fff')
                map.setPaintProperty('Ridge-label', 'text-color', '#333')
                map.setPaintProperty('Ridge-label', 'text-halo-color', '#fff')
            }
        })

        scrolly.addTrigger({
            num: 6, do: () => {
                cancelAnimationFrame(reqAnimation)
                renderOverlays('30/01/2023')
                map.setLayoutProperty('satellite', 'visibility', 'none')
                map.setLayoutProperty('bakhmut-dark', "visibility", "visible")
                map.setLayoutProperty('road_trunk_primary_white', 'visibility', 'none')
                map.setLayoutProperty('road_secondary_tertiary_white', 'visibility', 'none')
                map.setLayoutProperty('road_trunk_primary_dark', 'visibility', 'visible')
                map.setLayoutProperty('road_secondary_tertiary_dark', 'visibility', 'visible')
                map.setLayoutProperty('Area-control-label', 'visibility', 'visible')                
                map.setFilter('Area-control-label', ["match", ['get', 'name'], ["Russian\ncontrol"], true, false])
                map.setFilter('Populated place', ["match", ['get', 'name'], ["Bakhmut", "Kramatorsk", "Slovyansk", "Soledar", "Berkhivka", "Andriivka"], true, false])
            }
        })

        scrolly.addTrigger({
            num: 7, do: () => {
                renderOverlays('21/05/2023')
                map.setFilter('Area-control-label', ["match", ['get', 'name'], ["Russian\ncontrol", "Ukrainian\ncounteroffensive"], true, false])
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
                map.fitBounds(bakhmutAndSouthBounds)
                renderOverlays('03/08/2023')
            }
        })
    })

    scrolly.watchScroll()
}

renderMap()