
const randomDice = () => {
	const diceValues = [];
	for (dicethrow = 0; dicethrow < 2; dicethrow++) {
		diceValues.push(Math.round(Math.random() * 5));
	}
	if (diceValues.splice(-2) == [6, 6]) {
		randomDice();
	}
};         