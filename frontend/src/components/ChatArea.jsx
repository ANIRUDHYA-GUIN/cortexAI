// import React, { useEffect } from 'react'
// import Nav from './Nav'
// import MessageList from './MessageList'
// import ChatInput from './ChatInput'
// import { useDispatch, useSelector } from 'react-redux'
// import getMessages from '../features/getMessages'
// import { setArtifacts, setMessages } from '../redux/messageSlice'

// function ChatArea() {
//   const {selectedConversation}=useSelector(state=>state.conversation)
//   const dispatch=useDispatch()
//   useEffect(()=>{
//   const getMesg=async () => {
    
//     if(selectedConversation){
//       if(selectedConversation.title=="New Chat")return;
// const data=await getMessages(selectedConversation?._id)
// console.log(data)
//       dispatch(setMessages(data))
//       const latestArtifactMessage=[...data].reverse().find(msg=>msg.artifacts && msg.artifacts.length>0)
//       dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
//     }
    
//   }

//   getMesg()
//   },[selectedConversation?._id])
//   return (
//     <div className='flex-1 flex flex-col min-w-0'>
//       <Nav/>
//       <MessageList/>
//       <ChatInput/>
//     </div>
//   )
// }

// export default ChatArea


import React, { useEffect } from 'react'
import Nav from './Nav'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages'
import { setArtifacts, setMessages } from '../redux/messageSlice'

function ChatArea() {
  const { selectedConversation } = useSelector(state => state.conversation)
  const dispatch = useDispatch()

  useEffect(() => {
    let cancelled = false

    const getMesg = async () => {
      if (!selectedConversation || selectedConversation.title === 'New Chat') {
        return
      }

      try {
        const data = await getMessages(selectedConversation._id)

        if (cancelled) return

        if (!Array.isArray(data)) {
          console.error('getMessages did not return an array:', data)
          dispatch(setMessages([]))
          dispatch(setArtifacts([]))
          return
        }

        dispatch(setMessages(data))

        const latestArtifactMessage = [...data]
          .reverse()
          .find(msg => msg?.artifacts?.length > 0)

        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
      } catch (error) {
        if (cancelled) return

        console.error('Failed to load messages:', error)
      }
    }

    getMesg()

    return () => {
      cancelled = true
    }
  }, [selectedConversation?._id, selectedConversation?.title, dispatch])

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  )
}

export default ChatArea
