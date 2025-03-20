import React, { useContext, useEffect, useState, useRef } from 'react';
import noteContext from '../context/notes/NoteContext';
import NoteItem from './NoteItem';
import { useNavigate } from 'react-router-dom';
import Addnote from './Addnote';
import NoteUpdateModal from './NoteUpdateModal';

const Notes = (props) => {
  const { notes, getNotes, editNote } = useContext(noteContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      getNotes();
    }
  }, [getNotes, navigate]);

  const modalRef = useRef(null);

  const [currentNote, setCurrentNote] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("✨ All");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortCriteria, setSortCriteria] = useState("modifiedDate");
  const [sortOrder, setSortOrder] = useState("desc");

  // Sort the notes based on the selected criteria and order
  const sortedNotes = notes.sort((a, b) => {
    const dateA = new Date(a[sortCriteria] || a.date);
    const dateB = new Date(b[sortCriteria] || b.date);
    return sortOrder === "old" ? dateA - dateB : dateB - dateA;
  });

  const toggleModal = () => {
    modalRef.current.classList.toggle('hidden');
  };

  const updateNote = (note) => {
    setCurrentNote(note);
    toggleModal();
  };

  // Category & Tag Data
  const categories = {
    "✨ All": [],
    "📚 General": ["General", "Note", "Task", "Ideas"],
    "📂 Work": ["Meetings", "Projects", "Work"],
    "🏡 Personal": ["Reading", "Poem", "Shayari", "Thought"],
    "💰 Future": ["Budgeting", "Future Plans", "Goals"]
  };

  return (
    <>
      <Addnote showAlert={props.showAlert} />

      <NoteUpdateModal
        modalRef={modalRef}
        currentNote={currentNote}
        categories={categories}
        editNote={editNote}
        showAlert={props.showAlert}
        toggleModal={toggleModal}
      />

      {/* Notes Section */}
      <div className="bg-[#0A1122] p-4 rounded-xl shadow-lg">
        <h1 className="text-white text-3xl font-semibold mb-2">Your Notes</h1>

        {/* Category Selection */}
        {notes.length > 1 && (
          <div className="flex gap-2 mb-3 overflow-x-auto whitespace-nowrap scrollbar-hide px-0">
            {Object.keys(categories)
              .filter(category => category === "✨ All" || notes.some(note => categories[category].includes(note.tag)))
              .map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedTag(""); // Reset tag when category changes
                  }}
                  className={`px-4 py-2 text-sm rounded-full border transition-all duration-300 ${selectedCategory === category
                    ? "bg-[#FFD252] text-black border-[#FFD252] shadow-md"
                    : "bg-[#1E293B] text-white border-gray-600 hover:border-white hover:bg-[#374151]"
                    }`}
                >
                  {category}
                </button>
              ))}
          </div>
        )}

        {/* Tag Selection (Subcategories) */}
        {categories[selectedCategory]?.length > 1 && notes.some(note => categories[selectedCategory].includes(note.tag)) && (
          <div className="flex gap-2 mb-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {categories[selectedCategory]
              .filter(tag => notes.some(note => note.tag === tag))
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-all duration-300 ${selectedTag === tag
                    ? "bg-[#FFD252] text-black border-[#FFD252] shadow-md"
                    : "bg-[#1E293B] text-white border-gray-600 hover:border-white hover:bg-[#374151]"
                    }`}
                >
                  {tag}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Sorting Options */}
      <div className="flex gap-2 mb-3">
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
          className="px-4 py-2 text-sm rounded-full border bg-[#1E293B] text-white border-gray-600 hover:border-white hover:bg-[#374151]"
        >
          <option value="modifiedDate">Modified Date</option>
          <option value="date">Created Date</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-2 text-sm rounded-full border bg-[#1E293B] text-white border-gray-600 hover:border-white hover:bg-[#374151]"
        >
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
        </select>
      </div>

      {/* Notes List */}
      <div className="flex flex-wrap text-white gap-3 mt-4">
        {notes
          .filter((note) => {
            if (selectedCategory !== "✨ All") {
              const categoryTags = categories[selectedCategory];
              if (!categoryTags.includes(note.tag)) return false;
            }
            if (selectedTag && note.tag !== selectedTag) return false;
            return true;
          })
          .map((note) => (
            <NoteItem key={note._id} showAlert={props.showAlert} updateNote={updateNote} note={note} />
          ))}

        {/* Show message if no notes are found */}
        {notes.filter((note) => {
          if (selectedCategory !== "✨ All") {
            const categoryTags = categories[selectedCategory];
            if (!categoryTags.includes(note.tag)) return false;
          }
          if (selectedTag && note.tag !== selectedTag) return false;
          return true;
        }).length === 0 && <p>No Notes To Display</p>}
      </div>
    </>
  );
};

export default Notes;