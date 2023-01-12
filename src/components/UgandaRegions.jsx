import React, { Component } from "react";
import ugRegions from "../assets/uganda-regions.json";
import { MapContainer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export class UgandaRegions extends Component {
	state = {};

	regionStyle = {
		fillColor: "",
		fillOpacity: 1,
		color: "#393E46",
		weight: 2,
	};

	onEachRegion = (region, layer) => {
		const countryName = region.properties.name;
		const value = region.properties.value;

		const b = (births) => {
			if (births === undefined) {
				births = "0";
			}
			return births;
		};
		//console.log(b(value));

		// show region name + rate
		layer.on("mouseover", function (e) {
			layer.bindPopup(countryName + ` (${b(value)})`).openPopup(); // here add openPopup()
		});

		// region color
		const c = (values) => {
			if (values === undefined) {
				layer.options.fillColor = "#F7F7F7";
			} else layer.options.fillColor = "#A3481C";
		};

		layer.options.fillOpacity = c(value);
	};

	render() {
		return (
			<>
				<p style={{ fontSize: 18, textAlign: "center" }}>
					Total Live Births by Region
				</p>
				<MapContainer
					style={{ height: "60vh", backgroundColor: "white" }}
					center={{ lat: 1.3733, lng: 32.2903 }}
					zoom={7}
				>
					<GeoJSON
						style={this.regionStyle}
						data={ugRegions.features}
						onEachFeature={this.onEachRegion}
					/>
				</MapContainer>
			</>
		);
	}
}

export default UgandaRegions;
