import { useState, useEffect } from 'react';

interface AmenitiesSelectorProps {
  value?: string[];
  onChange: (amenities: string[]) => void;
}

const COMMON_AMENITIES = [
  'Điều hòa',
  'Tủ lạnh',
  'Giường',
  'Tủ quần áo',
  'Bàn học',
  'Wifi',
  'Máy giặt',
  'Bếp',
  'Ban công',
  'Gác',
  'Khóa vân tay',
  'Camera an ninh',
];

export default function AmenitiesSelector({ value = [], onChange }: AmenitiesSelectorProps) {
  const [selected, setSelected] = useState<string[]>(value);
  const [customAmenity, setCustomAmenity] = useState('');

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleToggle = (amenity: string) => {
    const newSelected = selected.includes(amenity)
      ? selected.filter(a => a !== amenity)
      : [...selected, amenity];
    setSelected(newSelected);
    onChange(newSelected);
  };

  const handleAddCustom = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !selected.includes(trimmed)) {
      const newSelected = [...selected, trimmed];
      setSelected(newSelected);
      onChange(newSelected);
      setCustomAmenity('');
    }
  };

  const handleRemoveCustom = (amenity: string) => {
    const newSelected = selected.filter(a => a !== amenity);
    setSelected(newSelected);
    onChange(newSelected);
  };

  // Custom amenities = những tiện nghi không có trong danh sách mặc định
  const customAmenities = selected.filter(a => !COMMON_AMENITIES.includes(a));

  return (
    <div className="space-y-3">
      {/* Common amenities checkboxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {COMMON_AMENITIES.map((amenity) => (
          <label
            key={amenity}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.includes(amenity)}
              onChange={() => handleToggle(amenity)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">{amenity}</span>
          </label>
        ))}
      </div>

      {/* Custom amenities */}
      {customAmenities.length > 0 && (
        <div className="pt-3 border-t">
          <p className="text-xs font-medium text-gray-600 mb-2">Tiện nghi khác:</p>
          <div className="flex flex-wrap gap-2">
            {customAmenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => handleRemoveCustom(amenity)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <i className="ri-close-line"></i>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add custom amenity */}
      <div className="pt-3 border-t">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Thêm tiện nghi khác
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="VD: Thang máy, Hầm xe..."
          />
          <button
            type="button"
            onClick={handleAddCustom}
            disabled={!customAmenity.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <i className="ri-add-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
