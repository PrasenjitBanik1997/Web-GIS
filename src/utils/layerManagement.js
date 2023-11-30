import TileWMS from 'ol/source/TileWMS.js';
import TileLayer from 'ol/layer/Tile';
import { Group as LayerGroup } from 'ol/layer.js';


let haldiaMouza = new TileLayer({
    visible: true,
    source: new TileWMS({
        url: 'http://localhost:8080/geoserver/wms',
        params: {
            "TILED": true,
            "LAYERS": 'haldia:mouza',
        },
        serverType: 'geoserver',
    }),
    zIndex: 1,
});

let haldiaPlanningArea = new TileLayer({
    visible: true,
    source: new TileWMS({
        url: 'http://localhost:8080/geoserver/wms',
        params: {
            "TILED": true,
            "LAYERS": 'haldia:haldia_planning_area',
        },
        serverType: 'geoserver',
    }),
});

let haldiaRoad = new TileLayer({
    visible: true,
    source: new TileWMS({
        url: 'http://localhost:8080/geoserver/wms',
        params: {
            "TILED": true,
            "LAYERS": 'haldia:road',
        },
        serverType: 'geoserver',
    }),
    zIndex: 1,
});

let haldiaIndustry = new TileLayer({
    visible: true,
    source: new TileWMS({
        url: 'http://localhost:8080/geoserver/wms',
        params: {
            "TILED": true,
            "LAYERS": 'haldia:industry',
        },
        serverType: 'geoserver',
    }),
    zIndex: 1,
});
let haldiaStorage = new TileLayer({
    visible: true,
    source: new TileWMS({
        url: 'http://localhost:8080/geoserver/wms',
        params: {
            "TILED": true,
            "LAYERS": 'haldia:storage',
        },
        serverType: 'geoserver',
    }),
    zIndex: 2,
});

let layer1503HaKhasra = new TileLayer({
    visible: true,
    source: new TileWMS({
        url: 'http://localhost:8080/geoserver/wms',
        params: {
            "TILED": true,
            "LAYERS": 'haldia:layer_1503_ha_khasra-polygon',
        },
        serverType: 'geoserver',
    }),
});

let indiaState = new TileLayer({
    visible: true,
    source: new TileWMS({
        url: 'http://localhost:8080/geoserver/wms',
        params: {
            "TILED": true,
            "LAYERS": 'haldia:india_state_boundary',
        },
        serverType: 'geoserver',
    }),
});

let indiaVillageWestbengal = new TileLayer({
    visible: true,
    source: new TileWMS({
        //projection: 'EPSG:32644', // here is the source projection
        url: 'http://localhost:8080/geoserver/wms',
        params: {
            "TILED": true,
            "LAYERS": 'haldia:wb_village',
        },
        serverType: 'geoserver',
    }),
});

