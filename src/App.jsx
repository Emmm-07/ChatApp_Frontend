import { useState,useEffect } from 'react'
import {BrowserRouter,Routes,Route, Navigate} from 'react-router-dom'
import './index.css'
import axios from 'axios'
import ChatPanel from './components/ChatPanel'
import Login from './components/Login'
import Signup from './components/Signup'
import PrivateRoute from './components/PrivateRoute'
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
          localStorage.clear()
          setModalContent("Session expired, please Log in again");
          setModalShow("block");
          window.location.href = '/login';
        }
        console.log(timeNow - loginTime)
    }

    const interval = setInterval(checkTokenExpiration, delay);       //check every hour
    checkTokenExpiration();

    return () => {clearInterval(interval)};

  },[]) 

  return (

  <div className="App bg-[#333] w-full h-screen content-center">
    <div className="container bg-red-500 w-[70%] h-[85%] flex flex-col items-center justify-center justify-self-center rounded-xl">
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
