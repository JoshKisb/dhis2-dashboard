import { createContext, useContext } from "react";
import { makeAutoObservable, toJS } from "mobx";
import IDataEngine from "../utils/DataEngine";
import { indicatorMap } from "../assets/indicators";
import map from "../assets/Organisation_units.geo.json";
import regionjson from "../assets/regions.json";
import Highcharts from "highcharts";


interface IData {
	[pe: string]: string;
}



const defaultChartOptions = {
	title: {
		style: {
			fontWeight: "bold",
		},
	},
	series: [
		{
			data: [],
		},
	],
	credits: {
		enabled: false,
	},
};

export class Store {
	engine: IDataEngine;
	loadingData: boolean = true;
	data: any;
	regions: any = null;
	loadingRegions = false;
	districts: any = null;
	loadingDistricts = false;
	regionData: any;
	districtData: any;
	selectedOrg: string|null = null;
	selectedOrgName: string|null = null;
	selectedOrgData: any = null;

	constructor(engine: IDataEngine) {
		makeAutoObservable(this, {}, { autoBind: true });
		this.engine = engine;
	}

	setSelectedOrg = async (orgunit, name, oulevel) => {
		this.selectedOrgName = name;		
		

		const source = oulevel == "district" ? this.districtData: this.regionData;
		const data = {} 
		Object.keys(source).forEach(dx => {
			data[dx] = source[dx][orgunit]
		})
		console.log("sld", data)
		this.selectedOrgData = data;

		this.selectedOrg = orgunit;
	}

	fetchBirthData = async () => {		
		const ou = this.selectedOrg ?? "akV6429SUqu";
		const extraindicators = [indicatorMap.tbirthsCertified, indicatorMap.tbirthsNotified, indicatorMap.tbirthsProjection, indicatorMap.tbirthsRegistered];
		const url = `/api/38/analytics?dimension=dx:d7pS20J9g1J;LcAGxRIRG1m;ihAAgZ8OjGE;Z64hUZUifEF;nq7BDH3XeKc;DKym5hy9DA2;${extraindicators.join(";")},pe:2015;2016;2017;2018;2019;2020;2021;2022;2023&filter=ou:${ou}&displayProperty=NAME&includeNumDen=false&skipMeta=true&skipData=false`;
		const result = await this.engine.link.fetch(url).catch((err: any) => err);
		this.data = { ...this.data, ...this.processDataResults(result) };

		const url2 = `/api/38/analytics?dimension=kQ3qjfL2TKg:Yx4GBhbQKMM;FGQBsDGjTLh,pe:202201;202202;202203;202204;202205;202206;202207;202208;202209;202210;202211;202212;2018;2019;2020;2021;2022&filter=ou:${ou}&filter=dx:md7brKHLz83&displayProperty=NAME&includeNumDen=false&skipMeta=true&skipData=false`;
		const result2 = await this.engine.link.fetch(url2).catch((err: any) => err);
		this.data = { ...this.data, ...this.processDataResults(result2, "kQ3qjfL2TKg") };
	};

	fetchDeathData = async () => {
		const ou = this.selectedOrg ?? "akV6429SUqu";
		const extraindicators = [indicatorMap.tdeathsCertified, indicatorMap.tdeathsNotified, indicatorMap.tdeathsRegistered];
		const url =
			`/api/38/analytics?dimension=dx:CFMGxtTBf6m;JDygTkWCxQU;vU8Ofttev65;T6TTjdahYxL;hIYU0NgVZt8;${extraindicators.join(";")},pe:2015;2016;2017;2018;2019;2020;2021;2022;2023&filter=ou:${ou}&displayProperty=NAME&includeNumDen=false&skipMeta=true&skipData=false`;
		const result = await this.engine.link.fetch(url).catch((err: any) => err);
		this.data = { ...this.data, ...this.processDataResults(result) };

		// const url2 = `/api/38/analytics?dimension=kQ3qjfL2TKg:Yx4GBhbQKMM;FGQBsDGjTLh,pe:&filter=ou:USER_ORGUNIT&filter=dx:md7brKHLz83&displayProperty=NAME&includeNumDen=false&skipMeta=true&skipData=false`;
		// const result2 = await this.engine.link.fetch(url2).catch((err: any) => err);
		// this.data = { ...this.data, ...this.processDataResults(result2, "kQ3qjfL2TKg") };
	};

