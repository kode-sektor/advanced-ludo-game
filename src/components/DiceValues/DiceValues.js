import React from 'react';

const DiceValues = ({dice}) => {

	return (
		<section className='dice-assistant'>
			<table>
				<thead>
					<tr>
						<th>Dice Values</th>
					</tr>
				</thead>
				<tbody>
				{
					dice[1].asst.map((diceList, index) => {
						// console.log(diceList);
						let dice2 = dice[2].asst;
						return (
							<tr key={index}>
								<td>
									<img src={`images/die-faces/die${diceList.value}.jpg`} alt={`die-${diceList.value}`} />
								</td>
								<td>
									<img src={`images/die-faces/die${dice2[index]?.value}.jpg`} alt={dice2[index]?.value} />
								</td>
							</tr>
						)
					})
				}
				</tbody>
			</table>
		</section>
	)
}

export default DiceValues