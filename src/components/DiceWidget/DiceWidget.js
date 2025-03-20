import React, { Component } from 'react';

import DiceCount from './DiceCount/DiceCount.js'
import DiceValues from './DiceValues/DiceValues.js'
import RollBtn from './RollBtn/RollBtn.js'


export default class DiceWidget extends Component {

	constructor(props) {
        super(props);
    }

	render() {

		const { 
			dice, setDice, updateDieAssistant, doubleSix,
			setDiceAssistant, moveDistance, tossed, rollButtonRef, 
			turn, COMTurn, rollButton, toggleRollButton, diceRef 
		} = this.props;

		console.log(diceRef);
		console.log(diceRef[0]);

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
						diceRef={diceRef}
					/>
				</section>
				<RollBtn
					setDice={setDice}
					setDiceAssistant={setDiceAssistant}
					dice={dice}
					rollButton={rollButton}
					rollButtonRef={rollButtonRef}
					toggleRollButton={toggleRollButton}
					diceRef={diceRef}
					doubleSix={doubleSix}
					tossed={tossed}
					turn={turn}
					COMTurn={COMTurn}
				/>
			</section>
		)
	}
}
