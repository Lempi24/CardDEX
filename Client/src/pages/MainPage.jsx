import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/pokeball.png';
import axios from 'axios';
import CardInfo from '../components/CardInfo';
import CameraPanel from '../components/CameraPanel';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
const MainPage = () => {
	const [isCardInfoVisible, setIsCardInfoVisible] = useState(false);
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
				navigate('/');
				return;
			}
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/cards?page=${page}&limit=9`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setCards(response.data.cards);
			setPagination({
				currentPage: response.data.currentPage,
				totalPages: response.data.totalPages,
				limit: 9,
			});
		} catch (err) {
			console.error('Error fetching cards:', err);
			setError('Failed to load cards. Please log in again.');
			if (err.response?.status === 401) {
				localStorage.removeItem('token');
				navigate('/');
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
				{ cardName: fullCardName, filter: 'from', language: '1' },
				{
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				}
			);
			return response.data.price ?? null;
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
				{ cardId, newPrice },
				{
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				}
			);
			if (response.status === 200) {
				setCards((prev) =>
					prev.map((c) => (c._id === cardId ? { ...c, price: newPrice } : c))
				);
				if (selectedCard?._id === cardId) {
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

	const handleCardClick = (card) => {
		setSelectedCard(card);
		setIsCardInfoVisible(true);
	};

	const handleClosePanel = () => {
		setIsCardInfoVisible(false);
	};

	const handleAddCard = () => {
		setIsCameraVisiable(true);
	};

	const handleLogOut = () => {
		localStorage.removeItem('token');
		navigate('/');
	};

	const handleRefreshPrice = async () => {
		if (!selectedCard) return;
		const newPrice = await scrapeCardPrice(
			selectedCard.name,
			selectedCard.number
		);
		if (newPrice !== null) {
			await updateCardPriceInDatabase(selectedCard._id, newPrice.toString());
			toast.success('Price updated!', {
				className: 'custom-success-toast',
			});
		} else {
			toast.error('Something went wrong, try again', {
				className: 'custom-error-toast',
			});
		}
	};

	return (
		<>
			<div className='min-h-screen bg-main text-text'>
				<div className='max-w-[700px] mx-auto flex flex-col min-h-screen'>
					<header className='flex justify-between items-center px-5 py-4 border-b border-filling'>
						<div className='flex items-center justify-center'>
							<img src={logo} alt='pokeball logo' className='w-10 h-10' />
							<h2 className='ml-3 text-xl font-bold'>CardDEX</h2>
						</div>
						<button
							onClick={handleLogOut}
							className='flex items-center gap-2 text-accent1 text-base cursor-pointer'
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
					</header>

					{/* Main */}
					<main className='px-4 py-6 pb-[100px]'>
						<h2 className='text-xl font-semibold mb-6 text-center text-text'>
							Your CardDEX
						</h2>
						{loading && (
							<div className='flex justify-center items-center h-screen bg-main text-text text-xl'>
								Loading...
							</div>
						)}
						{error && (
							<div className='flex justify-center items-center h-[60vh] text-negative'>
								{error}
							</div>
						)}
						{!error && cards.length === 0 && !loading && (
							<div className='flex justify-center items-center h-[60vh] text-filling'>
								You have no cards yet!
							</div>
						)}
						<div className='grid grid-cols-3 gap-4'>
							{cards.map((card) => (
								<div
									key={card._id}
									className='bg-binder rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 shadow-lg aspect-[5/7] active:scale-95'
									onClick={() => handleCardClick(card)}
								>
									<img
										src={card.imageUrl}
										alt={card.name}
										className='w-full h-full object-cover'
									/>
								</div>
							))}
						</div>
						{pagination.totalPages > 1 && (
							<div className='flex justify-center items-center gap-4 mt-6'>
								<button
									onClick={() => fetchUserCards(pagination.currentPage - 1)}
									disabled={pagination.currentPage === 1}
									className='bg-accent1 border text-binder border-binder rounded-lg w-10 h-10 disabled:bg-[#3a3f4b] disabled:text-[#a9a9b3] disabled:cursor-not-allowed cursor-pointer'
								>
									{'<'}
								</button>
								<span className='text-text'>
									Page {pagination.currentPage} of {pagination.totalPages}
								</span>
								<button
									onClick={() => fetchUserCards(pagination.currentPage + 1)}
									disabled={pagination.currentPage === pagination.totalPages}
									className='bg-accent1 border text-binder border-binder rounded-lg w-10 h-10 disabled:bg-[#3a3f4b] disabled:text-[#a9a9b3] disabled:cursor-not-allowed cursor-pointer'
								>
									{'>'}
								</button>
							</div>
						)}
					</main>

					{/* Przycisk do dodawania karty */}
					<button
						onClick={handleAddCard}
						className='fixed bottom-4 left-1/2 -translate-x-1/2 text-accent1 cursor-pointer bg-main-transparent p-4 rounded-2xl'
					>
						+ Add card
					</button>
				</div>
			</div>

			{/* Panel kamery */}
			{isCameraVisiable && (
				<CameraPanel
					onClose={() => setIsCameraVisiable(false)}
					onCardAdded={() => fetchUserCards(pagination.currentPage)}
				/>
			)}

			{/* Wysuwany panel */}
			<AnimatePresence>
				{isCardInfoVisible && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className='fixed inset-0 bg-black/60 z-20'
							onClick={handleClosePanel}
						/>

						{/* Panel z kartą */}
						<motion.div
							className='fixed bottom-0 left-0 w-full bg-binder rounded-t-2xl pt-10 p-5 shadow-[0_-5px_30px_rgba(0,0,0,0.4)] flex flex-col items-center z-30'
							drag='y'
							dragConstraints={{ top: 0, bottom: 500 }}
							initial={{ y: '100%' }}
							animate={{ y: 0 }}
							exit={{ y: '100%' }}
							transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							onDragEnd={(event, info) => {
								if (info.offset.y > 150) {
									handleClosePanel();
								}
							}}
						>
							<div className='absolute top-3 h-1 w-12 bg-[#3a3f4b] rounded-full'></div>
							{selectedCard && (
								<>
									<CardInfo
										imageUrl={selectedCard.imageUrl}
										name={selectedCard.name}
										price={selectedCard.price}
										handleRefreshPrice={handleRefreshPrice}
										priceLoading={priceLoading}
									/>
								</>
							)}
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
};

export default MainPage;
