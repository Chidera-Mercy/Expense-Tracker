import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAuth } from './AuthContext';
import supabase from './db/supabase';

// Define currency symbols mapping
export const CURRENCY_SYMBOLS = {
  'GHC': '₵',
  'NGN': '₦',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CAD': '$',
  'AUD': '$',
  'CNY': '¥'
};

// Create the context
const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const { user } = UserAuth();
  const [currency, setCurrency] = useState('GHC'); // Default currency
  const [symbol, setSymbol] = useState(CURRENCY_SYMBOLS['GHC']); // Default symbol
  const [loading, setLoading] = useState(true);

  // Fetch user currency preference
  useEffect(() => {
    const fetchUserCurrency = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('currency')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching currency preference:', error);
            return;
          }

          if (data && data.currency) {
            setCurrency(data.currency);
            setSymbol(CURRENCY_SYMBOLS[data.currency] || CURRENCY_SYMBOLS['GHC']);
          }
        } catch (err) {
          console.error('Failed to fetch currency preference:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserCurrency();
  }, [user]);

  // Function to update currency throughout the app
  const updateCurrency = async (newCurrency) => {
    if (!user || !newCurrency || !CURRENCY_SYMBOLS[newCurrency]) return;

    setCurrency(newCurrency);
    setSymbol(CURRENCY_SYMBOLS[newCurrency]);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ currency: newCurrency })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating currency preference:', error);
      }
    } catch (err) {
      console.error('Failed to save currency preference:', err);
    }
  };

  // Format amount with currency symbol
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return `${symbol}0`;
    
    // Format number based on currency
    try {
      const numAmount = Number(amount);
      if (isNaN(numAmount)) return `${symbol}${amount}`;
      
      // Different currencies may have different formatting requirements
      if (currency === 'JPY' || currency === 'CNY') {
        // No decimal for JPY and CNY
        return `${symbol}${numAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      } else {
        // 2 decimal places for other currencies
        return `${symbol}${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    } catch (error) {
      console.error('Error formatting amount:', error);
      return `${symbol}${amount}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      symbol, 
      loading, 
      updateCurrency, 
      formatAmount,
      CURRENCY_SYMBOLS
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use the currency context
export const useCurrency = () => {
  return useContext(CurrencyContext);
};