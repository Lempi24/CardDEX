import { useState } from 'react';

const FormInput = ({ label, type, ...rest }) => {
	const [isPasswordShown, setIsPasswordShown] = useState(false);
	const togglePasswordVisibility = () => {
		setIsPasswordShown((prevState) => !prevState);
	};
	return (
		<>
			<label htmlFor={rest.name} className=''>
				{label}
			</label>
			<div className='form-input relative'>
				<input
					type={isPasswordShown ? 'input' : type}
					placeholder={label + '...'}
					{...rest}
					className=' bg-filling p-2 placeholder:text-sm w-full 
             border-2 border-black ring-1 ring-black focus:ring-2 focus:ring-accent1 outline-none'
				/>
				{type === 'password' && (
					<button
						type='button'
						onClick={togglePasswordVisibility}
						className='absolute right-2 top-1/2 -translate-y-1/2 w-[25px]'
					>
						{isPasswordShown ? (
							<svg
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 24 24'
								className='fill-main'
							>
								{' '}
								<path d='M8 6h8v2H8V6zm-4 4V8h4v2H4zm-2 2v-2h2v2H2zm0 2v-2H0v2h2zm2 2H2v-2h2v2zm4 2H4v-2h4v2zm8 0v2H8v-2h8zm4-2v2h-4v-2h4zm2-2v2h-2v-2h2zm0-2h2v2h-2v-2zm-2-2h2v2h-2v-2zm0 0V8h-4v2h4zm-10 1h4v4h-4v-4z' />{' '}
							</svg>
						) : (
							<svg
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 24 24'
								className='fill-main'
							>
								{' '}
								<path d='M0 7h2v2H0V7zm4 4H2V9h2v2zm4 2v-2H4v2H2v2h2v-2h4zm8 0H8v2H6v2h2v-2h8v2h2v-2h-2v-2zm4-2h-4v2h4v2h2v-2h-2v-2zm2-2v2h-2V9h2zm0 0V7h2v2h-2z' />{' '}
							</svg>
						)}
					</button>
				)}
				<div className='bottom-border-decor'></div>
			</div>
		</>
	);
};
export default FormInput;
