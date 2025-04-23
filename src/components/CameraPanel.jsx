import Webcam from 'react-webcam';
import React, { useRef } from 'react';
const CameraPanel = () => {
	const webcamRef = useRef(null);

	const capture = () => {
		const imageSrc = webcamRef.current.getScreenshot();
		console.log(imageSrc);
	};
	return (
		<div className='absolute'>
			<Webcam
				audio={false}
				ref={webcamRef}
				screenshotFormat='image/jpeg'
				width={320}
				height={240}
			/>
			<button onClick={capture}>Zrób foto</button>
		</div>
	);
};
export default CameraPanel;
