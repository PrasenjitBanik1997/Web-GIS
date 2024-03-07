import axios from "axios";
import { rooApiUrl } from "../environment/Environment";
import { rooApiUrlFromRemoteServer } from "../environment/Environment";


export const getAllWaterWithdrawal = async (facilityRefNo,corporateRefNo) => {
    return await axios.get(`${rooApiUrlFromRemoteServer}/api/water/water-withdrawal/get-all`, {
        params: {
            facilityRefNo:facilityRefNo,
            corporateRefNo:corporateRefNo
        }
    })
}

export const getAllWaterDischarge = async (facilityRefNo,corporateRefNo) => {
    return await axios.get(`${rooApiUrlFromRemoteServer}/api/water/water-discharge/get-all-data`, {
        params: {
            facilityRefNo:facilityRefNo,
            corporateRefNo:corporateRefNo
        }
    })
}

export const getAllWasteGeneration = async (facilityRefNo,corporateRefNo) => {
    return await axios.get(`${rooApiUrlFromRemoteServer}/api/waste-generation/get-all`, {
        params: {
            facilityRefNo:facilityRefNo,
            corporateRefNo:corporateRefNo
        }
    })
}

export const getAllAirEmission = async (facilityRefNo,corporateRefNo) => {
    return await axios.get(`${rooApiUrlFromRemoteServer}/api/air-emissions-point-source/get-all`, {
        params: {
            facilityRefNo:facilityRefNo,
            corporateRefNo:corporateRefNo
        }
    })
}