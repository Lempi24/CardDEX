import Nav from '../components/Nav';
import Header from '../components/Header';
import FormInput from '../components/FormInput';
import Pikacz from '../img/Pikacz.png';
import axios from 'axios';
import { useEffect, useState } from 'react';
const Trade = ({ logo, handleLogOut }) => {
	const [cardsForTrade, setCardsForTrade] = useState([]);
	const [cardsFoundForTrade, setCardsFoundForTrade] = useState([]);
	const [searchInput, setSearchInput] = useState('');
	const [isSearched, setIsSearched] = useState(false);
	const fetchUserTradeCards = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/cards/cards-for-trade`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setCardsForTrade(response.data.cardsForTradeURL);
		} catch (error) {
			console.error('Error fetching user cards for trade:', error);
		}
	};
	const fetchCardsFoundForTrade = async () => {
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
			setCardsFoundForTrade(response.data.cardsForTradeSearchResults);
		} catch (error) {
			console.error('Error fetching trade search results:', error);
		}
	};
	useEffect(() => {
		fetchUserTradeCards();
	}, []);
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
								className='bg-accent1 text-second p-2 cursor-pointer'
							>
								Search
							</button>
						</div>
						{isSearched && cardsFoundForTrade.length <= 0 ? (
							<p className='mt-5 ml-5'>No results...</p>
						) : (
							''
						)}

						<div className='flex flex-col gap-3 my-5 max-h-1/2 overflow-y-auto'>
							{cardsFoundForTrade.map((items) => (
								<button
									className='relative border border-accent1 overflow-hidden h-20 shrink-0 text-left cursor-pointer'
									owner={items.ownerName}
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
						<div className='flex flex-col gap-3 max-h-1/3 overflow-y-auto'>
							<h2>Your trade cards</h2>
							<div className='flex flex-wrap items-center justify-between gap-3'>
								{cardsForTrade <= 0 && (
									<p className='text-sm text-filling'>
										No cards for trade found
									</p>
								)}
								{cardsForTrade.map((items) => (
									<img
										src={items}
										alt={items}
										key={items}
										className='max-w-[100px] lg:max-w-[150px] rounded-xl'
									/>
								))}
							</div>
						</div>
						<div className='h-[2px] w-full bg-filling my-5'></div>
						<div className='space-y-10'>
							<h2>Your trade offers</h2>
							<p className='w-full text-center'>Comming soon!</p>
						</div>
					</div>
				</main>
			</div>
			<Nav />
		</>
	);
};
export default Trade;
