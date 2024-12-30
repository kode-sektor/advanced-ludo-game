import React, { Component } from 'react';
import { randomDice, getRandomWithinRange, getDiceCycle, getDiceTimeout, computeDiceData } from '../../functions.js';

export default class RollBtn extends React.Component {

	constructor(props) {
		super(props);
	}

	state = {
		disabled: false,
		doubleSix: false
	}

	getDiceVals = (index) => {
		let dice = this.props.dice;
		let diceVals = [dice[1].asst.value, dice[2].asst.value];

		return diceVals;
	}

	checkForDoubleSix = (firstDieObj, secondDieObj) => {
		let diceVals = [firstDieObj.value, secondDieObj.value];
		if (diceVals[0]) {
			if (diceVals[0] === 6 && diceVals[1] === 6) {
				this.setState({
					...this.state,
					disabled: false,
					doubleSix: true
				})
			} else {
				this.setState({
					...this.state,
					disabled: true,
				})
			}
		}
	}

	roll = (player) => {

		alert("Rolled");
		
		// this.setState({ disabled: true });
		this.props.toggleRollButton();
		
		let firstDieObj = {};
		let secondDieObj = {};
		let diceObj = {};

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

			dieTransformX = diceTransformMap[value][0] + randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(0, 10);
			/*
				If die value is 2 or 5, run random transform-Y value because die will roll on Y-axis,
				hence the current die face stays the same.
				Then flip transform-Z + or -360deg to make a complete spin and return to current die face
				
				This piece of code (getRandomWithinRange(0, 10)) gets a random number between 0 and 10 to just tilt
				the die slightly in random direction to add visual depth. The maximum possible tilt though is not 10 deg
				but 20 deg because 2 transforms are at play on a die to make the tilt. For e.g, if the die value is 3, 
				dieTransformX and dieTransformZ if in the same direction and with the maximum possible tilt (10deg), would
				add to each other to become 20deg
			*/
			if (value === 2 || value === 5) {
				// console.log("value - 2 or 5: ", value)
				dieTransformY = getRandomWithinRange(-400, 400);
				dieTransformZ = randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(0, 10);
			} else if (value === 3) {
				// console.log("value - 3: ", value)
				dieTransformX = randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(0, 10);
				dieTransformY = diceTransformMap[value][1] + randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(1, 10);
				dieTransformZ = diceTransformMap[value][0] + randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(1, 10);
			} else if (value === 4) {
				// console.log("value - 4: ", value)
				dieTransformX = randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(0, 10);
				dieTransformY = diceTransformMap[value][1] + randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(1, 10);
				dieTransformZ = randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(0, 10);
			}
			else {
				// console.log("value - 1 or 6: ", value)
				dieTransformY = diceTransformMap[value][1] + randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(0, 10);
				dieTransformZ = getRandomWithinRange(-400, 400);
			}
			return [dieTransformX, dieTransformY, dieTransformZ];
		}

		const diceValues = [];
		randomDice(diceValues);
		// console.log ("dice Values: ", diceValues);
		const mappedDieTransforms = [mapDice(diceValues[0]), mapDice(diceValues[1])];		

		let cycleSteps = [];	
		let diceTimeout = [];
		
		cycleSteps = getDiceCycle();	// [3, 3]

		diceTimeout[0] = getDiceTimeout(cycleSteps[0]);
		diceTimeout[1] = getDiceTimeout(cycleSteps[1]);

		// diceTimeout[0] = [1.42, 0.45, 0.35];
		// diceTimeout[1] = [0.7, 1.09, 1.9];

		const diceData = computeDiceData(diceTimeout);
		/*
			Returns something like: 
			[
				[0.7, 0.72, 0.44999999999999996, 1.82] 	 // timeout (settransition loop time)
				[Array(2), 1.09, Array(2), 0.35]	// die transition duration (css)	
				[Array(2), 2, Array(2), 1]	// dice 
			]
		*/
		console.log(diceData);

		const cycleStep = diceData[0].length;

		let diceArrLastCycle = 0;
		let dieOneLastCycle = 0;
		let dieTwoLastCycle = 0;
		let dieLastCycle = 0;
		
		// Catch loop that maps as last loop to original diceTimeout array
		/* 
			Determine index of last entries of die 1 and 2.
			These last indexes of the die 1 and 2 enable the correct application of die value position
			on final timeout
		*/
		if (Array.isArray(diceData[2][diceData[2].length - 1])) {	
			dieOneLastCycle = diceData[2].indexOf(diceData[2][diceData[2].length - 1]);
			dieTwoLastCycle = diceData[2].indexOf(diceData[2][diceData[2].length - 1]);
		} else {
			diceArrLastCycle = diceData[2].findLastIndex((element) => Array.isArray(element) === true);
			dieOneLastCycle = diceData[2].findLastIndex((element) => element === 1);
			dieTwoLastCycle = diceData[2].findLastIndex((element) => element === 2);

			dieOneLastCycle = (dieOneLastCycle > diceArrLastCycle) ? dieOneLastCycle : diceArrLastCycle;
			dieTwoLastCycle = (dieTwoLastCycle > diceArrLastCycle) ? dieTwoLastCycle : diceArrLastCycle;
		}

