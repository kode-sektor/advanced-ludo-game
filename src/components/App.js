import React, { Component } from "react";

import "./App.css";
import { players } from "./data/players.js";

export default class App extends Component {

	state = {
		players : players,
		activeId: "",
		inMotion: false,
		coordinates: { x: 0, y: 0}
		// coordinates: { x: "19.8vh", y: "19.8vh"}
	}

	turningPoints = [4, 10, 12, 17, 23, 25, 30, 36, 38, 43, 49];
	diagonals = [4, 17, 30, 43];

	direction = (cell, dieVal, id) => {
		let startCell = cell;
		let finalCell = cell + dieVal;

		let x = "";
		let y = "";

		filterCellRange = () => {
			let config = { startCell: 0, finalCell: 15 };

			const filteredCellRange = this.turningPoints.filter((item) => {
				return item > config.startCell && item < config.finalCell;
			});
			// console.log(filteredCellRange);	// [4, 10, 12]
		}

		const cellPaths = [];
		for (let i = 0; i < filteredCellRange.length; i++) {
			if (i === 0) {
				cellPaths.push(filteredCellRange[i]);	// 
			} else if (i === filteredCellRange.length - 1) {	// 4
				cellPaths.push(finalCell - filteredCellRange[i]);	// 10 - 4, 12 - 10
			} else {
				filteredCellRange[i] - filteredCellRange[i - 1];	// 15 - 12
			}
		}
		console.log(cellPaths); 	// [4, 6, 2, 3]

		if (this.state.players[`${id}`].cell <= 4 ||
			((this.state.players[`${id}`].cell >= 17) && this.state.players[`${id}`].cell <= 23) ||
			(this.state.players[`${id}`].cell >= 10 && this.state.players[`${id}`].cell <= 12)) {
			x = this.state.players[`${id}`].coordinates.x;
			y = -y;	// die value move
		}
		else if ((this.state.players[`${id}`].cell > 5 && this.state.players[`${id}`].cell <= 10) ||
			this.state.players[`${id}`].cell > 38 && this.state.players[`${id}`].cell <= 43) {
			x = -x;
			y = this.state.players[`${id}`].coordinates.y;

		} else if ((this.state.players[`${id}`].cell >= 12 && this.state.players[`${id}`].cell <= 17) ||
			(this.state.players[`${id}`].cell > 23 && this.state.players[`${id}`].cell <= 25) ||
			(this.state.players[`${id}`].cell > 30 && this.state.players[`${id}`].cell <= 36)) {
			x = x;
			y = this.state.players[`${id}`].coordinates.y;
		} else if ((this.state.players[`${id}`].cell > 25 && this.state.players[`${id}`].cell <= 30) ||
			(this.state.players[`${id}`].cell > 36 && this.state.players[`${id}`].cell <= 38) ||
			(this.state.players[`${id}`].cell > 43 && this.state.players[`${id}`].cell <= 49)) {
			x = this.state.players[`${id}`].coordinates.x;
			y = y;
		}
	}

	updatePosition = (id, diceVal) => {
		// Null set as initial position for each seed, not 0, because 0 represents the 6-0 starting position
		// New dice value will add to previous seed position for each seed while taking care of error that may
		// arise from addition with null
		this.setState({
			...this.state,
			players: {
				...this.state.players,
				[`${id}`]: {
					cell: this.state.players[`${id}`].cell === null ? diceVal : this.state.players[`${id}`].cell + diceVal
				}
			}
		})
	}

	randomDice = () => {
		const diceValues = [];
		for (let dicethrow = 0; dicethrow < 2; dicethrow++) {
			diceValues.push(Math.round(Math.random() * 15));	// Large number for testing purpose
		}
		return diceValues;
	}

	move({ x, y }, e) {
		const id = (e.currentTarget.id);

		let dieVal = this.randomDice();	// get dice Value
		dieVal = dieVal[0];	// for testing purpose, get 1 die Value
		console.log(dieVal);
		this.updatePosition(id, dieVal);	// Update cell position

		const initMove = (counter, displacement, dir) => {
			// Determine direction of travel. For diagonal travel, x & y must update in state at the same time
			dir = (displacement==="object") ? "diagonal" : dir;	
			console.log(dir);

			if (counter < 2) {
				setTimeout(() => {
					this.setState({
						...this.state,
						coordinates: {
							...this.state.coordinates,
							x: dir === "diagonal" ? this.state.coordinates.x + displacement.x : dir === "horiz" ? this.state.coordinates.x + displacement : this.state.coordinates.x,
							y: dir === "diagonal" ? this.state.coordinates.y + displacement.y : dir === "vert" ? this.state.coordinates.y + displacement : this.state.coordinates.y
						},
						activeId: counter === 0 ? id : this.state.activeId,	// select seed to move
						inMotion: counter === 1 ? false : true    // higher z-index when seed is in motion
					});
					counter++;
					initMove(counter, x, "horiz");
				}, counter === 0 ? 10 : 500);	// avoid setTimeout's first delay, then match transition's duration in css
			}
		}
		initMove(0 , y, "vert");
	}

	render() {
		return (
			<div className="board-game">
				<section className="board">
					<div className="ludo">
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
											style={{ transform: this.state.activeId === "seedOne" && `translate(${this.state.coordinates.x}vh, ${this.state.coordinates.y}vh)` }}
											onClick={(e) => { 
												this.move({x: 19.8, y: 19.8}, e) }
											}
											className={this.state.inMotion ? "moving seed" : "seed"} id="seedOne">
										</button>
									</div>
									<div className="cell">
										<button
											// onClick={(e) => { this.move({ coordinatesx: "19.8", coordinates.y: "13.2"}, e) }}
											className="seed" id="seed-ii">
										</button>
									</div>
									<div className="cell">
										<button
											className="seed" id="seed-iii">
										</button>
									</div>
									<div className="cell">
										<button
											// onClick={(e) => { this.move({ coordinatesx: "13.2", coordinates.y: "13.2"}, e) }}
											className="seed" id="seed-iv">
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
											onClick={(e) => { this.move() }}
											className="seed" id="seed-v">
										</button>
									</div>
									<div className="cell">
										<button
											onClick={(e) => { this.move() }}
											className="seed" id="seed-vi">
										</button>
									</div>
									<div className="cell">
										<button
											onClick={(e) => { this.move() }}
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
						<section className="home"></section>
					</div>
				</section>
				<div className="dice">
					<div className="side"></div>
					<div className="side"></div>
					<div className="side"></div>
					<div className="side"></div>
					<div className="side"></div>
					<div className="side"></div>
				</div>
			</div>
		);
	}
}
