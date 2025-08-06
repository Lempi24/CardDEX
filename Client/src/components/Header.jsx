import { useAppContext } from '../contexts/UIContext';
import { useAuthContext } from '../contexts/AuthContext';
const Header = () => {
	const { logo } = useAppContext();
	const { handleLogOut } = useAuthContext();
	return (
		<header className='bg-second py-4 px-5 border-b border-filling'>
			<div className='max-w-[700px] mx-auto flex justify-between items-center'>
				<div className='flex items-center justify-center'>
					<img src={logo} alt='pokeball logo' className='w-[30px] h-[30px]' />
					<h2 className='ml-3 text-sm lg:text-xl font-bold'>CardDEX</h2>
				</div>
				<button
					onClick={handleLogOut}
					className='flex items-center text-accent1 text-base cursor-pointer gap-2'
				>
					<p className='text-sm'>Log out</p>
					<svg
						fill='currentColor'
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						className='w-[25px]'
					>
						<path d='M5 3h16v4h-2V5H5v14h14v-2h2v4H3V3h2zm16 8h-2V9h-2V7h-2v2h2v2H7v2h10v2h-2v2h2v-2h2v-2h2v-2z' />
					</svg>
				</button>
			</div>
		</header>
	);
};
export default Header;
