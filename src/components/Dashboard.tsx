import React, { useCallback } from "react";
import Icon from "@mdi/react";
import { mdiFullscreen, mdiFullscreenExit } from "@mdi/js";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMap from "highcharts/modules/map";
import proj4 from "proj4";
import mapDataIE from "@highcharts/map-collection/countries/ie/ie-all.geo.json";
import map from "@highcharts/map-collection/countries/ug/ug-all.geo.json";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { birthIndicators, deathIndicators, indicatorMap } from "../assets/indicators";
// import map from "@highcharts/map-collection/custom/world.topo.json";
import { startCase } from "lodash";
import UgandaRegions from "./UgandaRegions";
import VerticalSwitch from "./VerticalSwitch";

highchartsMap(Highcharts);

export const Dashboard = observer(() => {
	const [loading, setLoading] = useState(true);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const store = useStore();
	const handle = useFullScreenHandle();
	const [showDeaths, setShowDeaths] = useState(false);

	const toggleBirths = (showing: string) => {
		setShowDeaths((showElement) => !showElement);
	}

	// Alter graphs
	useEffect(() => {
		// const intervalId = setInterval(() => {
		// 	setShowElement((showElement) => !showElement);
		// }, 10000);
		// return () => clearInterval(intervalId);
	}, []);

	/*
	function toggleFullScreen() {
		//const page = document.querySelector(".page");
		if (!document.fullscreenElement) {
			document.body.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}
	*/

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

	const currentIndicators = showDeaths ? deathIndicators: birthIndicators;

	return (
		<FullScreen handle={handle}>
			<div
				className="page"
				style={{
					backgroundColor: "#F3F2EF",
					width: "100%",
					height: "100vh",
					paddingLeft: "0px",
					paddingRight: "0px",
				}}
			>
				{loading && (
					<div className="row">
						<div className="col-12 d-flex justify-content-center">
							<div
								className="spinner-grow"
								style={{ width: "3rem", height: "3rem", alignSelf: "center" }}
								role="status"
							>
								<span className="visually-hidden">Loading...</span>
							</div>
						</div>
					</div>
				)}

				{!loading && (
					<>
						<div className="header-div" style={{ backgroundColor: "#F3F2EF" }}>
							<div className="no-padding header-slider"
								 style={{
									 backgroundImage: `url('https://objects.plydot.com/file/1016/ugflag.png')`,
									 backgroundSize: 'cover',
									 width: '100%',
									 height: '100%'
								 }}>
								{/*<p>*/}
								{/*	{`The ${showDeaths ? 'Deaths' : 'Births'} registry statistics`}*/}
								{/*	{Object.keys(currentIndicators).map((ky) => (*/}
								{/*		<>*/}
								{/*			<span> | {startCase(ky)}:</span>*/}
								{/*			<span*/}
								{/*				style={{*/}
								{/*					fontWeight: "800",*/}
								{/*				}}*/}
								{/*			>*/}
								{/*				{store.yearsData[currentIndicators[ky]]*/}
								{/*					? store.yearsData[currentIndicators[ky]]*/}
								{/*					: "---"}*/}
								{/*			</span>*/}
								{/*		</>*/}
								{/*	))}*/}
								{/*</p>*/}
							</div>

							{/* SUMMARY CARDS */}
							<div className="header-summary-divs-container">
								<VerticalSwitch options={["Births", "Deaths"]} onChange={toggleBirths} />
								<div style={{
									flex: 1,
									display: "flex",
									justifyContent: "flex-end"
								}}>
								{Object.keys(currentIndicators).map((ky, index) => (
									<div
										className={`sum-card summary-card-${index + 1}`}
										key={index}
										style={{
											display: "flex",
											alignItems: "center",
											border: "1px solid rgba(0,0,0,.175)",
											// flexDirection: "column",
											borderRadius: "0.375rem",
											justifyContent: "center",
										}}
										>
										<p>{startCase(ky)}:</p>
										<span
											style={{
												width: "100%",
												fontWeight: "800",
											}}
										>
											{store.yearsData[currentIndicators[ky]]
												? store.yearsData[currentIndicators[ky]]
												: "---"}
										</span>
									</div>
								))}
								</div>
							</div>
						</div>

						{/* GRAPHS & MAP */}
						<div className={`main-div`}>
							{/* GRAPHS CONTAINER */}
							<div className="graphs-container">
								<div className="grid-elem-upper">
									{/* LINE-GRAPH */}
									<div className="card grid-elem grid-item-1">
										<div className="card-body" style={{ padding: 0 }}>
											{showDeaths ? (
												<HighchartsReact
													containerProps={{ style: { height: "100%" } }}
													highcharts={Highcharts}
													options={store.lineChartDeathData}
												/>
											) : (
												<HighchartsReact
													containerProps={{ style: { height: "100%" } }}
													highcharts={Highcharts}
													options={store.lineChartBirthData}
												/>
											)}
										</div>
									</div>

									{/* COLUMN CHART */}
									<div className="card grid-elem grid-item-2">
										<div className="card-body" style={{ padding: 0 }}>
											{showDeaths ? (
												<HighchartsReact
													containerProps={{ style: { height: "100%" } }}
													highcharts={Highcharts}
													options={store.totalDeathsByGenderChartData}
												/>
											) : (
												<HighchartsReact
													containerProps={{ style: { height: "100%" } }}
													highcharts={Highcharts}
													options={store.totalBirthsByGenderChartData}
												/>
											)}
										</div>
									</div>
								</div>

								{/* STACKED-CHART */}
								<div className="grid-elem-lower">
									<div className="card grid-elem grid-item-3">
										<div className="card-body" style={{ padding: 0 }}>
											{showDeaths ? (
												<HighchartsReact
													containerProps={{ style: { height: "100%" } }}
													highcharts={Highcharts}
													options={store.totalDeathStackedChartData}
												/>
											) : (
												<HighchartsReact
													containerProps={{ style: { height: "100%" } }}
													highcharts={Highcharts}
													options={store.totalBirthStackedChartData}
												/>
											)}
										</div>
									</div>

									{/* PIE-CHART */}
									<div className="card grid-elem grid-item-4">
										<div className="card-body" style={{ padding: 0 }}>
											{showDeaths ? (
												<HighchartsReact
													containerProps={{ style: { height: "100%" } }}
													highcharts={Highcharts}
													options={store.deathByGenderChartData}
												/>
											) : (
												<HighchartsReact
													containerProps={{ style: { height: "100%" } }}
													highcharts={Highcharts}
													options={store.birthByGenderChartData}
												/>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* MAP CONTAINER */}
							<div className="card map-container">
								<div className="card-body">
									
									<UgandaRegions showDeaths={showDeaths} />

									{/* <HighchartsReact
										containerProps={{ style: { height: "100%" } }}
										highcharts={Highcharts}
										constructorType={"mapChart"}
										options={store.mapChartOptions}
									/> */}
								</div>

								<span
									onClick={() => {
										if (!isFullScreen) {
											handle.enter();
										} else {
											handle.exit();
										}
										setIsFullScreen(!isFullScreen);
									}}
									style={{
										position: "absolute",
										right: "0",
										bottom: "0",
									}}
								>
									{!isFullScreen ? (
										<Icon path={mdiFullscreen} size={2} color="gray" />
									) : (
										<Icon path={mdiFullscreenExit} size={1} color="gray" />
									)}
								</span>
							</div>
						</div>
					</>
				)}
			</div>
		</FullScreen>
	);
});
