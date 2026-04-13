import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { User, Ride } from '../types';

interface AppContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  activeRide: Ride | null;
  setActiveRide: Dispatch<SetStateAction<Ride | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);

  return (
    <AppContext.Provider value={{ user, setUser, activeRide, setActiveRide }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
