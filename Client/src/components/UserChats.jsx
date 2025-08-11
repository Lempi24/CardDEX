import Avatar from '../img/empty-avatar.webp';

const UserChats = ({
	name,
	lastMessage,
	lastMessageTime,
	notSeenMessages,
	fetchActiveConversationId,
}) => {
	return (
		<button
			onClick={fetchActiveConversationId}
			className='flex items-center gap-3 w-full text-left p-0 bg-transparent'
		>
			<div className='relative w-[50px] h-[50px] shrink-0'>
				<img
					src={Avatar}
					alt='User avatar'
					className='w-[50px] h-[50px] rounded-full'
				/>
				<div className='absolute bottom-0 right-0 w-[15px] h-[15px] bg-accept rounded-full border border-main'></div>
			</div>
			<div className='w-8/10 overflow-hidden'>
				<div className='flex items-center justify-between'>
					<p className='text-lg truncate'>{name}</p>
					<p className='text-sm text-filling shrink-0 ml-2'>
						{lastMessageTime}
					</p>
				</div>
				<div className='flex items-center justify-between'>
					<p className='truncate text-sm text-gray-400'>{lastMessage}</p>
					<div className='flex items-center justify-center w-[20px] h-[20px] bg-accent2 rounded-full shrink-0 ml-2'>
						<p className='text-[0.7rem]'>{notSeenMessages}</p>
					</div>
				</div>
			</div>
		</button>
	);
};
export default UserChats;
