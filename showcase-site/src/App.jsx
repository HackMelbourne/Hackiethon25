import './App.css'
import Navbar from './navbar'
import Dropdown from './Dropdown'
import DropZone from './Dropzone'

function App() {

  // Paste your desired website here, in full https form without the "/" at the end
  // NOTE: not all websites work. Websites protected under CSP cannot be embedded
  let MyUrl = "";
  if (MyUrl){
    return (
      <div className="App">
        <Navbar />
        <DropZone url={MyUrl}/>
      </div>
    )
  }

  return (
    <div className="App" style={{ backgroundImage: 'url(/stars.png)', height: '100vh' }}>
        <Navbar />
        <div className="relative text-center mt-10">
          <h1 className="outline-text">
            SHOWCASE
          </h1>
          <h2 className="main-title">
            Hackiethon Widget Showcase
          </h2>
        </div>
        <DropZone/>
    </div>
  )
}

export default App