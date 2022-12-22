document.addEventListener("DOMContentLoaded", () => {
	Highcharts.chart("container", {
		chart: {
			type: "line",
		},
		title: {
			text: "Births by Gender",
		},
		credits: {
			enabled: false,
		},
		colors: ["#E9B44C", "#9B2915", "#50A2A7", "#1C110A", "#E4D6A7"],
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
			// {
			// 	data: [
			// 		["Jane", 10],
			// 		["Jack", 10],
			// 		["Peter", 9],
			// 	],
			// },
			/*
			{
				data: [
					{ name: "Jack", y: 10, x: 2, color: "red" },
					{ name: "Jane", y: 20, x: 4 },
				],
			},
			*/
			// {
			// 	name: "Negative data",
			// 	negativeColor: "red",
			// 	data: [1, 2, 3, 6, -10, 8, 20, 2],
			// },
			/*
			{
				name: "Different colors",
				data: [-4, -8, 0, 4, 5, 6, 9, 10, 12, 15, 10, 9, 7, -4],
				zones: [
					{
						value: 0,
						color: "#f7a35c",
					},
					{
						value: 10,
						color: "#7cb5ec",
					},
					{
						color: "#90ed7d",
					},
				],
			},
      */
		],
	});
});
