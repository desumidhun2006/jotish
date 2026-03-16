import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CITY_COORDINATES } from '../lib/cityCoordinates';

// Mock aggregated data based on what the API might return
const analyticsData = [
  { city: 'New York', averageSalary: 120000 },
  { city: 'San Francisco', averageSalary: 145000 },
  { city: 'London', averageSalary: 95000 },
  { city: 'Austin', averageSalary: 105000 },
  { city: 'Seattle', averageSalary: 130000 },
];

// ==========================================
// RAW SVG CHART (Zero Libraries Constraint)
// ==========================================
const RawSvgBarChart = ({ data }) => {
  const width = 600;
  const height = 300;
  const padding = 50;

  const maxSalary = Math.max(...data.map(d => d.averageSalary));
  // Math: Calculate how many pixels 1 unit of salary represents
  const yRatio = (height - padding * 2) / maxSalary;
  const barWidth = (width - padding * 2) / data.length - 20;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Y-Axis Labels */}
      <text x={padding - 10} y={padding} textAnchor="end" fontSize="10" fill="#6b7280">${(maxSalary / 1000).toFixed(0)}k</text>
      <text x={padding - 10} y={height - padding} textAnchor="end" fontSize="10" fill="#6b7280">$0k</text>

      {/* X and Y Axis Lines */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#9ca3af" strokeWidth="2" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#9ca3af" strokeWidth="2" />

      {/* Bars and X-Axis Labels */}
      {data.map((item, index) => {
        const barHeight = item.averageSalary * yRatio;
        const x = padding + 20 + (index * (barWidth + 20));
        // Y coordinate is from the top, so we subtract bar height from the bottom baseline
        const y = height - padding - barHeight;

        return (
          <g key={item.city} className="transition-transform cursor-pointer hover:-translate-y-1 hover:opacity-80">
            <rect x={x} y={y} width={barWidth} height={barHeight} fill="#3b82f6" rx="4" />
            <text x={x + barWidth / 2} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#4b5563">{item.city}</text>
            <text x={x + barWidth / 2} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1f2937">${(item.averageSalary / 1000).toFixed(0)}k</text>
          </g>
        );
      })}
    </svg>
  );
};

const AnalyticsPage = () => {
  const location = useLocation();
  const auditImage = location.state?.auditImage;

  return (
    <div className="max-w-5xl px-4 py-12 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Analytics</h1>
        <Link to="/list" className="px-4 py-2 text-sm font-medium text-blue-600 transition-colors bg-blue-100 rounded-md hover:bg-blue-200">
          &larr; Back to Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        
        {/* Left Column: Audit Image */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Latest Identity Audit</h2>
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            {auditImage ? (
              <img src={auditImage} alt="Merged Audit" className="w-full h-auto rounded shadow-sm" />
            ) : (
              <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded">
                <p className="text-gray-500">No audit image captured in this session.</p>
              </div>
            )}
            <p className="mt-4 text-sm text-gray-600">
              This image represents the programmatic merge of the raw HTML5 Canvas layer and the native device camera layer.
            </p>
          </div>
        </div>

        {/* Right Column: Visualizations */}
        <div className="flex flex-col gap-8">
          
          {/* SVG Chart */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Salary Distribution (Raw SVG)</h2>
            <RawSvgBarChart data={analyticsData} />
          </div>

          {/* Geospatial Mapping Strategy */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Geospatial Data Handling</h2>
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <p className="mb-4 text-sm text-gray-600">
                To prevent client-side rate limiting and maintain high performance when rendering the map, city mappings are resolved using a static dictionary rather than a live geocoding API.
              </p>
              <pre className="p-4 text-xs overflow-x-auto text-gray-800 bg-gray-100 rounded-md shadow-inner">
                {JSON.stringify(CITY_COORDINATES, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsPage;