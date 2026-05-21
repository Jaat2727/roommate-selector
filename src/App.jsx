import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { initialStudents, initialRooms } from './data';
import { FiEdit2, FiCheck, FiDownload, FiUsers, FiHome, FiMaximize2 } from 'react-icons/fi';

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
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-blue-50 to-purple-100 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight">
              Roommate Selector
            </h1>
            <p className="text-slate-600 mt-2 font-medium text-lg flex items-center gap-2">
              <FiMaximize2 className="text-blue-500" />
              Drag and drop to assign rooms. Maximum 2 students per room.
            </p>
          </div>
          <button 
            onClick={exportData}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 active:translate-y-0"
          >
            <FiDownload className="text-xl" /> Export JSON
          </button>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Unassigned Column */}
            <div className="xl:col-span-1 bg-white/60 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 flex flex-col h-[calc(100vh-220px)] overflow-hidden">
              <div className="p-6 bg-gradient-to-b from-white/90 to-white/40 border-b border-slate-200/60">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                      <FiUsers size={22} />
                    </div>
                    Unassigned
                  </span>
                  <span className="bg-white shadow-sm border border-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-base">
                    {unassignedStudents.length}
                  </span>
                </h2>
              </div>
              
              <Droppable droppableId="unassigned">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-5 overflow-y-auto transition-all duration-300 ${
                      snapshot.isDraggingOver ? 'bg-blue-50/80 ring-inset ring-2 ring-blue-400/50' : ''
                    }`}
                  >
                    {unassignedStudents.map((student, index) => (
                      <Draggable key={student.id} draggableId={student.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-4 bg-white p-5 rounded-2xl border-2 ${
                              snapshot.isDragging 
                                ? 'border-blue-500 shadow-2xl scale-[1.02] rotate-1 z-50' 
                                : 'border-transparent shadow-sm hover:shadow-md hover:border-blue-100'
                            } transition-all duration-200 cursor-grab active:cursor-grabbing`}
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
                    {unassignedStudents.length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <FiCheck size={48} className="mb-4 text-green-400" />
                        <p className="font-semibold text-lg">All students assigned!</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Rooms Grid */}
            <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 overflow-y-auto h-[calc(100vh-220px)] pr-2 pb-6 scrollbar-hide">
              {rooms.map(room => {
                const roomStudents = students.filter(s => s.room === room.id);
                const isFull = roomStudents.length >= room.capacity;

                return (
                  <div key={room.id} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden flex flex-col h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group relative">
                    {/* Header */}
                    <div className={`p-5 border-b-2 flex justify-between items-center transition-colors duration-300 relative overflow-hidden ${
                      isFull ? 'bg-rose-50/90 border-rose-100' : 'bg-gradient-to-b from-white/90 to-white/40 border-slate-100'
                    }`}>
                      {isFull && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>}
                      <h3 className="font-extrabold text-slate-800 text-xl flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isFull ? 'bg-rose-200 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          <FiHome size={20} />
                        </div>
                        {room.name}
                      </h3>
                      <div className={`flex items-center justify-center w-12 h-8 rounded-xl font-bold text-sm ${
                        isFull ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white text-slate-600 shadow-sm border border-slate-200'
                      }`}>
                        {roomStudents.length}/{room.capacity}
                      </div>
                    </div>
                    
                    {/* Droppable Area */}
                    <Droppable droppableId={room.id} isDropDisabled={isFull}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-5 min-h-[180px] transition-all duration-300 ${
                            snapshot.isDraggingOver 
                              ? (isFull ? 'bg-rose-50/80 ring-inset ring-2 ring-rose-300/50' : 'bg-indigo-50/80 ring-inset ring-2 ring-indigo-400/50') 
                              : 'bg-slate-50/30'
                          }`}
                        >
                          {roomStudents.map((student, index) => (
                            <Draggable key={student.id} draggableId={student.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-4 bg-white p-5 rounded-2xl border-2 ${
                                    snapshot.isDragging ? 'border-indigo-500 shadow-2xl scale-[1.05] z-50' : 'border-transparent shadow hover:shadow-md hover:border-indigo-100'
                                  } transition-all duration-200 cursor-grab active:cursor-grabbing`}
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
                          
                          {/* Empty State */}
                          {roomStudents.length === 0 && !snapshot.isDraggingOver && (
                            <div className="h-full flex items-center justify-center pb-2">
                              <div className="text-slate-400 text-base font-medium border-2 border-dashed border-slate-300/70 rounded-2xl w-full h-full min-h-[120px] flex flex-col items-center justify-center opacity-70 group-hover:opacity-100 group-hover:border-indigo-300 transition-all duration-300 bg-white/30">
                                <span className="mb-1 text-2xl">+</span>
                                Drop here
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
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
          <input 
            type="text" 
            value={editName} 
            onChange={(e) => setEditName(e.target.value)}
            className="w-full border-2 border-indigo-200 rounded-xl px-3 py-2 text-base font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
            autoFocus
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Roll No</label>
          <input 
            type="text" 
            value={editRoll} 
            onChange={(e) => setEditRoll(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <button 
          onClick={() => saveEdit(student.id)}
          className="mt-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl flex justify-center items-center gap-2 font-bold transition-all shadow-lg shadow-green-500/30"
        >
          <FiCheck size={18} /> Save Details
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-start">
      <div className="pr-2">
        <h4 className="font-extrabold text-slate-800 text-[17px] leading-snug">{student.name}</h4>
        <p className="text-sm text-slate-600 mt-2 font-bold bg-slate-100/80 border border-slate-200 inline-block px-2.5 py-1 rounded-lg tracking-wide">
          {student.roll}
        </p>
      </div>
      <button 
        onClick={() => startEdit(student)}
        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:ring-2 focus:ring-indigo-500"
        title="Edit student"
      >
        <FiEdit2 size={18} />
      </button>
    </div>
  );
}
