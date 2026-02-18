'use client';

import { useMemo } from 'react';
import addressData from '../data/TaiwanAddress/TaiwanAddressCityAreaRoadChinese.json';

interface CityData {
  CityName: string;
  AreaList: {
    ZipCode: string;
    AreaName: string;
    RoadList: { RoadName: string }[];
  }[];
}

export interface TaiwanAddressSelectorProps {
  postalCodeValue: string;
  cityValue: string;
  districtValue: string;
  addressLine1Value: string;
  onPostalCodeChange: (zipCode: string, city: string, district: string) => void;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string, zipCode: string) => void;
  onAddressLine1Change: (address: string) => void;
  selectClassName?: string;
  inputClassName?: string;
  cityError?: string;
  districtError?: string;
  addressError?: string;
}

const data = addressData as CityData[];

export default function TaiwanAddressSelector({
  postalCodeValue,
  cityValue,
  districtValue,
  addressLine1Value,
  onPostalCodeChange,
  onCityChange,
  onDistrictChange,
  onAddressLine1Change,
  selectClassName = '',
  inputClassName = '',
  cityError,
  districtError,
  addressError,
}: TaiwanAddressSelectorProps) {
  // Reverse map: zipCode → { city, district }
  const zipMap = useMemo(() => {
    const map: Record<string, { city: string; district: string }> = {};
    for (const city of data) {
      for (const area of city.AreaList) {
        map[area.ZipCode] = { city: city.CityName, district: area.AreaName };
      }
    }
    return map;
  }, []);

  // City list
  const cityList = useMemo(() => data.map((c) => c.CityName), []);

  // Area list for selected city
  const areaList = useMemo(() => {
    if (!cityValue) return [];
    const city = data.find((c) => c.CityName === cityValue);
    return city ? city.AreaList : [];
  }, [cityValue]);

  // Road list for selected city + district
  const roadList = useMemo(() => {
    if (!cityValue || !districtValue) return [];
    const city = data.find((c) => c.CityName === cityValue);
    if (!city) return [];
    const area = city.AreaList.find((a) => a.AreaName === districtValue);
    return area ? area.RoadList.map((r) => r.RoadName) : [];
  }, [cityValue, districtValue]);

  // Handle postal code input
  const handlePostalCodeChange = (value: string) => {
    // Only allow digits, max 3 chars
    const cleaned = value.replace(/\D/g, '').slice(0, 3);
    if (cleaned.length === 3 && zipMap[cleaned]) {
      const { city, district } = zipMap[cleaned];
      onPostalCodeChange(cleaned, city, district);
    } else {
      onPostalCodeChange(cleaned, '', '');
    }
  };

  // Handle city select
  const handleCityChange = (city: string) => {
    onCityChange(city);
  };

  // Handle district select
  const handleDistrictChange = (district: string) => {
    const area = areaList.find((a) => a.AreaName === district);
    const zipCode = area ? area.ZipCode : '';
    onDistrictChange(district, zipCode);
  };

  return (
    <>
      {/* Row: postal code + city + district */}
      <div className="grid grid-cols-3 gap-[20px]">
        <div>
          <label htmlFor="postal_code" className="mb-[5px] text-sm font-medium block">
            郵遞區號
          </label>
          <input
            id="postal_code"
            type="text"
            inputMode="numeric"
            maxLength={3}
            value={postalCodeValue}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            className={inputClassName}
            placeholder="110"
          />
        </div>
        <div>
          <label htmlFor="city" className="mb-[5px] text-sm font-medium block">
            縣市 *
          </label>
          <select
            id="city"
            value={cityValue}
            onChange={(e) => handleCityChange(e.target.value)}
            className={selectClassName || inputClassName}
          >
            <option value="">選擇縣市</option>
            {cityList.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {cityError && <p className="text-red-500 text-xs mt-1">{cityError}</p>}
        </div>
        <div>
          <label htmlFor="district" className="mb-[5px] text-sm font-medium block">
            鄉鎮區 *
          </label>
          <select
            id="district"
            value={districtValue}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className={selectClassName || inputClassName}
            disabled={!cityValue}
          >
            <option value="">選擇鄉鎮區</option>
            {areaList.map((area) => (
              <option key={area.ZipCode} value={area.AreaName}>
                {area.AreaName}
              </option>
            ))}
          </select>
          {districtError && <p className="text-red-500 text-xs mt-1">{districtError}</p>}
        </div>
      </div>

      {/* Address with datalist road suggestions */}
      <div>
        <label htmlFor="address_line1" className="mb-[5px] text-sm font-medium block">
          地址 *
        </label>
        <input
          id="address_line1"
          type="text"
          value={addressLine1Value}
          onChange={(e) => onAddressLine1Change(e.target.value)}
          className={inputClassName}
          placeholder="信義路五段7號"
          list="road-suggestions"
          autoComplete="off"
        />
        <datalist id="road-suggestions">
          {roadList.map((road) => (
            <option key={road} value={road} />
          ))}
        </datalist>
        {addressError && <p className="text-red-500 text-xs mt-1">{addressError}</p>}
      </div>
    </>
  );
}
