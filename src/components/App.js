import React, { Component } from "react";

import "./App.css";
import { players } from "../data/players.js";
import { TURNING_POINTS, DIAGONALS, CELL_SPEED, CARDINAL_POINTS } from "../data/constants.js"

import RollBtn from '../components/RollBtn/RollBtn.js'
import DiceValues from '../components/DiceValues/DiceValues.js'
import DiceCount from '../components/DiceCount/DiceCount.js'
import Seed from '../components/Seed/Seed.js'
import Dice from '../components/Dice/Dice.js'

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
			1: {
				asst: [],
				position: {x: 0, y: 0, z: 0},
				rollDuration: 0
			},
			2: {
				asst: [],
				position: {x: 0, y: 0, z: 0},
				rollDuration: 0
			}
		},
		doubleSix: false
	}

	setDice = (diceObj) => {
		this.setState({
			...this.state,
			dice: {
				...this.state.dice,
				...diceObj
			}
		})
	}

	setDiceAssistant = (diceObj) => {
		console.log(diceObj)
		this.setState({
			...this.state,
			dice: {
				1: {
					...this.state.dice[1],
					asst : [...this.state.dice[1].asst, diceObj[1].asst] 
				},
				2: {
					...this.state.dice[2],
					asst : [...this.state.dice[2].asst, diceObj[2].asst]
				}
			}
		})
	}

	updateDiceAssistant = (die, index, diceObj) => {
		let asst = this.state.dice[die].asst;    // [{selected: false, disabled: false, value: 6}...]
		let currAsst = asst[index];    // [{selected: false, disabled: false, value: 6}]
		let obj = { ...currAsst, ...diceObj };    // [{selected: false, disabled: true, value: 6}]
		asst[index] = obj;

		this.setState({
			...this.state,
			dice: {
				...this.state.dice,
				[`${die}`]: {
					...this.state.dice[`${die}`],
					asst : asst 
				}
			}
		})
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

	render() {
		let state = this.state;
		let dice = this.state.dice;

		return (
			<div className="board-game">
				<section className="dice-widget">
					<section className="roll-series">
						<DiceCount
							dice={dice}
						/>
						<DiceValues
							dice={dice}
							updateDiceAssistant={this.updateDiceAssistant}
						/>
					</section>
					<RollBtn
						setDice={this.setDice}
						setDiceAssistant={this.setDiceAssistant}
						dice={this.state.dice}
					/>
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
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedOne.coordinates[0].x,
													y: this.state.players.seedOne.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedOne"
										/>
									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedTwo.coordinates[0].x,
													y: this.state.players.seedTwo.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedTwo"
										/>
									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedThree.coordinates[0].x,
													y: this.state.players.seedThree.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedThree"
										/>
									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedFour.coordinates[0].x,
													y: this.state.players.seedFour.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedFour"
										/>
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
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedFive.coordinates[0].x,
													y: this.state.players.seedFive.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedFive"
										/>
									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedSix.coordinates[0].x,
													y: this.state.players.seedSix.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedSix"
										/>

									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedSeven.coordinates[0].x,
													y: this.state.players.seedSeven.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedSeven"
										/>
									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedEight.coordinates[0].x,
													y: this.state.players.seedEight.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedEight"
										/>
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
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedNine.coordinates[0].x,
													y: this.state.players.seedNine.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedNine"
										/>
									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedTen.coordinates[0].x,
													y: this.state.players.seedTen.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedTen"
										/>
									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedEleven.coordinates[0].x,
													y: this.state.players.seedEleven.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedEleven"
										/>
									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedTwelve.coordinates[0].x,
													y: this.state.players.seedTwelve.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedTwelve"
										/>
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
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedThirteen.coordinates[0].x,
													y: this.state.players.seedThirteen.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedThirteen"
										/>
									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedFourteen.coordinates[0].x,
													y: this.state.players.seedFourteen.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedFourteen"
										/>
									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedFifteen.coordinates[0].x,
													y: this.state.players.seedFifteen.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedFifteen"
										/>
									</div>
									<div className="cell">
										<Seed 
											inMotion={this.state.inMotion}
											coords={
												{
													x: this.state.players.seedSixteen.coordinates[0].x,
													y: this.state.players.seedSixteen.coordinates[0].y
												}
											}
											dur={this.state.transitionDuration}
											move={this.move}
											id="seedSixteen"
										/>
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
							<Dice
								dice={this.state.dice}
							/>
						</section>
					</section>
				</section>
				<aside className="stats"></aside>
			</div>
		);
	}
}
