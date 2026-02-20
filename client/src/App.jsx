import { useState, useEffect } from 'react'
import './App.css'

function App() {

  console.log("VITE_API_URL =", import.meta.env.VITE_API_URL)
  console.log("Hell0 Surendra")


  const [message, setMessage] = useState(0)

  useEffect(() => {
    fetch("/api/message").then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error("error fetching message", err)
      })
  }, [])

  return (
    <>
      <h1>Hello SEBMTG</h1>
      <p>{message}</p>
    </>
  )
}

export default App