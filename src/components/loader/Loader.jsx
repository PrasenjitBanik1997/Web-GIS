import React from 'react';
import './Loader.css';
import { Bars, RotatingLines } from 'react-loader-spinner';

function Loader({isLoading}) {


    return (
        <div className='loading' hidden={!isLoading}>
            {/* <Bars
                height="100"
                width="100"
                color="#0d47a1"
                ariaLabel="bars-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            /> */}

            <RotatingLines
                strokeColor="white"
                strokeWidth="5"
                animationDuration="2"
                width="96"
                visible={isLoading}
            />
        </div>
    )
}

export default Loader