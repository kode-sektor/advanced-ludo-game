import { SIX_THROW, TOTAL_CELLS, bases, baseStartPositions } from '../data/constants.js';
import { settings, bases as baseSettings, players } from './settings.js'
import { seeds } from '../data/seeds.js'
import { computeHeadingLevel } from '@testing-library/react';

export const getRandomWithinRange = (min, max, int = false) => {
	let result = 0;
	if (int) {
		min = Math.ceil(min);
		max = Math.floor(max);
	}
	result = int ?	// Random integer otherwise float
		Math.floor(Math.random() * (max - min + 1)) + min :
		Math.round(((Math.random() * (max - min)) + min) * 100) / 100;
	
	// console.log("DICE VALUES : ", result);
	return result;	//
}

export const randomDice = (diceValues = []) => {
	let cycle = getRandomWithinRange(0, 1, true);
	// for (let dicethrow = 0; dicethrow < 2; dicethrow++) {
	// 	if (SIX_THROW) {	// Guarantee a six on either die
	// 		if (dicethrow === cycle) {
	// 			diceValues.push(6);
	// 		} else {
	// 			diceValues.push(getRandomWithinRange(1, 6, true));	// Between 1 and 6
	// 		}
	// 	} else {
	// 		diceValues.push(getRandomWithinRange(1, 6, true));	// Between 1 and 6
	// 		// Check for double-six (You will do this for the Ludo-bot)
	// 		/* if (dicethrow === 1) {
	// 			if (diceValues.slice(-2)[0] === 6 && diceValues.slice(-2)[1] === 6) {
	// 				this.randomDice(diceValues)
	// 			}
	// 		} */
	// 	}
	// }
	diceValues.push(6, 5);
	return diceValues;
}

// export const isDoubleSix = (dice) => {

// 	// Check if the last 2 dice asst values are double six
// 	const die1 = dice[1].asst[dice[1].asst.length - 1];
//     const die2 = dice[2].asst[dice[2].asst.length - 1];

//     console.log(`Rolled: ${die1}, ${die2}`);
//     return die1 === 6 && die2 === 6;
// }


export const getDiceCycle = () => {
	const cycleSteps = [];
	cycleSteps[0] = getRandomWithinRange(1, 3, true);	// 3
	cycleSteps[1] = getRandomWithinRange(1, 3, true);	// 3

	return cycleSteps;	// [1, 3]
}

export const getDiceTimeout = (cycleSteps) => {
	let timeoutSegment = 0;
	let randomTimeout = getRandomWithinRange(1.5, 3);
	// console.log("randomTimeout : ", randomTimeout);
	
	const diceTimeout = ([...Array(cycleSteps)].map((_, i) => 0 + i)).map((value, index) => {
		let pcntStepRollDuration = getRandomWithinRange(16.7 / 100, 80 / 100);	// Between 16.7% and 80%
		// console.log("pcntStepRollDuration : ", pcntStepRollDuration);
		// console.log("randomTimeout : ", randomTimeout);
		// console.log("timeoutSegment : ", timeoutSegment);
		// console.log("randomTimeout - timeoutSegment", (randomTimeout - timeoutSegment))

		/*
			WHAT WE WANT TO ACHIEVE
			- Imagine a 3-sequence roll of a die having a 3-second duration
			- Assume a flat random figure of 0.5, 0.5 and 0.5
				0.5 of (3 - 0) = 1.5s for 1st sequence
				0.5 of (3 - 1.5) = 0.75s for 2nd sequence
				0.5 of (3 - 1.5 - 0.75) = 0.375s for 3rd sequence
				
			- But remember total sequence must equal 3 seconds, and 1.5s + 0.75s + 0.375s = 2.625s
			- Hence the last sequence must be the total minus the 1st and 2nd sequence (3s - (1.5s + 0.75s)) = 0.75s
		*/
		/*
			The problem with this is that it increments the 
			timeoutSegment += pcntStepRollDuration * (randomTimeout - timeoutSegment);
			return timeoutSegment;
			Do the following instead:

			Take care of last loop to ensure 3rd sequence matches total specified duration (e.g. 3 seconds)
			By making pcntStepRollDuration = 1, this ensures the remaining sequence helps complete the 3-s duration
			because 1 is a whole number, not a fraction like the others
		*/
		pcntStepRollDuration = index === Array(cycleSteps).length - 1 ? 1 : pcntStepRollDuration;

		value = pcntStepRollDuration * (randomTimeout - timeoutSegment);
		timeoutSegment += value;
		return Math.round(value * 100) / 100;
	})
	return diceTimeout;
}

