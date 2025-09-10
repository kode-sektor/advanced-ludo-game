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

	
	
	
		
	
		
	
		
	
	  let cellPath = 51;
  let portalPath = 5; 
  let travelPath = cellPath + portalPath;
	
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
	
	const getActiveTokens = player => player.filter(player.relCell > 0);
	
	const withinStrikeRange = (comCell, playerCell) => comCell - playerCell < 12; 
	
	function divmod(dividend, divisor) {
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    return [quotient, remainder];
  }
  
	/*
	  3-way function to calculate odds of dice. 
	  
	  - (targetTotal): Calculate odds to get total dice values (4, 5) => 9.
	      Makes special provision for when strike range > 12. This will enact when there is only one active com token and 
	      at least one active opp token
	  - (targetTotal): As array. Calculate odds to get dice values (sum of 2 dice) inside array
	  - (targetDieNumber): Odds to calculate specific die value
	*/
  function calculateDiceOdds (player=com, targetTotal, targetDieNumber) {
    // targetDieNumber = (targetDieNumber === null) && targetTotal;
    if (targetDieNumber) {  // targetDieNumber, i.e, single die value can't be less than 1 or greater than 6
      if (targetDieNumber < 1 || targetDieNumber > 6) {
        throw new Error("Die number must be between 1 and 6");
      }
    }

    // Handle target total of a single value, not array of values 
    if (targetTotal && !Array.isArray(targetTotal)) {
      // const activePlayerTokensCount = Object.values(player).filter(val => val.cell > 0).length; 
      let strikeOdds = 1;
      let remainder = 1;
      let probDoubleSixes = 1;
           
      /*if (activePlayerTokensCount === 1) {
        const [quot, remainder] = divmod(targetTotal, 7);
        let medianStrideOdds = calculateDiceOdds(7); // Move in average of 7's
        if (remainder === 1) {
          let remStrideOdds = calculateDiceOdds(7 + 1);
          strikeOdds = Math.pow(medianStrideOdds, quot - 1) * remStrideOdds;  
        } else {
          let remStrideOdds = remainder === 0 ? 1 : calculateDiceOdds(remainder);
          strikeOdds = Math.pow(medianStrideOdds, quot) * remStrideOdds;
        }
      }*/
      
      // Get odds for cell distance > 12 getting amount of 12 moves possible, and determining odds for the remainder
      // Why 12s? Because only double-six enables continuous play 
      const inActiveTokens = getInActiveTokens(player);

      // If > 12, divide moves in 12's and store remainder, whose odds will be calculated next
      if (targetTotal > 12 && inActiveTokens) { 
        const doubleSixValue = 12; // (6,6) sum
        const pDoubleSix = 1 / 36; // probability of (6,6)
      
        const times = Math.floor(targetTotal / doubleSixValue);
        remainder = targetTotal % doubleSixValue;
      
        probDoubleSixes = Math.pow(pDoubleSix, times);  // Probability of getting the double six chain part
      } else {  // Expand function to handle a call to check odds for cell distance < 12
        remainder = targetTotal;
      }
      
      let ways = 0;
      if (remainder > 0) {
        // Ways to sum exactly to remainder (standard dice math)
        ways += (remainder > 1 && remainder < 7 ? remainder - 1 : 13 - remainder);
    
        // For cases where the die remainder can only be effected by one die throw, then 
        // add odds for probability of a '6' to break out for another token. For instance 
        // if the remainder is 5, generate odds of dice whose sum is 5, also including breakout odds of a "6, 5" and "5, 6"
        
        /*if (inActiveAttackTokens) { // Camped tokens exist to make allowance for breakout with a '6' die roll
          if (remainder === 6) { // [5, 1], [4, 2] etc. are other ways to get 6. But here, we additionally want [6, 6]. First 6 to 
            complete move, second 6 to break out
            ways += 1;
          } else if (remainder === 1) { // If remainining move is 1, only [6, 1] and [1, 6] qualify. Only 2 moves; no arrangement can 
            sum up to 1
            ways = 2;
          } else {  // From remainder ranging from 2 to 5, 6 can be an appendage both ways e.g. for 2 => [6, 2] and [2, 6]. Add these to 
            previous ways
            ways += 2;
          }
        }*/
        
      } else {
        // No remainder → exactly hitting the target with double sixes only
        ways = 36;
      }
      const probRemainder = ways / 36;
    
      // Return percentage probability
      strikeOdds = probDoubleSixes * probRemainder;
    } 
    
    // targetDie: For absolute die value, mostly used to get breakout odds i.e., odds of getting a '6'
    // targetTotal: for e.g [7, 8, 9, 10, 11, 12]
    if (targetDie || Array.isArray(targetTotal)) {  
      // on either die
      let totalOutcomes = 0;
      let favourableOutcomes = 0;
      
      if (Array.isArray(targetTotal)) {
        const [{ safeMoves }] = targetTotal;  
        const maxSafeMove = Math.max(safeMoves);  
        const minSafeMove = Math.min(safeMoves);  
      }
      
      for (let die1 = 1; die1 <= 6; die1++) {
        for (let die2 = 1; die2 <= 6; die2++) {
          totalOutcomes++;
          const diceTotal = die1 + die2;
          
          /*
            - If dicetotal is less than maxSafeMove
            - If dicetotal is within safeLeapMoves
            - Separate die moves less than or equal both safe moves
            - One die value is within safeLeapMoves and the other is less than minSafeMove
            - One die value is within safeLeapMoves and the other is less than maxSafeMove
          */
          if (Array.isArray(targetTotal)) {
            if ((diceTotal <= maxSafeMove) || safeLeapMoves.include(diceTotal) || (die1 <= minSafeMove && die2 <= maxSafeMove) 
            || safeLeapMoves.include(die1) && die2 <= minSafeMove ||  safeLeapMoves.include(die1) && die2 <= maxSafeMove) {
              const hasTargetNumber = true;
            }
          } else {
            const hasTargetNumber = die1 === targetDieNumber || die2 === targetDieNumber;
            // If you want a 5 either by absolute die e.g, '5' or by combination e.g, "3 + 2" 
            // const isTargetTotal = die1 + die2 === targetTotal;       
          }     
  
          //if (hasTargetNumber || isTargetTotal) {
          if (hasTargetNumber) {
            favourableOutcomes++;
          }
        }
      }
      if (targetTotal) {
        if (targetTotal > targetDieNumber) {
          if (targetTotal === targetDieNumber * 2) {
            favourableOutcomes--;
          } else {
            favourableOutcomes -= 2;
          }
        }
      }
    }
  
    const probability = favourableOutcomes / totalOutcomes;
    const percentage = (probability * 100).toFixed(2);
  
    return percentage;
  }
  
  function rearrangeCyclic(order, startKey) {
    const startIndex = order.indexOf(startKey);
    
    if (startIndex === -1) {
      throw new Error (`Invalid start key: ${startKey}`);
    }
    return order.slice(startIndex).concat(order.slice(0, startIndex));
  }
  
  const sortRiskPlay = (play) => {
    const sortedKeys = Object.entries(play).sort((a, b) => a[1] - b[1]).map(entry => entry[0]);
    return sortedKeys;
  }
  
  function arraysEqual (arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return arr1.every((value, index) => value === arr2[index]);
  }
  
  function getLeastTravelledTokens (player={opp}, num=1) {
    const activeTokens = getActiveTokens(player);
    return activeTokens.sort((a, b) => a[1].cell - b[1].cell).slice(0, num);
  }
  
  function setTokenClosestToBreakout (baseAttack, baseDefence, comCell, player="opp") {
    const inActiveAttackTokens = getInActiveAttackTokens(player);
    const inActiveCOMDefenceTokens = getInactiveDefenceTokens(player);
    
    const attackStartPosition = getAttackStartPosition(player);
    const defenceStartPosition = getDefenceStartPosition(player);
    
    if (inActiveAttackTokens) {
      if (oppActive.length > 1) {
        closestTokenToAttackStartPosition = Math.min(Math.abs(attackStartPosition - comCell), closestTokenToAttackStartPosition);
      } else {
        closestTokenToAttackStartPosition = Math.min((comCell > attackStartPosition ? 
        comCell - attackStartPosition : 
        comCell + cellPath - attackStartPosition), closestTokenToAttackStartPosition);
      } 
    }
    
    if (inActiveDefenceTokens) {
      if (oppActive.length > 1) {
        closestTokenToDefenceStartPosition = Math.min(Math.abs(defenceStartPosition - comCell), closestTokenToDefenceStartPosition);
      } else {
        closestTokenToDefenceStartPosition = Math.min((comCell > defenceStartPosition ? 
        comCell - defenceStartPosition : 
        comCell + cellPath - defenceStartPosition), closestTokenToDefenceStartPosition);
      } 
    }
  }
  
  let closestTokenToAttackBase = COM[A].cell;
  let closestTokenToDefenceBase = COM[A].cell;
  
  let closestTokenToAttackBase = Math.abs(COMBaseAttack - closestTokenToAttackBase);
  let closestTokenToDefenceBase = Math.abs(COMBaseDefence - diffTokenToDefenceBase);
  
  function testClosestTokenToBreakout (baseAttack, baseDefence, comCell) {
    if (COM.length === 1) {
      let diffTokenToAttackBase = Math.abs(baseAttack - comCell);
      let diffTokenToDefenceBase = Math.abs(baseDefence - comCell);
      
      closestTokenToAttackBase = diffTokenToAttackBase < closestTokenToAttackBase && comCell;
      closestTokenToDefenceBase = diffTokenToAttackBase < closestTokenToDefenceBase && comCell;
    } else {
      let diffTokenToAttackBase = comCell > baseAttack ? comCell - baseAttack : comCell + cellPath - baseAttack;
      let diffTokenToDefenceBase = comCell > baseDefence ? comCell - baseDefence : comCell + cellPath - baseDefence;
      
      closestTokenToAttackBase = diffTokenToAttackBase < closestTokenToAttackBase && comCell;
      closestTokenToDefenceBase = diffTokenToAttackBase < closestTokenToDefenceBase && comCell;
    }
  }
  
  function computeRisk (base, risks) {
    let exposure = base / 100;
    for (const r of risks) {
      exposure *= (1 - r / 100);
    }
    const final = +(exposure * 100).toFixed(4);
    const reduction = +(base - final).toFixed(4);
    return { finalExposure: final, totalReduction: reduction };
  }
  
  console.log(computeRisk(100, [25, 50]));    // { finalExposure: 37.5, totalReduction: 62.5 }
  console.log(computeRisk(100, [37.5, 37.5])); // { finalExposure: 39.0625, totalReduction: 60.9375 }

  /**
     * Calculate aggregate risk from an array of risk values (0–5 each).
     * Uses RMS (root mean square) to weight higher risks more heavily.
     * 
     * @param {number[]} risks - Array of risks (each 0–5).
     * @returns {number} Aggregate risk as percentage (0–100).
 */
  function calculateAggregateRisk(risks) {
    if (!Array.isArray(risks) || risks.length === 0) {
      throw new Error("Input must be a non-empty array of numbers.");
    }

    const n = risks.length;
    const sumSquares = risks.reduce((sum, r) => sum + r ** 2, 0);
    const rms = Math.sqrt(sumSquares / n);
    return (rms / 5) * 100; // percentage
  }

