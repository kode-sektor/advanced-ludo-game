import React, { Component } from 'react';

import { players } from "../../data/players.js";
import Seed from './Seed/Seed.js';


export default class Camp extends Component {

	state = {
		players : players
	}

	render() {

		const { seeds, dice } = this.props;

		return (
			<section className="camp">
				<section className="window">
					<div className="cell">
						<Seed 
							coords={
								{
									x: this.state.players[`seed${seeds[0]}`].coordinates[0].x,
									y: this.state.players[`seed${seeds[0]}`].coordinates[0].y
								}
							}
							id={`seed${seeds[0]}`}
							dice={dice}
						/>
					</div>
					<div className="cell">
						<Seed 
							coords={
								{
									x: this.state.players[`seed${seeds[1]}`].coordinates[0].x,
									y: this.state.players[`seed${seeds[1]}`].coordinates[0].y
								}
							}
							id={`seed${seeds[1]}`}
							dice={dice}
						/>
					</div>
					<div className="cell">
						<Seed 
							coords={
								{
									x: this.state.players[`seed${seeds[2]}`].coordinates[0].x,
									y: this.state.players[`seed${seeds[2]}`].coordinates[0].y
								}
							}
							id={`seed${seeds[2]}`}
							dice={dice}
						/>
					</div>
					<div className="cell">
						<Seed 
							coords={
								{
									x: this.state.players[`seed${seeds[3]}`].coordinates[0].x,
									y: this.state.players[`seed${seeds[3]}`].coordinates[0].y
								}
							}
							id={`seed${seeds[3]}`}
							dice={dice}
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
