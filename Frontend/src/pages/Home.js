import svg1 from '../assets/Vector.svg'
import { NavLink } from 'react-router-dom'
import { FiExternalLink } from "react-icons/fi";
import image1 from '../assets/documents_1548205 1.svg'
import image2 from '../assets/accept_4315445.png'
const Home = ()=>{
    return(
        <div className="w-screen h-screen bg-[#010B2B] flex relative overflow-hidden">
        <div className="flex">
            <div className='flex absolute z-20 text-white w-full justify-between px-8 pr-[4rem] pt-3 items-center'>
                <div className='text-5xl'>
                    AlgoXen
                </div>
                <div className='flex text-2xl justify-center items-center gap-x-10'>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/verify">Verify</NavLink>
                    <NavLink to="/contact">Contact Us</NavLink>
                </div>
            </div>
            <div className='absolute z-30 top-[35%] left-[40%] translate-x-[-50%] translate-y-[-50%]'>
                <div className='flex flex-col text-white space-y-20'>
                <div className='text-7xl font-semibold text-wrap'>
                    Your One Stop Solution For Document Verification.
                </div>
                <div className='text-2xl'>
                Get all your Adhaar, Student ID, ETC documents verified in an <br/> easy and efficient manner.
                </div>
                </div>
            </div> 
            <div className='absolute z-30 top-[70%] left-[10%]'>
                <NavLink to = '/verify'>
                <button className='w-48 h-12 bg-white rounded-lg hover:scale-110'>
                    <div className='flex items-center justify-evenly'>
                        <div className='font-semibold'>Start Verification</div>
                        <FiExternalLink />
                    </div>
                </button>
                </NavLink>
            </div>
            <div className='absolute z-30 top-[45%] left-[80%] translate-x-[-50%] translate-y-[-50%] bg-blend-multiply w-96'>
                    <img src = {image1} alt = "Error" className='bg-blend-overlay'></img>
            </div>
            <div className='absolute z-30 top-[63%] left-[72%] translate-x-[-50%] translate-y-[-50%]'>
            <img src = {image2} alt = "Error" className='bg-blend-overlay w-32 h-32'></img>
            </div>
            <img className='absolute top-0 right-0 z-10' src = {svg1} alt = "Error"></img>
            <div className='absolute w-[724px] h-[724px] bg-[#264ECA] rounded-full z-10 bottom-0 left-0 translate-x-[-43%] translate-y-[50%]'></div>
        </div>
    </div>
    )
}

export default Home