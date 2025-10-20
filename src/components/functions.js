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

    let strikeOdds;
    let targetTotalOdds;

    // Handle target total of a single value, not array of values 
    if (targetTotal && !Array.isArray(targetTotal)) {
      // const activePlayerTokensCount = Object.values(player).filter(val => val.cell > 0).length; 
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
        /*
          - Remainder is always <= 12
          - If remainder < 7, subtract 1. If > 7, 13 - remainder. 
          - If remainder is 4, ways to get 4 is [2, 2], [3, 1] & [1, 3] which is 3 ways. In other words you can just subtract 
            1 => 4 - 1 = 3 ways
          - If trying to get odds of targetTotal, as well as a particular die number in the remainder, do something like 
            calculateDiceOdds(18, 4)
        */
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
      targetTotalOdds = ((probDoubleSixes * probRemainder) * 100).toFixed(2);
      if (!targetDie) { // Return strike odds if function is suited only for strike odds
        strikeOdds = targetTotalOdds;  
        return strikeOdds;
      }
    } 
    
    // targetDie: For absolute die value, mostly used to get breakout odds i.e., odds of getting a '6'
    // targetTotal: for e.g [7, 8, 9, 10, 11, 12]
    if (targetDie || Array.isArray(targetTotal)) {  
      // on either die
      let dieOrTargetTotalOdds = 1;
      let totalOutcomes = 0;
      let favourableOutcomes = 0;
      let hasTargetNumber = false;

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
            || safeLeapMoves.include(die1) && die2 <= minSafeMove || safeLeapMoves.include(die1) && die2 <= maxSafeMove) {
              hasTargetNumber = true;
            }
          } else {
            /*
              If target die is <= 6, find dice combination to get target die or [6, targetDie] if there's a camped token
              Example: If target die is 3, find combination of [1, 2], [2, 1] and then [6, 3] and [3, 6] for target die & breakout
            */
            if (targetDie <= 6) { // If <=6, targetDie & breakout odds 
              targetDie = [6, targetDie];
            }
            if (Array.isArray(targetDie)) {
              if ((targetDie[0] === die1 && targetDie[1] === die2) || (targetDie[0] === die2 && targetDie[1] === die1) || 
                (die1 + die2 === targetTotal)) {
                hasTargetNumber = true;
              }
            } else {  // If we want to check the occurence of a single die value, used especially to get odds for a '6' (breakout)
              hasTargetNumber = die1 === targetDieNumber || die2 === targetDieNumber;
            }
            // If you want a 5 either by absolute die e.g, '5' or by combination e.g, "3 + 2" 
            // const isTargetTotal = die1 + die2 === targetTotal;       
          }     
  
          //if (hasTargetNumber || isTargetTotal) {
          if (hasTargetNumber) {
            favourableOutcomes++;
          }
        }
      }
      /*
        - targetTotal & targetDie may intersect (This occurs only if you calculate dice odds of targetTotal & targetDie together)
        - the odds of getting targetTotal (dice sum) may intersect with the odds of targetDie
        - if targetTotal is 4, possible ways of arrangement are [3, 1], [1, 3], [2, 2]
        - if targetDie is 3, we want '3' on at least one die. Possible values are [3, 1], [1, 3], [3, 2] and [2, 3]
        - [1, 3] and [3, 1] intersect. Hence these odds must NOT be repeated. Most repetitions are 2 occurences
          except if targetTotal is 2
        - Run like so: calculateDiceOdds(8, 4)  // diceTotal of 8 and die target of 4

      */
      if (targetTotal & !Array.isArray(targetTotal)) {  // Finding targetTotal & targetDie together
        if (targetTotal > targetDieNumber) {  
          if (targetTotal === targetDieNumber * 2) {  // If both dice are repeated, e.g, targetTotal = 6, targetDieNumber = (3 * 2) => dice [3, 3]
            favourableOutcomes--; // subtract only 1 because repeated dice occur once
          } else {  // otherwise, subtract 2. e.g, [4, 3], [3, 4] which is 2
            favourableOutcomes -= 2;
          }
        }
      }
      dieOrTargetTotalOdds = ((favourableOutcomes / totalOutcomes) * 100).toFixed(2);
      if (targetTotal) {
        strikeOdds = targetTotalOdds + dieOrTargetTotalOdds;
      }
    }
    return strikeOdds;
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

  const isFullMoveAllowable = (comCell, oppCell, basePosition=opp.basePosition, player=opp) => {
    let allowed = true;

    const strikeRangeDiff = oppCell - comCell;
    const twoLeastTravelledTokens = getLeastTravelledTokens(player, 2); // Get 2 least travelled tokens
    let leastTravelledTokens = [strikeRangeDiff, ...twoLeastTravelledTokens]; // Include strike range, making 3 distances in array
    let safeMoves = Math.min(leastTravelledTokens, 2); // [4, 5]  // Then find the maximum 2 to mirror max dice values
    // let totalSafeMoves = safeMoves[0] + safeMoves[1];
    let portalGateway = basePosition === 0 ? 50 : basePosition - 2;

    // If one die value is less than 6 and the second is less than 12, it means full move is not allowable as com token would either 
    // overlap opp token or other com token's move advance beyond cellpath
    // Solution for moves to be allowable: 
    // 1. Both tokens must have 6 or more distance to either not overlap or advance past cellPath (56) or 
    // 2. At least one of the tokens must have a max safe distance of 12 or 
    // 3. If opp cell occupies its portal gateway

    if ((safeMoves[0] > 6 && safeMoves[1] > 6) || safeMoves[0] > 12 || safeMoves[0] > 12 || oppCell === portalGateway) {
      return {safeMoves, portalGateway};  // Instead of returning true, return variables used for next function
    } else {
      return !allowed;
    }
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

  const getFullMoveOdds = (comCell, oppCell, oppId, safeMoves, oppBasePosition, player=opp) => {
    
    const twoLeastTravelledTokens = getLeastTravelledTokens(player, 2); // Get 2 least travelled tokens
    let leastTravelledTokens = [strikeRangeDiff, ...twoLeastTravelledTokens]; // Include strike range, making 3 distances in array
    
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
  
  
 let cellPath = 52;
let portalPath = 5; 
let travelPath = cellPath + portalPath - 1;
let squadRisk = [];

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
  	/*H: {
  		breakaway: [{ x: 2, y: 3}],
  		coordinates: [{ x: 0, y: 0}],
  		absCell: 43,
		  relCell: 17,
  		cell: 17,
  		basePosition: 26,
  		risk : 0
  	}*/
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

const getcomActive = () => Object.entries(com)
  .filter(([key, value]) => value.cell > 0)
  .map(([key, value]) => ({ [key]: value }));

const getInActiveAttackTokens = (player=com) => {
  return [];
	const attackBase = getAttackBase();
	console.log(attackBase);
	const inActiveAttackTokens = attackBase.filter(seed => {
		const key = Object.keys(seed)[0]; 
		return seed[key].cell === null;
	});
	console.log(inActiveAttackTokens);
	// return inActiveAttackTokens;
}

const getInActiveDefenceTokens = (player=com) => {
  return [];
	const defenceBase = getDefenceBase();
	console.log(defenceBase);
	const inActiveDefenceTokens = defenceBase.filter(seed => {
		const key = Object.keys(seed)[0]; 
		return seed[key].cell === null;
	});
	console.log(inActiveDefenceTokens);
	// return inActiveDefenceTokens;
}

const getActiveTokens = (player=opp, exceptionKey=null) => {
  return Object.entries(player)
    .filter(([key, value]) => key !== exceptionKey && value.cell !== null)
    .map(([key, value]) => ({ [key]: value }));
};

const getMaxDieMove = (player=opp, exceptionKey=null, num=1, returnCell=true) => {
  const activeTokens = getActiveTokens(player, exceptionKey);

  const sorted = activeTokens
    .sort((a, b) => {
      const cellA = Object.values(a)[0].cell;
      const cellB = Object.values(b)[0].cell;
      return cellA - cellB; // ascending = least travelled first
    })
    .slice(0, num);
    
  // If user only wants the cell value(s)
  if (returnCell) {
    let cell = Object.values(sorted[0])[0].cell;
    if (num === 1) {
      return (cell < cellPath - 1) ? cellPath - 1 - cell : 0; // Token must not be in-portal
    } else {
      return sorted.map(obj => ((Object.values(obj)[0].cell) < cellPath - 1) ? (cellPath - 1 - Object.values(obj)[0].cell) : 0);
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
      return (rms / 5) * 100; // percentage
    } else {
      return [];
    }
  }


const computeBreakoutRisk = ({
  portalTokenCells,
  squadRisk,
  comActive,
  calculateAggregateRisk,
  computeRisk
}) => {

  const portalOddsRisk = [5, 3];
  const comCount = comActive.length;
  const squadRiskCount = squadRisk.length;
  console.log("comCount : ", comCount);
  console.log("squadRiskCount : ", squadRiskCount);

  let breakoutRisk = 0;

  if (squadRiskCount - comCount === 2) {
    const breakoutAttackRisk = computeRisk([...squadRisk[squadRiskCount - 2], ...portalOddsRisk]);
    const breakoutDefenceRisk = computeRisk([...squadRisk[squadRiskCount - 1], ...portalOddsRisk]);
    breakoutRisk = Math.max(breakoutAttackRisk, breakoutDefenceRisk);
    squadRisk.splice(-2);
  } else if (squadRiskCount - comCount === 1) {
    breakoutRisk = computeRisk(squadRisk[squadRiskCount - 1]);
    squadRisk.splice(-1);
  }

  console.log("SQUAD RISK : ", squadRisk);

  if (portalOddsRisk.length > 0) {
    for (let i = 0; i < squadRisk.length; i++) {
      for (let j = 0; j < squadRisk[i].length; j++) {
        const squadRiskEntry = [...squadRisk[i][j], ...portalOddsRisk];
        squadRisk[i][j] = computeRisk(squadRiskEntry[0], squadRiskEntry);
      }
    }
  }

  console.log("SQUAD RISK : ", squadRisk);
  squadRisk.sort();
  squadRisk.push(breakoutRisk);

  const risk = computeRisk(squadRisk);
  return risk;
}

const computeRisk = (base, risks=[]) => {
  let exposure = base / 100;
  for (const r of risks) {
    exposure *= (1 - r / 100);
  }
  const final = +(exposure * 100).toFixed(4);
  const reduction = +(base - final).toFixed(4);
  return { finalExposure: final, totalReduction: reduction };
}

const getInActiveTokens = (com) => Object.fromEntries(
  Object.entries(com).filter(([_, val]) => val.cell === null)
);

 const getLeastTravelledTokens = (player={opp}, num=1) => {
  const activeTokens = getActiveTokens(player);
  return activeTokens.sort((a, b) => a[1].cell - b[1].cell).slice(0, num);
}



const calculateDiceOdds = (targetTotal, targetDieNumber, maxDieMove = 0, inActiveTokens=true) => {
  
  const isMatch = (targetDieNumber, die1, die2) => targetDieNumber === die1 || targetDieNumber === die2;

  const isMatchMax = (targetDieNumber, maxDieMove, die1, die2) => 
    (targetDieNumber === die1 && maxDieMove === die2) || 
    (targetDieNumber === die2 && maxDieMove === die1);

  const isActiveCombo = (remainder, die1, die2) => 
    inActiveTokens && ((remainder === die1 && 6 === die2) || (remainder === die2 && 6 === die1));

  const isSumMatch = (targetDieNumber, die1, die2) => die1 + die2 === targetDieNumber;

  if (targetTotal !== null || targetDieNumber !== null) {  
    if (targetTotal !== null) {
      console.log(targetTotal)
      if (targetTotal < 1) {
        console.log("Target total must be greater than 0")
        throw new Error("Target total must be greater than 0");
      }
    }
    if (targetDieNumber !== null) {
      console.log("targetDieNumber : ", targetDieNumber)
      if (targetDieNumber < 1 || targetDieNumber > 6) {
        console.log("Die number must be between 1 and 6")
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

    if (targetTotal > 12) { 
      const doubleSixValue = 12; 
      const pDoubleSix = 1 / 36; 
    
      const times = Math.floor(targetTotal / doubleSixValue);
      remainder = targetTotal % doubleSixValue;
    
      probDoubleSixes = Math.pow(pDoubleSix, times);  
    } else {
      remainder = targetTotal; 
    }
    
    console.log("remainder : ", remainder);
    
    if (targetDieNumber) {
      console.log("targetDieNumber : ", targetDieNumber);
      
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
    
    if (remainder > 0 && remainder < 13) {  // works same way as isSumMatch but isSumMatch will be used in latter code for sake of dynamism
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

  if (targetDieNumber || Array.isArray(targetTotal)) {  
    let totalOutcomes = 0;
    let hasTargetNumber = false;
    let hasMatchNumber = false;
    let favourableMatchOutcome = 0;
    let favourableTargetOutcome = 0;

    if (Array.isArray(targetTotal)) {
      const [{ safeMoves }] = targetTotal;  
      const maxSafeMove = Math.max(...safeMoves);  
      const minSafeMove = Math.min(...safeMoves);  
    }
    
    for (let die1 = 1; die1 <= 6; die1++) {
      for (let die2 = 1; die2 <= 6; die2++) {
        totalOutcomes++;
        
        if (Array.isArray(targetDieNumber)) {
          // console.log("targetDieNumber is array");
          hasMatchNumber = isMatch(targetDieNumber[0], die1, die2);
          hasTargetNumber = ( 
            isMatchMax(targetDieNumber[1], maxDieMove, die1, die2) || 
            isActiveCombo(targetDieNumber[1], die1, die2)
          );
        } else {  
          // console.log(targetDieNumber);
          // console.log("targetDieNumber is not array")
          if (targetTotal === null || (targetTotal !== null && remainder > 6)) {
            hasMatchNumber = isMatch(targetDieNumber, die1, die2);
          } else {
            hasTargetNumber = ( 
              isMatchMax(targetDieNumber, maxDieMove, die1, die2) || 
              isActiveCombo(targetDieNumber, die1, die2)
            );
          }
        }
        // console.log(hasMatchNumber);
        if (hasMatchNumber) {
          console.log("hasMatchNumber");
          favourableMatchOutcome++;
        }
        if (hasTargetNumber) {
          console.log("hasTargetNumber")
          favourableTargetOutcome++;
        }
      }
    }
    
    if (targetDieNumber && maxDieMove >= 6) {
      console.log("dice intersection");
      if (hasTargetNumber) favourableTargetOutcome -= 2;
    }
    
    // console.log(favourableMatchOutcome, favourableTargetOutcome);
    // console.log("ways : ", ways);
    
    const favourableMatchOdds = favourableMatchOutcome && (Number(((favourableMatchOutcome / totalOutcomes)).toFixed(6)));
    const favourableTargetOdds = favourableTargetOutcome && (Number((((favourableTargetOutcome + ways) / totalOutcomes) * probDoubleSixes).toFixed(6)));
    
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


let breakoutCount = 0;
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
  
  let progressFrac = comCell / cellPath;
  console.log("comBasePosition & oppBasePosition : ", comBasePosition, oppBasePosition);
  let startGapFrac = oppBasePosition > comBasePosition ? cellPath - oppBasePosition + comBasePosition : oppBasePosition - comBasePosition;

  const comExistentRiskPattern = ["comPortal", "comCell", "oppCell"];
  const oppExistentRiskPattern = ["oppPortal", "oppCell", "comCell"];
  
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
  
  const sortedComToOppKeys = sortRiskPlay(comToOppPlay);
  const sortedOppToComKeys = sortRiskPlay(oppToComPlay);
  
  const rearrangedComRiskPattern = rearrangeCyclic(comExistentRiskPattern, sortedComToOppKeys[0]);
  const rearrangedOppRiskPattern = rearrangeCyclic(oppExistentRiskPattern, sortedOppToComKeys[0]);
  
  const comToOppRisk = arraysEqual(sortedComToOppKeys, rearrangedComRiskPattern);
  const oppToComRisk = arraysEqual(sortedOppToComKeys, rearrangedOppRiskPattern);
  
  console.log("sortedComToOppKeys : ", sortedComToOppKeys);
  console.log("sortedOppToComKeys : ", sortedOppToComKeys);
  
  console.log(comToOppRisk, oppToComRisk);
  console.log(cellPath);
  let comToOppDiff = comToOppRisk === false ? comToOppRisk : (oppCell > comCell ? oppCell - comCell : oppCell + cellPath - comCell);
  let oppToComDiff = oppToComRisk === false ? oppToComRisk : (comCell > oppCell ? comCell - oppCell : comCell + cellPath - oppCell);
  console.log("comCell & oppCell : ", comCell, oppCell);
  console.log("comToOppDiff & oppToComDiff : ", comToOppDiff, oppToComDiff);
  
  cellDiff = Math.min(comToOppDiff, oppToComDiff);
  
  // Get inactiveTokens
  // Should be inside loop, not outside because maxDieMove is dynamic, as it changes focus to other opp tokens on each loop
  const maxDieMove = getMaxDieMove(opp, oppKey);
  // console.log("maxDieMove", maxDieMove);
  
  
  if (opp.length === 1 || opp.length === 0 && breakout) { 
    if (oppToComDiff) {  
      oddsRisk = calculateDiceOdds(oppToComDiff, breakout, maxDieMove); 
    } else {
      oddsRisk = 0;
    }
  } else {  
    if (com.length === 1) { 
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

    console.log("cellDiff : ", cellDiff);
    riskExposure = [oddsRisk, progressFrac, startGapFrac];
    squadRisk[comLoopCount].push(riskExposure);
  }
  // console.log("SQUAD RISK : ", squadRisk);
  
  if (comLoopCount === Object.keys(com).length - 1 && oppLoopCount === Object.keys(opp).length - 1) {  // On very last loop

    inActiveAttackTokens = getInActiveAttackTokens(opp);
    inActiveDefenceTokens = getInActiveDefenceTokens(opp);
    
    let oppAttackStartPosition = 26;
    let oppDefenceStartPosition = 39;
    
    let oppBreakoutAttackSpot = oppAttackStartPosition + 3.5;  
    let oppBreakoutDefenceSpot =  oppDefenceStartPosition + 3.5;
    
    for (let breakout = 0; breakout < breakoutCount; breakout++) {
      if (inActiveAttackTokens.length > 0) {
        getRisk(oppBreakoutAttackSpot, comCell, comBasePosition, oppBasePosition, 6); // where '6' is breakout value 
      } else if (inActiveDefenceTokens.length > 0) {
        getRisk(oppBreakoutDefenceSpot, comCell, comBasePosition, oppBasePosition, 6);
      }
    }
    
    let comActive = getcomActive();
    
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
    console.table({
      currCom: JSON.stringify(currCom),
      currOpp: JSON.stringify(currOpp),
      cellPath: cellPath,
      travelPath: travelPath,
 
      remainderRisk: remainderRisk
    });

    adjustedRisk = getRisk(currCom, currOpp, comKey, oppKey, cellPath, travelPath, comLoopCount, oppLoopCount, breakout, com, opp);
  
    return adjustedRisk;
  }
  

  const breakoutOdds = 11/36;
  const defenceBreakoutSpot = 3.5;
  const attackBreakoutSpot = 17.5;
  
  const midBreakoutSpot = (attackBreakoutSpot + defenceBreakoutSpot) / 2;
  
  const activeOppTokens = Object.entries(opp).filter(([_, val]) => val.cell > 0 && val.cell < 51);
	
	
	let comLoopCount = 0;

	// Loop across COM 
	
  for (const comKey in com) {
    let oppLoopCount = 0;
    if (com.hasOwnProperty(comKey)) {
      let currCom = com[comKey];
      console.log(comKey)

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

onst computeBreakoutRisk = ({
  portalTokenCells,
  squadRisk,
  comActive,
  calculateAggregateRisk,
  computeRisk
}) => {

  const portalOddsRisk = calculateAggregateRisk(portalTokenCells);
  const comCount = comActive.length;
  const squadRiskCount = squadRisk.length;

  let breakoutRisk = 0;

  if (squadRiskCount - comCount === 2) {
    const breakoutAttackRisk = computeRisk([...squadRisk[squadRiskCount - 2], ...portalOddsRisk]);
    const breakoutDefenceRisk = computeRisk([...squadRisk[squadRiskCount - 1], ...portalOddsRisk]);
    breakoutRisk = Math.max(breakoutAttackRisk, breakoutDefenceRisk);
    squadRisk.splice(-2);
  } else {
    breakoutRisk = computeRisk(squadRisk[squadRiskCount - 1]);
    squadRisk.splice(-1);
  }
  for (let i = 0; i < squadRisk.length - 1; i++) {
    squadRisk[i] = computeRisk([...squadRisk[i], ...portalOddsRisk]);
  }
  squadRisk.sort();
  squadRisk.push(breakoutRisk);

  const risk = computeRisk(squadRisk);
  return risk;
}

const getInActiveTokens = (com) => Object.fromEntries(
  Object.entries(com).filter(([_, val]) => val.cell === null)
);

 const getLeastTravelledTokens = (player={opp}, num=1) => {
  const activeTokens = getActiveTokens(player);
  return activeTokens.sort((a, b) => a[1].cell - b[1].cell).slice(0, num);
}



const calculateDiceOdds = (targetTotal, targetDieNumber, maxDieMove = 0, inActiveTokens=true) => {
  
  const isMatch = (targetDieNumber, die1, die2) => targetDieNumber === die1 || targetDieNumber === die2;

  const isMatchMax = (targetDieNumber, maxDieMove, die1, die2) => 
    (targetDieNumber === die1 && maxDieMove === die2) || 
    (targetDieNumber === die2 && maxDieMove === die1);

  const isActiveCombo = (remainder, die1, die2) => 
    inActiveTokens && ((remainder === die1 && 6 === die2) || (remainder === die2 && 6 === die1));

  const isSumMatch = (targetDieNumber, die1, die2) => die1 + die2 === targetDieNumber;

  if (targetTotal !== null || targetDieNumber !== null) {  
    if (targetTotal !== null) {
      console.log(targetTotal)
      if (targetTotal < 1) {
        console.log("Target total must be greater than 0")
        throw new Error("Target total must be greater than 0");
      }
    }
    if (targetDieNumber !== null) {
      console.log("targetDieNumber : ", targetDieNumber)
      if (targetDieNumber < 1 || targetDieNumber > 6) {
        console.log("Die number must be between 1 and 6")
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

    if (targetTotal > 12) { 
      const doubleSixValue = 12; 
      const pDoubleSix = 1 / 36; 
    
      const times = Math.floor(targetTotal / doubleSixValue);
      remainder = targetTotal % doubleSixValue;
    
      probDoubleSixes = Math.pow(pDoubleSix, times);  
    } else {
      remainder = targetTotal; 
    }
    
    console.log("remainder : ", remainder);
    
    if (targetDieNumber) {
      console.log("targetDieNumber : ", targetDieNumber);
      
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
    
    if (remainder > 0 && remainder < 13) {  // works same way as isSumMatch but isSumMatch will be used in latter code for sake of dynamism
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

  if (targetDieNumber || Array.isArray(targetTotal)) {  
    let totalOutcomes = 0;
    let hasTargetNumber = false;
    let hasMatchNumber = false;
    let favourableMatchOutcome = 0;
    let favourableTargetOutcome = 0;

    if (Array.isArray(targetTotal)) {
      const [{ safeMoves }] = targetTotal;  
      const maxSafeMove = Math.max(...safeMoves);  
      const minSafeMove = Math.min(...safeMoves);  
    }
    
    for (let die1 = 1; die1 <= 6; die1++) {
      for (let die2 = 1; die2 <= 6; die2++) {
        totalOutcomes++;
        
        if (Array.isArray(targetDieNumber)) {
          // console.log("targetDieNumber is array");
          hasMatchNumber = isMatch(targetDieNumber[0], die1, die2);
          hasTargetNumber = ( 
            isMatchMax(targetDieNumber[1], maxDieMove, die1, die2) || 
            isActiveCombo(targetDieNumber[1], die1, die2)
          );
        } else {  
          // console.log(targetDieNumber);
          // console.log("targetDieNumber is not array")
          if (targetTotal === null || (targetTotal !== null && remainder > 6)) {
            hasMatchNumber = isMatch(targetDieNumber, die1, die2);
          } else {
            hasTargetNumber = ( 
              isMatchMax(targetDieNumber, maxDieMove, die1, die2) || 
              isActiveCombo(targetDieNumber, die1, die2)
            );
          }
        }
        // console.log(hasMatchNumber);
        if (hasMatchNumber) {
          console.log("hasMatchNumber");
          favourableMatchOutcome++;
        }
        if (hasTargetNumber) {
          console.log("hasTargetNumber")
          favourableTargetOutcome++;
        }
      }
    }
    
    if (targetDieNumber && maxDieMove >= 6) {
      console.log("dice intersection");
      if (hasTargetNumber) favourableTargetOutcome -= 2;
    }
    
    // console.log(favourableMatchOutcome, favourableTargetOutcome);
    // console.log("ways : ", ways);
    
    const favourableMatchOdds = favourableMatchOutcome && (Number(((favourableMatchOutcome / totalOutcomes)).toFixed(6)));
    const favourableTargetOdds = favourableTargetOutcome && (Number((((favourableTargetOutcome + ways) / totalOutcomes) * probDoubleSixes).toFixed(6)));
    
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



let breakoutCount = 0;
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
  
  let progressFrac = comCell / cellPath;
  console.log("comBasePosition & oppBasePosition : ", comBasePosition, oppBasePosition);
  let startGapFrac = oppBasePosition > comBasePosition ? cellPath - oppBasePosition + comBasePosition : oppBasePosition - comBasePosition;

  const comExistentRiskPattern = ["comPortal", "comCell", "oppCell"];
  const oppExistentRiskPattern = ["oppPortal", "oppCell", "comCell"];
  
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
  
  const sortedComToOppKeys = sortRiskPlay(comToOppPlay);
  const sortedOppToComKeys = sortRiskPlay(oppToComPlay);
  
  const rearrangedComRiskPattern = rearrangeCyclic(comExistentRiskPattern, sortedComToOppKeys[0]);
  const rearrangedOppRiskPattern = rearrangeCyclic(oppExistentRiskPattern, sortedOppToComKeys[0]);
  
  const comToOppRisk = arraysEqual(sortedComToOppKeys, rearrangedComRiskPattern);
  const oppToComRisk = arraysEqual(sortedOppToComKeys, rearrangedOppRiskPattern);
  
  console.log("sortedComToOppKeys : ", sortedComToOppKeys);
  console.log("sortedOppToComKeys : ", sortedOppToComKeys);
  
  console.log(comToOppRisk, oppToComRisk);
  console.log(cellPath);
  let comToOppDiff = comToOppRisk === false ? comToOppRisk : (oppCell > comCell ? oppCell - comCell : oppCell + cellPath - comCell);
  let oppToComDiff = oppToComRisk === false ? oppToComRisk : (comCell > oppCell ? comCell - oppCell : comCell + cellPath - oppCell);
  console.log("comCell & oppCell : ", comCell, oppCell);
  console.log("comToOppDiff & oppToComDiff : ", comToOppDiff, oppToComDiff);
  
  cellDiff = Math.min(comToOppDiff, oppToComDiff);
  
  // Get inactiveTokens
  // Should be inside loop, not outside because maxDieMove is dynamic, as it changes focus to other opp tokens on each loop
  const maxDieMove = getMaxDieMove(opp, oppKey);
  // console.log("maxDieMove", maxDieMove);
  
  
  if (opp.length === 1 || opp.length === 0 && breakout) { 
    if (oppToComDiff) {  
      oddsRisk = calculateDiceOdds(oppToComDiff, breakout, maxDieMove); 
    } else {
      oddsRisk = 0;
    }
  } else {  
    if (com.length === 1) { 
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

    console.log("cellDiff : ", cellDiff);
    riskExposure = [oddsRisk, progressFrac, startGapFrac];
    squadRisk[comLoopCount].push(riskExposure);
  }
  console.log("SQUAD RISK : ", squadRisk);
  
  if (comLoopCount === Object.keys(com).length - 1 && oppLoopCount === Object.keys(opp).length - 1) {  // On very last loop

    inActiveAttackTokens = getInActiveAttackTokens(opp);
    inActiveDefenceTokens = getInActiveDefenceTokens(opp);
    
    let oppAttackStartPosition = 26;
    let oppDefenceStartPosition = 39;
    
    let oppBreakoutAttackSpot = oppAttackStartPosition + 3.5;  
    let oppBreakoutDefenceSpot =  oppDefenceStartPosition + 3.5;
    
    for (let breakout = 0; breakout < breakoutCount; breakout++) {
      if (inActiveAttackTokens) {
        getRisk(oppBreakoutAttackSpot, comCell, comBasePosition, oppBasePosition, 6); // where '6' is breakout value 
      } else if (inActiveDefenceTokens) {
        getRisk(oppBreakoutDefenceSpot, comCell, comBasePosition, oppBasePosition, 6);
      }
    }
    
    let comActive = getcomActive();
    
    let risk = computeBreakoutRisk({
      portalTokenCells,
      squadRisk,
      comActive,
      calculateAggregateRisk,
      computeRisk
    });
  }
  
  if (breakoutCount === ([inActiveAttackTokens, inActiveDefenceTokens].filter(Boolean).length)) {

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
  }
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
    console.table({
      currCom: JSON.stringify(currCom),
      currOpp: JSON.stringify(currOpp),
      cellPath: cellPath,
      travelPath: travelPath,
 
      remainderRisk: remainderRisk
    });

    adjustedRisk = getRisk(currCom, currOpp, comKey, oppKey, cellPath, travelPath, comLoopCount, oppLoopCount, breakout, com, opp);
  
    return adjustedRisk;
  }
  

  const breakoutOdds = 11/36;
  const defenceBreakoutSpot = 3.5;
  const attackBreakoutSpot = 17.5;
  
  const midBreakoutSpot = (attackBreakoutSpot + defenceBreakoutSpot) / 2;
  
  const activeOppTokens = Object.entries(opp).filter(([_, val]) => val.cell > 0 && val.cell < 51);
	
	
	let comLoopCount = 0;

	// Loop across COM 
	
  for (const comKey in com) {
    let oppLoopCount = 0;
    if (com.hasOwnProperty(comKey)) {
      let currCom = com[comKey];
      console.log(comKey)

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


	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	