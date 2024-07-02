const players = ["PLAYER_ONE", "PLAYER_TWO", "PLAYER_THREE", "PLAYER_FOUR"];

let numberOfPlayers = 2;	

const playerSelections = {
	ONE_PLAYER_WITH_COM: [players[0], players[1]],
	TWO_PLAYERS: [players[0], players[1]],
	TWO_PLAYERS_WITH_COM: [players[0], players[1], players[2]],
	THREE_PLAYERS: [players[0], players[1], players[2]],
	THREE_PLAYERS_WITH_COM: [players[0], players[1], players[2], players[3]],
	FOUR_PLAYERS: [players[0], players[1], players[2], players[3]],
}
let defaultPlayerSelection = playerSelections.ONE_PLAYER_WITH_COM;
let defaultPlayerOneBase = [0, 1];
let defaultPlayerTwoBase = [2, 3];