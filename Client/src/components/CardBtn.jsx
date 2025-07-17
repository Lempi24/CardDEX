const CardBtn = ({ name, pokemon, showInfoFunction }) => {
	return (
		<button className='p-1 bg-filling w-full' onClick={showInfoFunction}>
			<img src={pokemon} alt={name} />
		</button>
	);
};

export default CardBtn;
