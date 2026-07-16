import { useState, useEffect } from 'react';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        setProfile(null);
      }
    }
    setIsLoading(false);
  }, []);

  const updateProfile = (name, email, role) => {
    const newProfile = { name, email, role };
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
    setProfile(newProfile);
  };

  const clearProfile = () => {
    localStorage.removeItem('userProfile');
    setProfile(null);
  };

  return { profile, isLoading, updateProfile, clearProfile };
}