/*
	diceTimeout = [
		[1.08, 1.63]
		[1.3, 0.91]
	]
*/
export const computeDiceData = (diceTimeout) => {

	let diceTimeoutSlice = diceTimeout.slice();
	console.log("diceTimeout: ", diceTimeoutSlice);
	const timeout = [];
	const duration = [];
	const dice = [];

	let lastMaxCycle = false;

	/* 
		Control for switching the dice and transition. This is done because the code in computeMinDiceData()
		picks the first greater element as the max array. Hence the first timeout on die 1 will always be longer
		(spin longer) than die 2's. To distort this predictability, die 1 and die 2 will be switched at random

		To solve this, instead of generating a random number afresh, a part of the code is leveraged upon 
		".toFixed(1)" appended to take care of dicetimeout figures. The dicetimeout random figures are rounded to
		2 d.p but when its an integer, there's no decimal place. For e.g., the result is 2, not 2.00. So .toFixed(1)
		makes the results uniform.
	*/
	let dieFlip = (diceTimeout[0][0]).toFixed(1).slice(-1) < 5 ? false : true;	

	let dieRollOneSum = 0;
	let dieRollTwoSum = 0;
	let diceTimeoutSum = 0;
	let maxDiceTimeoutSum = 0;

	let minDiceCycle = [];
	let maxDiceCycle = [];

	// Ensure maxDiceCycle is the array with the larger first element
	if (diceTimeout[0][0] > diceTimeout[1][0]) {
		minDiceCycle = diceTimeout[1];
		maxDiceCycle = diceTimeout[0];
	} else {
		minDiceCycle = diceTimeout[0];
		maxDiceCycle = diceTimeout[1];
	}

	// Ensure maxDiceCycle's length is never shorter than minDiceCycle's length
	// This guarantees minDiceCycle's loops will be completed
	const diceCycleDifference = minDiceCycle.length - maxDiceCycle.length;
	if (diceCycleDifference > 0) {
		maxDiceCycle = maxDiceCycle.concat([0]);
	}
	dieRollOneSum += maxDiceCycle[0];
	dieRollTwoSum += minDiceCycle[0];

	// Since the idea is both dice are thrown at the same time, thus, on the first loop, both dice timeouts
	// must be calculated and set in state (later on)

	// Add the smaller of first values of the 2 arrays
	timeout.push(Math.min(dieRollOneSum, dieRollTwoSum));
	duration.push(
		[
			maxDiceCycle[0],
			minDiceCycle[0]
		]
	);
	dieFlip ? dice.push([1, 2]) : dice.push([2, 1]);
	diceTimeoutSum += Math.min(dieRollOneSum, dieRollTwoSum);
	minDiceCycle.shift();
	maxDiceCycle.shift();

	// Main code that packages the timeout, duration and corresponding dice
	// into arrays.
	const compileTimeout = (diff, dur, die) => {
		if (dieFlip) {	// Ensure die 1 and die 2 spin lengths are random
			if (die === 1) {
				die = 2;
			} else {
				die = 1;
			}
		}
		if (diff < 0.1) {
			timeout[timeout.length - 1] = timeout[timeout.length - 1] + diff;
			duration[duration.length - 1] = [duration[duration.length - 1], dur];
			dice[dice.length - 1] = [dice[dice.length - 1], die];
		} else {
			timeout.push(diff);
			duration.push(dur);
			dice.push(die);
		}
		diceTimeoutSum += diff;
	}

	const computeMinDiceData = () => {

		// Loop across the shorter of the 2 arrays
		for (let minDieCycle = 0; minDieCycle < minDiceCycle.length; minDieCycle++) {
			const currMinDieCycle = minDiceCycle[minDieCycle];
			// Calculate total duration of min array
			dieRollTwoSum += currMinDieCycle;

			if (dieRollOneSum > dieRollTwoSum) {
				if (lastMaxCycle && (minDieCycle === minDiceCycle.length - 1)) {
					maxDiceTimeoutSum = Math.max(dieRollOneSum, dieRollTwoSum);
					compileTimeout(maxDiceTimeoutSum - diceTimeoutSum, currMinDieCycle, 2);
				}
				else {
					compileTimeout(dieRollTwoSum - diceTimeoutSum, currMinDieCycle, 2);						
				}	
			} else {
				// If on last cycle on minDiceCycle and minDiceCycle is lengthier than maxDiceCycle,
				// use larger of two timeouts to calculate last timeout
				if (lastMaxCycle && (minDieCycle === minDiceCycle.length - 1)) {
					maxDiceTimeoutSum = Math.max(dieRollOneSum, dieRollTwoSum);
					compileTimeout(maxDiceTimeoutSum - diceTimeoutSum, currMinDieCycle, 2);
				} else if (lastMaxCycle) {
					compileTimeout(dieRollTwoSum - diceTimeoutSum, currMinDieCycle, 2);
				} else {
					compileTimeout(dieRollOneSum - diceTimeoutSum,  currMinDieCycle, 2);
				}
				/*
					Cut off looped items off minDice arrray which automatically
					exits loop and onto the maxDiceCycle (so long maxDiceCycle exists!)

					The current iteration of the parent array if 0 means the parent array (maxDiceArray) is 
					shorter than the child array (minDiceArray). Hence, if parent array is shorter,
					no dropping off this inner loop until the loops running on the inner is completed
				*/
				!lastMaxCycle && minDiceCycle.splice(0, minDieCycle + 1);	
			}
		}
	}
	// Loop across the lengthier of the 2 arrays
	for (let maxDieCycle = 0; maxDieCycle < maxDiceCycle.length; maxDieCycle++) {
		const currMaxDieCycle = maxDiceCycle[maxDieCycle];

		// Toggle 'lastMaxCycle' (watches for last cycle on parent loop if shorter than min array)
		// and switch true on first loop
		(currMaxDieCycle === 0) && (lastMaxCycle = true);
		/*
			This condition (before running loop on minDiceArray) exists here arising due to predictable steps
			during the loop process:
			First, the maxDiceArray is deliberately made the parent array and it has the larger first element
			of the 2 arrays. Hence (dieRollOneSum > dieRollTwoSum) will always hold true on the very first 
			loop.
			Second, because minDiceCycle's first element (dieRollSum) is the lesser value, this inner loop gets processed
			and based on the condition it's dieRollSums becomes greater, it then drops back to the parent array.
			Third, after processing in the parent array, the condition to throw the process back into the inner array
			is the condition being dieRollOneSum is larger than dieRollTwoSum. If it's not, the loop keeps running only
			on the parent array, eschewing the inner array
		*/
		if (dieRollOneSum > dieRollTwoSum) {
			computeMinDiceData();
		}	

		// Skip if last element in parent array reaches. Remember 
		if (!lastMaxCycle) {
			/*
				An appended '0' to the maximum dice (parent) array is the condition where the minDiceArray has more
				elements. But why? Because there's a shift() method run on the array before the loop, thus if the 
				parent array had only one child, the whole loop process would not even run:
			*/
			// Condition to ensure ensuing code does not run when maxDiceArray elements are used up
			if (currMaxDieCycle !== 0) {
				/*Only loop across max dice array in the event min dice array completes cycles
				If max dice array completes cycles first, the min array (above) would run
				completely and not break out because it is a nested loop.*/
				dieRollOneSum += currMaxDieCycle;
			}
			if (minDiceCycle.length) {	// Child array still exists
				if (dieRollOneSum > dieRollTwoSum) {
					compileTimeout(dieRollTwoSum - diceTimeoutSum, currMaxDieCycle, 1);
				} else {
					compileTimeout(dieRollOneSum - diceTimeoutSum, currMaxDieCycle, 1);
				}
			} else {	// Child array no longer exists
				// Last cycle on both arrays
				if (maxDieCycle === maxDiceCycle.length - 1) {
					if (dieRollOneSum > dieRollTwoSum) {	// Use larger of die roll sums
						compileTimeout(dieRollOneSum - diceTimeoutSum, currMaxDieCycle, 1);
					} else {
						compileTimeout(dieRollTwoSum - diceTimeoutSum, currMaxDieCycle, 1);
					}
				} else {	// Child (minDiceArray completed) array but parent array loop continues
					compileTimeout(dieRollOneSum - diceTimeoutSum, currMaxDieCycle, 1);
				}
			}
			/*
				If maxDiceArray needs to loop twice in a series when minDiceArray is yet to complete loops,
				sidestep minDiceArray to run loop only on parent array and when done with loop running only
				on maxDiceArray, switch back into child loop.

				This has been explained extensively in the comments some lines above (at the start of the child loop)
				But this presents a structural problem because on the final loop on the parent array, the process
				cannot climb back into the child array.
				
				Unless of course, the inner loop was turned into a function and called here (last loop on maxDiceArray)
				just like so: (Must be placed at very bottom of parent loop)
			*/
			if (minDiceCycle.length && (maxDieCycle === maxDiceCycle.length - 1)) {
				computeMinDiceData();
				lastMaxCycle = true;	// Explicitly set flag because tracking last max diecycle by loop is tricky
			}
		}
	}
	return [timeout, duration, dice];
}

// export const getDiceVals = (index) => {
// 	let diceVals = [this.props.dice[1].value, this.props.dice[2].value];
// 	return diceVals[index];
// }

