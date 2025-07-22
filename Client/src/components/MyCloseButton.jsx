const MyCloseButton = ({ closeToast }) => (
	<button onClick={closeToast} className='absolute right-3'>
		<svg
			className='fill-white w-[32px] h-[32px] z-10 cursor-pointer'
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 24 24'
			style={{
				shapeRendering: 'crispEdges',
				imageRendering: 'pixelated',
			}}
		>
			{' '}
			<path d='M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z' />{' '}
		</svg>
	</button>
);

export default MyCloseButton;
