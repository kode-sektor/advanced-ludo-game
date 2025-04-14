import React, {useRef, Component } from 'react';

export default class DiceValues extends Component {

	constructor() {
        super();
	}

	selectDieAsst = e => {
		// alert("dice assistant clicked");
		let button = e.target;
		let die = button.dataset.die;
		console.log(die);
		let index = button.dataset.index;
		let dieVal = Number(button.dataset.value);
		let buttonID = button.id;
		buttonID = buttonID.split("-");
		buttonID = buttonID[buttonID.length - 1];

		let diceObj = {
			selected: !this.props.dice[`${die}`].asst[index].selected,    // toggle selected: true / false
			value: dieVal
		}
		this.props.updateDieAssistant(die, index, diceObj);
	}

	render () {
		console.log(this.props);
		let dice = this.props.dice;
		let diceRef = this.props.diceRef;

		// diceRef = dice[1].asst.map(() => React.createRef());
		// console.log(dice[1].asst);

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
							console.log(diceRef);	// []
							let dice2 = dice[2].asst;
							console.log(dice2[0].disabled);
							return (
								<tr key={index}>
									<td>
										<button id={`die-btn-${index * 2}`} disabled={diceList.disabled} data-die="1"
											className={diceList.selected ? "die-btn-asst selected" : "die-btn-asst"}
											data-value={diceList.value} data-index={index} onClick={this.selectDieAsst}
											ref={diceRef[index] && diceRef[index]}
											>
											<img src={`images/die-faces/die${diceList.value}.jpg`} alt={`die-${diceList.value}`} />
										</button>
									</td>
									<td>
										<button id={`die-btn-${(index * 2) + 1}`} disabled={dice2[index].disabled} data-die="2"
											className={diceList.selected ? "die-btn-asst selected" : "die-btn-asst"}
											data-value={dice2[index].value} data-index={index} onClick={this.selectDieAsst}
											ref={diceRef[index + 1] && diceRef[index + 1]}
											>
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

}

// const DiceValues = ({ dice, updateDieAssistant, diceRefs }) => {
	
// 	const selectDieAsst = e => {
// 		let button = e.target.parentElement;
// 		let die = button.dataset.die;
// 		let index = button.dataset.index;
// 		let dieVal = Number(button.dataset.value);
// 		let buttonID = button.id;
// 		buttonID = buttonID.split("-");
// 		buttonID = buttonID[buttonID.length - 1];

// 		let diceObj = {
// 			selected: !dice[`${die}`].asst[index].selected,    // toggle selected: true / false
// 			value: dieVal
// 		}
// 		updateDieAssistant(die, index, diceObj);
// 	}

// 	return (

// 		<section className='dice-assistant'>
// 			<table>
// 				<thead>
// 					<tr>
// 						<th>Dice Values</th>
// 					</tr>
// 				</thead>
// 				<tbody>
// 				{
// 					dice[1].asst.map((diceList, index) => {
// 						console.log(dice);
// 						console.log(diceList);
// 						console.log(diceRefs);	// []
// 						let dice2 = dice[2].asst;
// 						console.log(dice2[0].disabled);
// 						return (
// 							<tr key={index}>
// 								<td>
// 									<button id={`die-btn-${index * 2}`} disabled={diceList.disabled} data-die="1"
// 										className={diceList.selected ? "die-btn-asst selected" : "die-btn-asst"}
// 										data-value={diceList.value} data-index={index} onClick={selectDieAsst}
// 										// ref={diceRefs[0].length > 0 && diceRefs[0][index].ref}
// 										ref={diceRefs && diceRefs.current[index]}
// 										>
// 										<img src={`images/die-faces/die${diceList.value}.jpg`} alt={`die-${diceList.value}`} />
// 									</button>
// 								</td>
// 								<td>
// 									<button id={`die-btn-${(index * 2) + 1}`} disabled={dice2[index].disabled} data-die="2"
// 										className={diceList.selected ? "die-btn-asst selected" : "die-btn-asst"}
// 										data-value={dice2[index].value} data-index={index} onClick={selectDieAsst}
// 										// ref={diceRefs[1].length > 0 && diceRefs[1][index].ref}
// 										>
// 										<img src={`images/die-faces/die${dice2[index].value}.jpg`} alt={`die-${dice2[index].value}`} />
// 									</button>
// 								</td>
// 							</tr>
// 						)
// 					})
// 				}
// 				</tbody>
// 			</table>
// 		</section>
// 	)
// }

// export default DiceValues