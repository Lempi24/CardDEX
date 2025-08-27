import Avatar from '../img/empty-avatar.webp';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const UserChats = ({
	name,
	lastMessage,
	lastMessageTime,
	fetchActiveConversationId,
	isOnline,
	setIsConfirmDeleteShown,
	relatedTrade,
}) => {
	const [isDeleteShown, setIsDeleteShown] = useState(false);
	const handleOnMouseEnter = () => {
		setIsDeleteShown(true);
	};
	const handleOnMouseLeave = () => {
		setIsDeleteShown(false);
	};

	return (
		<div className='relative w-full rounded-2xl '>
			<motion.div
				drag='x'
				dragConstraints={{ left: 0, right: 100 }}
				onDragEnd={(event, info) => {
					const swipeThreshold = 80;
					if (info.offset.x > swipeThreshold) {
						setIsConfirmDeleteShown({
							showDeletePanel: true,
							relatedTrade: relatedTrade,
						});
					}
				}}
			>
				<div
					onClick={fetchActiveConversationId}
					className='relative flex items-center gap-3 w-full bg-main  rounded-2xl p-2 border-filling border cursor-pointer z-100'
					onMouseEnter={handleOnMouseEnter}
					onMouseLeave={handleOnMouseLeave}
				>
					<div className='relative w-[50px] h-[50px] shrink-0'>
						<img
							src={Avatar}
							alt='User avatar'
							className='w-[50px] h-[50px] rounded-full'
						/>
						{isOnline && (
							<div className='absolute bottom-0 right-0 w-[15px] h-[15px] bg-accept rounded-full border border-main'></div>
						)}
					</div>
					<div className='relative w-8/10'>
						<div className=' flex items-center justify-between'>
							<p className='text-lg truncate'>{name}</p>
							<p
								className={`text-sm text-filling shrink-0 ml-2 ${
									isDeleteShown ? 'opacity-0' : 'opacity-100'
								}`}
							>
								{lastMessageTime}
							</p>
							<button
								onClick={(e) => {
									e.stopPropagation();
									setIsConfirmDeleteShown({
										showDeletePanel: true,
										relatedTrade: relatedTrade,
									});
								}}
								className={`absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity duration-300 ${
									isDeleteShown ? 'opacity-100' : 'opacity-0'
								}`}
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									className='fill-main w-[40px] bg-negative rounded-full p-2'
								>
									<path d='M16 2v4h6v2h-2v14H4V8H2V6h6V2h8zm-2 2h-4v2h4V4zm0 4H6v12h12V8h-4zm-5 2h2v8H9v-8zm6 0h-2v8h2v-8z' />
								</svg>
							</button>
						</div>
						<div className='flex items-center justify-between'>
							<p className='truncate text-gray-400 chat text-xl ml-1'>
								{lastMessage}
							</p>
							{/* Kropeczka z nie przeczytanymi wiadomościami. Potem ogarnę tę funkcjonalność */}
							{/* <div className='flex items-center justify-center w-[20px] h-[20px] bg-accent2 rounded-full shrink-0 ml-2'>
						<p className='text-[0.7rem]'>{notSeenMessages}</p>
					</div> */}
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};
export default UserChats;
