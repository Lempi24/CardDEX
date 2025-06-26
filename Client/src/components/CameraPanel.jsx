import Webcam from 'react-webcam';
import React, { useEffect, useRef, useState } from 'react';
import Fuse from 'fuse.js';
const PokemonScanner = ({ onClose }) => {
	const webcamRef = useRef(null);
	const scannerBoxRef = useRef(null);
	const canvasRef = useRef(null);
	const [pokemonName, setPokemonName] = useState('');
	const [scanStatus, setScanStatus] = useState('');
	const [apiPokemonNames, setApiPokemonNames] = useState(null);
	const [isPokemonFound, setIsPokemonFound] = useState(false);
	const [cardNumber, setCardNumber] = useState('');
	const [cardPrice, setCardPrice] = useState(null);
	const [cardURL, setCardURL] = useState('');
	const [isFetchingPrice, setIsFetchingPrice] = useState(false);
	const [isFlipped, setIsFlipped] = useState(false);
	const [filterOption, setFilterOption] = useState('price trend');
	const [filterLanguage, setFilterLanguage] = useState('1');
	const googleVisionApiKey = import.meta.env.VITE_GOOGLEVISION_API_KEY;

	useEffect(() => {
		const getNames = async () => {
			const res = await fetch(
				'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0'
			);
			const data = await res.json();
			const names = data.results.map((p) => p.name);
			setApiPokemonNames(names);
		};
		getNames();
	}, []);

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
			}
		} catch (err) {
			console.error(err);
			setCardPrice('Not found');
		}
		setIsFetchingPrice(false);
	};

	const extractPokemonName = (text) => {
		if (!text || !apiPokemonNames) {
			setScanStatus('Not found');
			return false;
		}
		const lines = text.split('\n').slice(0, 2);

		const fuse = new Fuse(lines, {
			threshold: 0.1,
			ignoreLocation: true,
		});

		for (let i = 0; i < apiPokemonNames.length; i++) {
			const result = fuse.search(apiPokemonNames[i]);
			if (result.length > 0) {
				console.log(result);
				setPokemonName(apiPokemonNames[i]);
				setIsPokemonFound(true);
				setScanStatus('');
				return true;
			}
		}

		setScanStatus('Not found');
		return false;
	};

	const sendToGoogleVision = async (imageBase64) => {
		try {
			setScanStatus('Searching...');
			const base64WithoutPrefix = imageBase64.replace(
				/^data:image\/jpeg;base64,/,
				''
			);
			const requestData = {
				requests: [
					{
						image: { content: base64WithoutPrefix },
						features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
					},
				],
			};
			const response = await fetch(
				`https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(requestData),
				}
			);
			const data = await response.json();
			const detectedText =
				data?.responses?.[0]?.textAnnotations?.[0]?.description;
			if (detectedText) {
				extractPokemonName(detectedText);
			} else {
				setScanStatus('Not found');
			}
		} catch (err) {
			console.error('Błąd OCR:', err);
			setScanStatus('OCR Error');
		}
	};

	const capture = async () => {
		const screenshot = webcamRef.current.getScreenshot();
		if (!screenshot) return;

		const img = new Image();
		img.src = screenshot;

		img.onload = async () => {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');

			const box = scannerBoxRef.current.getBoundingClientRect();

			const video = webcamRef.current.video;
			const videoBox = video.getBoundingClientRect();

			const scaleX = img.width / videoBox.width;
			const scaleY = img.height / videoBox.height;

			const sx = (box.left - videoBox.left) * scaleX;
			const sy = (box.top - videoBox.top) * scaleY;
			const sw = box.width * scaleX;
			const sh = box.height * scaleY;

			canvas.width = sw;
			canvas.height = sh;

			ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

			const croppedBase64 = canvas.toDataURL('image/jpeg');
			await sendToGoogleVision(croppedBase64);
		};
	};
	const cancelScanResults = () => {
		setIsPokemonFound(false);
		setPokemonName('');
		setScanStatus('');
		setCardNumber('');
		setCardPrice(null);
		setCardURL('');
	};
	const handleFilterChange = (e) => {
		setFilterOption(e.target.value);
	};
	const handleLanguageChange = (e) => {
		setFilterLanguage(e.target.value);
	};
	return (
		<div className='fixed inset-0 z-50 bg-black'>
			<Webcam
				audio={false}
				ref={webcamRef}
				screenshotFormat='image/jpeg'
				className='w-full h-full object-cover'
				videoConstraints={{
					facingMode: 'environment',
					width: { ideal: 1920 },
					height: { ideal: 1080 },
				}}
			/>

			<div
				ref={scannerBoxRef}
				className='scan-border fixed w-7/10 h-1/2 border-4 border-accent1 opacity-30 rounded-xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
			/>
			{isPokemonFound && (
				<div className='fixed inset-0 z-50 flex items-center justify-center'>
					{/* Główny kontener slab-a */}
					<div className='bg-main w-80 rounded-lg shadow-2xl border-2 border-filling overflow-hidden'>
						{/* Górny panel - sekcja karty */}
						<div className='p-4 pb-2 border-b-4 border-filling'>
							<div className='flex justify-between items-center mb-2'>
								<h2 className='text-xl font-bold uppercase tracking-tight'>
									{pokemonName}
								</h2>
								<div className='relative'>
									<input
										type='text'
										value={cardNumber}
										onChange={(e) => setCardNumber(e.target.value)}
										className='w-20 bg-gray-200/80 border border-accent1 rounded text-center text-filling font-mono text-sm py-1 px-2 focus:outline-none focus:ring-1 focus:ring-accent1 focus:border-accent1'
										placeholder='XXX 000'
										maxLength='7'
									/>
								</div>
							</div>

							<div className='h-80'>
								{cardURL && (
									<img
										src={cardURL}
										alt={pokemonName}
										className='w-full h-full object-contain'
									/>
								)}
							</div>
						</div>

						<div className='p-4 pt-3 relative overflow-hidden'>
							{/* Panel z ceną - animowany */}
							<div
								className={`transition-all duration-700 ${
									!isFlipped
										? 'opacity-100 max-h-96'
										: 'opacity-0 max-h-0 overflow-hidden'
								}`}
							>
								<div className='flex items-center justify-between mb-3'>
									<span className='text-xs font-semibold uppercase'>
										Price trend
									</span>
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
							</div>
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
											className='text-main bg-accent1 p-1'
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

							<div className='flex space-x-3 justify-center border-t border-filling pt-3'>
								<button
									className='bg-negative py-1.5 px-6 rounded-md shadow-sm text-sm font-medium transition-colors hover:bg-negative/90'
									onClick={cancelScanResults}
								>
									Rescan
								</button>
								<button
									onClick={fetchCardPrice}
									className='bg-accept py-1.5 px-6 rounded-md shadow-sm text-sm font-medium transition-colors hover:bg-accept/90'
								>
									Confirm
								</button>
							</div>
						</div>

						<button
							onClick={() => setIsFlipped((prevState) => !prevState)}
							className='absolute left-1/2 transform -translate-x-1/2 w-60 bg-accent1 border-2 border-filling text-main py-1 rounded-md font-medium transition-colors duration-300 '
						>
							{isFlipped ? 'Show Price' : 'Filters'}
						</button>
					</div>
				</div>
			)}

			<canvas ref={canvasRef} style={{ display: 'none' }} />
			<div className='flex absolute top-4 right-0 items-center justify-center w-full h-40'>
				<p className='absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm'>
					{scanStatus}
				</p>

				<button
					onClick={onClose}
					className='absolute top-0 right-0 p-4 text-accent1 bg-main-transparent ml-auto z-1000'
				>
					X
				</button>
			</div>

			{!isPokemonFound && (
				<button
					onClick={capture}
					className='absolute bottom-10 left-1/2 transform -translate-x-1/2 rounded-full w-16 h-16 bg-main border-accent1 border-2 z-10'
				></button>
			)}
		</div>
	);
};

export default PokemonScanner;
