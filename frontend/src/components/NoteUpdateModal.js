import React, { useState, useEffect } from 'react';

const NoteUpdateModal = ({ modalRef, currentNote, categories, editNote, showAlert, toggleModal }) => {
  const [note, setNote] = useState({ id: '', etitle: '', edescription: '', etag: '', ecategory: '' });

  useEffect(() => {
    if (currentNote) {
      const category = determineCategory(currentNote.tag);
      setNote({
        id: currentNote._id,
        etitle: currentNote.title,
        edescription: currentNote.description,
        etag: currentNote.tag,
        ecategory: category || "📚 General", // Set a default category instead of "✨ All"
      });
    }
  }, [currentNote]);

  const determineCategory = (tag) => {
    for (const [category, tags] of Object.entries(categories)) {
      if (tags.includes(tag)) return category; // Return the correct category
    }
    return null; // Return `null` instead of an empty string or "✨ All"
  };

  const handleClick = () => {
    editNote(note.id, note.etitle, note.edescription, note.etag);
    toggleModal();
    showAlert('Note updated successfully!', '#D4EDDA');
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "ecategory") {
      // When category changes, reset the tag to the first available tag in that category
      setNote({
        ...note,
        ecategory: value,
        etag: categories[value]?.[0] || "" // Auto-select first tag of category
      });
    } else {
      setNote({ ...note, [name]: value });
    }
  };

  return (
    <div
      ref={modalRef}
      className="hidden fixed top-0 left-0 z-50 w-full h-full backdrop-blur-sm bg-opacity-50 flex justify-center items-center"
    >
      <form className="bg-[#0a1122]  md:w-[60vw] max-w-[50rem] shadow-2xl rounded px-8 pt-6 pb-8 mb-4">
        {/* Title */}
        <div className="mb-4">
          <label
            className="block text-white text-sm font-bold mb-2"
            htmlFor="etitle"
          >
            Title
          </label>
          <input
            id="etitle"
            name="etitle"
            type="text"
            value={note.etitle}
            className="shadow border rounded w-full py-2 px-3 text-black focus:outline-none"
            placeholder="Enter title"
            onChange={onChange}
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label
            className="block text-white text-sm font-bold mb-2"
            htmlFor="edescription"
          >
            Description
          </label>
          <textarea
            id="edescription"
            name="edescription"
            className="shadow border rounded w-full py-2 px-3 text-black focus:outline-none resize-none"
            placeholder="Enter description"
            value={note.edescription}
            onChange={onChange}
            rows="4"
          />
        </div>

        {/* Category Selector */}
        <div className="mb-4">
          <label
            className="block text-white text-sm font-bold mb-2"
            htmlFor="ecategory"
          >
            Category
          </label>
          <select
            id="ecategory"
            name="ecategory"
            className="shadow border rounded w-full py-2 px-3 text-black focus:outline-none"
            value={note.ecategory || "📚 General"} // Set a fallback category
            onChange={onChange}
          >
            <option value="" disabled>Select Category</option>
            {Object.keys(categories)
              .filter(category => category !== "✨ All") // Remove "✨ All" from options
              .map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>

        {/* Tag Selector */}
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2" htmlFor="etag">
            Tag
          </label>
          <select
            id="etag"
            name="etag"
            className="shadow border rounded w-full py-2 px-3 text-black focus:outline-none"
            value={note.etag}
            onChange={onChange}
          >
            <option value="">Select Tag</option>
            {categories[note.ecategory]?.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleModal}
            type="button"
            className="text-gray-700 mx-3 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
          >
            Close
          </button>
          <button
            type="button"
            className={`bg-[#FFD252] hover:bg-[#FDC116] text-white font-bold py-2 px-4 rounded ${note.etitle.length < 3 ||
              note.edescription.length < 3 ||
              note.etag.length < 1
              ? "cursor-not-allowed opacity-50"
              : ""
              }`}
            onClick={handleClick}
            disabled={
              note.etitle.length < 3 ||
              note.edescription.length < 3 ||
              note.etag.length < 1
            }
          >
            Edit Note
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteUpdateModal;