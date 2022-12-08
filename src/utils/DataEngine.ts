import { DataEngine, DataEngineLink } from "@dhis2/app-service-data/build/types/engine";

type Override<T, K extends { [P in keyof T]: any } | string> = K extends string
	? Omit<T, K>
	: Omit<T, keyof K> & K;

interface IDataEngine extends Override<DataEngine, "link"> {
	link: any;
}

export default IDataEngine;
