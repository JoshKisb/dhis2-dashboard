import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../stores";
import ugRegions from "../assets/uganda-regions.json";
import { MapContainer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { toJS } from "mobx";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMap from "highcharts/modules/map";
import { indicatorMap } from "../assets/indicators";
import { observer } from "mobx-react-lite";

interface Props {
	showDeaths: boolean
}

export const UgandaRegions: React.FC<Props> = observer(({ showDeaths }) => {
	const store = useStore();
	const [level, setLevel] = useState<"region" | "district">("district");
	const [loading, setLoading] = useState(true);
	let max = 100000;

	const geojson = useMemo(() => {
		const map = level == "region" ? store.regions : store.districts;
		const ldata = level == "region" ? store.regionData : store.districtData;
		console.log("ldata", ldata);
		console.log("map", map);
		return map?.features?.map((f) => {
			const dx = showDeaths ? indicatorMap.deathsNotified : indicatorMap.birthsNotified;
			const data = ldata?.[dx]?.[f.id];
			if (data > max) max = data;

			return { ou: f.id, value: data ?? 0 };
		});
		// return {
		// 	...store.regions,
		// 	features: store.regions.features?.map((f) => {
		// 		const dx = showDeaths ? indicatorMap.deathsNotified : indicatorMap.totalBirths;
		// 		const data = store.regionData?.[dx]?.[f.id];
		// 		return {
		// 			...f,
		// 			properties: {
		// 				...f.properties,
		// 				value: data ?? 0,
		// 			},
		// 		};
		// 	}),
		// };
	}, [showDeaths, store.regionData, store.regions, store.districtData, store.districts]);

	const regionStyle = {
		fillColor: "",
		fillOpacity: 1,
		color: "#393E46",
		weight: 2,
	};

	// useEffect(() => {
	// 	// console.log(store.geoJSON);
	// 	console.log(toJS(store.regions?.features.map(f => ({
	// 		...f,
	// 		geometry: {
	// 			...f.geometry,
	// 			coordinates: toJS(f.geometry.coordinates)
	// 		}
	// 	}))))
	// }, [store.geoJSON])

	const onEachRegion = (region, layer) => {
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
		// const c = (values) => {
		// 	if (values === undefined) {
		// 		layer.options.fillColor = "#F7F7F7";
		// 	} else layer.options.fillColor = "#A3481C";
		// };

		// layer.options.fillOpacity = c(value);
	};

	console.log("ge", geojson);
	console.log("mx", max);

	const handleClick = (e) => {
		console.log(e)
		store.setSelectedOrg(e.id, e.name);
	}

	const opts = {
		...store.mapChartOptions,
		colorAxis: {
			dataClassColor: "category",
			dataClasses: [
				{
					to: 500,
				},
				{
					from: 500,
					to: 1000,
				},
				{
					from: 1000,
					to: 5000,
				},
				{
					from: 5000,
					to: 10000,
				},
				{
					from: 10000,
					to: 20000,
				},
				{
					from: 20000,
					to: 50000,
				},
				{
					from: 50000,
					to: 100000,
				},
				{
					from: 100000,
				},
			],
		},
		// colorAxis: {
		// min: 0,
		// max: 1000,
		// type: 'logarithmic'
		//   },
		chart: {
			type: "map",
			map: level == "region" ? store.regions : store.districts,
		},
		legend: {
			title: {
				text: showDeaths ? "Deaths" : "Births",
			},
			align: "center",
			layout: "horizontal",
			floating: false,
		},
		plotOptions: {
			series: {
				point: {
					events: {
						click: function() {
							handleClick(this)
						}
					},
				},
			},
		},
		series: [
			{
				// mapData: store.regions,
				data: geojson,
				name: showDeaths ? "Deaths" : "Births",
				showInLegend: true,
				joinBy: ["id", "ou"],
				compare: "percent",
				states: {
					hover: {
						color: "#484848",
						borderWidth: 1,
					},
				},
				dataLabels: {
					enabled: true,
					format: "{point.name}",
				},
				borderColor: "black",
				borderWidth: 0.3,
			},
		],
	};

	const handleChange = (e) => {
		const val = e.target.value;
		setLevel(val);
		if (val == "regions") store.fetchMapRegions();
		else store.fetchMapDistricts();

		console.log("kkk", val);
		store.fetchMapData(val);
	};

	useEffect(() => {
		console.log("lvl", level);
		console.log("store", store);
		if (level == "region") {
			if (store.loadingRegions && !loading) {
				console.log("loading true");
				setLoading(true);
			} else if (!store.loadingRegions) {
				console.log("rd", store.regionData);
				if (!!store.regionData) setLoading(false);
			}
		} else {
			if (store.loadingDistricts && !loading) {
				console.log("loading true");
				setLoading(true);
			} else if (!store.loadingDistricts) {
				console.log("dd", store.districtData);
				if (!!store.districtData) setLoading(false);
			}
		}
	}, [level, store.loadingRegions, store.loadingDistricts, store.regionData, store.districtData]);

	return (
		<>
			<p style={{ fontSize: 18, textAlign: "center", fontWeight: "bold" }}>
				{`Total ${showDeaths ? "Deaths" : "Live Births"} by `}
				<select style={{ padding: "3px 10px 3px 4px" }} onChange={handleChange} value={level}>
					<option value="region">Region</option>
					<option value="district">District</option>
				</select>
			</p>
			{!loading ? (
				<HighchartsReact containerProps={{ style: { height: "100%" } }} highcharts={Highcharts} constructorType={"mapChart"} options={opts} />
			) : (
				<div className="d-flex justify-content-center align-items-center">
					<div className="spinner-border" role="status"></div>
				</div>
			)}
			{/* <MapContainer style={{ height: "60vh", backgroundColor: "white" }} center={{ lat: 1.3733, lng: 32.2903 }} zoom={6}>
				<GeoJSON
					//style={regionStyle}
					data={geojson}
					onEachFeature={onEachRegion}
				/>
			</MapContainer> */}
		</>
	);
});

export default UgandaRegions;
