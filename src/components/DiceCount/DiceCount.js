import React, { Component } from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSolid, faDice } from '@fortawesome/free-solid-svg-icons';



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
			<section className='dice-sum'>
				<h3>
					Dice Count
				</h3>
				<span className="dice-bubble">
					<FontAwesomeIcon icon={faDice} size='3x' inverse swapOpacity mask={['far', 'circle']}/>
					<span className='dice-count'>{this.calculateTally(this.props.dice)}</span>
				</span>
			</section>
		)
	}
}
