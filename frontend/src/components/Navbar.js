import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import notebook from "../assets/notes.png";

const Navbar = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    props.showAlert("Logged Out", "#D4EDDA");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <nav className="z-30 flex bg-black py-3 justify-between fixed w-full items-center px-4 md:px-8">
      {/* Logo */}
      <div className="flex gap-3 items-center">
        <Link to="/">
          <img className="size-11 cursor-pointer" src={notebook} alt="" />
        </Link>
        <Link to="/">
          <span className="text-3xl font-bold font-serif cursor-pointer text-white">
            iNote<span className="text-[#FDC116]">Book</span>
          </span>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-3 items-center">
        {isLoggedIn && location.pathname !== "/" && (
          <Link
            to="/"
            className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
          >
            Home
          </Link>
        )}
        {location.pathname !== "/about" && (
          <Link
            to="/about"
            className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
          >
            About
          </Link>
        )}
        {!isLoggedIn ? (
          <>
            {location.pathname !== "/login" && (
              <Link
                className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
                to="/login"
              >
                Login
              </Link>
            )}
            {location.pathname !== "/signup" && (
              <Link
                className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
                to="/signup"
              >
                Signup
              </Link>
            )}
          </>
        ) : (
          <>
            {location.pathname !== "/profile" && (
              <Link
                className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
                to="/profile"
              >
                Profile
              </Link>
            )}
            <button
              className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>

      {/* Hamburger Icon for Mobile */}
      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu} className="text-white focus:outline-none">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-black z-20">
          <ul className="flex flex-col items-center gap-3 py-4">
            {isLoggedIn && location.pathname !== "/" && (
              <Link
                to="/"
                onClick={toggleMenu}
                className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
              >
                Home
              </Link>
            )}
            {location.pathname !== "/about" && (
              <Link
                to="/about"
                onClick={toggleMenu}
                className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
              >
                About
              </Link>
            )}
            {!isLoggedIn ? (
              <>
                {location.pathname !== "/login" && (
                  <Link
                    className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
                    to="/login"
                    onClick={toggleMenu}
                  >
                    Login
                  </Link>
                )}
                {location.pathname !== "/signup" && (
                  <Link
                    className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
                    to="/signup"
                    onClick={toggleMenu}
                  >
                    Signup
                  </Link>
                )}
              </>
            ) : (
              <>
                {location.pathname !== "/profile" && (
                  <Link
                    className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
                    to="/profile"
                    onClick={toggleMenu}
                  >
                    Profile
                  </Link>
                )}
                <button
                  className="bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;