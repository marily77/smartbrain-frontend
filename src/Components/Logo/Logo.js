import React from "react";
import Tilt from 'react-parallax-tilt';
import './logo.css';
import brain from './brainlogo.png';

const Logo = () => {
    return (
        <div className="ma4 mt0">
            <Tilt>
                <div style={{ height: '150px', width: '150px', backgroundColor: '#0abfec', }}>
                    <h1><img alt='logo' src={brain} /></h1>
                </div>
            </Tilt>

        </div>
    );
}


export default Logo;