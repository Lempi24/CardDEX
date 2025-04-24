import Webcam from 'react-webcam';
import React, { useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
const CameraPanel = ({ onClose }) => {
	const webcamRef = useRef(null);
	const [test, setTest] = useState(null);
	const capture = () => {
		const imageSrc = webcamRef.current.getScreenshot();

		Tesseract.recognize(imageSrc, 'eng', {
			logger: (m) => console.log(m),
		}).then(({ data: { text } }) => {
			console.log('Rozpoznany tekst', text);
			setTest(text);
		});
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
				}}
			/>
			<button
				onClick={onClose}
				className='absolute top-4 right-4 p-4 text-accent1 bg-main-transparent z-10'
			>
				X {test}
			</button>
			<button
				onClick={capture}
				className='absolute bottom-10 left-1/2 transform -translate-x-1/2 rounded-full w-16 h-16 bg-main border-accent1 border-2 z-10'
			></button>
		</div>
	);
};

export default CameraPanel;
