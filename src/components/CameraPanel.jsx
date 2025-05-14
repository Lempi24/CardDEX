import Webcam from 'react-webcam';
import React, { useEffect, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import pikachu from '../img/cards/pikachu.png';
const PokemonScanner = ({ onClose }) => {
	const webcamRef = useRef(null);
	const scannerBoxRef = useRef(null);
	const canvasRef = useRef(null);
	const [pokemonName, setPokemonName] = useState('pikachu');
	const [scanStatus, setScanStatus] = useState('');
	const [apiPokemonNames, setApiPokemonNames] = useState(null);
	const [isPokemonFound, setIsPokemonFound] = useState(false);
	const [cardNumber, setCardNumber] = useState('');
	const [cardPrice, setCardPrice] = useState(null);
	const [isFetchingPrice, setIsFetchingPrice] = useState(false);
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
		setIsFetchingPrice(true);
		try {
			const res = await fetch('/api/price', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: pokemonName, number: cardNumber }),
			});
			const data = await res.json();
			if (data.price) {
				setCardPrice(data.price);
			} else {
				setCardPrice('Nie znaleziono');
			}
		} catch (err) {
			console.error(err);
			setCardPrice('Błąd pobierania');
		}
		setIsFetchingPrice(false);
	};

	const extractPokemonName = (text) => {
		if (!text || !apiPokemonNames) {
			setScanStatus('Nie znaleziono');
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
				setPokemonName(apiPokemonNames[i]);
				setIsPokemonFound(true);
				setScanStatus('');
				return true;
			}
		}

		setScanStatus('Nie znaleziono');
		return false;
	};

	const sendToGoogleVision = async (imageBase64) => {
		try {
			setScanStatus("Przeszukiwanie pokedex'u");
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
				setScanStatus('Nie znaleziono');
			}
		} catch (err) {
			console.error('Błąd OCR:', err);
			setScanStatus('Błąd OCR');
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
				<div className='fixed w-72 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg p-6 z-50 flex flex-col items-center space-y-4'>
					<h2 className='text-lg font-semibold text-white tracking-wide uppercase'>
						{pokemonName}
					</h2>

					<input
						type='text'
						value={cardNumber}
						onChange={(e) => setCardNumber(e.target.value)}
						className='w-3/4 text-center bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-accent1'
						placeholder='Numer'
					/>

					<img
						src={pikachu}
						alt={pokemonName}
						className='w-3/4 rounded-lg shadow-md border border-white/20'
					/>

					<div className='text-center text-white space-y-1'>
						<p className='text-sm'>Current value in PLN:</p>
						<p className='text-2xl font-bold text-accent1 flex items-center justify-center'>
							{isFetchingPrice ? (
								<span className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></span>
							) : (
								cardPrice || '...'
							)}
						</p>
					</div>

					<div className='flex space-x-6 pt-4'>
						<button
							className='bg-negative text-white py-2 px-5 rounded-lg shadow hover:brightness-110'
							onClick={cancelScanResults}
						>
							Again
						</button>
						<button
							onClick={fetchCardPrice}
							className='bg-accept text-white py-2 px-5 rounded-lg shadow hover:brightness-110'
						>
							Accept
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
					className='absolute top-0 right-0 p-4 text-accent1 bg-main-transparent ml-auto'
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
