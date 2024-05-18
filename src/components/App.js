import React, { Component } from "react";

import "./App.css";
import { players } from "../data/players.js";
import { TURNING_POINTS, DIAGONALS, CELL_SPEED, CARDINAL_POINTS } from "../data/constants.js"

export default class App extends Component {

	constructor() {
        super();
    }

	state = {
		players : players,
		activeId: "",
		inMotion: false,
		transitionDuration: 0,
		dice: {
			first: {
				value: 1,
				position: {x: 0, y: 0, z: 0},
				rollDuration: 0
			},
			second: {
				value: 1,
				position: {x: 0, y: 0, z: 0},
				rollDuration: 0
			}
		}
	}

	fragmentMove = (id, startCell, finalCell, cellPaths) => {
		// let startCell = cell;	// 0
		// let finalCell = cell + dieVal;	// 15 
		// console.log("startCell: ", startCell);	console.log ("finalCell: ", finalCell)
		finalCell > 56 && (finalCell = 56);
		let filteredCellRange = [];

		((filterCellRange) => {
			filteredCellRange = TURNING_POINTS.filter((item) => {
				return item > startCell && item < finalCell;
			}); // [4, 10, 12]
		})()
		// console.log(filteredCellRange);

		for (let i = 0; i <= filteredCellRange.length; i++) {
			if (i === 0) {
				cellPaths.unshift(startCell);	// 0
				cellPaths.push(filteredCellRange[i] - startCell);	// 4 - 0
			} else if (i === filteredCellRange.length) {	
				cellPaths.push(finalCell - filteredCellRange[i - 1]);	// 15 - 12
			} else {
				// console.log(filteredCellRange[i])
				// console.log(filteredCellRange[i - 1])
				// console.log(filteredCellRange[i] - filteredCellRange[i - 1])
				cellPaths.push(filteredCellRange[i] - filteredCellRange[i - 1]);	// 4 - 0, 10 - 4, 12 - 10
			}
		}
		return cellPaths;	// [0, 4, 6, 2, 3]
	}

	updatePosition = (id, diceVal, coordinates, cellPath, duration) => {
		/*
			Null set as initial position for each seed, not 0, because 0 represents the 6-0 starting position
			New dice value will add to previous seed position for each seed while taking care of error that may
			arise from addition with null
		*/
		this.setState({
			...this.state,
			players: {
				...this.state.players,
				[`${id}`]: {
					...this.state.players[`${id}`],
					coordinates: [{ x: coordinates.x, y: coordinates.y }],
					cell: this.state.players[`${id}`].cell === null ? diceVal : this.state.players[`${id}`].cell + diceVal
				}
			},
			activeId: cellPath === 0 ? id : this.state.activeId,	// select seed to move
			inMotion: true,    // higher z-index when seed is in motion
			transitionDuration : duration 
		})
	}

	randomDice = (diceValues=[]) => {
		for (let dicethrow = 0; dicethrow < 2; dicethrow++) {
			diceValues.push(Math.floor(Math.random() * 6) + 1);	// Between 1 and 6
			// Check for double-six 
			if (dicethrow === 1) {
				if (diceValues.slice(-2)[0] === 6 && diceValues.slice(-2)[1] === 6) {
					this.randomDice(diceValues)
				}
			}
		}
		return diceValues;
	}

