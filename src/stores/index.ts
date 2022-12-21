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

	get lineChartData() {
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
					pointStart: 2010,
				},
				series2: {
					label: {
						connectorAllowed: false,
					},
					pointStart: 2010,
				},
			},
			series: [
				{
					name: "Births",
					data: [
						43934, 48656, 65165, 81827, 112143, 142383, 171533, 165174, 155157,
						161454, 154610,
					],
				},
			],
			series2: [
				{
					name: "Deaths",
					data: [
						53934, 58656, 75165, 89827, 122143, 152383, 181533, 175174, 165157,
						171454, 144610,
					],
				},
			],
		};
	}

	get stackedChartData() {
		return {
			...defaultChartOptions,
			chart: {
				type: "column",
			},
			xAxis: {
				categories: ["Arsenal", "Chelsea", "Liverpool", "Manchester United"],
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
						},
						{
							name: "Male",
							y: (totalMaleDeaths / total) * 100,
						},
					],
				},
			],
		};
	}

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
