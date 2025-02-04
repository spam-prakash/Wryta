// import { useState } from "react";
// import { json } from "react-router-dom";
// import Alert from "../../components/Alert";
import { json } from 'react-router-dom'
import NoteContext from './NoteContext'
import { useState, useCallback } from 'react'

// const hostLink = 'http://localhost:8000'
// const hostLink = 'https://inotebook-backend-opal.vercel.app'
const hostLink = process.env.REACT_APP_HOSTLINK
// console.log(hostLink)
const NoteState = (props) => {
  const notesInitial = []

  const [notes, setNotes] = useState(notesInitial)

  // Get all note
  const getNotes = useCallback(async () => {
    // API CALL
    const response = await fetch(`${hostLink}/api/notes/fetchallnotes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    })
    const json = await response.json()

    // Sort notes by date in descending order
    const sortedNotes = json.sort((a, b) => new Date(b.date) - new Date(a.date))

    setNotes(sortedNotes)
  },[])

  // Add a note
  const addNote = async (title, description, tag) => {
    // API CALL
    const response = await fetch(`${hostLink}/api/notes/addnote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({ title, description, tag })
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
        'auth-token':
          localStorage.getItem('token')
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

  return (
    <NoteContext.Provider value={{ notes, addNote, editNote, deleteNote, getNotes }}>
      {props.children}
    </NoteContext.Provider>
  )
}

export default NoteState
