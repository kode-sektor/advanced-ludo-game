import React, { Component } from 'react';
import { randomDice, getRandomWithinRange, getDiceCycle, getDiceTimeout, computeDiceData } from '../functions.js';

export default class RollBtn extends Component {

	state = {
		disabled : false
	}

	getDiceVals = (index) => {
		let diceVals = [this.props.dice[1].value, this.props.dice[2].value];
		console.log(index);
		console.log(diceVals);
		console.log(diceVals[index]);
		return diceVals[index];
	}

	roll = () => {

		this.setState({disabled : true});

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
				dieTransformY = getRandomWithinRange(-400, 400);
				dieTransformZ = randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(0, 10);
			} else if (value === 3 || value === 4) {
				dieTransformX = randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(0, 10);
				dieTransformY = diceTransformMap[value][1] + randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(1, 10);
				dieTransformZ = randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(0, 10);
			}
			else {
				dieTransformY = diceTransformMap[value][1] + randomTransforms[getRandomWithinRange(0, 2, true)] + getRandomWithinRange(0, 10);
				dieTransformZ = getRandomWithinRange(-400, 400);
			}
			return [dieTransformX, dieTransformY, dieTransformZ];
		}

		const diceValues = [];
		randomDice(diceValues);
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
		
		// Catch loop that maps as last loop to original diceTimeout array
		/* 
			Determine index of last entries of die 1 and 2.
			These last indexes of the die 1 and 2 enable the correct application of die value position
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
			let currDuration = 0

			if (step < cycleStep) {
				
				setTimeout(() => {
					currDuration = diceData[1][step];
					let currDice = diceData[2][step];
					let diceObj = {};

					let transformVals = []
					for (let i = 0; i < (Array.isArray(currDice) ? 6 : 3); i++) {
						transformVals.push(getRandomWithinRange(-400, 400));	// e.g. [309, -112]
					}
					
					// If transition for 2 dice have extremely short loop time, combine both into one
					// settimeout loop
					if (Array.isArray(currDice)) {	// [1, 2]
						let firstDieValues = this.getDiceVals(0);
						let secondDieValues = this.getDiceVals(1);

						diceObj = {
							1: {
								value: step === dieOneLastCycle ? [...firstDieValues, diceValues[0]] : firstDieValues,
								position: {
									x: step === dieOneLastCycle ? mappedDieTransforms[currDice[0] - 1][0] : transformVals[0],
									y: step === dieOneLastCycle ? mappedDieTransforms[currDice[0] - 1][1] : transformVals[1],
									z: step === dieOneLastCycle ? mappedDieTransforms[currDice[0] - 1][2] : transformVals[2]
								},
								rollDuration: currDuration[0]
							},
							2: {
								value: step === dieTwoLastCycle ? [...secondDieValues, diceValues[1]] : secondDieValues,
								position: {
									x: step === dieTwoLastCycle ? mappedDieTransforms[currDice[1] - 1][0] : transformVals[3],
									y: step === dieTwoLastCycle ? mappedDieTransforms[currDice[1] - 1][1] : transformVals[4],
									z: step === dieTwoLastCycle ? mappedDieTransforms[currDice[1] - 1][2] : transformVals[5]
								},
								rollDuration: currDuration[1]
							}
						}
					} else {
						let dieValues = this.getDiceVals(0);
						console.log(currDice - 1);
						console.log(dieValues);
						// Since this is utility code, determine correct last die cycle if the die is 1 or 2
						const lastDieCycle = currDice === 1 ? dieOneLastCycle : dieTwoLastCycle;
						diceObj = {
							[`${ currDice }`]: {
								value: step === lastDieCycle ? [...dieValues, diceValues[currDice - 1]] : dieValues,
								position: {
									x: step === lastDieCycle ? mappedDieTransforms[currDice - 1][0] : transformVals[0],
									y: step === lastDieCycle ? mappedDieTransforms[currDice - 1][1] : transformVals[1],
									z: step === lastDieCycle ? mappedDieTransforms[currDice - 1][2] : transformVals[2]
								},
								rollDuration: currDuration
							}
						}
					}
					this.props.setDice(diceObj)
					step++;
					randomRoll(step)
				}, step === 0 ? 0 : diceData[0][step] * 1000);	// 1, 2 or 3 (Condition to avoid delay on first run)
			} else {	// Re-enable roll button after roll
				setTimeout(() => {
					// if (diceValues[0] === 6 && diceValues[1] === 6) {

					// } else {
						
					// }
					this.setState({ disabled: false });
					// }, Array.isArray(diceData[1][diceData[1].length - 1]) ?
					// 	(Math.max(diceData[1][diceData[1].length][0], diceData[1][diceData[1].length][1]) * 1000) :
					// 	(diceData[1][diceData[1].length - 1] * 1000)
					// );
				}, 1000);
			}
		}
		randomRoll(0);
	}

	
	render() {
		// let diceVals = [this.props.dice[1].value, this.props.dice[2].value];

		return (
			<section className="roll-button-container">
				<div id="roll-button" className="roll-button">
					<button disabled={this.state.disabled} className="roll" role="button" onClick={this.roll}>
						{(this.getDiceVals[0] === 6 && this.getDiceVals[1] === 6) ? "Roll Again" : "Roll"}
					</button>
				</div>
			</section>
		)
	}
}
