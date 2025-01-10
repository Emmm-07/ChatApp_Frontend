import { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { hostUrl } from "../../config";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 
    const navigate = useNavigate();
    const dateNow = new Date();    

    const handleLogin = async(e) =>{
        e.preventDefault(); 
        try{
            const response = await fetch(hostUrl+'login',{
                method: "POST",
                headers:{
                    "Content-Type" : 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            const data = await response.json();
            if(response.ok){
                console.log("Log in Successful");
                if(data.access){
                    localStorage.setItem('access',data.access); 
                    localStorage.setItem('loginTime', dateNow.getTime()); 
                    
                    localStorage.setItem('fn',data.firstname);
                    localStorage.setItem('friendList',JSON.stringify(data.friendList));
                    
                    console.log("access: "+data.access);
                    navigate('/chat_panel');
                    console.log("already navigated");
                }
            }             
        }catch(error){
            console.log(error);
        }

    }

    return (  
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign in to your account</h2>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={handleLogin}>
            <div>
                <label for="username" className="block text-sm/6 font-medium text-gray-900">Email address</label>
                <div className="mt-2">
                <input className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    type="text" 
                    required 
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                <label for="password" className="block text-sm/6 font-medium text-gray-900">Password</label>
                
                </div>
                <div className="mt-2">
                <input type="password" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    autoComplete="current-password" 
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    required 
                />
                </div>
                <div className="text-sm">
                    <Link to='/signup' className="font-semibold text-indigo-600 hover:text-indigo-500">No account yet?Signup</Link>
                </div>
            </div>

            <div>
                <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign in</button>
            </div>
            </form>

         
        </div>
        </div>
        </>
    );
}
 
export default Login;