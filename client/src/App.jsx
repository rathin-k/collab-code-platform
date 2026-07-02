import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Room from "./pages/Room";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
         <ProtectedRoute>
           <Home />
         </ProtectedRoute>
         }
       />

      <Route
       path="/room/:roomId"
        element={
         <ProtectedRoute>
           <Room />
         </ProtectedRoute>
       }
     />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;