	fetchMapData = async (level: "region"|"district" = "region") => {
		const lvl = level == "region" ? 2 : 3;
		const indicators = Object.values(indicatorMap).join(";")
		const durl = `/api/38/analytics?dimension=dx:${indicators},pe:2018;2019;2020;2021;2022;2023,ou:LEVEL-${lvl}&ouMode=DESCENDANTS&displayProperty=NAME&includeNumDen=false&skipMeta=true&skipData=false&aggregationType=COUNT`;
		const res = await this.engine.link.fetch(durl).catch((err: any) => err);
		const { headers, rows } = res;
		const indexes = Object.fromEntries(headers.map((h, idx) => [h.name, idx]));

		let data = {};
		rows.forEach((row) => {
			const dx = row[indexes.dx];
			const pe = row[indexes.pe];
			const value = row[indexes.value];
			const ou = row[indexes.ou]

			if (!data[dx]) data[dx] = {};
			if (!data[dx][ou]) data[dx][ou] = {};

			data[dx][ou][pe] = value;
		});

		console.log("data", data)

		if (level == "region")
			this.regionData = data;
		else 
			this.districtData = data;
	}
		
	fetchMapDistricts = async () => {
		if (!!this.districts || !!this.loadingDistricts) return;
			
			
		const cached = localStorage.getItem("district_geojson")
		//const url = `/api/38/geoFeatures?ou=ou:SUvODYOcaVf;F1o6qBSx783;Dt6qdenPX1E;QBPg7KKCeoA;yx0ieyZNF0l;Wd1lV9Qdj4o;GIpyzaSuEgM;jdlbNUwJiKX;G0rlphd2tcD;DWPnYhoqza0;Dl9WvtvDs5V;IEU0FjDAhBP;r0GhWtmPHDj;JZhJ50nOirX;BD3XaQ7cQAp;LEVEL-3&displayProperty=NAME`
		// const url = `/api/38/geoFeatures?ou=ou:akV6429SUqu;LEVEL-2&displayProperty=NAME`;
		if (!!cached) {
			this.districts = JSON.parse(cached);
			return;
		}

		this.loadingDistricts = true;
		const url = `api/38/organisationUnits.geojson?parent=akV6429SUqu&level=3`
		const result = await this.engine.link.fetch(url).catch((err: any) => err);
		console.log({ result })

		// add id to geojson properties
		const districts = {
			...result,
			features: result.features.map(f => ({
				...f,
				properties: {
					...f.properties,
					id: f.id
				}
			}))
		};
		this.districts = districts;
		this.loadingDistricts = false;

		const districtstr = JSON.stringify(districts);
		var compressed = districtstr;

		localStorage.setItem("district_geojson", compressed)
	}

