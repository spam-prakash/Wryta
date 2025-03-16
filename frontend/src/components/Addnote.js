import React, { useContext, useState, useRef } from 'react';
import noteContext from '../context/notes/NoteContext';

const Addnote = (props) => {
  const context = useContext(noteContext);
  // eslint-disable-next-line
  const { addNote } = context;

  const [note, setNote] = useState({ title: '', description: '', tag: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  const descriptionRef = useRef(null);

  // Category and Tag Mapping
  const categories = {
    "General Productivity": ["General","Note", "Task", "Ideas"],
    "Work & Study": ["Work", "Meetings", "Projects"],
    "Personal & Creative": ["Reading","Thought", "Poem", "Shayari"],
    "Future & Planning": ["Future Plans", "Goals", "Budgeting"],
  };

  const handleClick = (e) => {
    e.preventDefault();
    addNote(note.title, note.description, note.tag);
    setNote({ title: '', description: '', tag: '' });
    props.showAlert('Successfully added !', '#D4EDDA')
    setSelectedCategory('');

    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
    }
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setSelectedCategory(selected);
    setNote({ ...note, tag: '' }); // Reset tag when category changes
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    const maxHeight = e.target.scrollHeight > e.target.clientHeight ? e.target.scrollHeight : e.target.clientHeight;
    e.target.style.height = Math.min(maxHeight, 10 * parseFloat(getComputedStyle(e.target).lineHeight)) + 'px';
  };

  return (
    <div className='add mt-[6.5rem]'>
      <h1 className="text-white text-3xl font-['Open_sans'] font-bold mb-2 mx-4">
        Add a Note
      </h1>
      <form className='bg-[#0a1122] w-auto shadow-2xl rounded px-8 pt-6 pb-8 mb-4'>
        <div className='mb-4'>
          <label className='block text-white text-sm font-bold mb-2' htmlFor='title'>
            Title
          </label>
          <input
            value={note.title}
            id='title'
            name='title'
            type='text'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-1 focus:shadow-outline outline-[#0F1729]'
            placeholder='Enter title'
            onChange={onChange}
          />
        </div>
        <div className='mb-4'>
          <label className='block text-white text-sm font-bold mb-2' htmlFor='description'>
            Description
          </label>
          <textarea
            id='description'
            name='description'
            className='form-control shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-1 focus:shadow-outline outline-[#0F1729] overflow-y-auto resize-none'
            placeholder='Enter description'
            value={note.description}
            onChange={onChange}
            onInput={autoResize}
            rows='1'
            ref={descriptionRef}
          />
        </div>

        {/* CATEGORY & TAG ON SAME LINE */}
        <div className="md:flex gap-4 mb-4">
          {/* CATEGORY DROPDOWN */}
          <div className="md:w-1/2">
            <label className='block text-white text-sm font-bold mb-2' htmlFor='category'>
              Category
            </label>
            <select
              id='category'
              value={selectedCategory}
              onChange={handleCategoryChange}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-1 focus:shadow-outline outline-[#0F1729]'
            >
              <option value="" disabled>Select Category</option>
              {Object.keys(categories).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* TAG DROPDOWN */}
          <div className="md:w-1/2">
            <label className='block text-white text-sm font-bold mb-2' htmlFor='tag'>
              Tag
            </label>
            <select
              id='tag'
              name='tag'
              value={note.tag}
              onChange={onChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-1 focus:shadow-outline outline-[#0F1729] ${!selectedCategory ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'text-black'
                }`}
              disabled={!selectedCategory} // Disabled until a category is selected
            >
              <option value="" disabled>Select Tag</option>
              {selectedCategory
                ? categories[selectedCategory].map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))
                : Object.values(categories).flat().map((tag) => (
                  <option key={tag} disabled>{tag}</option>
                ))}
            </select>
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <button
            type='button'
            className={`bg-[#FFD252] hover:bg-[#FDC116] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${note.title.length < 3 || note.description.length < 3 || note.tag.length < 1 ? 'disabled cursor-not-allowed opacity-50' : ''
              }`}
            onClick={handleClick}
            disabled={note.title.length < 3 || note.description.length < 3 || note.tag.length < 1}
          >
            Add Note
          </button>
        </div>
      </form>
    </div>
  );
};

export default Addnote;
