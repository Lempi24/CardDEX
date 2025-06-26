const CardBtn = ({ name, pokemon, showInfoFunction }) => {
	return (
		<button className='card p-1 bg-filling m-2' onClick={showInfoFunction}>
			<img src={pokemon} alt={name} />
		</button>
	);
};
export default CardBtn;
