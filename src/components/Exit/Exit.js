import React, { Component } from 'react';


const Exit = ({ base, max, min }) => {

	return (
		<section className="exit">
			<section className="lair">
				<div className="cell"></div>
				{
				([...Array(max - min + 1)].map((_, i) => max - i)).map((value, index) => {
					return <div key={index} className="cell" title={value}></div>
				})
				}
				<div className="cell" title={min - 1 === 0 ? "51" : min - 1}></div>				
			</section>   
			<section className="portal">
				{
					([...Array(6)].map((_, i) => max - i)).map((value, index) => {
						return <div key={index} className="cell" title={`${base}-cell-${value}`}></div>
					})
				}
				<div className="cell" title={min - 1 === 0 ? "52" : min - 1}></div>
			</section>
		</section>
	)
}

export default Exit