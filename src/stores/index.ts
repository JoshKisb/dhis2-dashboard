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
	title: {
		style: {
			fontWeight: 'bold'
	  }
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
			"/api/38/analytics?dimension=dx:CFMGxtTBf6m;JDygTkWCxQU;vU8Ofttev65;T6TTjdahYxL;hIYU0NgVZt8,pe:2015;2016;2017;2018;2019;2020;2021;2022;2023&filter=ou:LEVEL-Sg9YZ6o7bCQ&displayProperty=NAME&includeNumDen=false&skipMeta=true&skipData=false";
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
		const totalDeaths = this.data[indicatorMap.deathsNotified] || [];

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

	get yearsData() {
		const data = {};
		Object.keys(this.data).forEach((dx) => {
			data[dx] = this.data[dx]["2023"];
		});
		return data;
	}

	// LINE-GRAPHS
	get lineChartBirthData() {
		const birthsNotified = this.data[indicatorMap.totalBirths] || [];
		const birthsRegistered = [];
		const birthsCertified = [];

		const periods = ["2018", "2019", "2020", "2021", "2022", "2023"];

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
					name: "Notified",
					data: periods.map((pe) => parseFloat(birthsNotified[pe] ?? 0)),
					color: "red",
				},
				{
					name: "Registered",
					data: periods.map((pe) => parseFloat(birthsRegistered[pe] ?? 0)),
					color: "blue",
				},
				{
					name: "Certified",
					data: periods.map((pe) => parseFloat(birthsCertified[pe] ?? 0)),
					color: "green",
				},
			],
		};
	}

	get lineChartDeathData() {
		const deathsNotified = this.data[indicatorMap.deathsNotified] || [];
		const deathsRegistered = this.data[indicatorMap.registeredDeaths] || [];
		const deathsCertified = this.data[indicatorMap.deathsCertified] || [];

		const periods = ["2019", "2020", "2021", "2022", "2023"];

		return {
			...defaultChartOptions,
			chart: {
				type: "line",
			},
			title: {
				...defaultChartOptions.title,
				text: "Deaths",
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
				{
					name: "Deaths Registered",
					data: periods.map((pe) => parseFloat(deathsRegistered[pe] ?? 0)),
					color: "#F37F33",
				},
				{
					name: "Deaths Certified",
					data: periods.map((pe) => parseFloat(deathsCertified[pe] ?? 0)),
					color: "#980C71",
				},
			],
		};
	}

	// COLUMN BAR
	get totalBirthsByGenderChartData() {
		const femaleBirths = this.data[indicatorMap.femaleBirths] || [];
		const maleBirths = this.data[indicatorMap.maleBirths] || [];
		const totalBirths = this.data[indicatorMap.totalBirths] || [];

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
		const femaleDeaths = this.data[indicatorMap.femaleDeaths] || [];
		const maleDeaths = this.data[indicatorMap.maleDeaths] || [];
		const totalDeaths = this.data[indicatorMap.deathsNotified] || [];

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
		const femaleBirths = this.data[indicatorMap.femaleBirths] || [];
		const maleBirths = this.data[indicatorMap.maleBirths] || [];
		const periods = ["2019", "2020", "2021", "2022", "2023"];

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
					name: "Male",
					data: periods.map((pe) => parseFloat(maleBirths[pe] ?? 0)),
					color: "red",
				},
				{
					name: "Female",
					data: periods.map((pe) => parseFloat(femaleBirths[pe] ?? 0)),
					color: "blue",
				},
			],
		};
	}

	get totalDeathStackedChartData() {
		const femaleDeaths = this.data[indicatorMap.femaleDeaths] || [];
		const maleDeaths = this.data[indicatorMap.maleDeaths] || [];
		const periods = ["2019", "2020", "2021", "2022", "2023"];

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
							(Highcharts.defaultOptions.title?.style &&
								Highcharts.defaultOptions.title?.style.color) ||
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
		const femaleBirths = this.data[indicatorMap.femaleBirths] || [];
		const maleBirths = this.data[indicatorMap.maleBirths] || [];
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
		const femaleDeaths = this.data[indicatorMap.femaleDeaths] || [];
		const maleDeaths = this.data[indicatorMap.maleDeaths] || [];

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
				...defaultChartOptions.title,
				text: "Region",
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
