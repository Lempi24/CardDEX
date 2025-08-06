import Header from '../components/Header';
import Nav from '../components/Nav';
import { useAppContext } from '../contexts/UIContext';
import CameraPanel from '../components/CameraPanel';

const Chat = ({ handleLogOut }) => {
	const { handleAddCard, logo, isCameraVisiable } = useAppContext();
	return (
		<>
			<div className='min-h-screen bg-main text-text pb-[65px]'>
				<Header logo={logo} handleLogOut={handleLogOut} />
				<main className='max-w-[700px] mx-auto px-4 py-6'>Chat</main>
			</div>
			<Nav handleAddCard={handleAddCard} />
			{/* {isCameraVisiable && (
				<CameraPanel
					refreshCardsValue={fetchUserCardsValue}
					onClose={handleAddCard}
					onCardAdded={() => fetchUserCards(pagination.currentPage)}
				/>
			)} */}
		</>
	);
};
export default Chat;
