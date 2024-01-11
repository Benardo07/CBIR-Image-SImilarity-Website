import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
function Firstpage() {

      // List of images (add the paths to your images here)
    const images = [
        'image1.jpeg',
        'image2.jpeg',
        'image3.jpeg',
        'image6.jpeg',
        'image7.jpeg',
        'image8.jpeg',
        'image9.jpeg',
        'image10.jpeg',
        'image11.jpeg',
        'image12.jpeg',
        'image13.jpeg',
        'image14.jpeg',
        'image15.jpeg',
        'image16.jpeg',
        'image17.jpeg',
        'image18.jpeg',
        'image19.jpeg',
        'image20.jpeg'

    ];

    // State to keep track of the current background image
    const [currentBg, setCurrentBg] = useState(0);
    const [nextBg, setNextBg] = useState(1);

    // Effect to change the background image every 2 seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            setNextBg(currentBg);
            setCurrentBg((currentBg + 1) % images.length);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [currentBg]);

    return (
        <div className="relative w-full h-screen">
            <div
                className="absolute w-full h-full bg-cover bg-center transition-opacity duration-1000 z-0"
                style={{ backgroundImage: `url(${images[currentBg]})`, opacity: nextBg === currentBg ? 1 : 0 }}
            ></div>
            <div
                className="absolute w-full h-full bg-cover bg-center transition-opacity duration-1000 z-0"
                style={{ backgroundImage: `url(${images[nextBg]})`, opacity: nextBg === currentBg ? 0 : 1 }}
            ></div>
            <div className='absolute w-full h-full bg-black bg-center opacity-75 z-10'>
            </div>
            <div className='absolute z-20 w-[60%]  h-[50%] top-[180px] text-white pl-[200px] pt-[50px]'>
              <h1 className='text-7xl font-extrabold zoom-in'>Snap Twins</h1>
              <h2 className='text-4xl font-normal mt-[20px] mb-[50px] tracking-widest'>Content-Based Information Retrieval Project</h2>
              <p className='text-2xl typing font-light text-[#c7d4ca]'>Matching Your Image In Just One Click.</p>
              <Link to="/Search"><button className='text-2xl font-bold border-[#00ff3b]  text-black rounded-lg mt-[30px] py-[15px] px-[20px] bg-[#00ff3b] hover:bg-green-500 drop-shadow-[0_2px_4px_rgba(255,255,255,0.7)]'>LAUNCH APP</button></Link>
            </div>
        </div>
    );
};

export default Firstpage