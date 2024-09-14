// import { useState } from "react";
// import { json } from "react-router-dom";
// import Alert from "../../components/Alert";
import { json } from 'react-router-dom'
import NoteContext from './NoteContext'
import { useState } from 'react'

// const hostLink = 'http://localhost:8000'
// console.log(hostLink)
// const hostLink = 'https://inotebook-backend-opal.vercel.app'
const NoteState = (props) => {
  const notesInitial = []

  const [notes, setNotes] = useState(notesInitial)

  // Get all note
  const getNotes = async () => {
    // API CALL
    const response = await fetch(`${hostLink}/api/notes/fetchallnotes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // "auth-token":'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjY3Y2M5MGE0YjMwZjQ2M2Y5YmM1MTU1In0sImlhdCI6MTcxOTQ1NDE4M30.FMkv7hlK5CBecxroCu4CSgwoWrkJLBaQ8NsO9KiszYE'
        'auth-token': localStorage.getItem('token')
      }
      // body: JSON.stringify({title,description,tag}),
    })

    const json = await response.json()
    setNotes(json)
  }

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
    // const json=await response.json()
    // const note = {
    //   _id: "667d359e5cbd3bce10b0e226",
    //   user: "667cc90a4b30f463f9bc5155",
    //   title: title,
    //   tag: tag,
    //   description: description,
    //   date: "2024-06-27T09:49:18.378Z",
    //   __v: 0,
    // };
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
        'auth-token':
          localStorage.getItem('token')
      },
      body: JSON.stringify({ title, description, tag })
    })
    // const json = response.json();
    const newNotes = JSON.parse(JSON.stringify(notes))

    // Logic to edit
    for (let index = 0; index < newNotes.length; index++) {
      const element = newNotes[index]
      if (element._id === id) {
        newNotes[index].title = title
        newNotes[index].description = description
        newNotes[index].tag = tag
        break
      }
    }
    setNotes(newNotes)
    // showAlert("dgdag","dsggdsg")
  }

  return (
    <NoteContext.Provider value={{ notes, addNote, editNote, deleteNote, getNotes }}>
      {props.children}
    </NoteContext.Provider>
  )
}

export default NoteState