	fetchMapRegions = async () => {
		if (!!this.regions || !!this.loadingRegions) return;

		const cached = localStorage.getItem("region_geojson");
		if (!!cached) {
			this.regions = JSON.parse(cached);
			return;
		}

		this.loadingRegions = true;
		//const url = `/api/38/geoFeatures?ou=ou:SUvODYOcaVf;F1o6qBSx783;Dt6qdenPX1E;QBPg7KKCeoA;yx0ieyZNF0l;Wd1lV9Qdj4o;GIpyzaSuEgM;jdlbNUwJiKX;G0rlphd2tcD;DWPnYhoqza0;Dl9WvtvDs5V;IEU0FjDAhBP;r0GhWtmPHDj;JZhJ50nOirX;BD3XaQ7cQAp;LEVEL-3&displayProperty=NAME`
		// const url = `/api/38/geoFeatures?ou=ou:akV6429SUqu;LEVEL-2&displayProperty=NAME`;
		const url = `api/38/organisationUnits.geojson?parent=akV6429SUqu&level=2`
		const result = await this.engine.link.fetch(url).catch((err: any) => err);
		console.log({ result })

		// add id to geojson properties
		const regions = {
			...result,
			features: result.features?.map(f => ({
				...f,
				properties: {
					...f.properties,
					id: f.id
				}
			}))
		};
		this.regions = regions;
		this.loadingRegions = false;
		localStorage.setItem("region_geojson", JSON.stringify(regions))
		// this.regions = {
		// 	type: "FeatureCollection",
		// 	features: result.map((r) => ({
		// 		type: "Feature",
		// 		id: r.id,
		// 		geometry: {
		// 			type: "MultiPolygon",
		// 			coordinates: JSON.parse(r.co), //.map(c => c.map(x => x.map(l => ({ lat: l[0], lng: l[1] })))),
		// 		},
		// 		properties: {
		// 			type: "Polygon",
		// 			id: r.id,
		// 			name: r.na,
		// 			hasCoordinatesDown: r.hcd,
		// 			hasCoordinatesUp: r.hcu,
		// 			level: r.le,
		// 			grandParentParentGraph: "",
		// 			grandParentId: "",
		// 			parentGraph: r.pg,
		// 			parentId: r.pi,
		// 			parentName: r.pn,
		// 			dimensions: r.dimensions,
		// 		},
		// 	})),
		// };
	};

	loadData = async () => {
		this.loadingData = true;
		await Promise.all([this.fetchBirthData(), this.fetchDeathData()]);
		this.loadingData = false;
		this.fetchMapRegions();
		this.fetchMapDistricts();
		this.fetchMapData("region")
		this.fetchMapData("district")
	};

	// this method converts dhis meta from format
	// { headers: [], rows: [] }
	// to the format
	// {dx1: {pe: value, pe: value}, dx2: {....
	private processDataResults(results, dxkey = "dx") {
		const { headers, rows } = results;
		const indexes = Object.fromEntries(headers.map((h, idx) => [h.name, idx]));
		const data = {};

		rows.forEach((row) => {
			const dx = row[indexes[dxkey]];
			const pe = row[indexes.pe];
			const value = row[indexes.value];

			if (!data[dx]) data[dx] = {};

			data[dx][pe] = value;
		});

		return data;
	}

	get totalDeathsChartData() {
		const totalDeaths = this.ouData[indicatorMap.deathsNotified] || [];

		const periods = Object.keys(totalDeaths);
		return {
			...defaultChartOptions,
			chart: {
				type: "column",
			},
			title: {
				...defaultChartOptions.title,
				text: "Total Deaths",
			},
			xAxis: {
				categories: periods,
				crosshair: true,
			},
			series: [
				{
					name: "Total Deaths",
					data: periods.map((pe) => parseFloat(totalDeaths[pe] ?? 0)),
				},
			],
		};
	}

	// get geoJSON() {
	// 	return ({
	// 		...this.regions,
	// 		features: this.regions?.features.map(f => ({
	// 			...f,
	// 			geometry: {
	// 				...f.geometry,
	// 				coordinates: toJS(f.geometry.coordinates)
	// 			}
	// 		}))
	// 	})
	// }

	get ouData() {
		if (!!this.selectedOrg) {
			return this.selectedOrgData;
		}
		return this.data;
	}

	get yearsData() {
		const data = {};
		Object.keys(this.ouData).forEach((dx) => {
			data[dx] = this.ouData[dx]?.["2022"];
		});
		return data;
	}

