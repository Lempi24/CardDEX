import { useContext, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
	const navigate = useNavigate();
	const handleLogOut = () => {
		localStorage.removeItem('token');
		navigate('/');
	};
	return (
		<AuthContext.Provider value={{ handleLogOut }}>
			{children}
		</AuthContext.Provider>
	);
};
export const useAuthContext = () => useContext(AuthContext);
