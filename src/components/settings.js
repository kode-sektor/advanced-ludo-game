
let defaultSettings = {};

const players = ["PLAYER_ONE", "PLAYER_TWO", "PLAYER_THREE", "PLAYER_FOUR"];

const playerOneBase = {
	base: [0, 1],
	COM: false
};
const playerTwoBase = {
	base: [2, 3],
	COM: true
};
const playerThreeBase = {
	base: [],
	COM: false
};
const playerFourBase = {
	base: [],
	COM: false
};

defaultSettings = {
	key: "PLAYER_",
	numberOfPlayers: 2,
	playerSelection: "ONE_PLAYER_WITH_COM",
	playerSelections: {
		ONE_PLAYER_WITH_COM: {
			[players[0]]: playerOneBase,
			[players[1]]: playerTwoBase,
		},
		TWO_PLAYERS: {
			[players[0]]: playerOneBase,
			[players[1]]: playerTwoBase
		},
		TWO_PLAYERS_WITH_COM: {
			[players[0]]: playerOneBase,
			[players[1]]: playerTwoBase,
			[players[2]]: playerThreeBase
		},
		THREE_PLAYERS: {
			[players[0]]: playerOneBase,
			[players[1]]: playerTwoBase,
			[players[2]]: playerThreeBase
		},
		THREE_PLAYERS_WITH_COM: {
			[players[0]]: playerOneBase,
			[players[1]]: playerTwoBase,
			[players[2]]: playerThreeBase,
			[players[3]]: playerFourBase
		},
		FOUR_PLAYERS: {
			[players[0]]: playerOneBase,
			[players[1]]: playerTwoBase,
			[players[2]]: playerThreeBase,
			[players[3]]: playerFourBase
		}
	}
}

const userSettings = {};

export const settings = {
	...defaultSettings, ...userSettings
}