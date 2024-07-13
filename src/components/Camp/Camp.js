import React, { Component } from 'react';

import { seeds } from "../../data/seeds.js";
import Seed from './Seed/Seed.js';


export default class Camp extends Component {

	state = {
		seeds : seeds
	}

	render() {

		const { base, dice } = this.props;

		return (
			<section className="camp">
				<section className="window">
					<div className="cell">
						<Seed 
							coords={
								{
									x: this.state.seeds[`seed${base[0]}`].coordinates[0].x,
									y: this.state.seeds[`seed${base[0]}`].coordinates[0].y
								}
							}
							id={`seed${base[0]}`}
							dice={dice}
							turn={turn}
						/>
					</div>
					<div className="cell">
						<Seed 
							coords={
								{
									x: this.state.seeds[`seed${base[1]}`].coordinates[0].x,
									y: this.state.seeds[`seed${base[1]}`].coordinates[0].y
								}
							}
							id={`seed${base[1]}`}
							dice={dice}
							turn={turn}
						/>
					</div>
					<div className="cell">
						<Seed 
							coords={
								{
									x: this.state.seeds[`seed${base[2]}`].coordinates[0].x,
									y: this.state.seeds[`seed${base[2]}`].coordinates[0].y
								}
							}
							id={`seed${base[2]}`}
							dice={dice}
							turn={turn}
						/>
					</div>
					<div className="cell">
						<Seed 
							coords={
								{
									x: this.state.seeds[`seed${base[3]}`].coordinates[0].x,
									y: this.state.seeds[`seed${base[3]}`].coordinates[0].y
								}
							}
							id={`seed${base[3]}`}
							dice={dice}
							turn={turn}
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
