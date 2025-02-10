import { useState } from "react";
import useDarkMode from "../hooks/useDarkMode";
const ThemeToggle = () => {
    const [theme, setTheme] = useDarkMode();
    return (  
        <>
            <button 
                onClick={()=>setTheme(theme === "dark" ? "light" : "dark")}
                className="font-medium h-10 w-full text-gray-800 rounded-full hover:bg-gray-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
            { 
                theme === "light"? ( 
                    <span className="group inline-flex shrink-0 justify-center items-center size-9">
                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                        </svg>
                    </span>
                ) : ( 
                    <span className="group inline-flex shrink-0 justify-center items-center size-9">
                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="4"></circle>
                        <path d="M12 2v2"></path>
                        <path d="M12 20v2"></path>
                        <path d="m4.93 4.93 1.41 1.41"></path>
                        <path d="m17.66 17.66 1.41 1.41"></path>
                        <path d="M2 12h2"></path>
                        <path d="M20 12h2"></path>
                        <path d="m6.34 17.66-1.41 1.41"></path>
                        <path d="m19.07 4.93-1.41 1.41"></path>
                        </svg>
                    </span>
                )
            }   
            </button>
           
        </>
    );
}
 
export default ThemeToggle;