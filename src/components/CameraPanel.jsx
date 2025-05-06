import Webcam from 'react-webcam';
import React, { useEffect, useRef, useState } from 'react';
import Fuse from 'fuse.js';
const PokemonScanner = ({ onClose }) => {
	const webcamRef = useRef(null);
	const scannerBoxRef = useRef(null);
	const canvasRef = useRef(null);
	const [pokemonName, setPokemonName] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [apiPokemonNames, setApiPokemonNames] = useState(null);
	const pokeApiKey = import.meta.env.VITE_POKE_API_KEY;

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

	const extractPokemonName = (text) => {
		if (!text) return '';
		const lines = text.split('\n').slice(0, 2);

		const fuse = new Fuse(lines, {
			threshold: 0.1,
			ignoreLocation: true,
		});

		for (let i = 0; i < apiPokemonNames.length; i++) {
			const result = fuse.search(apiPokemonNames[i]);
			if (result.length > 0) {
				console.log(`Znaleziono, czy to ${apiPokemonNames[i]}?`);
				setPokemonName(apiPokemonNames[i]);
			}
		}
	};

	const sendToGoogleVision = async (imageBase64) => {
		try {
			setIsLoading(true);
			setError('');
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
				`https://vision.googleapis.com/v1/images:annotate?key=${pokeApiKey}`,
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
				setPokemonName('Nie wykryto tekstu');
			}
		} catch (err) {
			console.error('Błąd OCR:', err);
			setError('Błąd rozpoznawania tekstu');
		} finally {
			setIsLoading(false);
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

			<canvas ref={canvasRef} style={{ display: 'none' }} />

			<button
				onClick={onClose}
				className='absolute top-4 right-4 p-4 text-accent1 bg-main-transparent z-10'
			>
				X {isLoading ? 'Rozpoznawanie...' : pokemonName}
			</button>

			<button
				onClick={capture}
				className='absolute bottom-10 left-1/2 transform -translate-x-1/2 rounded-full w-16 h-16 bg-main border-accent1 border-2 z-10'
			></button>
		</div>
	);
};

export default PokemonScanner;
