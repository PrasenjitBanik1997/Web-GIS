import React from 'react'
import { Navigate,Route,Routes } from 'react-router-dom'
import Home from '../components/home/Home'




export default function Routing() {
  return (
    <div>
        <Routes>
            <Route path='' element={<Navigate to='/home'/>}></Route>
            <Route path='/home' element={<Home/>} />
        </Routes>
    </div>
  )
}
