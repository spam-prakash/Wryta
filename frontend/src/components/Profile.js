import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = (props) => {
  const { name, username, email, image } = props.user || {};
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [publicNotesCount, setPublicNotesCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Set the document title based on the user data
    if (username) {
      document.title = `${username} || iNoteBook`;
    }
  }, [username]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_HOSTLINK}/api/notes/fetchallnotes`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
          }
        });
        const data = await response.json();
        if (response.ok) {
          setNotes(data);
          setPublicNotesCount(data.filter(note => note.isPublic).length);
        } else {
          console.error('Failed to fetch notes');
        }
      } catch (error) {
        console.error('An error occurred while fetching the notes:', error);
      }
    };

    fetchNotes();
  }, []);

  const [copiedText, setCopiedText] = useState("");
  const [copiedElement, setCopiedElement] = useState("");
  const copyToClipboard = (element, text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text); // Set state to show copied text
    setCopiedElement(element);
    props.showAlert(`${element} Successfully copied !`, '#D4EDDA');
    setTimeout(() => setCopiedText(""), 1500); // Clear message after 1.5 sec
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 md:px-6 text-white">
      <div className="bg-[#0A1122] bg-opacity-80 rounded-lg shadow-lg py-6 px-6 sm:px-10 w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white">Profile Details</h3>
          <p className="mt-1 text-sm md:text-base text-gray-400">Details and information about you.</p>
          <hr className="mt-4 border-gray-600" />
        </div>

        {/* Profile Section */}
        <div className="lg:flex lg:items-center lg:space-x-6">
          {image && (
            <div className="flex-shrink-0 flex items-center justify-center pb-8 lg:pb-0">
              <a href={image} target='_blank' rel='noopener noreferrer'>
                <img className="size-40 lg:size-40 md:size-40 rounded-full cursor-pointer" src={image} alt="Profile" />
              </a>
            </div>
          )}

          {/* Details Section */}
          <div className="flex-1 space-y-4 w-full flex flex-col justify-center h-full">
            {[
              { label: "Name", value: name },
              { label: "Username", value: username },
              { label: "Email", value: email },
              {label:"Total Notes",value:notes.length},
              {label:"Public Notes",value:publicNotesCount}
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <dt className="text-sm md:text-base font-medium">{item.label}</dt>
                <dd className="text-sm md:text-base cursor-pointer hover:text-gray-300 transition text-ellipsis overflow-hidden whitespace-nowrap" onClick={() => copyToClipboard(item.label || 'N/A', item.value || "N/A")}>
                  {item.value || 'N/A'}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;