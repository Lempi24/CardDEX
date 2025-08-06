import Nav from '../components/Nav';
import Header from '../components/Header';
const Profile = ({ logo, handleLogOut, handleAddCard }) => {
	return (
		<>
			<div className='min-h-screen bg-main text-text pb-[65px]'>
				<Header logo={logo} handleLogOut={handleLogOut} />
				<main className='max-w-[700px] mx-auto px-4 py-6'>Profile</main>
			</div>
			<Nav handleAddCard={handleAddCard} />
		</>
	);
};
export default Profile;
