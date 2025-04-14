import UserForm from '../components/UserForm';
import logo from '../img/pokeball.png';
const Register = () => {
	return (
		<main className='bg-main h-full w-full flex items-center justify-center flex-col gap-10 text-text'>
			<div className='logo flex items-center'>
				<img src={logo} alt='pokeball shaped logo' className='w-13' />
				<h2 className='ml-3 text-xl'>CardDEX</h2>
			</div>
			<h1 className='text-center'>Create Your Own CardDEX</h1>
			<UserForm
				isLoging={false}
				pText={'Own a CardDEX already?'}
				spanInfo={'Log In'}
				btnText={'Get your CardDEX'}
				destination={'/'}
			/>
		</main>
	);
};
export default Register;
