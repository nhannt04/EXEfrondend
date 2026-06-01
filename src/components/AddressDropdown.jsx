import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable AddressDropdown component for selecting addresses
 * Supports filtering by operating status
 *
 * @param {Object} props
 * @param {string} props.value - Current selected address
 * @param {Function} props.onChange - Handler when address is selected
 * @param {Array} props.addresses - List of unique addresses to display
 * @param {boolean} props.filterByOperating - Whether to fetch and filter only operating businesses
 * @param {Function} props.getOperatingService - Service function to get operating businesses (if filterByOperating is true)
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Label for the dropdown
 * @param {boolean} props.allowFreeForm - Whether to allow custom text input
 */
export default function AddressDropdown({
  value = '',
  onChange = () => {},
  addresses = [],
  filterByOperating = false,
  getOperatingService = null,
  placeholder = 'Chọn địa chỉ...',
  label = 'Địa chỉ',
  allowFreeForm = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredAddresses, setFilteredAddresses] = useState(addresses);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Update opening times when filterByOperating changes
  useEffect(() => {
    if (filterByOperating && getOperatingService) {
      setLoading(true);
      getOperatingService()
        .then(response => {
          // Extract unique addresses from operating businesses
          const operatingAddresses = response?.data
            ? [...new Set(response.data.map(item => item.address).filter(Boolean))]
            : [];
          setFilteredAddresses(operatingAddresses);
        })
        .catch(err => {
          console.error('Error fetching operating businesses:', err);
          setFilteredAddresses(addresses);
        })
        .finally(() => setLoading(false));
    } else {
      setFilteredAddresses(addresses);
    }
  }, [filterByOperating, getOperatingService, addresses]);

  // Filter addresses based on search term
  const displayedAddresses = filteredAddresses.filter(addr =>
    addr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if search term matches any existing address exactly
  const isExactMatch = displayedAddresses.includes(searchTerm);

  const handleSelect = (address) => {
    onChange(address);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleAddCustom = () => {
    if (searchTerm.trim()) {
      onChange(searchTerm.trim());
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="text-xs font-bold text-gray-500">{label}</label>
      <div className="relative">
        {/* Dropdown Trigger Button / Input Field */}
        <div className="relative">
          <input
            type="text"
            value={isOpen && searchTerm ? searchTerm : (value || '')}
            onChange={handleSearchChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50 pr-10"
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
            {/* Filter Input */}
            {displayedAddresses.length > 3 && (
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-center text-xs text-gray-400">
                  Đang tải...
                </div>
              ) : displayedAddresses.length === 0 ? (
                <div className="p-3">
                  {allowFreeForm && searchTerm.trim() && (
                    <button
                      type="button"
                      onClick={handleAddCustom}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 cursor-pointer transition-colors rounded-lg border"
                    >
                      ➕ Thêm "{searchTerm.trim()}" as địa chỉ mới
                    </button>
                  )}
                  {!allowFreeForm && (
                    <div className="text-center text-xs text-gray-400 py-4">
                      Không tìm thấy địa chỉ
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {displayedAddresses.map((address, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelect(address)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium border-none cursor-pointer transition-colors ${
                        value === address
                          ? 'bg-heritage-amber/10 text-heritage-amber'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {address}
                    </button>
                  ))}

                  {/* Custom entry option */}
                  {allowFreeForm && searchTerm.trim() && !isExactMatch && (
                    <div className="border-t border-gray-100 p-2">
                      <button
                        type="button"
                        onClick={handleAddCustom}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium bg-green-50 hover:bg-green-100 text-green-600 border-none cursor-pointer transition-colors rounded-lg"
                      >
                        ➕ Thêm địa chỉ tùy chỉnh: "{searchTerm.trim()}"
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Info badge if filtering by operating */}
            {filterByOperating && (
              <div className="p-2 bg-blue-50/50 border-t border-blue-100 text-[10px] text-blue-600 font-semibold">
                ✓ Chỉ hiển thị địa điểm đang hoạt động
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Text */}
      {filterByOperating && (
        <span className="text-[10px] text-blue-600 font-medium">
          💡 Chỉ hiển thị địa chỉ của các địa điểm đang hoạt động vào lúc này
        </span>
      )}
    </div>
  );
}


