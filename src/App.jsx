import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from './supabaseClient';
import { FiEdit2, FiCheck, FiDownload, FiUsers, FiHome, FiMaximize2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';

export default function App() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    fetchStudents();
    fetchRooms();
    
    const channel = supabase
      .channel('public_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, payload => {
        fetchStudents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, payload => {
        fetchRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('id');
    if (data) setStudents(data);
  };

  const fetchRooms = async () => {
    const { data } = await supabase.from('rooms').select('*').order('id');
    if (data) setRooms(data);
  };
  
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRoll, setEditRoll] = useState("");

  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editRoomName, setEditRoomName] = useState("");

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
      const targetRoom = rooms.find(r => r.id === destRoom);
      const capacity = targetRoom ? targetRoom.capacity : 2;
      
      if (roomStudents.length >= capacity && source.droppableId !== destination.droppableId) {
        alert(`This room is full! Maximum capacity is ${capacity}.`);
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

  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(prev => prev.filter(s => s.id !== id));
      await supabase.from('students').delete().eq('id', id);
    }
  };

  const startEditRoom = (room) => {
    setEditingRoomId(room.id);
    setEditRoomName(room.name);
  };

  const saveEditRoom = async (id) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, name: editRoomName } : r));
    setEditingRoomId(null);
    await supabase.from('rooms').update({ name: editRoomName }).eq('id', id);
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
      {isModalOpen && (
        <SpreadsheetModal 
          students={students} 
          setStudents={setStudents} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-white">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight">
              Roommate Selector
            </h1>
            <p className="text-slate-600 mt-1 font-medium text-sm md:text-base flex items-center gap-2">
              <FiMaximize2 className="text-blue-500" />
              Drag and drop to assign rooms.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
            >
              <FiUsers className="text-lg text-blue-600" /> Manage Roster
            </button>
            <button 
              onClick={exportData}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <FiDownload className="text-lg" /> Export JSON
            </button>
          </div>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Unassigned Column */}
            <div className="lg:col-span-4 xl:col-span-3 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-sm border border-white/80 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
              <div className="p-4 bg-gradient-to-b from-white/90 to-white/40 border-b border-slate-200/60 shrink-0 flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center justify-between flex-1">
                  <span className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <FiUsers size={18} />
                    </div>
                    Student List
                  </span>
                  <span className="bg-white shadow-sm border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm mr-2">
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
                              deleteStudent={deleteStudent}
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

            {/* Rooms Grid */}
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
                      
                      {editingRoomId === room.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input 
                            type="text" 
                            value={editRoomName}
                            onChange={e => setEditRoomName(e.target.value)}
                            className="w-full text-lg font-extrabold bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                            onKeyDown={e => { if(e.key === 'Enter') saveEditRoom(room.id) }}
                          />
                          <button onClick={() => saveEditRoom(room.id)} className="p-2 bg-green-500 text-white rounded hover:bg-green-600">
                            <FiCheck />
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2 flex-1">
                          <div className={`p-1.5 rounded-lg ${isFull ? 'bg-rose-200 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            <FiHome size={16} />
                          </div>
                          {room.name}
                          <button 
                            onClick={() => startEditRoom(room)}
                            className="text-slate-400 hover:text-indigo-600 ml-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiEdit2 size={14} />
                          </button>
                        </h3>
                      )}
                      
                      {!editingRoomId && (
                        <div className={`flex items-center justify-center px-3 py-1 rounded-lg font-bold text-xs md:text-sm ${
                          isFull ? 'bg-rose-500 text-white shadow-sm' : 'bg-white text-slate-600 shadow-sm border border-slate-200'
                        }`}>
                          {roomStudents.length}/{room.capacity}
                        </div>
                      )}
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
                                    deleteStudent={deleteStudent}
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

function SpreadsheetModal({ students, onClose, setStudents }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRoll, setEditRoll] = useState("");

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

  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student entirely from the roster?")) {
      setStudents(prev => prev.filter(s => s.id !== id));
      await supabase.from('students').delete().eq('id', id);
    }
  };

  const addStudent = async () => {
    const newId = Date.now().toString();
    const newStudent = { id: newId, name: 'New Student', roll: 'ROLL', room: null };
    setStudents(prev => [...prev, newStudent]);
    await supabase.from('students').insert(newStudent);
    startEdit(newStudent);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/20">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiUsers size={18} /></div>
            Manage Roster
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors">
            <FiX size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0 scrollbar-hide bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">S.No</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Full Name</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Roll Number</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-4 text-slate-500 text-sm font-medium">{idx + 1}</td>
                  <td className="p-4">
                    {editingId === student.id ? (
                      <input 
                        type="text" 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full border-2 border-indigo-200 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        autoFocus
                        onKeyDown={e => { if(e.key === 'Enter') saveEdit(student.id) }}
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{student.name}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === student.id ? (
                      <input 
                        type="text" 
                        value={editRoll}
                        onChange={e => setEditRoll(e.target.value)}
                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        onKeyDown={e => { if(e.key === 'Enter') saveEdit(student.id) }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{student.roll}</span>
                    )}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2 items-center h-full">
                    {editingId === student.id ? (
                      <button onClick={() => saveEdit(student.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-green-600 hover:-translate-y-0.5 transition-all shadow-sm">
                        <FiCheck size={14}/> Save
                      </button>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={() => startEdit(student)} className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => deleteStudent(student.id)} className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400 font-medium">
                    No students found. Add one below!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex justify-between items-center rounded-b-3xl">
          <p className="text-sm font-bold text-slate-500">Total count: {students.length}</p>
          <button 
            onClick={addStudent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <FiPlus size={16} /> Add Row
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentCard({ student, editingId, editName, editRoll, setEditName, setEditRoll, startEdit, saveEdit, deleteStudent }) {
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
        <div className="flex gap-2 mt-1">
          <button 
            onClick={() => saveEdit(student.id)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg flex justify-center items-center gap-1.5 font-bold text-xs transition-all shadow-sm"
          >
            <FiCheck size={14} /> Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-start gap-2">
      <div className="min-w-0"> 
        <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight break-words">{student.name}</h4>
        <p className="text-[11px] md:text-xs text-slate-500 mt-1.5 font-bold bg-slate-100/80 border border-slate-200 inline-block px-2 py-0.5 rounded-md tracking-wide">
          {student.roll}
        </p>
      </div>
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => startEdit(student)}
          className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors shrink-0"
          title="Edit student"
        >
          <FiEdit2 size={14} />
        </button>
      </div>
    </div>
  );
}
