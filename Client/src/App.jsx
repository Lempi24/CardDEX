import Register from './pages/Register';
import Login from './pages/Login';
import MainPage from './pages/MainPage';
import { Routes, Route } from 'react-router-dom';
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
		</div>
	);
}
export default App;
