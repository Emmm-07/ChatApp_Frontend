import { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom"
import { Link } from "react-router-dom";
import { hostUrl } from "../../config";

const Signup = () => {
    const [username,setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) =>{
            e.preventDefault();
            try{
                const response = await fetch(hostUrl+'signup',{
                    method: "POST",
                    headers: {
                        "Content-Type" : 'application/json'
                    },
                    body: JSON.stringify({
                        first_name: firstname,
                        last_name: lastname,
                        username: username,
                        email: email,
                        password: password,
                    }),
                });

                const data = await response.json();

                if(response.ok){
                    if (data.access) {
                        console.log('access: ' + data.access);
                        // localStorage.setItem('access', data.access);
                        // localStorage.setItem('refresh', data.refresh);
                        navigate('/login');
                    }else{
                        console.log("No access token")
                    }
                    console.log("SUCCESSFULLY SIGNED UP")
                }                 
            }catch(error){
                console.log(error)
            }
    }

    return (  
        <>
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Create New Account</h2>
    </div>

    <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSignup}>
            <div>
                <label for="username" className="block text-sm/6  font-medium text-gray-900">Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e)=>setUsername(e.target.value)}
                        required 
                    className="block w-full rounded-md bg-white px-3  py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                <label for="firstname" className="block text-sm/6 mt-5 font-medium text-gray-900">First Name</label>
                    <input 
                        type="text" 
                        value={firstname}
                        onChange={(e)=>setFirstname(e.target.value)}
                        required 
                    className="block w-full rounded-md bg-white px-3  py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                <label for="lastname" className="block text-sm/6  mt-5 font-medium text-gray-900">Last Name</label>
                    <input 
                        type="text" 
                        value={lastname}
                        onChange={(e)=>setLastname(e.target.value)}
                        required 
                    className="block w-full rounded-md bg-white px-3  py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                
                <label for="email" className="block text-sm/6 mt-5  font-medium text-gray-900">Email address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    autoComplete="email" 
                    required 
                    className="block w-full rounded-md bg-white px-3  py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
            </div>

            <div>
            
                <label for="password" className="block text-sm/6 mt-5 font-medium text-gray-900">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    autoComplete="current-password" 
                    required 
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
            
        
                <label for="confirmPassword" className="block text-sm/6 mt-5 font-medium text-gray-900">Confirm Password</label>
                <input 
                    type="password" 
                
                    required 
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />        
                
                <Link to='/login' className="font-semibold text-indigo-600 hover:text-indigo-500 text-sm">Already have an account? Login</Link>
            
            </div>

            <div>
                <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 mt-5 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign up</button>
            </div>
        </form>

     
    </div>
    </div>
    </>
    );
}
 
export default Signup;