import React, { Component } from 'react';

export default class RollBtn extends Component {

	render() {

		return (
			<div id="die-one" className="die"
				style={{
						transform: `rotateX(${this.props.coords.x}deg)
							rotateY(${this.props.coords.y}deg)
							rotateZ(${this.props.coords.z}deg)`,
						transitionDuration: this.props.dur + "s"
				}}>
				<div className="side-one"></div>
				<div className="side-two"></div>
				<div className="side-three">
					<div className="die-inner"></div>
				</div>
				<div className="side-four">
					<div className="die-inner"></div>
				</div>
				<div className="side-five">
					<div className="die-inner"></div>
					<div className="die-inner"></div>
				</div>
				<div className="side-six">
					<div className="die-inner"></div>
					<div className="die-inner"></div>
				</div>
			</div>
		)
	}
}