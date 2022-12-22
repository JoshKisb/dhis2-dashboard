import React from "react";
import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMap from "highcharts/modules/map";
import proj4 from "proj4";
import mapDataIE from "@highcharts/map-collection/countries/ie/ie-all.geo.json";
import map from "@highcharts/map-collection/countries/ug/ug-all.geo.json";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { indicatorMap } from "../assets/indicators";
// import map from "@highcharts/map-collection/custom/world.topo.json";
import { startCase } from "lodash";

highchartsMap(Highcharts);

export const Dashboard = observer(() => {
	const [loading, setLoading] = useState(true);
	const store = useStore();

	// Alter graphs
	const [showElement, setShowElement] = useState(true);
	useEffect(() => {
		setTimeout(function () {
			setShowElement(false);
		}, 5000);
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined") {
			window["proj4"] = window["proj4"] || proj4;
		}

		setLoading(true);
		store.loadData().finally(() => {
			setLoading(false);

			console.log("opts", store.totalDeathsChartData);
		});
	}, []);

	return (
		<div
			className="parent-container"
			style={{
				backgroundColor: "#F3F2EF",
				height: "100vh",
				paddingLeft: "0px",
				paddingRight: "0px",
				marginLeft: "15px",
				marginRight: "15px",
			}}
		>
			{loading && (
				<div className="row">
					<div className="col-12 d-flex justify-content-center">
						<div
							className="spinner-grow"
							style={{ width: "3rem", height: "3rem" }}
							role="status"
						>
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
			)}

			{!loading && (
				<>
					{/* MARQUEE */}
					<div className="marquee no-padding">
						<p>
							Welcome to Vital Events dashboard! Providing the Births and Death
							statistics per District of the Republic of Uganda.
						</p>
					</div>

					<div className="dashboard" style={{ backgroundColor: "#F3F2EF" }}>
						{/* SUMMARY CARDS */}
						<div className="row p-2 no-padding">
							{Object.keys(indicatorMap).map((ky, index) => (
								<div className="col-md-2" key={index}>
									<div className="card" style={{ alignItems: "center" }}>
										<div className="card-body" style={{ textAlign: "center" }}>
											<h4>
												{store.yearsData[indicatorMap[ky]]
													? store.yearsData[indicatorMap[ky]]
													: "---"}
											</h4>
											{startCase(ky)}
										</div>
									</div>
								</div>
							))}
						</div>

						{/* GRAPHS & MAP */}
						<div className="graphs-map row charts h-100">
							<div className="col-md-12 mb-3 h-100">
								<div className="row parent">
									{/* BIRTH & DEATH LINE-GRAPHS */}
									<div className="card div1">
										<div className="card-body">
											{showElement ? (
												<HighchartsReact
													highcharts={Highcharts}
													options={store.lineChartDeathData}
												/>
											) : (
												<HighchartsReact
													highcharts={Highcharts}
													options={store.lineChartBirthData}
												/>
											)}
										</div>
									</div>

									<div className="card div2">
										<div className="card-body">
											<HighchartsReact
												highcharts={Highcharts}
												options={store.stackedChartData}
											/>
										</div>
									</div>

									<div className="card div3">
										<div className="card-body">
											<HighchartsReact
												highcharts={Highcharts}
												options={store.deathByGenderChartData}
											/>
										</div>
									</div>

									<div className="card div4">
										<div className="card-body">
											<HighchartsReact
												highcharts={Highcharts}
												options={store.totalDeathsByGenderChartData}
											/>
										</div>
									</div>

									<div className="card div5">
										<div className="card-body">
											<HighchartsReact
												highcharts={Highcharts}
												constructorType={"mapChart"}
												options={store.mapChartOptions}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
});
