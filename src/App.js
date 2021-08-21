import { useEffect, useState, useReducer } from 'react';
import Gun from 'gun';

const gun = Gun({
  peers: [process.env.REACT_APP_GUN_URL]
});


const initialState = {
  notes: []
}

function reducer(state, note) {
  return {
    notes: [note, ...state.notes],
  }
}

export default function App() {
  const [formState, setForm]  = useState({name: '', note: ''})
  const [state, dispatch] = useReducer(reducer, initialState);


  useEffect(() => {
    const notes = gun.get('notes');
    notes.map().on(({ name, message, createdAt }) => {
      dispatch({ name, message, createdAt })
    })
  }, [])

  function onChange(e) {
    setForm({ ...formState, [e.target.name]: e.target.value })
  }

  function saveNote() {
    const notes = gun.get('notes');
    notes.set({ ...formState, createdAt: Date.now() })
    setForm({ name: '', note: '' });
  }

  return (
    <div style={{padding: '30px'}}>
      <input 
        onChange={onChange} 
        placeholder="Nama"
        name="name"
        value={formState.name}
      />
      <input 
        onChange={onChange} 
        placeholder="Catatan"
        name="note"
        value={formState.note}
      />
      <button onClick={saveNote}>Simpan Catatan</button>
      {
        state.notes.map(note => (
          <div key={note.createdAt}>
            <h2>{note.note}</h2>
            <h3>From : {note.name}</h3>
            <p>Date : {note.createdAt}</p>
          </div>
        ))
      }
    </div>
  )

}