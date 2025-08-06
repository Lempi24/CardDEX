import Register from './pages/Register';
import Login from './pages/Login';
import MainPage from './pages/MainPage';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Trade from './pages/Trade';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import MyCloseButton from './components/MyCloseButton';
import ProtectedRoute from './components/ProtectedRoute';
import { UIContextProvider } from './contexts/UIContext';
import { AuthContextProvider } from './contexts/AuthContext';
function App() {
	return (
		<div className='w-screen h-screen overflow-x-hidden bg-main text-text'>
			<AuthContextProvider>
				<UIContextProvider>
					<Routes>
						<Route path='/' element={<Login />} />
						<Route path='/register' element={<Register />} />
						<Route path='/chat' element={<Chat />} />
						<Route path='/profile' element={<Profile />} />
						<Route path='/trade' element={<Trade />} />
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
					/>
				</UIContextProvider>
			</AuthContextProvider>
		</div>
	);
}
export default App;
