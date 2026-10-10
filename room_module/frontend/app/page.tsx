'use client';

import { useEffect, useState, useMemo } from 'react';
import SvgMap from '@/components/SvgMap';

type AuthUser = { username: string; role: 'admin' | 'guest' } | null;

export default function SpaceAllocationApp() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('AB3');
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground Floor');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  // Auth state
  const [user, setUser] = useState<AuthUser>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Add-admin form (only for admins)
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [addAdminMsg, setAddAdminMsg] = useState('');

  // Check session on load
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setAuthLoading(false);
      })
      .catch(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    fetch('/all_spaces.json')
      .then((res) => res.json())
      .then((data) => {
        setSpaces(data);
        if (data.length > 0) {
          const buildings = Array.from(new Set(data.map((d: any) => d.sheet)));
          if (buildings.includes('AB3')) setSelectedBuilding('AB3');
          else setSelectedBuilding(buildings[0] as string);
        }
      });
  }, []);

  const buildings = useMemo(() => {
    return Array.from(new Set(spaces.map((s) => s.sheet)));
  }, [spaces]);

  const floors = useMemo(() => {
    const buildingSpaces = spaces.filter((s) => s.sheet === selectedBuilding);
    return Array.from(new Set(buildingSpaces.map((s) => s.floor)));
  }, [spaces, selectedBuilding]);

  useEffect(() => {
    if (floors.length > 0 && !floors.includes(selectedFloor)) {
      setSelectedFloor(floors[0]);
    }
  }, [floors, selectedFloor]);

  const currentRooms = useMemo(() => {
    return spaces.filter((s) => {
      const matchBuilding = s.sheet === selectedBuilding;
      const matchFloor = s.floor === selectedFloor;
      const matchSearch =
        s.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.allocation && s.allocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.type && s.type.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchBuilding && matchFloor && matchSearch;
    });
  }, [spaces, selectedBuilding, selectedFloor, searchQuery]);

  const getTypeBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'office':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'classroom':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'lab':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'utility':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Login failed');
      } else {
        setUser(data.user);
        setShowLogin(false);
        setLoginUser('');
        setLoginPass('');
      }
    } catch {
      setLoginError('Network error');
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminMsg('');
    try {
      const res = await fetch('/api/auth/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newAdminUser, password: newAdminPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddAdminMsg(data.error || 'Failed');
      } else {
        setAddAdminMsg(data.message);
        setNewAdminUser('');
        setNewAdminPass('');
      }
    } catch {
      setAddAdminMsg('Network error');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      {/* Header */}
      <header className="mb-6 border-b pb-4 flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">IITGN Academic Block Space Allocation</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switch */}
          <div className="flex bg-slate-200 rounded-lg p-1 text-sm font-medium">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Visual Layout
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Data Table
            </button>
          </div>

          {/* Auth controls */}
          {!authLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    {user.username}
                    <span
                      className={`ml-1 text-xs px-1.5 py-0.5 rounded ${isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {user.role}
                    </span>
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddAdmin(true)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 border px-2 py-1 rounded"
                    >
                      + Admin
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-slate-800 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-900"
                >
                  Login
                </button>
              )}
            </>
          )}
        </div>
      </header>

      {/* Building Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-4 border-b">
        {buildings.map((b) => (
          <button
            key={b}
            onClick={() => setSelectedBuilding(b)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${selectedBuilding === b
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border text-slate-700 hover:bg-slate-100'
              }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-600">Floor:</span>
          <div className="flex space-x-1">
            {floors.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFloor(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${selectedFloor === f
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Search room, allocation, type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Visual Layout */}
      {viewMode === 'grid' && (
        <SvgMap
          rooms={currentRooms}
          building={selectedBuilding}
          floor={selectedFloor}
          onRoomClick={(room) => setSelectedRoom(room)}
          isAdmin={isAdmin}
        />
      )}

      {/* Data Table */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 border-b">
              <tr>
                <th className="p-3">Room</th>
                <th className="p-3">Type</th>
                <th className="p-3">Allocation</th>
                <th className="p-3">Intended Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentRooms.map((room, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold">{room.room}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${getTypeBadgeColor(room.type)}`}
                    >
                      {room.type || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-800">{room.allocation}</td>
                  <td className="p-3 text-slate-500 italic">{room.intended_allocation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold">Room Details: {selectedRoom.room}</h2>
            </div>
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-slate-600">Building:</strong> {selectedRoom.sheet}
              </p>
              <p>
                <strong className="text-slate-600">Floor:</strong> {selectedRoom.floor}
              </p>
              <p>
                <strong className="text-slate-600">Type:</strong> {selectedRoom.type}
              </p>
              <p>
                <strong className="text-slate-600">Allocation:</strong> {selectedRoom.allocation}
              </p>
              {selectedRoom.intended_allocation && (
                <p className="bg-amber-50 text-amber-900 p-2 rounded border border-amber-200">
                  <strong>Intended Allocation:</strong> {selectedRoom.intended_allocation}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedRoom(null)}
              className="mt-6 w-full bg-slate-800 text-white py-2 rounded-lg font-medium hover:bg-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {loginLoading ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
            <p className="mt-4 text-xs text-slate-500">
              Default admin: <strong>admin</strong> / <strong>admin123</strong>
              <br />
              Change this password after first login by editing data/users.json or adding a new admin and deleting the old one.
            </p>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowAddAdmin(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Add New Admin</h2>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newAdminUser}
                  onChange={(e) => setNewAdminUser(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
              {addAdminMsg && (
                <p className={`text-sm ${addAdminMsg.includes('created') ? 'text-green-600' : 'text-red-600'}`}>
                  {addAdminMsg}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Create Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAdmin(false);
                    setAddAdminMsg('');
                  }}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