	// LINE-GRAPHS
	get lineChartBirthData() {
		const birthsNotified = this.ouData[indicatorMap.tbirthsNotified] || [];

		const periods = ["2018", "2019", "2020", "2021", "2022"];

		return {
			...defaultChartOptions,
			chart: {
				type: "line",
			},
			title: {
				...defaultChartOptions.title,
				text: "Total Births Notified",
			},
			plotOptions: {
				series: {
					label: {
						connectorAllowed: false,
					},
				},
			},
			yAxis: {
				title: {
					text: "Numbers in thousands",
				},
			},
			xAxis: {
				categories: periods,
			},
			series: [
				{
					name: "MVRS Births Notified",
					data: periods.map((pe) => parseFloat(birthsNotified[pe] ?? 0)),
					color: "red",
				},				
			],
		};
	}

	get lineChart2BirthData() {
		const birthsProjection = this.ouData[indicatorMap.tbirthsProjection] || [];
		const birthsRegistered = this.ouData[indicatorMap.tbirthsRegistered] || [];

		const periods = ["2018", "2019", "2020", "2021", "2022"];

		return {
			...defaultChartOptions,
			chart: {
				type: "line",
			},
			title: {
				...defaultChartOptions.title,
				text: "Total Birth Registrations Vs UBOS Projection",
			},
			plotOptions: {
				series: {
					label: {
						connectorAllowed: false,
					},
				},
			},
			yAxis: {
				title: {
					text: "Numbers in thousands",
				},
			},
			xAxis: {
				categories: periods,
			},
			series: [
				{
					name: "UBOS Births Projection",
					data: periods.map((pe) => parseFloat(birthsProjection[pe] ?? 0)),
					color: "orange",
				},			
				{
					name: "MVRS Births Registered",
					data: periods.map((pe) => parseFloat(birthsRegistered[pe] ?? 0)),
					color: "blue",
				},				
			],
		};
	}

	get lineChart3BirthData() {
		const birthsCertified = this.ouData[indicatorMap.tbirthsCertified] || [];

		const periods = ["2018", "2019", "2020", "2021", "2022"];

		return {
			...defaultChartOptions,
			chart: {
				type: "line",
			},
			title: {
				...defaultChartOptions.title,
				text: "Total Births Certified",
			},
			plotOptions: {
				series: {
					label: {
						connectorAllowed: false,
					},
				},
			},
			yAxis: {
				title: {
					text: "Numbers in thousands",
				},
			},
			xAxis: {
				categories: periods,
			},
			series: [
				{
					name: "MVRS Births Certified",
					data: periods.map((pe) => parseFloat(birthsCertified[pe] ?? 0)),
					color: "red",
				},				
			],
		};
	}

	get lineChart4BirthData() {
		const male = this.ouData[indicatorMap.tmale] || [];
		const female = this.ouData[indicatorMap.tfemale] || [];

		const periods = ["2018", "2019", "2020", "2021", "2022"];

		return {
			...defaultChartOptions,
			chart: {
				type: "line",
			},
			title: {
				...defaultChartOptions.title,
				text: "Births",
			},
			plotOptions: {
				series: {
					label: {
						connectorAllowed: false,
					},
				},
			},
			yAxis: {
				title: {
					text: "Numbers in thousands",
				},
			},
			xAxis: {
				categories: periods,
			},
			series: [
				{
					name: "Male",
					data: periods.map((pe) => parseFloat(male[pe] ?? 0)),
					color: "blue",
				},		
				{
					name: "Female",
					data: periods.map((pe) => parseFloat(female[pe] ?? 0)),
					color: "orange",
				},				
			],
		};
	}

	

