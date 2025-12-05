import React, { useState, useEffect } from 'react';

interface Customer {
  email: string;
  customer_name: string | null;
  plan_tier: string;
  payment_amount: number | null;
  payment_intent_id: string | null;
  access_granted: boolean;
  created_at: string;
  last_login: string | null;
}

interface AdminDashboardProps {
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchCustomers = async (search?: string) => {
    try {
      setLoading(true);
      const url = search
        ? `/api/admin?search=${encodeURIComponent(search)}`
        : '/api/admin';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${adminPassword}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.customers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchCustomers();
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchCustomers(searchTerm);
    } else {
      fetchCustomers();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (cents: number | null) => {
    if (!cents) return '$0';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getTierBadge = (tier: string) => {
    const badges = {
      'fast-ai': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Fast Track' },
      'ai-target': { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Targeted' },
      'expert-clinical': { color: 'bg-teal-100 text-teal-800 border-teal-200', label: 'Specialist' },
      'leadership-np': { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Executive' },
    };
    const badge = badges[tier as keyof typeof badges] || { color: 'bg-slate-100 text-slate-800 border-slate-200', label: tier };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-md w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Admin Login</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-500 transition-colors"
            >
              Access Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                  <p className="text-xs text-slate-500">Customer Management Portal</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-semibold text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200">
          <div className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Total Customers</p>
                    <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Active Users</p>
                    <p className="text-2xl font-bold text-slate-900">{customers.filter(c => c.access_granted).length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatPrice(customers.reduce((sum, c) => sum + (c.payment_amount || 0), 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Avg. Order Value</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {customers.length > 0 ? formatPrice(Math.round(customers.reduce((sum, c) => sum + (c.payment_amount || 0), 0) / customers.length)) : '$0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by email or name..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); fetchCustomers(); }}
                  className="px-4 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-auto bg-slate-50">
          <div className="container mx-auto px-6 py-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-slate-600 font-semibold">No customers found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Plan</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Last Login</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.map((customer, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">
                                  {(customer.customer_name || customer.email).charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{customer.customer_name || 'N/A'}</p>
                                <p className="text-sm text-slate-500">{customer.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">{getTierBadge(customer.plan_tier)}</td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900">{formatPrice(customer.payment_amount)}</span>
                          </td>
                          <td className="px-6 py-4">
                            {customer.access_granted ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 w-fit">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1 w-fit">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                Revoked
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{formatDate(customer.created_at)}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{formatDate(customer.last_login)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
