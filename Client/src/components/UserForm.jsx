import FormInput from './FormInput';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
const UserForm = ({ isLoging, pText, spanInfo, btnText, destination }) => {
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm();

	const submitCall = async (data) => {
		if (isLoging) {
			try {
				const response = await axios.post(
					`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
					data
				);
				if (response.status == 200) {
					localStorage.setItem('token', response.data.token);
					navigate('/main-page');
				}
			} catch (error) {
				const msg = error.response?.data?.message || 'Login failed. Try again.';
				toast.error(msg, {
					className: 'custom-error-toast',
				});
			}
		} else {
			try {
				const response = await axios.post(
					`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
					data
				);
				if (response.status == 201) {
					navigate('/');
				}
			} catch (error) {
				const msg =
					error.response?.data?.message || 'Registration failed. Try again.';
				toast.error(msg, {
					className: 'custom-error-toast',
				});
			}
		}
	};
	return (
		<form
			action=''
			className='space-y-6 w-3/4 md:w-1/2 xl:w-1/3'
			onSubmit={handleSubmit(submitCall)}
		>
			<div className='flex flex-col gap-4'>
				<FormInput
					label={'Trainer name'}
					placeholder={'Trainer name'}
					type={'text'}
					error={errors.userName}
					{...register('userName', {
						required: 'UserName is required',
						minLength: isLoging
							? undefined
							: {
									value: 3,
									message: 'UserName must be at least 3 characters long',
							  },
					})}
				/>
				{errors.userName && (
					<p className='text-xs text-red-500 mt-1'>{errors.userName.message}</p>
				)}
			</div>
			<div className='flex flex-col gap-4'>
				<FormInput
					label={'Password'}
					placeholder={'Password'}
					type={'password'}
					{...register('password', {
						required: 'Password is required',
						minLength: isLoging
							? undefined
							: {
									value: 6,
									message: 'Password must be at least 6 characters long',
							  },
					})}
				/>
				{errors.password && (
					<p className='text-xs text-red-500 mt-1'>{errors.password.message}</p>
				)}
			</div>
			{isLoging || (
				<div className='flex flex-col gap-4'>
					<FormInput
						label={'Confirm password'}
						placeholder={'Confirm password'}
						type={'password'}
						{...register('confirmPassword', {
							required: 'Confirm your password',
							validate: (value) =>
								value === watch('password') || 'Passwords do not match',
						})}
					/>
					{errors.confirmPassword && (
						<p className='text-xs text-red-500 mt-1'>
							{errors.confirmPassword.message}
						</p>
					)}
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
				className='text-sm bg-accent1 p-3 border-2 text-main whitespace-nowrap cursor-pointer'
			>
				{btnText}
			</button>
		</form>
	);
};
export default UserForm;
