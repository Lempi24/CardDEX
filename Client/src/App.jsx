import Register from './pages/Register';
import Login from './pages/Login';
import MainPage from './pages/MainPage';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import MyCloseButton from './components/MyCloseButton';
import ProtectedRoute from './components/ProtectedRoute';
function App() {
	return (
		<div className='w-screen h-screen'>
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/register' element={<Register />} />
				<Route
					path='/main-page'
					element={
						<ProtectedRoute>
							<MainPage />
						</ProtectedRoute>
					}
				/>
			</Routes>
			<ToastContainer
				position='top-center'
				autoClose={3000}
				hideProgressBar={false}
				closeOnClick={false}
				closeButton={MyCloseButton}
				theme='#1a1a2e'
				toastStyle={{
					position: 'relative',
				}}
			/>
		</div>
	);
}
export default App;
