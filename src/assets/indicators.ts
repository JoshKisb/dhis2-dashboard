

export const birthIndicators = {
	totalBirths: "Z64hUZUifEF",
	femaleBirths: "zkMVFHEPvzC",
	maleBirths: "ihAAgZ8OjGE",
	birthsRegistered: "nq7BDH3XeKc",
	birthsCertified: "DKym5hy9DA2",
}

export const deathIndicators = {
	deathsNotified: "vU8Ofttev65",
	deathsCertified: "T6TTjdahYxL",
	registeredDeaths: "hIYU0NgVZt8",
}

export const indicatorMap = {
	...birthIndicators,
	...deathIndicators,
	femaleDeaths: "JDygTkWCxQU",
	maleDeaths: "CFMGxtTBf6m",
};

// just for reference

interface IndicatorInterface {
	id: string;
	displayName: string;
}
const programIndicators: IndicatorInterface[] = [
	{
		id: "T6TTjdahYxL",
		displayName: "Number Medically Certified Deaths Notified",
	},
	{
		id: "JDygTkWCxQU",
		displayName: "Number of Female Deaths Notified",
	},
	{
		id: "zkMVFHEPvzC",
		displayName: "Number of Female Live Births Notified",
	},
	{
		id: "ihAAgZ8OjGE",
		displayName: "Number of Male Live Births Notified",
	},
	{
		id: "CFMGxtTBf6m",
		displayName: "Number of male Deaths Notified",
	},
	{
		id: "Z64hUZUifEF",
		displayName: "Total Live Births Notified - mvrs",
	},
	{
		id: "vU8Ofttev65",
		displayName: "Total Number of  Deaths Notified",
	},
	{
		id: "DKym5hy9DA2",
		displayName: "Number Certified Live Births"
	}
];
