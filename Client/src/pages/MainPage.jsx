import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardBtn from '../components/CardBtn';
import logo from '../img/pokeball.png';
import pikachu from '../img/cards/pikachu.png';
import charizard from '../img/cards/charizard.png';
import CardInfo from '../components/CardInfo';
import CameraPanel from '../components/CameraPanel';
const MainPage = () => {
	const cards = [
		{ id: 1, name: 'Pikachu', image: pikachu, price: '20€' },
		{ id: 2, name: 'Charizard', image: charizard, price: '50€' },
		{ id: 3, name: 'Mewtwo', image: '/cards/mewtwo.png' },
		{ id: 4, name: 'Bulbasaur', image: '/cards/bulbasaur.png' },
		{ id: 5, name: 'Eevee', image: '/cards/eevee.png' },
		{ id: 6, name: 'Gengar', image: '/cards/gengar.png' },
		{ id: 7, name: 'Snorlax', image: '/cards/snorlax.png' },
		{ id: 8, name: 'Blastoise', image: '/cards/blastoise.png' },
	];
	const [isCardInfoVisiable, setIsCardInfoVisiable] = useState(false);
	const [selectedCard, setSelectedCard] = useState(null);
	const [isCameraVisiable, setIsCameraVisiable] = useState(false);
	const navigate = useNavigate();
	const handleCardClick = (id) => {
		return () => {
			setIsCardInfoVisiable((prevState) => !prevState);
			if (!isCardInfoVisiable) {
				const card = cards.find((card) => card.id === id);
				setSelectedCard(card);
			}
		};
	};
	const handleAddCard = () => {
		setIsCameraVisiable(true);
	};
	const handleLogOut = () => {
		if (localStorage.getItem('token')) {
			localStorage.removeItem('token');
			navigate('/');
		}
	};
	return (
		<main className='relative bg-main min-h-screen w-full text-text flex items-center justify-center'>
			<div className='absolute top-0 flex items-center justify-around w-full pt-4'>
				<div className='flex items-center justify-center'>
					<img src={logo} alt='pokeball logo' className='w-10 h-10' />
					<h2 className='ml-3 text-xl font-bold'>CardDEX</h2>
				</div>
				<button
					className='flex items-center gap-2 text-accent1'
					onClick={handleLogOut}
				>
					<p className=''>Log out</p>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 512 512'
						className='w-[30px] fill-accent1'
					>
						<path d='M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z' />
					</svg>
				</button>
			</div>
			<CardInfo
				visible={isCardInfoVisiable}
				choosenPokemonName={selectedCard?.name}
				choosenPokemonImage={selectedCard?.image}
				choosenPokemonPrice={selectedCard?.price}
				showInfoFunction={handleCardClick()}
			/>
			<div className='flex flex-col items-center justify-center gap-3'>
				<h2>Your CardDEX</h2>
				<div className='binder bg-binder grid grid-cols-3 w-11/12 transition-all duration-300'>
					{cards.map((card) => (
						<CardBtn
							key={card.id}
							pokemon={card.image}
							name={card.name}
							showInfoFunction={handleCardClick(card.id)}
						/>
					))}
				</div>
			</div>
			{isCameraVisiable && (
				<CameraPanel onClose={() => setIsCameraVisiable(false)} />
			)}
			<button
				onClick={handleAddCard}
				className='fixed bottom-0 m-4 text-accent1'
			>
				+ Add card
			</button>
		</main>
	);
};

export default MainPage;
