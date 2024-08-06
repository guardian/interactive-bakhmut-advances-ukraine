const isMobile = window.matchMedia('(max-width: 980px)').matches && window.innerWidth < window.innerHeight

const chuhihiv = [36.6032221,49.8352614]
const vovchansk = [36.6782221,49.8352614]
const slobozhanske = [36.6308, 49.0391]
const hlyboke = [36.55,50.26403]


const example = {
    "name": "dog",
}

const bakhmutCloseUp = isMobile ?
{
    center: { lng: 38.11284542392864, lat: 48.55740813939732 },
    bearing: -65.81693712944023,
    pitch: 60,
    duration: 1000,
    zoom: 11.0
} :
{
    center: {
        lng: 38.01284542392864,
        lat: 48.59740813939732
    },
    bearing: -62.81693712944023,
    pitch: 60, duration:
        1000,
    zoom: 11
}

const widerAreaBounds = [[37.4872599076183448, 48.5499422913235676], [38.0593925657791559, 48.8995789157551712]]
const widerAreaOpts = isMobile ? { padding: { top: 0, bottom: 0, right: 20, left: 10, pitch: 20, duration: 1000 } } : { duration: 1000 }
const bakhmutOpts = isMobile ? { padding: { top: 0, bottom: 0, right: 70, left: 40, duration: 1000 } } : { duration: 1000 }

const cyLatLong = [37.835883, 48.588442]

const cyCloseUp = isMobile ?
{
    center: { lng: cyLatLong[0], lat: cyLatLong[1] },
    bearing: -40,
    pitch: 70,
    duration: 1000,
    zoom: 12.5
} :
{
    center: { lng: cyLatLong[0], lat: cyLatLong[1] },
    bearing: -30,
    pitch: 70,
    duration: 1000,
    zoom: 12.5
}

const vovchanskCloseUp = isMobile ?
{
    center: { lng: hlyboke[0], lat: hlyboke[1] },
    bearing: 10,
    pitch: 20,
    duration: 1000,
    zoom: 8
} :
{
    center: { lng: hlyboke[0], lat: hlyboke[1] },
    bearing: 10,
    pitch: 20,
    duration: 1000,
    zoom: 8
}

const bakhmutBounds = [
    [38.070910, 48.557711],
    [37.953904, 48.647324]
]

const bakhmutAndSouthBounds = [
    [38.070910, 48.490000],
    [37.898447460053035, 48.647324]
]


const easternFrontBounds = [ [ 28.44103186722913,
    44.1839000142466], [41.518976833204306,
        50.23284326408731]];

const wholeFrontBounds = [
    [   32.28761422488995,
        44.29874787342672],
    [
        40.771643587698776,
        50.33971948127598
    ]
]

const donetskOblastBounds = [[
    36.27381996348822,
    46.67301716206242
  ],[
    39.28483713545265,
    49.38658075881969
]]

const pokrovskBounds = [
    [        36.762743919415044,
        48.000999561681084],
    [ 37.770985675624274,
        48.879430004129745]
]


export {example, bakhmutCloseUp, widerAreaBounds, widerAreaOpts, bakhmutOpts, cyCloseUp, vovchanskCloseUp, easternFrontBounds, chuhihiv, vovchansk, donetskOblastBounds, pokrovskBounds, wholeFrontBounds}