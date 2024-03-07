import axios from "axios";
import { rooApiUrl } from "../environment/Environment";
import { rooApiUrlFromRemoteServer } from "../environment/Environment";



// export const getLayerData = async () => {
//     return await axios.get(`${rooApiUrl}/ows`, {
//         params: {
//             service: 'WFS',
//             version: '1.0.0',
//             request: 'GetFeature',
//             typeName: 'haldia:road',
//             //valueReference:'the_geom',
//             outputFormat: 'json'
//         },

//         // auth: {
//         //     username: 'geoserver',
//         //     password: 'admin'
//         // },
//         // headers: {
//         //     'Content-Type': 'text/xml',
//         //     "Access-Control-Allow-Origin": "*",
//         //     "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
//         // },

//     })
// }

export const getLayerDataByQuery = async (qUrl) => {
    return await axios.get(qUrl)
}

export const getAllLayer = async () => {
    return await axios.get(`${rooApiUrl}/wfs`, {
        params: {
            version: '1.0.0',
            request: 'getCapabilities',
            outputFormat: 'json'
        },
    })
}

export const getAttributeByLayerName = async (selectedLayer) => {
    return await axios.get(`${rooApiUrl}/wfs`, {
        params: {
            service: 'wfs',
            version: '2.23.2',
            request: 'DescribeFeatureType',
            typeNames: selectedLayer,
            //valueReference:'the_geom',
            //outputFormat: 'xml'
        },
    })
}

export const getFacilityByFacilityRefNo = async (refNo) => {
    return await axios.get(`${rooApiUrlFromRemoteServer}/api/facility/get-facility`, {
        params: {
            facilityRefNo:refNo
        }
    })
}





// export const getLayerDataByQuery = async (queryDetails) => {
//     return await axios.get(`${rooApiUrl}/ows`, {
//         params: {
//             service: 'WFS',
//             version: '1.0.0',
//             request: 'GetFeature',
//             typeName: queryDetails.layerName,
//             //valueReference:'the_geom',
//             CQL_FILTER: `${queryDetails.attributeName}+${queryDetails.operatorName}+%27${queryDetails.inputValue}%27`,
//             outputFormat: 'json',
//         },

//         // auth: {
//         //     username: 'geoserver',
//         //     password: 'admin'
//         // },
//         // headers: {
//         //     'Content-Type': 'text/xml',
//         //     "Access-Control-Allow-Origin": "*",
//         //     "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
//         // },

//     })
// }

export const getLayerData = async (url) => {
    return await axios.get(url)
}

export const getFeatureByQuery = async (spUrl) => {
    return await axios.get(spUrl)
}