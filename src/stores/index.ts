import { createContext, useContext } from "react";
import { makeAutoObservable } from "mobx";
import IDataEngine from "../utils/DataEngine";
import { indicatorMap } from "../assets/indicators";
import map from "../assets/Organisation_units.geo.json";
import Highcharts from "highcharts";

interface IData {
	[pe: string]: string;
}

const defaultChartOptions = {
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
	data: any;

	constructor(engine: IDataEngine) {
		makeAutoObservable(this, {}, { autoBind: true });
		this.engine = engine;
	}

	fetchBirthData = async () => {
		const url =
			"/api/38/analytics?dimension=dx:zkMVFHEPvzC;ihAAgZ8OjGE;Z64hUZUifEF,pe:2015;2016;2017;2018;2022&filter=ou:LEVEL-Sg9YZ6o7bCQ&displayProperty=NAME&includeNumDen=false&skipMeta=true&skipData=false";
		const result = await this.engine.link.fetch(url).catch((err: any) => err);
		this.data = { ...this.data, ...this.processDataResults(result) };
	};

	fetchDeathData = async () => {
		const url =
			"/api/38/analytics?dimension=dx:CFMGxtTBf6m;JDygTkWCxQU;vU8Ofttev65;T6TTjdahYxL,pe:2015;2016;2017;2018;2019;2020;2021;2022&filter=ou:LEVEL-Sg9YZ6o7bCQ&displayProperty=NAME&includeNumDen=false&skipMeta=true&skipData=false";
		const result = await this.engine.link.fetch(url).catch((err: any) => err);
		this.data = { ...this.data, ...this.processDataResults(result) };
	};

	loadData = async () => {
		await Promise.all([this.fetchBirthData(), this.fetchDeathData()]);
	};

	// this method converts dhis meta from format
	// { headers: [], rows: [] }
	// to the format
	// {dx1: {pe: value, pe: value}, dx2: {....
	private processDataResults(results) {
		const { headers, rows } = results;
		const indexes = Object.fromEntries(headers.map((h, idx) => [h.name, idx]));
		const data = {};

		rows.forEach((row) => {
			const dx = row[indexes.dx];
			const pe = row[indexes.pe];
			const value = row[indexes.value];

			if (!data[dx]) data[dx] = {};

			data[dx][pe] = value;
		});

		return data;
	}

	get totalDeathsChartData() {
		const totalDeaths = this.data[indicatorMap.totalDeaths];

		const periods = Object.keys(totalDeaths);
		return {
			...defaultChartOptions,
			chart: {
				type: "column",
			},
			title: {
				text: "Total Deaths",
			},
			xAxis: {
				categories: periods,
				crosshair: true,
			},
			series: [
				{
					name: "Total Deaths",
					data: periods.map((pe) => parseFloat(totalDeaths[pe])),
				},
			],
		};
	}

	get yearsData() {
		const data = {};
		Object.keys(this.data).forEach((dx) => {
			data[dx] = this.data[dx]["2022"];
		});
		return data;
	}

	// LINE-GRAPHS
	get lineChartBirthData() {
		return {
			...defaultChartOptions,
			title: {
				text: "Births by gender",
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
					text: "Numbers of babies",
				},
			},
			xAxis: {
				categories: ["2018", "2019", "2020", "2021", "2022"],
			},
			series: [
				{
					name: "Male",
					data: [600, 400, 300, 700, 710],
					color: "red",
				},
				{
					name: "Female",
					data: [900, 580, 200, 400, 510],
					color: "blue",
				},
				{
					name: "Total",
					data: [900 + 600, 580 + 400, 200 + 300, 400 + 700, 510 + 710],
					color: "green",
				},
			],
		};
	}

	get lineChartDeathData() {
		return {
			...defaultChartOptions,
			title: {
				text: "Deaths by gender",
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
					text: "Numbers of babies",
				},
			},
			xAxis: {
				categories: ["2018", "2019", "2020", "2021", "2022"],
			},
			series: [
				{
					name: "Male",
					data: [500, 300, 200, 600, 610],
					color: "blue",
				},
				{
					name: "Female",
					data: [800, 480, 100, 300, 410],
					color: "pink",
				},
				{
					name: "Total",
					data: [800 + 700, 480 + 300, 100 + 200, 300 + 600, 410 + 610],
					color: "yellow",
				},
			],
		};
	}

	// STACKED GRAPH
	get stackedChartData() {
		return {
			...defaultChartOptions,
			chart: {
				type: "column",
			},
			xAxis: {
				categories: ["2018", "2019", "2020", "2021"],
			},
			yAxis: {
				min: 0,
				title: {
					text: "Count trophies",
				},
				stackLabels: {
					enabled: true,
					style: {
						fontWeight: "bold",
						color:
							// theme
							(Highcharts.defaultOptions.title.style &&
								Highcharts.defaultOptions.title.style.color) ||
							"gray",
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
				backgroundColor:
					Highcharts.defaultOptions.legend.backgroundColor || "white",
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
					name: "BPL",
					data: [3, 5, 1, 13],
				},
				{
					name: "FA Cup",
					data: [14, 8, 8, 12],
				},
				{
					name: "CL",
					data: [0, 2, 6, 3],
				},
			],
		};
	}

	get totalDeathsByGenderChartData() {
		const femaleDeaths = this.data[indicatorMap.femaleDeaths];
		const maleDeaths = this.data[indicatorMap.maleDeaths];
		const totalDeaths = this.data[indicatorMap.totalDeaths];

		const periods = Object.keys(maleDeaths);

		return {
			...defaultChartOptions,
			chart: {
				type: "column",
			},
			title: {
				text: "Total Deaths",
			},
			xAxis: {
				categories: periods,
				crosshair: true,
			},
			series: [
				{
					name: "Male Deaths",
					data: periods.map((pe) => parseFloat(maleDeaths[pe])),
				},
				{
					name: "Female Deaths",
					data: periods.map((pe) => parseFloat(femaleDeaths[pe])),
				},
				{
					name: "Total Deaths",
					data: periods.map((pe) => parseFloat(totalDeaths[pe])),
				},
			],
		};
	}

	// PIE-CHART
	get birthByGenderChartData() {
		const femaleBirths = this.data[indicatorMap.femaleBirths];
		const maleBirths = this.data[indicatorMap.maleBirths];
		const totalFemaleBirths = Object.values(femaleBirths).reduce(
			(acc: number, value: any) => acc + parseFloat(value),
			0
		);
		const totalMaleBirths = Object.values(maleBirths).reduce(
			(acc: number, value: any) => acc + parseFloat(value),
			0
		);
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
				text: "Birth by gender",
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
		const femaleDeaths = this.data[indicatorMap.femaleDeaths];
		const maleDeaths = this.data[indicatorMap.maleDeaths];
		const totalFemaleDeaths = Object.values(femaleDeaths).reduce(
			(acc: number, value: any) => acc + parseFloat(value),
			0
		);
		const totalMaleDeaths = Object.values(maleDeaths).reduce(
			(acc: number, value: any) => acc + parseFloat(value),
			0
		);
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
				text: "Deaths by gender",
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
			tooltip: {
				headerFormat: "",
				pointFormat:
					"<b>{point.freq}</b><br><b>{point.keyword}</b>                      <br>lat: {point.lat}, lon: {point.lon}",
			},
			series: [
				{
					mapData: map,
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
