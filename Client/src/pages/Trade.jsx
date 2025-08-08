import Nav from '../components/Nav';
import Header from '../components/Header';
import FormInput from '../components/FormInput';
import Pikacz from '../img/Pikacz.png';
import Kajoger from '../img/Kajoger.png';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { fetchMyCards } from '../services/cardApi';
import { toast } from 'react-toastify';
const Trade = ({ logo, handleLogOut }) => {
	const [cardsForTrade, setCardsForTrade] = useState([]);
	const [tradeSearchResults, setTradeSearchResults] = useState([]);
	const [searchInput, setSearchInput] = useState('');
	const [isSearched, setIsSearched] = useState(false);
	const [isTradePanelVisiable, setIsTradePanelVisiable] = useState({
		tradePanel: false,
		addCardForTrade: false,
	});
	const [tradeCardInfo, setTradeCardInfo] = useState({});
	const [cards, setCards] = useState([]);
	const [showAllCards, setShowAllCards] = useState(false);
	const [choosenCardForTrade, setChoosenCardForTrade] = useState({});
	const [userTrades, setUserTrades] = useState([]);
	//Fetchuje karty które user ma na wymianę
	const fetchUserTradeCards = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/cards/cards-for-trade`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setCardsForTrade(response.data.cardsForTrade);
		} catch (error) {
			console.error('Error fetching user cards for trade:', error);
		}
	};
	//Fetchuje karty na wymianę innych użytkowników
	const fetchCardsFoundForTrade = async () => {
		setSearchInput('');
		if (!isSearched) setIsSearched(true);
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/cards/trade-results`,
				{
					params: { searchInput: searchInput },
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setTradeSearchResults(response.data.cardsForTradeSearchResults);
		} catch (error) {
			console.error('Error fetching trade search results:', error);
		}
	};

	const fetchTrades = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/trades/user-trades`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setUserTrades(response.data.userTrades);
		} catch (error) {
			console.error('Error fetching trade search results:', error);
		}
	};

	const makeTradeRequest = (ownerName, imageUrl, ownerId, cardId) => {
		setTradeCardInfo({
			cardId: cardId,
			ownerId: ownerId,
			owner: ownerName,
			url: imageUrl,
		});
		setIsTradePanelVisiable((prev) => ({ ...prev, tradePanel: true }));
	};
	const handleAddCardForTrade = async () => {
		try {
			const data = await fetchMyCards({ limit: 0 });
			setCards(data.cards);
		} catch (error) {
			console.log('Wystąpił taki błąd', error);
		}
	};
	const sendTradeOffer = async () => {
		const tradeData = {
			proposingUser: choosenCardForTrade.ownerId,
			receivingUser: tradeCardInfo.ownerId,
			offeredCard: choosenCardForTrade._id,
			requestedCard: tradeCardInfo.cardId,
		};
		try {
			const token = localStorage.getItem('token');
			await axios.post(
				`${import.meta.env.VITE_BACKEND_URL}/api/trades/create`,
				tradeData,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			toast.success('Trade offer sent successfully!', {
				className: 'custom-success-toast',
			});
			setIsTradePanelVisiable((prev) => ({ ...prev, tradePanel: false }));
		} catch (error) {
			console.error('Failed to send trade offer:', error);
			toast.error('Could not send trade offer. Please try again.');
		}
	};
	const clearTradePanel = () => {
		setIsTradePanelVisiable((prev) => ({
			...prev,
			tradePanel: false,
		}));
		setChoosenCardForTrade({});
	};
	const addCardToTrade = (card) => {
		setChoosenCardForTrade(card);
		toast.success(`${card.name} added to trade!`, {
			className: 'custom-success-toast',
		});
	};
	useEffect(() => {
		handleAddCardForTrade();
	}, [isTradePanelVisiable.addCardForTrade, showAllCards]);
	useEffect(() => {
		fetchUserTradeCards();
	}, []);
	useEffect(() => {
		fetchTrades();
	}, [userTrades]);
	// useEffect(() => {
	// 	console.log(tradeCardInfo);
	// }, [tradeCardInfo]);
	return (
		<>
			<div className='min-h-screen bg-main text-text pb-[65px]'>
				<Header logo={logo} handleLogOut={handleLogOut} />
				<main className='max-w-[700px] mx-auto px-4 py-6'>
					<div className=' h-screen'>
						<div className='flex gap-5'>
							<FormInput
								placeholder={'Search'}
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
							/>
							<button
								onClick={fetchCardsFoundForTrade}
								className='bg-accent1 text-second p-2 cursor-pointer rounded-xl'
							>
								Search
							</button>
						</div>
						{isSearched && tradeSearchResults.length <= 0 ? (
							<p className='mt-5 ml-5'>No results...</p>
						) : (
							''
						)}

						<div className='flex flex-col gap-3 my-5 max-h-1/2 overflow-y-auto'>
							{tradeSearchResults.map((items) => (
								<button
									onClick={() =>
										makeTradeRequest(
											items.ownerName,
											items.imageUrl,
											items.ownerId,
											items._id
										)
									}
									className='relative border border-accent1 overflow-hidden h-20 shrink-0 text-left cursor-pointer'
								>
									<img
										src={items.imageUrl}
										alt={items.name}
										className='absolute z-1 -top-25 lg:-top-50 w-full'
									/>
									<div className='relative z-10 bg-main-transparent p-4'>
										<p>{items.name}</p>
										<p>Trainer: {items.ownerName}</p>
									</div>
								</button>
							))}
						</div>
						<div className='h-[2px] w-full bg-filling mb-5'></div>
						<div className='flex flex-col gap-3 max-h-1/3 overflow-y-auto pokeball-scrollbar pr-2'>
							<h2>Your trade cards</h2>
							<div className='flex flex-wrap items-center justify-between gap-3'>
								{cardsForTrade <= 0 && (
									<p className='text-sm text-filling'>
										No cards for trade found
									</p>
								)}
								{cardsForTrade.map((items) => (
									<img
										src={items.imageUrl}
										alt={items.name}
										key={items._id}
										className='max-w-[100px] lg:max-w-[150px] rounded-xl'
									/>
								))}
							</div>
						</div>
						<div className='h-[2px] w-full bg-filling my-5'></div>
						{/* Ofetruchy wymiany */}
						<div className='space-y-10'>
							<h2>Your trade offers</h2>
							{userTrades.map((trade) => (
								<div className='flex items-center flex-wrap justify-center'>
									<div className='flex items-center justify-around w-full'>
										<div>
											<img
												src={trade.requestedCard.imageUrl}
												alt=''
												className='w-[100px] rounded-xl'
											/>
										</div>

										<div className='flex flex-col items-center gap-3'>
											<button className='w-[50px] h-[50px] bg-pending rounded-full cursor-pointer'>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													viewBox='0 0 24 24'
													className='fill-main p-2'
												>
													<path d='M18 2H6v6h2v2h2v4H8v2H6v6h12v-6h-2v-2h-2v-4h2V8h2V2zm-2 6h-2v2h-4V8H8V4h8v4zm-2 6v2h2v4H8v-4h2v-2h4z' />
												</svg>
											</button>
											<p className='text-sm'>{trade.status}</p>
										</div>

										<img
											src={trade.offeredCard.imageUrl}
											alt=''
											className='w-[100px] rounded-xl'
										/>
									</div>
								</div>
							))}
						</div>
					</div>
					{/* Panel wymiany */}
					{isTradePanelVisiable.tradePanel && (
						<div className='fixed inset-0 backdrop-blur-md bg-black/30 z-[999]'>
							<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9/10 h-9/10 bg-main p-5 z-1000 lg:w-1/2 lg:h-3/4 overflow-y-auto'>
								<div className='border-b-2 border-filling h-[40px]'>
									<h2>Trade offer</h2>
								</div>
								<div className='lg:flex lg:flex-row lg:items-center lg:justify-around lg:h-3/4'>
									<div className='flex flex-col items-center gap-5 p-10  h-[350px]'>
										<h2>{tradeCardInfo.owner}'s card</h2>
										<img
											src={tradeCardInfo.url}
											alt=''
											className='w-[150px] rounded-xl'
										/>
									</div>
									<div className='relative flex flex-col items-center gap-5 p-10 h-[350px] overflow-y-auto'>
										<h2>Your card</h2>
										{!choosenCardForTrade._id && (
											<button
												onClick={() =>
													setIsTradePanelVisiable((prev) => ({
														...prev,
														addCardForTrade: true,
													}))
												}
												className=' flex flex-col items-center justify-center w-[150px] h-full border-2 border-dashed border-filling cursor-pointer'
											>
												<p>+</p>
												<p>Add your card</p>
											</button>
										)}
										{choosenCardForTrade && (
											<img
												src={choosenCardForTrade.imageUrl}
												alt=''
												className='w-[150px]  rounded-xl'
											/>
										)}
									</div>
								</div>
								<div className='flex justify-end gap-10'>
									<button
										onClick={() => clearTradePanel()}
										className='bg-second text-text p-2 cursor-pointer rounded-xl'
									>
										Cancel
									</button>
									<button
										onClick={() => sendTradeOffer()}
										className={`${
											choosenCardForTrade._id
												? 'bg-accent1'
												: 'bg-filling pointer-events-none'
										} text-second p-2 cursor-pointer rounded-xl`}
									>
										Send offer
									</button>
								</div>
							</div>
						</div>
					)}
					{isTradePanelVisiable.addCardForTrade && (
						<div className='fixed inset-0 backdrop-blur-md bg-black/30 z-[999]'>
							<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9/10 h-3/4 bg-main p-5 z-1000 lg:w-1/2 lg:h-3/4'>
								<h2 className='text-sm w-full'>Pick card to offer</h2>
								<div className='flex flex-col items-center p-10 gap-4'>
									<div className='w-full lg:w-auto lg:gap-3 lg:ml-auto flex items-center justify-between'>
										<button
											onClick={() => setShowAllCards(false)}
											className={`${
												showAllCards
													? 'bg-second text-text'
													: 'bg-accent1 text-second'
											}  p-2 cursor-pointer rounded-xl`}
										>
											For trade
										</button>
										<button
											onClick={() => setShowAllCards(true)}
											className={`${
												showAllCards
													? 'bg-accent1 text-second'
													: 'bg-second text-text'
											}  p-2 cursor-pointer rounded-xl`}
										>
											All
										</button>
									</div>
									<FormInput
										placeholder={'Search'}
										value={searchInput}
										onChange={(e) => setSearchInput(e.target.value)}
									/>
									<p className='text-sm'>Search doesn't work yet lmao</p>
									<div className='flex lg:flex-wrap lg:items-center lg:justify-center gap-4 w-full lg:h-[300px] overflow-y-auto p-4 pokeball-scrollbar'>
										{(showAllCards ? cards : cardsForTrade).map((card) => (
											<button
												key={card._id}
												onClick={() => addCardToTrade(card)}
												className='rounded-xl shrink-0 w-[100px] overflow-hidden ring-offset-main ring-offset-2 focus:outline-none focus:ring-2 focus:ring-accent1 cursor-pointer'
											>
												<img
													src={card.imageUrl}
													alt={card.name}
													className='w-full h-full object-cover hover:scale-105 transition-transform'
												/>
											</button>
										))}
									</div>
									<div className='flex w-full'>
										<button
											onClick={() =>
												setIsTradePanelVisiable((prev) => ({
													...prev,
													addCardForTrade: false,
												}))
											}
											className='bg-second text-text p-2 cursor-pointer rounded-xl ml-auto'
										>
											Close
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
				</main>
			</div>
			<Nav />
		</>
	);
};
export default Trade;
