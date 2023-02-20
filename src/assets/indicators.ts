

export const birthIndicators = {
	birthsNotified: "Z64hUZUifEF",
	birthsRegistered: "nq7BDH3XeKc",
	birthsCertified: "DKym5hy9DA2",
}

export const deathIndicators = {
	deathsNotified: "vU8Ofttev65",
	deathsCertified: "T6TTjdahYxL",
	registeredDeaths: "hIYU0NgVZt8",
}

export const chart4 = {
	i2: "Yx4GBhbQKMM",
	i3: "FGQBsDGjTLh",
}

export const indicatorMap = {
	...birthIndicators,
	...deathIndicators,
	ubosProjections: "d7pS20J9g1J",
	femaleBirths: "LcAGxRIRG1m",
	maleBirths: "ihAAgZ8OjGE",
	femaleDeaths: "JDygTkWCxQU",
	maleDeaths: "CFMGxtTBf6m",

	tbirthsNotified: "F2XcahLFxzP",
	tbirthsProjection: "d7pS20J9g1J",
	tbirthsRegistered: "md7brKHLz83",
	tbirthsCertified: "SMuLVvnPIpm",
	...chart4
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
