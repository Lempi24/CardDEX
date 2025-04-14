import UserForm from '../components/UserForm';
import logo from '../img/pokeball.png';
const Login = () => {
	return (
		<main className='bg-main h-full w-full flex items-center justify-center flex-col gap-10 text-text'>
			<div className='logo flex items-center'>
				<img src={logo} alt='pokeball shaped logo' className='w-13' />
				<h2 className='ml-3 text-xl'>CardDEX</h2>
			</div>
			<h1 className='text-center p-3'>Log Into Your CardDEX</h1>
			<UserForm
				isLoging={true}
				pText={'No CardDEX yet?'}
				spanInfo={'Register'}
				btnText={'Open your CardDEX'}
				destination={'/register'}
				btnDestination={'/main-page'}
			/>
		</main>
	);
};
export default Login;
