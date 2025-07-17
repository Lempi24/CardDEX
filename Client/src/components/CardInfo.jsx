import strzalka from '../img/strzalka.png';

const CardInfo = ({
	visible,
	choosenPokemonName,
	choosenPokemonImage,
	choosenPokemonPrice,
	showInfoFunction,
	onRefreshPrice,
	priceLoading,
	cardId,
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
						<div className='flex items-center gap-2'>
							<p>{choosenPokemonPrice} PLN</p>
							<button
								onClick={onRefreshPrice}
								disabled={priceLoading}
								className='p-2 bg-accent1 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-accent1-dark transition-colors'
							>
								{priceLoading ? (
									<svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
											fill='none'
										/>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
										/>
									</svg>
								) : (
									<svg
										className='h-4 w-4'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
										/>
									</svg>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		)
	);
};

export default CardInfo;