	move = (e) => {
		const diceValues = [];
		this.randomDice(diceValues);
		const totalDiceValues = diceValues.reduce((diceVals, dieVal) => diceVals + dieVal, 0);
		const cellPaths = [];
		const id = (e.currentTarget.id);
		// Only fragment total moves when not breaking away
		this.state.players[`${id}`].cell !== null && (
			this.fragmentMove(id, this.state.players[`${id}`].cell, this.state.players[`${id}`].cell + totalDiceValues, cellPaths)
		);

		let cellPath = 0;	// counter for modified setTimeout loop
		let timer = 0;
		let fragmentedMove = 0;

		const initMove = (breakout) => {
			/*
				Determine direction of travel. For diagonal travel, x & y must update in state at the same time

				Breakout loop has to be looped over by 1 length less than array length because
				the method in the loop works with both the current and next loop
				However for a simple breakout move, loop across array length which is 2 [{x: 3}, {y: 3}]
				
			*/
				const popCellPaths = (breakout === null) ? 0 : 1;
			let combinedPaths = (breakout === null) ? 2 : (cellPaths.length - 1)	
			if (cellPath < combinedPaths) {
				setTimeout(() => {
					let x = "";
					let y = "";

					if (breakout === null) {	// Tackle breakout move on '6' roll
						if (cellPath === 0) {	// First move seed on y-axis
							x = 0;
							y = this.state.players[`${id}`].breakout[0].y;
							timer = y * CELL_SPEED;
						} else {	// then move on x-axis to 6-0 position
							x = this.state.players[`${id}`].breakout[0].x;
							y = this.state.players[`${id}`].breakout[0].y;
							timer = x * CELL_SPEED;
						}
						console.log(timer);
					} else {
						fragmentedMove = cellPaths[cellPath + 1];
						// console.log("fragmentedMove :", fragmentedMove);
						// console.log("cell : ", this.state.players[`${id}`].cell)
						if (CARDINAL_POINTS.north.includes(this.state.players[`${id}`].cell)) {
							x = this.state.players[`${id}`].coordinates[0].x;
							y = this.state.players[`${id}`].coordinates[0].y - fragmentedMove;
						} else if (CARDINAL_POINTS.south.includes(this.state.players[`${id}`].cell)) {
							x = this.state.players[`${id}`].coordinates[0].x;
							y = this.state.players[`${id}`].coordinates[0].y + fragmentedMove;
						} else if (CARDINAL_POINTS.east.includes(this.state.players[`${id}`].cell)) {
							x = this.state.players[`${id}`].coordinates[0].x + fragmentedMove;
							y = this.state.players[`${id}`].coordinates[0].y;
						} else if (CARDINAL_POINTS.west.includes(this.state.players[`${id}`].cell)) {
							x = this.state.players[`${id}`].coordinates[0].x - fragmentedMove;
							y = this.state.players[`${id}`].coordinates[0].y;
						} else {
							/*
								When approaching diagonals, both x and y will advance 1 cell each
								This advancement requires 1 to be subtracted from the next fragmented move 
								values. 
								
								For example, a total dice value of 15 from 6 - 0 position is broken
								into [4, 6, 2, 3] where each value indicates a change in direction on either
								x or y axis, just after 4 is a diagonal which would move both x & y by -1
								respectively. So that means the fragmented moves array should transform 
								into something like [4, [1,1], 5, 2, 3]. The next move after the diagonal
								should become shorn of 1.
								
								If it is on the fly while looping, a check will be made for these diagonals
								which are 4, 17, 30 and 43 and the cell paths array 
								console.log("this.state.players[`${id}`].cell + fragmentedMove :", this.state.players[`${id}`].cell + fragmentedMove);
							*/
							if (cellPaths[cellPath + 1] > 1) {	// Next fragmented move must exist to set diagonal
								cellPaths[cellPath + 1] = cellPaths[cellPath + 1] - 1	// Subtract 1 from next 
								if (this.state.players[`${id}`].cell === 4) {
									cellPaths.splice(cellPath + 1, 0, [-1, -1]);	// [4, 6, 2, 3] to [4, [1,1], 5, 2, 3]
									x = this.state.players[`${id}`].coordinates[0].x - 1;
									y = this.state.players[`${id}`].coordinates[0].y - 1;
								} else if (this.state.players[`${id}`].cell === 17) {
									cellPaths.splice(cellPath + 1, 0, [1, -1]);
									x = this.state.players[`${id}`].coordinates[0].x + 1;
									y = this.state.players[`${id}`].coordinates[0].y - 1;
								} else if (this.state.players[`${id}`].cell === 30) {
									cellPaths.splice(cellPath + 1, 0, [1, 1]);
									x = this.state.players[`${id}`].coordinates[0].x + 1;
									y = this.state.players[`${id}`].coordinates[0].y + 1;
								} else if (this.state.players[`${id}`].cell === 43) {
									cellPaths.splice(cellPath + 1, 0, [-1, 1]);
									x = this.state.players[`${id}`].coordinates[0].x - 1;
									y = this.state.players[`${id}`].coordinates[0].y + 1;
								}
							} else {
								// If next turn after diagonal is 1
								// Make double confirmation it is the last fragmented move
								if ((cellPath + 1) === (cellPaths.length - 1)) {	// [4, 1] to [4, [1, 1]]
									cellPaths.splice(cellPaths.length - 1, 0);	// Instead of keeping a 0 move, completely remove it from loop
								}
							}
							fragmentedMove = 1;	// Add 1 cell distance if on diagonal
						}
						timer = fragmentedMove * CELL_SPEED
					}
					timer = timer.toFixed(2);
					this.updatePosition(id, fragmentedMove, { x, y }, cellPath, timer);	// Update cell position
					// console.log("cellPaths : ", JSON.stringify(cellPaths));
					cellPath++;
					initMove(this.state.players[`${id}`].cell);
				}, timer * 1000)
			} else {
				/*
					Why put this in setTimeout() and not just setState() ordinarily?
					The reason is because this else case will fire the setState() right away because
					the 'if' of this else also sets state in a setTimeout(). In other words, you are 
					setting state right away after just setting a state thus at risk of losing any
					logic that runs on the last loop. 
					For this reason, a setTimeout() must be set in this else case too.
				*/
				setTimeout(() => {
					this.setState({
						...this.state,
						inMotion : false
					})
				}, timer * 1000)
			}
		}
		initMove(this.state.players[`${id}`].cell);
	}

