import React, { Component } from 'react';


const OutpostLane = ({ max, min }) => {

	return (
		<section className="outpost-lane">
			{
				([...Array(max - min + 1)].map((_, i) => max - i)).map((value, index) => {
					return <div key={index} className="cell" title={value}></div>
				})
			}
		</section>
	)
}

export default OutpostLane