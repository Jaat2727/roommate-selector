import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { initialStudents, initialRooms } from './data';
import { FiEdit2, FiCheck, FiDownload } from 'react-icons/fi';
// import { supabase } from './supabaseClient'; // Ready for when MCP token is fixed

export default function App() {
  const [students, setStudents] = useState(initialStudents);
  const [rooms] = useState(initialRooms);
  
  // State for editing a student
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRoll, setEditRoll] = useState("");

  const unassignedStudents = students.filter(s => s.room === null);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Check capacity if moving to a room
    if (destination.droppableId !== "unassigned") {
      const roomStudents = students.filter(s => s.room === destination.droppableId);
      if (roomStudents.length >= 2 && source.droppableId !== destination.droppableId) {
        alert("This room is full! Maximum capacity is 2.");
        return;
      }
    }

    setStudents(prev => {
      return prev.map(student => {
        if (student.id === draggableId) {
          return {
            ...student,
            room: destination.droppableId === "unassigned" ? null : destination.droppableId
          };
        }
        return student;
      });
    });
  };

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditRoll(student.roll);
  };

  const saveEdit = (id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, name: editName, roll: editRoll } : s));
    setEditingId(null);
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "roommate_selection.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Roommate Selection Portal
            </h1>
            <p className="text-slate-500 mt-2">Drag and drop to assign rooms. Max 2 per room.</p>
          </div>
          <button 
            onClick={exportData}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
          >
            <FiDownload /> Export JSON
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Unassigned Column */}
            <div className="lg:col-span-1 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 overflow-hidden flex flex-col h-[calc(100vh-160px)]">
              <div className="p-5 bg-white/60 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Unassigned ({unassignedStudents.length})</h2>
              </div>
              <Droppable droppableId="unassigned">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 overflow-y-auto transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    {unassignedStudents.map((student, index) => (
                      <Draggable key={student.id} draggableId={student.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 bg-white p-4 rounded-xl border ${
                              snapshot.isDragging ? 'border-blue-400 shadow-2xl scale-105 z-50' : 'border-slate-100 shadow-sm hover:shadow-md'
                            } transition-all duration-200 group cursor-grab active:cursor-grabbing`}
                          >
                            <StudentCard 
                              student={student} 
                              editingId={editingId}
                              editName={editName}
                              editRoll={editRoll}
                              setEditName={setEditName}
                              setEditRoll={setEditRoll}
                              startEdit={startEdit}
                              saveEdit={saveEdit}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Rooms Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 overflow-y-auto h-[calc(100vh-160px)] pr-2 pb-4 scrollbar-hide">
              {rooms.map(room => {
                const roomStudents = students.filter(s => s.room === room.id);
                const isFull = roomStudents.length >= room.capacity;

                return (
                  <div key={room.id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
                    <div className={`p-4 border-b flex justify-between items-center transition-colors duration-300 ${isFull ? 'bg-red-50/80 border-red-100' : 'bg-white/60 border-slate-100'}`}>
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                          {room.id.replace('room-', '')}
                        </span>
                        {room.name}
                      </h3>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {roomStudents.length} / {room.capacity}
                      </span>
                    </div>
                    
                    <Droppable droppableId={room.id} isDropDisabled={isFull}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-4 min-h-[160px] transition-colors duration-300 ${
                            snapshot.isDraggingOver ? (isFull ? 'bg-red-50/50' : 'bg-blue-50/50') : 'bg-slate-50/30'
                          }`}
                        >
                          {roomStudents.map((student, index) => (
                            <Draggable key={student.id} draggableId={student.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-3 bg-white p-4 rounded-xl border ${
                                    snapshot.isDragging ? 'border-blue-400 shadow-2xl scale-105 z-50' : 'border-slate-100 shadow hover:shadow-md'
                                  } transition-all duration-200 group cursor-grab active:cursor-grabbing`}
                                >
                                  <StudentCard 
                                    student={student} 
                                    editingId={editingId}
                                    editName={editName}
                                    editRoll={editRoll}
                                    setEditName={setEditName}
                                    setEditRoll={setEditRoll}
                                    startEdit={startEdit}
                                    saveEdit={saveEdit}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {roomStudents.length === 0 && !snapshot.isDraggingOver && (
                            <div className="h-full flex items-center justify-center">
                              <div className="text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl w-full h-full min-h-[100px] flex items-center justify-center opacity-60">
                                Drop student here
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

function StudentCard({ student, editingId, editName, editRoll, setEditName, setEditRoll, startEdit, saveEdit }) {
  if (editingId === student.id) {
    return (
      <div className="flex flex-col gap-2">
        <input 
          type="text" 
          value={editName} 
          onChange={(e) => setEditName(e.target.value)}
          className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          autoFocus
          placeholder="Name"
        />
        <input 
          type="text" 
          value={editRoll} 
          onChange={(e) => setEditRoll(e.target.value)}
          className="border border-blue-300 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Roll No"
        />
        <button 
          onClick={() => saveEdit(student.id)}
          className="bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded-lg flex justify-center items-center gap-1 font-medium transition-colors"
        >
          <FiCheck /> Save
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-semibold text-slate-800 text-sm leading-tight">{student.name}</h4>
        <p className="text-xs text-slate-500 mt-1 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded-md">{student.roll}</p>
      </div>
      <button 
        onClick={() => startEdit(student)}
        className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all"
        title="Edit details"
      >
        <FiEdit2 size={14} />
      </button>
    </div>
  );
}