export const getDiceValues = (dice) => {
	const diceOneValues = dice[1].asst.map(item => item.value);
	const diceTwoValues = dice[2].asst.map(item => item.value);

	return [...diceOneValues, ...diceTwoValues];
}

export const getSixCount = (diceValues) => diceValues.filter(item => item===6).length;

export const checkSix = (dice) => {
	let diceOneAsst = dice[1].asst;
	let diceTwoAsst = dice[2].asst;

	return (
		diceOneAsst.some((die) => die.selected === true && die.disabled === false && die.value === 6) ||
		diceTwoAsst.some((die) => die.selected === true && die.disabled === false && die.value === 6) 
	)
}

export const calcMoveDistance = (dice) => {
	let diceOneAsst = Object.values(dice[1])[0];
	let diceTwoAsst = Object.values(dice[2])[0];

	const filteredDiceOneAsst = diceOneAsst.filter((die) => die.selected === true && die.disabled === false);
	const filteredDiceTwoAsst = diceTwoAsst.filter((die) => die.selected === true && die.disabled === false);

	const totalDiceOneAsst = filteredDiceOneAsst.reduce((total, { value }) => total + value, 0);
	const totalDiceTwoAsst = filteredDiceTwoAsst.reduce((total, { value }) => total + value, 0);
	
	return totalDiceOneAsst + totalDiceTwoAsst;
}

export const canBreakAway = (cell, dice) => {
	let inCamp = cell === null;	// Check token is home

	if (inCamp) {	// If not in home, check that either die is a 6. If so, token can move
		let sixThrow = false;
		sixThrow = dice[1].asst.some(({selected, disabled, value}) => selected === true && disabled === false && value === 6) ||
			dice[2].asst.some(({ selected, disabled, value }) => selected === true && disabled === false && value === 6);
		return sixThrow;
	} else {
		return true;
	}
}

export const calculateStack = (seeds, destination) => {
	const stackedCells = seeds.filter(({ cell }) => cell === destination);
	return stackedCells.length;
}

export const getSelection = () => {
	const selections = settings.playerSelections;
	const selection = selections[settings.playerSelection];
	return selection;	
	/*{
		PLAYER_ONE: playerOneBase,
		PLAYER_TWO: playerTwoBase,
	}*/
}

export const getNoOfPlayers = (abs=false) => {
	const key = settings.key;	// "PLAYER_"
	const noOfPlayers = settings.numberOfPlayers;
	if (abs) {
		return noOfPlayers;	// Return int 2, 3 or 4
	} else {
		if (noOfPlayers === 2) {
			return key + "TWO";	// PLAYER_TWO
		} else if (noOfPlayers === 3) {
			return key + "THREE";	// PLAYER_THREE	
		} else {
			return key + "FOUR";	// PLAYER_FOUR
		}
	}
}

// 0 -> 1 -> 2 -> 3 -> 0
export const setTurn = (turn) => turn < (settings.numberOfPlayers - 1) ? turn++ : 0;

export const getActivePlayers = () => players.slice(0, settings.numberOfPlayers);

// Make tokens active of whose turn it is to play
export const isActiveToken = (token, turn) => {

	const playerTurn = players[turn];	// "PLAYER_ONE"
	console.log(playerTurn);

	// Get the turn of player and enable current player's seeds but if 
	// current player is COM, disable all seeds
	let currBase = baseSettings[playerTurn].base;	// get current player base : [0, 1]
	currBase = Array.isArray(currBase) ? currBase : [currBase];
	
	// Check if token id e.g. 'SeedOne' is in active player's base array
	for (let baseItem = 0; baseItem < currBase.length; baseItem++) {
		let currBaseItem = bases[baseItem];	// ["seedOne", "seedTwo", "seedThree", "seedFour"]
		
		if (currBaseItem.indexOf(token) !== -1) {
			return true;
		};
	}
	return false;
}

// export const isUnderSiege = (base) => {
// 	let currBase = Array.isArray(base) ? base : Array(base);	// [0, 1]
// 	const siegeZone = [];

// 	for (let baseItem = 0; baseItem < currBase.length - 1; baseItem++) {
// 		let currBaseItem = getBase(currBase[baseItem]);	// ["seedOne", "seedTwo", "seedThree", "seedFour"]
// 		let currBasePoint = baseStartPositions[currBase[baseItem]];	// baseStartPositions[0], baseStartPositions[1]
// 		currBasePoint = (currBasePoint === 1) ? 52 : currBasePoint;

// 		// Generate the 6 cells behind portal starting cell
// 		for (let currStartCell = currBasePoint; currBasePoint < currBasePoint - 6; currBasePoint--) {
// 			siegeZone.push(currStartCell);	// 12, 11, 10, 9, 8, 7
// 		}
// 	}
	
// 	const opp = getOpp();
// 	let oppBase = opp.base;	// [0, 1]
// 	oppBase = Array.isArray(oppBase) ? oppBase : [oppBase];
// 	let oppBaseCollection = [];

// 	for (let oppBaseEntry = 0; base < oppBase.length; oppBaseEntry++) {
// 		let oppBaseItem = bases[oppBase[oppBaseEntry]];	// bases[0, 1][0] => ["seedOne", "seedTwo", "seedThree", "seedFour"]

// 		// Filter base from all tokens
// 		const filteredOppInSiege = Object.fromEntries(Object.entries(seeds).filter(([k]) => oppBaseItem.includes(k)));

// 		// Filter seeds whose values fall in range within 6 cells of COM starting cell
// 		const oppInSiege = Object.values(filteredOppInSiege).filter(siegeZone.includes(cell));
// 		oppBaseCollection.push(...oppInSiege);
// 	}
// 	return oppBaseCollection;
// }

// Get minimum allowable tokens for COM. Instead of selecting all tokens for computing all moves, 
// select minimum allowable tokens to avoid redundancy

export const getTokenKeys = (tokens) => {
	console.log(tokens);
	if (tokens.length > 0) {
		return tokens.map(item => Object.keys(item)[0]);
	} else {
		return [];
	}
}

export const getMinAllowableTokens = (dice) => {
	// const diceValues = getDiceValues(dice);
	// console.log(diceValues);
	const sixCount = getSixCount(dice);	// Occurrence of 6
	console.log(sixCount);

	const activeTokens = getTokenKeys(getActiveTokens());
	console.log(activeTokens);
	let inactiveTokens = [];

	const getInactiveTokens = (arr, num) => {
		const shuffled = arr.slice();
		let currentIndex = shuffled.length, randomIndex;

		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * arr.length);
			currentIndex--;

			// Swap elements
			[shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
		}
		return shuffled.slice(0, num);	
	}
	if (sixCount) {
		// Randomly pick seed in each base
		let inactiveAttackTokens = getInactiveAttackTokens();
		let inactiveDefenceTokens = getInactiveDefenceTokens();

		console.log(inactiveAttackTokens);
		console.log(inactiveDefenceTokens);

		for (let i = 0; i < 2; i++) {	// Loop across the 2 bases
			inactiveAttackTokens = getInactiveTokens(inactiveAttackTokens, sixCount);
			inactiveDefenceTokens = getInactiveTokens(inactiveDefenceTokens, sixCount);
		}
		console.log([...inactiveAttackTokens, ...inactiveDefenceTokens]);
		inactiveTokens = getTokenKeys([...inactiveAttackTokens, ...inactiveDefenceTokens]);
	}
	console.log(inactiveTokens);	
	return [...activeTokens, ...inactiveTokens];
}

