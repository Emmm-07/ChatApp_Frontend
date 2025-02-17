import { useState,useEffect, useRef } from 'react'
import '../index.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { hostUrl } from '../../config'
import ChatLoadingSkeleton from './Loading/ChatLoadingSkeleton'
import SendLoading from './Loading/SendLoading'
import ThemeToggle from './common/themeToggle'
import ScrollBar from './common/ScrollBar'
import EmojiPicker from '@emoji-mart/react'
import emojiData from '@emoji-mart/data'


const ChatPanel = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState(null);
    const [user, setUser] = useState(localStorage.getItem('fn'));
    const [friendList, setFriendList] = useState([]);
    const [recipientId, setRecipientId] = useState(null);
    const [recipeintName, setRecipientName] = useState(null)
    const [isChatsLoading, setIsChatsLoading] = useState(true);
    const [isStillSending, setIsStillSending] = useState(false);
    const storedLatestMessages = JSON.parse(localStorage.getItem('lastMessages'));
    const [lastMessage, setLastMessage] = useState(storedLatestMessages || {});
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const bottomRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emoji, setEmoji] = useState('😂')

    const handleSendMessage = (e, haveEmoji = null) => {
        e.preventDefault();
        setIsStillSending(true);
        const messageToSend = haveEmoji ?? newMessage;    // Custom message, outside the form like: emoji
      if (ws && (newMessage.trim()) || haveEmoji) {
          ws.send(JSON.stringify({ message: messageToSend, user: user, recipientId: recipientId }));   
          !haveEmoji && setNewMessage(''); // Clear the input chat field, don't if sent an emoji
      }   
    };
    
    const handleLogout = () =>{
        localStorage.clear();
        navigate("/login");
    }
   
    const appendEmojiToText = (emoji) => {
        // e.preventDefault()
        console.log("Selected Emoji:", emoji); 
        console.log(emojiData)
        if (!emoji || !emoji.native) return; // Prevent errors if emoji is undefined
        setNewMessage((prev)=>prev+emoji.native);
        // setShowEmojiPicker(false);  // Close picker after selecting
    }

    useEffect(()=>{
   
        const token = localStorage.getItem('access');
        setUser(localStorage.getItem('fn'))
        var fList = localStorage.getItem('friendList');   //GET the FriendList from backend 
        fList = JSON.parse(fList);
        setFriendList(fList);
        // console.log("Friendlist: ")
        // console.log(fList);
        //Initialize the recipient as the first friend or friendlist[0]
        setRecipientId(fList[0].id)
        setRecipientName(`${fList[0].first_name} ${fList[0].last_name}`); 


        //Create websocket connection
        const socket = new WebSocket(`ws://${hostUrl}/ws/socketserver/?token=${token}`);
        setWs(socket);
        socket.onopen = () => {
          console.log("WebSocket connection established");
          };
          
        socket.onmessage = (event) => {
            setIsStillSending(false);
            try{
                const msgData =  JSON.parse(event.data);
                // console.log("Message from server: ");
                // console.log(msgData);
    
                setMessages((prevMessages)=>{
                //   console.log("Previous msg");
                //   console.log(prevMessages);
                return [...prevMessages,msgData];
                });
                console.log("success set messages")
            
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
        
        return () => socket.close();
    },[])


    useEffect(()=>{
        //    Fetch messages from the API on load
        setIsChatsLoading(true);
        if(recipientId!=null){
        axios.get(`http://${hostUrl}/api/messages/personal_message?recipient=${recipientId}`,{
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
         })
        }
    },[recipientId])

    //auto scroll to latest chat
    useEffect(()=>{
        if(bottomRef.current){
            bottomRef.current?.scrollIntoView({ behavior:"auto" })     // behavior:"smooth"  if you want it to scroll down
        }
        
    }, [messages,isStillSending])

    

    return (  
        <div className='flex h-full w-full rounded-xl relative'>
            <div className=' w-[30%] rounded-l-xl p-5 relative space-y-4 flex flex-col justify-between'>
                {/* Chat Friends List */}
                <div className=''>
                {friendList.map((friend,idx)=>(
                    <>
                    <div key={friend.id}                                                        
                        className={`relative hover:bg-white/20 w-full flex space-x-5 px-4 py-2 mb-3 rounded-xl cursor-pointer ${recipientId==friend.id? 'bg-white/20':'bg-transparent'}`}
                        onClick={()=>{
                            setRecipientId(friend.id);
                            setRecipientName(`${friend.first_name} ${friend.last_name}`);
                            // setMessages([]);
                        }}           
                    >
                        <span className='min-w-14 h-14 border rounded-full bg-black md:m-auto'></span>
                       
                        <div className="w-36 hidden md:flex flex-col transition">
                            <span className='font-bold w-full'>{friend.first_name} {friend.last_name}</span>
                            <span className="text-gray-400 text-sm truncate w-full ">
                            {/* {messages.length > 0 ? messages[messages.length-1].message : "..."} */}
                            {lastMessage[friend.id]}
                            </span>
                        </div>
                    </div>
                    
                    </>
                ))
                }
                </div>
                <div className='border relative flex flex-row items-center w-full justify-between'>
                    <div className='flex flex-row'>
                        {/* <div className='border rounded-full w-9 bg-black'>J</div> */}
                        <h2 className=' bottom-20 border h-8 font-bold'>{user}</h2>
                    </div>
                    <div className='border w-9'>
                        <img src="/images/settingsIcon.png" alt="" />
                       
                    </div>
                    {/* <button
                        onClick={handleLogout}
                        className="bg-black text-white mt-11 px-4 py-2 rounded-full hover:bg-blue-600"
                    >
                        Logout
                    </button> */}
                     {/* Menu     */}
                     <div id="userDropdown" className="absolute -top-36 right-0 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600">
                            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="avatarButton">
        
                            <li>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
                            </li>
                            <li>
                                <a href="#" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white flex flex-row">Theme
                                    <div className='w-5 h-0'><ThemeToggle/></div>
                                </a>
                            </li>
                            </ul>
                            <div className="py-1">
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</a>
                            </div>
                        </div>
                </div>
            </div>
            
            <div className='border w-[70%] rounded-r-xl p-5'>
                <h1 className="text-3xl font-bold">{recipeintName}</h1>
                {showEmojiPicker &&
                <div className='absolute right-20 top-32'>
                      <EmojiPicker data={emojiData} onEmojiSelect={(e)=>appendEmojiToText(e)}/>
                </div>
                }
               
              
                {/* Chat Panel */}
                <ScrollBar height='h-[80%]' className="bg-white p-4 rounded shadow-md w-full overflow-y-auto mt-3 space-y-5">
                    {/* Render messages */}
                    { isChatsLoading ?
                        !error?<ChatLoadingSkeleton/>
                            :
                            <div className="h-[90%] content-center text-black text-lg text-center">{error}</div> //No Messages yet
                        :
                        messages.map((msg, idx) => (
                            <div key={idx} className={`border-b border-gray-300 break-words max-w-[45%] w-fit rounded-2xl py-1 pl-3 pr-2 text-sm ${!msg.recipient || msg.recipient == recipientId? 'bg-blue-500 ml-auto rounded-br-none':'bg-gray-500 rounded-bl-none'}`} >
                           {msg.message}  {/*   {msg.sender_fname}: */}
                            </div>
                        ))
                    }
                    
                    
                    <div ref={bottomRef} id='bottomDiv' className=''>
                        { isStillSending &&
                            <SendLoading/>
                        }
                    </div>
                </ScrollBar>
               
               
                <form onSubmit={(e)=>handleSendMessage(e)}>
                    <div className="chatBox flex gap-2 mt-4 absolute bottom-4 w-[65%] mr-auto">
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