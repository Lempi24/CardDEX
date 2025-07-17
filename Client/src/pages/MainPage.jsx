import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CardBtn from '../components/CardBtn';
import logo from '../img/pokeball.png';
import CardInfo from '../components/CardInfo';
import CameraPanel from '../components/CameraPanel';
import axios from 'axios';

const MainPage = () => {
	const [isCardInfoVisiable, setIsCardInfoVisiable] = useState(false);
	const [selectedCard, setSelectedCard] = useState(null);
	const [isCameraVisiable, setIsCameraVisiable] = useState(false);
	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [priceLoading, setPriceLoading] = useState(false);
	const navigate = useNavigate();
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		limit: 9,
	});

	const fetchUserCards = async (page = 1) => {
		try {
			setLoading(true);
			setError(null);
			const token = localStorage.getItem('token');

			if (!token) {
				setError('No token found - user not logged in');
				setLoading(false);
				return;
			}

			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/cards?page=${page}&limit=9`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.status === 200) {
				setCards(response.data.cards);
				setPagination({
					currentPage: response.data.currentPage,
					totalPages: response.data.totalPages,
					limit: 9,
				});
			}
		} catch (error) {
			console.error('Error fetching cards:', error);
			if (error.response?.status === 401) {
				setError('Unauthorized - please log in again');
				localStorage.removeItem('token');
				navigate('/');
			} else {
				setError('Failed to load cards');
			}
		} finally {
			setLoading(false);
		}
	};

	const scrapeCardPrice = async (cardName, cardNumber) => {
		try {
			setPriceLoading(true);
			const fullCardName = cardNumber ? `${cardName} ${cardNumber}` : cardName;
			const response = await axios.post(
				`${import.meta.env.VITE_BACKEND_URL}/api/scrape-price`,
				{
					cardName: fullCardName,
					filter: 'from',
					language: '1',
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.status === 200 && response.data.price) {
				return response.data.price;
			}
			return null;
		} catch (error) {
			console.error('Error scraping price:', error);
			return null;
		} finally {
			setPriceLoading(false);
		}
	};

	const updateCardPriceInDatabase = async (cardId, newPrice) => {
		try {
			const response = await axios.put(
				`${import.meta.env.VITE_BACKEND_URL}/api/cards/update-price`,
				{
					cardId: cardId,
					newPrice: newPrice,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.status === 200) {
				// Aktualizuj kartę w lokalnym stanie
				setCards((prevCards) =>
					prevCards.map((card) =>
						card._id === cardId ? { ...card, price: newPrice } : card
					)
				);

				// Aktualizuj wybraną kartę jeśli to ta sama
				if (selectedCard && selectedCard._id === cardId) {
					setSelectedCard((prev) => ({ ...prev, price: newPrice }));
				}

				return true;
			}
			return false;
		} catch (error) {
			console.error('Error updating card price:', error);
			return false;
		}
	};

	useEffect(() => {
		fetchUserCards();
	}, []);

	const handleCardClick = (cardId) => {
		return async () => {
			setIsCardInfoVisiable((prevState) => !prevState);
			if (!isCardInfoVisiable) {
				const card = cards.find((card) => card._id === cardId);
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

	const refreshCards = (page = 1) => {
		fetchUserCards(page);
	};

	const handleRefreshPrice = async () => {
		if (selectedCard && selectedCard.name) {
			const newPrice = await scrapeCardPrice(
				selectedCard.name,
				selectedCard.number
			);

			if (newPrice !== null) {
				const success = await updateCardPriceInDatabase(
					selectedCard._id,
					newPrice.toString()
				);
				if (!success) {
					alert('Failed to update price in database');
				}
			} else {
				alert('Failed to fetch new price');
			}
		}
	};

	if (loading) {
		return (
			<main className='relative bg-main min-h-screen w-full h-screen text-text flex items-center justify-center'>
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
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 24 24'
							className='w-10'
						>
							<path
								d='M5 3h16v4h-2V5H5v14h14v-2h2v4H3V3h2zm16 8h-2V9h-2V7h-2v2h2v2H7v2h10v2h-2v2h2v-2h2v-2h2v-2z'
								fill='currentColor'
							/>
						</svg>
					</button>
				</div>
				<div className='flex flex-col items-center justify-start space-y-2 w-full h-3/4'>
					<h2>Your CardDEX</h2>
					<div className='bg-binder w-11/12 p-4 h-full rounded-md flex justify-center items-center'>
						<p className='text-gray-400 text-2xl font-bold'>Loading cards...</p>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className='relative bg-main min-h-screen w-full h-screen text-text flex items-center justify-center'>
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
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						className='w-10'
					>
						<path
							d='M5 3h16v4h-2V5H5v14h14v-2h2v4H3V3h2zm16 8h-2V9h-2V7h-2v2h2v2H7v2h10v2h-2v2h2v-2h2v-2h2v-2z'
							fill='currentColor'
						/>
					</svg>
				</button>
			</div>

			<CardInfo
				visible={isCardInfoVisiable}
				choosenPokemonName={selectedCard?.name}
				choosenPokemonImage={selectedCard?.imageUrl}
				choosenPokemonPrice={selectedCard?.price}
				showInfoFunction={handleCardClick()}
				onRefreshPrice={handleRefreshPrice}
				priceLoading={priceLoading}
				cardId={selectedCard?._id}
			/>

			<div className='flex flex-col items-center justify-start space-y-2 w-full h-3/4'>
				<h2>Your CardDEX</h2>

				{/* Binder */}
				<div
					className={`bg-binder w-11/12 p-4 h-full rounded-md ${
						cards.length === 0
							? 'flex justify-center items-center'
							: 'grid grid-cols-3 grid-rows-3 gap-4 content-start overflow-y-auto'
					}`}
				>
					{error ? (
						<div className='col-span-3 flex justify-center items-center'>
							<p className='text-negative text-2xl font-bold'>{error}</p>
						</div>
					) : cards.length === 0 ? (
						<p className='text-gray-400 text-2xl font-bold'>No cards yet</p>
					) : (
						cards.map((card) => (
							<CardBtn
								key={card._id}
								pokemon={card.imageUrl}
								name={card.name}
								showInfoFunction={handleCardClick(card._id)}
							/>
						))
					)}
				</div>

				{/* Paginacja */}
				{cards.length > 0 && pagination.totalPages > 1 && (
					<div className='flex items-center justify-center gap-4 mt-2 w-full'>
						<button
							onClick={() => fetchUserCards(pagination.currentPage - 1)}
							disabled={pagination.currentPage === 1}
							className='px-4 py-2 bg-accent1 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-accent1-dark transition-colors'
						>
							{'<'}
						</button>

						<span className='text-text font-medium'>
							Page {pagination.currentPage} of {pagination.totalPages}
						</span>

						<button
							onClick={() => fetchUserCards(pagination.currentPage + 1)}
							disabled={pagination.currentPage === pagination.totalPages}
							className='px-4 py-2 bg-accent1 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-accent1-dark transition-colors'
						>
							{'>'}
						</button>
					</div>
				)}
			</div>

			{isCameraVisiable && (
				<CameraPanel
					onClose={() => setIsCameraVisiable(false)}
					onCardAdded={(page = 1) => fetchUserCards(page)}
				/>
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