export const getBase = (base) => {
	const result = [];

	if (Array.isArray(base)) {	// [0, 1]
		for (let baseIndex = 0; baseIndex < base.length; base++) {
			result.push([...bases[baseIndex]]);
		}
	} else if (typeof base === 'number') {	// 0
		result.push([...bases[base]]);
	} else if (base === "COM") {	
		const COM = Object.values(base).find(COM === true);
		const COMbase = COM.base;
		getBase(COMbase);
	} else {	// "PLAYER_ONE"

	}
	return result;	// ["seedOne", "seedTwo", "seedThree", "seedFour"]
}

export const getPlayer = (player="COM") => {
	const COM = player === "COM" ? true : false;
	return Object.keys(baseSettings).filter(item => baseSettings[item].COM === true && baseSettings[item].base.length !==0);
}

export const getCOM = () => Object.keys(baseSettings).filter(item => baseSettings[item].COM === true && baseSettings[item].base.length !==0);	// ["PLAYER_TWO"]

// Get opponents
export const getOpp = () => Object.keys(baseSettings).filter(item => baseSettings[item].COM === false && baseSettings[item].base.length !== 0);	// ["PLAYER_ONE"]

export const getAttackBaseIndex = (base) => Array.isArray(base) ? Math.max(...base) : null;	// Choose 1 from [0, 1] or return null

export const getDefenceBaseIndex = (base) => Array.isArray(base) ? Math.min(...base) : null;	// Choose 0 from [0, 1] or return null

export const getBaseIndex = (player="COM") => {
	const selectedPlayer = getPlayer(player);	// ["PLAYER_TWO"]
	return baseSettings[selectedPlayer].base;	// [2, 3]
}

// export const getBaseActive = (player="COM") => {
// 	const playerBase = getBases(player);
// 	console.log(playerBase);
// 	return playerBase.filter((cell) => cell !== null);
// }

export const getActiveTokens = (seeds, player="COM") => {
	let playerBase = getBases(player);
	console.log(playerBase);

	const activeTokens = playerBase.filter(seed => {
		const key = Object.keys(seed)[0]; 
		return seed[key].cell !== null;
	});
	console.log(activeTokens);
	return activeTokens;
}

export const getInActiveTokens = (seeds, player="COM") => {
	let playerBase = getBases(player);
	const inActiveTokens = playerBase.filter(seed => {
		const key = Object.keys(seed)[0]; 
		return seed[key].cell === null;
	});
	console.log(inActiveTokens);
	return inActiveTokens;
}

export const getInactiveAttackTokens = (seeds, player="COM") => {
	const attackBase = getAttackBase();
	console.log(attackBase);
	const inActiveAttackTokens = attackBase.filter(seed => {
		const key = Object.keys(seed)[0]; 
		return seed[key].cell === null;
	});
	console.log(inActiveAttackTokens);
	return inActiveAttackTokens;
}

export const getInactiveDefenceTokens = (player="COM") => {
	const defenceBase = getDefenceBase();
	console.log(defenceBase);
	const inActiveDefenceTokens = defenceBase.filter(seed => {
		const key = Object.keys(seed)[0]; 
		return seed[key].cell === null;
	});
	console.log(inActiveDefenceTokens);
	return inActiveDefenceTokens;
}

export const getActiveTokensCount = (player="COM") => { 
	const activeTokens = getActiveTokens(player);
	return activeTokens.length;
}

export const getInActiveTokensCount = (player="COM") => { 
	const inActiveTokens = getInActiveTokens(player);
	return inActiveTokens.length;
}

export const getAttackBase = (player="COM") => {
	const playerBaseIndex = getBaseIndex(player);
	const attackBaseIndex = getAttackBaseIndex(playerBaseIndex);
	let attackBase = getBase(attackBaseIndex);
	console.log(attackBase);
	
	attackBase = attackBase.flat().filter(key => seeds[key]).map(key => ({ [key]: seeds[key] })); 

	console.log(attackBase);
	return attackBase;
}

export const getDefenceBase = (player="COM") => {
	const playerBaseIndex = getBaseIndex(player);
	const defenceBaseIndex = getDefenceBaseIndex(playerBaseIndex);
	let defenceBase = getBase(defenceBaseIndex);
	defenceBase = defenceBase.flat().filter(key => seeds[key]).map(key => ({ [key]: seeds[key] })); 
	return defenceBase;
}

// Get base(s) of player by combining attack and defence bases of player
export const getBases = (player="COM") => {
	// [
	// 	['seedThirteen', 'seedFourteen', 'seedFifteen', 'seedSixteen'],
	// 	['seedNine', 'seedTen', 'seedEleven', 'seedTwelve']
	// ]
	let bases = [...getAttackBase(player), ...getDefenceBase(player)];
	console.log(bases);
	// bases = Object.fromEntries(
	// 	bases.flat().map(seedKey => [seedKey, seeds[seedKey]])
	// );
	return bases;
}

// export const getDefenceBase = (base) => {
// 	const defenceBaseIndex = getDefenceBaseIndex(base);
// 	const defenceBase = getBase(defenceBaseIndex);
// 	return defenceBase;
// }

// export const getCOMBaseIndex = () => {
// 	const COM = getCOM();
// 	return bases[COM].base;
// }

// export const getOppBaseIndex = () => {
// 	const opp = getOpp();
// 	return bases[opp].base;
// }

// export const getAttackBase = (player="COM") => {
	
// }

// export const getCOMAttackBase = () => {
// 	const COMBaseIndex = getCOMBaseIndex();
// 	const attackBase = getAttackBase(COMBaseIndex);
// 	return attackBase;
// }

// export const getOppAttackBase = () => {
// 	const OppBaseIndex = getOppBaseIndex();
// 	const attackBase = getAttackBase(OppBaseIndex);
// 	return attackBase;
// }

// export const getCOMDefenceBase = () => {
// 	const COMBaseIndex = getCOMBaseIndex();
// 	const defenceBase = getDefenceBase(COMBaseIndex);
// 	return defenceBase;
// }

// export const getOppDefenceBase = () => {
// 	const OppBaseIndex = getOppBaseIndex();
// 	const defenceBase = getDefenceBase(OppBaseIndex);
// 	return defenceBase;
// }

// export const getCOMBase = () => [...getCOMAttackBase(), ...getCOMDefenceBase()];

