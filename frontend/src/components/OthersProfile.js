import { useParams } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import defaultUser from "../assets/user.png"; // Default user image
import OtherProfileNoteItem from "./OtherProfileNoteItem";
import noteContext from '../context/notes/NoteContext';
import NoteItem from "./NoteItem";
import NoteUpdateModal from "./NoteUpdateModal";
import Addnote from "./Addnote";

const OthersProfile = ({ loggedInUser, showAlert }) => {
  const { notes, getNotes, editNote } = useContext(noteContext);
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [sortCriteria, setSortCriteria] = useState("modifiedDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const hostLink = process.env.REACT_APP_HOSTLINK;

  const modalRef = useRef(null);
  const [currentNote, setCurrentNote] = useState(null);

  const addNoteModalRef = useRef(null);

  const toggleAddNoteModal = () => {
    if (addNoteModalRef.current) {
      addNoteModalRef.current.classList.toggle('hidden');
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${hostLink}/api/user/${username}`);
        const data = await response.json();

        if (response.ok) {
          setUser(data);
        } else {
          setError("User not found");
        }
      } catch (error) {
        setError("An error occurred while fetching the user profile.");
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  useEffect(() => {
    // Fetch notes if the logged-in user is viewing their own profile
    if (loggedInUser?.username === username) {
      getNotes();
    }
  }, [loggedInUser, username, getNotes]);

  useEffect(() => {
    // Set the document title based on the user data
    if (user) {
      document.title = `${username} || iNoteBook`;
    }
  }, [user]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>Loading...</p>;

  const profilePic = user.profilePic || defaultUser;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date) ? "Invalid Date" : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // If the logged-in user is viewing their own profile, include private notes
  const notesToDisplay = loggedInUser?.username === username
    ? notes
    : user.publicNotes;

  // Sort the notes based on the selected criteria and order
  const sortedNotesToDisplay = notesToDisplay.sort((a, b) => {
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
      <Addnote
        modalRef={addNoteModalRef}
        showAlert={showAlert}
        toggleModal={toggleAddNoteModal}
      />
      <NoteUpdateModal
        modalRef={modalRef}
        currentNote={currentNote}
        categories={categories}
        editNote={editNote}
        showAlert={showAlert}
        toggleModal={toggleModal}
      />

      <div className="flex flex-col items-center text-white px-4">
        {/* Profile Section */}
        <div className="flex flex-col md:flex-row items-center w-full max-w-2xl py-6 mt-20">
          <a href={profilePic} target="_blank" rel="noreferrer">
            <img
              className="size-40 rounded-full border-4 border-gray-400"
              src={profilePic}
              alt="Profile"
            /></a>
          <div className="mx-6">
            <h2 className="text-2xl font-semibold mt-2">{user.name}</h2>
            <p className="text-gray-400">@{username}</p>
            <p className="text-gray-300 text-sm">{user.email}</p>
          </div>

          <div className="mt-4 flex space-x-6 text-center">
            <div>
              <p className="text-xl font-bold">{user.totalNotes}</p>
              <p className="text-gray-400 text-sm">Total Notes</p>
            </div>
            <div>
              <p className="text-xl font-bold">{user.publicNotesCount}</p>
              <p className="text-gray-400 text-sm">Public Notes</p>
            </div>
          </div>
        </div>
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

      {/* Notes Section */}
      <div className="w-full flex flex-wrap text-white gap-3 mt-4">
        {sortedNotesToDisplay.length > 0 ? (
          sortedNotesToDisplay.map((note) => (
            loggedInUser?.username === username ? (
              <NoteItem
                key={note._id}
                note={note}
                updateNote={updateNote}
                showAlert={showAlert}
              />
            ) : (
              <OtherProfileNoteItem
                key={note._id}
                title={note.title}
                description={note.description}
                date={note.date}
                modifiedDate={note.modifiedDate}
                tag={note.tag}
              />
            )
          ))
        ) : (
          <p className="text-center text-gray-400">No notes available.</p>
        )}
      </div>

      {/* Conditionally render the Add Note button */}
      {loggedInUser && loggedInUser.username === username && (
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
      )}
    </>
  );
};

export default OthersProfile;