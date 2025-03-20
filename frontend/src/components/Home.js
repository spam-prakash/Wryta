import React, { useEffect, useState, useRef, useCallback } from "react";
import HomeNoteItem from "./HomeNoteItem";
import Addnote from "./Addnote";

const Home = (props) => {
  const [publicNotes, setPublicNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("✨ All");
  const [selectedTag, setSelectedTag] = useState("");
  const hostLink = process.env.REACT_APP_HOSTLINK;
  const addNoteModalRef = useRef(null);
  const observer = useRef();

  useEffect(() => {
    document.title = 'iNotebook - Your notes secured in the cloud';
    fetchPublicNotes(page);
  }, [page]);

  const fetchPublicNotes = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`${hostLink}/api/notes/public?page=${page}&limit=10`);
      const data = await response.json();

      if (response.ok) {
        // Sort the notes by modifiedDate in descending order
        const sortedNotes = data.notes.sort((a, b) => {
          const dateA = new Date(a.modifiedDate || a.date);
          const dateB = new Date(b.modifiedDate || b.date);
          return dateB - dateA; // Descending order
        });
        setPublicNotes((prevNotes) => {
          // Filter out any duplicate notes
          const newNotes = sortedNotes.filter(note => !prevNotes.some(prevNote => prevNote._id === note._id));
          return [...prevNotes, ...newNotes];
        });
        setHasMore(data.hasMore);
      } else {
        props.showAlert("Failed to fetch public notes!", "#F8D7DA");
      }
    } catch (error) {
      props.showAlert("An error occurred while fetching public notes!", "#F8D7DA");
    }
    setLoading(false);
  };

  const lastNoteElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const toggleAddNoteModal = () => {
    if (addNoteModalRef.current) {
      addNoteModalRef.current.classList.toggle('hidden');
    }
  };

  // Category & Tag Data
  const categories = {
    "✨ All": [],
    "📚 General": ["General", "Note", "Task", "Ideas"],
    "📂 Work": ["Meetings", "Projects", "Work"],
    "🏡 Personal": ["Reading", "Poem", "Shayari", "Thought"],
    "💰 Future": ["Budgeting", "Future Plans", "Goals"]
  };

  // Filter the notes based on the selected category and tag
  const filteredNotes = publicNotes.filter((note) => {
    if (selectedCategory !== "✨ All") {
      const categoryTags = categories[selectedCategory];
      if (!categoryTags.includes(note.tag)) return false;
    }
    if (selectedTag && note.tag !== selectedTag) return false;
    return true;
  });

  return (
    <>
      <Addnote
        modalRef={addNoteModalRef}
        showAlert={props.showAlert}
        toggleModal={toggleAddNoteModal}
      />

      <div className="mx-auto py-4 sm:px-2 lg:px-4">
        <h2 className="text-2xl font-semibold text-white mb-4">Latest Public Notes</h2>

        {/* Category Selection */}
        {publicNotes.length > 1 && (
          <div className="flex gap-2 mt-5 mb-3 overflow-x-auto whitespace-nowrap scrollbar-hide px-0">
            {Object.keys(categories)
              .filter(category => category === "✨ All" || publicNotes.some(note => categories[category].includes(note.tag)))
              .map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedTag(""); // Reset tag when category changes
                  }}
                  className={`px-4 py-2 text-xs rounded-full border transition-all duration-300 ${selectedCategory === category
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
        {categories[selectedCategory]?.length > 1 && publicNotes.some(note => categories[selectedCategory].includes(note.tag)) && (
          <div className="flex gap-2 mb-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {categories[selectedCategory]
              .filter(tag => publicNotes.some(note => note.tag === tag))
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${selectedTag === tag
                    ? "bg-[#FFD252] text-black border-[#FFD252] shadow-md"
                    : "bg-[#1E293B] text-white border-gray-600 hover:border-white hover:bg-[#374151]"
                    }`}
                >
                  {tag}
                </button>
              ))}
          </div>
        )}

        <div className="w-full flex flex-wrap text-white gap-3 mt-4">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => {
              if (filteredNotes.length === index + 1) {
                return (
                  <div ref={lastNoteElementRef} key={note._id}>
                    <HomeNoteItem
                      title={note.title}
                      description={note.description}
                      date={note.date}
                      modifiedDate={note.modifiedDate}
                      tag={note.tag}
                    />
                  </div>
                );
              } else {
                return (
                  <HomeNoteItem
                    key={note._id}
                    title={note.title}
                    description={note.description}
                    date={note.date}
                    modifiedDate={note.modifiedDate}
                    tag={note.tag}
                  />
                );
              }
            })
          ) : (
            <p className="text-center text-gray-400">No public notes available.</p>
          )}
        </div>
        {loading && <p className="text-center text-gray-400">Loading...</p>}
      </div>

      {/* Add Note Icon */}
      <button
        onClick={toggleAddNoteModal}
        className="fixed bottom-10 right-10 bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </>
  );
};

export default Home;