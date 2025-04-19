import { useState,useEffect, useRef } from 'react'
import '../index.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { hostUrl, wsURL } from '../../config'
import ChatLoadingSkeleton from './Loading/ChatLoadingSkeleton'
import SendLoading from './Loading/SendLoading'
import ThemeToggle from './common/ThemeToggle'
import ScrollBar from './common/ScrollBar'
import EmojiPicker from '@emoji-mart/react'
import emojiData from '@emoji-mart/data'
import Notification from './common/Notification'

const ChatPanel = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState(null);
    const [user, setUser] = useState(localStorage.getItem('fn'));
    const [friendList, setFriendList] = useState([]);
    const [recipientId, setRecipientId] = useState(null);
    const recipientIdRef = useRef(recipientId);
    const [recipeintName, setRecipientName] = useState(null)
    const [isChatsLoading, setIsChatsLoading] = useState(true);
    const [isStillSending, setIsStillSending] = useState(false);
    const storedLatestMessages = JSON.parse(localStorage.getItem('lastMessages'));
    const [lastMessage, setLastMessage] = useState(storedLatestMessages || {});
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const bottomRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emoji, setEmoji] = useState('😂');
    const [openMenu, setOpenMenu] = useState(false);
    const userId = localStorage.getItem('uid');
    const [notifMessage, setNotifMessage] = useState({});
    const [showNotification, setShowNotification] = useState(false);

    // Update the ref whenever `recipientId` changes
    useEffect(() => {
        recipientIdRef.current = recipientId;
    }, [recipientId]);


    const handleSendMessage = (e, haveEmoji = null) => {
        e.preventDefault();
        setIsStillSending(true);
        const messageToSend = haveEmoji ?? newMessage;    // Custom message, outside the form like: emoji
      if (ws && (newMessage.trim()) || haveEmoji) {
          ws.send(JSON.stringify({ type:"private_chat_message", message: messageToSend, user: user, recipientId: recipientId }));   
          !haveEmoji && setNewMessage(''); // Clear the input chat field, don't if sent an emoji
      }   
    };
    
    const handleLogout = () =>{
        localStorage.clear();
        navigate("/login");
    }
   
    const appendEmojiToText = (emoji) => {
        console.log("Selected Emoji:", emoji); 
        console.log(emojiData)
        if (!emoji || !emoji.native) return; // Prevent errors if emoji is undefined
        setNewMessage((prev)=>prev+emoji.native);
    }

    useEffect(()=>{
        const token = localStorage.getItem('access');
        setUser(localStorage.getItem('fn'))
        var fList = localStorage.getItem('friendList');   //GET the FriendList from backend 
        fList = JSON.parse(fList);
        setFriendList(fList);
        //Initialize the recipient as the first friend or friendlist[0]
        setRecipientId(fList[0].id)
        setRecipientName(`${fList[0].first_name} ${fList[0].last_name}`); 

        //Create websocket connection
        const socket = new WebSocket(`${wsURL}/?token=${token}`);
        
        setWs(socket);
        socket.onopen = () => {
          console.log("WebSocket connection established");
          socket.send(JSON.stringify({ type: "active_status_indicator", user_id: userId, status: "online" }))
        };
          
        socket.onmessage = (event) => {
            setIsStillSending(false);
            try{
                const socketData =  JSON.parse(event.data);
                const type = socketData.type;
                if (type === "chat_message") {
                    console.log("message received")
                    console.log("socketData sender: ",socketData.sender)
                    console.log("recipient id: ",recipientIdRef.current)
                    console.log("User Id: ", parseInt(userId))
                    if (recipientIdRef.current && socketData.sender !== recipientIdRef.current && socketData.sender !== parseInt(userId)) {
                        setNotifMessage({
                            senderId: socket.sender,
                            sender: socketData.sender_fname,
                            message: socketData.message,
                            img: "/images/userIcon.png",
                        })
                        setShowNotification(false); // Reset state first
                        setTimeout(() => setShowNotification(true), 10); // Ensure state change
                    }
                    setMessages((prevMessages)=>{
                    return [...prevMessages,socketData];
                    });
                    console.log("success set messages")
                }else if (type === "active_status") {
                    console.log("FriendsList from socket: ")
                    console.log(socketData.usersList)
                    setFriendList(socketData.usersList.filter(user => user.id !== userId));            
                }
            }catch(error){
                console.log(error);
            }
        
        };
        
        socket.onclose = (event) => {
            console.error("WebSocket closed: ", event);
        };
        
        socket.onerror = (error) => {
            console.error("WebSocket error: ", error);
        };
    
        console.log("Hello there");
        
        return () => {
            console.log("Socket closing")
            if(socket.readyState === WebSocket.OPEN){
                socket.send(JSON.stringify({ type: "active_status_indicator", user_id: userId, status: "offline" }))
            }
            socket.close()
        };
    },[])


    useEffect(()=>{
        // Fetch messages from the API on load
        setIsChatsLoading(true);
        if(recipientId!=null){
        axios.get(`${hostUrl}/api/messages/personal_message?recipient=${recipientId}`,{
           headers:{
               'Content-Type': "application/json",
               'Authorization': `Bearer ${localStorage.getItem('access')}`,
           }
         }).then(response=>{
            setError(null)
           if(response.data.error){
                setError(response.data.error);
                return
           }
           setMessages(response.data.messages);
           setIsChatsLoading(false);
           console.log("last message: ",response.data.lastMessage)
           //Set the latest chats per friend
           setLastMessage((prev)=>{
                const updated = {
                    ...prev,
                    ...response.data.lastMessage,
                } 
                // Save to localStorage
                localStorage.setItem("lastMessages", JSON.stringify(updated));

                return updated;
            })

         }).catch(error=>{
            console.log("Error fetching messages: "+ error)
            // Automatically logs out user if Tab was closed (error fetching messages)
            alert("You have been inactive for some time. Please re-login");    
            handleLogout() 
         })
        }
    },[recipientId])

    //auto scroll to latest chat
    useEffect(()=>{
        if(bottomRef.current){
            bottomRef.current?.scrollIntoView({ behavior:"auto" })     // behavior:"smooth"  if you want it to scroll down
        }
        
    }, [messages,isStillSending])

    // Auto logout account if tab closed
    useEffect(()=>{
        if(!localStorage.getItem("lastReload")) {
            var timeNow = new Date(); 
            timeNow = timeNow.getTime();
            localStorage.setItem("lastReload",timeNow);
            return
        }

        var lastReload = localStorage.getItem("lastReload");
        var timeNow = new Date(); 
        timeNow = timeNow.getTime();
        
        console.log("lastReload: ", lastReload)
        console.log("timeNow: ", timeNow)
        console.log("delay: ", timeNow - lastReload)
        
        const handleTabClosure = (e) => {
                var timeNow = new Date(); 
                timeNow = timeNow.getTime();
                var lastReload = localStorage.getItem("lastReload");
                console.log("lastReload: ", lastReload)
                console.log("timeNow: ", timeNow)
                console.log("delay: ", timeNow - lastReload)
                if(timeNow - lastReload < 2000) {               
                    localStorage.setItem("lastReload",timeNow); 
                    return
                }else {                                             
                    navigate("/login");                         // If the refresh is longer than 2000ms 
                    console.log("HAS BEEN CLOSED")              // it will automatically logout, considered as Tab closed
                }
                localStorage.setItem("lastReload",timeNow);
                
        };

        window.addEventListener("unload", handleTabClosure);

        return ()=> {
                window.removeEventListener("unload", handleTabClosure)
        };

    }, [])
    
    const handleNotifClick = () => {
        setRecipientId(notifMessage?.senderId);
        setRecipientName(notifMessage?.sender);
    }
    
    return (  
        <div className='flex sm:flex-row flex-col h-full w-full rounded-xl relative'>
            <Notification
                className="hover:bg-slate-500"
                notifMessage={notifMessage}
                showNotification={showNotification}
                setShowNotification={setShowNotification}
                // handleNotifClick={handleNotifClick}
            />
            <div className=' w-[30%] rounded-l-xl  relative space-y-4 flex sm:flex-col justify-between '>
                {/* Chat Friends List */}
                <div className='sm:p-5 pt-2 pb-0 px-3 flex flex-row sm:flex-col'>
                {friendList.filter(friend => friend.id != userId) // Filter out the current user
                            .map((friend,idx)=>(
                    <>
                    <div key={friend.id}                                                        
                        className={`relative hover:bg-white/20 w-full flex space-x-5 px-4 py-2 mb-3 rounded-xl cursor-pointer ${recipientId==friend.id? 'bg-white/20':'bg-transparent'}`}
                        onClick={()=>{
                            setRecipientId(friend.id);
                            setRecipientName(`${friend.first_name} ${friend.last_name}`);
                            console.log("rec id: ",recipientId);
                            // setMessages([]);
                        }}           
                    >
                        <span className='relative min-w-14 h-14 rounded-full bg-black md:m-auto'>
                            {/* Image should be here */}
                            <img className='w-full h-full' src={friend.img || "/images/userIcon.png"} alt="" />
                            {/* green dot active indicator */}
                            <span className={`${friend.is_active?"block":"hidden"} absolute bottom-0 right-0 bg-green-500 rounded-full w-4 h-4`}></span>
                        </span>
                        
                        <div className="w-36 hidden md:flex flex-col transition">
                            <span className='font-bold w-full'>{friend.first_name} {friend.last_name}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm truncate w-full ">
                                {lastMessage[friend.id]}
                            </span>
                        </div>
                    </div>
                    
                    </>
                ))
                }
                </div>
                <div className='border-t border-white/50 relative flex flex-row items-center w-full justify-between h-20 px-5 pt-4 pb-8'>
                    <div className='flex flex-row space-x-3'>
                        <div className='border rounded-full w-10'>
                            <img className='w-full h-full' src={"/images/userIcon.png"} alt="" />
                        </div>
                        <h2 className='hidden md:flex transition bottom-20 h-8 font-bold text-lg mt-2'>{user}</h2>
                    </div>
                    <div className='w-9 cursor-pointer' onClick={()=>setOpenMenu(!openMenu)}>
                        <img className="hover:-rotate-12" src="/images/settingsIcon.png" alt="" />
                    </div>
               
                     {/* Menu     */}
                     <div id="userDropdown" className={`${openMenu? "block" : "hidden"} absolute -top-36 right-3 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600 cursor-pointer`}>
                            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="avatarButton">
        
                            <li>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                >Settings</a>
                            </li>
                            <li>
                                <a href="#" className="relative px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white flex flex-row">
                                    <span>Theme</span>
                                    <div className='absolute h-0 left-0 w-44 top-0'><ThemeToggle className="hover:bg-transparent dark:hover:bg-transparent flex justify-end items-start pr-5"/></div>
                                </a>
                            </li>
                            </ul>
                            <div className="py-1">
                                <a  onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                >Sign out</a>
                            </div>
                        </div>
                </div>
            </div>
            
            <div className='border border-white/20 sm:w-[70%] w-full rounded-r-xl p-5'>
                <h1 className="text-3xl font-bold">{recipeintName}</h1>
                {showEmojiPicker &&
                <div className='absolute right-20 top-32'>
                      <EmojiPicker data={emojiData} onEmojiSelect={(e)=>appendEmojiToText(e)}/>
                </div>
                }
               
              
                {/* Chat Panel */}
                <ScrollBar height='' className="sm:h-[80%] h-96 bg-white p-4 rounded shadow-md sm:w-full w-[95%] overflow-y-auto mt-3 space-y-5">
                    {/* Render messages */}
                    { isChatsLoading ? 
                        !error?<ChatLoadingSkeleton/>
                            :
                            <div className="h-[90%] content-center text-black text-lg text-center">{error}</div> //No Messages yet
                        : 
                        messages.map((msg, idx) => (
                            (msg.sender == recipientId || msg.recipient == recipientId) &&  (              // Do not show message if the user is not in the window of the sender
                                <div className={`flex gap-2 ${!msg.recipient || msg.recipient == recipientId ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className='rounded-full flex items-end'>
                                        <img className='w-8 h-8' src={"/images/userIcon.png"} alt="" />
                                    </div>
                                    <div key={idx} className={`border-b border-gray-300 break-words max-w-[45%] w-fit rounded-2xl py-1 pl-3 pr-2 text-sm ${!msg.recipient || msg.recipient == recipientId? 'bg-blue-500 ml-auto rounded-br-none':'bg-gray-500 rounded-bl-none'}`} >
                                        <span>{msg.message}</span> 
                                    </div>
                                </div>
                                )
                            ))
                    }
                    
                    
                    <div ref={bottomRef} id='bottomDiv' className=''>
                        { isStillSending &&
                            <SendLoading/>
                        }
                    </div>
                </ScrollBar>
               
                <form onSubmit={(e)=>handleSendMessage(e)}>
                    <div className="chatBox flex gap-2 mt-4 absolute bottom-4 sm:w-[65%] w-[90%] mr-auto">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="border p-2 w-full dark:text-black  rounded-xl"
                        />
                        <button className='absolute right-16 top-3  w-6 ' type='button' onClick={()=>setShowEmojiPicker(!showEmojiPicker)}>
                            <img src="/images/emojiIcon.png" alt="" />
                        </button>
                       
                        <button className=' content-center text-3xl cursor-pointer hover:bg-white/20 rounded-full p-1'
                            type='button'
                             onClick={(e)=> {
                                setTimeout(() => handleSendMessage(e,emoji), 0); // Send emoji 
                             }}
                        >
                            {emoji}
                        </button>
                    </div>
                </form>
 
            </div>
        </div>
    );
}
 
export default ChatPanel;