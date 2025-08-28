const UserChatsSkeleton = () => {
	return (
		<div className='relative w-full rounded-2xl animate-pulse'>
			<div className='relative flex items-center gap-3 w-full bg-main rounded-2xl p-3 border-filling border'>
				<div className='relative w-[50px] h-[50px] rounded-full bg-gray-600' />

				<div className='flex-1'>
					<div className='flex items-center justify-between mb-1'>
						<div className='h-4 bg-gray-600 rounded w-1/3' />

						<div className='h-3 bg-gray-600 rounded w-1/6' />
					</div>

					<div className='h-3 bg-gray-600 rounded w-2/3' />
				</div>
			</div>
		</div>
	);
};
export default UserChatsSkeleton;