// export const getOppBase = () => [...getOppAttackBase(), ...getOppDefenceBase()];


// export const calcWeightedOdds = (limits, series=2) => {
// 	const {
// 		upperOddsLimit,
// 		lowerOddsLimit,
// 		upperAbsCellLimit,
// 		lowerAbsCellLimit,
// 		absCellDiff
// 	} = limits;
// 	const weightedOdds = [];
// 	const odds = lowerOddsLimit + ((absCellDiff - lowerAbsCellLimit) / (upperAbsCellLimit - lowerAbsCellLimit)) * (upperOddsLimit - lowerOddsLimit);
// 	const remOdds = 100 - odds;
// 	const factor = odds > remOdds ? Math.round((odds / remOdds), 2) : Math.round((remOdds / odds), 2);
// 	const progression = getProgression(factor, series);

// 	for (let count = 0; count < series; count++) {
// 		weightedOdds.push(progression * factor ^ count);
// 	}
// 	return weightedOdds;
// }

export const getProgression = (factor, series) => {
	let sum = 0;
	for (let count = 0; count < series; count++) {
		sum += factor^count;
	}
	return 100 / sum;	// 7.692
}

// export const calcThreatLevel = (dice) => {
// 	const COMBase = getBase(COM);

// 	// Get minimum die value 
// 	const minDieOne = Math.min(...(dice[1].asst).map(value => item.value));
// 	const minDieTwo = Math.min(...(dice[2].asst).map(value => item.value));

// 	const minDie = Math.min(minDieOne, minDieTwo)

// 	// Check for active COM seeds
// 	const COMActiveSeeds = COMBase.filter((active === true));

// 	// Ensure no active COM seed can cross opponent base with minimum single die value
// 	if (COMActiveSeeds) {
// 		const COMIndex = getBaseIndex("COM");
// 		const COMAttackBase = getAttackBase(COMIndex);
// 		const crossedMin = COMActiveSeeds.filter(({absCell}) => absCell + minDie > baseStartPositions[COMAttackBase]);

// 		if (!crossedMin) {
// 			// Filter 3 most advanced seeds
// 			let seedSelection = crossed.slice().sort((seedA, seedB) => seedA.absCell - seedB.absCell).slice(0, 3);
// 			let firstSeed = seedSelection[0];
// 			let secondSeed = seedSelection[1] ? seedSelection[1] : "";
// 			let thirdSeed = seedSelection[2] ? seedSelection[2] : "";

// 			let firstSeedID = firstSeed.id;
// 			let secondSeedID = secondSeed.id;
// 			let thirdSeedID = thirdSeed.id;

// 			// Next is to ensure that a combination of moves on the least possible dice values do not cross oppponent base

// 			if (secondSeed) {	
// 				let upperOddsLimit = 0;
// 				let lowerOddsLimit = 0;
// 				let upperAbsCellLimit = 0;
// 				let lowerAbsCellLimit = 0;

// 				// Right part of the illustration (13 is midpoint)
// 				if ((firstSeed.absCell - secondSeed.absCell) < 13) {
// 					upperOddsLimit = 25;
// 					lowerOddsLimit = 0;
// 					upperAbsCellLimit = 13;
// 					lowerAbsCellLimit = -12;
// 				} else {	// Left part of illustration
// 					upperOddsLimit = 100;
// 					lowerOddsLimit = 25;
// 					upperAbsCellLimit = 25;
// 					lowerAbsCellLimit = 13;
// 				}
// 				const absCellDiff = firstSeed.absCell - secondSeed.absCell;
// 				const oddArgs = { upperOddsLimit, lowerOddsLimit, upperAbsCellLimit, lowerAbsCellLimit, absCellDiff };
// 				const weightedOdds = calcWeightedOdds(oddArgs, thirdSeed ? 3 : 2);
// 				const randomisedWeightedOdds = randomiseWeightedOdds(weightedOdds);

// 			} else {	// If only 1 token, allot all dice values to sole token
// 				dice[1].asst.val.map((die, index) => {
// 					moves.push({
// 						firstSeedID: die.value,
// 						firstSeedID: dice[2].asst.value
// 					})
// 				})
// 			}
// 		}
// 	}
// }
const randomiseWeightedOdds = (weightedOdds, totOddsPcnt=100, oddSum=0, shuffledOdds=[]) => {
	if (weightedOdds) {
		let randomOddsPcnt = getRandomWithinRange(0, totOddsPcnt);	// Get random value between 0 and 100
		for (let odd = 0; odd < weightedOdds.length - 1; odd++) {
			let weightedOdd = weightedOdds[odd];	// Cache each cycle
			oddSum += weightedOdd;	// Turn [69.228, 23.077, 7.692]

			if (randomOddsPcnt < oddSum) {	// Check if random number is less than oddsSum
				shuffledOdds.push(weightedOdd);	// If so, store the odd in new array
				weightedOdds.slice(odd, 1);	// Delete same odd from weightedOdds
				totOddsPcnt -= weightedOdd;	
				randomiseWeightedOdds(weightedOdds, totOddsPcnt, oddSum, shuffledOdds);
			}
		}
	} else {
		return shuffledOdds;
	}
}

// const compareNestedArrays = (arr1, arr2) => {
// 	if (arr1.length !== arr2.length) return false;
  
// 	for (let i = 0; i < arr1.length; i++) {
// 		const sortedA = [...arr1[i]].sort();
// 		const sortedB = [...arr2[i]].sort();
	
// 		if (sortedA.length !== sortedB.length) return false;
	
// 		for (let j = 0; j < sortedA.length; j++) {
// 			if (sortedA[j] !== sortedB[j]) return false;
// 		}
// 	}
// 	return true;
// }

function areArraysEqual(arr1, arr2) {
	if (arr1.length !== arr2.length) return false;
  
	for (let i = 0; i < arr1.length; i++) {
	  const a = [...arr1[i]].sort((x, y) => x - y);
	  const b = [...arr2[i]].sort((x, y) => x - y);
  
	  if (a.length !== b.length) return false;
  
	  for (let j = 0; j < a.length; j++) {
		if (a[j] !== b[j]) return false;
	  }
	}
  
	return true;
}

