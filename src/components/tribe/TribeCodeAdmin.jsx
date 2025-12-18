import React, { useState, useEffect } from 'react';
import { 
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../services/firebase';

const generateTribeCode = (university) => {
  const prefix = university.split(' ')[0].substring(0, 3).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `${prefix}-LINK-${year}-${randomNum}`;
};

const TribeCodeAdmin = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCode, setNewCode] = useState({
    university: '',
    maxUses: 100,
    expiryDays: 30,
    badge: '🎓'
  });

  useEffect(() => {
    loadTribeCodes();
  }, []);

  const loadTribeCodes = async () => {
    try {
      setLoading(true);
      const tribeCodesRef = collection(db, 'tribeCodes');
      const q = query(tribeCodesRef, where('expiryDate', '>', new Date()));
      const snapshot = await getDocs(q);
      
      const activeCodes = [];
      snapshot.forEach(doc => {
        activeCodes.push({ id: doc.id, ...doc.data() });
      });

      setCodes(activeCodes.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
    } catch (err) {
      setError('Failed to load tribe codes');
      console.error('Error loading tribe codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async (e) => {
    e.preventDefault();
    if (!newCode.university) return;

    try {
      setLoading(true);
      const code = generateTribeCode(newCode.university);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(newCode.expiryDays));

      const tribeCodeData = {
        code,
        university: newCode.university,
        badge: newCode.badge,
        maxUses: parseInt(newCode.maxUses),
        usedCount: 0,
        createdAt: serverTimestamp(),
        expiryDate,
        active: true
      };

      await addDoc(collection(db, 'tribeCodes'), tribeCodeData);
      await loadTribeCodes();

      setNewCode({
        university: '',
        maxUses: 100,
        expiryDays: 30,
        badge: '🎓'
      });
    } catch (err) {
      setError('Failed to create tribe code');
      console.error('Error creating tribe code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateCode = async (codeId) => {
    try {
      const codeRef = doc(db, 'tribeCodes', codeId);
      await updateDoc(codeRef, {
        active: false,
        expiryDate: new Date()
      });
      await loadTribeCodes();
    } catch (err) {
      setError('Failed to deactivate code');
      console.error('Error deactivating code:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Tribe Code Management</h2>

      {/* Create New Code Form */}
      <form onSubmit={handleCreateCode} className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Create New Tribe Code</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University
            </label>
            <input
              type="text"
              value={newCode.university}
              onChange={(e) => setNewCode(prev => ({ ...prev, university: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge Emoji
            </label>
            <input
              type="text"
              value={newCode.badge}
              onChange={(e) => setNewCode(prev => ({ ...prev, badge: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Uses
            </label>
            <input
              type="number"
              value={newCode.maxUses}
              onChange={(e) => setNewCode(prev => ({ ...prev, maxUses: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Days
            </label>
            <input
              type="number"
              value={newCode.expiryDays}
              onChange={(e) => setNewCode(prev => ({ ...prev, expiryDays: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
              min="1"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-4 w-full py-2 px-4 rounded-lg text-white font-medium ${
            loading ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'
          }`}
        >
          {loading ? 'Creating...' : 'Create Tribe Code'}
        </button>
      </form>

      {/* Active Codes List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Active Tribe Codes</h3>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Badge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {codes.map(code => (
                <tr key={code.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {code.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.university}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xl">
                    {code.badge}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.usedCount} / {code.maxUses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.expiryDate?.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeactivateCode(code.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          </div>
        )}

        {!loading && codes.length === 0 && (
          <p className="text-center text-gray-600 py-4">
            No active tribe codes found
          </p>
        )}
      </div>
    </div>
  );
};

export default TribeCodeAdmin;
