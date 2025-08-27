import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
	const [auth, setAuth] = useState(null);

	useEffect(() => {
		try {
			const token = localStorage.getItem('token');
			if (token) {
				const decodedToken = jwtDecode(token);
				console.log(decodedToken);
				setAuth({
					id: decodedToken.id,
					userName: decodedToken.userName,
				});
			}
		} catch (error) {
			console.error('Błąd dekodowania tokena:', error);
			setAuth(null);
		}
	}, []);
	return auth;
};
export default useAuth;
