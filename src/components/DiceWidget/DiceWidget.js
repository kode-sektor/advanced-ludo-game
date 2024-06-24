import React, { Component } from 'react';

import DiceCount from '../../components/DiceCount/DiceCount.js'
import DiceValues from '../../components/DiceValues/DiceValues.js'
import RollBtn from '../../components/RollBtn/RollBtn.js'


export default class DiceWidget extends Component {

	render() {

		const { dice, setDice, updateDiceAssistant, setDiceAssistant } = this.props;

		return (
			<section className="dice-widget">
				<section className="roll-series">
					<DiceCount
						dice={dice}
					/>
					<DiceValues
						dice={dice}
						updateDiceAssistant={updateDiceAssistant}
					/>
				</section>
				<RollBtn
					setDice={setDice}
					setDiceAssistant={setDiceAssistant}
					dice={dice}
				/>
			</section>
		)
	}
}
