import React, { Component } from "react";

import "./App.css";
import { settings } from './settings.js'
import { seeds } from "../data/seeds.js";

import Dice from '../components/Dice/Dice.js'
import Camp from '../components/Camp/Camp.js'
import OutpostLane from '../components/OutpostLane/OutpostLane.js'
import Exit from '../components/Exit/Exit.js'
import DiceWidget from "./DiceWidget/DiceWidget.js";
import { getRandomWithinRange, calcMoveDistance } from './functions.js'

export default class App extends Component {

	constructor() {
        super();
    }

	state = {
		seeds : seeds,
		activeId: "",
		inMotion: false,
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
		doubleSix: false,
		absSix: false,
		turn: settings.turn	// 0
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

	checkForAbsoluteSix = () => {
		let diceOneAsst = Object.values(this.state.dice[1])[0];
		let diceTwoAsst = Object.values(this.state.dice[2])[0];

		const filteredDiceOneAsst = diceOneAsst.some((die) => die.selected === true && die.disabled === false);

	}

	turn = () => getRandomWithinRange(0, (this.activePlayers.length - 1), true);	// 0, 
	
	updatePosition = (id, diceVal, coordinates, cellPath, duration) => {
		console.log(id, diceVal, coordinates, cellPath, duration);
		/*
			Null set as initial position for each seed, not 0, because 0 represents the 6-0 starting position
			New dice value will add to previous seed position for each seed while taking care of error that may
			arise from addition with null
		*/
		this.setState({
			...this.state,
			seeds: {
				...this.state.seeds,
				[`${id}`]: {
					...this.state.seeds[`${id}`],
					coordinates: [{ x: coordinates.x, y: coordinates.y }],
					cell: this.state.seeds[`${id}`].cell === null ? diceVal : this.state.seeds[`${id}`].cell + diceVal
				}
			},
			activeId: cellPath === 0 ? id : this.state.activeId,	// select seed to move
			inMotion: true,    // higher z-index when seed is in motion
			transitionDuration : duration 
		})
	}

	render() {
		let state = this.state;
		let dice = state.dice;
		let turn = state.turn;
		let seeds = state.seeds;
		let updatePosition = this.updatePosition;

		return (
			<div className="board-game">
				<DiceWidget
					dice={dice}
					setDice={this.setDice}
					setDiceAssistant={this.setDiceAssistant}
					updateDiceAssistant={this.updateDiceAssistant}
					moveDistance={calcMoveDistance(this.state.dice)}
				/>
				<section className="board">
					<section className="ludo">
						<section className="base home-one">
							<OutpostLane
								max={11}
								min={6}
							/>
							<Camp 
								base={["One", "Two", "Three", "Four"]}
								dice={dice}
								turn={turn}
								id={0}
								moveDistance={calcMoveDistance(this.state.dice)}
								seeds={seeds}
								updatePosition={updatePosition}
							/>
							<Exit 
								base={"home-one"}
								max={5}
								min={0}
								portal={6}
							/>
						</section>
						<section className="base home-two">
							<OutpostLane
								max={24}
								min={19}
							/>
							<Camp 
								base={["Five", "Six", "Seven", "Eight"]}
								dice={dice}
								turn={turn}
								id={1}
								moveDistance={calcMoveDistance(this.state.dice)}
								seeds={seeds}
								updatePosition={updatePosition}
							/>
							<Exit 
								base={"home-two"}
								max={18}
								min={13}
								portal={6}
							/>
						</section>
						<section className="base home-three">
							<OutpostLane
								max={37}
								min={32}
							/>
							<Camp 
								base={["Nine", "Ten", "Eleven", "Twelve"]}
								dice={dice}
								turn={turn}
								id={2}
								moveDistance={calcMoveDistance(this.state.dice)}
								seeds={seeds}
								updatePosition={updatePosition}
							/>
							<Exit 
								base={"home-three"}
								max={31}
								min={26}
								portal={6}
							/>
						</section>
						<section className="base home-four">
							<OutpostLane
								max={50}
								min={45}
							/>
							<Camp 
								base={["Thirteen", "Fourteen", "Fifteen", "Sixteen"]}
								dice={dice}
								turn={turn}
								id={3}
								moveDistance={calcMoveDistance(this.state.dice)}
								seeds={seeds}
								updatePosition={updatePosition}
							/>
							<Exit 
								base={"home-four"}
								max={44}
								min={39}
								portal={6}
							/>
						</section>
						{/* The centre cellbox of the Ludo */}
						<section className="home"></section>
						<Dice
							dice={dice}
						/>
					</section>
				</section>
				<aside className="stats"></aside>
			</div>
		);
	}
}
