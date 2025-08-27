export const uploadImage = async (image) => {
	const formData = new FormData();
	formData.append('file', image);
	formData.append('upload_preset', 'ml_default');

	const res = await fetch(
		`https://api.cloudinary.com/v1_1/${
			import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
		}/image/upload`,
		{
			method: 'POST',
			body: formData,
		}
	);
	const data = await res.json();
	return data.secure_url;
};