export const addLayerToMap = (map, layerDetails) => {
    let currentLayer = null;
    if (layerDetails && layerDetails?.layerList.length > 0) {
        // if (currentLayer != null) {
        //     map.removeLayer(currentLayer);
        // }
        if (layerDetails.layerList.filter(layers => layers.isActive).length > 0) {
            let activeLayer = layerDetails.layerList.filter(layers => layers.isActive)[0].layerName;
            if (activeLayer === 'HALDIA_MOUZA') {
                map.addLayer(haldiaMouza);
                currentLayer = haldiaMouza;
                let extent = [9802598.190540502, 2513064.701468866, 9807382.456989272, 2534994.7038455834]
                map.getView().fit(extent, {
                    duration: 1600, // Set the duration for the animation (in milliseconds)
                    //padding: [10, 10, 10, 10], // Optional: Add padding around the extent
                    maxZoom: 20 // Optional: Specify the maximum zoom level
                });
            } else if (activeLayer === 'HALDIA_PLANNING_AREA') {
                map.addLayer(haldiaPlanningArea);
                currentLayer = haldiaPlanningArea;
                let extent = [9802598.190540502, 2513064.701468866, 9807382.456989272, 2534994.7038455834]
                map.getView().fit(extent, {
                    duration: 1600, // Set the duration for the animation (in milliseconds)
                    //padding: [10, 10, 10, 10], // Optional: Add padding around the extent
                    maxZoom: 20 // Optional: Specify the maximum zoom level
                });
            } else if (activeLayer === 'HALDIA_ ROAD') {
                map.addLayer(haldiaRoad);
                currentLayer = haldiaRoad;
                let extent = [9802474.067558413, 2513759.4512988343, 9811313.398093091, 2533745.2018277766]
                map.getView().fit(extent, {
                    duration: 1600, // Set the duration for the animation (in milliseconds)
                    //padding: [10, 10, 10, 10], // Optional: Add padding around the extent
                    maxZoom: 12 // Optional: Specify the maximum zoom level
                });
            } else if (activeLayer === 'HALDIA_STORAGE') {
                map.addLayer(haldiaStorage);
                currentLayer = haldiaStorage;
                let extent = [9807723.098211138, 2516817.011149502, 9808648.194763629, 2520484.287241721]
                map.getView().fit(extent, {
                    duration: 1600, // Set the duration for the animation (in milliseconds)
                    //padding: [10, 10, 10, 10], // Optional: Add padding around the extent
                    maxZoom: 25 // Optional: Specify the maximum zoom level
                });
            } else if (activeLayer === 'HALDIA_INDUSTRY') {
                map.addLayer(haldiaIndustry);
                currentLayer = haldiaIndustry;
                let extent = [9806964.512858635, 2515325.583324111, 9809616.886151792, 2520624.5853277976]
                map.getView().fit(extent, {
                    duration: 1600, // Set the duration for the animation (in milliseconds)
                    //padding: [10, 10, 10, 10], // Optional: Add padding around the extent
                    maxZoom: 18 // Optional: Specify the maximum zoom level
                });
            } else if (activeLayer === 'INDIA_STATE') {
                map.addLayer(indiaState);
                currentLayer = indiaState;
                let extent = [8548452.33775359, 944645.5104109896, 8931932.38070152, 4284952.439542378]
                map.getView().fit(extent, {
                    duration: 1600, // Set the duration for the animation (in milliseconds)
                    //padding: [10, 10, 10, 10], // Optional: Add padding around the extent
                    maxZoom: 25 // Optional: Specify the maximum zoom level
                });
            } else if (activeLayer === 'INDIA_VILLAGE_WB') {
                map.addLayer(indiaVillageWestbengal);
                currentLayer = indiaVillageWestbengal;
                let extent = [9740957.746955309, 2471653.9277088917, 9981610.874710262, 3097985.7872968162]
                map.getView().fit(extent, {
                    duration: 1600, // Set the duration for the animation (in milliseconds)
                    //padding: [10, 10, 10, 10], // Optional: Add padding around the extent
                    maxZoom: 6.9 // Optional: Specify the maximum zoom level
                });
            } else if (activeLayer === 'LAYER_KHASRA_POLYGON') {
                map.addLayer(layer1503HaKhasra);
                //setCurrentLayer(haldiaIndustry);
                currentLayer = layer1503HaKhasra;
                map.getView().animate({
                    zoom: 12,
                    duration: 1590,
                });
            }
        } else {
            let groupOfLayers = [];
            if (layerDetails?.layerList.find(ele => ele.layerName === 'HALDIA_MOUZA')) {
                groupOfLayers.push(haldiaMouza);
                currentLayer = null;
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'HALDIA_PLANNING_AREA')) {
                groupOfLayers.push(haldiaPlanningArea);
                currentLayer = null;
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'HALDIA_ ROAD')) {
                groupOfLayers.push(haldiaRoad);
                currentLayer = null;
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'HALDIA_STORAGE')) {
                groupOfLayers.push(haldiaStorage);
                currentLayer = null;
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'HALDIA_INDUSTRY')) {
                groupOfLayers.push(haldiaIndustry);
                currentLayer = null;
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'LAYER_KHASRA_POLYGON')) {
                groupOfLayers.push(layer1503HaKhasra);
                currentLayer = null;
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'INDIA_STATE')) {
                groupOfLayers.push(indiaState);
                currentLayer = null;
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'INDIA_VILLAGE_WB')) {
                groupOfLayers.push(indiaVillageWestbengal);
                currentLayer = null;
            }
            // else if (layerDetails === 'ALL') {
            //     map.addLayer(layerGroup);
            //     //setCurrentLayer(null);
            //     currentLayer = null;
            // }
            let layerGroup = new LayerGroup({
                layers: groupOfLayers
            });

            map.addLayer(layerGroup);
            // let extent = [8548452.33775359, 944645.5104109896, 8931932.38070152, 4284952.439542378]
            // map.getView().fit(extent, {
            //     duration: 1600, // Set the duration for the animation (in milliseconds)
            //     maxZoom: 25 // Optional: Specify the maximum zoom level
            // });
        }

    }

    return currentLayer;
}