	get lineChartDeathData() {
		const deathsNotified = this.ouData[indicatorMap.tdeathsNotified] || [];
	
		const periods = ["2018", "2019", "2020", "2021", "2022"];

		return {
			...defaultChartOptions,
			chart: {
				type: "line",
			},
			title: {
				...defaultChartOptions.title,
				text: "Total Deaths Notified",
			},
			plotOptions: {
				series: {
					label: {
						connectorAllowed: false,
					},
				},
			},
			yAxis: {
				title: {
					text: "Numbers in thousands",
				},
			},
			xAxis: {
				categories: periods,
			},
			series: [
				{
					name: "Deaths Notified",
					data: periods.map((pe) => parseFloat(deathsNotified[pe] ?? 0)),
					color: "#00B5E2",
				},				
			],
		};
	}

	get lineChart2DeathData() {
		const deathsRegistered = this.ouData[indicatorMap.tdeathsRegistered] || [];

		const periods = ["2018", "2019", "2020", "2021", "2022"];

		return {
			...defaultChartOptions,
			chart: {
				type: "line",
			},
			title: {
				...defaultChartOptions.title,
				text: "Total Deaths Registered",
			},
			plotOptions: {
				series: {
					label: {
						connectorAllowed: false,
					},
				},
			},
			yAxis: {
				title: {
					text: "Numbers in thousands",
				},
			},
			xAxis: {
				categories: periods,
			},
			series: [
				{
					name: "Deaths Registered",
					data: periods.map((pe) => parseFloat(deathsRegistered[pe] ?? 0)),
					color: "orange",
				},				
			],
		};
	}

	get lineChart3DeathData() {
		const deathsCertified = this.ouData[indicatorMap.tdeathsCertified] || [];
	
		const periods = ["2018", "2019", "2020", "2021", "2022"];

		return {
			...defaultChartOptions,
			chart: {
				type: "line",
			},
			title: {
				...defaultChartOptions.title,
				text: "Deaths Certified",
			},
			plotOptions: {
				series: {
					label: {
						connectorAllowed: false,
					},
				},
			},
			yAxis: {
				title: {
					text: "Numbers in thousands",
				},
			},
			xAxis: {
				categories: periods,
			},
			series: [
				{
					name: "Deaths Certified",
					data: periods.map((pe) => parseFloat(deathsCertified[pe] ?? 0)),
					color: "#00B5E2",
				},				
			],
		};
	}

	// COLUMN BAR
	get totalBirthsByGenderChartData() {
		const femaleBirths = this.ouData[indicatorMap.femaleBirths] || [];
		const maleBirths = this.ouData[indicatorMap.maleBirths] || [];
		const totalBirths = this.ouData[indicatorMap.birthsNotified] || [];

		const periods = Object.keys(maleBirths);

		return {
			...defaultChartOptions,
			chart: {
				type: "column",
			},
			title: {
				...defaultChartOptions.title,
				text: "Births by Gender",
			},
			xAxis: {
				categories: periods,
				crosshair: true,
			},
			yAxis: {
				title: {
					text: "Numbers in thousands",
				},
			},
			series: [
				{
					name: "Male",
					data: periods.map((pe) => parseFloat(maleBirths[pe] ?? 0)),
					color: "#EA1314",
				},
				{
					name: "Female",
					data: periods.map((pe) => parseFloat(femaleBirths[pe] ?? 0)),
					color: "#1735F1",
				},
				{
					name: "Totals",
					data: periods.map((pe) => parseFloat(totalBirths[pe] ?? 0)),
					color: "#118347",
				},
			],
		};
	}

	get totalDeathsByGenderChartData() {
		const femaleDeaths = this.ouData[indicatorMap.femaleDeaths] || [];
		const maleDeaths = this.ouData[indicatorMap.maleDeaths] || [];
		const totalDeaths = this.ouData[indicatorMap.deathsNotified] || [];

		const periods = Object.keys(maleDeaths);

		return {
			...defaultChartOptions,
			chart: {
				type: "column",
			},
			title: {
				...defaultChartOptions.title,
				text: "Deaths by Gender",
			},
			xAxis: {
				categories: periods,
				crosshair: true,
			},
			yAxis: {
				title: {
					text: "Numbers in thousands",
				},
			},
			series: [
				{
					name: "Male",
					data: periods.map((pe) => parseFloat(maleDeaths[pe] ?? 0)),
				},
				{
					name: "Female",
					data: periods.map((pe) => parseFloat(femaleDeaths[pe] ?? 0)),
				},
				{
					name: "Totals",
					data: periods.map((pe) => parseFloat(totalDeaths[pe] ?? 0)),
				},
			],
		};
	}