export const generateMoves = (dice, tokens) => {

	/* 
	Integer Partition to 4 to prepare categorising array into chunks
	[1, 1, 1, 1] 
	[1, 1, 2] 
	[1, 2, 1] 
	[2, 1, 1] 
	[2, 2]
	[1, 3]
	[3, 1]
	[4]
	*/

	const partitionInt = (target, maxVal, suffix=[], partitions=[]) => {
		if (target === 0) {
			// Function to permute [1, 1, 2] to [1, 2, 1] and [2, 1, 1]
			const sameEntries = (suffix) => suffix.every(val => val === suffix[0]);
			
			if (sameEntries(suffix) || suffix.length <= 1) {
				partitions.push(suffix);
			} else {
				partitions.push(...permute(suffix));
			}
		} else {
			if (maxVal > 1) {
				partitionInt(target, maxVal - 1, suffix, partitions);
			}
			if (maxVal <= target) {
				partitionInt(target - maxVal, maxVal, [maxVal, ...suffix], partitions);
			}
		}
		return partitions;
	}

	const splinterPermutation = (partition, permutation, splintered) => {

		// console.log(partition, permutation)	// [[1,1], [2]] & [6, 5] (chunked permutation, dice roll)
		let partitionedPermutation = [];

		// Loop across partition
		for (let partitionEntry=0; partitionEntry < partition.length; partitionEntry++) {

			let splinteredItem = Array.from({ length: permutation.length }, () => []);  // [[], [], [], []]
			let splinterTemp = [];

			let prevPartitionSum = 0;
			let currPartitionSum = 0;
			
			let currPartition = partition[partitionEntry];
	
			// Loop across each partition entry
			for (let currPartitionEntry = 0; currPartitionEntry < currPartition.length; currPartitionEntry++) {
				let childPartition = currPartition[currPartitionEntry];
				let prevChildPartition = currPartition[currPartitionEntry - 1] === undefined ? 0 : currPartition[currPartitionEntry - 1] ;
	
				prevPartitionSum += prevChildPartition;
				currPartitionSum += childPartition;
	
				// Loop across permutation
	
				// Now slice dice from previous partition to current partition
				// ... and if no partition, make 0
	
				splinterTemp.push(
					permutation.slice(prevPartitionSum, currPartitionSum)
				);
				// console.log("currPartitionEntry : ", currPartitionEntry);
				// console.log("currPartition Length : ", currPartition.length - 1);
				if (currPartitionEntry === (currPartition.length - 1)) {
					splinteredItem[splinterTemp.length - 1].push(splinterTemp);
					// console.log(splinteredItem);
					
					// Compare previous partitioned permutation to current partitioned permutation  to prevent 
					// duplicated partitions. For instance [[1] [3, 4, 6]] and [[1] [4, 3, 6]] are the same because
					// it will result in the same move

					// Fetch last splintered entry. Splintered will be empty first because no partitioned entry
					// has been pushed inside
					const lastSplintered = splintered.at(-1); 
					let prevPartitioned = lastSplintered?.[permutation.length] ?? lastSplintered?.[permutation.length - 1];
					prevPartitioned = prevPartitioned?.find(inner => inner.length > 0);

					// alert("prevPartitioned: " + JSON.stringify(prevPartitioned, null, 2));
					// alert("splinterTemp: " + JSON.stringify(splinterTemp, null, 2));

					// alert ((JSON.stringify(prevPartitioned, null, 2)))

					if (prevPartitioned === undefined || !areArraysEqual(prevPartitioned, splinterTemp)) {
						partitionedPermutation.push(splinteredItem);
					} else {
						// alert ('matched');
					}
				}
			}
		}
		return partitionedPermutation;
	}
	
	const permuteDuplicates = (sequence, partition, splintered, permuted, curr, visited) => {
		// If current permutation is complete
		if (curr.length === sequence.length) {
			if (partition) {
				splintered.push(splinterPermutation(partition, curr, splintered));
				// console.log("SPLINTERED : ", splintered);
			} else {
				permuted.push([...curr]);
			}
		}
	
		for (let i = 0; i < sequence.length; i++) {
			if (visited[i]) { continue; }
			if (i > 0 && (sequence[i] == sequence[i - 1]) && !visited[i - 1]) { continue; }
	
			visited[i] = true; 
			curr.push(sequence[i]); 
			permuteDuplicates(sequence, partition, splintered, permuted, curr, visited);
	
			visited[i] = false;
			curr.pop(); 
		}
	}


	// GENERATE PERMUTATIONS OF ARRAY ENTRY LENGTH WITHOUT REPEAT
	/*
		[1, 2, 3, 4] => [1, 3, 2, 4], [1, 3, 4, 2], [1, 4, 2, 3]...
	*/

	const permute = (sequence, partition, splintered=[], permuted=[], curr=[], visited=[]) => {
		(sequence).sort(function(a, b)
			{return a - b}
		);
		for (let i = 0; i < sequence.length; i++) {
			visited.push(false);    // [false, false, false]
		}
		permuteDuplicates(sequence, partition, splintered, permuted, curr, visited);    // Find the distinct permutations of num
		return partition ? splintered : permuted;
	}

	const generateCombinations = (arr, size, maxSize, start, temp, combinations) => {
		if (temp.length === size) {
			if (temp.length <= maxSize) {
				combinations[temp.length - 1].push([...temp]);
			} else {
				return combinations;
			}
		}

		for (let i = start; i < arr.length; i++) {
			temp.push(arr[i]);  
			generateCombinations(arr, size, maxSize, i + 1, temp, combinations);
			temp.pop();
		}
		return combinations;
	}

	/*
		[1, 2, 3, 4] => 
		
		[1], 
		[2],
		[3],
		[4],
		[1, 2],
		[1, 3],
		[1, 4]...,
		[1, 2, 3],
		[1, 2, 4]...
		[1, 2, 3, 4]
		[1, 2, 4, 3]
		
	*/
	const combine = (sequence, maxSize, combinations=[], start=0, temp=[]) => {
		for (let i = 1; i <= sequence.length; i++) {
			generateCombinations(sequence, i, maxSize, start, temp, combinations);
		}
		return combinations;
	}


	// ['A']
	// ['B']
	// ['C']
	// ['D']
	// ['A', 'B']
	// ['A', 'C']
	// ['A', 'D']
	// ['B', 'C']
	// ['B', 'D']
	// ['C', 'D']
	// ['A', 'B', 'C']
	// ['A', 'B', 'D']
	// ['A', 'C', 'D']
	// ['B', 'C', 'D']
	// ['A', 'B', 'C', 'D']

	const combineMoves = (dice, tokens) => {
		const moves = [];
	
		// Combine permuted tokens and dice.
		// Loop across permuted tokens
		for (let token = 0; token < tokens.length; token++) {
			let tokenEntries = tokens[token];
			
			for (let tokenEntry = 0; tokenEntry < tokenEntries.length; tokenEntry++) {
				let tokenItem = tokenEntries[tokenEntry];
	
				// Match and cycle across corresponding array index in partitionPermutation (dice)
				for (let diceEntry = 0; diceEntry < dice.length; diceEntry++) {
					let diceEntries = dice[diceEntry];
	
					for (let diceEntry = 0; diceEntry < diceEntries.length; diceEntry++) {
						let diceItems = diceEntries[diceEntry];
	
						for (let diceItem = 0; diceItem < diceItems[token].length; diceItem++) {
							let diceChildren = diceItems[token][diceItem];
							moves.push(
								{
									token : tokenItem,
									dice : diceChildren
								}
							)
						}
					}
				}
			}
		}
		return moves;
	}

	// 1. CREATE PARTITIONINT
	let partition = partitionInt(dice.length, dice.length);
	console.log(partition);
	/*
		[1, 1, 1, 1]
		[1, 1, 2]
		[1, 2, 1]
		[2, 1, 1]
		[2, 2]
		[1, 3]
		[3, 1]
	*/

	// 2. PERMUTE DICE
	let permutedDice = permute(dice, partition);
	console.log(permutedDice);

	// 3. 
	const combinedTokens = Array.from(Array(dice.length), () => []);

	// 4. PERMUTE TOKENS
	let permutedTokens = combine(tokens, tokens.length, combinedTokens);
	console.log(permutedTokens);

	// 5. COMBINE MOVES
	let moves = combineMoves(permutedDice, permutedTokens);
	console.log(moves);

	return moves;

}


