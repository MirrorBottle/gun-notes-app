import { useEffect, useState, useReducer } from 'react';
import moment from 'moment';
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
  const [search, setSearch] = useState('');
  const [formIncrement, setFormIncrement] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);


  useEffect(() => {
    const notes = gun.get('notes');
    notes.map().on(({ name, note, createdAt }) => {
      dispatch({ name, note, createdAt })
    })
  }, [])

  function onChange(e) {
    setForm({ ...formState, [e.target.name]: e.target.value })
  }

  function saveNote() {
    const notes = gun.get('notes');
    const { note, name } = formState;
    notes.set({ note, name, createdAt: Date.now() })
    setForm({ name: '', note: '' });
  }

  function handleSearch() {
    const notes = gun.get('notes');
    state.notes = [];
    notes.map().on(({ name, note, createdAt }) => {
      console.log(search !== "" && note.includes(search), search, note.includes(search), note)
      if(search !== "") {
        if(note.includes(search) || name.includes(search)) {
          dispatch({ name, note, createdAt })
        }
      } else {
        dispatch({ name, note, createdAt })
      }
    })
  }

  return (
    <div>
      <div className="mockup-window bg-base-300">
        <div className="flex justify-left px-8 py-6 bg-base-200">
          <div className="flex-1">
            <div onClick={() => setFormIncrement(formIncrement + 1)} className="inline-block text-2xl font-bold border-b-8 lg:text-7xl text-base-content border-primary cursor-pointer">Notes</div>
            {formIncrement > 5 ? (
              <div className="flex flex-col form-wrapper mt-8">
                <input 
                  onChange={onChange} 
                  placeholder="Judul"
                  name="name"
                  className="input"
                  value={formState.name}
                />
                <textarea 
                  onChange={onChange} 
                  name="note"
                  className="textarea h-24 mt-4" 
                  placeholder="Catatan"
                  value={formState.note}
                />
                <button onClick={saveNote} className="btn btn-primary mt-4">Simpan Catatan</button>
                <button onClick={() => setFormIncrement(0)} className="btn btn-secondary mt-2">Tutup</button>
              </div>
            ) : (
              <div id="notes-container" className="mt-12 overflow-y-auto pb-4">
                <div class="flex space-x-2 p-2">
                  <input type="text" placeholder="Cari" value={search} onChange={e => setSearch(e.target.value)} class="w-full input" /> 
                  <button class="btn btn-primary" onClick={handleSearch}>Cari</button>
                </div>
              {
                state.notes.map(note => (
                  <div className="card shadow-lg" key={note.createdAt}>
                    <div className="card-body">
                      <h5>{note.name}</h5>
                      <h2 className="card-title lg:text-4xl break-all">{note.note}</h2> 
                      <p><em>- {moment(note.createdAt).fromNow()}</em></p>
                    </div>
                  </div>
                ))
              }
              </div>
            )}
            <div id="notes-footer" className="text-center mt-8">
              <p>Made with GUN by Bayu Setiawan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  )

}