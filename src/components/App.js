import React, {useRef, forwardRef, Component } from "react"

import "./App.css"
import { settings } from './settings.js'
import { seeds } from "../data/seeds.js"

import Dice from '../components/Dice/Dice.js'
import Camp from '../components/Camp/Camp.js'
import OutpostLane from '../components/OutpostLane/OutpostLane.js'
import Exit from '../components/Exit/Exit.js'
import DiceWidget from "./DiceWidget/DiceWidget.js"
import { getRandomWithinRange, calcMoveDistance } from './functions.js'

export default class App extends Component {

	constructor() {
        super();
		this.rollDice = React.createRef();	// Roll button
		this.seedOne = React.createRef();	
		this.seedTwo = React.createRef();
		this.seedThree = React.createRef();
		this.seedFour = React.createRef();
		this.seedFive = React.createRef();
		this.seedSix = React.createRef();
		this.seedSeven = React.createRef();
		this.seedEight = React.createRef();
		this.seedNine = React.createRef();
		this.seedTen = React.createRef();
		this.seedEleven = React.createRef();
		this.seedTwelve = React.createRef();
		this.seedThirteen = React.createRef();
		this.seedFourteen = React.createRef();
		this.seedFifteen = React.createRef();
		this.seedSixteen = React.createRef();
		this.diceRef = [];	// Ref buttons
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
		turn: settings.turn,	// 0
		rollButton: false,
		dicceRef : [React.createRef(), React.createRef()]
	}

	// Get length of dice assistants on re-render in order to be able to deal 
	// with dynamically adding refs

	getDiceRef = () => {
		const dice1 = this.state.dice[1].asst;
		const dice2 = this.state.dice[2].asst;

		this.diceRef = [...dice1, ...dice2].map(() => React.createRef());
		return this.diceRef;
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

		let die1 = diceObj[1].asst.value;
		let die2 = diceObj[2].asst.value;
		// console.log(diceObj)
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
			},
			doubleSix : die1 === 6 && die2 === 6
		})
	}

	updateDieAssistant = (die, index, diceObj) => {
		let asst = this.state.dice[die].asst;    // [{selected: false, disabled: false, value: 6}...]
		let currAsst = asst[index];    // Choose the single die (1 or 2) [{selected: false, disabled: false, value: 6}]
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

	updateDiceAssistant = (dice, rollButton, turn) => {
		this.setState({
			...this.state,
			dice: dice,
			rollButton: rollButton ? !this.state.rollButton : this.state.rollButton 
		})
	}

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

	tossed = () => this.state.dice[1].asst.length;

	turn = () => getRandomWithinRange(0, (this.activePlayers.length - 1), true);	// 0

	toggleRollButton = () => this.setState({...this.state, rollButton: !this.state.rollButton});
	

	render() {
		let state = this.state;
		let dice = state.dice;
		let turn = state.turn;
		let seeds = state.seeds;
		let doubleSix = state.doubleSix;
		let updatePosition = this.updatePosition;
		let updateDiceAssistant = this.updateDiceAssistant;
		let updateDoubleSix = this.updateDoubleSix;

		return (
			<div className="board-game">
				<DiceWidget
					dice={dice}
					setDice={this.setDice}
					setDiceAssistant={this.setDiceAssistant}
					updateDieAssistant={this.updateDieAssistant}
					moveDistance={calcMoveDistance(this.state.dice)}
					rollButtonRef={this.rollDice}
					rollButton={this.state.rollButton}
					toggleRollButton={this.toggleRollButton}
					// diceRefs={[this.diceAsst1, this.diceAsst2]}
					diceRef={this.getDiceRef()}
					doubleSix={state.doubleSix}
					tossed={this.tossed}
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
								updateDiceAssistant={updateDiceAssistant}
								rollButtonRef={this.rollDice}
								toggleRollButton={this.toggleRollButton}
								seedRef={[this.seedOne, this.seedTwo, this.seedThree, this.seedFour]}
								doubleSix={doubleSix}
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
								updateDiceAssistant={updateDiceAssistant}
								rollDice={this.rollDice}
								toggleRollButton={this.toggleRollButton}
								seedRef={[this.seedFive, this.seedSix, this.seedSeven, this.seedEight]}
								doubleSix={doubleSix}

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
								updateDiceAssistant={updateDiceAssistant}
								rollDice={this.rollDice}
								toggleRollButton={this.toggleRollButton}
								seedRef={[this.seedNine, this.seedTen, this.seedEleven, this.seedTwelve]}
								doubleSix={doubleSix}
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
								updateDiceAssistant={updateDiceAssistant}
								rollDice={this.rollDice}
								toggleRollButton={this.toggleRollButton}
								seedRef={[this.seedThirteen, this.seedFourteen, this.seedFifteen, this.seedSixteen]}
								doubleSix={doubleSix}

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