		const randomRoll = (step) => {
			let currDuration = 0

			if (step < cycleStep) {
				
				setTimeout(() => {
					currDuration = diceData[1][step];
					let currDice = diceData[2][step];

					let transformVals = []
					for (let i = 0; i < (Array.isArray(currDice) ? 6 : 3); i++) {
						transformVals.push(getRandomWithinRange(-400, 400));	// e.g. [309, -112]
					}
					
					// If transition for 2 dice have extremely short loop time, combine both into one
					// settimeout loop
					if (Array.isArray(currDice)) {	// [1, 2]
						let firstDieValues = diceValues[0];
						let secondDieValues = diceValues[1];
						/*
							When the dice are rolled, recall that the first die has a longer transition duration
							because the computeDiceData function was structured in such a way that the max array 
							is looped across first, before the inner. 
							
							Then a switch called dieFlip was created in this same computeDiceData function to 
							switch dice 1 and 2 on the first (and any other) loop to make the transition duration 
							to be random. Because of the switch, it must also be taken into account here.
						*/
						let currDiceFirstIndex = 0;
						let currDiceSecondIndex = 0;
						let currDurationFirstIndex = 0;
						let currDurationSecondIndex = 0;

						let dieFlip = diceData[2][step][0];
						
						if (dieFlip === 1) {
							currDiceFirstIndex = 0;
							currDiceSecondIndex = 1;
							currDurationFirstIndex = 0;
							currDurationSecondIndex = 1;
						} else {
							currDiceFirstIndex = 1;
							currDiceSecondIndex = 0;
							currDurationFirstIndex = 1;
							currDurationSecondIndex = 0;
						}

						firstDieObj = {
							selected: false,
							disabled: false,
							value: firstDieValues
						}
						secondDieObj = {
							selected: false,
							disabled: false,
							value: secondDieValues
						}

						diceObj = {
							1: {
								...this.props.dice[1],
								position: {
									x: step === dieOneLastCycle ?
										mappedDieTransforms[currDice[currDiceFirstIndex] - 1][0] : transformVals[0],
									y: step === dieOneLastCycle ?
										mappedDieTransforms[currDice[currDiceFirstIndex] - 1][1] : transformVals[1],
									z: step === dieOneLastCycle ?
										mappedDieTransforms[currDice[currDiceFirstIndex] - 1][2] : transformVals[2]
								},
								rollDuration: currDuration[currDurationFirstIndex]
							},
							2: {
								...this.props.dice[2],
								position: {
									x: step === dieTwoLastCycle ?
										mappedDieTransforms[currDice[currDiceSecondIndex] - 1][0] : transformVals[3],
									y: step === dieTwoLastCycle ?
										mappedDieTransforms[currDice[currDiceSecondIndex] - 1][1] : transformVals[4],
									z: step === dieTwoLastCycle ?
										mappedDieTransforms[currDice[currDiceSecondIndex] - 1][2] : transformVals[5]
								},
								rollDuration: currDuration[currDurationSecondIndex]
							}
						}
					} else {
						let dieValues = diceValues[currDice - 1];
						let dieObj = {
							selected: false,
							disabled: false,
							value: dieValues
						}
						// Since this is utility code, determine correct last die cycle if the die is 1 or 2
						// const dieLastCycle = currDice === 1 ? dieOneLastCycle : dieTwoLastCycle;
						if (step === dieOneLastCycle) {
							dieLastCycle = dieOneLastCycle;
						} else if (step === dieTwoLastCycle) {
							dieLastCycle = dieTwoLastCycle;
						}
						// console.log("step, dieLastCycle : ", step, dieLastCycle);
						if (step === dieLastCycle) {
							console.log(mappedDieTransforms[currDice - 1][0]);
						}
						diceObj = {
							...this.props.dice,
							[`${ currDice }`]: {
								// asst: step === dieLastCycle ?
									// [...this.props.dice[`${currDice}`].asst, dieObj] :
								// this.props.dice[`${currDice}`].asst,
								...this.props.dice[`${currDice}`],
								position: {
									x: step === dieLastCycle ? mappedDieTransforms[currDice - 1][0] : transformVals[0],
									y: step === dieLastCycle ? mappedDieTransforms[currDice - 1][1] : transformVals[1],
									z: step === dieLastCycle ? mappedDieTransforms[currDice - 1][2] : transformVals[2]
								},
								rollDuration: currDuration
							}
						}
					}
					// console.log("dieOneLastCycle, dieTwoLastCycle, step : ", dieOneLastCycle, dieTwoLastCycle, step);
					this.props.setDice(diceObj);
					step++;
					console.log(step);
					randomRoll(step)
				}, step === 0 ? 0 : diceData[0][step] * 1000);	// 1, 2 or 3 (Condition to avoid delay on first run)
			} else {	// Re-enable roll button after roll
				diceObj = {
					1: {
						asst: firstDieObj
					},
					2: {
						asst: secondDieObj
					}
				}
				setTimeout(() => {	// Die spin callback
					// if (diceValues[0] === 6 && diceValues[1] === 6) {

					// } else {
						
					// }
					this.props.setDiceAssistant(diceObj);
					this.checkForDoubleSix(firstDieObj, secondDieObj);
					
					// Brief delay to trigger click on dice assistant (if COM)
					setTimeout(() => {
						
					}, 1000);	// 1s for now
				}, (diceData[1] && Array.isArray(diceData[1][diceData[1].length - 1])) ?
					Math.max(diceData[1][diceData[1].length][0], diceData[1][diceData[1].length][1]) * 1000 :
					diceData[1][diceData[1].length - 1] * 1000
				);
			}
		}
		randomRoll(0);
	}
	
	render() {
		// let diceVals = [this.props.dice[1].value, this.props.dice[2].value];
		console.log(this.props);
		return (
			<section className="roll-button-container">
				<div id="roll-button" className="roll-button">
					<button disabled={this.props.rollButton} className="roll" role="button" onClick={this.roll}
						ref={this.props.rollButtonRef}>
						{this.state.doubleSix ? "Roll Again" : "Roll"}
					</button>
				</div>
			</section>
		)
	}
}
