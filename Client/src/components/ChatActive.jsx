import Avatar from '../img/empty-avatar.webp';
import ChatMessage from '../components/ChatMessage';
import { useEffect, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import TypingIndicator from './TypingIndicator';
import { toast } from 'react-toastify';
const ChatActive = ({
	closeActiveConversation,
	name,
	isOnline,
	socket,
	room,
	sender,
	userLeft,
}) => {
	const [messages, setMessages] = useState([]);
	const [inputValue, setInputValue] = useState('');
	const loggedInUser = useAuth();
	const messagesEndRef = useRef(null);
	const scrollContainerRef = useRef(null);
	const isUserNearBottom = useRef(true);
	const [isTyping, setIsTyping] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [loadingImage, setLoadingImage] = useState(false);
	const fileInputRef = useRef(null);
	const uploadImage = async (image) => {
		const formData = new FormData();
		formData.append('file', image);
		formData.append('upload_preset', 'ml_default');

		const res = await fetch(
			`https://api.cloudinary.com/v1_1/${
				import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
			}/image/upload`,
			{
				method: 'POST',
				body: formData,
			}
		);
		const data = await res.json();
		return data.secure_url;
	};
	const sendMessage = async () => {
		const hasText = inputValue.trim() !== '';
		const hasImage = selectedImage !== null;
		if (!hasText && !hasImage) {
			return;
		}
		let imageUrl = null;
		if (hasImage) {
			setIsUploading(true);
			try {
				imageUrl = await uploadImage(selectedImage);
			} catch (error) {
				console.error('Błąd wysyłania obrazka:', error);
				return;
			} finally {
				setIsUploading(false);
			}
		}
		if (hasText) {
			socket.emit('send_message', {
				message: { type: 'text', content: inputValue },
				room,
				sender,
			});
		}
		if (imageUrl) {
			socket.emit('send_message', {
				message: { type: 'image', content: imageUrl },
				room,
				sender,
			});
		}
		setInputValue('');
		setSelectedImage(null);
	};
	useEffect(() => {
		if (inputValue) {
			socket.emit('user_typing', { room });
		} else {
			socket.emit('user_stopped_typing', { room });
		}
	}, [inputValue, room]);
	useEffect(() => {
		const handleIsTyping = (data) => {
			setIsTyping(data.isTyping);
		};
		socket.on('receive_user_typing', handleIsTyping);

		return () => {
			socket.off('receive_user_typing', handleIsTyping);
		};
	}, []);
	const fetchMessages = async (room) => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/conversation/fetch-messages`,
				{ params: { room }, headers: { Authorization: `Bearer ${token}` } }
			);
			setMessages(response.data.messagesArray);
		} catch (error) {
			console.error('Error fetching messages:', error);
		}
	};

	useEffect(() => {
		fetchMessages(room);
	}, []);

	useEffect(() => {
		if (!socket || !room) return;
		socket.emit('join_room', room);
		const hanldeRecieveMessage = (message) => {
			setMessages((prev) => [...prev, message]);
		};
		socket.on('receive_message', hanldeRecieveMessage);
		return () => {
			socket.off('receive_message', hanldeRecieveMessage);
			socket.emit('leave_room', room);
		};
	}, [socket, room]);

	const handleScroll = () => {
		const container = scrollContainerRef.current;
		if (!container) return;
		const threshold = 100;
		const position =
			container.scrollHeight - container.scrollTop - container.clientHeight;
		isUserNearBottom.current = position < threshold;
	};

	useEffect(() => {
		if (isUserNearBottom.current) {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	return (
		<main className='lg:relative lg:left-1/2 lg:-translate-x-1/2 lg:max-w-[700px] max-h-screen  flex flex-col '>
			<div className='flex items-center border-b border-filling w-full px-2 py-2 gap-3 flex-shrink-0'>
				<button onClick={closeActiveConversation} className='cursor-pointer'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						className='fill-accent1 w-[30px] h-[30px] '
					>
						<path d='M16 5v2h-2V5h2zm-4 4V7h2v2h-2zm-2 2V9h2v2h-2zm0 2H8v-2h2v2zm2 2v-2h-2v2h2zm0 0h2v2h-2v-2zm4 4v-2h-2v2h2z' />
					</svg>
				</button>
				<img
					src={Avatar}
					alt='User avatar'
					className='w-[50px] h-[50px] rounded-full'
				/>
				<div>
					<p className='text-xl'>{name}</p>
					<p className={`${isOnline ? 'text-accept' : 'text-filling'} text-sm`}>
						{isOnline ? 'Online' : 'Offline'}
					</p>
				</div>
			</div>
			<div className='relative h-[75vh] flex flex-col'>
				<div
					className='h-full pb-4 overflow-y-auto pokeball-scrollbar'
					ref={scrollContainerRef}
					onScroll={handleScroll}
				>
					{messages.map((message) => {
						const isSender = message.sender === loggedInUser.id;
						return (
							<ChatMessage
								key={message._id || message.timeStamp}
								message={message}
								avatar={Avatar}
								isSenders={isSender}
							/>
						);
					})}
					<AnimatePresence>
						{isTyping && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								transition={{ duration: 0.3 }}
							>
								<TypingIndicator />
							</motion.div>
						)}
					</AnimatePresence>
					<div ref={messagesEndRef} />
				</div>
				{userLeft && (
					<p className='text-center mb-2 text-sm text-filling'>
						{name} left the chat
					</p>
				)}
				{loadingImage && (
					<div className='relative border rounded-2xl ml-auto w-[150px] h-[150px] overflow-clip'>
						<div className='absolute flex items-center justify-center bg-main-transparent w-full h-full'>
							<div className='w-[50px] h-[50px] border-6 border-accent1 border-t-filling rounded-full animate-spin'></div>
						</div>
					</div>
				)}
				{selectedImage && (
					<div className='relative border rounded-2xl ml-auto w-1/2 max-w-[150px] max-h-[150px] overflow-clip'>
						{isUploading && (
							<div className='absolute flex items-center justify-center bg-main-transparent w-full h-full'>
								<div className='w-[50px] h-[50px] border-6 border-accent1 border-t-filling rounded-full animate-spin'></div>
							</div>
						)}
						<button
							onClick={() => {
								setSelectedImage(null);
								if (fileInputRef.current) {
									fileInputRef.current.value = null;
								}
							}}
							className='absolute right-0 border rounded-full border-accent1 bg-main cursor-pointer'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 24 24'
								className='w-[25px] fill-accent1'
							>
								<path d='M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z' />
							</svg>
						</button>
						<img
							src={URL.createObjectURL(selectedImage)}
							className='w-full h-full object-contain'
						/>
					</div>
				)}
				<div className='flex items-center bg-second rounded-xl p-2 shadow-lg border border-filling'>
					<input
						value={inputValue}
						onChange={(event) => setInputValue(event.target.value)}
						onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
						type='text'
						placeholder='Type a message...'
						className={`w-full bg-transparent p-2 text-text placeholder-gray-400 focus:outline-none chat text-3xl ${
							userLeft ? 'pointer-events-none' : ''
						}`}
					/>
					<input
						type='file'
						id='sendImage'
						className='hidden'
						accept='image/*'
						ref={fileInputRef}
						onChange={async (event) => {
							setLoadingImage(true);
							const image = event.target.files[0];
							if (!image) return;
							if (image.type === 'image/heic' || image.name.endsWith('.heic')) {
								try {
									const convertedBlob = await window.heic2any({
										blob: image,
										toType: 'image/jpeg',
									});
									const convertedImage = new File(
										[convertedBlob],
										image.name.replace(/\.heic$/i, '.jpg'),
										{
											type: 'image/jpeg',
										}
									);
									setLoadingImage(false);
									setSelectedImage(convertedImage);
								} catch (err) {
									console.error('Error converting HEIC:', err);
									toast.error('Nie udało się przekonwertować zdjęcia.', {
										className: 'custom-error-toast',
									});
									return;
								}
							} else if (!image.type.startsWith('image/')) {
								toast.error('Please select a valid image file.', {
									className: 'custom-error-toast',
								});
								return;
							} else {
								setLoadingImage(false);
								setSelectedImage(image);
							}
						}}
					/>
					<label
						htmlFor='sendImage'
						className='shrink-0 bg-accent1 text-second rounded-lg p-2 ml-2 cursor-pointer'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 24 24'
							className='fill-current w-6 h-6'
						>
							<path d='M4 3h10v2H4v14h16v-8h2v10H2V3h2zm10 6h-2v2h-2v2H8v2H6v2h2v-2h2v-2h2v-2h2v2h2v2h2v-2h-2v-2h-2V9zM8 7H6v2h2V7zm10-4h2v2h2v2h-2v2h-2V7h-2V5h2V3z' />
						</svg>
					</label>
					<button
						onClick={sendMessage}
						className={`shrink-0 bg-accent1 text-second rounded-lg p-2 ml-2 cursor-pointer ${
							userLeft ? 'pointer-events-none' : ''
						}`}
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 24 24'
							className='fill-current w-6 h-6 transform rotate-90'
						>
							<path d='M12 19h-2v-2H8v-2H6v-2H4v-2h2V9h2V7h2V5h2v4h8v6h-8v4z' />
						</svg>
					</button>
				</div>
			</div>
		</main>
	);
};

export default ChatActive;
