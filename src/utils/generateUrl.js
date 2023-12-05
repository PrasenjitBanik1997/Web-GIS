import { getFeatureByQuery } from "../services/LayerInfoService";

export const generateListOfUrlForFetchingSpatialQueryData = (selectedLayerList, selectedGeom, markerType, cordList, lengthValue) => {
    let urlList = [];
    urlList = selectedLayerList.map((ele, ind) => {
        return `http://localhost:8080/geoserver/haldia/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${ele}&CQL_FILTER=DWITHIN(${selectedGeom},${markerType.toUpperCase()}(${cordList}),${Number(lengthValue)},${'meters'})&outputFormat=application/json`
    });
    return urlList;
}


export const generateDataForSpatialQuery = async (urlList, layerList) => {
    try {
        const results = await Promise.all(urlList.map(async (ele, ind) => {
            let res = await getFeatureByQuery(ele) //api is called in this line;
            console.log(res.data);
            let columnName = res.data.features.length > 0 ? Object.keys(res.data.features[0].properties) : [];
            columnName = (columnName.length !== 0) && (columnName.length) > 10 ? columnName.filter((colName, colInd) => colInd <= 9) : columnName;
            let tableData = res.data.features.length > 0 ? res.data.features.map((ele) => ele.properties) : [];
            let layerName = layerList[ind].split(':')[1];
            let obj = { layerName: layerName, tableData: tableData, columnName: columnName };
            return obj;
        }));
        return results;
    } catch (error) {
        // Handle errors if needed
        console.error(error);
        throw error; // Re-throw the error to propagate it if necessary
    }
}