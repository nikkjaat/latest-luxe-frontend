import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Package, Heart, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    address: '123 Luxury Avenue, Fashion District, NY 10001',
    birthdate: '1990-01-15'
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
  };

  const orders = [
    {
      id: 'ORD-001',
      date: '2025-01-10',
      status: 'Delivered',
      total: 299.99,
      items: 3
    },
    {
      id: 'ORD-002',
      date: '2025-01-05',
      status: 'Processing',
      total: 599.99,
      items: 2
    },
    {
      id: 'ORD-003',
      date: '2024-12-28',
      status: 'Shipped',
      total: 149.99,
      items: 1
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto"
                  />
                  <button className="absolute bottom-0 right-0 bg-blue-900 text-white p-2 rounded-full hover:bg-blue-800 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-4">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5 mr-3" />
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Package className="h-5 w-5 mr-3" />
                  Order History
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'wishlist' ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className="h-5 w-5 mr-3" />
                  Wishlist
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'payment' ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  Payment Methods
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">Profile Information</h1>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">{formData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">{formData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">{formData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Birth Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.birthdate}
                        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">{formData.birthdate}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">{formData.address}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Order History</h1>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">Order {order.id}</h3>
                          <p className="text-sm text-gray-600">Placed on {order.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {order.items} items • ${order.total}
                        </div>
                        <button className="text-blue-900 hover:text-blue-700 font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">My Wishlist</h1>
                <p className="text-gray-600">Your wishlist items will appear here.</p>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Payment Methods</h1>
                <p className="text-gray-600">Manage your payment methods and billing information.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;