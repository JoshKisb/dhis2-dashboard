import React from "react";
import { DataQuery, useDataEngine } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import classes from "./App.module.css";
import "./styles.css";

import { Dashboard } from "./components/Dashboard";
import { Store, StoreContext } from "./stores";

const query = {
	me: {
		resource: "me",
	},
};

const MyApp = () => {

    const engine = useDataEngine();

	return (
		<div>
			<StoreContext.Provider value={new Store(engine)}>
				<DataQuery query={query}>
					{({ error, loading, data }) => {
						if (error) return <span>ERROR</span>;
						if (loading) return <span>...</span>;
						return (
							<>
								<Dashboard />
							</>
						);
					}}
				</DataQuery>
			</StoreContext.Provider>
		</div>
	);
};

export default MyApp;
