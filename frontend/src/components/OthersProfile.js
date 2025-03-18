import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import defaultUser from "../assets/user.png"; // Default user image
import OtherProfileNoteItem from "./OtherProfileNoteItem";

const OthersProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const hostLink = process.env.REACT_APP_HOSTLINK;

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
    // Set the document title based on the user data
    if (user) {
      document.title = `${username}  || iNoteBook`;
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

  return (
    <>
      <div className="flex flex-col items-center  text-white px-4">
        {/* ✅ Profile Section */}
        <div className="flex flex-col md:flex-row items-center w-full max-w-2xl py-6 mt-20">
          <img
            className="size-40 rounded-full border-4 border-gray-400"
            src={profilePic}
            alt="Profile"
          />
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

      {/* ✅ Public Notes Section */}
      <div className="w-full flex flex-wrap text-white gap-3 mt-4">
        {user.publicNotes.length > 0 ? (
          user.publicNotes.map((note) => (
            <OtherProfileNoteItem
              key={note._id}
              title={note.title}
              description={note.description}
              createdAt={(note.createdAt)}
              modifiedAt={(note.modifiedAt)}
              tag={note.tag}
            />
          ))
        ) : (
          <p className="text-center text-gray-400">No public notes available.</p>
        )}
      </div>
    </>
  );
};

export default OthersProfile;
