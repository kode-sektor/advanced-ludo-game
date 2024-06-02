import React from 'react';

const DiceValues = ({dice}) => {

	return (
		<table>
			<thead>
				<tr>
					<th>Dice Values</th>
				</tr>
			</thead>
			<tbody>
			{
				dice[1].value.map((diceList, index) => {
					return (
						<tr key={index}>
							<td>
								{diceList.value}
							</td>
							<td>
								{diceList.value}
							</td>
						</tr>
					)
				})
			}
			</tbody>
		</table>
	)
}

export default DiceValues