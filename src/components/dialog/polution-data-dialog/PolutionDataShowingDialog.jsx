import { React, useEffect, useState} from 'react';
import { material } from '../../../library/material';
import './PolutionDataShowingDialog.css'
import { getAllWasteGeneration } from '../../../services/FacilityInfo';
import PolutionDataTable from '../../table/table-for-polution-data/PolutionDataTable';
function PolutionDataShowingDialog({ polutionData, close }) {

    const [polutionDatadetails, setPolutionDatadeatils] = useState({ ...polutionData });
    const [wasteData, setWasteData] = useState([]);

    useEffect(() => {
        setPolutionDatadeatils(polutionData);
        getPolutionData();
    }, [polutionData])


    const closePolutionDialog = () => {
        close()
    }

    const getPolutionData = async() => {
        let facilityRefNo = polutionData?.industryDetails?.ref_no;
        let corporateRefNo = polutionData?.industryDetails?.corporate_ref_no;
        if (polutionData?.openFor === 'waste') {
           await getAllWasteGeneration(facilityRefNo, corporateRefNo).then(rep => {
                setWasteData(rep.data.dtoList)
            })
        }
    }

    return (
        <div>
            <material.Dialog fullScreen hideBackdrop open={polutionDatadetails?.open} sx={{ p: 4, mt: 12 }}>
                <material.DialogTitle className='fw-bold'>
                    {polutionDatadetails?.openFor === 'water' ? "Water Withdrawal And Water Discharge History" :
                        polutionDatadetails?.openFor === 'air' ? "Air Emissions - Point Source History" :
                            polutionDatadetails?.openFor === 'waste' ? "Waste Generation history" : null
                    }
                </material.DialogTitle>
                <material.DialogContent>
                    {
                        polutionDatadetails?.openFor === 'waste' ?
                            (
                                <PolutionDataTable columns={Object.keys(wasteData.length>0?wasteData[0]:{})} data={wasteData} />
                            ) : null
                            
                    }
                </material.DialogContent>
                <material.DialogActions sx={{ pr: 2, pb: 2 }}>
                    <material.Button variant="outlined" color='error' sx={{ textTransform: "none" }} startIcon={<material.CloseIcon />} onClick={closePolutionDialog}>Close</material.Button>
                </material.DialogActions>
            </material.Dialog>
        </div>
    )
}

export default PolutionDataShowingDialog