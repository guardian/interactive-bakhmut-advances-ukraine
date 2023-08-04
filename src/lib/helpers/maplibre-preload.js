/*jshint esversion:11 */
import * as tilebelt from '@mapbox/tilebelt';
import { bounds } from '@mapbox/geo-viewport';
import ErrorStackParser from 'error-stack-parser';
import Point from '@mapbox/point-geometry';
import maplibregl from 'maplibre-gl';
const _lib = maplibregl;
// run only in the main thread

if (_lib !== undefined) {
    console.log('lib exists')
    /*
  
    Map methods
  
    */
    const cachedpanto = function (lnglat, options) {
        const o = Object.assign({}, options, { type: 'pan', center: lnglat }, this._context(options));
        this._precache(o);
        if (!!options.run) return this.panTo(point, options);
    };
    _lib.Map.prototype.cachedPanTo = cachedpanto;

    const cachedzoomto = function (zoom, options) {
        const o = Object.assign({}, options, { type: 'zoom', zoom: zoom }, this._context(options));
        this._precache(o);
        if (!!options.run) return this.zoomTo(zoom, options);
    };
    _lib.Map.prototype.cachedZoomTo = cachedzoomto;

    const cachedjumpto = function (options) {
        const o = Object.assign({}, options, { type: 'jump' }, this._context(options));
        this._precache(o);
        if (!!options.run) return this.jumpTo(o);
    };
    _lib.Map.prototype.cachedJumpTo = cachedjumpto;

    const cachedeaseto = function (options) {
        const o = Object.assign({}, options, { type: 'ease' }, this._context(options));
        this._precache(o);
        if (!!options.run) return this.easeTo(o);
    };
    _lib.Map.prototype.cachedEaseTo = cachedeaseto;

    const cachedfitbounds = function (bounds, options) {
        console.log(bounds, options)
        const o = Object.assign({}, options, { type: 'fitBounds', bounds: bounds }, this._context(options));
        this._precache(o);
        if (!!options.run) return this.fitBounds(bounds, options);
    };
    _lib.Map.prototype.cachedFitBounds = cachedfitbounds;

    const cachedflyto = function (options) {
        // FIXME: lazy hack as this property is needed for context()
        options.type = 'fly';
        const o = Object.assign({}, options, { type: 'fly' }, this._context(options));
        this._precache(o);
        if (!!options.run) return this.flyTo(o);
    };
    _lib.Map.prototype.cachedFlyTo = cachedflyto;
    /*
    
        Logic
    
    */
    // Gets the needed information related to the Map object
    const _context = function (options) {
        // Only the tiled sources are needed
        const _sources = Object.entries(this.getStyle().sources)
            .filter(s => ['vector', 'raster'].indexOf(s[1].type) > -1 && (s[1].url !== undefined || s[1].tiles !== undefined))
            .map(s => this.getSource(s[0]).tiles[0]);
        const _dimensions = [this.getCanvas().width, this.getCanvas().height];
        const _tilesize = this.transform.tileSize;
        const sc = this.getCenter();
        let zmin = options.zoom ? Math.min(this.getZoom(), options.zoom) : this.getZoom()
        if (options.type == 'fly') {
            // From the flyTo logic itself
            const offsetAsPoint = Point.convert(options.offset || [0, 0]);
            let pointAtOffset = this.transform.centerPoint.add(offsetAsPoint);
            const locationAtOffset = this.transform.pointLocation(pointAtOffset);
            const center = new _lib.LngLat(...options.center);
            this._normalizeCenter(center);
            const from = this.transform.project(locationAtOffset);
            const delta = this.transform.project(center).sub(from);
            const rho = options.curve || 1.42;
            const u1 = delta.mag();
            const wmax = 2 * rho * rho * u1;
            const zd = this.getZoom() + this.transform.scaleZoom(1 / wmax);
            zmin = Math.floor(Math.max(Math.min(zmin + zd, options.minZoom || zmin + zd), 0));
        }

        // Update the bounding box and zoom level for fitBounds
        if (options.type === 'fitBounds') {
            const fitBoundsOptions = Object.assign({}, options);
            delete fitBoundsOptions.type;
            const fitBoundsBoundingBox = bounds(options.bounds, null, _dimensions, _tilesize);
            const fitBoundsZoom = this.getBoundsZoom(options.bounds, _dimensions);
            zmin = Math.floor(Math.max(Math.min(zmin + fitBoundsZoom, options.minZoom || zmin + fitBoundsZoom), 0));
            Object.assign(fitBoundsOptions, { zoom: fitBoundsZoom });
            const fitBoundsTiles = bboxtiles(fitBoundsBoundingBox, fitBoundsZoom);
            _sources.push(...fitBoundsTiles.map(t => this.getSource(t[2]).tiles[0]));
        }

        return {
            sources: _sources,
            dimensions: _dimensions,
            tilesize: _tilesize,
            startCenter: [sc.lng, sc.lat],
            startZoom: this.getZoom(),
            zmin: zmin
        };
    };
    _lib.Map.prototype._context = _context;

    // build and manage the preloader worker
    const precache_run = function (o) {
        if (window === self && this.precache_worker == undefined) {
            // the actual absolute path of the running script
            // as the module-typed workers are only supported by Chrome
            // we can get the path by throwing an error
            const _imported = ErrorStackParser.parse(new Error('not an actual error!'))[0].fileName;
            // build inline worker
            const target = `
            importScripts('${_imported}');
            let controller;
            let signal;
            onmessage = function (o){
                if (controller !== undefined && controller.signal !== undefined && !controller.signal.aborted){
                    controller.abort();               
                }
                if (o.data.abort){
                    postMessage({t: Date.now(), e: true});
                    return;
                }
                controller = new AbortController();
                signal = controller.signal;     
                let _func = ${precache_function.toString()};
                _func.apply(null, [o.data]);
            }`;
            const mission = URL.createObjectURL(new Blob([target], { 'type': 'text/javascript' }));
            this.precache_worker = new Worker(mission);
            this.precache_worker.onmessage = e => {
                this.precache_worker.time1 = e.data.t;
                if (!!o.debug) console.log(`Precaching time: ${this.precache_worker.time1 - this.precache_worker.time0}ms`);
            };
        }
        // Some debugging info
        delete this.precache_worker.time1;
        this.once('moveend', e => {
            if (this.precache_worker.time1 == undefined) {
                this.precache_worker.postMessage({ abort: true });
                if (!!o.debug) console.log(`🔶 Movement has finished before preloading`);
            } else {
                if (!!o.debug) console.log(`🔚 Movement ends ${(this.precache_worker.time1) ? Date.now() - this.precache_worker.time1 : undefined} ms after precaching`);
            }
        });
        this.precache_worker.time0 = Date.now();
        this.precache_worker.postMessage(o);
    };
    _lib.Map.prototype._precache = precache_run;

} else {
    console.log('lib does not exist')
}


