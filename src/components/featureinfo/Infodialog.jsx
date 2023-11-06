import React from 'react';
import { material } from '../../library/material';

function Infodialog(props) {

    const { overlayKeys, overlayData } = props;
    return (
        <div className="row p-2" style={{
            width:'400px',
            height: 'auto'
        }}>
            {/* <div className="col-12 ">
                <div className='p-2 d-flex flex-row justify-content-between align-items-center bg-info rounded-1 border border-primary'>
                    <span className='fw-bold fs-6  text-white'>Layer Details</span>
                    <material.CloseIcon style={{ color: 'white' }} onClick={showHidePopUp} />
                </div>
            </div> */}
            {overlayKeys.map((res, cInd) => (
                <div className="col-12 my-1 " key={cInd}>
                    <div className='d-flex flex-row p-1 align-items-center bg-light rounded-1 border border-primary'>
                        <span className='fw-bold fs-6  text-primary text-capitalize'>{res} :</span>
                        <span className='fw-bold fs-6 text-warning ms-1 text-wrap text-capitalize'> {overlayData[0][res]}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Infodialog