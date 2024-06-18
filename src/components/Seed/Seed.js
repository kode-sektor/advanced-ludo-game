import React, { Component } from 'react';

export default class RollBtn extends Component {

	render() {

		const { inMotion, coords, move, id } = props;

		return (
			<button disabled={inMotion}
				className={inMotion ? "moving seed" : "seed"}
				id={id}
				style={{
					transform: `translate(${coords.x * 6.6}vh, 
							${coords.y * 6.6}vh)`,
					transitionDuration: this.state.transitionDuration + "s"
				}}
				onClick={(e) => {move(e)}}
				>
			</button>
		)
	}
}
