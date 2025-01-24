import React, { useState, useEffect } from 'react';
import { FaSave, FaEdit, FaTrash } from 'react-icons/fa';  // React Icons for save, edit, delete
import { motion } from 'framer-motion';  // Framer Motion for animations

function CustomKanban() {
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [editNote, setEditNote] = useState(null);  // State to manage the note being edited
  const [newContent, setNewContent] = useState('');

  // Fetch notes from API on initial load
  useEffect(() => {
    fetchNotes();
  }, []);

  // Fetch notes from API
  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  // Add a new note (sending to backend)
  const addNote = async () => {
    if (noteContent.trim()) {
      const newNote = { content: noteContent };
      try {
        const response = await fetch('http://localhost:5001/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNote),
        });
        const data = await response.json();
        setNotes([...notes, data]);
        setNoteContent('');
      } catch (error) {
        console.error('Error saving note:', error);
      }
    }
  };

  // Delete note (sending to backend)
  const deleteNote = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/notes/${id}`, { method: 'DELETE' });
      setNotes(notes.filter((note) => note._id !== id)); // Using _id from MongoDB
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Update note (sending to backend)
  const updateNote = async () => {
    if (newContent.trim()) {
      try {
        const response = await fetch(`http://localhost:5001/api/notes/${editNote._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newContent }),
        });
        const updatedNote = await response.json();
        setNotes(notes.map((note) => (note._id === updatedNote._id ? updatedNote : note)));
        setEditNote(null); // Close the modal
        setNewContent('');
      } catch (error) {
        console.error('Error updating note:', error);
      }
    }
  };

  // Handle modal close
  const closeModal = () => {
    setEditNote(null);
    setNewContent('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center font-sans">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center mb-8 w-full"
      >
        <h1 className="text-4xl font-extrabold text-indigo-600">Elastomech Notepad</h1>
        <p className="text-lg text-gray-600 mt-2">Efficiently manage your notes and ideas</p>
      </motion.header>

      {/* Notepad Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-lg p-8 bg-white shadow-xl rounded-xl mb-8 border border-indigo-300"
      >
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4"
          placeholder="Write your note here..."
        />
        <button
          onClick={addNote}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out"
        >
          <FaSave className="mr-3 inline-block" /> Save Note
        </button>
      </motion.div>

      {/* Notes Table */}
      <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}
  className="w-full max-w-3xl p-6 bg-white shadow-xl rounded-xl border border-indigo-300"
>
  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Saved Notes</h2>

  {/* Wrapper for horizontal scrolling */}
  <div className="overflow-x-auto">
    <table className="min-w-full table-auto text-left border-separate border-spacing-2">
      <thead>
        <tr className="bg-indigo-100 text-indigo-600">
          <th className="py-3 px-4 text-lg font-medium">#</th>
          <th className="py-3 px-4 text-lg font-medium">Content</th>
          <th className="py-3 px-4 text-lg font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {notes.map((note, index) => (
          <tr key={note._id} className="bg-gray-50 hover:bg-indigo-50 transition-colors duration-200">
            <td className="py-3 px-4">{index + 1}</td>
            <td className="py-3 px-4">
              {note.content.length > 60 ? `${note.content.substring(0, 60)}...` : note.content}
            </td>
            <td className="py-3 px-4 flex space-x-4 justify-center">
              <button
                onClick={() => deleteNote(note._id)}
                className="text-red-600 hover:text-red-800 transition-all duration-200 p-2 rounded-lg"
              >
                <FaTrash />
              </button>
              <button
                onClick={() => {
                  setEditNote(note); 
                  setNewContent(note.content);
                }}
                className="text-blue-600 hover:text-blue-800 transition-all duration-200 p-2 rounded-lg"
              >
                <FaEdit />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</motion.div>


      {/* Modal for Editing */}
      {editNote && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Note</h2>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4"
              placeholder="Edit your note..."
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={updateNote}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomKanban;
