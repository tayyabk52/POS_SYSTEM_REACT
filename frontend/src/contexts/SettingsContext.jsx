import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch settings from the backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/settings/system');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      
      // Convert array of settings to key-value object
      const settingsObject = {};
      data.forEach(setting => {
        settingsObject[setting.setting_key] = setting.setting_value;
      });
      
      setSettings(settingsObject);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message);
      // Set default settings if fetch fails
      setSettings({
        store_name: 'POS System',
        currency_symbol: '$',
        date_format: 'MM/DD/YYYY',
        time_format: '12'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get a specific setting value
  const getSetting = (key, defaultValue = '') => {
    return settings[key] || defaultValue;
  };

  // Update a setting
  const updateSetting = async (key, value) => {
    try {
      const response = await fetch('http://localhost:8000/settings/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_key: key,
          setting_value: value
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));

      return true;
    } catch (err) {
      console.error('Error updating setting:', err);
      return false;
    }
  };

  // Refresh settings
  const refreshSettings = () => {
    fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const value = {
    settings,
    loading,
    error,
    getSetting,
    updateSetting,
    refreshSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 