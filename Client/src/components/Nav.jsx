import { Link, useLocation } from 'react-router-dom';
const Nav = ({ handleAddCard }) => {
	const location = useLocation();
	return (
		<nav className='fixed bottom-0 left-0 w-full flex justify-around items-center bg-second h-[65px] z-10'>
			<Link
				to='/main-page'
				className='flex flex-col items-center justify-center flex-grow text-xs text-text hover:text-accent1 transition-colors'
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					className='fill-current w-7 h-7 mb-1'
				>
					<path d='M2 4h20v16H2V4zm18 14V6H4v12h16z' />
				</svg>
				<span>CardDEX</span>
			</Link>
			<Link
				to='/trade'
				className='flex flex-col items-center justify-center flex-grow text-xs text-text hover:text-accent1 transition-colors'
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					className='fill-current w-7 h-7 mb-1'
				>
					<path d='M11 1H9v2h2v2H5v2H3v10h2v2h2v-2H5V7h6v2H9v2h2V9h2V7h2V5h-2V3h-2V1zm8 4h-2v2h2v10h-6v-2h2v-2h-2v2h-2v2H9v2h2v2h2v2h2v-2h-2v-2h6v-2h2V7h-2V5z' />
				</svg>
				<span>Trade</span>
			</Link>
			{location.pathname === '/main-page' && (
				<button
					onClick={handleAddCard}
					className='bg-accent1 text-main w-16 h-16 rounded-full flex items-center justify-center -translate-y-6 border-4 border-main shadow-lg hover:scale-105 transition-transform cursor-pointer'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						className='fill-current w-8 h-8'
					>
						<path d='M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z' />
					</svg>
				</button>
			)}
			<Link
				to='/chat'
				className='flex flex-col items-center justify-center flex-grow text-xs text-text hover:text-accent1 transition-colors'
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					className='fill-current w-7 h-7 mb-1'
				>
					<path d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z' />
				</svg>
				<span>Chat</span>
			</Link>
			<Link
				to='/profile'
				className='flex flex-col items-center justify-center flex-grow text-xs text-text hover:text-accent1 transition-colors'
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					className='fill-current w-7 h-7 mb-1'
				>
					<path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
				</svg>
				<span>Profile</span>
			</Link>
		</nav>
	);
};
export default Nav;