	getRandomWithinRange = (min, max, int=false) => {
		let result = 0;
		if (int) {
			min = Math.ceil(min);
			max = Math.floor(max);
		}
		result = int ?	// Random integer otherwise float
			Math.floor(Math.random() * (max - min + 1)) + min :
			Math.round(((Math.random() * (max - min)) + min) * 100) / 100;
		
		return result;	//
	}

	getDiceCycle = () => {
		const cycleSteps = [];
		cycleSteps[0] = this.getRandomWithinRange(1, 3, true);	// 3
		cycleSteps[1] = this.getRandomWithinRange(1, 3, true);	// 3

		return cycleSteps;	// [1, 3]
	}

	getDiceTimeout = (cycleSteps) => {
		let timeoutSegment = 0;
		let randomTimeout = this.getRandomWithinRange(1.5, 3);
		// console.log("randomTimeout : ", randomTimeout);
		
		const diceTimeout = ([...Array(cycleSteps)].map((_, i) => 0 + i)).map(
			(value, index) => {
				let pcntStepRollDuration = this.getRandomWithinRange(16.7 / 100, 80 / 100);	// Between 16.7% and 80%
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
				*/
				pcntStepRollDuration = index === Array(cycleSteps).length - 1 ? 1 : pcntStepRollDuration;

				value = pcntStepRollDuration * (randomTimeout - timeoutSegment);
				timeoutSegment += value;
				return Math.round(value * 100) / 100;
			}
		)
		return diceTimeout;
	}

