import React, { Component } from 'react';

import Die from './Die/Die.js';

const Dice = ({dice}) => {

	return (
		<section className="dice-container">
			<Die
				coords={
					{
						x: dice[1].position.x,
						y: dice[1].position.y,
						z: dice[1].position.z
					}
				}
				dur={dice[1].rollDuration}
			/>
			<Die
				coords={
					{
						x: dice[2].position.x,
						y: dice[2].position.y,
						z: dice[2].position.z
					}
				}
				dur={dice[2].rollDuration}
			/>
		</section>
	)
}

export default Dice