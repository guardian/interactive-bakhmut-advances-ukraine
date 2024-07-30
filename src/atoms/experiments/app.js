import './styles/main.scss'
import { NavigationControl, Map as mapGl } from 'maplibre-gl'
import style from '$lib/mapstyles/style.json'
import '$lib/helpers/scrollbarWidth'
import { feature } from 'topojson-client'
import labels from '$lib/geo/labels.json'
import hotspots from '$lib/geo/hotspots.json'

import ukraine from '$assets/UKR_adm0.json'

import LocatorComp from '$lib/helpers/Locator.js'
import { $, $$ } from '$lib/helpers/util.js'
import ScrollyTeller from "$lib/helpers/scrollyteller.js"
import 'maplibre-gl/dist/maplibre-gl.css';
// import control from '$lib/geo/UkraineControlMapAO17JUL2024geo.json'
import { showTownLabels, makeTownLabelsTidy, fetchData, fetchAllData } from '$lib/helpers/util'

import * as presetbounds from '$lib/geo/bounds.js'
import { makeTownLabelsBeefy } from '../../lib/helpers/util'

//------------------------INITIALIZE MEASURES--------------------------------

const isMobile = window.matchMedia('(max-width: 980px)').matches && window.innerWidth < window.innerHeight
const width = window.innerWidth
const height = window.innerHeight

const svg = document.getElementById('svg-wrapper')
svg.style.width = width + "px"
svg.style.height = height + "px"

const locatorWidth = isMobile ? 120 : 150
const locatorHeight = isMobile ? 120 : 150

let map

//-------------------------feed map styles with extra data------------------------

// style.sources.labels.data = labels
// style.sources.control.data = control
// style.sources.oblasts.data = oblasts
// style.sources.hotspots.data = hotspots
// style.sources.urban.data = urban
// style.sources.bakhmut.data = bakhmut
// style.sources.chasivyar.data = chasivyar

//-------------------------set up the scrolly-------------------------------------

