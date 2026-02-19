import { useState, useEffect } from 'react'

import './App.css'

function App() {
  const [message, setMessage] = useState(0)

  useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/api/message`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error("error fetching message")
      })
  }, [])

  return (
    <>
      <h1>Hello SEBMTG</h1>
      <p>
        {message}
      </p>
    </>
  )
}

export default App
