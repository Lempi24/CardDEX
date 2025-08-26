import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CardInfo from '../components/CardInfo';
import CardPanel from '../components/CardPanel';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import useMediaQuery from '../hooks/useMediaQuery';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { fetchMyCards } from '../services/cardApi';

const MainPage = () => {
	const [isCardInfoVisible, setIsCardInfoVisible] = useState(false);
	const [selectedCard, setSelectedCard] = useState(null);
	const [isCardPanelVisiable, setIsCardPanelVisiable] = useState(false);
	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [priceLoading, setPriceLoading] = useState(false);
	const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);
	const [userCardsValue, setUserCardsValue] = useState(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
	});
	const [direction, setDirection] = useState(0);
	const navigate = useNavigate();

	const isMobile = useMediaQuery('(max-width: 768px)');
	const paginationLimit = isMobile ? 9 : 12;

	const fetchUserCards = useCallback(
		async (page, limit) => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchMyCards({ page: page, limit: limit });
				setCards(data.cards);
				setPagination({
					currentPage: data.currentPage,
					totalPages: data.totalPages,
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
		},
		[navigate]
	);

	const fetchUserCardsValue = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) return;
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/cards/fetch-value`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setUserCardsValue(response.data.totalValue);
		} catch (error) {
			console.error('Error fetching user cards value:', error);
		}
	};

	useEffect(() => {
		fetchUserCardsValue();
	}, []);

	useEffect(() => {
		fetchUserCards(pagination.currentPage, paginationLimit);
	}, [pagination.currentPage, paginationLimit, fetchUserCards]);

	const handlePageChange = (newPage) => {
		if (newPage > pagination.totalPages || newPage < 1) return;

		if (newPage > pagination.currentPage) {
			setDirection(1);
		} else {
			setDirection(-1);
		}
		setPagination((prev) => ({ ...prev, currentPage: newPage }));
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
			}
		} catch (error) {
			console.error('Error updating card price:', error);
		}
	};

	const shareCard = async (cardId) => {
		try {
			const response = await axios.put(
				`${import.meta.env.VITE_BACKEND_URL}/api/cards/share`,
				{ cardId },
				{
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				}
			);
			const updatedCard = response.data;
			setSelectedCard(updatedCard);
			setCards((prevCards) =>
				prevCards.map((card) =>
					card._id === updatedCard._id ? updatedCard : card
				)
			);
			toast.info('Share status changed!', {
				className: 'custom-info-toast',
			});
		} catch (error) {
			console.error('Failed to update share status:', error);
		}
	};

	const deleteCard = async (cardId) => {
		try {
			await axios.delete(
				`${import.meta.env.VITE_BACKEND_URL}/api/cards/deletecard/${cardId}`,
				{
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				}
			);
			toast.success('Card deleted successfully!', {
				className: 'custom-success-toast',
			});
			fetchUserCards(pagination.currentPage, paginationLimit);
			fetchUserCardsValue();
			setShowDeleteOverlay(false);
			setIsCardInfoVisible(false);
			setSelectedCard(null);
		} catch (error) {
			console.error('Error deleting card:', error);
			toast.error('Failed to delete card', {
				className: 'custom-error-toast',
			});
		}
	};

	const handleCardClick = (card) => {
		setSelectedCard(card);
		setIsCardInfoVisible(true);
		setShowDeleteOverlay(false);
	};

	const handleClosePanel = () => setIsCardInfoVisible(false);
	const handleAddCard = () => setIsCardPanelVisiable(true);
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
			fetchUserCardsValue();
		} else {
			toast.error('Something went wrong, try again', {
				className: 'custom-error-toast',
			});
		}
	};

	const variants = {
		enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
		center: { x: 0, opacity: 1 },
		exit: (direction) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
	};
	return (
		<>
			<div className='min-h-screen bg-main text-text pb-[65px]'>
				<Header handleLogOut={handleLogOut} />
				<main className='max-w-[700px] mx-auto px-4 py-6'>
					<h2 className='text-xl font-semibold mb-6 text-center text-text'>
						Your CardDEX is worth ~{' '}
						{userCardsValue ? Number(userCardsValue).toFixed(2) : '0.00'} PLN
					</h2>

					{loading && cards.length === 0 && (
						<div className='flex justify-center items-center h-[60vh] text-xl'>
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

					<AnimatePresence initial={false} custom={direction} mode='wait'>
						<motion.div
							key={pagination.currentPage}
							custom={direction}
							variants={variants}
							initial='enter'
							animate='center'
							exit='exit'
							transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							drag='x'
							dragConstraints={{ left: 0, right: 0 }}
							onDragEnd={(e, { offset }) => {
								const swipeThreshold = 50;
								if (
									offset.x < -swipeThreshold &&
									pagination.currentPage < pagination.totalPages
								) {
									handlePageChange(pagination.currentPage + 1);
								} else if (
									offset.x > swipeThreshold &&
									pagination.currentPage > 1
								) {
									handlePageChange(pagination.currentPage - 1);
								}
							}}
						>
							<div
								className={
									isMobile ? 'grid grid-cols-3 gap-3' : 'grid grid-cols-4 gap-4'
								}
							>
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
						</motion.div>
					</AnimatePresence>
					{pagination.totalPages > 1 && !loading && (
						<div className='flex justify-center items-center gap-4 mt-6'>
							<button
								onClick={() => handlePageChange(pagination.currentPage - 1)}
								disabled={pagination.currentPage === 1}
								className='bg-accent1 border text-binder border-binder rounded-lg w-10 h-10 disabled:bg-[#3a3f4b] disabled:text-[#a9a9b3] disabled:cursor-not-allowed cursor-pointer'
							>
								{'<'}
							</button>
							<span className='text-text'>
								Page {pagination.currentPage} of {pagination.totalPages}
							</span>
							<button
								onClick={() => handlePageChange(pagination.currentPage + 1)}
								disabled={pagination.currentPage === pagination.totalPages}
								className='bg-accent1 border text-binder border-binder rounded-lg w-10 h-10 disabled:bg-[#3a3f4b] disabled:text-[#a9a9b3] disabled:cursor-not-allowed cursor-pointer'
							>
								{'>'}
							</button>
						</div>
					)}
				</main>
			</div>
			<Nav handleAddCard={handleAddCard} />
			{isCardPanelVisiable && (
				<CardPanel
					refreshCardsValue={fetchUserCardsValue}
					onClose={() => setIsCardPanelVisiable(false)}
					onCardAdded={() =>
						fetchUserCards(pagination.currentPage, paginationLimit)
					}
				/>
			)}

			<AnimatePresence>
				{isCardInfoVisible && selectedCard && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className='fixed inset-0 bg-black/60 z-20'
							onClick={handleClosePanel}
						/>
						<motion.div
							className='fixed bottom-0 left-1/2 -translate-x-1/2 w-full lg:w-1/3 bg-binder rounded-t-2xl pt-10 p-5 shadow-[0_-5px_30px_rgba(0,0,0,0.4)] flex flex-col items-center z-30'
							drag='y'
							dragConstraints={{ top: 0, bottom: 500 }}
							dragSnapToOrigin={true}
							initial={{ y: '100%' }}
							animate={{ y: 0 }}
							exit={{ y: '100%' }}
							transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							onDragEnd={(event, info) => {
								if (info.offset.y > 200 || info.velocity.y > 300) {
									handleClosePanel();
								}
							}}
						>
							<div className='absolute top-3 h-1 w-12 bg-[#3a3f4b] rounded-full'></div>
							<CardInfo
								imageUrl={selectedCard.imageUrl}
								name={selectedCard.name}
								price={selectedCard.price}
								handleRefreshPrice={handleRefreshPrice}
								priceLoading={priceLoading}
								handleDeleteCard={() => setShowDeleteOverlay(true)}
								showDeleteOverlay={showDeleteOverlay}
								onConfirmDelete={() => deleteCard(selectedCard._id)}
								onCancelDelete={() => setShowDeleteOverlay(false)}
								shareState={selectedCard.isForTrade}
								handleShareCard={() => shareCard(selectedCard._id)}
							/>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
};

export default MainPage;
