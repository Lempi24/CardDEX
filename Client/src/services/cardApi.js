import axios from 'axios';

export const fetchMyCards = async ({ page, paginationLimit }) => {
	try {
		const token = localStorage.getItem('token');
		const params = {
			page: page,
			limit: paginationLimit,
		};

		const response = await axios.get(
			`${import.meta.env.VITE_BACKEND_URL}/api/cards`,
			{
				headers: { Authorization: `Bearer ${token}` },
				params: params,
			}
		);
		return response.data;
	} catch (error) {
		console.error('Error fetching cards from API:', error);
		throw error;
	}
};
