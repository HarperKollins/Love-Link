import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ZODIAC_SIGNS = [
  { name: 'Aries', start: '03-21', end: '04-19' },
  { name: 'Taurus', start: '04-20', end: '05-20' },
  { name: 'Gemini', start: '05-21', end: '06-20' },
  { name: 'Cancer', start: '06-21', end: '07-22' },
  { name: 'Leo', start: '07-23', end: '08-22' },
  { name: 'Virgo', start: '08-23', end: '09-22' },
  { name: 'Libra', start: '09-23', end: '10-22' },
  { name: 'Scorpio', start: '10-23', end: '11-21' },
  { name: 'Sagittarius', start: '11-22', end: '12-21' },
  { name: 'Capricorn', start: '12-22', end: '01-19' },
  { name: 'Aquarius', start: '01-20', end: '02-18' },
  { name: 'Pisces', start: '02-19', end: '03-20' }
];

const DateOfBirthInput = ({ value, onChange, showZodiac = true, className = '' }) => {
  const [zodiacSign, setZodiacSign] = useState('');
  const [age, setAge] = useState(null);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getZodiacSign = (date) => {
    const month = new Date(date).getMonth() + 1;
    const day = new Date(date).getDate();
    const monthDay = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    return ZODIAC_SIGNS.find(sign => {
      const start = new Date(\`2000-\${sign.start}\`);
      const end = new Date(\`2000-\${sign.end}\`);
      const check = new Date(\`2000-\${monthDay}\`);

      if (sign.name === 'Capricorn') {
        return monthDay >= sign.start || monthDay <= sign.end;
      }
      
      return check >= start && check <= end;
    })?.name || '';
  };

  useEffect(() => {
    if (value) {
      setZodiacSign(getZodiacSign(value));
      setAge(calculateAge(value));
    }
  }, [value]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        max={new Date().toISOString().split('T')[0]}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
      {showZodiac && zodiacSign && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Zodiac:</span> {zodiacSign} 
          {age && <span className="ml-2">• Age: {age}</span>}
        </div>
      )}
    </div>
  );
};

DateOfBirthInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  showZodiac: PropTypes.bool,
  className: PropTypes.string
};

export default DateOfBirthInput;
