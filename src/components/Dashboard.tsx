import React, {useCallback} from "react";
import Icon from '@mdi/react';
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
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
import { indicatorMap } from "../assets/indicators";
// import map from "@highcharts/map-collection/custom/world.topo.json";
import { startCase } from "lodash";

highchartsMap(Highcharts);

export const Dashboard = observer(() => {
	const [loading, setLoading] = useState(true);
	const [isFullScreen, setIsFullScreen] = useState(true);
	const store = useStore();
	const handle = useFullScreenHandle();

	// Alter graphs
	const [showElement, setShowElement] = useState(true);
	useEffect(() => {
		setTimeout(function () {
			setShowElement(false);
		}, 5000);
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

	return (
		<FullScreen handle={handle}>
		<div
			className="page"
			style={{
				backgroundColor: "#F3F2EF",
				width: "100vw",
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
						<div className="marquee no-padding header-slider">
							<p>
								Welcome to Vital Events dashboard! Providing the Births and
								Death statistics per District of the Republic of Uganda.
							</p>
						</div>

						{/* SUMMARY CARDS */}
						<div className="header-summary-divs-container">
							{Object.keys(indicatorMap).map((ky, index) => (
								<div
									className={`summary-card-${index + 1}`}
									key={index}
									style={{
										display: "flex",
										alignItems: "center",
										border: "1px solid rgba(0,0,0,.175)",
										flexDirection: "column",
										borderRadius: "0.375rem",
										paddingTop: "1%",
									}}
								>
									<span
										style={{
											width: "100%",
											fontWeight: "800",
										}}
									>
										{store.yearsData[indicatorMap[ky]]
											? store.yearsData[indicatorMap[ky]]
											: "---"}
									</span>
									<span>{startCase(ky)}</span>
								</div>
							))}
						</div>
					</div>

					{/* GRAPHS & MAP */}
					<div className={`main-div`}>
						{/* GRAPHS CONTAINER */}
						<div className="graphs-container">
							<div className="grid-elem-upper">
								<div className="card grid-elem grid-item-1">
									<div className="card-body">
										{showElement ? (
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

								<div className="card grid-elem grid-item-2">
									<div className="card-body">
										<HighchartsReact
											containerProps={{ style: { height: "100%" } }}
											highcharts={Highcharts}
											options={store.totalDeathsByGenderChartData}
										/>
									</div>
								</div>
							</div>

							<div className="grid-elem-lower">
								<div className="card grid-elem grid-item-3">
									<div className="card-body">
										<HighchartsReact
											containerProps={{ style: { height: "100%" } }}
											highcharts={Highcharts}
											options={store.stackedChartData}
										/>
									</div>
								</div>

								<div className="card grid-elem grid-item-4">
									<div className="card-body">
										{showElement ? (
											<HighchartsReact
												containerProps={{ style: { height: "100%" } }}
												highcharts={Highcharts}
												options={store.birthByGenderChartData}
											/>
										) : (
											<HighchartsReact
												containerProps={{ style: { height: "100%" } }}
												highcharts={Highcharts}
												options={store.deathByGenderChartData}
											/>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* MAP CONTAINER */}
						<div className="card map-container">
							<div className="card-body">
								<HighchartsReact
									containerProps={{ style: { height: "100%" } }}
									highcharts={Highcharts}
									constructorType={"mapChart"}
									options={store.mapChartOptions}
								/>
							</div>
							<span
								onClick={()=>{handle.enter(); setIsFullScreen(!isFullScreen)}}
								style={{
									position: "absolute",
									right: "0",
									bottom: "0",
								}}
							>
								{(!isFullScreen)?
								<Icon path={mdiFullscreen} size={1} color="gray"/>
								:<Icon path={mdiFullscreenExit} size={1} color="gray"/>
								}
							</span>
						</div>
					</div>
				</>
			)}
		</div>
		</FullScreen>
	);
});
