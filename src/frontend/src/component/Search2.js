import React, { useState, useEffect ,useRef } from 'react';
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import JSZip from 'jszip';

function Search2() {
    const [imageURL, setImageURL] = useState(localStorage.getItem('imageURL') || null);
    const [folderFile, setFolderFile] = useState(null);
    const [isTextureMode, setIsTextureMode] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0); // Track total pages
    const [imageFile, setImageFile] = useState(null);
    const [totalImages, setTotalImages] = useState(0);
    const [searchDuration, setSearchDuration] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [linkInput, setLinkInput] = useState('');
    const [useCamera, setUseCamera] = useState(false);
    const videoRef = useRef(null);
    const [zipFile, setZipFile] = useState(null);
    const [isCameraLoacding,setIsCameraloading] = useState(true);

    

    useEffect(() => {
        setImageURL(null);
        setImageFile(null);
        localStorage.removeItem('imageURL'); // Remove from localStorage 
    }, []);

   
    const  fetchImages = (page, isNewSearch = false,imageFileParam = null) => {
        setIsSearching(true);
    
        let url, options;
    
        if (isNewSearch) {
            const imageToUse = imageFileParam || imageFile;
            if (!imageToUse) {
                console.error("No image file available for search.");
                setIsSearching(false);
                return;
            }
            console.log(isTextureMode);
            url = `http://localhost:5000/search?page=${page}&type=${isTextureMode ? 'texture' : 'color'}`;
            const formData = new FormData();
            formData.append('file', imageToUse);
            options = { method: 'POST', body: formData };
        } else {
            // Pagination request without image file
            url = `http://localhost:5000/change_page?page=${page}`;
            options = { method: 'GET' };
        }
    
        fetch(url, options)
            .then(response => response.json())
            .then(data => {
                setSearchResults(data.images || []);
                setTotalPages(Math.max(0, data.total_pages));
                setCurrentPage(data.current_page || 1);
                setTotalImages(data.total_images || 0);
                setSearchDuration(data.search_duration || 0);
            })
            .catch(error => {
                console.error(error);
                setSearchResults([]);
                setTotalPages(0);
            })
            .finally(() => setIsSearching(false));
    };
    
    const handleSearch = () => {
        if (!imageFile) {
            alert("Please upload an image first.");
            return;
        }
        setCurrentPage(1);
        fetchImages(1, true); // true for new search
    };
    
    
    useEffect(() => {
        if (imageFile) {
            fetchImages(currentPage);
        }
    }, [currentPage]);
    
    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            processFile(file);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            const file = event.dataTransfer.files[0];
            processFile(file);
        }
    };

    //  function to process the file
    const processFile = (file) => {
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setImageURL(url);
            setImageFile(file);
            setImageUploadSuccess(true); // Set success state
            setTimeout(() => setImageUploadSuccess(false), 2000); // Reset after 2 seconds
            
        } else {
            alert("Please upload a valid image file.");
        }
    };

    // Function to prevent default behavior on drag over
    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleFolderFileChange = (event) => {
        setFolderFile(event.target.files[0]);
    };


    const handleToggleChange = () => {
        console.log("h1");
        setIsTextureMode(!isTextureMode);
        console.log(isTextureMode);
    };
    

    const handleImageError = () => {
        setImageURL(null);
    };


    const handleDownloadPdf = () => {
        // Send a GET request to the backend to download the PDF
        fetch('http://localhost:5000/download_pdf', {
            method: 'GET',
        })
        .then(response => {
            // Handle response from the server
            if (response.ok) {
                return response.blob();
            }
            throw new Error('Network response was not ok.');
        })
        .then(blob => {
            // Create a new URL 
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'downloaded.pdf'; // Specify the file name
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    };


    // Update handleFileChange to also set imageFile
    const maxPageNumbers = 5;

    const handlePrev = () => {
        setCurrentPage(Math.max(1, currentPage - 1));
    };

    const handleNext = () => {
        setCurrentPage(Math.min(totalPages, currentPage + 1));
    };

    const getPageNumbers = () => {
        const startPage = Math.max(currentPage - 2, 1);
        const endPage = Math.min(startPage + maxPageNumbers - 1, totalPages);

        return [...Array((endPage + 1) - startPage).keys()].map(n => startPage + n);
    };

    const CheckmarkIcon = () => (
        <div class="svg-container">    
            <svg class="ft-green-tick" xmlns="http://www.w3.org/2000/svg" height="50" width="50" viewBox="0 0 48 48" aria-hidden="true">
                <circle class="circle" fill="#5bb543" cx="24" cy="24" r="22"/>
                <path class="tick" fill="none" stroke="#FFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14 27l5.917 4.917L34 17"/>
            </svg>
        </div>
    );

    const handleCloseModal = () => {
        setShowModal(false);
        setLinkInput(''); // Clear the link input when modal is closed
    };

    const handleShowModal = () => {
        setLinkInput('');
        setShowModal(true);
    }

    useEffect(() => {
        let intervalId;
        if (useCamera) {
            setIsCameraloading(true);
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    setIsCameraloading(false);
    
                    // Set up an interval to take a picture every 10 seconds
                    intervalId = setInterval(() => {
                        captureImageFromVideo(videoRef.current);
                    }, 10000);
                })
                .catch(err => {
                    console.error('Error accessing camera:', err);
                });
        } else {
            // Clear the interval and stop the video stream when not using the camera
            clearInterval(intervalId);
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();

                tracks.forEach(function (track) {
                    track.stop();
                });

                videoRef.current.srcObject = null;
            }
        }
    
        // Cleanup on unmount
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
    
                tracks.forEach(function (track) {
                    track.stop();
                });
    
                videoRef.current.srcObject = null;
            }
        };
    }, [useCamera , isTextureMode]);

    const handleToggleCamera = () => {
        const shouldUseCamera = !useCamera;
        setUseCamera(shouldUseCamera);

        if (!shouldUseCamera) {
            // If we're toggling off the camera, stop the video stream
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();

                tracks.forEach(function (track) {
                    track.stop();
                });

                videoRef.current.srcObject = null;
            }
            setImageURL(null); // Clear the existing image URL
        }
    };

    const captureImageFromVideo = (videoElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d').drawImage(videoElement, 0, 0);
        canvas.toBlob(blob => {
            // Convert the blob to a File object
            const image = new File([blob], "capture.jpg", { type: "image/jpeg" });
            // Set the image URL and file in the state
            console.log(image)
            const url = URL.createObjectURL(blob);
            setImageURL(url);
            setImageFile(image);
            setImageUploadSuccess(true);
            setTimeout(() => setImageUploadSuccess(false), 2000);
            // Call fetchImages to process the image
            setCurrentPage(1);
            fetchImages(1, true,image); // Assume page 1 and new search
        }, 'image/jpeg');
    };

    const handleSubmitLink = () => {
        if (!linkInput) {
            alert("Please enter a URL.");
            return;
        }
        setIsUploading(true);
        // backend endpoint for handling the URL submission
        const url = 'http://localhost:5000/scrape_images';

        // Send the URL to backend
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: linkInput }),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Link submission response:", data);
            setUploadSuccess(true); // Show success message
            setTimeout(() => {
                setIsUploading(false); // Hide loading and success message after a delay
                setUploadSuccess(false);
            }, 2000); // 2 seconds delay

            setShowModal(false); // Hide the modal after submission
            setLinkInput(''); // Clear the input field
        })
        .catch(error => {
            console.error("Error submitting link:", error);
        });
    };


    const handleFolderChange = async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        const zip = new JSZip();
        Array.from(files).forEach((file) => {
            zip.file(file.webkitRelativePath || file.name, file);
        });

        try {
            const zipBlob = await zip.generateAsync({ type: "blob" });
            setZipFile(zipBlob); // Save the zipped file in the state
        } catch (error) {
            console.error("Error zipping files:", error);
        }
    };

    const handleUploadZip = () => {
        if (!zipFile) {
            return;
        }
    
        setIsUploading(true); // Start loading
    
        const formData = new FormData();
        formData.append('file', zipFile);
    
        fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            setUploadSuccess(true); // Show success message
            setTimeout(() => {
                setIsUploading(false); // Hide loading and success message after a delay
                setUploadSuccess(false);
            }, 2000); // 2 seconds delay
        })
        .catch(error => {
            console.error(error);
            setIsUploading(false); // Stop loading on error
        });
    };

    return (
        <div  className='w-full h-screen relative'>
            <div 
                className="fixed w-full h-full bg-cover bg-center"
                style={{backgroundImage: `url(${"searchbg.jpeg"})`}}
            ></div>
            <div 
                className="fixed w-full h-full bg-black z-10 opacity-80"></div>
            <div className="absolute container mx-auto py-28 text-center text-white z-30 top-5">
                <div className="mb-6 text-5xl text-white font-bold  tracking-widest font-reemkufi">Snap Twins</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 mx-4">
                <div>
                        {/* <div className='mb-4 font-bold font-reemkufi'>Upload Image Here : </div> */}
                        <div className="flex items-center justify-center mb-5">
                            <button 
                                className={`w-1/3 text-center py-2 font-bold rounded-l-lg ${!useCamera ? 'bg-[#00ff3b] text-black' : 'bg-gray-300 text-gray-700'}`}
                                onClick={handleToggleCamera}
                            >
                                Upload Image
                            </button>
                            <button 
                                className={`w-1/3 text-center py-2 font-bold rounded-r-lg ${useCamera ? 'bg-[#00ff3b] text-black' : 'bg-gray-300 text-gray-700'}`}
                                onClick={handleToggleCamera}
                            >
                                Use Camera
                            </button>
                        </div>


                        {useCamera ? (
                            <div className="camera-container flex items-center justify-center ">
                                <div className='w-[400px] h-[300px]'>
                                {isCameraLoacding && (
                                    <div className="w-full h-full bg-[#454242] inset-0 flex items-center justify-center flex-row rounded-xl">
                                        {/* Replace this div with your loading spinner or animation */}
                                        <div className='loader'></div>
                                        <div className="ml-5 text-xl font-bold">Loading...</div> 
                                    </div>
                                )}
                                    <video ref={videoRef} width="400" height="300" className='rounded-xl'></video>
                                </div>
                            </div>
                        ) : (

                            <div 
                                className="flex justify-center items-center w-3/4 mx-auto relative"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragOver}
                                onDragLeave={handleDragOver}
                            >
                                {imageURL && (
                                    <img 
                                        src={imageURL} 
                                        alt="Uploaded" 
                                        className="object-contain h-80 w-3/5 md:w-10/12 rounded-lg" 
                                        onError={handleImageError} 
                                    />
                                )}

                                {!imageURL && (
                                    <div className="flex flex-col items-center justify-center h-80 w-full bg-transparent rounded-lg border-2  border-gray-300 text-xl">
                                        <img src="iconupload.png" className='slow-bounce w-[40%] h-[170px]'></img>
                                        <p className="text-white">Drag and drop image here</p>
                                        <p className="text-gray-400 mt-2">or click here to upload</p>
                                    </div>
                                )}

                                <input
                                    className="cursor-pointer absolute inset-0 block w-full opacity-0"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                
                            </div>
                        )}
                    </div>
                    

                    <div className="container">
                        <h2 className="text-2xl font-bold mb-4">Upload Dataset</h2>
                        
                        <div className="mb-4">
                            <input
                                className="w-3/5 text-md p-2 border border-gray-300 rounded mb-2 mr-5"
                                type="file"
                                webkitdirectory="true"
                                directory="true"
                                multiple
                                onChange={handleFolderChange}
