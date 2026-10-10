'use client';
import { useState, useEffect } from 'react';

export default function SvgMap({
  rooms,
  building,
  floor,
  onRoomClick,
  isAdmin = false,
}: {
  rooms: any[];
  building: string;
  floor: string;
  onRoomClick: (room: any) => void;
  isAdmin?: boolean;
}) {
  const [positions, setPositions] = useState<{ [key: string]: { x: number; y: number; w: number; h: number } }>({});

  // Interaction states
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [showBackground, setShowBackground] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load saved positions or fallback to matrix grid
  useEffect(() => {
    const loadPositions = async () => {
      try {
        const res = await fetch(`/layouts/${building}_${floor.replace(/\s+/g, '_')}.json`);
        if (res.ok) {
          const savedPositions = await res.json();
          // Ensure older saved files get default width/height
          Object.keys(savedPositions).forEach((key) => {
            if (!savedPositions[key].w) savedPositions[key].w = 100;
            if (!savedPositions[key].h) savedPositions[key].h = 70;
          });
          setPositions(savedPositions);
          return;
        }
      } catch (e) { }

      // Matrix fallback if no saved layout
      const newPositions: any = {};
      rooms.forEach((room, index) => {
        newPositions[room.room] = {
          x: (index % 5) * 140 + 50,
          y: Math.floor(index / 5) * 100 + 50,
          w: 100,
          h: 70,
        };
      });
      setPositions(newPositions);
    };

    loadPositions();
  }, [rooms, building, floor]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isAdmin) return; // Guests cannot move boxes

    if (dragging) {
      setHasDragged(true);
      setPositions((prev) => ({
        ...prev,
        [dragging]: {
          ...prev[dragging],
          x: prev[dragging].x + e.movementX,
          y: prev[dragging].y + e.movementY,
        },
      }));
    } else if (resizing) {
      setPositions((prev) => ({
        ...prev,
        [resizing]: {
          ...prev[resizing],
          w: Math.max(40, prev[resizing].w + e.movementX),
          h: Math.max(30, prev[resizing].h + e.movementY),
        },
      }));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const handleMouseDown = (roomId: string) => {
    if (!isAdmin) return;
    setDragging(roomId);
    setHasDragged(false);
  };

  const handleResizeDown = (roomId: string, e: React.MouseEvent) => {
    if (!isAdmin) return;
    e.stopPropagation();
    setResizing(roomId);
  };

  const handleRoomClick = (room: any) => {
    if (!hasDragged && !resizing) {
      onRoomClick(room);
    }
  };

  const saveLayout = async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/save_positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ building, floor, positions }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error || 'Save failed');
      }
    } catch {
      setSaveError('Network error while saving');
    }
    setTimeout(() => setIsSaving(false), 1000);
  };

  const bgImagePath = `/${building.toLowerCase()}_floorplan.png`;

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex space-x-2 items-center">
        <button
          onClick={() => setShowBackground(!showBackground)}
          className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition"
        >
          {showBackground ? 'Hide Blueprint' : 'Show Blueprint'}
        </button>

        {isAdmin ? (
          <button
            onClick={saveLayout}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md transition"
          >
            {isSaving ? 'Saved!' : 'Save Layout'}
          </button>
        ) : (
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border">
            Guest view – login as admin to edit
          </span>
        )}
      </div>

      {saveError && (
        <div className="absolute top-16 right-4 z-10 bg-red-100 text-red-800 text-sm px-3 py-2 rounded border border-red-300">
          {saveError}
        </div>
      )}

      <div
        className={`w-full h-175 bg-slate-100 rounded-xl border-2 border-slate-300 overflow-hidden relative select-none ${isAdmin ? 'cursor-crosshair' : 'cursor-default'
          }`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg width="100%" height="100%" className="absolute inset-0">
          {showBackground && (
            <image
              href={bgImagePath}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              className="opacity-40 pointer-events-none"
            />
          )}

          {rooms.map((room) => {
            const pos = positions[room.room] || { x: 0, y: 0, w: 100, h: 70 };
            const isDragging = dragging === room.room;
            const isResizing = resizing === room.room;
            const isActive = isDragging || isResizing;

            return (
              <g
                key={room.room}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseDown={() => handleMouseDown(room.room)}
                onClick={() => handleRoomClick(room)}
                className={isAdmin ? 'cursor-grab active:cursor-grabbing group' : 'cursor-pointer group'}
              >
                <rect
                  width={pos.w}
                  height={pos.h}
                  rx="6"
                  fill={isActive ? '#93c5fd' : 'rgba(255, 255, 255, 0.9)'}
                  stroke={isActive ? '#2563eb' : '#64748b'}
                  strokeWidth="2"
                  className="transition-colors duration-75 hover:stroke-blue-500"
                />

                <foreignObject x="0" y="0" width={pos.w} height={pos.h} className="pointer-events-none">
                  <div className="w-full h-full flex flex-col items-center justify-center p-1 overflow-hidden text-center">
                    <span className="text-sm font-bold text-slate-800 truncate w-full">{room.room}</span>
                    {pos.h > 45 && (
                      <span className="text-[10px] text-slate-600 truncate w-full">
                        {room.type ? room.type : 'Unk'}
                      </span>
                    )}
                  </div>
                </foreignObject>

                {/* Resize handle – only for admins */}
                {isAdmin && (
                  <circle
                    cx={pos.w}
                    cy={pos.h}
                    r="6"
                    className="fill-white stroke-blue-500 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => handleResizeDown(room.room, e)}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
