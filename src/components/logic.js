
const randomDice = () => {
	const diceValues = [];
	for (let dicethrow = 0; dicethrow < 2; dicethrow++) {
		diceValues.push(Math.round(Math.random() * 5));
	}
};

const rollDice = (random) => {
	const rollAnimation = "rolling 3s"; // 1. First roll animation
	const diceValuePosition = ""; 

	setTimeout(() => {
		// 2. Then wait about the time your roll animation is done then apply transition to show exact die value
		switch (random) {
			case 1:
				diceValuePosition = "rotateX(0deg) rotateY(0deg)";
				break;

			case 6:
				diceValuePosition = "rotateX(180deg) rotateY(0deg)";
				break;

			case 2:
				diceValuePosition = "rotateX(-90deg) rotateY(0deg)";
				break;

			case 5:
				diceValuePosition = "rotateX(90deg) rotateY(0deg)";
				break;

			case 3:
				diceValuePosition = dice.style.transform = "rotateX(0deg) rotateY(90deg)";
				break;

			case 4:
				diceValuePosition = dice.style.transform = "rotateX(0deg) rotateY(-90deg)";
				break;

			default:
				break;
		}
	}, 3050);
};

