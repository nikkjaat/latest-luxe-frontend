import React, { useState, useRef } from 'react';
import { Camera, Upload, Search, X, Loader } from 'lucide-react';
import { useAI } from '../context/AIContext';

const VisualSearch = ({ onResults }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);
  const { searchByImage } = useAI();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) return;

    setSearching(true);
    try {
      const searchResults = await searchByImage(selectedImage);
      setResults(searchResults);
      onResults(searchResults);
    } catch (error) {
      console.error('Visual search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedImage(null);
    setResults([]);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        title="Visual Search"
      >
        <Camera className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Visual Search</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {!selectedImage ? (
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Search with an Image
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Upload a photo to find similar products
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Image
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <img
                      src={selectedImage}
                      alt="Search"
                      className="max-w-full h-64 object-contain mx-auto rounded-lg"
                    />
                    <div className="mt-4 flex justify-center space-x-4">
                      <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                      >
                        {searching ? (
                          <Loader className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <Search className="h-5 w-5 mr-2" />
                        )}
                        {searching ? 'Searching...' : 'Find Similar'}
                      </button>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Choose Different Image
                      </button>
                    </div>
                  </div>

                  {results.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Similar Products Found
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {results.map((result) => (
                          <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                <Search className="h-8 w-8 text-gray-400" />
                              </div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                {result.name}
                              </h4>
                              <div className="flex items-center justify-center mb-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${result.similarity * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {Math.round(result.similarity * 100)}% match
                                </span>
                              </div>
                              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                View Product
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisualSearch;