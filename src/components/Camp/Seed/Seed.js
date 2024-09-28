import React, { Component } from 'react';

import { TURNING_POINTS, DIAGONALS, CELL_SPEED, CARDINAL_POINTS } from "../../../data/constants.js"
import { seeds } from "../../../data/seeds.js";
import { TOTAL_CELLS } from '../../../data/constants.js'
import { calcMoveDistance, canBreakAway, getRandomWithinRange, getActivePlayers, isActiveToken, checkSix } from '../../functions.js'
import { settings } from '../../settings.js'


export default class RollBtn extends Component {

	state = {
		seeds: seeds,
		absCell: 0,
		movable: false,
		inMotion: false,
		transitionDuration: 0,
	}

	activePlayers = getActivePlayers();	// 1, 2, 3 or 4

	componentDidUpdate = () => {
		this.isMovable();
    }

	isMovable = () => {
		let id = this.props.id;
		let cell = seeds[id].cell;

		let moveDistance = calcMoveDistance(this.props.dice);
		console.log(this.props);
		
		// Disable all tokens if any token is in motion
		if (this.state.inMotion) {
			if (this.state.movable === true) {
				this.setState({
					...this.state,
					movable: false
				})
			}	
			console.log('inMotion');
		// Disable token if no '6' or if prospective move takes token out beyond portal
		} else if (!canBreakAway(cell, this.props.dice) || (cell + moveDistance > TOTAL_CELLS + 6)) {
			if (this.state.movable === true) {
				this.setState({
					...this.state,
					movable: false
				})
			}	
			console.log('!canBreakAway');
		// Prevent selection of opponent token
		} else {
			console.log('can break away');
			if (isActiveToken(id, this.props.turn)) {	// 
				if (this.state.movable === false) {
					this.setState({
						...this.state,
						movable: true
					})
				}
			}
		}
	}

	updatePosition = (id, diceVal, coordinates, cellPath, duration) => {
		console.log(id, diceVal, coordinates, cellPath, duration);
		/*
			Null set as initial position for each seed, not 0, because 0 represents the 6-0 starting position
			New dice value will add to previous seed position for each seed while taking care of error that may
			arise from addition with null
		*/

		if (this.state.seeds[`${id}`].cell === null) {
			this.setState({
				...this.state,
				seeds: {
					...this.state.seeds,
					[`${id}`]: {
						...this.state.seeds[`${id}`],
						coordinates: [{ x: coordinates.x, y: coordinates.y }],
						cell: cellPath === 1 ? 0 : null
					}
				},
				activeId: cellPath === 0 ? id : this.state.activeId,	// select seed to move
				inMotion: true,    // higher z-index when seed is in motion
				transitionDuration : duration 
			})
		} else {
			this.setState({
				...this.state,
				seeds: {
					...this.state.seeds,
					[`${id}`]: {
						...this.state.seeds[`${id}`],
						coordinates: [{ x: coordinates.x, y: coordinates.y }],
						cell: this.state.seeds[`${id}`].cell + diceVal
					}
				},
				activeId: cellPath === 0 ? id : this.state.activeId,	// select seed to move
				inMotion: true,    // higher z-index when seed is in motion
				transitionDuration : duration 
			})
		}
	}

	fragmentMove = (id, startCell, finalCell, cellPaths) => {

		console.log(startCell);
		console.log(finalCell);

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
		console.log(cellPaths);
		return cellPaths;	// [0, 4, 6, 2, 3]
	}

