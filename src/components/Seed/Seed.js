import React, { Component } from 'react';

import { calcMoveDistance, canBreakout } from '../functions.js'
import { players } from "../../data/players.js";


export default class RollBtn extends Component {

	isMovable = (e) => {
		alert('yes');
		console.log(e);
		return true;
		let id = e.target.id;

		if (this.state.inMotion) {
			return false;
		}

		let cell = players.id.cell;
		let moveDistance = calcMoveDistance();

		if (!canBreakout(cell) || (cell + moveDistance)) {
			return false;
		} else {
			return true;
		}
	}

	render() {

		const { inMotion, coords, move, dur, id } = this.props;

		return (
			<button disabled={this.isMovable}
				className={inMotion ? "moving seed" : "seed"}
				id={id}
				style={{
					transform: `translate(${coords.x * 6.6}vh, 
							${coords.y * 6.6}vh)`,
					transitionDuration: dur + "s"
				}}
				onClick={(e) => {move(e)}}
				>
			</button>
		)
	}
}
