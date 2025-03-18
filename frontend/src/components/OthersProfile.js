import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import defaultUser from "../assets/user.png"; // Importing the default image

const OthersProfile = () => {
  const { username } = useParams(); // Extract username from URL
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const hostLink = process.env.REACT_APP_HOSTLINK;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("Fetching user from:", `${hostLink}/api/auth/${username}`);

        const response = await fetch(`${hostLink}/api/auth/${username}`);
        const data = await response.json();

        if (response.ok) {
          console.log("User found:", data);
          setUser(data);
        } else {
          console.log("User not found:", data.error);
          setError("User not found");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("An error occurred while fetching the user profile.");
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>Loading...</p>;

  const profilePic = user.profilePic || defaultUser; // ✅ Use imported default image
  console.log(profilePic)

  return (
    <div className="flex items-center justify-center min-h-screen px-4 md:px-6 text-white">
      <div className="bg-[#0A1122] bg-opacity-80 rounded-lg shadow-lg py-6 px-6 sm:px-10 w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
      
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white">Profile Details</h3>
          <p className="mt-1 text-sm md:text-base text-gray-400">Details and information about this user.</p>
          <hr className="mt-4 border-gray-600" />
        </div>

        {/* Profile Section */}
        <div className="lg:flex lg:items-center lg:space-x-6">
          <div className="flex-shrink-0 flex items-center justify-center pb-8 lg:pb-0">
            <a href={profilePic} target="_blank" rel="noopener noreferrer">
              <img
                className="size-40 lg:size-40 md:size-40 rounded-full cursor-pointer"
                src={profilePic}
                alt="Profile"
              />
            </a>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-4 w-full flex flex-col justify-center h-full">
            {[
              { label: "Name", value: user.name },
              { label: "Username", value: username },
              { label: "Email", value: user.email },
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <dt className="text-sm md:text-base font-medium">{item.label}</dt>
                <dd className="text-sm md:text-base cursor-pointer hover:text-gray-300 transition text-ellipsis overflow-hidden whitespace-nowrap">
                  {item.value || "N/A"}
                </dd>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OthersProfile;