	move = (e) => {
		const diceValues = [];
		const cellPaths = [];
		const id = (e.currentTarget.id);
		console.log(id);

		// this.randomDice(diceValues);
		// const totalDiceValues = diceValues.reduce((diceVals, dieVal) => diceVals + dieVal, 0);

		// Imagine dice values of [6, 6, 2, 3]. To move seed from camped position, a '6' is needed.
		// This code accounts for that '6' to break out seed
		let moveDistance = this.props.moveDistance;
		let startCell = 0;

		if (this.state.seeds[`${id}`].cell === null) {
			moveDistance = moveDistance - 6;
			startCell = 0;	// null cannot work with numbers. Make it 0 if null

			// The move to push inactive token to 6-0 spot requires 2 moves (loops). The 3rd loop, thus, would have
			// skipped the first 2 null elements. This ensures the array shapeshifts correctly if the token to be
			// moved is a camped one.
			cellPaths.unshift(null, null);
		} else {
			startCell = this.state.seeds[`${id}`].cell;
		}
	
		this.fragmentMove(id, startCell, startCell + moveDistance, cellPaths);

		// console.log(checkSix());

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
			let combinedPaths = (breakout === null) ? 2 + (cellPaths.length - 1) : (cellPaths.length - 1);	
			
			if (cellPath < combinedPaths) {
				setTimeout(() => {
					let x = "";
					let y = "";

					// if (breakout === null) {	// Tackle breakout move on '6' roll
					if (combinedPaths < 2) {
						if (cellPath === 0) {	// First move seed on y-axis
							x = 0;
							y = this.state.seeds[`${id}`].breakout[0].y;
							timer = y * CELL_SPEED;
						} else {	// then move on x-axis to 6-0 position
							x = this.state.seeds[`${id}`].breakout[0].x;
							y = this.state.seeds[`${id}`].breakout[0].y;
							timer = x * CELL_SPEED;
						}
						console.log(timer);
					} else {
						fragmentedMove = cellPaths[cellPath + 1];
						console.log("fragmentedMove :", fragmentedMove);
						console.log("cell : ", this.state.seeds[`${id}`].cell)
						if (CARDINAL_POINTS.north.includes(this.state.seeds[`${id}`].cell)) {
							x = this.state.seeds[`${id}`].coordinates[0].x;
							y = this.state.seeds[`${id}`].coordinates[0].y - fragmentedMove;
						} else if (CARDINAL_POINTS.south.includes(this.state.seeds[`${id}`].cell)) {
							x = this.state.seeds[`${id}`].coordinates[0].x;
							y = this.state.seeds[`${id}`].coordinates[0].y + fragmentedMove;
						} else if (CARDINAL_POINTS.east.includes(this.state.seeds[`${id}`].cell)) {
							x = this.state.seeds[`${id}`].coordinates[0].x + fragmentedMove;
							y = this.state.seeds[`${id}`].coordinates[0].y;
						} else if (CARDINAL_POINTS.west.includes(this.state.seeds[`${id}`].cell)) {
							x = this.state.seeds[`${id}`].coordinates[0].x - fragmentedMove;
							y = this.state.seeds[`${id}`].coordinates[0].y;
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
								console.log("this.state.seeds[`${id}`].cell + fragmentedMove :", this.state.seeds[`${id}`].cell + fragmentedMove);
							*/
							if (cellPaths[cellPath + 1] > 1) {	// Next fragmented move must exist to set diagonal
								cellPaths[cellPath + 1] = cellPaths[cellPath + 1] - 1	// Subtract 1 from next 
								if (this.state.seeds[`${id}`].cell === 4) {
									cellPaths.splice(cellPath + 1, 0, [-1, -1]);	// [4, 6, 2, 3] to [4, [1,1], 5, 2, 3]
									x = this.state.seeds[`${id}`].coordinates[0].x - 1;
									y = this.state.seeds[`${id}`].coordinates[0].y - 1;
								} else if (this.state.seeds[`${id}`].cell === 17) {
									cellPaths.splice(cellPath + 1, 0, [1, -1]);
									x = this.state.seeds[`${id}`].coordinates[0].x + 1;
									y = this.state.seeds[`${id}`].coordinates[0].y - 1;
								} else if (this.state.seeds[`${id}`].cell === 30) {
									cellPaths.splice(cellPath + 1, 0, [1, 1]);
									x = this.state.seeds[`${id}`].coordinates[0].x + 1;
									y = this.state.seeds[`${id}`].coordinates[0].y + 1;
								} else if (this.state.seeds[`${id}`].cell === 43) {
									cellPaths.splice(cellPath + 1, 0, [-1, 1]);
									x = this.state.seeds[`${id}`].coordinates[0].x - 1;
									y = this.state.seeds[`${id}`].coordinates[0].y + 1;
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
					this.props.updatePosition(id, fragmentedMove, { x, y }, cellPath, timer);	// Update cell position
					// console.log("cellPaths : ", JSON.stringify(cellPaths));
					cellPath++;
					initMove(this.state.seeds[`${id}`].cell);
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
		initMove(this.state.seeds[`${id}`].cell);
	}

	render() {

		console.log(this.state);
		const { inMotion, coords, move, dur, id } = this.props;

		console.log(this.props);

		return (
			<button 
				disabled={!this.state.movable}
				className={inMotion ? "moving seed" : "seed"}
				id={id}
				style={{
					transform: `translate(${coords.x * 6.6}vh, 
							${coords.y * 6.6}vh)`,
					transitionDuration: this.state.transitionDuration + "s"
				}}
				onClick={(e) => {this.move(e)}}
				>
			</button>
		)
	}
}
