import { useState,useEffect, useRef } from 'react'
import '../index.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { hostUrl } from '../../config'
import ChatLoadingSkeleton from './Loading/ChatLoadingSkeleton'
import SendLoading from './Loading/SendLoading'

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
          setNewMessage(''); // Clear the input field
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
        //    console.log("Data: ");
        //    console.log(response.data)
           setMessages(response.data);
           setIsChatsLoading(false);
         }).catch(error=>{
           console.log("Error fetching messages: "+ error)
         })
        }
    },[recipientId])

    
    useEffect(()=>{
        if(bottomRef.current){
            bottomRef.current?.scrollIntoView({ behavior:"auto" })     // behavior:"smooth"  if you want it to scroll down
        }
        
    }, [messages,isStillSending])
    // useEffect(()=>{
    // const scrollToSection = (id) => {
    //     // e.preventDefault();
    //     const element = document.getElementById(id);
    //     const offset = 75;
    //     const offsetPosition = element.offsetTop - offset;
    
    //     window.scrollTo({
    //         top: offsetPosition,
    //         behavior: 'smooth'
    //     });
    // };
        
    // })
    

    return (  
        <div className='flex h-full border w-full rounded-xl relative'>
            <div className='border w-[30%] rounded-l-xl p-5 relative space-y-6'>
                {friendList.map((friend,idx)=>(
                    <>
                    <div key={idx}                                                        
                        className={`border hover:bg-white flex space-x-5 px-4 py-2 rounded-xl cursor-pointer ${recipientId==friend.id? 'bg-white':'bg-transparent'}`}
                        onClick={()=>{
                            setRecipientId(friend.id);
                            setRecipientName(`${friend.first_name} ${friend.last_name}`);
                            setMessages([]);
                        }}           
                    >
                        <span className='w-14 h-14 border rounded-full bg-black'></span>
                        <h2>{friend.first_name} {friend.last_name}</h2>
                    </div>
                
                    </>
                ))

                }
                <h2 className='absolute bottom-20'>{user}</h2>
                <button
                    onClick={handleLogout}
                    className="bg-black text-white mt-11 px-4 py-2 rounded-full hover:bg-blue-600 absolute bottom-6"
                >
                    Logout
                </button>
            </div>
            
            <div className='border w-[70%] rounded-r-xl p-5'>
                <h1 className="text-white text-3xl font-bold">{recipeintName}</h1>

               
                
                <div className="chatContainer bg-white p-4 rounded shadow-md w-full h-[80%] overflow-y-auto mt-3">
                {/* Render messages */}
                { isChatsLoading ?
                    <ChatLoadingSkeleton/>
                    :
                    messages.map((msg, idx) => (
                        <div key={idx} className={`border-b border-gray-300 w-[40%] rounded-lg py-2 my-3 ${!msg.recipient || msg.recipient == recipientId? 'bg-blue-500 ml-auto':'bg-gray-500'}`} >
                        {msg.sender_fname}:{msg.message}
                        </div>
                    ))
                }
                
                
                <div ref={bottomRef} id='bottomDiv' className=''>
                    { isStillSending &&
                        <SendLoading/>
                    }
                </div>
                 
                </div>
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
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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