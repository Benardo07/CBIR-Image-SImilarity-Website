import React from 'react'

function Tech() {
  return (
    <div className='w-full h-screen relative'>
      <div className="fixed w-full h-full bg-cover bg-center"
            style={{backgroundImage : `url(${"imagetech.jpeg"})`}}></div>
        <div className='fixed w-full h-full bg-black bg-center opacity-75 z-10'>
        </div>

        <div className='flex flex-col items-center justify-center absolute top-[130px] z-20 text-white w-full'>
            <h1 className='text-2xl font-bold drop-shadow-[2px_2px_6px_rgba(255,255,255,0.7)] text-center w-full'>Our Technology Stack</h1>
            <div className='w-[80%] mt-[30px] border-t-4 border-white mb-8 pt-6'>
                <h1 className='text-5xl font-bold '>FrontEnd</h1>
                <div className='w-full flex flex-row gap-16 items-center justify-center pt-[40px]'>
                    <div className='w-[250px] flex flex-col items-center hover:scale-105 transition duration-300 ease-in-out'>
                        <div className='w-[250px] h-[250px] bg-cover bg-center' style={{backgroundImage : `url(${"react-logo-1.png"})`}} ></div>
                        <h1 className='mt-[20px] text-xl'>React js</h1>
                    </div>
                    <div className='w-[250px] flex flex-col items-center hover:scale-105 transition duration-300 ease-in-out'>
                        <div className='w-[250px] h-[250px] bg-cover bg-center' style={{backgroundImage : `url(${"tailwind.jpg"})`}} ></div>
                        <h1  className='mt-[20px] text-xl'>Tailwind CSS</h1>
                    </div>
                </div>
            </div>

            <div className='w-[80%] mt-[30px] border-t-4 border-white mb-8 pt-6'>
                <h1 className='text-5xl font-bold'>BackEnd</h1>
                <div className='w-full flex flex-row gap-16 items-center justify-center pt-[40px]'>
                    <div className='w-[250px] flex flex-col items-center hover:scale-105 transition duration-300 ease-in-out'>
                        <div className='w-[250px] h-[250px] bg-cover bg-center' style={{backgroundImage : `url(${"flask.png"})`}} ></div>
                        <h1 className='mt-[20px] text-xl'>Flask</h1>
                    </div>
                    <div className='w-[250px] flex flex-col items-center hover:scale-105 transition duration-300 ease-in-out'>
                        <div className='w-[250px] h-[250px] bg-cover bg-center' style={{backgroundImage : `url(${"python.jpeg"})`}} ></div>
                        <h1  className='mt-[20px] text-xl'>Python</h1>
                    </div>
                </div>
            </div>

            <div className='w-[80%] mt-[30px] border-t-4 border-white mb-8 pt-6'>
                <h1 className='text-5xl font-bold '>Libraries</h1>
                <div className='w-full flex flex-row gap-16 items-center justify-center pt-[40px] '>
                    <div className='w-[250px] flex flex-col items-center hover:scale-105 transition duration-300 ease-in-out'>
                        <div className='w-[250px] h-[250px] bg-cover bg-center' style={{backgroundImage : `url(${"numpy.png"})`}} ></div>
                        <h1 className='mt-[20px] text-xl'>Numpy</h1>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
  )
}

export default Tech
