
const Notification = ({ className, notifMessage, showNotification, setShowNotification, handleNotifClick }) => {

    return (
        <div className={`${className} ${showNotification?"":"hidden"} absolute w-72 h-16 left-[45%] py-2 px-3 top-3 flex items-center bg-slate-300 rounded-md cursor-pointer`}
            onClick={handleNotifClick}
        >
            <div
                className="absolute right-1 top-1 text-md font-bold leading-3 rounded-full h-5 w-5 text-center "
                onClick={() => setShowNotification(false)} // Hide when "x" is clicked
            >
                x
            </div>
            <div className="h-full w-12 rounded-full bg-black shrink-0">
                <img className='w-full h-full' src={notifMessage?.img || "/images/userIcon.png"} alt="" />
            </div>
            <div className="flex-row px-2 w-full">
                <div className="font-bold py-0 leading-4">
                    {notifMessage?.sender}
                </div>
                <div className="py-0 w-[85%] text-sm content-start truncate">
                    {notifMessage?.message}
                </div>
            </div>
        </div>
    );
};

export default Notification;
