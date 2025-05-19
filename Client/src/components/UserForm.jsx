import FormInput from './FormInput';
import { useNavigate } from 'react-router-dom';
const UserForm = ({
	isLoging,
	pText,
	spanInfo,
	btnText,
	destination,
	btnDestination,
}) => {
	const navigate = useNavigate();
	return (
		<form action='' className='space-y-6 w-3/4 '>
			<div className='flex flex-col gap-4'>
				<FormInput label={'Trainer name'} type={'text'} />
			</div>
			<div className='flex flex-col gap-4'>
				<FormInput label={'Password'} type={'password'} />
			</div>
			{isLoging || (
				<div className='flex flex-col gap-4'>
					<FormInput label={'Confirm password'} type={'password'} />
				</div>
			)}
			<p className='text-[10px]'>
				{pText}{' '}
				<span className='text-accent1'>
					<a
						href='#'
						onClick={(e) => {
							e.preventDefault();
							navigate(destination);
						}}
					>
						{spanInfo}
					</a>
				</span>
			</p>
			<button
				type='submit'
				onClick={(e) => {
					e.preventDefault();
					navigate(btnDestination);
				}}
				className='text-sm bg-accent1 p-3 border-2 text-main whitespace-nowrap'
			>
				{btnText}
			</button>
		</form>
	);
};
export default UserForm;
