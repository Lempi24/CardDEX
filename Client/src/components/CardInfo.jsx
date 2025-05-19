import strzalka from '../img/strzalka.png';

const CardInfo = ({
	visible,
	choosenPokemonName,
	choosenPokemonImage,
	choosenPokemonPrice,
	showInfoFunction,
}) => {
	return (
		visible && (
			<div className='absolute w-full bg-main flex flex-col items-center p-4 gap-4'>
				<button className='absolute left-15' onClick={showInfoFunction}>
					<img src={strzalka} alt='strzałka' className='scale-125' />
				</button>
				<h2 className='text-center'>{choosenPokemonName}</h2>
				<img
					src={choosenPokemonImage}
					alt={choosenPokemonName}
					className='w-3/4'
				/>
				<div className='p-4 flex flex-col items-center justify-center gap-4'>
					<div className='flex flex-col items-center'>
						<p>Price</p>
						<p>{choosenPokemonPrice}</p>
					</div>
				</div>
			</div>
		)
	);
};

export default CardInfo;
