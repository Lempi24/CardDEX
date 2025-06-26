const FormInput = ({ label, type, ...rest }) => {
	return (
		<>
			<label htmlFor={rest.name} className=''>
				{label}
			</label>
			<div className='form-input relative'>
				<input
					type={type}
					placeholder={label + '...'}
					{...rest}
					className=' bg-filling p-2 placeholder:text-sm w-full 
             border-2 border-black ring-1 ring-black focus:ring-2 focus:ring-accent1 outline-none'
				/>
				<div className='bottom-border-decor'></div>
			</div>
		</>
	);
};
export default FormInput;
