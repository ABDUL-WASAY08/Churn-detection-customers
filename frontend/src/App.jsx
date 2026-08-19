import { BrowserRouter, Routes, Route } from "react-router-dom"
import SplashScreen from "./Screen/SplashScreen"
import MainScreen from "./Screen/MainScreen"
import { Toaster } from "react-hot-toast"

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/main" element={<MainScreen />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App