const scrolly = new ScrollyTeller({
    parent: $("#scrolly-1"),
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
    // map.rotateTo((rotation / 50) % 360, { duration: 0 })
    // rotation++
    // Request the next frame of the reqAnimation.
    // reqAnimation = requestAnimationFrame(rotateCamera)
}

// ------------------ bounds ----------------------





//-------------------------preload map--------------------------------------------

const renderMap = async (webpEnabled) => {

    const {urbantopo,oblaststopo,controltopo} = await fetchAllData()

const urban = feature(urbantopo, urbantopo.objects.urban)
const oblasts = feature(oblaststopo, oblaststopo.objects.oblasts)
const control = feature(controltopo, controltopo.objects.UkraineControlMapAO17JUL2024geo)

style.sources.labels.data = labels
style.sources.control.data = control
style.sources.oblasts.data = oblasts
style.sources.hotspots.data = hotspots
style.sources.urban.data = urban


    // const topoFile = await fetch('__assetsPath__/ukraine_layers_parsed.json')
    // const doc = await (await fetch('https://interactive.guim.co.uk/docsdata-test/1Dabx4Lqs0ZgecD4Xo2TUib7G-N9XkuDEhBcaHkIDCaE.json')).json()
    // const areas = await topoFile.json()
    // const data = feature(areas, areas.objects['ukraine_layers_parsed'])

    // style.sources.overlays.data = data



    const tradOpts = { pitch: 1, duration: 1000 }

    const bakhmutAndSouthBoundsWithChasivYar = [
        [38.070910, 48.490000],          // top-left corner
        [37.835883, 48.647324]           // bottom-right corner adjusted to include Chasiv Yar
    ];


    map = new mapGl({
        container: 'gv-wrapper',
        style: style,
        bounds: bakhmutAndSouthBoundsWithChasivYar,
        zoom: 11,
        maxZoom: 16,
        minZoom: 4,
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

    const locatorMap = new LocatorComp(locatorWidth, locatorHeight, ukraine, ukraine.objects.UKR_adm0, map.getBounds(), { x: width - locatorWidth - 10, y: 0 })
    locatorMap.addLocator(svg)

    const numSources = 7.4
    let loadedSources = 0

    let totalData = 0

    const loader = $('.gv-loader');    const body = $('.article__body');    const bodyDesktop = $$('[data-gu-name="body"]')[0]; const locator = $('.locator-svg');     const compass = $('.maplibregl-ctrl.maplibregl-ctrl-group');     const scrollArrow = $('.gv-scrollarrow');     const iosBody = $('.ios') ;const androidBody = $('.android');    const meta = $('[data-gu-name="meta"]') ;const standfirst = $('[data-gu-name="standfirst"]') ; const headline = $('[data-gu-name="headline"]') ;const tags = $('.content__labels');    const metaApp = $('.meta__misc') ;const headlineApp = $('.headline') ;const standfirstApp = $('.standfirst')


    map.on('data', (e) => {
        if (e.dataType === 'source' && e.sourceDataType === 'metadata') {
            loadedSources++;
            const percentageLoaded = (loadedSources / numSources) * 100;
            loader.style.width = `${percentageLoaded}%`;
        }
    })

    map.on('load', () => {
        loader.style.width = '100%'
        bodyDesktop?.style.setProperty("--imgOpacity", 0)
        $$('.gv-load').forEach(el => el.style.opacity = 0)
        $('body').style['overflow-y'] = 'visible'
        if (iosBody) iosBody.style.position = 'static'
        if (androidBody) androidBody.style.position = 'static'

        map.on('click', 'oblasts', function (e) {
            console.log(e.features);
        });

        scrolly.addTrigger({
            num: 0, do: (d) => {
                current = 0
                //  map.fitBounds(bakhmutBounds)
                map.fitBounds(bakhmutAndSouthBoundsWithChasivYar)
                map.setLayoutProperty('Populated place', 'visibility', 'none')
                map.setLayoutProperty('overlays', 'visibility', 'none')
                map.setLayoutProperty('hills', 'visibility', 'visible')
                bodyDesktop?.style.setProperty("--opacity", 1)
                body?.style.setProperty("--opacity", 1)
                locator.style.opacity = 0
                compass.style.opacity = 0

                if (headline) {
                    headline.style.opacity = 1
                    standfirst.style.opacity = 1
                    meta.style.opacity = 1
                    tags.style.opacity = 1
                } else {
                    metaApp.style.opacity = 1
                    headlineApp.style.opacity = 1
                    standfirstApp.style.opacity = 1
                }
            }
        }
    )

        scrolly.addTrigger({
            num: 1, do: () => {
                current = 1
                cancelAnimationFrame(reqAnimation)
                map.fitBounds(presetbounds.widerAreaBounds, presetbounds.widerAreaOpts)
                // map.setFilter('Populated place', ["match", ['get', 'name'], ["Bakhmut", "Kramatorsk", "Sloviansk", "Chasiv Yar"], true, false])
                showTownLabels(map, ["Bakhmut", "Kramatorsk", "Sloviansk", "Chasiv Yar"])
                map.setLayoutProperty('Populated place', 'visibility', 'visible')
                map.setLayoutProperty('overlays', 'visibility', 'none')
                map.setLayoutProperty('hills', 'visibility', 'visible')

                bodyDesktop?.style.setProperty("--opacity", 0)
                body?.style.setProperty("--opacity", 0)
                locator.style.opacity = 1
                compass.style.opacity = 1
                if (headline) {
                    headline.style.opacity = 0
                    standfirst.style.opacity = 0
                    meta.style.opacity = 0
                    tags.style.opacity = 0
                } else {
                    metaApp.style.opacity = 0
                    headlineApp.style.opacity = 0
                    standfirstApp.style.opacity = 0
                }
            }
        })

        scrolly.addTrigger({
            num: 2, do: () => {
                bodyDesktop?.style.setProperty("--opacity", 0)
                body?.style.setProperty("--opacity", 0)
                // cancelAnimationFrame(reqAnimation)
                map.fitBounds(presetbounds.widerAreaBounds, presetbounds.widerAreaOpts)
            }
        })

        scrolly.addTrigger({
            num: 3, do: () => {
                bodyDesktop?.style.setProperty("--opacity", 0)
                body?.style.setProperty("--opacity", 0)
                // cancelAnimationFrame(reqAnimation)
                map.setLayoutProperty('Area-control-label', 'visibility', 'none')
                map.setLayoutProperty('Ridge-label', 'visibility', 'none')
                showTownLabels(map, ["Bakhmut","Chasiv Yar"])
                // map.fitBounds(bakhmutBounds)
                map.flyTo(presetbounds.bakhmutCloseUp)
            }
        })

        scrolly.addTrigger({
            num: 4, do: () => {
                // cancelAnimationFrame(reqAnimation)
                map.setLayoutProperty('road_trunk_primary_white', 'visibility', 'visible')
                map.setLayoutProperty('road_secondary_tertiary_white', 'visibility', 'visible')
                map.flyTo(presetbounds.cyCloseUp)
                map.setLayoutProperty('Populated place', 'visibility', 'visible')
                map.setLayoutProperty('hills', 'visibility', 'visible')

                showTownLabels(map, ["Chasiv Yar", "Kramatorsk", "Sloviansk"])
                makeTownLabelsBeefy(map)
            }
        })

        scrolly.addTrigger({
            num: 5, do: () => {
                // cancelAnimationFrame(reqAnimation)
                map.fitBounds(presetbounds.donetskOblastBounds, tradOpts)
                map.setLayoutProperty('road_trunk_primary_white', 'visibility', 'visible')
                map.setLayoutProperty('road_secondary_tertiary_white', 'visibility', 'visible')
                map.setFilter('Populated place', ["match", ['get', 'name'], ["Pokrovsk", "Kupiansk", "Avdiivka", "Chasiv Yar"], true, false])
                map.setLayoutProperty('control', 'visibility', 'visible')
                makeTownLabelsTidy(map)
            }
        })

        scrolly.addTrigger({
            num: 6, do: () => {
                showTownLabels(map, ["Vovchansk", "Hlyboke", "Kharkiv","Belgorod"])
                map.setLayoutProperty('hills', 'visibility', 'none')
                map.flyTo(presetbounds.vovchanskCloseUp)
                
            }
        })

        scrolly.addTrigger({
            num: 7, do: () => {
                showTownLabels(map, ["Vovchansk", "Hlyboke", "Kharkiv","Belgorod"])
                // map.setFilter('Area-control-label', ["match", ['get', 'name'], ["Russian\ncontrol", "Ukrainian\ncounteroffensive"], true, false])
            }
        })


    })

    scrolly.watchScroll()
}

renderMap()