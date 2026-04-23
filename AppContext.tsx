
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TRANSLATIONS, GYM_SCHEDULE } from './constants';
import { Language, User, Reservation, GymClass, Contact } from './types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  user: User | null;
  setUser: (user: User | null) => void;
  registeredUsers: User[];
  setRegisteredUsers: (users: User[]) => void;
  reservations: Reservation[];
  setReservations: (reservations: Reservation[]) => void;

  gymClasses: GymClass[];
  setGymClasses: (classes: GymClass[]) => void;
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  refreshContacts: () => Promise<void>;
  isInitialLoaded: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_URL = (import.meta as any).env.VITE_API_URL || '';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [gymClasses, setGymClasses] = useState<GymClass[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  // INITIAL DATA FETCHING
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResp, resResp, classesResp, contactsResp] = await Promise.all([
          fetch(`${API_URL}/api/users`),
          fetch(`${API_URL}/api/reservations`),
          fetch(`${API_URL}/api/classes`),
          fetch(`${API_URL}/api/contacts`)
        ]);

        if (usersResp.ok) setRegisteredUsers(await usersResp.json());
        if (resResp.ok) setReservations(await resResp.json());
        if (classesResp.ok) {
          const data = await classesResp.json();
          if (data.length === 0) {
            setGymClasses(GYM_SCHEDULE);
          } else {
            setGymClasses(data);
          }
        } else {
            setGymClasses(GYM_SCHEDULE);
        }
        if (contactsResp.ok) setContacts(await contactsResp.json());
      } catch (error) {
        console.error('Error fetching data:', error);
        setGymClasses(GYM_SCHEDULE);
      } finally {
        setIsInitialLoaded(true);
      }
    };
    fetchData();
  }, []);

  // AUTO-SYNC TO MONGO
  useEffect(() => {
    if (isInitialLoaded && registeredUsers.length > 0) {
      fetch(`${API_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registeredUsers)
      }).catch(err => console.error("Sync error users:", err));
    }
  }, [registeredUsers, isInitialLoaded]);

  useEffect(() => {
    if (isInitialLoaded) {
      fetch(`${API_URL}/api/reservations/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservations)
      }).catch(err => console.error("Sync error reservations:", err));
    }
  }, [reservations, isInitialLoaded]);



  useEffect(() => {
    if (isInitialLoaded && gymClasses.length > 0) {
      fetch(`${API_URL}/api/classes/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gymClasses)
      }).catch(err => console.error("Sync error classes:", err));
    }
  }, [gymClasses, isInitialLoaded]);

  const t = (key: string): string => {
    const section = TRANSLATIONS[language];
    return section[key as keyof typeof section] || key;
  };

  const refreshContacts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/contacts`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, t, user, setUser, 
      registeredUsers, setRegisteredUsers,
      reservations, setReservations,
      gymClasses, setGymClasses,
      contacts, setContacts,
      refreshContacts,
      isInitialLoaded
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
