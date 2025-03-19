import { json } from 'react-router-dom'
import NoteContext from './NoteContext'
import { useState, useCallback } from 'react'

const hostLink = process.env.REACT_APP_HOSTLINK

const NoteState = (props) => {
  const notesInitial = []

  const [notes, setNotes] = useState(notesInitial)
  const [sortCriteria, setSortCriteria] = useState("modifiedDate");
  const [sortOrder, setSortOrder] = useState("desc");


 // Get all notes
 const getNotes = useCallback(async () => {
  try {
    // API CALL
    const response = await fetch(`${hostLink}/api/notes/fetchallnotes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    });
    const json = await response.json();

    // Log the response to debug
    // console.log('API Response:', json);

    // Check if the response is an array before sorting
    if (Array.isArray(json)) {
      // Sort notes by modifiedDate or date based on the selected criteria and order
      const sortedNotes = json.sort((a, b) => {
        const dateA = new Date(a[sortCriteria] || a.date);
        const dateB = new Date(b[sortCriteria] || b.date);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
      setNotes(sortedNotes);
    } else {
      console.error('Expected an array but got:', json);
    }
  } catch (error) {
    console.error('Failed to fetch notes:', error);
  }
}, [sortCriteria, sortOrder]);

  // Add a note
  const addNote = async (title, description, tag,isPublic) => {
    // API CALL
    const response = await fetch(`${hostLink}/api/notes/addnote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({ title, description, tag,isPublic })
    })
    const note = await response.json()

    // Add the new note to the local state
    setNotes(notes.concat(note))
  }

  // Delete a note
  const deleteNote = async (id) => {
    // API CALL
    const response = await fetch(`${hostLink}/api/notes/deletenote/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    })
    // const json = response.json();

    // LOGIC TO DELETE
    const newNotes = notes.filter((note) => {
      return note._id !== id
    })
    setNotes(newNotes)
  }

  // Update a note
  const editNote = async (id, title, description, tag) => {
    // API CALL
    const response = await fetch(`${hostLink}/api/notes/updatenote/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({ title, description, tag, date: Date.now() }) // Include the date field
    })
    const json = await response.json()

    // Logic to edit in local state
    const newNotes = notes.map(note => {
      if (note._id === id) {
        return { ...note, title, description, tag, date: json.date } // Update date locally from server response
      }
      return note
    })
    setNotes(newNotes)
  }

  // Function to update visibility
  const updateVisibility = async (noteId, isPublic) => {
    try {
      const response = await fetch(`${hostLink}/api/notes/visibility/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ isPublic }),
      });
  
      const json = await response.json();
      if (json.success) {
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === noteId ? { ...note, isPublic } : note
          )
        );
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };
  

  return (
    <NoteContext.Provider value={{ notes, addNote, editNote, deleteNote, getNotes,updateVisibility, setSortCriteria, setSortOrder }}>
      {props.children}
    </NoteContext.Provider>
  )
}

export default NoteState
