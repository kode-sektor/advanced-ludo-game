import React, { Component } from "react";

import "./App.css";
import { seeds } from "../data/seeds.js";

import Dice from '../components/Dice/Dice.js'
import Camp from '../components/Camp/Camp.js'
import OutpostLane from '../components/OutpostLane/OutpostLane.js'
import Exit from '../components/Exit/Exit.js'
import DiceWidget from "./DiceWidget/DiceWidget.js";
import { getRandomWithinRange } from './functions.js'

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
		doubleSix: false
	}

	bases = [
		[seeds.seedOne, seeds.seedTwo, seeds.seedThree, seeds.seedFour],
		[seeds.seedFive, seeds.seedSix, seeds.seedSeven, seeds.seedEight],
		[seeds.seedNine, seeds.seedTen, seeds.seedEleven, seeds.seedTwelve],
		[seeds.seedThirteen, seeds.seedFourteen, seeds.seedFifteen, seeds.seedSixteen]
	];

	baseOne = this.bases[0];
	baseTwo = this.bases[1];
	baseThree = this.bases[2];
	baseFour = this.bases[3];

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

	turn = () => getRandomWithinRange(0, (this.activePlayers.length - 1), true);	// 0, 1

	render() {
		let state = this.state;
		let dice = this.state.dice;

		return (
			<div className="board-game">
				<DiceWidget
					dice={dice}
					setDice={this.setDice}
					setDiceAssistant={this.setDiceAssistant}
					updateDiceAssistant={this.updateDiceAssistant}
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
								turn={this.turn}
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
								turn={this.turn}
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
								turn={this.turn}
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
								turn={this.turn}
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
							dice={this.state.dice}
						/>
					</section>
				</section>
				<aside className="stats"></aside>
			</div>
		);
	}
}
