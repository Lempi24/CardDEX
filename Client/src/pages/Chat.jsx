import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { useAppContext } from '../contexts/UIContext';
import { io } from 'socket.io-client';
import UserChats from '../components/UserChats';
import ChatActive from '../components/ChatActive';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
const Chat = ({ handleLogOut }) => {
	const loggedInUser = useAuth();
	const navigate = useNavigate();
	const { handleAddCard, logo } = useAppContext();
	const [conversations, setConversations] = useState([]);
	const [activeConversationId, setActiveConversationId] = useState(null);
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState(new Set());
	const [isConfirmDeleteShown, setIsConfirmDeleteShown] = useState(false);
	const fetchAllConversations = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/');
		}
		try {
			const response = await axios.get(
				`${
					import.meta.env.VITE_BACKEND_URL
				}/api/conversation/fetch-conversations`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setConversations(response.data.fetchedConversations);
		} catch (error) {
			console.error('Error fetching conversations:', error);
		}
	};
	const closeActiveConversation = () => {
		setActiveConversationId(null);
		fetchAllConversations();
	};
	useEffect(() => {
		fetchAllConversations();
		const newSocket = io(import.meta.env.VITE_BACKEND_URL);
		setSocket(newSocket);
		newSocket.on('connect', () => {
			console.log('User connected to IO:', newSocket.id);
		});
		newSocket.on('online_users_list', (userArray) => {
			setOnlineUsers(new Set(userArray));
		});
		newSocket.on('user_online', (userId) => {
			setOnlineUsers((prev) => new Set(prev).add(userId));
		});
		newSocket.on('user_offline', (userId) => {
			setOnlineUsers((prev) => {
				const newUsers = new Set(prev);
				newUsers.delete(userId);
				return newUsers;
			});
		});
		return () => {
			newSocket.disconnect();
			newSocket.off('online_users_list');
			newSocket.off('user_online');
			newSocket.off('user_offline');
		};
	}, []);
	useEffect(() => {
		if (socket && loggedInUser) {
			socket.emit('authenticate', loggedInUser.id);
		}
	}, [socket, loggedInUser]);
	const activeConversation = conversations.find(
		(conversation) => conversation._id === activeConversationId
	);
	let otherUserName = '';
	let isOtherUserOnline = false;
	if (activeConversation) {
		const otherUser = activeConversation.participants.find(
			(p) => p._id !== loggedInUser.id
		);

		otherUserName = otherUser.userName;
		isOtherUserOnline = onlineUsers.has(otherUser._id);
	}

	return (
		<>
			<div className='relative min-h-screen bg-main text-text pb-[65px]'>
				<Header logo={logo} handleLogOut={handleLogOut} />
				{!activeConversationId && !isConfirmDeleteShown && (
					<main className='max-w-[700px] mx-auto'>
						<h2 className='border-b border-filling w-full px-4 py-4'>
							<p>Chats</p>
						</h2>
						<div className=' px-4 mt-4 space-y-5'>
							{conversations.map((conversation) => {
								const otherParticipant = conversation.participants.find(
									(p) => p._id !== loggedInUser.id
								);
								const isUserOnline = otherParticipant
									? onlineUsers.has(otherParticipant._id)
									: false;
								const conversationUserName =
									conversation.participants[0]._id === loggedInUser.id
										? conversation.participants[1].userName
										: conversation.participants[0].userName;
								const lastMsgTime = conversation.messages.at(-1)?.createdAt
									? new Date(
											conversation.messages.at(-1).createdAt
									  ).toLocaleTimeString([], {
											hour: '2-digit',
											minute: '2-digit',
									  })
									: '';
								return (
									<UserChats
										key={conversation._id}
										name={conversationUserName}
										lastMessage={
											conversation.messages[conversation.messages.length - 1]
												?.content || 'No messages yet'
										}
										lastMessageTime={lastMsgTime}
										notSeenMessages={'2'}
										fetchActiveConversationId={() =>
											setActiveConversationId(conversation._id)
										}
										isOnline={isUserOnline}
										setIsConfirmDeleteShown={setIsConfirmDeleteShown}
									/>
								);
							})}
						</div>
					</main>
				)}
				{activeConversationId && (
					<ChatActive
						closeActiveConversation={() => closeActiveConversation()}
						name={otherUserName}
						isOnline={isOtherUserOnline}
						socket={socket}
						room={activeConversationId}
						sender={loggedInUser.id}
					/>
				)}
				<div
					className={`absolute ${
						isConfirmDeleteShown ? 'top-1/5' : '-top-20'
					}  left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-xl  z-100 transition-all duration-300 bg-filling`}
				>
					<div className='flex flex-col items-center justify-center gap-4 p-4'>
						<p>Stop trainer!</p>
						<p>
							This Chat will be <span className='text-negative'>deleted!</span>
						</p>
						<div className='space-x-4'>
							<button
								className='underline cursor-pointer'
								onClick={() => setIsConfirmDeleteShown(false)}
							>
								Cancel
							</button>
							<button className=' cursor-pointer bg-negative p-2 rounded-xl'>
								Delete
							</button>
						</div>
					</div>
				</div>
			</div>
			<Nav handleAddCard={handleAddCard} />
		</>
	);
};
export default Chat;
