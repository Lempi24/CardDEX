const CardInfo = ({
	imageUrl,
	name,
	price,
	handleRefreshPrice,
	priceLoading,
	handleDeleteCard,
	showDeleteOverlay,
	onConfirmDelete,
	onCancelDelete,
	shareState,
	handleShareCard,
}) => {
	return (
		<div className='flex flex-col items-center justify-center text-text'>
			<div className='relative w-3/4 max-w-[200px] rounded-xl mb-6 shadow-xl'>
				<img
					src={imageUrl}
					alt={name}
					className='w-full h-full object-cover rounded-xl'
				/>
				{showDeleteOverlay && (
					<div className='absolute inset-0 bg-negative-transparent flex flex-col items-center justify-center rounded-xl z-10'>
						<p className='text-xl  font-bold mb-4 text-center'>Are you sure?</p>
						<button
							onClick={onConfirmDelete}
							className='bg-negative  py-2 px-6 rounded-lg mb-2 cursor-pointer'
						>
							Delete
						</button>
						<button
							onClick={onCancelDelete}
							className=' underline text-sm cursor-pointer'
						>
							Cancel
						</button>
					</div>
				)}
			</div>

			<h3 className='text-3xl text-text text-center mb-2 capitalize'>{name}</h3>
			<div className='flex items-center gap-3 mb-6'>
				<p className='text-2xl font-semibold text-accent1'>
					{parseFloat(price).toFixed(2)} PLN
				</p>
				<button
					onClick={handleRefreshPrice}
					className='bg-accent1 w-10 h-10 rounded-full flex items-center justify-center disabled:cursor-not-allowed cursor-pointer'
					title='Refresh price'
					disabled={priceLoading}
				>
					{priceLoading ? (
						<div className='w-5 h-5 border-2 border-white/30 border-t-filling rounded-full animate-spin'></div>
					) : (
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 24 24'
							className='fill-filling p-2'
						>
							<path d='M16 2h-2v2h2v2H4v2H2v5h2V8h12v2h-2v2h2v-2h2V8h2V6h-2V4h-2V2zM6 20h2v2h2v-2H8v-2h12v-2h2v-5h-2v5H8v-2h2v-2H8v2H6v2H4v2h2v2z' />
						</svg>
					)}
				</button>
				<button
					onClick={handleDeleteCard}
					className='bg-negative w-10 h-10 rounded-full flex items-center justify-center disabled:cursor-not-allowed cursor-pointer'
					title='Delete card'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						className='fill-filling p-2'
					>
						<path d='M16 2v4h6v2h-2v14H4V8H2V6h6V2h8zm-2 2h-4v2h4V4zm0 4H6v12h12V8h-4zm-5 2h2v8H9v-8zm6 0h-2v8h2v-8z' />
					</svg>
				</button>
			</div>
			<div className='flex items-center justify-center'>
				<div className='flex flex-col max-w-3/4 min-h-[32px] justify-center'>
					<p className='text-sm'>Share for trade</p>
					<p className='text-[0.6rem] text-filling'>
						{shareState
							? 'Card is visiable for others '
							: 'Card is not visiable for others'}
					</p>
				</div>
				<button
					onClick={handleShareCard}
					className={` w-[50px] h-[25px] rounded-2xl cursor-pointer transition-colors duration-300 ${
						shareState ? 'bg-accept' : 'bg-filling'
					}`}
				>
					<div
						className={`rounded-full w-[25px] h-[25px] bg-accent1 border-1 border-main transition-transform duration-300 ${
							shareState ? 'translate-x-full' : ''
						}`}
					></div>
				</button>
			</div>
		</div>
	);
};

export default CardInfo;
