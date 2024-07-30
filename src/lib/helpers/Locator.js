import { select } from 'd3-selection'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from "topojson-client";

export default class Locator {

	constructor(width, height, feat, address, extent, offset){

		this.width = width;
		this.height = height;
		this.feature = feature(feat, address);
		this.projection = geoMercator().fitSize([this.width, this.height], this.feature);
		this.path = geoPath().projection(this.projection);
		this.extent = extent;
		this.offset = offset;
		this.ne = this.extent._ne;
		this.sw = this.extent._sw;
		this.nw = {lat:this.ne.lat, lng:this.sw.lng};
		this.se = {lat:this.sw.lat, lng:this.ne.lng};
		this.topRight = this.projection([this.ne.lng, this.ne.lat]);
		this.bottomLeft = this.projection([this.sw.lng, this.sw.lat]);
		this.rectWidth = this.topRight[0] - this.bottomLeft[0];
		this.rectHeight = this.bottomLeft[1] - this.topRight[1];
		this.map;
		this.rect;

	}

	addLocator(svg){

		let node = select(svg);
		
		this.map = node.append("path")
		.datum(this.feature)
		.attr("d", this.path)
		.attr('class', 'locator-base-map')
		.attr('transform', `translate(${this.offset.x},${this.offset.y})`)

		this.rect = node.append("path")
		.attr('class', 'boundingBox')
		.attr("d", this.path({
			type: "LineString",
			coordinates: [[this.ne.lng, this.ne.lat],[this.se.lng,this.se.lat],[this.sw.lng,this.sw.lat],[this.nw.lng, this.nw.lat],[this.ne.lng, this.ne.lat]]
		} ))
		.attr('transform', `translate(${this.offset.x},${this.offset.y})`)
		.attr('stroke', '#CC0A11')
		.attr('stroke-width', '2px')
		.attr('fill', 'none')
	}


	updateLocator(extent){

        this.ne = extent._ne;
        this.sw = extent._sw;
        this.nw = {lat:this.ne.lat, lng:this.sw.lng};
        this.se = {lat:this.sw.lat, lng:this.ne.lng};

        this.rect
        .attr("d", this.path({
            type: "LineString",
            coordinates: [
                [this.ne.lng, this.ne.lat],[this.nw.lng, this.nw.lat],
                [this.sw.lng,this.sw.lat], [this.se.lng,this.se.lat],
                [this.ne.lng, this.ne.lat]
            ]
        } ))
    }
}