import { useState,useEffect } from 'react'
import {Navigate} from 'react-router-dom'

const PrivateRoute = ({ element: Component }) => {

    const token = localStorage.getItem('access');

    
    return token ? Component : <Navigate to="/login" />;
}
 
export default PrivateRoute;