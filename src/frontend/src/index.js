import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Firstpage from './component/Firstpage';
import Aboutus from './component/AboutUs';
import Search2 from './component/Search2';
import Guide from './component/Guide';
import Tech from './component/Tech';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div>
    {/* <Navbar/> */}
    <Router>
      
    <App />
    
      <Routes>
        <Route path="/Home" element={<Firstpage />} />
        <Route path="/Search" element={<Search2 />} />
        <Route path="/AboutUs" element={<Aboutus />} />
        <Route path="/" element={<Firstpage />} />
        <Route path="/HowToUse" element={<Guide/>} />
        <Route path="/Technology" element={<Tech/>} />
        {/* // Define other routes here */}
      </Routes>
    </Router>
   
  </div>
);

