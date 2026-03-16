import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '../hooks/useVirtualizer';
import { useAuth } from '../providers/AuthProvider';

const ITEM_HEIGHT = 64; // Fixed row height of 4rem (64px)
const CONTAINER_HEIGHT = 600; // Scrollable area height

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts mid-fetch

    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: "test", password: "123456" })
        });
        
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        
        console.log("Raw API Response:", data);

        // Safely extract array data depending on how the backend structures the JSON response
        let listData = [];
        if (data && data.TABLE_DATA && Array.isArray(data.TABLE_DATA.data)) {
          // The API returns an array of arrays. We need to map it into an array of objects.
          listData = data.TABLE_DATA.data.map(row => ({
            name: row[0],
            role: row[1],
            city: row[2],
            id: row[3],
            startDate: row[4],
            salary: row[5]
          }));
        }
        
        if (isMounted) {
          setEmployees(listData);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    fetchEmployees();
    return () => { isMounted = false; };
  }, []);

  const { handleScroll, totalHeight, visibleItems } = useVirtualizer(
    employees,
    ITEM_HEIGHT,
    CONTAINER_HEIGHT
  );

  if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-600">Loading directory...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-600">Error: {error}</div>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-5xl px-4 py-12 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
            {employees.length} Records Loaded
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Virtualized Table Header */}
      <div className="flex px-6 py-4 text-sm font-semibold tracking-wider text-left text-gray-500 uppercase bg-gray-50 border border-b-0 border-gray-200 rounded-t-lg shadow-sm">
        <div className="flex-1">Employee</div>
        <div className="flex-1">Role</div>
        <div className="flex-1">Location</div>
        <div className="w-24 text-right">Actions</div>
      </div>

      {/* Virtualized Container */}
      <div 
        onScroll={handleScroll}
        className="relative overflow-y-auto bg-white border border-gray-200 shadow-sm rounded-b-lg scroll-smooth"
        style={{ height: `${CONTAINER_HEIGHT}px` }}
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {visibleItems.map(({ item, index, style }) => (
             <div 
               key={item.id || index} 
               style={style} 
               className={`flex items-center px-6 border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}
             >
                <div className="flex-1 truncate">
                  <p className="font-semibold text-gray-900 truncate">{item.name || `Employee ${item.id || index}`}</p>
                  <p className="text-sm text-gray-500 truncate">{item.id ? `ID: ${item.id}` : 'No ID Available'}</p>
                </div>
                <div className="flex-1 truncate text-gray-700">{item.role || 'N/A'}</div>
                <div className="flex-1 truncate text-gray-600">{item.city || 'N/A'}</div>
                <div className="w-24 text-right">
                  <button 
                    onClick={() => navigate(`/details/${item.id || index}`)}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    Verify
                  </button>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeListPage;