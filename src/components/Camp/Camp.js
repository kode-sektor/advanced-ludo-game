import React, { Component } from 'react';
import { bases } from '../settings.js'
import { getBaseIndex, getAttackBase, getAttackBaseIndex, isUnderSiege } from '../functions.js'

import { seeds } from "../../data/seeds.js";
import Seed from './Seed/Seed.js';


export default class Camp extends Component {

	state = {
		seeds : seeds
	}

	isCOMBase = () => {
		const id = this.props.id;	// 1
		const COMbase = getBaseIndex("COM");	// [1, 2]
		return COMbase.includes(id);
	}

	isCOMAttackBaseSieged = () => {
		if (this.isCOMBase()) {
			const COMBaseIndex = getBaseIndex("COM");	// [1, 2]
			let attackBaseIndex = getAttackBaseIndex(COMBaseIndex);

			isUnderSiege(attackBaseIndex);
		}
	}


	render() {

		const { base, dice, turn, seeds, updatePosition, updateDiceAssistant } = this.props;
		console.log(this.props);

		return (
			<section className="camp">
				<section className="window">
					<div className="cell">
						<Seed 
							coords={
								{
									x: seeds[`seed${base[0]}`].coordinates[0].x,
									y: seeds[`seed${base[0]}`].coordinates[0].y
								}
							}
							id={`seed${base[0]}`}
							dice={dice}
							turn={turn}
							moveDistance={this.props.moveDistance}
							updatePosition={updatePosition}
							updateDiceAssistant={updateDiceAssistant}
							rollDice={this.props.rollDice}
						/>
					</div>
					<div className="cell">
						<Seed 
							coords={
								{
									x: seeds[`seed${base[1]}`].coordinates[0].x,
									y: seeds[`seed${base[1]}`].coordinates[0].y
								}
							}
							id={`seed${base[1]}`}
							dice={dice}
							turn={turn}
							moveDistance={this.props.moveDistance}
							updatePosition={updatePosition}
							updateDiceAssistant={updateDiceAssistant}
							rollDice={this.props.rollDice}
						/>
					</div>
					<div className="cell">
						<Seed 
							coords={
								{
									x: seeds[`seed${base[2]}`].coordinates[0].x,
									y: seeds[`seed${base[2]}`].coordinates[0].y
								}
							}
							id={`seed${base[2]}`}
							dice={dice}
							turn={turn}
							moveDistance={this.props.moveDistance}
							updatePosition={updatePosition}
							updateDiceAssistant={updateDiceAssistant}
							rollDice={this.props.rollDice}
						/>
					</div>
					<div className="cell">
						<Seed 
							coords={
								{
									x: seeds[`seed${base[3]}`].coordinates[0].x,
									y: seeds[`seed${base[3]}`].coordinates[0].y
								}
							}
							id={`seed${base[3]}`}
							dice={dice}
							turn={turn}
							moveDistance={this.props.moveDistance}
							updatePosition={updatePosition}
							updateDiceAssistant={updateDiceAssistant}
							rollDice={this.props.rollDice}
						/>
					</div>
				</section>
				<section className="imprint">
					<span>LUDO</span>
				</section>
				<section className="imprint">
					<span>LUDO</span>
				</section>
			</section>
		)
	}
}
