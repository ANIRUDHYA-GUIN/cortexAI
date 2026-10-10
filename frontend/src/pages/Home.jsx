import { signInWithPopup } from 'firebase/auth'
import React from 'react'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/axios'
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from 'react-redux';
import { setUserdata } from '../redux/userSlice';
import SideBar from '../components/SideBar';
import ChatArea from '../components/ChatArea';
import Artifact from '../components/Artifact';

function Home() {
    const {userData}=useSelector(state=>state.user)
    const dispatch=useDispatch()
    const handleLogin = async (token) => {
    try {
        const { data } = await api.post("/api/auth/login", { token });
        console.log("Backend login successful:", data);
        dispatch(setUserdata(data));
        return data;
    } catch (error) {
        console.error("Backend login failed:", {
            status: error.response?.status,
            response: error.response?.data,
            message: error.message
        });
        throw error;
    }
 };

const googleLogin = async () => {
    try {
        console.log("Step 1: Starting Google sign-in");

        const result = await signInWithPopup(auth, googleProvider);
        console.log("Step 2: Google sign-in successful");

        const token = await result.user.getIdToken();
        console.log("Step 3: Firebase ID token obtained");

        await handleLogin(token);
        console.log("Step 4: Backend login successful");

    } catch (error) {
        console.error("Google login failed:", {
            code: error.code,
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
    }
};
  
    return (
        <div className='h-screen  flex bg-[#0d0f14] text-white overflow-hidden'>

<SideBar/>
<ChatArea/>
<Artifact/>




{!userData &&   <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur'>
                <div className='w-[340px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5'>
                    <div className='flex flex-col gap-1'>
                        <h2 className='text-[17px] font-semibold text-slate-100 tracking-tight'>Welcome to CortexAI</h2>
                        <p className='text-[13px] text-slate-500'>Please login to continue using the app.</p>
                    </div>

                    <button className='w-full flex items-center justify-center gap-3 py-[11px] rounded-xl text-sm font-medium text-black/90 bg-white hover:bg-gray-200  transition-all duration-150 cursor-pointer' onClick={googleLogin}>
                        <FcGoogle size={15} />
                        Continue With Google
                    </button>
                </div>
            </div>}
          
        </div>
    )
}

export default Home

