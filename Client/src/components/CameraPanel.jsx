import Webcam from 'react-webcam';
import { useEffect, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import axios from 'axios';
import { toast } from 'react-toastify';
const CameraPanel = ({ onClose, onCardAdded, refreshCardsValue }) => {
	const [pokemonName, setPokemonName] = useState('');

	const [cardNumber, setCardNumber] = useState('');
	const [cardPrice, setCardPrice] = useState(null);
	const [cardURL, setCardURL] = useState('');
	const [isFetchingPrice, setIsFetchingPrice] = useState(false);
	const [isFlipped, setIsFlipped] = useState(false);
	const [filterOption, setFilterOption] = useState('from');
	const [filterLanguage, setFilterLanguage] = useState('1');

	const fetchCardPrice = async () => {
		setIsFlipped(false);
		setIsFetchingPrice(true);
		try {
			const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/price`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: pokemonName,
					number: cardNumber,
					filter: filterOption,
					language: filterLanguage,
				}),
			});
			const data = await res.json();
			if (data.price) {
				setCardPrice(data.price);

				if (data.imageUrl) {
					console.log('Oryginalny URL obrazka:', data.imageUrl);

					const proxyUrl = `${
						import.meta.env.VITE_BACKEND_URL
					}/api/card-image?url=${encodeURIComponent(data.imageUrl)}`;
					console.log('Proxy URL obrazka:', proxyUrl);
					setCardURL(proxyUrl);
				} else {
					console.log('Nie otrzymano URL obrazka');
				}
			} else {
				setCardPrice('Not found');
				toast.error('Something went wrong, try again', {
					className: 'custom-error-toast',
				});
			}
		} catch (err) {
			console.error(err);
			setCardPrice('Not found');
			toast.error('Something went wrong, try again', {
				className: 'custom-error-toast',
			});
		}
		setIsFetchingPrice(false);
	};

	const handleFilterChange = (e) => {
		setFilterOption(e.target.value);
	};
	const handleLanguageChange = (e) => {
		setFilterLanguage(e.target.value);
	};
	const addCard = async (pokemonName, cardNumber, cardPrice, cardURL) => {
		try {
			const token = localStorage.getItem('token');

			if (!token) {
				console.error('No token found - user not logged in');
				return;
			}
			const response = await axios.post(
				`${import.meta.env.VITE_BACKEND_URL}/api/cards/addcard`,
				{ pokemonName, cardNumber, cardPrice, cardURL },
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.status === 201) {
				toast.success('Card added', {
					className: 'custom-success-toast',
				});
				refreshCardsValue();
				onCardAdded(1);
			}
		} catch (error) {
			toast.error('An error occured, please try again', {
				className: 'custom-error-toast',
			});
			console.error('Wystąpił błąd:', error);

			if (error.response?.status === 401) {
				console.error('Unauthorized - token expired or invalid');
				localStorage.removeItem('token');
			} else if (error.response?.status === 400) {
				console.error('Bad request:', error.response.data.message);
			} else {
				console.error(
					'Server error:',
					error.response?.data?.message || error.message
				);
			}
		}
	};
	return (
		<div className='fixed inset-0 z-50 backdrop-blur-md  text-text'>
			<div className='fixed inset-0 z-50 flex items-center justify-center text-text'>
				{/* Nowy, główny kontener z pozycjonowaniem względnym */}
				<div className='relative'>
					{/* Główny kontener slab-a — dodajemy 'relative' dla ConfirmCardPanel */}
					<div className='relative bg-main w-80 md:min-w-[400px] xl:min-w-[500px] rounded-lg shadow-2xl border-2 border-filling overflow-hidden'>
						{/* Górny panel - sekcja karty */}
						<div className='p-4 pb-2 border-b-4 border-filling flex flex-col items-center'>
							<div className='flex justify-between items-center mb-2 gap-10'>
								<div className='flex items-center gap-3'>
									<input
										type='text'
										value={pokemonName}
										onChange={(e) => setPokemonName(e.target.value)}
										className=' bg-filling border border-accent1 rounded text-center text-text font-mono text-sm py-1 px-2 focus:outline-none focus:ring-1 focus:ring-accent1 focus:border-accent1'
										placeholder='Card name...'
									/>
									<input
										type='text'
										value={cardNumber}
										onChange={(e) => setCardNumber(e.target.value)}
										className=' w-20 bg-filling border border-accent1 rounded text-center text-text font-mono text-sm py-1 px-2 focus:outline-none focus:ring-1 focus:ring-accent1 focus:border-accent1'
										placeholder='XXX 000'
										maxLength='7'
									/>
								</div>
							</div>
							{/* Grafika karty */}
							<div className='relative h-80 w-60'>
								{cardURL && (
									<img
										src={cardURL}
										alt={pokemonName}
										className='w-full h-full'
									/>
								)}
							</div>
						</div>

						{/* Dolna sekcja z animowanymi panelami */}
						<div className='p-4 pt-3 relative'>
							{/* Panel z ceną - animowany */}
							<div
								className={`transition-all duration-700 ${
									!isFlipped
										? 'opacity-100 max-h-96'
										: 'opacity-0 max-h-0 overflow-hidden'
								}`}
							>
								<div className='flex items-center justify-end mb-3'>
									<div className='text-right'>
										<p className='text-sm'>Current value in PLN</p>
										<p className='text-2xl font-bold'>
											{isFetchingPrice ? (
												<span className='inline-block animate-spin h-5 w-5 border-2 border-accent1 border-t-transparent rounded-full'></span>
											) : (
												cardPrice || '---'
											)}
										</p>
									</div>
								</div>
								{/* Przyciski akcji na dole karty */}
								<div className='flex flex-col justify-end gap-3 border-t border-filling pt-5 px-4'>
									<button
										onClick={onClose}
										className='border border-negative text-negative hover:bg-negative/10 py-2 px-4 rounded-lg shadow-sm text-sm font-medium w-full sm:w-auto transition cursor-pointer'
									>
										Close
									</button>
									<button
										onClick={() =>
											addCard(pokemonName, cardNumber, cardPrice, cardURL)
										}
										className='border border-accent1 text-accent1 hover:bg-primary/10 py-2 px-4 rounded-lg shadow-sm text-sm font-medium w-full sm:w-auto transition cursor-pointer'
									>
										Add Card
									</button>
									<button
										onClick={fetchCardPrice}
										className='bg-accept text-white hover:bg-accept/90 py-2 px-5 rounded-lg shadow-md text-sm font-semibold w-full sm:w-auto transition cursor-pointer'
									>
										Confirm
									</button>
								</div>
							</div>

							{/* Panel z filtrami - animowany */}
							<div
								className={`transition-all duration-700 ${
									isFlipped
										? 'opacity-100 max-h-96'
										: 'opacity-0 max-h-0 overflow-hidden'
								}`}
							>
								<div className='space-y-1 mb-4'>
									<div className='flex items-center gap-4'>
										<input
											type='radio'
											id='from'
											name='filter'
											value='from'
											checked={filterOption === 'from'}
											onChange={handleFilterChange}
										/>
										<label htmlFor='from'>Price "From"</label>
									</div>
									<div className='flex items-center gap-4'>
										<input
											type='radio'
											id='trend'
											name='filter'
											value='price trend'
											checked={filterOption === 'price trend'}
											onChange={handleFilterChange}
										/>
										<label htmlFor='trend'>Price Trend</label>
									</div>
									<div>
										<select
											name='language'
											id='language'
											value={filterLanguage}
											onChange={handleLanguageChange}
											className='text-main bg-accent1 p-1 cursor-pointer'
										>
											<option value='1'>English</option>
											<option value='2'>French</option>
											<option value='3'>German</option>
											<option value='4'>Spanish</option>
											<option value='5'>Italian</option>
											<option value='8'>Portuguese</option>
										</select>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Przycisk "Filtry" - pozycjonowany względem kontenera-rodzica */}
					<button
						onClick={() => setIsFlipped((prevState) => !prevState)}
						className='absolute -bottom-4 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-60 bg-accent1 border-2 border-filling text-main py-1 rounded-md font-medium transition-colors duration-300 cursor-pointer'
					>
						{isFlipped ? 'Show Price' : 'Filters'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default CameraPanel;