const precache_function = o => {

    // Final scenario bbox
    const finalbbox = bounds(o.center, o.zoom, o.dimensions, o.tilesize);

    // all the tiles in a bounding box for a given zoom level
    // including a buffer of 1 tile
    const bboxtiles = (bbox, zoom) => {
        const sw = tilebelt.pointToTile(bbox[0], bbox[1], zoom);
        const ne = tilebelt.pointToTile(bbox[2], bbox[3], zoom);
        const result = [];
        for (let x = sw[0] - 1; x < ne[0] + 2; x++) {
            for (let y = ne[1] - 1; y < sw[1] + 2; y++) {
                result.push([x, y, zoom]);
            }
        }
        return result;
    };

    // Bresenham algorithm for retrieving only the diagonal tiles + siblings
    const diagonaltiles = (p1, p2, zoom) => {
        const [x0, y0] = tilebelt.pointToTile(p1[0], p1[1], zoom);
        const [x1, y1] = tilebelt.pointToTile(p2[0], p2[1], zoom);
        const [dx, dy] = [Math.abs(x1 - x0), Math.abs(y1 - y0)];
        const [sx, sy] = [x0 < x1 ? 1 : -1, y0 < y1 ? 1 : -1];
        let err = (dx > dy ? dx : -dy) / 2;
        let [x, y] = [x0, y0];
        let tt = [];
        while (x !== x1 || y !== y1) {
            tt.push([x, y, zoom], ...tilebelt.getSiblings([x, y, zoom]));
            let e2 = err;
            if (e2 > -dx) {
                err -= dy;
                x += sx;
            }
            if (e2 < dy) {
                err += dx;
                y += sy;
            }
        }
        tt.push([x1, y1, zoom], ...tilebelt.getSiblings([x1, y1, zoom]));
        // Remove duplicates
        return [...new Set(tt)];
    };

    let tz;

    // Get the animation pan diagonal tiles
    let tiles = [...diagonaltiles(o.startCenter, o.center, o.zmin)];
    // FIXME: Simple trick to fix eventual miscalculations of zmin fof flyTo
    if (o.type == 'fly') {
        tiles.push(...diagonaltiles(o.startCenter, o.center, o.zmin - 1), ...diagonaltiles(o.startCenter, o.center, o.zmin + 1));
    }

    // Handle fitBounds
    if (o.type === 'fitBounds') {
        // Calculate the fitBounds bbox and tiles
        const fitBoundsBoundingBox = bounds(o.bounds, null, o.dimensions, o.tilesize);
        const fitBoundsZoom = o.zoom;
        const fitBoundsTiles = bboxtiles(fitBoundsBoundingBox, fitBoundsZoom);

        // Add the fitBounds tiles to the list of tiles to preload
        tiles.push(...fitBoundsTiles);
    }

    // Build the tiles pyramid for final scenario
    for (let z = o.zoom; z > o.zmin - 1; z--) {
        const tt = bboxtiles(finalbbox, z);
        tiles.push(...tt);
        tz = tt.length;
    }
    // Remove duplicates
    tiles = [...new Set(tiles)];
    // From tiles [x,y,z] to URLs 
    urls = tiles.map(t => {
        return o.sources.map(s => {
            return s.replace('{x}', t[0])
                .replace('{y}', t[1])
                .replace('{z}', t[2]);
        });
    }).flat();

    // Fetch all
    Promise.all(urls.map(u => fetch(u, { signal })))
        .then(d => {
            if (!!o.debug) console.log(`Estimated gain: ${Math.round(900 * tz / 6)}ms`);
            if (!!o.debug) console.log(`Prefetched ${urls.length} tiles at zoom levels [${o.zmin} - ${o.zoom}]`);
            postMessage({ t: Date.now(), e: false });
        })
        .catch(e => {
            if (!!o.debug && e.name !== 'AbortError') console.log('🔴 Precache error');
        });

};

// To be used with importScripts
globalThis.tilebelt = tilebelt;
globalThis.bounds = bounds;

export { maplibregl }