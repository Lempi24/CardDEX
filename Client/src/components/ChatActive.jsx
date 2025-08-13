import Avatar from '../img/empty-avatar.webp';
import ChatMessage from '../components/ChatMessage';
import { useEffect, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';
import axios from 'axios';

const ChatActive = ({
	closeActiveConversation,
	name,
	isOnline,
	socket,
	room,
	sender,
}) => {
	const [messages, setMessages] = useState([]);
	const [inputValue, setInputValue] = useState('');
	const loggedInUser = useAuth();
	const messagesEndRef = useRef(null);
	const scrollContainerRef = useRef(null);
	const isUserNearBottom = useRef(true);

	const sendMessage = () => {
		if (inputValue.trim() !== '') {
			socket.emit('send_message', { message: inputValue, room, sender });
			setInputValue('');
		}
	};

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
		<main className='lg:relative lg:left-1/2 lg:-translate-x-1/2 max-w-[700px] h-[680px] flex flex-col'>
			<div className='flex items-center border-b border-filling w-full px-2 py-2 gap-3 flex-shrink-0'>
				<button onClick={closeActiveConversation}>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						className='fill-accent1 w-[30px] h-[30px]'
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
			<div
				className='overflow-y-auto mb-4 flex-1'
				ref={scrollContainerRef}
				onScroll={handleScroll}
			>
				{messages.map((message) => {
					const isSender = message.sender === loggedInUser.id;
					return (
						<ChatMessage
							key={message._id || message.timeStamp}
							message={message.content}
							avatar={Avatar}
							isSenders={isSender}
						/>
					);
				})}
				<div ref={messagesEndRef} />
			</div>

			<div className='flex-shrink-0'>
				<div className='relative flex items-center bg-second rounded-xl p-2 shadow-lg border border-filling'>
					<input
						value={inputValue}
						onChange={(event) => setInputValue(event.target.value)}
						onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
						type='text'
						placeholder='Type a message...'
						className='w-full bg-transparent p-2 text-text placeholder-gray-400 focus:outline-none'
					/>
					<button
						onClick={sendMessage}
						className='shrink-0 bg-accent1 text-second rounded-lg p-2 ml-2 hover:bg-red-500 transition-colors duration-200'
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
