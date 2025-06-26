/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Press Start 2P', 'system-ui', 'sans-serif'],
			},
			backgroundImage: {
				pokeborder: 'url(`/img/border-box.jpg`)',
			},
			transformStyle: {
				'preserve-3d': 'preserve-3d',
			},
			backfaceVisibility: {
				hidden: 'hidden',
			},
			rotate: {
				'y-180': 'rotateY(180deg)',
			},
			perspective: {
				1000: '1000px',
			},
		},
	},
	plugins: [],
};
