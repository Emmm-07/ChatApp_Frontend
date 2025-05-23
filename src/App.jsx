import { useEffect } from 'react'
import {BrowserRouter,Routes,Route, Navigate} from 'react-router-dom'
import './index.css'
import ChatPanel from './components/ChatPanel'
import Login from './components/Login'
import Signup from './components/Signup'
import PrivateRoute from './components/PrivateRoute'
import { hostUrl } from '../config'
// to run on local network: npm run dev -- --host 0.0.0.0  

function App() {

   const tokenLife = 86.4 * (10**6);    // 1 day in millis
   const delay = 3.6 * (10**6);        // 1 hour in millis


  useEffect(()=>{ 
    
    const checkTokenExpiration = () =>{
        var timeNow = new Date(); 
        timeNow = timeNow.getTime();   // time now in millis
        const loginTime = localStorage.getItem('loginTime');
        
        if(loginTime && timeNow - loginTime > tokenLife){
          // localStorage.removeItem('access');
          // localStorage.removeItem('loginTime');
          //change is_active flag to False
          fetch(`${hostUrl}/logout`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ userId:  localStorage.getItem('uid')}), // Replace with the actual user ID
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error("Error:", error));

          localStorage.clear()
          window.location.href = '/login';
        }
        console.log(timeNow - loginTime)
    }

    const interval = setInterval(checkTokenExpiration, delay);       //check every hour
    checkTokenExpiration();

    return () => {clearInterval(interval)};

  },[]) 

  return (

  <div className="App dark:bg-black bg-gradient-to-r  from-[#46ace5b3] to-[#610acfb3] w-full h-screen content-center">
    <div className="container min-w-[400px] text-black dark:text-white relative bg-white/20 w-[70%] sm:h-[85%] h-screen flex flex-col items-center justify-center justify-self-center rounded-xl border-2 border-white/20">
    
      <BrowserRouter>
        <Routes>

          <Route exact path="/login" element={<Login/>} />
          <Route exact path="/signup" element={<Signup/>} />

          {/* Private Routes */}
          <Route exact path="/" element={<Navigate to="/chat_panel"/>} />     
          <Route exact path="/chat_panel" 
            element={<PrivateRoute element={<ChatPanel/>}/>}
          />
         

        </Routes> 
      </BrowserRouter> 

    </div>
  </div>
  )
}

export default App
