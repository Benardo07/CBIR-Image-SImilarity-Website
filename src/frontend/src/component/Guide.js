import React from "react"

function Guide() {
    const instructions = [
        {
            id: "1",
            steps: "Click 'Launch App' on the Home Page"
        },
        {
            id: "2",
            steps: "Upload Your Image"
        },
        {
            id: "3",
            steps: "Upload Dataset of Image"
        },
        {
            id: "4",
            steps: "Choose search option 'Color' or 'Texture'"
        },
        {
            id: "5",
            steps: "Click 'Search' Button"
        },
        {
            id: "6",
            steps: "Wait For The Result"
        },
        {
            id: "7",
            steps: "Displaying Your Result"
        },
        {
            id: "8",
            steps: "View Your Result and Enjoy"
        }
    ]
  return (
    <div className="relative w-full h-screen">
        <div className="fixed w-full h-full bg-cover bg-center"
            style={{backgroundImage : `url(${"howtouse.jpeg"})`}}></div>
        <div className='fixed w-full h-full bg-black bg-center opacity-75 z-10'>
        </div>

        <div className="absolute  w-full top-[120px] text-white z-20">
            <h1 className="text-3xl text-white font-bold drop-shadow-[0_2px_4px_rgba(255,255,255,0.7)]  text-center">How To Use</h1>
            <div className="flex flex-wrap w-full flex-row gap-10 items-center justify-center mt-[40px] p-[20px] ">
                    {instructions.map((instruction) => (
                        <div key={instruction.id} className="w-[300px] h-[200px] rounded-3xl bg-black drop-shadow-[2px_2px_6px_rgba(255,255,255,0.7)] flex items-center justify-center hover:scale-105 transition duration-300 ease-in-out font-reemkufi">
                            <div className="absolute w-[20%] h-[30%] bg-[#00f739] rounded-full z-30 top-0 left-0 flex items-center justify-center text-2xl font-bold text-black">
                                {instruction.id}.
                            </div>
                            <h1 className="w-full text-2xl font-reemkuri flex flex-wrap text-center px-[50px] pt-[10px] drop-shadow-[0_2px_4px_rgba(255,255,255,0.7)]">
                                {instruction.steps}
                            </h1>
                        </div>
                    ))}
                

            </div>
        </div>
    </div>
  )
}

export default Guide