	/*
		diceTimeout = [
			[1.08, 1.63]
	    	[1.3, 0.91]
		]
	*/
	computeDiceData = (diceTimeout) => {

		console.log("diceTimeout: ", diceTimeout);
		const timeout = [];
		const duration = [];
		const dice = [];

		let lastMaxCycle = false;

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
		dice.push([1, 2]);
		diceTimeoutSum += Math.min(dieRollOneSum, dieRollTwoSum);
		minDiceCycle.shift();
		maxDiceCycle.shift();

		const compileTimeout = (diff, dur, die) => {
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
						compileTimeout(dieRollOneSum - diceTimeoutSum,  currMaxDieCycle, 1);
					}
				} else {	// Child array no longer exists
					// Last cycle on both arrays
					if (maxDieCycle === maxDiceCycle.length - 1) {
						if (dieRollOneSum > dieRollTwoSum) {	// Use larger of die roll sums
							compileTimeout(dieRollOneSum - diceTimeoutSum,  currMaxDieCycle, 1);
						} else {
							compileTimeout(dieRollTwoSum - diceTimeoutSum,  currMaxDieCycle, 1);
						}
					} else {	// Child (minDiceArray completed) array but parent array loop continues
						compileTimeout(dieRollOneSum - diceTimeoutSum,  currMaxDieCycle, 1);
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

	selectDie = () => {

	}


	
	roll = () => {

		const mapDice = (value) => {
			
			let dieTransformX = 0;
			let dieTransformY = 0;
			let dieTransformZ = 0;

			const randomTransforms = [360, 0, -360];
			const diceTransformMap = {	// [x, y coordinates of die value]
				1 : [0, 0],
				2 : [270, 0], 
				3 : [0, 90],
				4 : [0, 270],
				5 : [90, 0],
				6 : [0, 180]    // Also [180, 0]
			}

			dieTransformX = diceTransformMap[value][0] + randomTransforms[this.getRandomWithinRange(0, 2, true)] + this.getRandomWithinRange(0, 10);
			/*
				If die value is 2 or 5, run random transform-Y value because die will roll on Y-axis,
				hence the current die face stays the same.
				Then flip transform-Z + or -360deg to make a complete spin and return to current die face
				
				This piece of code (this.getRandomWithinRange(0, 10)) gets a random number between 0 and 10 to just tilt
				the die slightly in random direction to add visual depth. The maximum possible tilt though is not 10 deg
				but 20 deg because 2 transforms are at play on a die to make the tilt. For e.g, if the die value is 3, 
				dieTransformX and dieTransformZ if in the same direction and with the maximum possible tilt (10deg), would
				add to each other to become 20deg
			*/
			if (value === 2 || value === 5) {
				dieTransformY = this.getRandomWithinRange(-400, 400);
				dieTransformZ = randomTransforms[this.getRandomWithinRange(0, 2, true)] + this.getRandomWithinRange(0, 10);
			} else if (value === 3 || value === 4) {
				dieTransformX = randomTransforms[this.getRandomWithinRange(0, 2, true)] + this.getRandomWithinRange(0, 10);
				dieTransformY = diceTransformMap[value][1] + randomTransforms[this.getRandomWithinRange(0, 2, true)] + this.getRandomWithinRange(1, 10);
				dieTransformZ = randomTransforms[this.getRandomWithinRange(0, 2, true)] + this.getRandomWithinRange(0, 10);
			}
			else {
				dieTransformY = diceTransformMap[value][1] + randomTransforms[this.getRandomWithinRange(0, 2, true)] + this.getRandomWithinRange(0, 10);
				dieTransformZ = this.getRandomWithinRange(-400, 400);
			}
			console.log("ALL TRANSFORMS: ", [dieTransformX, dieTransformY, dieTransformZ]);
			return [dieTransformX, dieTransformY, dieTransformZ];
		}
		const mappedDieTransform = mapDice(6);		

		let cycleSteps = [];	
		let diceTimeout = [];
		
		cycleSteps = this.getDiceCycle();	// [3, 3]
		console.log(cycleSteps)
		// diceTimeout[0] = this.getDiceTimeout(cycleSteps[0]);
		// diceTimeout[1] = this.getDiceTimeout(cycleSteps[1]);

		diceTimeout[0] = [1.42, 0.45, 0.35];
		diceTimeout[1] = [0.7, 1.09, 1.9];

		console.log(diceTimeout.slice());

		const diceData = this.computeDiceData(
			[
				[1.42, 0.45, 0.35],
				[0.7, 1.09, 1.9]
			]
		)
		/*
			Returns something like: 
			[
				[0.7, 0.72, 0.44999999999999996, 1.82] 	 // timeout (settransition loop time)
				[Array(2), 1.09, Array(2), 0.35]	// die transition duration (css)	
				[Array(2), 2, Array(2), 1]	// dice 
			]
		*/
		console.log(diceData);

		let rollDuration = 3 // this.getRandomWithinRange(1.5, 3);	// 3
		const cycleStep = diceData[0].length;
		const diceVals = this.randomDice();

		let diceArrLastCycle = 0;
		let dieOneLastCycle = 0;
		let dieTwoLastCycle = 0;
		
		// Catch loop that maps as last loop to original diceTimeout array
		/* 
			Attempt to determine index of last entries of die 1 and 2.
			These last indexes of the die 1 and 2 enables us to apply the correct die value position
			on final timeout
		*/
		if (Array.isArray(diceData[2][diceData[2].length - 1])) {	
			dieOneLastCycle = diceData[2][diceData[2].length - 1];
			dieTwoLastCycle = diceData[2][diceData[2].length - 1];
		} else {
			diceArrLastCycle = diceData[2].findLastIndex((element) => Array.isArray(element) === true);
			dieOneLastCycle = diceData[2].findLastIndex((element) => element === 1);
			dieTwoLastCycle = diceData[2].findLastIndex((element) => element === 2);

			dieOneLastCycle = (dieOneLastCycle > diceArrLastCycle) ? dieOneLastCycle : diceArrLastCycle;
			dieTwoLastCycle = (dieTwoLastCycle > diceArrLastCycle) ? dieTwoLastCycle : diceArrLastCycle;
		}

		const randomRoll = (step) => {

			console.log("dieOneLastCycle : ", dieOneLastCycle);
			console.log("dieTwoLastCycle : ", dieTwoLastCycle);

			if (step < cycleStep) {
				
				setTimeout(() => {
					let transformVals = []
					for (let i = 0; i < 6; i++) {
						transformVals.push(this.getRandomWithinRange(-400, 400));	// e.g. [309, -112]
					}
					console.log(transformVals);

					let currTimeout = diceData[0][step];
					let currDuration = diceData[1][step];
					let currDice = diceData[2][step];
					
					this.setState({
						...this.state,
						dice: {
							...this.state.dice,
							first: {
								value: "" ,
								/* position: {
									x: transformVals[0],
									y: transformVals[1],
									z: transformVals[2]
								}, */
								position: {
									x: step === dieOneLastCycle ? mappedDieTransform[0] : transformVals[0],
									y: step === dieOneLastCycle ? mappedDieTransform[1] : transformVals[1],
									z: step === dieOneLastCycle ? mappedDieTransform[2] : transformVals[2]
								},
								rollDuration: currDuration
							},
							// second: {
							// 	value: "" ,
							// 	position: {
							// 		x: transformVals[3],
							// 		y: transformVals[4],
							// 		z: transformVals[5]
							// 	},
							// 	rollDuration: currDuration
							// }
						}
					})
					step++;
					randomRoll(step)
				}, step === 0 ? 0 : diceData[0][step] * 1000);	// 1, 2 or 3 (Condition to avoid delay on first run)
			}
		}
		randomRoll(0);
	}

	rollDice = () => {
		this.roll();
	}

	render() {
		return (
			<div className="board-game">
				<section className="dice-widget">
					<section className="roll-series">
						{/* Double-six multiple rolls */}
					</section>
					<section className="roll-button-container">
						<div id="roll-button" className="roll-button" onClick={(e) => this.rollDice()}>
							<button className="roll" role="button">Roll</button>
						</div>
					</section>
				</section>
				<section className="board">
					<section className="ludo">
						<section className="base home-one">
							<section className="outpost-lane">
								<div className="cell" title="11"></div>
								<div className="cell" title="10"></div>
								<div className="cell" title="9"></div>
								<div className="cell" title="8"></div>
								<div className="cell" title="7"></div>
								<div className="cell" title="6"></div>
							</section>
							<section className="camp">
								<section className="window">
									<div className="cell">
										<button
											disabled={this.state.inMotion}
											style={{
												transform: `translate(${this.state.players.seedOne.coordinates[0].x * 6.6}vh, 
														${this.state.players.seedOne.coordinates[0].y * 6.6}vh)`,
												transitionDuration: this.state.transitionDuration + "s"
											}}
											onClick={(e) => {this.move(e) }}
											className={this.state.inMotion ? "moving seed" : "seed"}
											id="seedOne">
										</button>
									</div>
									<div className="cell">
										<button
											disabled={this.state.inMotion}
											style={{
												transform: `translate(${this.state.players.seedTwo.coordinates[0].x * 6.6}vh, 
														${this.state.players.seedTwo.coordinates[0].y * 6.6}vh)`,
												transitionDuration: this.state.transitionDuration + "s"
											}}
											onClick={(e) => { this.move(e)}}
											className={this.state.inMotion ? "moving seed" : "seed"}
											id="seedTwo">
										</button>
									</div>
									<div className="cell">
										<button
											disabled={this.state.inMotion}
											style={{
												transform: `translate(${this.state.players.seedThree.coordinates[0].x * 6.6}vh, 
														${this.state.players.seedThree.coordinates[0].y * 6.6}vh)`,
												transitionDuration: this.state.transitionDuration + "s"
											}}
											onClick={(e) => { this.move(e) }}
											className={this.state.inMotion ? "moving seed" : "seed"}
											id="seedThree">
										</button>
									</div>
									<div className="cell">
										<button
											disabled={this.state.inMotion}
											style={{
												transform: `translate(${this.state.players.seedFour.coordinates[0].x * 6.6}vh, 
														${this.state.players.seedFour.coordinates[0].y * 6.6}vh)`,
												transitionDuration: this.state.transitionDuration + "s"
											}}
											onClick={(e) => { this.move(e) }}
											className={this.state.inMotion ? "moving seed" : "seed"}
											id="seedFour">
										</button>
									</div>
								</section>
								<section className="imprint">
									<span>LUDO</span>
								</section>
								<section className="imprint">
									<span>LUDO</span>
								</section>
							</section>
							<section className="exit">
								<section className="lair">
									<div className="cell" title="6"></div>
									<div className="cell" title="5"></div>
									<div className="cell" title="4"></div>
									<div className="cell" title="3"></div>
									<div className="cell" title="2"></div>
									<div className="cell" title="1"></div>
									<div className="cell" title="52"></div>
								</section>
								<section className="portal">
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell" title="51"></div>
								</section>
							</section>
						</section>
						<section className="base home-two">
							<section className="outpost-lane">
								<div className="cell" title="24"></div>
								<div className="cell" title="23"></div>
								<div className="cell" title="22"></div>
								<div className="cell" title="21"></div>
								<div className="cell" title="20"></div>
								<div className="cell" title="19"></div>
							</section>
							<section className="camp">
								<section className="window">
									<div className="cell">
										<button
											onClick={(e) => { this.move()}}
											className="seed" id="seed-v">
										</button>
									</div>
									<div className="cell">
										<button
											onClick={(e) => { this.move()}}
											className="seed" id="seed-vi">
										</button>
									</div>
									<div className="cell">
										<button
											onClick={(e) => { this.move()}}
											className="seed" id="seed-vii">
										</button>
									</div>
									<div className="cell">
										<button
											onClick={(e) => { this.move() }}
											className="seed" id="seed-viii">
										</button>
									</div>
								</section>
								<section className="imprint">
									<span>LUDO</span>
								</section>
								<section className="imprint">
									<span>LUDO</span>
								</section>
							</section>
							<section className="exit">
								<section className="lair">
									<div className="cell"></div>
									<div className="cell" title="18"></div>
									<div className="cell" title="17"></div>
									<div className="cell" title="16"></div>
									<div className="cell" title="15"></div>
									<div className="cell" title="14"></div>
									<div className="cell" title="13"></div>
								</section>
								<section className="portal">
									<div className="cell" title=""></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell" title="12"></div>
								</section>
							</section>
						</section>
						<section className="base home-three">
							<section className="outpost-lane">
								<div className="cell" title="37"></div>
								<div className="cell" title="36"></div>
								<div className="cell" title="35"></div>
								<div className="cell" title="34"></div>
								<div className="cell" title="33"></div>
								<div className="cell" title="32"></div>
							</section>
							<section className="camp">
								<section className="window">
									<div className="cell">
										<button 
											onClick={(e) => { this.move() }}
											className="seed" id="seed-ix">
										</button>
									</div>
									<div className="cell">
										<button 
											onClick={(e) => { this.move() }}
											className="seed" id="seed-x">
										</button>
									</div>
									<div className="cell">
										<button 
											onClick={(e) => { this.move() }}
											className="seed" id="seed-xi">
										</button>
									</div>
									<div className="cell">
										<button 
											onClick={(e) => { this.move() }}
											className="seed" id="seed-xii">
										</button>
									</div>
								</section>
								<section className="imprint">
									<span>LUDO</span>
								</section>
								<section className="imprint">
									<span>LUDO</span>
								</section>
							</section>
							<section className="exit">
								<section className="lair">
									<div className="cell"></div>
									<div className="cell" title="31"></div>
									<div className="cell" title="30"></div>
									<div className="cell" title="29"></div>
									<div className="cell" title="28"></div>
									<div className="cell" title="27"></div>
									<div className="cell" title="26"></div>
								</section>
								<section className="portal">
									<div className="cell" title=""></div>
									<div className="cell" title=""></div>
									<div className="cell" title=""></div>
									<div className="cell" title=""></div>
									<div className="cell" title=""></div>
									<div className="cell" title=""></div>
									<div className="cell" title="25"></div>
								</section>
							</section>
						</section>
						<section className="base home-four">
							<section className="outpost-lane">
								<div className="cell" title="50"></div>
								<div className="cell" title="49"></div>
								<div className="cell" title="48"></div>
								<div className="cell" title="47"></div>
								<div className="cell" title="46"></div>
								<div className="cell" title="45"></div>
							</section>
							<section className="camp">
								<section className="window">
									<div className="cell">
										<button 
											onClick={(e) => { this.move() }}
											className="seed" id="seed-xiii">
										</button>
									</div>
									<div className="cell">
										<button 
											onClick={(e) => { this.move() }}
											className="seed" id="seed-xiv">
										</button>
									</div>
									<div className="cell">
										<button 
											onClick={(e) => { this.move() }}
											className="seed" id="seed-xv">
										</button>
									</div>
									<div className="cell">
										<button 
											onClick={(e) => { this.move() }}
											className="seed" id="seed-xvi">
										</button>
									</div>
								</section>
								<section className="imprint">
									<span>LUDO</span>
								</section>
								<section className="imprint">
									<span>LUDO</span>
								</section>
							</section>
							<section className="exit">
								<section className="lair">
									<div className="cell" title=""></div>
									<div className="cell" title="44"></div>
									<div className="cell" title="43"></div>
									<div className="cell" title="42"></div>
									<div className="cell" title="41"></div>
									<div className="cell" title="40"></div>
									<div className="cell" title="39"></div>
								</section>
								<section className="portal">
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell"></div>
									<div className="cell" title="38"></div>
								</section>
							</section>
						</section>
						{/* The centre cellbox of the Ludo */}
						<section className="home"></section>
						<section className="dice-container">
							<div id="die-one" className="die"
								style={{
										transform: `rotateX(${this.state.dice.first.position.x}deg)
											rotateY(${this.state.dice.first.position.y}deg)
											rotateZ(${this.state.dice.first.position.z}deg)`,
										transitionDuration: this.state.dice.first.rollDuration + "s"
								}}>
								<div className="side-one"></div>
								<div className="side-two"></div>
								<div className="side-three">
									<div className="die-inner"></div>
								</div>
								<div className="side-four">
									<div className="die-inner"></div>
								</div>
								<div className="side-five">
									<div className="die-inner"></div>
									<div className="die-inner"></div>
								</div>
								<div className="side-six">
									<div className="die-inner"></div>
									<div className="die-inner"></div>
								</div>
							</div>								
							<div id="die-two" className="die"
								style={{
									transform: `rotateX(${this.state.dice.second.position.x}deg)
										rotateY(${this.state.dice.second.position.y}deg),
										rotateZ(${this.state.dice.second.position.z}deg)`,
									transitionDuration: this.state.dice.second.rollDuration + "s"
								}}>
								<div className="side-one"></div>
								<div className="side-two"></div>
								<div className="side-three">
									<div className="die-inner"></div>
								</div>
								<div className="side-four">
									<div className="die-inner"></div>
								</div>
								<div className="side-five">
									<div className="die-inner"></div>
									<div className="die-inner"></div>
								</div>
								<div className="side-six">
									<div className="die-inner"></div>
									<div className="die-inner"></div>
								</div>
							</div>								
						</section>
					</section>
				</section>
				<aside className="stats"></aside>
			</div>
		);
	}
}
