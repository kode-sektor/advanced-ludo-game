import React from 'react';

const DiceValues = ({ dice, updateDiceAssistant }) => {
	
	const selectDieAsst = e => {
		let button = e.target.parentElement;
		let die = button.dataset.die;
		let index = button.dataset.index;
		let dieVal = Number(button.dataset.value);
		let buttonID = button.id;
		buttonID = buttonID.split("-");
		buttonID = buttonID[buttonID.length - 1];

		let diceObj = {
			selected: !dice[`${die}`].asst[index].selected,    // toggle selected: true / false
			value: dieVal
		}
		updateDiceAssistant(die, index, diceObj);
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
						console.log(dice);
						console.log(diceList);
						let dice2 = dice[2].asst;
						console.log(dice2[0].disabled);
						return (
							<tr key={index}>
								<td>
									<button id={`die-btn-${index * 2}`} disabled={diceList.disabled} data-die="1"
										className={diceList.selected ? "die-btn-asst selected" : "die-btn-asst"}
										data-value={diceList.value} data-index={index} onClick={selectDieAsst}> 
										<img src={`images/die-faces/die${diceList.value}.jpg`} alt={`die-${diceList.value}`} />
									</button>
								</td>
								<td>
									<button id={`die-btn-${(index * 2) + 1}`} disabled={dice2[index].disabled} data-die="2"
										className={diceList.selected ? "die-btn-asst selected" : "die-btn-asst"}
										data-value={dice2[index].value} data-index={index} onClick={selectDieAsst}>
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