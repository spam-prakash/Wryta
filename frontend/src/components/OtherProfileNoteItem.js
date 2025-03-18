import React, { useState, useRef, useEffect } from "react";
import NoteModal from "./NoteModal";

const OtherProfileNoteItem = ({ title, description, createdAt, modifiedAt }) => {
  console.log("Props received in OtherProfileNoteItem:", { title, description, createdAt, modifiedAt });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const options = { hour: "2-digit", minute: "2-digit", hour12: false };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [description]); // ✅ Watch `description` changes

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <div className="text-white flex-auto md:basis-1/4 px-2 mb-4">
        <div className="max-w-[40rem] p-6 bg-[#0a1122] shadow-2xl border-none rounded-lg group h-64 flex flex-col justify-between">
          <div className="flex-grow overflow-hidden" ref={contentRef}>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{title}</h5>
            <p className="mb-0 font-normal text-white whitespace-pre-wrap">{description}</p>
          </div>
          <div className="mt-2">
            {isOverflowing && (
              <button onClick={toggleModal} className="text-xs text-blue-500">
                Read More
              </button>
            )}
            {modifiedAt && (
              <p className="text-xs mt-2 text-slate-500">
                Modified: {formatDate(modifiedAt)} at {formatTime(modifiedAt)}
              </p>
            )}
            <p className="text-xs mt-2 text-slate-500">
              Created: {formatDate(createdAt)} at {formatTime(createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Read More Modal */}
      {isModalOpen && (
        <NoteModal note={{ title, description, createdAt, modifiedAt }} onClose={toggleModal} />
      )}
    </>
  );
};

export default OtherProfileNoteItem;
