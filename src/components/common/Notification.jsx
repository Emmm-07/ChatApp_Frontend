import { useState } from "react";

const Notification = ({className, showNotification, notifMessage}) => {
    const [closeNotif,setCloseNotif] = useState(!showNotification);
    return ( 
        <div className={`${className} ${closeNotif?"hidden":""} absolute  w-72 h-16 left-[45%] py-2 px-3 top-3  flex items-center bg-slate-300 rounded-md cursor-pointer`}>
            <div className="absolute right-1 top-1 text-md font-bold leading-3 rounded-full h-5 w-5 text-center hover:bg-white/20"
                onClick={()=>setCloseNotif(true)}
            >
                x
            </div>
            <div className="h-full w-12 rounded-full bg-black shrink-0">
              
            </div>
            <div className="flex-row px-2 w-full">
                <div className="font-bold py-0 leading-4">
                    {notifMessage.sender}
                </div>
                <div className="py-0 w-[85%] text-sm content-start truncate">
                    {notifMessage.message}
                </div>
            </div>
        </div>
     );
}
 
export default Notification;