/>
                            <button 
                                className="px-4 py-3 bg-[#00ff3b] text-black font-semibold rounded-lg hover:bg-green-500"
                                onClick={handleUploadZip}
                            >
                                Upload Folder
                            </button>
                        </div>

                        <div className='text-white  text-xl font-reemkufi font-bold mt-10 w-full flex justify-between items-center tracking-widest'>
                            <div className='ml-[70px]'>Insert  dataset  from website link :</div>
                            <button className='bg-[#ff0000] mr-[70px] px-5 py-3 rounded-[100px] font-reemkufi font-bold border border-[#ff0000] hover:bg-red-500' onClick={handleShowModal}>Image Scraping</button>
                        </div>
                        <div className='flex flex-row mt-10 justify-between mb-10'>
                            <div className='ml-[70px] tracking-widest text-white  text-xl font-reemkufi font-bold'>Choose Your Search Options : </div>
                            <div className='mr-[120px]'>
                                <input
                                    className="mr-2 mt-1 h-5 w-12 appearance-none rounded-lg bg-neutral-300 before:pointer-events-none before:absolute before:h-5 before:w-5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-6 after:w-6 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-lg after:transition-all after:content-[''] checked:bg-blue-500 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.625rem] checked:after:h-6 checked:after:w-6 checked:after:rounded-full checked:after:border-none checked:after:bg-blue-500 checked:after:shadow-lg checked:after:transition-all hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-lg focus:before:transition-all focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-6 focus:after:w-6 focus:after:rounded-full focus:after:content-[''] checked:focus:border-blue-500 checked:focus:bg-blue-500 checked:focus:before:ml-[1.625rem] checked:focus:before:scale-100 checked:focus:before:shadow-lg checked:focus:before:transition-all dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-blue-500 dark:checked:after:bg-blue-500 dark:focus:before:shadow-lg dark:checked:focus:before:shadow-lg"
                                    type="checkbox"
                                    role="switch"
                                    id="flexSwitchCheckDefault"
                                    checked={isTextureMode}
                                    onChange={handleToggleChange}
                                />
                                <label
                                    className="inline-block pl-1 text-lg hover:cursor-pointer"
                                    htmlFor="flexSwitchCheckDefault"
                                >
                                    {isTextureMode ? 'Texture' : 'Color'}
                                </label>
                            </div>
                        </div>

                        

                        {/* Search Button */}
                        {
                            !useCamera && ( // Render the button only if useCamera is false
                                <button 
                                    onClick={handleSearch}
                                    className="mt-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded shadow-lg hover:shadow-xl transition duration-300"
                                >
                                    Search Image Similarity
                                </button>
                            )
                        }
                    </div>


                
                </div>
                
                {Array.isArray(searchResults) && (
                    searchResults.length > 0 ? (
                        <>
                                    <div className="my-6 p-4 bg-blue-100 rounded-lg shadow">
                                        <h3 className="text-xl font-semibold text-blue-800">Search Results:</h3>
                                        <p className="text-blue-600">Total Images: <span className="font-bold">{totalImages}</span></p>
                                        <p className="text-blue-600">Search Duration: <span className="font-bold">{searchDuration.toFixed(2)} seconds</span></p>
                                    </div>
                                    <div className="container mx-auto p-4">
                        {/* Images grid */}
                        <div className="grid grid-cols-3 gap-4 mb-4 mx-28 truncate">
                            {searchResults.map((result, index) => (
                                <div key={index} className="w-full h-full flex justify-center items-center">
                                    <div className="w-1/2 h-1/2 flex flex-col items-center justify-center">
                                        <img src={`http://localhost:5000${result.image_url}`} alt={`Similar to uploaded`} className="object-cover rounded-lg" />
                                        <div className="text-center mt-2">
                                            <p>Similarity: {result.similarity}%</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination control */}
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={handlePrev} disabled={currentPage === 1} className="flex items-center gap-2">
                                <ArrowLeftIcon className="h-4 w-4" /> Previous
                            </button>

                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    disabled={currentPage === page}
                                    className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button onClick={handleNext} disabled={currentPage === totalPages} className="flex items-center gap-2">
                                Next <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        </div>

                        </div>
                        <div><button onClick={handleDownloadPdf} className='text-2xl font-bold border-[#00ff3b]  text-black rounded-lg mt-[30px] py-[15px] px-[20px] bg-[#00ff3b] hover:bg-green-500 drop-shadow-[0_2px_4px_rgba(255,255,255,0.7)]'>Download pdf</button></div>
                                </>
                    ) : (
                        <div className="my-6 p-4 bg-red-100 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-red-800">No Results Found</h3>
                            <p className="text-red-600">There are no similar images found in the dataset.</p>
                        </div>
                    )
                )}

                
                </div>

                {imageUploadSuccess && (
                    <div className="absolute right-10 bottom-10 text-white px-5 py-2 bg-green-500 z-50 rounded-[100px] flex items-center justify-center text-xl font-extrabold slow-bounce">
                        <CheckmarkIcon/>
                        Upload Success
                    </div>
                )}
                
                {isUploading && (
                    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="p-5 bg-white rounded-lg flex items-center justify-center text-xl font-bold">
                        {uploadSuccess ? (
                            <>
                                <CheckmarkIcon/>
                                <span className="ml-3">Upload successful!</span>
                            </>
                        ) : (
                            <>
                                <div className="spinner"></div>
                                <span className="ml-3">Uploading dataset... Please wait.</span>
                            </>
                        )}
                        </div>
                    </div>
                )}
                {isSearching && (
                    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="p-5 bg-white rounded-lg flex items-center justify-center text-xl font-bold">
                            <div className="spinner"></div>
                            <span className="ml-3">Searching... Please wait.</span>
                        </div>
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 text-white font-reemkufi">
                        <div className="bg-gray-800 shadow-xl border border-gray-400 p-4 rounded-lg relative">
                            <button
                                className="absolute top-2 right-3 text-white text-lg font-bold"
                                onClick={handleCloseModal}
                            >
                                X {/* This is your close button */}
                            </button>
                            <h2 className="text-lg mb-4">Enter Dataset Link</h2>
                            <input
                                type="text"
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                className="border border-gray-300 rounded p-2 mb-4 w-full text-black"
                                placeholder="Enter link here"
                            />
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleSubmitLink}
                            >
                                Upload Link
                            </button>
                        </div>
                    </div>
                )}

               
                
        </div>
    );
}

export default Search2;