/*
	2 factors basically disqualify a move
	
	1. If possible total cell move distance (cell distance) exceeds total board cells (cellpath i.e 52)
	2. If inactive seed is not attributed to a 6 die throw
*/
const filterMoves = (seeds, dice) => {
	
	// Loop across tokens & dice simultaneously (they have same length)

	for (let seed = 0; seed < seeds.length; seed++) {
		let seedItem = seeds[seed];
		let diceItems = dice[seed];

		let dieItem = 0;
		let seedCellDistance = 0;
		
		for (let diceItem = 0; diceItem < dice.length; diceItem++) {
			dieItem += diceItems[diceItem];
			let seedCell = seedItem.cell;
			let seedActive = seedItem.breakout;

			seedCellDistance += seedCell;
			
			if (diceItem === diceItems.length) {
				if (seedCellDistance >= TOTAL_CELLS) {
					return false;
				} else {
					if (!seedActive) {
						if (!diceItems.includes(6)) {
							return false;
						}
					}
				}
			}
		}
	}
	return true;
}

// export const calculateRisk = () => {
	
// 	const COMActive = getCOMBaseActive();	// Get active COM tokens

// }

	
	
	
	let cellPath = 52;
	
	const COM = {
	  A: {
  		breakaway: [{ x: 3, y: 3}],
  		coordinates: [{ x: 0, y: 0}],
  		cell: 8,
  		risk : 0
  	},
  	B: {
  		breakaway: [{ x: 2, y: 3}],
  		coordinates: [{ x: 0, y: 0}],
  		cell: 13,
  		risk : 0
  	},
  	C: {
  		breakaway: [{ x: 3, y: 2}],
  		coordinates: [{ x: 0, y: 0}],
  		cell: 5,
  		risk : 0
  	},
  	D: {
  		breakaway: [{ x: 2, y: 2}],
  		coordinates: [{ x: 0, y: 0}],
  		cell: 19,
  		risk : 0
  	}
	}
	
	const player = {
    	E: {
    		breakaway: [{ x: 3, y: 3}],
    		coordinates: [{ x: 0, y: 0}],
    		cell: 1,
    		risk : 0
    	},
    	F: {
    		breakaway: [{ x: 2, y: 3}],
    		coordinates: [{ x: 0, y: 0}],
    		cell: 4,
    		risk : 0
    	},
    	G: {
    		breakaway: [{ x: 2, y: 3}],
    		coordinates: [{ x: 0, y: 0}],
    		cell: 10,
    		risk : 0
    	},
    	H: {
    		breakaway: [{ x: 2, y: 3}],
    		coordinates: [{ x: 0, y: 0}],
    		cell: 27,
    		risk : 0
    	}
	}
	
	function divmod(dividend, divisor) {
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    return [quotient, remainder];
  }
	
  function calculateDiceOdds (targetTotal, targetDieNumber) {
    targetDieNumber = (targetDieNumber === null) && targetTotal;
    if (targetDieNumber < 1 || targetDieNumber > 6) {
      throw new Error("Die number must be between 1 and 6");
    }
  
    if (targetTotal < 2) {
      throw new Error("Total sum must be between 2 and 12");
    }
    
    if (targetTotal > 12) {
      const activePlayerTokensCount = Object.values(player).filter(val => val.cell > 0).length;
      let strikeOdds = 0;
      
      if (activePlayerTokensCount === 1) {
        const [quot, remainder] = divmod(targetTotal, 7);
        let medianStrideOdds = calculateDiceOdds(7); // Move in average of 7's
        if (remainder === 1) {
          let remStrideOdds = calculateDiceOdds(7 + 1);
          strikeOdds = Math.pow(medianStrideOdds, quot - 1) * remStrideOdds; 
        } else {
          let remStrideOdds = remainder === 0 ? 1 : calculateDiceOdds(remainder);
          strikeOdds = Math.pow(medianStrideOdds, quot) * remStrideOdds;
        }
      }
    } else {
      let totalOutcomes = 0;
      let favorableOutcomes = 0;
    
      for (let die1 = 1; die1 <= 6; die1++) {
        for (let die2 = 1; die2 <= 6; die2++) {
          totalOutcomes++;
    
          const hasTargetNumber = die1 === targetDieNumber || die2 === targetDieNumber;
          const isTargetTotal = die1 + die2 === targetTotal;
    
          if (hasTargetNumber || isTargetTotal) {
            favorableOutcomes++;
          }
        }
      }
      
    }
  
    const probability = targetTotal > 12 ? strikeOdds : (favorableOutcomes / totalOutcomes);
    const percentage = (probability * 100).toFixed(2);
  
    return percentage;
  }
  
  const getRisk = (COMCell, playerCell, breakout=false) => {
    // Base risk from proximity
    // Calculate risk 
    // [(total cells - cell difference) / total cells] * 100%
    const strikeRange = Math.abs(COMCell - playerCell);
    let risk = (((cellPath - strikeRange) / cellPath) * 100).toFixed(2);
    risk = breakout && (11/36) * risk;
    risk = parseFloat(risk);
  
    // Apply diminishing effect
    // Account for ∑risk:
    // risk% * [100% - ∑risk]
    adjustedRisk = (risk / 100) * remainderRisk;
    
    
    // Strike odds risk (bonus risk if within strike range)
    // The proximity of a token is a risk itself. The actual strike probability is also another risk by itself.
    // Calculate the cell distance it takes to make a dislodge, calculate the odds of getting that distance 
    // with the dice toss, then make it a factor of the risk. For instance, if it takes 6 to make a dislodge,
    // and its a 50% odds of getting 6, then the 50% would be used to apply the diminishing Cumulative efffect
    // by multiplying it with the remaining risk
  
    // Why is this important? Because proximity is not a total representation of risk. By way of odds, its more 
    // difficult to get a '1', than 3 or 5. Thus the strike odds must be factored in, too. 
    if (cellWithinStrikeRange(COMCell, playerCell)) {
      let strikeOdds = calculateDiceOdds(strikeRange); // e.g., 6 = 5/36
      strikeOdds = breakout && (11/36) * strikeOdds;
      adjustedRisk *= strikeOdds;
    }
    
    return adjustedRisk;
  }
  
  function calculateRisk ({
    COMCell,
    playerCell,
    cellPath,
    remainderRisk = 100,
    COMRisk = 0,
    cellWithinStrikeRange,
    breakout = false
  }) {
    
    let adjustedRisk = 0;
    
    if (breakout) {
      adjustedRisk = getRisk(COMCell, playerCell, true);
    } else {
      // Calculating risk for in-portal tokens
      if (COMCell > 50) {
        // Filter 2 in-portal tokens with most distance to clearance. In other words 
        // select the 2 least tokens greater than 50
        
        const sortedInPortalCOMTokens = filteredCOM.sort(([, a], [, b]) => a.cell - b.cell);
        const smallestInPortalCOMTokens = sortedInPortalCOMTokens.slice(0, 2);
        
        let numerator = 0;
        let denominator = 56 * 2; // since you want fraction over 56 + 56 = 112
        
        for (const [key, val] of smallestInPortalCOMTokens) {
          numerator += (56 - val.cell);
        }
        adjustedRisk = 1 - (numerator / denominator);
        
      } else {
        adjustedRisk = getRisk(COMCell, playerCell, false);
      }
    }
    
    console.log("Adjusted risk:", adjustedRisk.toFixed(2));
    console.log("Cumulative COMRisk:", COMRisk.toFixed(2));
    console.log("Remaining risk pool:", remainderRisk.toFixed(2));
  
    return adjustedRisk;
  }
  
  
  const cellWithinStrikeRange = (COMCell, playerCell) => COMCell - playerCell < 12; 
  
  const breakoutOdds = 11/36;
  const defenceBreakoutSpot = 3.5;
  const attackBreakoutSpot = 17.5;
  
  const midBreakoutSpot = (attackBreakoutSpot + defenceBreakoutSpot) / 2;
	
  // Filter COM in-portal tokens
  const sortedCOMEntries = Object.entries(COM);
  const inPortalCOMEntries = sortedCOMEntries.filter(([key, val]) => val.cell > 50);
  
  // Sort > 50 by ASC 
  const sortedInPortalCOM = inPortalCOMEntries.sort((a, b) => a[1].cell - b[1].cell);
  
  // ✅ Corrected: Create a Set of keys
  const inPortalCOMTokens = new Set(sortedInPortalCOM.map(([key]) => key));
  
  // Combine out-of-portal COM tokens (first) with in-portal COM tokens (last, sorted)
  const sortedCOMTokens = [
    ...sortedCOMEntries.filter(([key]) => !inPortalCOMTokens.has(key)),
    ...sortedInPortalCOM
  ];
  
	
	// Loop across COM 
  for (const comKey in sortedCOMTokens) {
    if (COM.hasOwnProperty(comKey)) {
      let COMCell = COM[comKey].cell; // Get absolute cell position
      let COMRisk = 0; // Why 0 & not COM[risk] value? Because it needs to be calculated fresh regardless of old COM risk value
      let remainderRisk = 100;
      
      // Sort Opp cell values from closest to farthest but check existence of Opp token that precedes
      // the COM token and within striking distance ( < 12), in other words can be struck in one cast of 
      // the dice. If more than one token satisfies these conditions, choose the closest.
      
      // This influences how the risk is calculated. If the odds of a strike is 40% from the closest preceding
      // token, that forms the bedrock for further cumulative risks to be calculated. The risk other tokens 
      // pose would be a factor of the remainder (100% - 40% = 60%) cumulatively. e.g, the 2nd Opp token if 30% danger (risk) to token would
      // then make a cumulative risk of 30% of 60% which is 18%. Cumulative risk would now be 50% + 15%
      const sortedPlayerEntries = Object.entries(player).sort(([, a], [, b]) => {
        return Math.abs(a.cell - COMCell) - Math.abs(b.cell - COMCell);
      });
      
      // Further filter only tokens within strike range (12 cells) from closest to farthest
      const playerTokensInStrikeRange = sortedPlayerEntries.
      filter(([_, val]) => val.cell < COMCell && val.cell > (COMCell - 12));
      
      console.log(playerTokensInStrikeRange);
      
      // Join tokens within strike range ranging from closest to remaining tokens, also ranging from closest
      const strikeRangeKeys = new Set(playerTokensInStrikeRange.map(([key]) => key));
      
      // Combine without repeating strike-range entries, with closest tokens within strike range coming first
      const sortedPlayerTokens = [
        ...playerTokensInStrikeRange,
        ...sortedPlayerEntries.filter(([key]) => !strikeRangeKeys.has(key))
      ];
      
      console.log(COMCell);
      console.log(sortedPlayerTokens);
      
      // Get last index to determine last cycle in loop
      const sortedPlayer = Object.fromEntries(sortedPlayerTokens);
      const sortedPlayerKeys = Object.keys(sortedPlayer);
      const sortedPlayerLastIndex = sortedPlayerKeys.length - 1;

      let breakoutFlag = false;
      let playerLoopCount = 0;
      let risk = 0;
      
      for (const playerKey in sortedPlayer) {
        if (player.hasOwnProperty(playerKey)) {
          
          if (!breakoutFlag) {
            let risk = calculateRisk ({
              COMCell: COM[comKey].cell,
              playerCell: player[playerKey].cell,
              cellPath,
            });
            
            let breakoutRisk = calculateRisk ({
              COMCell: COM[comKey].cell,
              // Assume Opp will breakout on defence base if COM token is at 9 or less; otherwise 
              // opp breaks out on attack base 
              playerCell: COM[comKey].cell > midBreakoutSpot ? attackBreakoutSpot : defenceBreakoutSpot,
              cellPath,
              breakOut: true
            });
          }

          if ((breakoutRisk.adjustedRisk > risk.adjustedRisk) && !breakoutFlag) {
            
            breakoutFlag = true;
            
            // Add breakout risk
            COMRisk += breakoutRisk.adjustedRisk;
            remainderRisk -= breakoutRisk.adjustedRisk;
            
            // Then in recursive function, calculate risk 
            let risk = calculateRisk ({
              COMCell: COM[comKey].cell,
              playerCell: player[playerKey].cell,
              cellPath,
              inPortalCOMTokens
            });
            
            COMRisk += risk.adjustedRisk;
            remainderRisk -= risk.adjustedRisk;
          } else {
            let risk = calculateRisk ({
              COMCell: COM[comKey].cell,
              playerCell: player[playerKey].cell,
              cellPath,
              inPortalCOMTokens
            });
            
            COMRisk += risk.adjustedRisk;
            remainderRisk -= risk.adjustedRisk;
          }
          
          if (playerLoopCount === sortedPlayerLastIndex ) {
            COM[comKey].risk = COMRisk; // Update risk value for COM token
            COMRisk = 0;
          }
          playerLoopCount++; 
        }
      }
    }
  }
  
  // console.log(COM);
	
	
	const getStrikeOdds = () => {
	  
	}
	
	
	
	
	
	
	
	const getStrikeOdds = () => {
	  
	}
	
	
	
	
	








