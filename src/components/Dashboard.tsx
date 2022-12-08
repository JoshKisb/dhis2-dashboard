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

highchartsMap(Highcharts);

export const Dashboard = observer(() => {
	const [loading, setLoading] = useState(true);
	const store = useStore();

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
		<div className="pt-2">
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
				<div className="marquee">
					<p>Hey look at me am a marqueeeeeeee!!!!!!!!!!!!!!!!!!!!!!!. Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis accusamus soluta, earum consequatur suscipit hic atque laudantium esse veniam doloremque magnam. Fuga quasi perferendis cumque, placeat ut sequi iste hic?</p>
				</div>
				<div className="dashboard">
					<div className="row">
						<div className="col-md-3 mb-3">
							<div className="card">
								<div className="card-body">
									<h4>
										{
											store.yearsData[
												indicatorMap.femaleBirths
											]
										}
									</h4>
									Female Births
								</div>
							</div>
						</div>

						<div className="col-md-3 mb-3">
							<div className="card">
								<div className="card-body">
									<h4>
										{
											store.yearsData[
												indicatorMap.maleBirths
											]
										}
									</h4>
									Male Births
								</div>
							</div>
						</div>

						<div className="col-md-3 mb-3">
							<div className="card">
								<div className="card-body">
									<h4>
										{
											store.yearsData[
												indicatorMap.femaleDeaths
											]
										}
									</h4>
									Female Deaths
								</div>
							</div>
						</div>

						<div className="col-md-3 mb-3">
							<div className="card">
								<div className="card-body">
									<h4>
										{
											store.yearsData[
												indicatorMap.maleDeaths
											]
										}
									</h4>
									Male Deaths
								</div>
							</div>
						</div>
					</div>

					<div className="row charts h-100">
						<div className="col-md-12 mb-3 h-100">
							<div className="row parent">
								<div className="card div1">
									<div className="card-body">
										<HighchartsReact
											highcharts={Highcharts}
											options={store.lineChartData}
										/>
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
											options={
												store.deathByGenderChartData
											}
										/>
									</div>
								</div>

								<div className="card div4">
									<div className="card-body">
										<HighchartsReact
											highcharts={Highcharts}
											options={
												store.totalDeathsByGenderChartData
											}
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