	// STACKED GRAPH
	get totalBirthStackedChartData() {
		const male = this.ouData[indicatorMap.tmale] || [];
		const female = this.ouData[indicatorMap.tfemale] || [];
		const periods = ["2018", "2019", "2020", "2021", "2022"];

		return {
			...defaultChartOptions,
			chart: {
				type: "column",
			},
			title: {
				...defaultChartOptions.title,
				text: "Total Births",
			},
			xAxis: {
				categories: periods,
			},
			yAxis: {
				min: 0,
				title: {
					text: "Numbers in ten-thousands",
				},
				stackLabels: {
					enabled: true,
					style: {
						fontWeight: "bold",
						color:
							// theme
							(Highcharts.defaultOptions.title.style && Highcharts.defaultOptions.title.style.color) || "gray",
						textOutline: "none",
					},
				},
			},
			legend: {
				align: "left",
				x: 70,
				verticalAlign: "top",
				y: 70,
				floating: true,
				backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || "white",
				borderColor: "#CCC",
				borderWidth: 1,
				shadow: false,
			},
			tooltip: {
				headerFormat: "<b>{point.x}</b><br/>",
				pointFormat: "{series.name}: {point.y}<br/>Total: {point.stackTotal}",
			},
			plotOptions: {
				column: {
					stacking: "normal",
					dataLabels: {
						enabled: true,
					},
				},
			},
			series: [
				{
					name: "Male",
					data: periods.map((pe) => parseFloat(male[pe] ?? 0)),
					color: "green",
				},
				{
					name: "Female",
					data: periods.map((pe) => parseFloat(female[pe] ?? 0)),
					color: "orange",
				},				
				
			],
		};
	}

	get totalDeathStackedChartData() {
		const femaleDeaths = this.ouData[indicatorMap.tmale] || [];
		const maleDeaths = this.ouData[indicatorMap.tfemale] || [];
		const periods = ["202201","202202","202203","202204","202205","202206","202207","202208","202209","202210","202211","202212"];

		return {
			...defaultChartOptions,
			chart: {
				type: "column",
			},
			title: {
				...defaultChartOptions.title,
				text: "Deaths by Gender",
			},
			xAxis: {
				categories: periods,
			},
			yAxis: {
				min: 0,
				title: {
					text: "Numbers in ten-thousands",
				},
				stackLabels: {
					enabled: true,
					style: {
						fontWeight: "bold",
						color:
							// theme
							(Highcharts.defaultOptions.title?.style && Highcharts.defaultOptions.title?.style.color) || "gray",
						textOutline: "none",
					},
				},
			},
			legend: {
				align: "left",
				x: 70,
				verticalAlign: "top",
				y: 70,
				floating: true,
				backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || "white",
				borderColor: "#CCC",
				borderWidth: 1,
				shadow: false,
			},
			tooltip: {
				headerFormat: "<b>{point.x}</b><br/>",
				pointFormat: "{series.name}: {point.y}<br/>Total: {point.stackTotal}",
			},
			plotOptions: {
				column: {
					stacking: "normal",
					dataLabels: {
						enabled: true,
					},
				},
			},
			series: [
				{
					name: "Male",
					data: periods.map((pe) => parseFloat(maleDeaths[pe] ?? 0)),
					color: "#00B5E2",
				},
				{
					name: "Female",
					data: periods.map((pe) => parseFloat(femaleDeaths[pe] ?? 0)),
					color: "#F37F33",
				},
			],
		};
	}

