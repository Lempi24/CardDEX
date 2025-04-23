import { useState } from 'react';
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
	const handleCardClick = (id) => {
		return () => {
			setIsCardInfoVisiable((prevState) => !prevState);
			if (!isCardInfoVisiable) {
				const card = cards.find((card) => card.id === id);
				setSelectedCard(card);
			}
		};
	};

	return (
		<main className='relative bg-main min-h-screen w-full text-text flex items-center justify-center'>
			<div className='flex items-center justify-center w-full pt-4 absolute top-0'>
				<img src={logo} alt='pokeball logo' className='w-10 h-10' />
				<h2 className='ml-3 text-xl font-bold'>CardDEX</h2>
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
			<CameraPanel />
			<button className='outside-circle fixed w-10 h-10 bg-binder bottom-10 border-2 border-accent1 rounded-3xl'></button>
		</main>
	);
};

export default MainPage;
