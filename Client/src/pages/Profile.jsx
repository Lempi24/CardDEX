import Nav from '../components/Nav';
import Header from '../components/Header';
import Avatar from '../img/empty-avatar.webp';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { uploadImage } from '../utils/uploadImage';
import { toast } from 'react-toastify';
const Profile = ({ logo, handleLogOut, handleAddCard }) => {
	const [newAvatar, setNewAvatar] = useState(null);
	const [previewAvatar, setPreviewAvatar] = useState(null);
	const [userData, setUserData] = useState({});
	const navigate = useNavigate();
	const getUserData = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/');
		}
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/users/fetch-user-data`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setUserData(response.data.userData);
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	};
	const createPreview = (file) => {
		if (file) {
			setPreviewAvatar(URL.createObjectURL(file));
		} else {
			setPreviewAvatar(null);
		}
	};
	const handleImageUpload = async (image) => {
		if (!image) {
			createPreview(null);
			return;
		}
		if (image.type === 'image/heic' || image.name.endsWith('.heic')) {
			try {
				const convertedBlob = await window.heic2any({
					blob: image,
					toType: 'image/jpeg',
				});
				const convertedImage = new File(
					[convertedBlob],
					image.name.replace(/\.heic$/i, '.jpg'),
					{ type: 'image/jpeg' }
				);
				setNewAvatar(convertedImage);
				createPreview(convertedImage);
			} catch (err) {
				console.error('Error converting HEIC:', err);
				toast.error('Nie udało się przekonwertować zdjęcia.', {
					className: 'custom-error-toast',
				});
				createPreview(null);
				return;
			}
		} else if (!image.type.startsWith('image/')) {
			toast.error('Please select a valid image file.', {
				className: 'custom-error-toast',
			});
			createPreview(null);
			return;
		} else {
			setNewAvatar(image);
			createPreview(image);
		}
	};
	const changeUserAvatar = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/');
		}
		toast.info('Your avatar is being changed...');
		const url = await uploadImage(newAvatar);
		if (!url) {
			toast.error('An Error occured, try again', {
				className: 'custom-error-toast',
			});
			return;
		}
		try {
			await axios.put(
				`${import.meta.env.VITE_BACKEND_URL}/api/users/update-avatar`,
				{ url },
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			toast.success('Avatar changed succesfully!', {
				className: 'custom-success-toast',
			});
			setUserData((prev) => ({ ...prev, avatar: url }));
			setPreviewAvatar(null);
		} catch (error) {
			console.error('Error updating avatar:', error);
		}
	};
	useEffect(() => {
		getUserData();
	}, []);
	return (
		<>
			<div className='min-h-screen bg-main text-text pb-[65px]'>
				<Header logo={logo} handleLogOut={handleLogOut} />
				<main className='max-w-[700px] mx-auto flex flex-col items-center gap-6'>
					<h2 className='border-b border-filling w-full px-4 py-4'>
						<p>Profile</p>
					</h2>
					<div className=' bg-filling flex flex-col items-center gap-4 p-4 rounded-2xl w-9/10'>
						<div className='relative w-[100px] h-[100px] rounded-full border-4 border-accent1'>
							<div className='w-full h-full rounded-full overflow-hidden'>
								<img
									src={previewAvatar || userData.avatar || Avatar}
									alt='User avatar'
									className='w-full h-full object-contain'
								/>
							</div>
							<input
								type='file'
								name=''
								id='avatar'
								className='hidden'
								accept='image/*'
								onChange={(event) => {
									const image = event.target.files[0];
									handleImageUpload(image);
								}}
							/>
							<label
								htmlFor='avatar'
								className='absolute right-0 bottom-0 cursor-pointer bg-second rounded-2xl p-1'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									className='fill-accent1 w-[25px] h-[25px]'
								>
									<path d='M18 2h-2v2h2V2zM4 4h6v2H4v14h14v-6h2v8H2V4h2zm4 8H6v6h6v-2h2v-2h-2v2H8v-4zm4-2h-2v2H8v-2h2V8h2V6h2v2h-2v2zm2-6h2v2h-2V4zm4 0h2v2h2v2h-2v2h-2v2h-2v-2h2V8h2V6h-2V4zm-4 8h2v2h-2v-2z' />
								</svg>
							</label>
						</div>
						{previewAvatar && (
							<button
								onClick={() => changeUserAvatar()}
								className=' bg-accent1 rounded-2xl p-2 cursor-pointer text-second'
							>
								Change
							</button>
						)}
						<div className='flex flex-col items-center gap-2'>
							<h2 className='font-bold text-lg'>{userData.userName}</h2>
							<p className='text-[0.7rem]'>
								Joined:
								{new Date(userData.createdAt).toLocaleDateString('en-EN', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</p>
						</div>
					</div>
				</main>
			</div>
			<Nav handleAddCard={handleAddCard} />
		</>
	);
};
export default Profile;
