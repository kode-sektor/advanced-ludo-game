import React, { Component } from 'react';

export default class RollBtn extends Component {

	state = {
	}
	
	render() {

		return (
			<button disabled={this.state.inMotion} className={this.state.inMotion ? "moving seed" : "seed"}
				id="seedOne"
				style={{
					transform: `translate(${this.state.players.seedOne.coordinates[0].x * 6.6}vh, 
							${this.state.players.seedOne.coordinates[0].y * 6.6}vh)`,
					transitionDuration: this.state.transitionDuration + "s"
				}}
				onClick={(e) => {this.move(e) }}
				>
			</button>
		)
	}
}
