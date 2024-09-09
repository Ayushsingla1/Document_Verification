import { Route, Routes } from 'react-router-dom';
import './App.css';
import ContactUs from './pages/contact-us';
import Home from './pages/Home';
import SubmitDocs from './pages/SubmitDocs';
import HomePage from './pages/HomePage';
function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element = {<HomePage/>}>
        <Route index element = {<Home/>}/>
        <Route path = '/verify' element={<SubmitDocs/>}/>
        <Route path = '/contact' element = {<ContactUs/>}/>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