	// PIE-CHART
	get birthByGenderChartData() {
		const femaleBirths = this.ouData[indicatorMap.femaleBirths] || [];
		const maleBirths = this.ouData[indicatorMap.maleBirths] || [];
		const totalFemaleBirths = Object.values(femaleBirths).reduce((acc: number, value: any) => acc + parseFloat(value), 0);
		const totalMaleBirths = Object.values(maleBirths).reduce((acc: number, value: any) => acc + parseFloat(value), 0);
		const total = totalFemaleBirths + totalMaleBirths;

		return {
			...defaultChartOptions,
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false,
				type: "pie",
			},
			title: {
				...defaultChartOptions.title,
				text: "Birth by Gender",
			},
			tooltip: {
				pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
			},
			accessibility: {
				point: {
					valueSuffix: "%",
				},
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: "pointer",
					dataLabels: {
						enabled: true,
						format: "<b>{point.name}</b>: {point.percentage:.1f} %",
					},
				},
			},
			series: [
				{
					name: "Births",
					colorByPoint: true,
					data: [
						{
							name: "Female",
							y: (totalFemaleBirths / total) * 100,
							sliced: true,
							selected: true,
							color: "#2C6693",
						},
						{
							name: "Male",
							y: (totalMaleBirths / total) * 100,
							color: "#118347",
						},
					],
				},
			],
		};
	}

	get deathByGenderChartData() {
		const femaleDeaths = this.ouData[indicatorMap.femaleDeaths] || [];
		const maleDeaths = this.ouData[indicatorMap.maleDeaths] || [];

		const totalFemaleDeaths = Object.values(femaleDeaths).reduce((acc: number, value: any) => acc + parseFloat(value), 0);
		const totalMaleDeaths = Object.values(maleDeaths).reduce((acc: number, value: any) => acc + parseFloat(value), 0);
		const total = totalFemaleDeaths + totalMaleDeaths;

		return {
			...defaultChartOptions,
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false,
				type: "pie",
			},
			title: {
				...defaultChartOptions.title,
				text: "Deaths by Gender",
			},
			tooltip: {
				pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
			},
			accessibility: {
				point: {
					valueSuffix: "%",
				},
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: "pointer",
					dataLabels: {
						enabled: true,
						format: "<b>{point.name}</b>: {point.percentage:.1f} %",
					},
				},
			},
			series: [
				{
					name: "Deaths",
					colorByPoint: true,
					data: [
						{
							name: "Female",
							y: (totalFemaleDeaths / total) * 100,
							sliced: true,
							selected: true,
							color: "#F9E640",
						},
						{
							name: "Male",
							y: (totalMaleDeaths / total) * 100,
							color: "#980C71",
						},
					],
				},
			],
		};
	}

	// MAP
	get mapChartOptions() {
		return {
			credits: {
				enabled: false,
			},
			title: {
				text: ''
		  	},
			chart: {
				type: "map",
				map: this.regions,
			},
			legend: {
				align: 'left',
				layout: 'vertical',
				floating: true,
			},	
			mapNavigation: {
				enabled: true
			},	
			colors: [
				"#ffffcc",
				"#ffeda0",
				"#fed976",
				"#feb24c",
				"#fd8d3c",
				"#fc4e2a",
				"#e31a1c",
				"#b10026",
			],
			// colorAxis: {
         //    tickPixelInterval: 1000
        	// },	
			// tooltip: {
			// 	headerFormat: "",
			// 	pointFormat: "<b>{point.freq}</b><br><b>{point.keyword}</b>                      <br>lat: {point.lat}, lon: {point.lon}",
			// },
			series: [
				{
					mapData: this.regions,
					data: [],
					name: "Org Units",
					dataLabels: {
						enabled: true,
						format: "{point.name}",
					},
				},
			],
		};
	}
}

export const StoreContext = createContext<Store>(null);

export const useStore = () => {
	return useContext(StoreContext);
};
