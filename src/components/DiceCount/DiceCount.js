import React, { Component } from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default class RollBtn extends Component {

	state = {
	}

	calculateTally = (dice) => {
		let diceOneAsst = Object.values(dice[1])[0];
		let diceTwoAsst = Object.values(dice[2])[0];

		const filteredDiceOneAsst = diceOneAsst.filter(({ disabled }) => disabled === false);
		const filteredDiceTwoAsst = diceTwoAsst.filter(({ disabled }) => disabled === false);

		const totalDiceOneAsst = filteredDiceOneAsst.reduce((total, { value }) => total + value, 0);
		const totalDiceTwoAsst = filteredDiceTwoAsst.reduce((total, { value }) => total + value, 0);
		
		return totalDiceOneAsst + totalDiceTwoAsst;
	}
	
	render() {

		return (
			<span className="die-bubble">
				<FontAwesomeIcon icon="fa-solid fa-dice" />
				<span className='die-count'>{ this.calculateTally(this.props.dice)}</span>
			</span>
		)
	}
}
