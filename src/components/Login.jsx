import { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { hostUrl } from "../../config";
import SendLoading from "./Loading/SendLoading";


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 
    const navigate = useNavigate();
    const dateNow = new Date();    
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLogin = async(e) =>{
        e.preventDefault(); 
        console.log("clicked Login")
        setIsLoading(true);
        try{
            const response = await fetch(`${hostUrl}/login`,{
                method: "POST",
                headers:{
                    "Content-Type" : 'application/json'
                },
                credentials: "include", // Important for CORS
                body: JSON.stringify({
                    username: username,   //Handles Username/Email
                    password: password,
                }),
            });

            const data = await response.json();
            if(response.ok){
                console.log("Log in Successful");
                if(data.access){
                    localStorage.setItem('refresh',data.refresh); 
                    localStorage.setItem('access',data.access); 
                    localStorage.setItem('loginTime', dateNow.getTime()); 
                    
                    localStorage.setItem('fn',data.fullName);
                    localStorage.setItem('uid',data.userID);
                    localStorage.setItem('friendList',JSON.stringify(data.friendList));
                    
                    console.log("access: "+data.access);
                    navigate('/chat_panel');
                    console.log("already navigated");
                }
                setIsLoading(false);
            } else {
                setHasError(true);
                setPassword("");
                setIsLoading(false);
            }            
        }catch(error){
            console.log(error);
        }

    }

    return (  
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
           
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign in to your account</h2>
            </div>
            {/* Error logging in */}
            <div 
                data-testid='error-msg' 
                className={`${hasError? "" : "hidden" } bg-red-300 w-full text-center flex flex-col py-3 text-red-700 text-sm mt-2 -mb-2 border border-red-600`}
                >
                <span className="font-bold">Wrong Credentials</span>
                <span className="">Invalid username or password</span>
            </div>
            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleLogin}>
                <div>
                    <label for="username" className="block text-sm/6 font-medium text-gray-900">Username or Email</label>
                    <div className="mt-2">
                    <input className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        data-testid='userName'
                        type="text" 
                        required 
                        value={username}
                        onChange={(e)=>setUsername(e.target.value)}
                        onClick={()=>setHasError(false)}
                    />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                    <label for="password" className="block text-sm/6 font-medium text-gray-900">Password</label>
                    
                    </div>
                    <div className="mt-2">
                    <input type="password" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        data-testid='userPassword'
                        autoComplete="current-password" 
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        onClick={()=>setHasError(false)}
                        required 
                    />
                    </div>
                    <div className="text-sm mt-1">
                        <Link to='/signup' className="font-semibold text-indigo-600 hover:text-indigo-500">No account yet?Signup</Link>
                    </div>
                </div>

                <div>
                    <button 
                    type="submit" 
                    data-testid="loginBtn"
                    className={`${isLoading && !hasError? "bg-indigo-500":"bg-indigo-600"} flex mt-5 w-full justify-center rounded-md  px-3 py-1.5 text-sm/6 font-semibold  shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                    disabled={isLoading && !hasError}
                    >
                        {isLoading && !hasError ?
                            <>Logging in... <SendLoading/> </>
                        :
                            "Login"}
                    </button>
                </div>
                </form>

            
            </div>
        </div>
    );
}
 
export default Login;