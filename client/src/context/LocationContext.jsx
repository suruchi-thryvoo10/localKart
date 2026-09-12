import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const POPULAR_LOCATIONS = [
  {
    name: 'Saheed Nagar, Bhubaneswar',
    area: 'Saheed Nagar',
    coordinates: [85.8340, 20.2980],
    pincode: '751007',
  },
  {
    name: 'Nayapalli (Near ISKCON), Bhubaneswar',
    area: 'Nayapalli',
    coordinates: [85.8150, 20.2990],
    pincode: '751012',
  },
  {
    name: 'Master Canteen Square, Bhubaneswar',
    area: 'Unit 3',
    coordinates: [85.8200, 20.2910],
    pincode: '751001',
  },
  {
    name: 'Patia / KIIT Square, Bhubaneswar',
    area: 'Patia',
    coordinates: [85.8180, 20.3550],
    pincode: '751024',
  },
  {
    name: 'Rasulgarh Square, Bhubaneswar',
    area: 'Rasulgarh',
    coordinates: [85.8450, 20.3010],
    pincode: '751010',
  },
];

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const saved = localStorage.getItem('lk_location');
    return saved ? JSON.parse(saved) : POPULAR_LOCATIONS[0];
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const updateLocation = (loc) => {
    setSelectedLocation(loc);
    localStorage.setItem('lk_location', JSON.stringify(loc));
    setIsLocationModalOpen(false);
  };

  const useCurrentGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            name: 'My Current Location (GPS)',
            area: 'Near Me',
            coordinates: [position.coords.longitude, position.coords.latitude],
            pincode: '751007',
          };
          updateLocation(newLoc);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Fallback to default
          updateLocation(POPULAR_LOCATIONS[0]);
        }
      );
    }
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation: updateLocation,
        useCurrentGps,
        isLocationModalOpen,
        setIsLocationModalOpen,
        popularLocations: POPULAR_LOCATIONS,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
