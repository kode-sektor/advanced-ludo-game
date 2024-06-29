import React, { Component } from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSolid, faDice } from '@fortawesome/free-solid-svg-icons';
import { calcMoveDistance } from '../functions.js';


export default class RollBtn extends Component {

	state = {
	}

	
	render() {

		return (
			<section className='dice-sum'>
				<h3>
					Dice Count
				</h3>
				<span className="dice-bubble">
					<FontAwesomeIcon icon={faDice} size='3x' inverse swapOpacity mask={['far', 'circle']}/>
					<span className='dice-count'>{calcMoveDistance(this.props.dice)}</span>
				</span>
			</section>
		)
	}
}
