import { useState,useEffect, useRef } from 'react'
import '../index.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { hostUrl } from '../../config'
import ChatLoadingSkeleton from './Loading/ChatLoadingSkeleton'
import SendLoading from './Loading/SendLoading'
import ThemeToggle from './common/themeToggle'
import ScrollBar from './common/ScrollBar'

const ChatPanel = () => {
    const [messages,setMessages] = useState([]);
    const [newMessage,setNewMessage] = useState('');
    const [ws,setWs] = useState(null);
    const [user,setUser] = useState(localStorage.getItem('fn'));
    const navigate = useNavigate();
    const [friendList,setFriendList] = useState([]);
    const [recipientId,setRecipientId] = useState(null);
    const [recipeintName,setRecipientName] = useState(null)
    const [isChatsLoading, setIsChatsLoading] = useState(true);
    const [isStillSending, setIsStillSending] = useState(false);
    const bottomRef = useRef(null);

    const handleSendMessage = (e) => {
        e.preventDefault();
        setIsStillSending(true);
      if (ws && newMessage.trim()) {
          ws.send(JSON.stringify({ message: newMessage, user: user, recipientId: recipientId }));   
          setNewMessage(''); // Clear the input chat field
      }   
    };
    
    const handleLogout = () =>{
        localStorage.clear();
        navigate("/login");
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
           setMessages(response.data);
           setIsChatsLoading(false);
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
            <div className=' w-[30%] rounded-l-xl p-5 relative space-y-4'>
                {/* Chat Friends List */}
                {friendList.map((friend,idx)=>(
                    <>
                    <div key={idx}                                                        
                        className={`relative hover:bg-white/20  flex space-x-5 px-4 py-2 rounded-xl cursor-pointer ${recipientId==friend.id? 'bg-white/20':'bg-transparent'}`}
                        onClick={()=>{
                            setRecipientId(friend.id);
                            setRecipientName(`${friend.first_name} ${friend.last_name}`);
                            // setMessages([]);
                        }}           
                    >
                        <span className='w-14 h-14 border rounded-full bg-black'></span>
                       
                        <div className="flex flex-col w-36 border">
                            <span className='font-bold'>{friend.first_name} {friend.last_name}</span>
                            <span className="text-gray-400 text-sm truncate w-full border">
                            {messages.length > 0 ? messages[messages.length-1].message : "..."}
                            </span>
                        </div>
                    </div>
                    
                    </>
                ))

                }
                <h2 className='absolute bottom-20'>{user}</h2>
                <button
                    onClick={handleLogout}
                    className="bg-black  mt-11 px-4 py-2 rounded-full hover:bg-blue-600 absolute bottom-6"
                >
                    Logout
                </button>
            </div>
            
            <div className='border w-[70%] rounded-r-xl p-5'>
                <h1 className="text-3xl font-bold">{recipeintName}</h1>

               
              
                {/* Chat Panel */}
                <ScrollBar height='h-[80%]' className="bg-white p-4 rounded shadow-md w-full overflow-y-auto mt-3 space-y-5">
                    {/* Render messages */}
                    { isChatsLoading ?
                        <ChatLoadingSkeleton/>
                        :
                        messages.map((msg, idx) => (
                            <div key={idx} className={`border-b border-gray-300 break-words max-w-[45%] w-fit rounded-3xl py-1 pl-1 pr-6  ${!msg.recipient || msg.recipient == recipientId? 'bg-blue-500 ml-auto rounded-br-none':'bg-gray-500 rounded-bl-none'}`} >
                            &nbsp; {msg.sender_fname}: {msg.message}
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
                            className="border p-2 rounded w-full "
                        />
                        <button
                            type='submit'
                            className="bg-blue-500  px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Send
                        </button>    
                    </div>
                </form>

                 
            </div>
               
        </div>
    );
}
 
export default ChatPanel;