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

	useEffect(() => {
		fetchAllConversations();
		const newSocket = io(import.meta.env.VITE_BACKEND_URL);
		setSocket(newSocket);
		newSocket.on('connect', () => {
			console.log('User connected to IO:', newSocket.id);
		});
		return () => {
			newSocket.disconnect();
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
	if (activeConversation) {
		otherUserName =
			activeConversation.participants[0]._id === loggedInUser.id
				? activeConversation.participants[1].userName
				: activeConversation.participants[0].userName;
	}
	return (
		<>
			<div className='min-h-screen bg-main text-text pb-[65px]'>
				<Header logo={logo} handleLogOut={handleLogOut} />
				{!activeConversationId && (
					<main className='max-w-[700px] mx-auto'>
						<h2 className='border-b border-filling w-full px-4 py-4'>
							<p>Chats</p>
						</h2>
						<div className=' px-4 mt-4 space-y-5'>
							{conversations.map((conversation) => {
								const conversationUserName =
									conversation.participants[0]._id === loggedInUser.id
										? conversation.participants[1].userName
										: conversation.participants[0].userName;
								return (
									<UserChats
										key={conversation._id}
										name={conversationUserName}
										lastMessage={'Hey, is that moltres still available?'}
										lastMessageTime={'10:42'}
										notSeenMessages={'2'}
										fetchActiveConversationId={() =>
											setActiveConversationId(conversation._id)
										}
									/>
								);
							})}
						</div>
					</main>
				)}
				{activeConversationId && (
					<ChatActive
						closeActiveConversation={() => setActiveConversationId(null)}
						name={otherUserName}
						isOnline={true}
						socket={socket}
						room={activeConversationId}
						sender={loggedInUser.id}
					/>
				)}
			</div>
			<Nav handleAddCard={handleAddCard} />
		</>
	);
};
export default Chat;
