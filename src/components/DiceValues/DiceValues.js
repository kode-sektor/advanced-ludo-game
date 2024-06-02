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
					dice[1].asst.map((diceList, index) => {
						console.log(diceList);
					return (
						<tr key={index}>
							<td>
								{/* {diceList.value} */}
							</td>
							<td>
								{/* {diceList.value} */}
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