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
	} else if (typeof base == "string") {	// "seedOne" => Get base by token Id

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

export const getBaseIndexByTokenId = (tokenId) => {	// "seedOne"
  	return bases.findIndex(base => base.includes(tokenId));	// 0, 1
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

export const getActiveTokensByBase = (base) => {
	let base = bases[base];
	const activeTokens = base.filter(seed => {
		const key = Object.keys(seed)[0]; 
		return seed[key].cell !== null;
	});
	return activeTokens;
}

export const getInActiveTokensByBase = (base) => {
	let base = bases[base];
	const inActiveTokens = playerBase.filter(seed => {
		const key = Object.keys(seed)[0]; 
		return seed[key].cell === null;
	});
	return inActiveTokens;
}

export const getActiveTokensCountByTokenId = (tokenId) => {
	const tokenBaseIndex = getBaseIndexByTokenId(tokenId);	// Get base of token first	// 0, 1
	const tokenBase = bases[tokenBaseIndex];
	const activeTokens = getactiveTokensByBase(tokenBase);
	return activeTokens.length;
}

export const getInactiveTokensCountByTokenId = (tokenId) => {
	const tokenBaseIndex = getBaseIndexByTokenId(tokenId);	// Get base of token first	// 0, 1
	const tokenBase = bases[tokenBaseIndex];
	const inactiveTokens = getInActiveTokensByBase(tokenBase);
	return inactiveTokens.length;
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
let portalPath = 5; 
let travelPath = cellPath + portalPath - 1;
let squadRisk = [];
const leastRiskyMoves = [];

// The formula is basePosition + cell or relCell = absCell
const com = {
  A: {
		breakaway: [{ x: 3, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		absCell: 8,
		relCell: 8,
		cell: 8,
	  basePosition: 0,
		risk : 0
	},
	B: {
		breakaway: [{ x: 2, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		absCell: 13,
		relCell: 13,
		cell: 13,
		basePosition: 0,
		risk : 0
	},
	C: {
		breakaway: [{ x: 3, y: 2}],
		coordinates: [{ x: 0, y: 0}],
		absCell: 42,
		relCell: 29,
		cell: 29,
		basePosition: 13,
		risk : 0
	},
	D: {
		breakaway: [{ x: 2, y: 2}],
		coordinates: [{ x: 0, y: 0}],
		absCell: 32,
		relCell: 19,
		cell: 19,
		basePosition: 13,
		risk : 0
	}
}

const opp = {
	E: {
		breakaway: [{ x: 3, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		absCell: 27,
	  relCell: 1,
		cell: 1,
		basePosition: 26,
		risk : 0
	},
	F: {
		breakaway: [{ x: 2, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		absCell: 30,
	  relCell: 4,
		cell: 4,
		basePosition: 26,
		risk : 0
	},
	G: {
		breakaway: [{ x: 2, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		absCell: 49,
	  relCell: 10,
		cell: 10,
		basePosition: 39,
		risk : 0
	},
	H: {
		breakaway: [{ x: 2, y: 3}],
		coordinates: [{ x: 0, y: 0}],
		absCell: 43,
	  relCell: 17,
		cell: 17,
		basePosition: 26,
		risk : 0
	}
}

const moves = [
  {
		token : [["A"], ["B"]],
		dice : [[4], [5]]
	},
  {
		token : [["A"], ["C"]],
		dice : [[4], [5]]
	},
  {
		token : [["B"], ["D"]],
		dice : [[4], [5]]
	},
  {
		token : [["C"], ["D"]],
		dice : [[4], [5]]
	},
];

const redistribute = (arr, factor = 0.08) => {
  const n = arr.length;
  const avg = arr.reduce((a, b) => a + b, 0) / n;

  const donors = arr.map(v => (v > avg ? v - avg : 0));
  const receivers = arr.map(v => (v < avg ? avg - v : 0));

  const totalGive = donors.reduce((a, b) => a + b, 0);
  const totalTake = receivers.reduce((a, b) => a + b, 0);

  return arr.map(v => {
    if (v > avg) return v - factor * (v - avg) * (totalTake / (totalGive || 1));
    if (v < avg) return v + factor * (avg - v);
    return v;
  });
}


const skewRisks = (risks) => {  // [60, 70, 80]
  const vals = risks.map(Number);
  const mn = Math.min(...vals); 
  const mx = Math.max(...vals);

  // handle degenerate cases
  if (mx === mn) {
    const n = vals.length;
    return { probs: Array(n).fill(1 / n), pick: vals[0] };
  }

  const spread = mx - mn; // 9
  console.log("spread : ", spread);
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length; // 64.66666666666667
  console.log("mean : ", mean);
  // automatic exponent: larger spread -> larger k -> stronger skew
  // single internal constant  (C = 4.0) chosen as a strong-but-reasonable amplifier
  const C = 4.0;
  const k = 1 + C * (spread / (mean + 1e-9)); // 1.5567010309192262
  console.log("k : ", k);

  // normalized distances 0..1
  let zs = vals.map(v => (v - mn) / spread);  // [0, 0.5555555555555556, 1]
  console.log("vals : ", vals);
  console.log("mn : ", mn);
  console.log("zs : ", zs);

  zs = redistribute(zs);  // [0.04148148148148148, 0.552592592592, 0.9614814814814815]
  console.log("zs : ", zs);

  // weights = (1 - z)^k  (min => 1^k = 1; far => small)
  const raw = zs.map(z => Math.pow(1 - z, k));
  console.log("raw : ", raw); // [0.9361759748025192, 0.2859231138240, 0.006285073625991439]

  const total = raw.reduce((s, x) => s + x, 0);
  const probs = raw.map(x => x / total);
  console.log("probs : ", probs); // [0.7621198673595774, 0.2327635951441, 0.005116537496271671]

  // weighted pick
  let r = Math.random();
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i];
    if (r <= 0) return { probs, pick: vals[i] };
  }
  return { probs, pick: vals[vals.length - 1] };
}

// console.log(skewRisks([60, 65, 69]));
// → probs ~ [0.87, 0.11, 0.02]


const getStartPosition = (mode, player="com") => {
  const baseIndex = getBaseIndex(player); // [2, 3]
  const modeBaseIndex = mode === "attack" ? getAttackBaseIndex(player) : getDefenceBaseIndex(player); // 
  const startPosition = baseStartPositions[modeBaseIndex];  // 1, 13, 26, 39
}

const withinStrikeRange = cellDistance => cellDistance < 12; 

const tokenInPortal = cell => cell > 50 ? true : false;
	
const sortRiskPlay = (play) => {
  const sortedKeys = Object.entries(play).sort((a, b) => a[1] - b[1]).map(entry => entry[0]);
  return sortedKeys;
}

function rearrangeCyclic(order, startKey) {
  const startIndex = order.indexOf(startKey);
  
  if (startIndex === -1) {
    throw new Error (`Invalid start key: ${startKey}`);
  }
  return order.slice(startIndex).concat(order.slice(0, startIndex));
}

function arraysEqual (arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every((value, index) => value === arr2[index]);
}

const getComActive = () => Object.entries(com)
  .filter(([key, value]) => value.cell > 0)
  .map(([key, value]) => ({ [key]: value }));

const getInActiveAttackTokens = (player=com) => {
  return [];
	const attackBase = getAttackBase();
	// console.log(attackBase);
	const inActiveAttackTokens = attackBase.filter(seed => {
		const key = Object.keys(seed)[0]; 
		return seed[key].cell === null;
	});
	// console.log(inActiveAttackTokens);
	// return inActiveAttackTokens;
}

const getInActiveDefenceTokens = (player=com) => {
  return [];
	const defenceBase = getDefenceBase();
	// console.log(defenceBase);
	const inActiveDefenceTokens = defenceBase.filter(seed => {
		const key = Object.keys(seed)[0]; 
		return seed[key].cell === null;
	});
	// console.log(inActiveDefenceTokens);
	// return inActiveDefenceTokens;
}

const getActiveTokens = (player=opp, exceptionKey=null) => {
  return Object.entries(player)
    .filter(([key, value]) => key !== exceptionKey && value.cell !== null)
    .map(([key, value]) => ({ [key]: value }));
};

const getMaxDieMove = (player=opp, exceptionKey=null, num=1, returnCell=true) => {
  // console.log(player, exceptionKey);
  // Sort activeTokens and get smallest
  const activeTokens = getActiveTokens(player, exceptionKey);
  const sorted = activeTokens
    .sort((a, b) => {
      const cellA = Object.values(a)[0].cell;
      const cellB = Object.values(b)[0].cell;
      return cellA - cellB; // ascending = least travelled first
    })
    .slice(0, num);
    
  // If user only wants the cell value(s) which is default
  if (returnCell) {
    if (sorted.length > 0) {
      let cell = Object.values(sorted[0])[0].cell;
      if (num === 1) {  // num === 1 for number type. Get distance between portal gateway and token as maxDieMove
        // But if cell is not < cellPath - 1, that means token is inside portal. maxDieMove will become 0
        return (cell < cellPath - 1) ? cellPath - 1 - cell : 0; // Token must not be in-portal
      } else {
        return sorted.map(obj => ((Object.values(obj)[0].cell) < cellPath - 1) ? (cellPath - 1 - Object.values(obj)[0].cell) : 0);
      }
    } else {
      return 0;
    }
  }
  return sorted;
};

const calculateAggregateRisk = (risks) => {
  /*if (!Array.isArray(risks) || risks.length === 0) {
    throw new Error("Input must be a non-empty array of numbers.");
  }*/
  if (Array.isArray(risks) && risks.length > 0) {
    const n = risks.length;
    const sumSquares = risks.reduce((sum, r) => sum + r ** 2, 0);
    const rms = Math.sqrt(sumSquares / n);
    return (1 - (rms / 5)) * 100; // percentage
  } else {
    return [];
  }
}

const computeRisk = (risks) => {
  console.log("risks : ", risks);
  const n = risks.length;

  // Step 1. Compute linear declining weights
  const rawWeights = risks.map((_, i) => (n - i) / n);

  // Step 2. Normalize so all weights sum to 1
  const total = rawWeights.reduce((a, b) => a + b, 0);
  const weights = rawWeights.map(w => w / total);

  // Step 3. Accumulate weighted risks progressively
  let cumulative = risks[0]; // first risk anchors the base

  for (let i = 1; i < n; i++) {
    cumulative += (100 - cumulative) * weights[i] * (risks[i] / 100);
  }

  return +cumulative.toFixed(4);
}

// Example:
// console.log(computeRisk(60, [20, 25, 10]));
// → { finalExposure: 70.2, totalIncrease: 10.2 }

const updateLeastRisky = (risk, leastRisky) => {
  if (leastRisky.length < 3) {
    leastRisky.push(risk);
    leastRisky.sort((a, b) => a - b); // maintain ascending order
  } 
  else if (risk < leastRisky[2]) {
    leastRisky[2] = risk;
    leastRisky.sort((a, b) => a - b);
  }
  
  // console.log(leastRisky); // [8.45, 12.90, 24.57]
}

/*const skewedRandomPick = (risks, alpha = 10) => {
  const min = Math.min(...risks);
  const max = Math.max(...risks);
  const mean = risks.reduce((a, b) => a + b, 0) / risks.length;
  const spread = (max - min) / mean; // normalized spread

  // Compute weights skewed to smaller values
  const weights = risks.map(r => Math.exp(-alpha * spread * (r - min)));

  // Normalize to probabilities
  const total = weights.reduce((a, b) => a + b, 0);
  const probs = weights.map(w => w / total);

  // Pick based on weighted probability
  let rand = Math.random();
  for (let i = 0; i < probs.length; i++) {
    rand -= probs[i];
    if (rand <= 0) return risks[i];
  }

  return risks[risks.length - 1]; // fallback
}*/


const computeBreakoutRisk = ({
  portalTokenCells,
  squadRisk,
  comActive,
  calculateAggregateRisk,
  computeRisk
}) => {
  
  /*
    Compute portal odds risk on very last loop. Will be appended last in squadRisk
    Recall portal token cells were simply saved in array. So to evaluate the risk, we simply want to delay any further movement
    inside the portal. Any move inside the portal, even a clearance, increases the risk because it reduces leverage for other tokens
    outside of portal. 5 is the max token portal cell while 0 (clearance) is the min. So if there are 2 in-portal tokens [5, 5], that's 
    the best possible scenario (0% risk). Now if there are 3 tokens [5, 5, 5], that's also 0% risk. But if the last array of 3 tokens 
    changes to [5, 5, 3], we've made it a bit riskier because we have reduced its leverage. Mind you, [5, 5] of 2 in-portal tokens is 
    less risky than [5, 5, 3].

    Root Mean Square provides the solution by skewing higher risks more heavily
    AggregateRisk = ((√ r1^2 + r2^2 + ... rn^2) / 5) * 100%;

    Important: If all the in-portal tokens make clearance, the portalRisk becomes 100% so long other out-of-portal tokens exist. But
    once there are no more out-of-portal tokens but inactive tokens, moving the in-portal tokens further still increases the risk because
    you want to hold out as much as possible until a '6' die is thrown to break out. But if all these conditions persist and all portal
    tokens clear, then portal risk resets (to 0).

  */

  const comCount = comActive.length;
  const squadRiskCount = squadRisk.length;
  console.log("comCount : ", comCount);
  console.log("squadRiskCount : ", squadRiskCount);

  let breakoutRisk = 0;

  // This condition checks if breakout risk runs for both attack and defence breakout tokens 
  // How does this work? There are active COM tokens. The supposed breakout tokens add either 1 or 2 tokens to squadRiskCount
  // Simply subtract activetokens (comCount) from squadRiskCount to get number of breakout tokens
  if (squadRiskCount - comCount === 2) {
    let squadRiskAttackEntry = [...squadRisk[squadRiskCount - 2], ...portalOddsRisk];
    let squadRiskDefenceEntry = [...squadRisk[squadRiskCount - 1], ...portalOddsRisk];
    // console.log("squadRiskAttackEntry : ", squadRiskAttackEntry)
    const breakoutAttackRisk = computeRisk(squadRiskAttackEntry[0], squadRiskAttackEntry.slice(1));
    const breakoutDefenceRisk = computeRisk(squadRiskDefenceEntry[0], squadRiskDefenceEntry.slice(1));
    breakoutRisk = Math.max(breakoutAttackRisk, breakoutDefenceRisk);
    
    // Remove breakout risk(s) from squad risk. Both have been computed and max gotten, max will be added back
    // Other squad risks have not yet been evaluated. Hence keep breakout separate, to be added later
    squadRisk.splice(-2);
  } else if (squadRiskCount - comCount === 1) { // Breakout risk runs for only either attack or defence breakout tokens
    // console.log("yes");
    let squadRiskEntry = squadRisk[squadRiskCount - 1];
    breakoutRisk = computeRisk(squadRiskEntry[0], squadRiskEntry.slice(1));
    squadRisk.splice(-1);
  }

  // console.log("SQUAD RISK : ", squadRisk);
  // console.log("BREAKOUT RISK: ", breakoutRisk);

  let portalOddsRisk = calculateAggregateRisk(portalTokenCells);  // First handle aggregate risk of portal tokens
  portalOddsRisk =  Array.isArray(portalOddsRisk) ? portalOddsRisk : [portalOddsRisk]
  // console.log("portalOddsRisk: ", portalOddsRisk);
  
  /*
    Squad risk is a collection of each token's risk and factors like (oddsRisk, progressFrac) influencing each risk
    squadRisk = [                         squadRisk = [
                  [80, 46, 44],                         [oddsRisk , progressFrac, startGapFrac],
                  [80, 46, 44]                          [oddsRisk , progressFrac, startGapFrac]
                ]                                     ]

    So portalOddsRisk comes last, even if it is bigger because it is the least influential amonst the remaining factors like 
    progressFrac, startGapFrac etc. and added to each array 
    squadRisk = [
                  [oddsRisk , progressFrac, startGapFrac, ...portalOddsRisk],
                  [oddsRisk , progressFrac, startGapFrac, ...portalOddsRisk]
                ]
  */
  
  for (let i = 0; i < squadRisk.length; i++) {
    for (let j = 0; j < squadRisk[i].length; j++) {
      const squadRiskEntry = [...squadRisk[i][j], ...portalOddsRisk];
      // console.log("squadRiskEntry : ", squadRiskEntry);
      // console.log("squadRisk [i, j] : ", squadRisk[i][j]);
      squadRisk[i][j] = computeRisk(squadRiskEntry);
    }
  }
  
  console.log("SQUAD RIsSK : ", squadRisk);

  /*SQUAD RISK :  [
    [ 46.4762, 51.342, 82.2138 ],
    [ 40.2304, 44.9491, 73.4357 ],
    [ 81.7478, 85.3982, 33.0036 ],
    [ 94.5439, 97.5993, 51.4728 ]
  ] to 
  SQUAD RISK :  [
    [ 46.4762, 51.342, 82.2138, 24.4422],
    [ 40.2304, 44.9491, 73.4357, 24.4422],
    [ 81.7478, 85.3982, 33.0036, 24.4422],
    [ 94.5439, 97.5993, 51.4728, 24.4422]
  ]
  where 24.222 is assumed breakoutRisk*/
  
  squadRisk = squadRisk.map(arr => {
    arr.push(breakoutRisk);   // add breakout risk to each subarray
    arr.sort((a, b) => b - a); // then sort from highest to lowest
    return computeRisk(arr);
  });
  
  // console.log("squadRisk : ", squadRisk);
  
  // [ 86.352, 78.867, 89.7066, 98.4573 ] to 99.1408
  squadRisk = computeRisk(squadRisk.sort((a, b) => b - a));
  // Get 3 least risky game moves. From these 3, one will be chosen
  const computedRisk = updateLeastRisky (squadRisk, leastRiskyMoves);
  console.log("least risky moves : ", leastRiskyMoves);
}

const getInActiveTokens = (com) => Object.fromEntries(
  Object.entries(com).filter(([_, val]) => val.cell === null)
);

const getLeastTravelledTokens = (player={opp}, num=1) => {
  const activeTokens = getActiveTokens(player);
  if (activeTokens) {
    return activeTokens.sort((a, b) => a[1].cell - b[1].cell).slice(0, num);
  } else {
    return 0;
  }
}

/*
  3-way function to calculate odds of dice. 
  
  - (targetTotal): Odds to get total distance. If cell distance is 26, it becomes odds of getting 12, and 12 and 2
  - (targetDieNumber): Odds of getting an absolute number, usually 6
  - (inActiveTokens): Instance where player gets a '6' and another die that dislodges opponent token
    The inActiveTokens means there is a camped token for a possible '6' move
*/

const calculateDiceOdds = (targetTotal, targetDieNumber, maxDieMove = 0, inActiveTokens=true) => {
  console.log(targetTotal, targetDieNumber, maxDieMove);
  // Get absolute die number, usually '6'
  const isMatch = (targetDieNumber, die1, die2) => targetDieNumber === die1 || targetDieNumber === die2;

  // Odds of getting a die number for a dislodge first, then ensuring 2nd die is an allowable move
  // No point in potentially dislodging an opponent but can't account for 2nd die move
  const isMatchMax = (targetDieNumber, maxDieMove, die1, die2) => 
    (targetDieNumber === die1 && maxDieMove <= die2) || 
    (targetDieNumber === die2 && maxDieMove <= die1);

  // Instance where player gets a '6' and another die that dislodges opponent token
  // The inActiveTokens means there is a camped token for a possible '6' move
  const isActiveCombo = (remainder, die1, die2) => 
    inActiveTokens && ((remainder === die1 && 6 === die2) || (remainder === die2 && 6 === die1));

  // Combination of both dice values to dislodge an opponent token. e.g. 2 and 3 to give cell distance of 5
  // Not used because this method was used instead : 
  // ways += (remainder > 0 && remainder < 7 ? remainder - 1 : 13 - remainder);
  const isSumMatch = (targetDieNumber, die1, die2) => die1 + die2 === targetDieNumber;

  
  if (targetTotal !== null || targetDieNumber !== null) {  
    if (targetTotal !== null) {
      // console.log(targetTotal)
      if (targetTotal < 1) {
        // console.log("Target total must be greater than 0")
        throw new Error("Target total must be greater than 0");
      }
    }
    if (targetDieNumber !== null) {
      // console.log("targetDieNumber : ", targetDieNumber)
      // targetDieNumber, i.e, single die value can't be less than 1 or greater than 6 
      if (targetDieNumber < 1 || targetDieNumber > 6) {
        // console.log("Die number must be between 1 and 6")
        throw new Error("Die number must be between 1 and 6");
      }
    }
  }

  let strikeOdds;
  let targetTotalOdds = 1;
  let ways = 0;
  let remainder = 1;
  let probDoubleSixes = 1;

  if (targetTotal && !Array.isArray(targetTotal)) {

    // If getInActiveTokens is defined elsewhere
    // const inactiveCount = getInActiveTokens(player);

    // Get odds for cell distance > 12 getting amount of 12 moves possible, and determining odds for the remainder
    // Why 12s? Because only double-six enables continuous play 
    // If > 12, divide moves in 12's and store remainder, whose odds will be calculated next
    if (targetTotal > 12) { 
      const doubleSixValue = 12;  // (6,6) sum
      const pDoubleSix = 1 / 36;  // probability of (6,6)
    
      const times = Math.floor(targetTotal / doubleSixValue);
      remainder = targetTotal % doubleSixValue;
    
      probDoubleSixes = Math.pow(pDoubleSix, times);  
    } else {
      remainder = targetTotal; 
    }
    
    // console.log("remainder : ", remainder);
    
    // If targetDieNumber (from method call) and remainder, targetDieNumber becomes an array holding both
    if (targetDieNumber) {
      // console.log("targetDieNumber : ", targetDieNumber);
      
      // (remainder <= 6) condition necessary because if cell distance > 6, isMatchMax & isActiveCombo are useless. 
      // If cell distance is 8, we can't find odds of say [8, 6] for isActiveCombo or say [8, 4] for maxDieMove
      if (remainder > 0 && remainder <= 6) { 
        targetDieNumber = [targetDieNumber, remainder];
      }
    } else {
      if (remainder > 0 && remainder <= 6) {
        targetDieNumber = remainder;  // Always needed to calculate isMatchMax and isActiveCombo for remainder.
      }
    }
    
    if (remainder > 0 && remainder < 13) {  // works same way as isSumMatch but isSumMatch will be used in latter
      // code for sake of dynamism
      ways += (remainder > 0 && remainder < 7 ? remainder - 1 : 13 - remainder);
    } 
    /*else {
      ways = 36;
    }*/

    // Only run when calculateDiceOdds is not called this way calculateDiceOdds(28, 6). The reason is if it's called 
    // that way, there may be some dice intersection when trying to work on the remainder. For instance the first 
    // parameter 28 will be worked on in the upper code section above 28 / 12 with remainder 4. Then immediately
    // above we get the number of 'ways' to get 4 which are [3, 1], [2, 2] etc. Now we also have to account for 
    // getting odds for isActiveCombo and isMatchMax like [4, 6] if inactiveTokens exist and [4, maxDieMove] for maxDieMove
    // on another token 
    
    if (remainder > 6) { // targetDieNumber won't trickle down if targetTotal > 6
      const probRemainder = ways / 36;
      
      // Return percentage probability
      targetTotalOdds = (probDoubleSixes * probRemainder).toFixed(6);
      strikeOdds = targetTotalOdds * 100;  
    }
    
    // console.log(strikeOdds);
    /*if (targetTotal && !targetDieNumber) {  // Return when calculateDiceOdds is called this way: calculateDiceOdds(24)
      return strikeOdds;
    }*/
    if (!targetDieNumber) {
      return strikeOdds;
    }
  } 

  // targetTotal as array not used
  if (targetDieNumber || Array.isArray(targetTotal)) {  
    let totalOutcomes = 0;
    let hasTargetNumber = false;
    let hasMatchNumber = false;
    let favourableMatchOutcome = 0;
    let favourableTargetOutcome = 0;

    if (Array.isArray(targetTotal)) { // Not used
      const [{ safeMoves }] = targetTotal;  
      const maxSafeMove = Math.max(...safeMoves);  
      const minSafeMove = Math.min(...safeMoves);  
    }
    
    for (let die1 = 1; die1 <= 6; die1++) {
      for (let die2 = 1; die2 <= 6; die2++) {
        totalOutcomes++;
        
        if (Array.isArray(targetDieNumber)) { // [targetDieNumber, remainder]
          // console.log("targetDieNumber is array");
          hasMatchNumber = isMatch(targetDieNumber[0], die1, die2); // treat odds to get targetDieNumber
          hasTargetNumber = ( // treat odds to get remainder
            isMatchMax(targetDieNumber[1], maxDieMove, die1, die2) || 
            isActiveCombo(targetDieNumber[1], die1, die2)
          );
        } else {  // either targetDieNumber or remainder
          // console.log(targetDieNumber);
          // console.log("targetDieNumber is not array")
          
          // Odds to get occurrence of targetDieNumber (targetTotal === null) or get odds 
          // for remainder (targetTotal !== null && remainder > 6)
          if (targetTotal === null || (targetTotal !== null && remainder > 6)) {
            hasMatchNumber = isMatch(targetDieNumber, die1, die2);
          } else {  // Odds to not get absolute but instead get like:
          // [strikeDistance, maxDieMove] or [breakaway (6), strikeDistance]
          // When targetTotal is part of the parameters, targetDieNumber changes from absolute (like getting '6' on either die),
          // to getting dice combinations
            hasTargetNumber = ( 
              isMatchMax(targetDieNumber, maxDieMove, die1, die2) || 
              isActiveCombo(targetDieNumber, die1, die2)
            );
          }
        }
        // console.log(hasMatchNumber);
        if (hasMatchNumber) {
          // console.log("hasMatchNumber");
          favourableMatchOutcome++;
        }
        if (hasTargetNumber) {
          // console.log("hasTargetNumber")
          favourableTargetOutcome++;
        }
      }
    }
    
    // Assume odds to get a 5 => For dice sum or what is called isSumMatch => [4, 1], [1, 4], [3, 2], [2, 3]. Then to get 
    // breakout and strike or what is called isActiveCombo => [6, 5], [5, 6]. Then odds to get a strike and allow for 
    // move on 2nd die or what is called isMatchMax => [5, 1], [1, 5], [5, 2], [2, 5], [5, 3], [3, 5], [5, 4], [4, 5]
    // [5, 5], [5, 6], [6, 5] 
    // Observe [6, 5] and [5, 6] are repeated twice. They will always repeat twice if maxDieMove >= 6 because 6 is 
    // responsible for breakout
    if (targetDieNumber && maxDieMove >= 6) {
      // console.log("dice intersection");
      // Never worry about incident favourableTargetOutcome -= 1. For instance, [1, 1] for isMatchMax means only one
      // favourableTargetOutcome right? But remember if there's no maxDieMove >= 6, there will be no dice repeat
      // because the dice repeat usually comes from '6' breakout (isActiveCombo) & isMatchMax of [1, 6], [6, 1]
      if (hasTargetNumber) favourableTargetOutcome -= 2;
    }
    
    // console.log(favourableMatchOutcome, favourableTargetOutcome);
    // console.log("ways : ", ways);
    
    const favourableMatchOdds = favourableMatchOutcome && (Number(((favourableMatchOutcome / totalOutcomes)).toFixed(6)));
    const favourableTargetOdds = favourableTargetOutcome && (Number((((favourableTargetOutcome + ways) / totalOutcomes) 
                                * probDoubleSixes).toFixed(6)));
    
    // console.log(favourableMatchOdds, favourableTargetOdds);
    
    let dieOrTargetTotalOdds = 0;
    if (favourableMatchOdds && favourableTargetOdds) {
      dieOrTargetTotalOdds = favourableMatchOdds * favourableTargetOdds;
      // console.log("a");
    } else {
      dieOrTargetTotalOdds = favourableMatchOdds || favourableTargetOdds;
      // console.log("b");
    }
    console.log("dieOrTargetTotalOdds : ", dieOrTargetTotalOdds)

    /*if (targetTotal) {
      console.log ("targetTotalOdds : ", targetTotalOdds);
      strikeOdds = targetTotalOdds * dieOrTargetTotalOdds;
    } else {
      strikeOdds = dieOrTargetTotalOdds;
    }*/
    
    strikeOdds = targetTotalOdds * dieOrTargetTotalOdds;
  }
  
  return strikeOdds * 100;
};

// console.log(calculateDiceOdds(8, 4, 4));

let breakoutCount = 2;  // Occurrence of inactive token in either opp base 
let inActiveAttackTokens = [];
let inActiveDefenceTokens = [];
let portalTokenCells = [];


const getRisk = (currCom, currOpp, comKey, oppKey, cellPath, travelPath, comLoopCount, oppLoopCount, breakout=false) => {
  let comCell = currCom.absCell;
  let oppCell = currOpp.absCell;
  let comBasePosition = currCom.basePosition;
  let oppBasePosition = currOpp.basePosition;
  // let cyclePath = cellPath - 1; // 50
  
  let cellDiff = 0;
  let strikeRange = 0;
  let risk = 0;
  let riskExposure = [];  
  
  // Get the fraction comCell and total cells
  let progressFrac = (comCell / cellPath) * 100;
  
  // console.log("comBasePosition & oppBasePosition : ", comBasePosition, oppBasePosition);
  // Get the difference of start positions of COM & opponent tokens as fraction of total cells
  let startGapFrac = oppBasePosition > comBasePosition ? cellPath - oppBasePosition + comBasePosition : oppBasePosition - comBasePosition;
  startGapFrac = (startGapFrac / cellPath) * 100;

  // Base risk from proximity
  // Token order to which risk exists:
  // opp token must be ahead of com token but before com's portal for com->opp risk to exist
  // com token must be ahead of opp token but before opp's portal for opp->com risk to exist
  const comExistentRiskPattern = ["comPortal", "comCell", "oppCell"];
  const oppExistentRiskPattern = ["oppPortal", "oppCell", "comCell"];
  
  // Now capture the values of the comCell, oppCell and portals for both tokens. The order does not matter for now
  const comToOppPlay = {
    "comCell" : comCell,
    "oppCell" : oppCell,
    "comPortal" : comBasePosition === 0 ? 50 : comBasePosition - 2  
  }
  const oppToComPlay = {
    "comCell" : comCell,
    "oppCell" : oppCell,
    "oppPortal" : oppBasePosition === 0 ? 50 : oppBasePosition - 2
  }
  
  // Now sort from least to greatest the values of com cell, opp cell and their portals, then retrieve the keys
  // e.g. ["comCell", "oppCell", "oppPortal"]
  const sortedComToOppKeys = sortRiskPlay(comToOppPlay);
  const sortedOppToComKeys = sortRiskPlay(oppToComPlay);
  
  // Now try to confirm if risk is com -> opp or opp -> com. Factor in symmetricity of array as it does not 
  // disqualify the risk e.g. ["comPortal" -> "comCell" -> "oppCell"] is same as ["comCell" -> "oppCell" -> "comPortal"]
    
  // We have the patterns, i.e, comExistentRiskPattern, oppExistentRiskPattern. The game values have been sorted. 
  // Now get the 1st key of both sorted game play, and rearrange the existing risk pattern arrays maintaining its symmetricity 
  const rearrangedComRiskPattern = rearrangeCyclic(comExistentRiskPattern, sortedComToOppKeys[0]);
  const rearrangedOppRiskPattern = rearrangeCyclic(oppExistentRiskPattern, sortedOppToComKeys[0]);
  
  // Now compare the rearranged risk patterns to the sorted keys, after resolving symmetricity issues
  const comToOppRisk = arraysEqual(sortedComToOppKeys, rearrangedComRiskPattern);
  const oppToComRisk = arraysEqual(sortedOppToComKeys, rearrangedOppRiskPattern);
  
  // console.log("sortedComToOppKeys : ", sortedComToOppKeys);
  // console.log("sortedOppToComKeys : ", sortedOppToComKeys);
  
  // The difference between oppCell and comCell is the difference required. The distance is required to calculate risk based on 
  // proximity. comToOppDiff means risk exposure when com is behind opp. oppToComDiff means risk exposure when opp is behind com.
  
  // For comToOppDiff, opp has to be ahead of com. Although ahead, its cell value may be lower due to the different relative 
  // start positions of tokens. If this is the case, add 51 (total cells) to the token ahead, and subtract previous token
  // So get both comToOppDiff and oppToComDiff, then select the minimum of each as cellDiff
  
  // console.log(comToOppRisk, oppToComRisk);
  let comToOppDiff = comToOppRisk === false ? comToOppRisk : (oppCell > comCell ? oppCell - comCell : oppCell + cellPath - comCell);
  let oppToComDiff = oppToComRisk === false ? oppToComRisk : (comCell > oppCell ? comCell - oppCell : comCell + cellPath - oppCell);
  // console.log("comCell & oppCell : ", comCell, oppCell);
  // console.log("comToOppDiff & oppToComDiff : ", comToOppDiff, oppToComDiff);
  
  cellDiff = Math.min(comToOppDiff, oppToComDiff);
  
  // Get inactiveTokens
  // Should be inside loop, not outside because maxDieMove is dynamic, as it changes focus to other opp tokens on each loop
  const maxDieMove = getMaxDieMove(opp, oppKey);
  // console.log("maxDieMove", maxDieMove);
  
  // Now it's time to calculate risk of each token. All else equal, the closer a token is to being dislodged, the higher the risk.
  // So the idea is, for one COM token, all other active opponent tokens pose some level of risk. The risk posed by all opponent tokens 
  // towards COM token will be cumulatively assessed, after sorting each opponent token from closest to farthest.
  
  // Treat tokens inside portal specially because they are under no threat from opponent token. The farther a token is inside the 
  // portal, the better. 5 is the max and 1 is the min. It gives more leeway for out-of-portal tokens to manoeuver. Even for the
  // in-portal token to clear, the farther the better because the chance also increases to clear through with an absolute die
  // value or combination of values
  
  // On instance of just 1 oppontent token
  if (opp.length === 1 || opp.length === 0 && breakout) { 
    if (oppToComDiff) {  // If opp->com risk (attack coming from behind)
      // Calculate exact odds to dislodge com.
      // Don't worry about odds of getting a '6' (for opp) to influence this because breakout risk will still be implemented
      // Also notice cellPath - oppToComDiff, instead of simply oppToComDiff. When only 1 opp token, we invert the risk
      // so instead of the closer the riskier, it becomes the closer the less riskier because it's ideal to wait for 
      // opp token to overlap so as to dislodge. If its not done this way, com token will keep running away from single opp 
      // token
      oddsRisk = calculateDiceOdds(cellPath - oppToComDiff, breakout, maxDieMove); 
    } else {
      oddsRisk = 0;
    }
  } else {  // Multiple opp active tokens
    if (com.length === 1) {  // If 1 com token, risk comes from whichever is closest
      oddsRisk = (1 - (cellDiff / cellPath)) * 100;
      if (withinStrikeRange (cellDiff)) {
        let remRisk = 100 - oddsRisk;
        let strikeRisk = calculateDiceOdds(cellDiff, breakout, maxDieMove);
        oddsRisk += (strikeRisk / 100) * remRisk;
      }
    } else {
      if (oppToComDiff) {
        oddsRisk = (1 - (oppToComDiff / cellPath)) * 100;
        if (withinStrikeRange(oppToComDiff)) {
          let remRisk = 100 - oddsRisk;
          let strikeRisk = calculateDiceOdds(oppToComDiff, breakout, maxDieMove);
          oddsRisk += (strikeRisk / 100) * remRisk;
        }
      } else {
        oddsRisk = 0;
      }
    }

    // console.log("cellDiff : ", cellDiff);
    riskExposure = [oddsRisk, progressFrac, startGapFrac];
    squadRisk[comLoopCount].push(riskExposure);
  }
  // console.log("SQUAD RISK : ", squadRisk);
  // console.log([Object.keys(com).length - 1, Object.keys(opp).length - 1])
  
  // Run only when breakout risk for either attack or defence base or both is complete
  // Check out breakout risk in condition below => if (tokenCounter === COM.length - 1) {...}

  if (comLoopCount === Object.keys(com).length - 1 && oppLoopCount === Object.keys(opp).length - 1) {  // On very last loop
  
    console.log("comLoopCount & oppLoopCount : ", comLoopCount, oppLoopCount);

    inActiveAttackTokens = getInActiveAttackTokens(opp);
    inActiveDefenceTokens = getInActiveDefenceTokens(opp);
    
    let oppAttackStartPosition = 26;  // getStartPosition("attack", "com");
    let oppDefenceStartPosition = 39; // getStartPosition("defence", "com")
    
    let oppBreakoutAttackSpot = oppAttackStartPosition + 3.5;  
    let oppBreakoutDefenceSpot =  oppDefenceStartPosition + 3.5;
    
    // for (let breakout = 0; breakout < breakoutCount; breakout++) {
    if (inActiveAttackTokens.length > 0) {
      // where '6' is breakout value 
      getRisk(comCell, oppBreakoutAttackSpot, comKey, oppKey, cellPath, travelPath, comLoopCount, oppLoopCount, 6); 
    } else if (inActiveDefenceTokens.length > 0) {  
      getRisk(comCell, oppBreakoutDefenceSpot, comKey, oppKey, cellPath, travelPath, comLoopCount, oppLoopCount, 6);
    }
    //}
    
    let comActive = getComActive();
    
    let risk = computeBreakoutRisk({
      portalTokenCells,
      squadRisk,
      comActive,
      calculateAggregateRisk,
      computeRisk
    });
  }
  
  /* if (breakoutCount === ([inActiveAttackTokens, inActiveDefenceTokens].filter(Boolean).length)) {

    let portalOddsRisk = calculateAggregateRisk(portalTokenCells); 
          
    //       
    let comCount = comActive.length;  
    let squadRiskCount = squadRisk.length;
    
    let breakoutRisk = 0;
    
    if (squadRiskCount - comCount === 2) {
      let breakoutAttackRisk = computeRisk([...squadRisk[squadRiskCount - 2], ...portalOddsRisk]);
      let breakoutDefenceRisk = computeRisk([...squadRisk[squadRiskCount - 1], ...portalOddsRisk]);
      breakoutRisk = Math.max(breakoutAttackRisk, breakoutDefenceRisk); // Get the maximum breakout risk

      squadRisk.splice(-2); 
    } else {  
      breakoutRisk = computeRisk(squadRisk[squadRiskCount - 1]);
      squadRisk.splice(-1);
    }

    for (let squad = 0; i < squadRisk.length - 1; squad++) {  
      squadRisk[squad] = computeRisk([...squad, ...portalOddsRisk]);
    }
    squadRisk.sort();
    squadRisk.push(breakoutRisk);
    risk = computeRisk(squadRisk); 
    console.log(risk);
  } */
}

function calculateRisk ({
    currCom,
    currOpp,
    comKey,
    oppKey,
    cellPath,
    travelPath,
    comLoopCount,
    oppLoopCount,
    comBasePosition,
    oppBasePosition,
    remainderRisk = 100,
    COMRisk = 0,
    breakout = null,
    com,
    opp
}) {
    let adjustedRisk = 0;
    /*console.table({
      currCom: JSON.stringify(currCom),
      currOpp: JSON.stringify(currOpp),
      cellPath: cellPath,
      travelPath: travelPath,
 
      remainderRisk: remainderRisk
    });*/

    adjustedRisk = getRisk(currCom, currOpp, comKey, oppKey, cellPath, travelPath, comLoopCount, oppLoopCount, breakout);
    return adjustedRisk;
  }
  
const getTempRisk = (com, squadRisk) => {
  
  let comLoopCount = 0;
  
  // Loop across COM
  for (const comKey in com) {
    let oppLoopCount = 0;
    if (com.hasOwnProperty(comKey)) {
      let currCom = com[comKey];
      // console.log(comKey)

      if (tokenInPortal(currCom.cell)) {
        portalTokenCells.push(travelPath - comCell);
      } else {
        squadRisk.push([]);
         // Loop across Opp
        for (const oppKey in opp) {
          if (opp.hasOwnProperty(oppKey)) {
            
            let currOpp = opp[oppKey];
  
            // Calculate aggregate risk for each COM token based mostly on distance (proximity) to opp tokens
            let risk = calculateRisk ({
              currCom: currCom,
              currOpp: currOpp,
              comKey,
              oppKey,
              cellPath,
              travelPath,
              comLoopCount,
              oppLoopCount,
              comBasePosition: currCom.basePosition,
              oppBasePosition: currOpp.basePosition
            });
            oppLoopCount++;
          }
        }
        comLoopCount++;
      }
    }
  }
}
  
const updateTempMoves = (com, moves) => {
  for (const move of moves) {
    move.token.forEach((tokenArr, i) => {
      const tokenKey = tokenArr[0]; // e.g., "A"
      const diceSum = move.dice[i].reduce((a, b) => a + b, 0); // sum of dice array
      if (com[tokenKey]) {
        // Update the com object’s token data
        com[tokenKey].cell += diceSum;
        com[tokenKey].absCell += diceSum;
        com[tokenKey].relCell += diceSum;
      }
    });
    console.log("COM : ", com)
    squadRisk = [];
    getTempRisk(com, squadRisk);
  }
  let computedRisk = skewRisks(leastRiskyMoves);
  console.log("computedRisk : ", computedRisk.pick);
}

const breakoutOdds = 11/36;
const defenceBreakoutSpot = 3.5;
const attackBreakoutSpot = 17.5;

const midBreakoutSpot = (attackBreakoutSpot + defenceBreakoutSpot) / 2;

const activeOppTokens = Object.entries(opp).filter(([_, val]) => val.cell > 0 && val.cell < 51);

updateTempMoves(com, moves);










	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	