// console.log(calculateAggregateRisk([5, 0, 0]));       // ~57.7%
// console.log(calculateAggregateRisk([5, 5, 0]));       // ~81.6%
// console.log(calculateAggregateRisk([2.5, 2.5, 2.5])); // 50%
// console.log(calculateAggregateRisk([5, 5, 5]));       // 100%
// console.log(calculateAggregateRisk([0, 0, 0]));       // 0%
// console.log(calculateAggregateRisk([3, 4, 5, 2]));    // ~70.7%
  
  const tokenInPortal = cell => cell > 50 ? true : false;

  /* 
    This function tests if tokens can make full move; in other words, maximum dice value [6, 6] are attributable to 
    base tokens without either tokens overlapping token into a danger zone (striking distance) or moving beyond cell
    path (56)
  */

  const isFullMoveAllowable = (comCell, oppCell, basePosition=oppBasePosition, player=opp) => {
    let allowed = false;

    const strikeRangeDiff = oppCell - comCell;
    const twoLeastTravelledTokens = getLeastTravelledTokens(player, 2); // Get 2 least travelled tokens
    let leastTravelledTokens = [strikeRangeDiff, ...twoLeastTravelledTokens]; // Include strike range, making 3 distances in array
    let safeMoves = Math.min(leastTravelledTokens, 2); // [4, 5]  // Then find the maximum 2 to mirror max dice values
    let totalSafeMoves = safeMoves[0] + safeMoves[1];

    // If one die value is less than 6 and the second is less than 12, it means full move is not allowable as com token would either 
    // overlap opp token or other com token's move advance beyond cellpath
    // It's a bit confusing but considering it carefully, the first condition (< 6) checks a short move (1 die throw) doesn't overlap
    // while the second condition (< 12) covers the check for the long move (2 dice throw)
    if ((safeMoves[0] < 6 && safeMoves[1] < 12) || (safeMoves[0] < 12 && safeMoves[1] < 6)) {
      return allowed;
    }

    const portalBank = oppBasePosition === 0 ? 50 : oppBasePosition - 2;  // Get portal bank of opp 
    const breakoutSpot = oppBasePosition; // Get breakout spot of opp
    const safeLeapSpot = oppBasePosition - 1; // Get safe leap spot i.e, safe cell right next to portal bank

 }
  
  /*
    This function caters for token risk where the other least travelled com tokens do not have enough cells to advance in order
    to prevent com token from overlapping opp token. This scenario can only occur within strike range (max possible dice values)
    
    - The other active tokens would definitely be in-portal tokens because they must have travelled nothing less than 51 cell spots
    to leae a maximum of 5 cell spots to compute their odyssey
    
    - Case scenario: COM token occupies cell spot 35 and opp occupies 31. Opp has 2 other tokens that occupy cell spots 52 and 54
    respectively. Tossing a high dice value of 10, obviously would lead to COM token overlapping the opp token, which would now 
    expose it to some risk ... it's ahead! 
    
  */
  const getFullMoveOdds = (comCell, oppCell, oppId, oppBasePosition, player=opp) => {
    const strikeRangeDiff = oppCell - comCell;
    
    // Will only be computed within strike range
    if (strikeRangeDiff > 12) { 
      throw new Error (`${oppCell - comCell} is greater than strikeRange of 12`);
    } else {
      const twoLeastTravelledTokens = getLeastTravelledTokens(player, 2); // Get 2 least travelled tokens
      let leastTravelledTokens = [strikeRangeDiff, ...twoLeastTravelledTokens]; // Include strike range, making 3 distances in array
      let safeMoves = Math.min(leastTravelledTokens, 2); // [4, 5]  // Then find the maximum 2 to mirror max dice values
      
      const portalBank = oppBasePosition === 0 ? 50 : oppBasePosition - 2;  // Get portal bank of opp 
      const breakoutSpot = oppBasePosition; // Get breakout spot of opp
      const safeLeapSpot = oppBasePosition - 1; // Get safe leap spot i.e, safe cell right next to portal bank
      
      // Calculate distance of a leapfrog into safeleap spot and if less than 12, complete the cells up to 12 (max dice value)
      // Thus, if safeLeapDistance is 7, create array with values from 7 - 12 which are all safe spots after a leapfrog
      const safeLeapDistance = safeLeapSpot - comCell;  
      let safeLeapMoves = safeLeapDistance <= 12 ? Array.from({ length: 12 - safeLeapDistance + 1 }, (_, i) => i + safeLeapDistance) : null;
      
      // Take care of the small matter of landing on opp breakoutSpot by filtering it off safeLeapMoves if opponent has tokens in base
      const oppBaseTokensExist = getInactiveTokensCountByTokenId(oppId);
      if (oppBaseTokensExist) {
        safeLeapMoves = safeLeapMoves.filter(cell => cell === breakoutSpot); 
      }

      const eligibleMoves = [
                              {
                                safeMoves,
                                safeLeapMoves,
                                breakoutSpot
                              }
                            ];
      
      // Now get dice odds 
      const oddsRisk = calculateDiceOdds(eligibleMoves);
      /*
        const oddsRisk = calculateDiceOdds(
                                          [
                                            {
                                              safeMoves: [4, 5],
                                              safeLeapMoves: [7, 8, 9, 10, 11, 12],
                                              breakoutSpot: 8
                                            }
                                          ]
                                        );
      */                                
      
    }
  }
  
  
  let breakoutCount = 0;
  
  const getRisk = (currCom, currOpp, cellPath, breakout=false) => {
    
    let comCell = currCom[cell];
    let oppCell = currOpp[cell];
    let comBasePosition = currCom[basePosition];
    let oppBasePosition = currOpp[basePosition];
    let cyclePath = cellPath - 1; // 50
    
    let cellDiff = 0;
    let strikeRange = 0;
    let risk = 0;
    let riskExposure = [];
    let progressFrac = comCell / cyclePath;
    
    
    // Get the fraction comCell and total cells
    let progressFrac = comCell / cyclePath;

    // Get the difference of start positions of COM & opponent tokens as fraction of total cells
    let startGapFrac = Math.min((Math.max(comBasePosition, oppBasePosition) - Math.min(comBasePosition, oppBasePosition)),
                              (Math.min(comBasePosition, oppBasePosition) + 52 - Math.max(comBasePosition, oppBasePosition)));
    
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
      "comPortal" : comBasePosition === 0 ? 50 : comBasePosition - 2  // portal is 2 cells before breakout position
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
    const oppToCOMRisk = arraysEqual(sortedOppToComKeys, rearrangedOppRiskPattern);
    
    // The difference between oppCell and comCell is the difference required. The distance is required to calculate risk based on 
    // proximity. comToOppDiff means risk exposure when com is behind opp. oppToComDiff means risk exposure when opp is behind com.
    
    // For comToOppDiff, opp has to be ahead of com. Although ahead, its cell value may be lower due to the different relative 
    // start positions of tokens. If this is the case, add 51 (total cells) to the token ahead, and subtract previous token
    let comToOppDiff = comToOppRisk === false ? comToOppRisk : (oppCell > comCell ? oppCell - comCell : oppCell + cellPath - comCell);
    let oppToComDiff = oppToCOMRisk === false ? oppToCOMRisk : (comCell > oppCell ? comCell - oppCell : comCell + cellPath - comCell);
    
    cellDiff = comToOppDiff === false ? oppToComDiff : oppToComDiff === false ? comToOppDiff : Math.min(comToOppDiff, oppToComDiff);
    
    // Now it's time to calculate risk of each token. All else equal, the closer a token is to being dislodged, the higher the risk.
    // So the idea is, for one COM token, all other active opponent tokens pose some level of risk. The risk posed by all opponent tokens 
    // towards COM token will be cumulatively assessed, after sorting each opponent token from closest to farthest.
    
    // Treat tokens inside portal specially because they are under no threat from opponent token. The farther a token is inside the 
    // portal, the better. 5 is the max and 1 is the min. It gives more leeway for out-of-portal tokens to manoeuver. Even for the
    // in-portal token to clear, the farther the better because the chance also increases to clear through with an absolute die
    // value or combination of values
    
    if (tokenInPortal(comCell)) {
      portalTokenCells.push(travelPath - comCell);
      // oddsRisk = (travelPath - comCell) / portalPath; // e.g. (56 - 53) / 5 => 3/5
      
      // oddsRisk = (1 - ((cellPath - comCell) / cellPath)) * 100;
      // if (oddsRisk > portalTokenCells[0] || portalTokenCells[0] === undefined) {
      //   portalTokenCells.unshift(oddsRisk);
      // } else if (oddsRisk > portalTokenCells[1] || portalTokenCells[1] === undefined) {
      //   portalTokenCells[1] = oddsRisk;
      // }
    } else {
      if (opp.length === 1) {
        if (cellDiff === oppToComDiff) {
          oddsRisk = calculateDiceOdds(cellDiff);
        } else {
          oddsRisk = 0;
        }
      } else {
        if (COM.length === 1) {
          oddsRisk = (1 - (cellDiff / cellPath)) * 100;
          if (withinStrikeRange (cellDiff)) {
            let remRisk = 100 - oddsRisk;
            let strikeRisk = calculateDiceOdds(cellDiff, cellDiff);
            oddsRisk += (strikeRisk / 100) * remRisk;
          }
        } else {
          cellDiff = oppToComDiff;
          if (cellDiff === null) {
            oddsRisk = 0;
          } else {
            oddsRisk = (1 - (cellDiff / cellPath)) * 100;
            if (withinStrikeRange(cellDiff)) {
              let remRisk = 100 - oddsRisk;
              let strikeRisk = calculateDiceOdds(cellDiff, cellDiff);
              oddsRisk += (strikeRisk / 100) * remRisk;
            }
          }
        }
      }
      riskExposure = [oddsRisk, progressFrac, startGapFrac];
      squadRisk.push(riskExposure);
    }

    // Run only when breakout risk for either attack or defence base or both is complete
    // Check out breakout risk in condition below => if (tokenCounter === COM.length - 1) {...}
    if (breakoutCount === ([inActiveAttackTokens, inActiveCOMDefenceTokens].filter(Boolean).length)) {
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
      let portalOddsRisk = calculateAggregateRisk(portalTokenCells); 
            
      //       
      let comCount = COMActive.length;  
      let squadRiskCount = squadRisk.length;
      
      let breakoutRisk = 0;
      
      // This condition checks if breakout risk runs for both attack and defence breakout tokens 
      // How does this work? There are active COM tokens. The supposed breakout tokens add either 1 or 2 tokens to squadRiskCount
      // Simply subtract activetokens (comCount) from squadRiskCount to get number of breakout tokens
      if (squadRiskCount - comCount === 2) {
        let breakoutAttackRisk = computeRisk([...squadRisk[squadRiskCount - 2], ...portalOddsRisk]);
        let breakoutDefenceRisk = computeRisk([...squadRisk[squadRiskCount - 1], ...portalOddsRisk]);
        breakoutRisk = Math.max(breakoutAttackRisk, breakoutDefenceRisk); // Get the maximum breakout risk

        // Remove breakout risk(s) from squad risk. Both have been computed and max gotten, max will be added back
        // Other squad risks have not yet been evaluated. Hence keep breakout separate, to be added later
        squadRisk.splice(-2); 
      } else {  // Breakout risk runs for only either attack or defence breakout tokens
        breakoutRisk = computeRisk(squadRisk[squadRiskCount - 1]);
        squadRisk.splice(-1);
      }
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
      
      // squadRisk.push(riskExposure); // Push portal odds risk
      for (let squad = 0; i < squadRisk.length - 1; squad++) {  // Evaluate risk for each 
        squadRisk[squad] = computeRisk([...squad, ...portalOddsRisk]);
      }
      /*
        All squadRisk entries are now evaluated from arrays into single risk values
        squadRisk = [80, 40, 33, 31]

        Now push breakoutRisk, but sort before portalOddsRisk. Remember portalOddsRisk is least impactful
        so will be appended after the sort: 
        squadRisk = [80, 40, 33, 31 ..., 69]
      */
      squadRisk.sort();
      squadRisk.push(breakoutRisk);
      risk = computeRisk(squadRisk);  // Then finally compute which further evaluates into one single value e.g. 66%
    }
    
    // Breakout risk
    
    /*
       A possible breakout opponent token must be factored. The possibility of a surprise breakout attack influences how 
       COM moves because careless movements, especially around the opponent's lair could be costly. It's similar to taking a 
       boat ride on a body of water with a section of it croc-infested. Although no croc action may be apparent, nonetheless
       it definitely influences how you ride the boat and what direction you may take
    */
    
    /*
      - Create final loop that assumes an opp token breaks out. This will be on a [6, 3.5] position, with 3.5 being the median
        of range 1 -6. Then we'll call the getRisk() function on this assumed broken out token; just like the previous tokens.
      
      - The position will be the token's breakout spot + 3.5. But there are 2 more points to consider: Which of the token base 
        should the token break out from? We should assume 2 breakout tokens, each for attack and defence opponent base, compute
        the risk for each, and choose the maximum. Ensure to check for existence of tokens in each base
    */
    
    if (tokenCounter === COM.length - 1) {  // On last loop
    
      // setTokenClosestToBreakout(COMBaseAttack, COMBaseDefence, OppCell, player="COM");
      // const oppLeastTravelledToken = getLeastTravelledTokens("opp");
      
      const inActiveAttackTokens = getInActiveAttackTokens(player);
      const inActiveDefenceTokens = getInactiveDefenceTokens(player);

      if (inActiveAttackTokens) { // Check tokens exist in attack base. 
        breakoutCount++;  // Increment counter. Counter will be used to track if we are running one or two breakout risks 
        // let oppBreakoutAttackSpot = cellPath - oppLeastTravelledToken > 3.5 ? oppAttackStartPosition + 3.5 : oppAttackStartPosition + oppLeastTravelledToken;
        let oppBreakoutAttackSpot = oppAttackStartPosition + 3.5;  // If yes, calculate risk using (attack breakout spot + 3.5) as opp cell
        getRisk(oppBreakoutAttackSpot, comCell, comBasePosition, oppBasePosition, true);  // compute risk for assumed breakout attack token
      } 
      if (inActiveCOMDefenceTokens) { // Check tokens exist in defence base
        breakoutCount++;  
        // let oppBreakoutDefenceSpot = cellPath - oppLeastTravelledToken > 3.5 ? oppDefenceStartPosition + 3.5 : oppDefenceStartPosition + oppLeastTravelledToken;
        let oppBreakoutAttackSpot =  oppAttackStartPosition + 3.5;
        getRisk(oppBreakoutDefenceSpot, comCell, comBasePosition, oppBasePosition, true); // compute risk for assumed breakout defence token
      }
    }
    
    
    // Calculate risk 
    // [(total cells - cell difference) / total cells] * 100%
    
    if (activeOppTokens.length === 1) {
      if ()
      
    } else {
      
    }
    if (breakout) {
      strikeRange = player.relCell > COM.relCell ? player.relCell - COM.relCell : (player.relCell + 51) - COM.relCell;
    } else {
      strikeRange = Math.abs(COM.relCell - player.relCell);
    }
    
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
    if (cellWithinStrikeRange(comCell, playerCell)) {
      let strikeOdds = calculateDiceOdds(strikeRange); // e.g., 6 = 5/36
      strikeOdds = breakout && (11/36) * strikeOdds;
    }
    
    return adjustedRisk;
  }
  
  function calculateRisk ({
    currCom,
    currOpp,
    cellPath,
    remainderRisk = 100,
    COMRisk = 0,
    cellWithinStrikeRange,
    breakout = false
  }) {
    
    let adjustedRisk = 0;
    if (breakout) {
      adjustedRisk = getRisk(currCom, currOpp, true);
    } else {
      adjustedRisk = getRisk(currCom, currOpp, false);
      // Calculating risk for in-portal tokens
      /*if (comCell > 50) {
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
        adjustedRisk = getRisk(comCell, playerCell, false);
      }*/
    }
    
    console.log("Adjusted risk:", adjustedRisk.toFixed(2));
    console.log("Cumulative COMRisk:", COMRisk.toFixed(2));
    console.log("Remaining risk pool:", remainderRisk.toFixed(2));
  
    return adjustedRisk;
  }
  
  
  const portalTokenCells = [];  
  const breakoutOdds = 11/36;
  const defenceBreakoutSpot = 3.5;
  const attackBreakoutSpot = 17.5;
  
  const midBreakoutSpot = (attackBreakoutSpot + defenceBreakoutSpot) / 2;
  
  const activeOppTokens = Object.entries(player).filter(([_, val]) => val.cell > 0 && val.cell < 51);
	
	// Loop across COM 
  for (const comKey in com) {
    if (com.hasOwnProperty(comKey)) {
      let currCom = com[comKey];

      let playerLoopCount = 0;
      
      // Loop across Opp
      for (const oppKey in opp) {
        playerLoopCount++;
        if (opp.hasOwnProperty(oppKey)) {
          
          let currOpp = opp[oppKey];

          // Calculate aggregate risk for each COM token based mostly on distance (proximity) to opp tokens
          let risk = calculateRisk ({
            currCom: currCom,
            currOpp: currOpp,
            cellPath: cellPath,
            
            comCell: COM[comKey].cell,
            playerCell: player[playerKey].cell,
            comBasePosition: COM[comKey].basePosition,
            oppBasePosition: player[playerKey].basePosition,
            
            cellPath,
            inPortalCOMTokens
          });
        }
      }
    }
  }
  
  // console.log(COM);
	
	
	const getStrikeOdds = () => {
	  
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	