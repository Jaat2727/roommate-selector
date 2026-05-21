import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { initialRooms } from './data';
import { supabase } from './supabaseClient';
import { FiEdit2, FiCheck, FiDownload, FiUsers, FiHome, FiMaximize2 } from 'react-icons/fi';

export default function App() {
  const [students, setStudents] = useState([]);
  const [rooms] = useState(initialRooms);
  
  useEffect(() => {
    fetchStudents();
    
    const channel = supabase
      .channel('public:students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, payload => {
        fetchStudents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('id');
    if (data && data.length > 0) setStudents(data);
  };
  
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRoll, setEditRoll] = useState("");

  const unassignedStudents = students.filter(s => s.room === null);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const destRoom = destination.droppableId === "unassigned" ? null : destination.droppableId;

    if (destRoom !== null) {
      const roomStudents = students.filter(s => s.room === destRoom);
      if (roomStudents.length >= 2 && source.droppableId !== destination.droppableId) {
        alert("This room is full! Maximum capacity is 2.");
        return;
      }
    }

    setStudents(prev => prev.map(student => 
      student.id === draggableId ? { ...student, room: destRoom } : student
    ));

    await supabase.from('students').update({ room: destRoom }).eq('id', draggableId);
  };

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditRoll(student.roll);
  };

  const saveEdit = async (id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, name: editName, roll: editRoll } : s));
    setEditingId(null);
    await supabase.from('students').update({ name: editName, roll: editRoll }).eq('id', id);
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
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-blue-50 to-purple-100 p-3 md:p-6 font-sans">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-white">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight">
              Roommate Selector
            </h1>
            <p className="text-slate-600 mt-1 font-medium text-sm md:text-base flex items-center gap-2">
              <FiMaximize2 className="text-blue-500" />
              Drag and drop to assign rooms. Max 2 students per room.
            </p>
          </div>
          <button 
            onClick={exportData}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <FiDownload className="text-lg" /> Export JSON
          </button>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Unassigned Column - 25% width on large screens */}
            <div className="lg:col-span-4 xl:col-span-3 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-sm border border-white/80 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
              <div className="p-4 bg-gradient-to-b from-white/90 to-white/40 border-b border-slate-200/60 shrink-0">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <FiUsers size={18} />
                    </div>
                    Unassigned
                  </span>
                  <span className="bg-white shadow-sm border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm">
                    {unassignedStudents.length}
                  </span>
                </h2>
              </div>
              
              <Droppable droppableId="unassigned">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 overflow-y-auto transition-all duration-300 ${
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
                            className={`mb-3 bg-white p-3 md:p-4 rounded-2xl border-2 ${
                              snapshot.isDragging 
                                ? 'border-blue-500 shadow-xl scale-[1.02] rotate-1 z-50' 
                                : 'border-transparent shadow-sm hover:shadow hover:border-blue-100'
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
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 min-h-[200px]">
                        <FiCheck size={40} className="mb-3 text-green-400" />
                        <p className="font-semibold">All assigned!</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Rooms Grid - 75% width on large screens */}
            <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 overflow-y-auto h-[calc(100vh-180px)] pr-2 pb-6 scrollbar-hide content-start">
              {rooms.map(room => {
                const roomStudents = students.filter(s => s.room === room.id);
                const isFull = roomStudents.length >= room.capacity;

                return (
                  <div key={room.id} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white/80 flex flex-col hover:shadow-md transition-all duration-300 group relative">
                    {/* Header */}
                    <div className={`p-3 md:p-4 border-b flex justify-between items-center transition-colors duration-300 relative overflow-hidden shrink-0 rounded-t-3xl ${
                      isFull ? 'bg-rose-50/90 border-rose-100' : 'bg-gradient-to-b from-white/90 to-white/40 border-slate-100'
                    }`}>
                      {isFull && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>}
                      <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isFull ? 'bg-rose-200 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          <FiHome size={16} />
                        </div>
                        {room.name}
                      </h3>
                      <div className={`flex items-center justify-center px-3 py-1 rounded-lg font-bold text-xs md:text-sm ${
                        isFull ? 'bg-rose-500 text-white shadow-sm' : 'bg-white text-slate-600 shadow-sm border border-slate-200'
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
                          className={`flex-1 p-3 md:p-4 min-h-[140px] rounded-b-3xl transition-all duration-300 ${
                            snapshot.isDraggingOver 
                              ? (isFull ? 'bg-rose-50/80 ring-inset ring-2 ring-rose-300/50' : 'bg-indigo-50/80 ring-inset ring-2 ring-indigo-400/50') 
                              : 'bg-slate-50/40'
                          }`}
                        >
                          {roomStudents.map((student, index) => (
                            <Draggable key={student.id} draggableId={student.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-3 bg-white p-3 md:p-4 rounded-xl border-2 ${
                                    snapshot.isDragging ? 'border-indigo-500 shadow-xl scale-[1.02] z-50' : 'border-transparent shadow-sm hover:shadow hover:border-indigo-100'
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
                            <div className="h-full w-full flex items-center justify-center min-h-[100px]">
                              <div className="text-slate-400 text-sm font-medium border-2 border-dashed border-slate-300/60 rounded-xl w-full h-full min-h-[100px] flex flex-col items-center justify-center opacity-60 hover:opacity-100 hover:border-indigo-300 transition-all duration-300 bg-white/20">
                                <span className="text-lg mb-0.5">+</span>
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
      <div className="flex flex-col gap-2">
        <div>
          <input 
            type="text" 
            value={editName} 
            onChange={(e) => setEditName(e.target.value)}
            className="w-full border border-indigo-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            autoFocus
            placeholder="Name"
          />
        </div>
        <div>
          <input 
            type="text" 
            value={editRoll} 
            onChange={(e) => setEditRoll(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Roll No"
          />
        </div>
        <button 
          onClick={() => saveEdit(student.id)}
          className="mt-1 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg flex justify-center items-center gap-1.5 font-bold text-xs transition-all shadow-sm"
        >
          <FiCheck size={14} /> Save
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-start gap-2">
      <div className="min-w-0"> {/* min-w-0 ensures text truncation works if needed */}
        <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight break-words">{student.name}</h4>
        <p className="text-[11px] md:text-xs text-slate-500 mt-1.5 font-bold bg-slate-100/80 border border-slate-200 inline-block px-2 py-0.5 rounded-md tracking-wide">
          {student.roll}
        </p>
      </div>
      <button 
        onClick={() => startEdit(student)}
        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
        title="Edit student"
      >
        <FiEdit2 size={16} />
      </button>
    </div>
  );
}
