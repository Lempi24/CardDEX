import axios from 'axios';

export const fetchUserTradeCards = async () => {
	try {
		const token = localStorage.getItem('token');
		const response = await axios.get(
			`${import.meta.env.VITE_BACKEND_URL}/api/cards/cards-for-trade`,
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		return response.data.cardsForTrade;
	} catch (error) {
		console.error('Error fetching user cards for trade:', error);
		throw error;
	}
};
