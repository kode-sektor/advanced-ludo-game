import React, { Component } from 'react';

import DiceCount from '../../components/DiceCount/DiceCount.js'
import DiceValues from '../../components/DiceValues/DiceValues.js'
import RollBtn from '../../components/RollBtn/RollBtn.js'


export default class DiceWidget extends Component {

	render() {

		const { dice, setDice, updateDieAssistant, setDiceAssistant, moveDistance } = this.props;

		return (
			<section className="dice-widget">
				<section className="roll-series">
					<DiceCount
						dice={dice}
						moveDistance={moveDistance}
					/>
					<DiceValues
						dice={dice}
						updateDieAssistant={updateDieAssistant}
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
