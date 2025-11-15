import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  useEffect(()=>{
    if(token){
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  if(!token){
    return <Auth onAuthenticated={setToken} backendUrl={backendUrl} />
  }

  return <Dashboard token={token} backendUrl={backendUrl} />
}

export default App;