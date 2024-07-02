export const seeds = {
	player: {
		childBase: ["baseOne", "baseTwo"]
	},
	com: {
		childBase: ["baseThree", "baseFour"]
	},
	baseOne: {
		seeds: ["seedOne", "seedTwo", "seedThree", "seedFour"]
	},
	baseTwo: {
		seeds: ["seedFive", "seedSix", "seedSeven", "seedEight"]
	},
	baseThree: {
		seeds: ["seedNine", "seedTen", "seedEleven", "seedTwelve"]
	},
	baseFour: {
		seeds: ["seedThirteen", "seedFourteen", "seedFifteen", "seedSixteen"]
	},
	seedOne: {
		breakout: [{ x: 3, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedTwo: {
		breakout: [{ x: 2, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedThree: {
		breakout: [{ x: 3, y: 2}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedFour: {
		breakout: [{ x: 2, y: 2}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedFive: {
		breakout: [{ x: 3, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedSix: {
		breakout: [{ x: 2, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedSeven: {
		breakout: [{ x: 3, y: 2}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedEight: {
		breakout: [{ x: 2, y: 2}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedNine: {
		breakout: [{ x: 3, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedTen: {
		breakout: [{ x: 2, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedEleven: {
		breakout: [{ x: 3, y: 2}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedTwelve: {
		breakout: [{ x: 2, y: 2}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedThirteen: {
		breakout: [{ x: 3, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedFourteen: {
		breakout: [{ x: 2, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedFifteen: {
		breakout: [{ x: 3, y: 2}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	},
	seedSixteen: {
		breakout: [{ x: 2, y: 2}],
		coordinates: [{ x: 0, y: 0}],
		cell: null
	}
}