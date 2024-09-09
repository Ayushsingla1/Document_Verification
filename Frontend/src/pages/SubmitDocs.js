import { FiInfo } from "react-icons/fi";
import { FiUpload } from 'react-icons/fi';
import { AiOutlineCheck } from 'react-icons/ai';
import { useState } from "react";
import svg1 from '../assets/Vector.svg';
import axios from 'axios';
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import AlertDialog from "../components/modal";

const SubmitDocs = () => {
    const [profileData, setProfileData] = useState({});
    const [uploadedImages, setUploadedImages] = useState({
        studentProfile: null,
        aadharCard: null,
        panCard: null,
        marksheet: null,
    });

    const [aadharImgStatus, setAadharImgStatus] = useState(false);
    const [clicked,setclicked] = useState(false)
    const [isImageVerificationChecked, setIsImageVerificationChecked] = useState(false);
    const [modal,setmodal] = useState(false)
    const [verified,setverfied] = useState(true)

    const handleImageUpload = (event, docType) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedImages((prevState) => ({
                ...prevState,
                [docType]: file
            }));
        }
    };

    const submitDocuments = async () => {
        if (!uploadedImages.studentProfile || !uploadedImages.aadharCard || !uploadedImages.panCard || !uploadedImages.marksheet) {
            toast.error("Please provide all documents");
            return;
        }
            setclicked(true)
            const profileFormData = new FormData();
            profileFormData.append('studentProfile', uploadedImages.studentProfile);
            const profileResponse = await axios.post('http://localhost:9000/extract_profile', profileFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const aadhaarFormData = new FormData();

            aadhaarFormData.append('aadharCard', uploadedImages.aadharCard);
            aadhaarFormData.append('student_profile', JSON.stringify(profileResponse.data));
            console.log(aadhaarFormData)
            const aadhaarResponse = await axios.post('http://localhost:9000/verify_aadhar', aadhaarFormData,{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if(aadhaarResponse.data.verify_status.includes('not')){
                setverfied(false)
                toast.error(aadhaarResponse.data.verify_status)
            }
            else{
                toast.success(aadhaarResponse.data.verify_status)
            }

            const faceFormData = new FormData();
            faceFormData.append('profile_image',uploadedImages.studentProfile);
            faceFormData.append('aadhaar_image',uploadedImages.aadharCard);
            const response5 = await axios.post('http://localhost:9000/compare_faces',faceFormData,{
                headers : {
                    "Content-Type" : 'multipart/form-data'
                }
            });

            if(response5.data.comparison_status === false){
                setverfied(false)
                toast.error('Aadhar Card Image Not Verified')
            }
            else{
                toast.success('Aadhar Card Image Verified Successfully')
            }

            const panFormData = new FormData();
            panFormData.append('panCard', uploadedImages.panCard);
            panFormData.append('student_profile', JSON.stringify(profileResponse.data))
            const panResponse = await axios.post('http://localhost:9000/verify_pan', panFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if(panResponse.data.verify_status.includes('not')){
                setverfied(false)
                toast.error(panResponse.data.verify_status)
            }
            else{
                toast.success('Pan Card Verified Successfully')
            }

            const face2FormData = new FormData();
            face2FormData.append('profile_image',uploadedImages.studentProfile);
            face2FormData.append('pan_image',uploadedImages.panCard);
            const response6 = await axios.post('http://localhost:9000/compare_pan',face2FormData,{
                headers : {
                    "Content-Type" : 'multipart/form-data'
                }
            });

            if(response6.data.comparison_status === false){
                setverfied(false)
                toast.error('Pan Card Image Not Verified')
            }
            else{
                toast.success('Pan Card Image Verified Successfully')
            }

            const marksheetFormData = new FormData();
            marksheetFormData.append('marksheet', uploadedImages.marksheet);
            marksheetFormData.append('student_profile', JSON.stringify(profileResponse.data));
            const marksheetResponse = await axios.post('http://localhost:9000/verify_marksheet12', marksheetFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if(marksheetResponse.data.verify_status.includes('not')){
                setverfied(false)
                toast.error(marksheetResponse.data.verify_status)
            }
            else{
                toast.success(marksheetResponse.data.verify_status)
            }

            const face3FormData = new FormData();
            face3FormData.append('profile_image',uploadedImages.studentProfile);
            face3FormData.append('mark12_image',uploadedImages.marksheet);
            const response7 = await axios.post('http://localhost:9000/compare_mark12',face3FormData,{
                headers : {
                    "Content-Type" : 'multipart/form-data'
                }
            });

            if(response7.data.comparison_status === false){
                setverfied(false)
                toast.error('12th Marksheet Image Not Verified')
            }
            else{
                toast.success('12th Marksheet Image Verified Successfully')
            }

            if(verified){
                toast.success("Deployed on blockchain")
                // const res = await axios.post('http://localhost:9000/upload-hash', {
                //     model_output: {
                //       'AadhaarNo': '642948425887',
                //       'DateofBirth': '06-07-2005',
                //       'FatherName': 'SURESH KUMAR',
                //     },
                //   }, {
                //     headers: {
                //       'Content-Type': 'application/json',
                //     },
                //   });
                // console.log(res)
            }
            setclicked(false)
            setmodal(true)
    }

    return (
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

                <div className="bg-white absolute z-30 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[80%] h-[80%] rounded-lg px-8 py-10">
                    <div className="text-4xl stroke-[#062065] font-semibold text-black">Submit Documents</div>
                    <div className="flex items-center gap-x-2 mt-8">
                        <FiInfo className="size-6" />
                        <div className="text-black font-medium">Make sure to upload your authentic documents for verification</div>
                    </div>
                    <div className="flex justify-between items-center h-5/6 lg:px-14 md:px-10 sm:px-6 lg:gap-x-10 md:gap-x-6 sm:gap-x-3">
                        <div className="lg:p-8 md:p-6 sm:p-3 rounded-md border-2 border-black">
                            <div className="lg:space-y-8 md:space-y-5 sm:space-y-3 lg:my-8 md:my-5 sm:my-2">
                                {[
                                    { label: 'Nsut Student Profile', type: 'studentProfile' },
                                    { label: 'Aadhar Card', type: 'aadharCard' },
                                    { label: 'Pan Card', type: 'panCard' },
                                    { label: '12th Marksheet', type: 'marksheet' },
                                ].map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between lg:gap-x-16 md:gap-x-12 sm:gap-x-4">
                                        <span className="text-gray-800">{doc.label}</span>
                                        <div className="flex items-center space-x-4">
                                            <label className="bg-gray-800 text-white px-3 py-1 rounded flex items-center space-x-1 hover:bg-gray-700 cursor-pointer">
                                                <span>Upload</span>
                                                <FiUpload />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, doc.type)}
                                                    className="hidden"
                                                />
                                            </label>
                                            {uploadedImages[doc.type] ? (
                                                <AiOutlineCheck className="text-green-500" size={20}/>
                                            ) : 
                                            (
                                                <span className="text-3xl text-red-500 font-extrabold">!</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pr-12 lg:pr-10 md:pr-5 sm:pr-1">
                            <img alt="Error loading" src="https://res.cloudinary.com/dmnjig3al/image/upload/v1725719332/uvldlgqee4lzy8cd3ytj.png" className="max-w-80 min-w-48" />
                        </div>
                    </div>
                    <div className="flex justify-center">
                        {
                            clicked ? (<div class="loader"></div>) : (<button onClick={submitDocuments} className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-500 hover:scale-105 text-xl">Submit</button>)
                        }
                    </div>
                </div>
            </div>
            <img className='absolute top-0 right-0 z-10' src={svg1} alt="Error" />
            <div className='absolute w-[724px] h-[724px] bg-[#264ECA] rounded-full z-10 bottom-0 left-0 translate-x-[-43%] translate-y-[50%]'></div>

            {
                modal && <AlertDialog openDialog={modal} verified = {verified}/>
            }

        </div>
    );
}

export default SubmitDocs;
