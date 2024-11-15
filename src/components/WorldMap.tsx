import React, { memo, useCallback, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { useMapStore } from '../store/mapStore';
import { countryZoomLevels } from '../data/zoomLevels';
import { countryData } from '../data/countries';
import { getStandardizedCountryCode } from '../utils/countryCodeMap';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const WorldMap = () => {
  const { zoom, center, selectedCountry, setSelectedCountry, setZoom, setCenter, showAllCountries, toggleShowAllCountries } = useMapStore();

  // Auto-reveal after 5 seconds if a country is selected but map is hidden
  useEffect(() => {
    if (selectedCountry && !showAllCountries) {
      const timer = setTimeout(() => {
        toggleShowAllCountries();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedCountry, showAllCountries, toggleShowAllCountries]);

  const handleCountryClick = useCallback((code: string, coordinates: [number, number]) => {
    console.log('Clicked country:', code);
    setSelectedCountry(code);
    setCenter(coordinates);
    const zoomLevel = countryZoomLevels[code] || countryZoomLevels.default;
    console.log('Setting zoom level:', zoomLevel);
    setZoom(zoomLevel);
  }, [setSelectedCountry, setCenter, setZoom]);

  const getCountryCode = (geo: any): string => {
    const properties = geo.properties;
    const name = properties.name || properties.NAME || '';
    const code = properties.ISO_A3 || properties.ADM0_A3 || '';
    return getStandardizedCountryCode(code, name);
  };

  return (
    <div className="w-full h-full bg-gray-900">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 180,
          center: [0, 0]
        }}
        width={800}
        height={400}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          maxZoom={8}
          minZoom={1}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) => 
              geographies.map((geo) => {
                const geoCode = getCountryCode(geo);
                const countryInfo = countryData.find(c => c.code === geoCode);
                const isSelected = selectedCountry === geoCode;
                const isHidden = !showAllCountries && !isSelected && selectedCountry !== null;
                const countryName = countryInfo?.name || geo.properties.NAME || 'Unknown';
                const shouldShow = !selectedCountry || showAllCountries || isSelected;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    tabIndex={0}
                    data-selected={isSelected}
                    data-name={countryName}
                    data-code={geoCode}
                    title={isSelected ? `Selected: ${countryName}` : countryName}
                    onClick={() => {
                      if (countryInfo) {
                        handleCountryClick(countryInfo.code, countryInfo.coordinates);
                      }
                    }}
                    style={{
                      default: {
                        fill: isSelected ? '#3B82F6' : isHidden ? '#1F2937' : '#4B5563',
                        stroke: isSelected ? '#2563EB' : '#1F2937',
                        strokeWidth: isSelected ? 0.75 : 0.5, // Reduced outline thickness
                        outline: 'none',
                        opacity: shouldShow ? 1 : 0, // Hide initially
                      },
                      hover: {
                        fill: isSelected ? '#2563EB' : '#60A5FA',
                        stroke: '#2563EB',
                        strokeWidth: 0.75,
                        outline: 'none',
                        opacity: shouldShow ? 1 : 0,
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: '#1D4ED8',
                        stroke: '#1E40AF',
                        strokeWidth: 0.75,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default memo(WorldMap);