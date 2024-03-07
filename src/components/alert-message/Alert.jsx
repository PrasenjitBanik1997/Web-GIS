import { React, useEffect, useState} from 'react';
import { material } from '../../library/material';
import './Alert.css'

function Alert({ messageInfo }) {
    const [alertDetails, setAlertDetalis] = useState({ ...messageInfo });

    useEffect(() => {
        setAlertDetalis(messageInfo);
        if (messageInfo.isVisiable) {
            setTimeout(() => {
                closeMessegeDialog()
            }, 3000);
        };
    }, [messageInfo])

    
    const closeMessegeDialog = () => {
        setAlertDetalis({})
    }



    return (
        <div hidden={!alertDetails.isVisiable} className='container-fluid main'>
            <div className="row justify-content-center align-items-center">
                {/* Success */}
                {alertDetails.type === 'success' ?
                    (<div className="col-3 d-flex flex-column justify-content-center align-items-center p-3 success">
                        <span>
                            <material.CheckCircleOutlineIcon fontSize='large' />
                        </span>
                        <span className='mt-1 text-center' >
                            {alertDetails.message}
                        </span>
                        <span className='mt-3'>
                            <material.Button variant="contained" size="small" color="success" onClick={closeMessegeDialog}>
                                Close
                            </material.Button>
                        </span>

                    </div>)
                    :
                    alertDetails.type === 'error' ?
                        (<div className="col-3 d-flex flex-column justify-content-center align-items-center p-3 error">
                            <span>
                                <material.DangerousIcon fontSize='large' />
                            </span>
                            <span className='mt-1 text-center'>
                                {alertDetails.message}
                            </span>
                            <span className='mt-3'>
                                <material.Button variant="contained" size="small" color="error" onClick={closeMessegeDialog}>
                                    Close
                                </material.Button>
                            </span>
                        </div>)
                        :
                        alertDetails.type === 'info' ? (
                            <div className="col-3 d-flex flex-column justify-content-center align-items-center p-3 info">
                                <span>
                                    <material.InfoIcon fontSize='large' />
                                </span>
                                <span className='mt-1 text-center'>
                                    {alertDetails.message}
                                </span>
                                <span className='mt-3'>
                                    <material.Button variant="contained" size="small" onClick={closeMessegeDialog}>
                                        Close
                                    </material.Button>
                                </span>
                            </div>
                        )
                            :
                            alertDetails.type === 'warning' ? (<div className="col-3 d-flex flex-column justify-content-center align-items-center p-3 warning">
                                <span>
                                    <material.WarningIcon fontSize='large' />
                                </span>
                                <span className='mt-1 text-center'>
                                    {alertDetails.message}
                                </span>
                                <span className='mt-3'>
                                    <material.Button variant="contained" size="small" onClick={closeMessegeDialog}>
                                        Close
                                    </material.Button>
                                </span>
                            </div>)
                                :
                                null
                }
            </div>
        </div>
    )
}

export default Alert