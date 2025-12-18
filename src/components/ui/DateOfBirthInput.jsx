import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const DateOfBirthInput = ({ onChange, value, className }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setDay(date.getDate().toString());
      setMonth((date.getMonth() + 1).toString());
      setYear(date.getFullYear().toString());
    }
  }, [value]);

  const validateDate = (d, m, y) => {
    if (!d || !m || !y) return false;
    
    const date = new Date(y, m - 1, d);
    if (date.getDate() !== parseInt(d)) return false;
    
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 18);
    
    if (date > today || date > minDate) {
      setError('You must be at least 18 years old');
      return false;
    }
    
    return true;
  };

  const handleChange = (newDay, newMonth, newYear) => {
    setError('');
    
    if (validateDate(newDay, newMonth, newYear)) {
      const dateString = `${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`;
      onChange(dateString);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 100; i <= currentYear - 18; i++) {
      years.push(i);
    }
    return years.reverse();
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
          <select
            value={day}
            onChange={(e) => {
              setDay(e.target.value);
              handleChange(e.target.value, month, year);
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          >
            <option value="">Day</option>
            {[...Array(month && year ? getDaysInMonth(month, year) : 31)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              handleChange(day, e.target.value, year);
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          >
            <option value="">Month</option>
            {months.map((monthName, index) => (
              <option key={monthName} value={index + 1}>
                {monthName}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              handleChange(day, month, e.target.value);
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          >
            <option value="">Year</option>
            {generateYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

DateOfBirthInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  className: PropTypes.string
};

export default DateOfBirthInput; 