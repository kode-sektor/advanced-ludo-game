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
				position: {x : 0, y: 0},
				rollDuration: 0
			},
			second: {
				value: 1,
				position: {x : 0, y: 0},
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
		// Null set as initial position for each seed, not 0, because 0 represents the 6-0 starting position
		// New dice value will add to previous seed position for each seed while taking care of error that may
		// arise from addition with null
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
			// Determine direction of travel. For diagonal travel, x & y must update in state at the same time

			// Breakout loop has to be looped over by 1 length less than array length because
			// the method in the loop works with both the current and next loop
			// However for a simple breakout move, loop across array length which is 2 [{x: 3}, {y: 3}]
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
							// When approaching diagonals, both x and y will advance 1 cell each
							// This advancement requires 1 to be subtracted from the next fragmented move 
							// values. 
							
							// For example, a total dice value of 15 from 6 - 0 position is broken
							// into [4, 6, 2, 3] where each value indicates a change in direction on either
							// x or y axis, just after 4 is a diagonal which would move both x & y by -1
							// respectively. So that means the fragmented moves array should transform 
							// into something like [4, [1,1], 5, 2, 3]. The next move after the diagonal
							// should become shorn of 1.
							
							// If it is on the fly while looping, a check will be made for these diagonals
							// which are 4, 17, 30 and 43 and the cell paths array 
							// console.log("this.state.players[`${id}`].cell + fragmentedMove :", this.state.players[`${id}`].cell + fragmentedMove);
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
				// Why put this in setTimeout() and not just setState() ordinarily?
				// The reason is because this else case will fire the setState() right away because
				// the 'if' of this else also sets state in a setTimeout(). In other words, you are 
				// setting state right away after just setting a state thus at risk of losing any
				// logic that runs on the last loop. 
				// For this reason, a setTimeout() must be set in this else case too.
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
				console.log("pcntStepRollDuration : ", pcntStepRollDuration);
				console.log("randomTimeout : ", randomTimeout);
				console.log("timeoutSegment : ", timeoutSegment);
				console.log("randomTimeout - timeoutSegment", (randomTimeout - timeoutSegment))

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

				// The problem with this is that it increments the 
				// timeoutSegment += pcntStepRollDuration * (randomTimeout - timeoutSegment);
				// return timeoutSegment;
				// Do the following instead:

				// Take care of last loop to ensure 3rd sequence matches total specified duration (e.g. 3 seconds)
				// By making pcntStepRollDuration = 1, this ensures the remaining sequence helps complete the 3-s duration
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
		const timeout = [];
		const duration = [];
		const dice = [];

		let dieRollOneSum = 0;
		let dieRollTwoSum = 0;

		const maxDiceCycle = (diceTimeout[0].length > diceTimeout[1].length) ? diceTimeout[0].length : diceTimeout[1].length;
		console.log(maxDiceCycle);

		for (let dieCycle = 0; dieCycle < maxDiceCycle; dieCycle++) {
			dieRollOneSum += diceTimeout[0][dieCycle];

			if (dieCycle === 0) {
				timeout.push(
					diceTimeout[0][dieCycle] < diceTimeout[1][0] ? diceTimeout[0][dieCycle] : diceTimeout[1][dieCycle]
				)
				duration.push(
					[
						[diceTimeout[0][0]],
						[diceTimeout[1][0]]
					]
				);
				dice.push([1, 2]);
			} else {	// If 2nd element exists in both arrays
				dieRollTwoSum += diceTimeout[1][dieCycle - 1]
				if (diceTimeout[0][dieCycle] && diceTimeout[1][dieCycle]) {	// Check if next element exists in diceTimeout's first array 
					if (dieRollOneSum < dieRollTwoSum) {
						timeout.push(
							diceTimeout[0][dieCycle],
							dieRollTwoSum - dieRollOneSum
						);
						duration.push(
							diceTimeout[0][dieCycle],
							diceTimeout[1][dieCycle]
						);
						dice.push([1, 2]);
					} else if (dieRollOneSum > dieRollTwoSum) {
						timeout.push(
							dieRollOneSum - dieRollTwoSum,
							diceTimeout[0][dieCycle] - (dieRollOneSum - dieRollTwoSum)
						);
						duration.push(diceTimeout[1][dieCycle], diceTimeout[0][dieCycle]);
						dice.push(2, 1);
					} else {	// Capture condition with same timeout and squash into 1 cycle to avoid setting state twice at the same time
						timeout.push(dieRollOneSum);
						duration.push(
							[
								diceTimeout[0][dieCycle], diceTimeout[1][dieCycle]
							]
						);
						dice.push([1, 2]);
					}
				} else {
					if (diceTimeout[0][dieCycle]) {	// Current iteration obtainable only in 1st array
						timeout.push(diceTimeout[0][dieCycle]);
						duration.push(diceTimeout[0][dieCycle]);
						dice.push(1);
					}
					if (diceTimeout[1][dieCycle]) {	// Current iteration obtainable only in 2nd array
						timeout.push(diceTimeout[1][dieCycle]);
						duration.push(diceTimeout[1][dieCycle]);
						dice.push(2);
					}
				}
			}
		}
		return [timeout, duration, dice];
	}

	selectDie = () => {

	}
	
	roll = (order) => {
		let cycleSteps = [];	
		let diceTimeout = [];
		
		cycleSteps = this.getDiceCycle();	// [3, 3]
		console.log(cycleSteps)
		diceTimeout[0] = this.getDiceTimeout(cycleSteps[0]);
		diceTimeout[1] = this.getDiceTimeout(cycleSteps[1]);

		console.log(diceTimeout);

		const diceData = this.computeDiceData(diceTimeout)
		console.log(diceData);

		// =============================================

		// let rollDuration = 3 // this.getRandomWithinRange(1.5, 3);	// 3
		// const cycleStep = 3  // this.getRandomWithinRange(1, 3, true);	// 3
		// const diceVals = this.randomDice();

		// const randomRoll = (step) => {
		// 	console.log("Cycle Step: ", cycleStep);
		// 	console.log("Roll Duration: ", rollDuration);

		// 	if (step < cycleStep) {
		// 		setTimeout(() => {
		// 			let pcntStepRollDuration = (this.getRandomWithinRange(16.7 / 100, 80 / 100));	// Between 16.7% and 80%
		// 			console.log("pcntStepRollDuration : ", pcntStepRollDuration);
		// 			let stepRollDuration = pcntStepRollDuration * rollDuration;	// e.g. 50% of 3 = 1.5
		// 			console.log("stepRollDuration : ", stepRollDuration)
		// 			rollDuration = rollDuration - stepRollDuration;	// e.g. 3 - 1.5
		// 			console.log("rollDuration : ", rollDuration)

		// 			let transformVals = []
		// 			for (let i = 0; i < 2; i++) {
		// 				transformVals.push(this.getRandomWithinRange(-400, 400));	// e.g. [309, -112]
		// 			}
		// 			console.log(transformVals[0], transformVals[1] )
		// 			this.setState({
		// 				...this.state,
		// 				dice: {
		// 					...this.state.dice,
		// 					[`${order}`]: {
		// 						value: "" ,
		// 						position: {
		// 							x: transformVals[0],
		// 							y: transformVals[1]
		// 						},
		// 						// rollDuration: rollDuration
		// 						rollDuration: 0.2
		// 					}
		// 				}
		// 			})
		// 			step++;
		// 			randomRoll(step)
		// 		// }, step === 0 ? 0 : rollDuration * 1000);	// 1, 2 or 3 (Condition to avoid delay on first run)
		// 		}, 200);	// 1, 2 or 3 (Condition to avoid delay on first run)
		// 	}
		// }
		// randomRoll(0);
	}

	rollDice = () => {
		this.roll("first");
		// this.roll("second");
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
											rotateY(${this.state.dice.first.position.y}deg)`,
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
										rotateY(${this.state.dice.second.position.y}deg)`,
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
