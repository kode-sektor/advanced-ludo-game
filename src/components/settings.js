
let defaultSettings = {};

export const players = ["PLAYER_ONE", "PLAYER_TWO", "PLAYER_THREE", "PLAYER_FOUR"];

export const bases = {
	PLAYER_ONE : {
		base: [0, 1],
		COM: false
	},
	PLAYER_TWO : {
		base: [2, 3],
		COM: true
	},
	PLAYER_THREE : {
		base: [],
		COM: false
	},
	PLAYER_FOUR : {
		base: [],
		COM: false
	}
}

defaultSettings = {
	turn: 0,
	key: "PLAYER_",
	numberOfPlayers: 2,
	playerSelection: "ONE_PLAYER_WITH_COM",
	playerSelections: {
		ONE_PLAYER_WITH_COM: {
			[players[0]]: bases.PLAYER_ONE,
			[players[1]]: bases.PLAYER_TWO,
		},
		TWO_PLAYERS: {
			[players[0]]: bases.PLAYER_ONE,
			[players[1]]: bases.PLAYER_TWO
		},
		TWO_PLAYERS_WITH_COM: {
			[players[0]]: bases.PLAYER_ONE,
			[players[1]]: bases.PLAYER_TWO,
			[players[2]]: bases.PLAYER_THREE
		},
		THREE_PLAYERS: {
			[players[0]]: bases.PLAYER_ONE,
			[players[1]]: bases.PLAYER_TWO,
			[players[2]]: bases.PLAYER_THREE
		},
		THREE_PLAYERS_WITH_COM: {
			[players[0]]: bases.PLAYER_ONE,
			[players[1]]: bases.PLAYER_TWO,
			[players[2]]: bases.PLAYER_THREE,
			[players[3]]: bases.PLAYER_FOUR
		},
		FOUR_PLAYERS: {
			[players[0]]: bases.PLAYER_ONE,
			[players[1]]: bases.PLAYER_TWO,
			[players[2]]: bases.PLAYER_THREE,
			[players[3]]: bases.PLAYER_FOUR
		}
	}
}

const userSettings = {};

export const settings = {
	...defaultSettings, ...userSettings
}