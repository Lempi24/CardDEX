import { createContext, useContext } from 'react';
import logo from '../img/pokeball.png';
const AppContext = createContext();

export const UIContextProvider = ({ children }) => {
	return <AppContext.Provider value={{ logo }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
