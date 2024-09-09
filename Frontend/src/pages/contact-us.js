import React, { useState } from 'react';
import axios from 'axios';
import svg1 from '../assets/Vector.svg'
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [formStatus, setFormStatus] = useState(''); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();  
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all fields.')
            setFormStatus('Please fill in all fields.');
            setFormData({ name: '', email: '', message: '' }); 
            return;
        }
        try {
            const response = await axios.post('http://localhost:9000/contact', formData);
            toast.success("Response Submitted Successfully")
        } catch (error) {
            console.error('Error submitting the form:', error);
            setFormStatus('Failed to submit form');
        }
    };

    return (
        <div className="w-screen h-screen bg-[#010B2B] flex relative overflow-hidden">
        <header className="flex absolute z-20 text-white w-full justify-between px-8 pr-[4rem] pt-3 items-center">
            <div className="text-5xl">AlgoXen</div>
            <nav className="flex text-2xl justify-center items-center gap-x-10">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/verify">Verify</NavLink>
                <NavLink to="/contact">Contact Us</NavLink>
            </nav>
        </header>
        
        <main className="text-white body-font absolute items-center z-30 top-[10%] w-full">
            <div className="container px-5 py-24 mx-auto">
                <div className="flex flex-col text-center w-full mb-12">
                    <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-white">Contact Us</h1>
                    <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
                        Thanks for visiting, we are looking forward to connecting with you.
                    </p>
                </div>
                <div className="lg:w-1/2 md:w-2/3 mx-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-wrap -m-2">
                            <div className="p-2 w-1/2">
                                <div className="relative">
                                    <label htmlFor="name" className="leading-7 text-sm text-white">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-white rounded text-base py-1 px-3 leading-8 text-black"
                                    />
                                </div>
                            </div>
                            <div className="p-2 w-1/2">
                                <div className="relative">
                                    <label htmlFor="email" className="leading-7 text-sm text-white">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white rounded text-base py-1 px-3 leading-8 text-black"
                                    />
                                </div>
                            </div>
                            <div className="p-2 w-full">
                                <div className="relative">
                                    <label htmlFor="message" className="leading-7 text-sm text-white">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-white rounded h-32 text-base py-1 px-3 resize-none leading-6 text-black"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="p-2 w-full">
                                <button type="submit" className="flex mx-auto text-white bg-blue-500 border-0 py-2 px-8 focus:outline-none hover:bg-blue-600 rounded text-lg">
                                    Send
                                </button>
                            </div>
                            <footer className="p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center">
                                <div>AlgoXen@gmail.com</div>
                                <p className="leading-normal my-5">
                                    Netaji Subhash University of Technology
                                    <br />Dwarka, New Delhi-110078
                                </p>
                            </footer>
                        </div>
                    </form>
                </div>
            </div>
        </main>
        <img className='absolute top-0 right-0 z-10' src={svg1} alt="Background Graphic" />
        <div className='absolute w-[724px] h-[724px] bg-[#264ECA] rounded-full z-10 bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2'></div>
    </div>
    );
};

export default ContactUs;
