import React from 'react';

const DiceValues = ({ dice }) => {
	
	const selectDieAsst = e => {
		// e.stopPropagation();
		console.log(e);
	}

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
									<button id={`die-btn-${index * 2}`} disabled={diceList.disabled} data-die="1"
										className={diceList.selected ? "die-btn-asst selected" : "die-btn-asst"}
										onClick={selectDieAsst}> 
										<img src={`images/die-faces/die${diceList.value}.jpg`} alt={`die-${diceList.value}`} />
									</button>
								</td>
								<td>
									<button id={`die-btn-${(index * 2) + 1}`} disabled={dice2[index].disabled} data-die="2"
										className={diceList.selected ? "die-btn-asst selected" : "die-btn-asst"}
										onClick={selectDieAsst}>
										<img src={`images/die-faces/die${dice2[index].value}.jpg`} alt={`die-${dice2[index].value}`} />
									</button>
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