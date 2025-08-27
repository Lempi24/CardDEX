const ChatMessage = ({ avatar, isSenders, message }) => {
	return (
		<div className='flex items-center px-4 mt-4 space-y-5'>
			<div
				className={`${isSenders ? 'ml-auto' : ''} flex justify-center gap-2`}
			>
				{!isSenders && (
					<img
						src={avatar}
						alt='User avatar'
						className='w-[25px] h-[25px] rounded-full self-end'
					/>
				)}
				<div
					className={`${
						isSenders ? 'bg-second rounded-bl-xl' : 'bg-filling rounded-br-xl'
					} rounded-t-xl`}
				>
					{message.type === 'image' ? (
						<img
							src={message.content}
							alt='Wysłany obrazek'
							className='max-w-[150px]'
						/>
					) : (
						<p className='p-2 chat text-3xl'>{message.content}</p>
					)}
				</div>
			</div>
		</div>
	);
};
export default ChatMessage;
