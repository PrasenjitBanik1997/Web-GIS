import { React, useEffect, useState, useRef } from 'react';
import { useForm } from "react-hook-form";
import Table from '../table/Table';
import Drawer from '../drawer/Drawer';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { Group as LayerGroup } from 'ol/layer.js';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ.js';
import Draw from 'ol/interaction/Draw.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { fromLonLat, toLonLat, transform, transformExtent } from 'ol/proj';
import Feature from 'ol/Feature';
import { get as getProjection } from 'ol/proj.js';
import './Map.css';
import { useSelector } from 'react-redux';
import {
    DragRotateAndZoom,
    defaults as defaultInteractions,
} from 'ol/interaction.js';
import { OverviewMap, ScaleLine, defaults as defaultControls } from 'ol/control.js';
import { getArea, getLength } from 'ol/sphere';
import { LineString, Point, Polygon } from 'ol/geom';
import { unByKey } from 'ol/Observable';
import { material } from '../../library/material';
import { measurmentValueChangeAction } from '../../store/slice/MeasurmentvalueSlice';
import { useDispatch } from 'react-redux';
import TileWMS from 'ol/source/TileWMS.js';
import { getAllLayer, getLayerDataByQuery, getAttributeByLayerName, getLayerData, getFeatureForSpatialQuery } from '../../services/LayerInfoService';
import XMLParser from 'react-xml-parser';
import ZoomToExtent from 'ol/control/ZoomToExtent.js';
import queryIcon from '../../assets/map-image/queryIcon.png';
import popupShowIcon from '../../assets/map-image/showIcon.png';
import popupHideIcon from '../../assets/map-image/hideIcon.png';
import spatialQueryIcon from '../../assets/map-image/spatialqueryicon.png';
import { Icon, Style,Fill  } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON.js';
import Stroke from 'ol/style/Stroke.js';
import Overlay from 'ol/Overlay';
import * as ReactDOM from 'react-dom';
import Infodialog from '../featureinfo/Infodialog';
import Infoicon from '../../assets/map-image/infoIcon.png';
import * as olLoadingStrategy from 'ol/loadingstrategy';


var map;
var layerAfterQuery;
// var currentLayer = new TileLayer({
//     visible: true,
//     source: new TileWMS({
//         projection: 'EPSG:4326', // here is the source projection
//         url: 'http://localhost:8080/geoserver/wms',
//         params: {
//             "TILED": true,
//             "LAYERS": 'topp:states',
//         },
//         serverType: 'geoserver',
//     })
// })
var currentLayer=null;
var popup;
var spatialDrawFeature;
var coordinatesForSpatialFeature = [];
var newPointLayer = null;
var drawFeatureForMeasurment = null;

function MapComponent() {
    const popupRef = useRef(null);
    const popupContentRef = useRef(null);
    const dispatch = useDispatch();
    const mapName = useSelector((state) => state.MapchangerSlice.mapName);
    const drawFeatureType = useSelector((state) => state.MeasurmentchangerSlice.mesurmentType);
    const layerDetails = useSelector((state) => state.LayerChangerSlice.layerName);
    const {
        register: register1,
        getValues: getValues1,
        handleSubmit: handleSubmit1, reset: reset1,
        formState: { errors: errors1, isValid: isValid1 }
    } = useForm();
    const {
        register: register2,
        getValues: getValues2,
        handleSubmit: handleSubmit2, reset: reset2,
        formState: { errors: errors2, isValid: isValid2 }
    } = useForm();
    let listener;
    const source = new VectorSource({ wrapX: false });
    const vector = new VectorLayer({
        name: 'Draw',
        source: source,
        style: {
            'fill-color': 'rgba(255, 255, 255, 0.2)',
            'stroke-color': '#ffcc33',
            'stroke-width': 2,
            'circle-radius': 7,
            'circle-fill-color': '#ffcc33',
        },
    });

    const drawPoint = new VectorLayer({
        name: 'Point',
        source: new VectorSource(),
        style: {
            'fill-color': 'rgba(255, 255, 255, 0.2)',
            'stroke-color': '#ffcc33',
            'stroke-width': 2,
            'circle-radius': 7,
            'circle-fill-color': '#ffcc33',
        },
    });


    const [isActiveQueryButton, setIsActiveQueryButton] = useState(false);
    const [openQueryDialog, setOpenQueryDialog] = useState(false);
    const [allLayersFromGeoserver, setAllLayersFromGeoserver] = useState([]);
    //const [currentLayer, setCurrentLayer] = useState(null);
    const [attributeFromGeoserver, serAttributeFromGeoserver] = useState([]);
    const [selectedAttributeType, setSelectedAttributeType] = useState("");
    const [selectedAttributeName, setSelectedAttributeName] = useState("");
    const [selectedLayer, setSelectedLayer] = useState("");
    const [selectedMapName, setSemectedMapName] = useState('OSM_LAYER');
    const [operator, setOperator] = useState([]);
    const [selectedOperator, setSelectedOperator] = useState("");
    const [column, setColumn] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [isReload, setIsReload] = useState(false);
    const [isSelectedActiveLayer, setIsSelectedActiveLayer] = useState(false);
    const [isActiveFeature, setIsActiveFeature] = useState(false);
    const [isOpenSpatialQueryDialog, setIsOpenSpatialQueryDialog] = useState(false);

    /******FOR SPATIAL QUERY******/
    const [layerForSpatialQuery, setLayerForSpatialQuery] = useState([]);
    const [selectedUnitSpeQue, setSelectedUnitSpeQue] = useState("");
    const [selectedLayerSpeQue, setSelectedLayerSpeQue] = useState("");
    const [selectedMarkerType, setSelectedMarkerType] = useState("");
    const [selectedFromLocation, setSelectedFromLocation] = useState("");


    const overviewMapControl = new OverviewMap({
        // see in overviewmap-custom.html to see the custom CSS used
        className: 'ol-overviewmap ol-custom-overviewmap',
        layers: [
            new TileLayer({
                visible: selectedMapName === 'OSM_LAYER',
                source: new OSM(),
            }),
            new TileLayer({
                visible: selectedMapName === 'TOPO_LAYER',
                source: new XYZ({
                    attributions:
                        'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                        'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                    url:
                        'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                        'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                }),
            }),
            new TileLayer({
                visible: selectedMapName === 'WORLD_IMAGINERY_LAYER',
                source: new XYZ({
                    url:
                        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                }),
            }),
        ],
        collapseLabel: '\u00BB',
        label: '\u00AB',
        collapsed: true,
    });
    const scaleControl = new ScaleLine({
        units: "metric",
        bar: true,
        steps: parseInt(8, 10),
        text: true,
        minWidth: 100,
    });
    let ZoomToHome = new ZoomToExtent({
        extent: [9800109.536237817, 2516093.8790986254, 9810033.861218063, 2533895.066382993],
        label: "H",
        className: 'button_home',
    });

    const numberTypeQueryOption = [
        { name: 'Greater than', symbol: '>' },
        { name: 'Less than', symbol: '<' },
        { name: 'Equal to', symbol: '=' }
    ]

    const stringTypeQueryOption = [
        { name: 'Like', symbol: 'LIKE' },
        { name: 'Equal to', symbol: '=' }
    ]

    const view = new View({
        projection: 'EPSG:3857',
        center: [9804544.97917343, 2526365.6759351245],
        zoom: 12,
    })



    useEffect(() => {
        setSemectedMapName(mapName ? mapName : 'OSM_LAYER');
    }, [mapName])

    useEffect(() => {
        popup = new Overlay({
            element: popupRef.current,
            autoPan: true,
            autoPanAnimation: {
                duration: 250,
            },
        });
        map = new Map({
            target: 'map',
            controls: defaultControls().extend([overviewMapControl, scaleControl, ZoomToHome]),
            interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
            extent: [9775518.017682133, 2521301.7228112314, 9833571.940664725, 2531429.6290590176],
            view: view,
            layers: [
                new TileLayer({
                    visible: selectedMapName === 'OSM_LAYER',
                    source: new OSM(),
                }),
                new TileLayer({
                    visible: selectedMapName === 'TOPO_LAYER',
                    source: new XYZ({
                        attributions:
                            'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                            'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                        url:
                            'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                            'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                    }),
                }),
                new TileLayer({
                    visible: selectedMapName === 'WORLD_IMAGINERY_LAYER',
                    source: new XYZ({
                        url:
                            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    }),
                }),
                //vector
                // new TileLayer({
                //     visible: true,
                //     source: new TileWMS({
                //         projection: 'EPSG:4326', // here is the source projection
                //         url: 'http://localhost:8080/geoserver/wms',
                //         params: {
                //             "TILED": true,
                //             "LAYERS": 'topp:states',
                //         },
                //         serverType: 'geoserver',
                //     })
                // })
            ],
        })
        map.addOverlay(popup);
        addLayerToMap()
        map.on('click', (event) => {
            //const clickCoordinates = map.getEventCoordinate(event); // Assuming you have the click event
            // const dataCoordinates = transform(event.coordinate, map.getView().getProjection(), 'EPSG:32645');
            // var lonlat = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
            // var lon = lonlat[0];
            // var lat = lonlat[1];
            // console.log(lonlat);
            let coordinate = event.coordinate;
            console.log(coordinate);
            let resolution = view.getResolution();
            //console.log(resolution, coordinate,)
            if (currentLayer != null && isActiveFeature) {
                let tiledSource = currentLayer.getSource();
                // console.log(tiledSource)
                let url = tiledSource.getFeatureInfoUrl(coordinate, resolution, 'EPSG:3857', { 'INFO_FORMAT': 'application/json' });
                console.log(url)

                if (url) {
                    getLayerData(url).then((res) => {
                        if (res.data.features.length > 0) {
                            let col = Object.keys(res.data.features[0].properties);
                            let tbData = res.data.features.map((ele) => ele.properties);
                            let layerData = renderHtmltomap(col, tbData)
                            popupContentRef.current.innerHTML = layerData;
                            popup.setPosition(coordinate);
                        } else {

                        }
                    }).catch((err) => {
                        console.log(err)
                    })
                } else {
                }
                // console.log(tiledSource.getFeaturesAtCoordinate(coordinate))

            } else {

            }

            //layerAfterQuery.getSource().getFeaturesAtCoordinate(coordinate)
            // console.log(layerAfterQuery.getSource().getFeaturesAtCoordinate(coordinate))

            // console.log(event)

        });

        map.on('moveend', function (e) {
            // var view = map.getView();
            // var zoom = view.getZoom();
            // // var resolution = view.getResolution();
            // // var scale = resolution  // Calculate scale (assuming 72 DPI)
            // // console.log(zoom,scale)
            // var extent = map.getView().calculateExtent(map.getSize());
            // var worldSize = 40075016.6856; // World size for EPSG:3857 projection

            // // Calculate the map scale
            // var scale = worldSize / (extent[2] - extent[0]);

            // // Convert scale to kilometers
            // var scaleInKm = scale / 1000;

            // // Use scaleInKm as needed
            // console.log('Map Scale in Kilometers:', scaleInKm);

            // let tooltip= document.getElementById('toolTip')
            // // Update the tooltip content
            // tooltip.innerHTML = 'Zoom Level: ' + zoom + '<br>Scale: 1:' + scale.toFixed(0);
        });

        map.on('move', function (e) {
            // var pixel = map.getEventPixel(e.originalEvent);
            // var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
            //     return feature;
            // });

            // if (feature) {
            //     tooltip.style.display = 'block';
            //     tooltip.style.left = (pixel[0] + 10) + 'px';
            //     tooltip.style.top = (pixel[1] - 25) + 'px';
            // } else {
            //     tooltip.style.display = 'none';
            // }
            // console.log(e)
        });

        map.on('pointerdrag', function (event) {
            // You can perform custom actions when the map is dragged here
            console.log(event);
        });



        return () => {
            map.dispose();
        };
    }, [selectedMapName, layerDetails, isReload, isActiveFeature])


    useEffect(() => {
        map.removeLayer(vector);
        map.getLayers().forEach(layer => {
            if (layer && layer.get('name') === 'Draw') {
                layer.getSource().refresh()
            }
        });
        if (drawFeatureType) {
            map.addLayer(vector);
            if (drawFeatureForMeasurment != null) {
                map.removeInteraction(drawFeatureForMeasurment);
                drawFeatureForMeasurment = null;
            };
            drawFeatureForMeasurment = new Draw({
                source: source,
                type: drawFeatureType
            });
            addDrawFeature();
        } else {
            map.removeLayer(vector);
            if (drawFeatureForMeasurment != null) {
                map.removeInteraction(drawFeatureForMeasurment);
                drawFeatureForMeasurment = null;
            }
            //map.getLayers().forEach(layer => layer.getSource().refresh());
            map.getLayers().forEach(layer => {
                if (layer && layer.get('name') === 'Draw') {
                    layer.getSource().refresh()
                }
            });
        };
    }, [drawFeatureType])



    const addLayerToMap = () => {
        let haldiaMouza = new TileLayer({
            visible: true,
            source: new TileWMS({
                projection: 'EPSG:3857', // here is the source projection
                url: 'http://localhost:8080/geoserver/wms',
                params: {
                    "TILED": true,
                    "LAYERS": 'haldia:mouza',
                },
                serverType: 'geoserver',
            }),
        });

        let haldiaPlanningArea = new TileLayer({
            visible: true,
            source: new TileWMS({
                projection: 'EPSG:3857', // here is the source projection
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
                projection: 'EPSG:3857', // here is the source projection
                url: 'http://localhost:8080/geoserver/wms',
                params: {
                    "TILED": true,
                    "LAYERS": 'haldia:road',
                },
                serverType: 'geoserver',
            }),
        });

        let haldiaIndustry = new TileLayer({
            visible: true,
            source: new TileWMS({
                projection: 'EPSG:3857', // here is the source projection
                url: 'http://localhost:8080/geoserver/wms',
                params: {
                    "TILED": true,
                    "LAYERS": 'haldia:industry',
                },
                serverType: 'geoserver',
            }),
        });
        let haldiaStorage = new TileLayer({
            visible: true,
            source: new TileWMS({
                projection: 'EPSG:3857', // here is the source projection
                url: 'http://localhost:8080/geoserver/wms',
                params: {
                    "TILED": true,
                    "LAYERS": 'haldia:storage',
                },
                serverType: 'geoserver',
            }),
        });

        let layer1503HaKhasra = new TileLayer({
            visible: true,
            source: new TileWMS({
                projection: 'EPSG:3857', // here is the source projection
                url: 'http://localhost:8080/geoserver/wms',
                params: {
                    "TILED": true,
                    "LAYERS": 'haldia:layer_1503_ha_khasra-polygon',
                },
                serverType: 'geoserver',
            }),
        });



        if (layerDetails && layerDetails?.changeFrom == 'view' && layerDetails?.layerName.length > 0) {
            // if (currentLayer != null) {
            //     map.removeLayer(currentLayer);
            // }

            let groupOfLayers = []

            if (layerDetails?.layerName.includes('HALDIA_MOUZA')) {
                //map.addLayer(haldiaMouza);
                //setCurrentLayer(haldiaMouza);
                //currentLayer = haldiaMouza;
                groupOfLayers.push(haldiaMouza);
                currentLayer = null;
                setIsSelectedActiveLayer(false);
            }
            if (layerDetails?.layerName.includes('HALDIA_PLANNING_AREA')) {
                //map.addLayer(haldiaPlanningArea);
                //setCurrentLayer(haldiaPlanningArea);
                //currentLayer = haldiaMouza;
                groupOfLayers.push(haldiaPlanningArea);
                currentLayer = null;
                setIsSelectedActiveLayer(false);
            }
            if (layerDetails?.layerName.includes('HALDIA_ ROAD')) {
                map.addLayer(haldiaRoad);
                //setCurrentLayer(haldiaRoad);
                //currentLayer = haldiaRoad;
                groupOfLayers.push(haldiaRoad);
                currentLayer = null;
                setIsSelectedActiveLayer(false);
            }
            if (layerDetails?.layerName.includes('HALDIA_STORAGE')) {
                //map.addLayer(haldiaStorage);
                //setCurrentLayer(haldiaStorage);
                //currentLayer = haldiaStorage;
                groupOfLayers.push(haldiaStorage);
                currentLayer = null;
                setIsSelectedActiveLayer(false);
            }
            if (layerDetails?.layerName.includes('HALDIA_INDUSTRY')) {
                //map.addLayer(haldiaIndustry);
                //setCurrentLayer(haldiaIndustry);
                //currentLayer = haldiaIndustry;
                groupOfLayers.push(haldiaIndustry);
                currentLayer = null;
                setIsSelectedActiveLayer(false);
            }
            if (layerDetails?.layerName.includes('LAYER_KHASRA_POLYGON')) {
                //map.addLayer(haldiaIndustry);
                //setCurrentLayer(haldiaIndustry);
                //currentLayer = haldiaIndustry;
                groupOfLayers.push(layer1503HaKhasra);
                currentLayer = null;
                setIsSelectedActiveLayer(false);
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
        }
        if (layerDetails && layerDetails?.changeFrom == 'active' && layerDetails?.layerName.length > 0) {
            if (layerDetails?.layerName.includes('HALDIA_MOUZA')) {
                map.addLayer(haldiaMouza);
                //setCurrentLayer(haldiaMouza);
                currentLayer = haldiaMouza;
                setIsSelectedActiveLayer(true);
            }
            if (layerDetails?.layerName.includes('HALDIA_PLANNING_AREA')) {
                map.addLayer(haldiaPlanningArea);
                //setCurrentLayer(haldiaPlanningArea);
                currentLayer = haldiaPlanningArea;
                setIsSelectedActiveLayer(true);
            }
            if (layerDetails?.layerName.includes('HALDIA_ ROAD')) {
                map.addLayer(haldiaRoad);
                //setCurrentLayer(haldiaRoad);
                currentLayer = haldiaRoad;
                setIsSelectedActiveLayer(true);
            }
            if (layerDetails?.layerName.includes('HALDIA_STORAGE')) {
                map.addLayer(haldiaStorage);
                //setCurrentLayer(haldiaStorage);
                currentLayer = haldiaStorage;
                setIsSelectedActiveLayer(true);
            }
            if (layerDetails?.layerName.includes('HALDIA_INDUSTRY')) {
                map.addLayer(haldiaIndustry);
                //setCurrentLayer(haldiaIndustry);
                currentLayer = haldiaIndustry;
                setIsSelectedActiveLayer(true);
            }
            if (layerDetails?.layerName.includes('LAYER_KHASRA_POLYGON')) {
                map.addLayer(layer1503HaKhasra);
                //setCurrentLayer(haldiaIndustry);
                currentLayer = layer1503HaKhasra;
                setIsSelectedActiveLayer(true);
            }
        }
    }


    const addDrawFeature = () => {
        map.addInteraction(drawFeatureForMeasurment);
        drawFeatureForMeasurment.on('drawstart', function (evt) {
            let sketch = evt.feature;
            listener = sketch.getGeometry().on('change', function (evt) {
                const geom = evt.target;
                if (geom instanceof Polygon) {
                    formatArea(geom);
                } else if (geom instanceof LineString) {
                    formatLength(geom);
                }
                // else if (geom instanceof Point) {
                //     draw.removeLastPoint();
                // }

            });

        });


        drawFeatureForMeasurment.on('drawend', function () {
            unByKey(listener);
        });
    }

    const formatArea = function (polygon) {
        const area = getArea(polygon);
        console.log(area)
        dispatch(measurmentValueChangeAction(area));
    };

    const formatLength = function (line) {
        let length = getLength(line);
        dispatch(measurmentValueChangeAction(length));
    };

    const closeQueryPopOver = () => {
        setOpenQueryDialog(false);
        setIsActiveQueryButton(false);
        setColumn([]);
        setTableData([]);
        layerAfterQuery?.getSource().clear();
        map.removeLayer(layerAfterQuery);
        setIsReload(!isReload)
    }

    const openQueryPopOver = (event) => {
        setOpenQueryDialog(true);
        setIsActiveQueryButton(true);
        getAllLayer().then((res) => {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(res.data, "text/xml");
            let data = xmlDoc.getElementsByTagName("FeatureType");
            let layers = [];
            for (let i = 0; i < data.length; i++) {
                let name = data[i].getElementsByTagName("Name")[0].childNodes[0].nodeValue;
                console.log(name.split(":")[0]);
                if (name.split(":")[0] == 'haldia') {
                    layers.push(name);
                }
            };
            setAllLayersFromGeoserver(layers);
        }).catch(() => {

        })
    }

    const onLayerChange = (event) => {
        console.log(event.target.value)
        setSelectedLayer(event.target.value)
        getAttributeByLayerName(event.target.value).then((res) => {
            console.log(res.data)
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(res.data, "text/xml");
            let dataSequenceTag = xmlDoc.getElementsByTagName("xsd:sequence");
            //console.log(dataSequenceTag)
            let data = dataSequenceTag[0].getElementsByTagName("xsd:element")
            let allAttributes = [];
            for (let i = 0; i < data.length; i++) {
                let attributeType = data[i].getAttribute('type').split(':')[1];
                let attributeName = data[i].getAttribute('name');
                console.log(attributeName)
                if ((attributeName !== 'geom') && (attributeName !== 'the_geom')) {
                    let obj = { attributeType, attributeName };
                    allAttributes.push(obj)
                }
            };
            serAttributeFromGeoserver(allAttributes)
        }).catch(() => {

        })
    }

    const onAttributeChange = (event) => {
        setSelectedAttributeName(event.target.value)
        let selectedAtriType = attributeFromGeoserver.filter(ele => ele.attributeName === event.target.value)[0].attributeType;
        console.log(selectedAtriType)
        setSelectedAttributeType(selectedAtriType);
        if (selectedAtriType === 'short' || selectedAtriType === 'int' || selectedAtriType === 'double' || selectedAtriType === 'decimal') {
            setOperator(numberTypeQueryOption)
        } else if (selectedAtriType == 'string') {
            setOperator(stringTypeQueryOption)
        }
    }

    const onChangeOperator = (event) => {
        setSelectedOperator(event.target.value);
    }

    const createUrlForQuery = (formData) => {
        console.log(formData)
        setColumn([]);
        setTableData([]);
        let payLoad = { ...formData };
        let input = payLoad.inputValue;
        if (selectedOperator == 'LIKE') {
            payLoad.inputValue = "%25" + input + "%25";
        }
        //  else {
        //     InputedValue = input;
        // }
        if (layerAfterQuery) {
            layerAfterQuery.getSource().clear();
            map.removeLayer(layerAfterQuery);
        };

        let url = `http://localhost:8080/geoserver/haldia/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${payLoad.layerName}&CQL_FILTER=${payLoad.attributeName}+${payLoad.operatorName}+%27${payLoad.inputValue}%27&outputFormat=application/json`

        layerAfterQuery = new VectorLayer({
            // extent:[8620876.836424291, 887262.64171285,8792062.721944958, 4069833.620651435],
            source: new VectorSource({
                projection: 'EPSG:3857',
                url: url,
                format: new GeoJSON(),
            }),
            visible: true,
            // style: new Style({
            //     fill: new Fill({
            //         color: "#F0F8FF",
            //     }),
            //     stroke: new Stroke({
            //         color: "#0047ab",
            //         width: 2,
            //     }),
            // }),
            style: new Style({
                // fill: new Fill({
                //     color: "#FF5733",
                // }),
                stroke: new Stroke({
                    color: "#FF5733",
                    width: 2,
                }),
            }),
        });

        //console.log(layerAfterQuery.getFeatures)
        //console.log(map.getView().calculateExtent(map.getSize()))
        //console.log(map.getView())

        layerAfterQuery.getSource().on('addfeature', function (e) {
            const layerExtent = layerAfterQuery.getSource().getExtent();
            map.getView().fit(
                layerExtent,
                { duration: 1590, size: map.getSize(), maxZoom: 15, projection: 'EPSG:3857'}
            )
        })
        map.addLayer(layerAfterQuery)



        getLayerDataByQuery(url).then((res) => {
            if (res.data.features.length > 0) {
                let col = Object.keys(res.data.features[0].properties);
                setColumn(col);
                let tbData = res.data.features.map((ele) => ele.properties);
                setTableData(tbData);
            }
        }).catch(() => {

        })
    }

    const featureActive = () => {
        setIsActiveFeature(!isActiveFeature)
    }

    const closePopUp = () => {
        popup.setPosition(undefined);
        //closer.blur();
        return false;
    }

    const renderHtmltomap = (overlayKeys, overlayData) => {
        let cardContent = '';
        overlayKeys.forEach(key => {
            cardContent += `<div class='content'><span class='keyName'>${key} :</span><span class='keyValue'> ${overlayData[0][key]}</span></div>`;
        });
        return cardContent;
    }


    const openSpatialQueryDialog = () => {
        let layersAlreadyAddedToThemap = getSelectedLayer();
        if (layersAlreadyAddedToThemap.length > 0) {
            setIsOpenSpatialQueryDialog(!isOpenSpatialQueryDialog);
            setLayerForSpatialQuery(layersAlreadyAddedToThemap)
        }
    }

    const onchangeLayerSpeQue = (event) => {
        setSelectedLayerSpeQue(event.target.value)
    }

    const onChangeUnitSpeQue = (event) => {
        setSelectedUnitSpeQue(event.target.value)
    }

    const onChangeMarkerType = (event) => {
        setSelectedMarkerType(event.target.value)
        // setIsReload(true)
        // setIsReload(false)
    }

    const onChangeFromLocation = (event) => {
        setSelectedFromLocation(event.target.value)
    }

    const getSelectedLayer = () => {
        let layerAddedTotheMap = [];
        if (layerDetails && layerDetails?.layerName.length > 0) {
            if (layerDetails?.layerName.includes('HALDIA_MOUZA')) {
                layerAddedTotheMap.push('haldia:mouza')
            }
            if (layerDetails?.layerName.includes('HALDIA_PLANNING_AREA')) {
                layerAddedTotheMap.push('haldia:haldia_planning_area')
            }
            if (layerDetails?.layerName.includes('HALDIA_ ROAD')) {
                layerAddedTotheMap.push('haldia:road')
            }
            if (layerDetails?.layerName.includes('HALDIA_STORAGE')) {
                layerAddedTotheMap.push('haldia:storage')
            }
            if (layerDetails?.layerName.includes('HALDIA_INDUSTRY')) {
                layerAddedTotheMap.push('haldia:industry')
            }
        }
        return layerAddedTotheMap;
    }

    const getSpatialQueryFormData = (formData) => {
        if (coordinatesForSpatialFeature.length > 0) {
            let cordList = coordinatesForSpatialFeature[0] + " " + coordinatesForSpatialFeature[1];
            console.log(cordList);
            let selectedGeom = '';
            if (formData.featureOf === 'haldia:haldia_planning_area' || formData.featureOf === 'haldia:road' || formData.featureOf === 'haldia:road') {
                selectedGeom = 'the_geom'
            } else {
                selectedGeom = 'geom'
            }
            let url = `http://localhost:8080/geoserver/haldia/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${formData.featureOf}&CQL_FILTER=DWITHIN(${selectedGeom},${formData.markerType}(${cordList}),${formData.lengthValue},${formData.selectedUnit})&outputFormat=application/json`
            // getFeatureForSpatialQuery(url).then((res) => {
            //     console.log(res.data)
            // });

            let extent3857 = map.getView().calculateExtent(map.getSize());
            console.log(extent3857)
            const sourceProjection = getProjection('EPSG:3857');
            const targetProjection = getProjection('EPSG:4326');
            // Convert the extent from EPSG:3857 to EPSG:4326
            const extent4326 = transformExtent(extent3857, sourceProjection, targetProjection);
            console.log(extent4326)
            let newLayerforSpatialQuery = new VectorLayer({
                source: new VectorSource({
                    //extent: [9800109.536237817, 2516093.8790986254, 9810033.861218063, 2533895.066382993],
                    url: url,
                    format: new GeoJSON(),
                    projection: 'EPSG:3857',
                    strategy: olLoadingStrategy.bbox,
                }),
                visible: true,
                style: new Style({
                    // fill: new Fill({
                    //     color: "#FF5733",
                    // }),
                    stroke: new Stroke({
                        color: "#FF5733",
                        width: 2,
                    }),
                }),
            });


            newLayerforSpatialQuery.getSource().on('addfeature', function (e) {
                const layerExtent = newLayerforSpatialQuery.getSource().getExtent();
                map.getView().fit(
                    layerExtent,
                    { duration: 1590, size: map.getSize(), maxZoom: 15 }
                )
            })
            map.addLayer(newLayerforSpatialQuery)
        }
    }

    const drawFeatureInThemap = () => {
        //map.removeLayer(vector)
        let listener2;
        let drawFeatureValue = getValues2('markerType');
        spatialDrawFeature = new Draw({
            source: drawPoint.getSource(),
            type: drawFeatureValue
        });
        //map.addLayer(vector)
        map.addInteraction(spatialDrawFeature);
        spatialDrawFeature.on('drawstart', function (evt) {
            let sketch = evt.feature;
            if (newPointLayer != null) {
                map.getLayers().forEach(layer => {
                    if (layer && layer.get('name') === 'Point') {
                        layer.getSource().refresh();
                        map.removeLayer(layer);
                        newPointLayer = null;
                    }
                });
            }
            listener2 = sketch.getGeometry().on('change', function (evt) {
                const geom = evt.target;
                // if (geom instanceof Polygon) {
                //     formatArea(geom);
                // } else if (geom instanceof LineString) {
                //     formatLength(geom);
                // }
                // else 
                if (geom instanceof Point) {
                    spatialDrawFeature.removeLastPoint();
                }

            });

        });
        spatialDrawFeature.on('drawend', function (event) {
            var drawnFeature = event.feature;
            console.log(event)
            coordinatesForSpatialFeature = drawnFeature.getGeometry().getCoordinates();
            map.removeInteraction(spatialDrawFeature);
            newPointLayer = drawPoint
            map.addLayer(newPointLayer)
            map.render();
            unByKey(listener2);
        });
    }

    const clearSpatialQueryFromTheMap = () => {
        if (newPointLayer != null) {
            map.getLayers().forEach(layer => {
                console.log(layer)
                if (layer && layer.get('name') === 'Point') {
                    layer.getSource().refresh();
                    map.removeLayer(layer);
                    newPointLayer = null;
                }
            });
        }
    }


    return (
        <div>
            <Drawer />
            <div id="map"
                style={{
                    width: '100%',
                    height: '83vh',
                    marginTop: '117px'
                }}
                className='map'
            >
            </div>
            <material.Tooltip title="Apply Attribute Query" arrow placement="right">
                <button className='queryButton' style={{ background: isActiveQueryButton ? 'rgb(84, 234, 99)' : 'white', border: isActiveQueryButton ? '0.5px solid #0b0b5f' : '0.5px solid #aaa2a2' }} onClick={openQueryPopOver}><img src={queryIcon} style={{ height: '1em', width: '1em' }} alt="" /></button>
            </material.Tooltip>
            <div className="query_popup" style={{ display: openQueryDialog ? 'block' : 'none' }}>
                <div className="row p-2 psition-relative m-0">
                    <div className="col-12 bg-warning d-flex flex-clumn justify-content-between align-items-center py-2" style={{ borderRadious: '5px' }}>
                        <div className='text-white'>
                            Apply Query
                        </div>
                        <div>
                            <material.CloseIcon style={{ color: 'white' }} onClick={closeQueryPopOver} />
                        </div>
                    </div>

                    <form className="col-12 d-flex flex-column p-0">
                        <material.FormControl size="small" className='mt-3'>
                            <material.InputLabel id="demo-select-small-label">Select a layer</material.InputLabel>
                            <material.Select
                                name='layerName'
                                {...register1("layerName", { required: true })}
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={selectedLayer}
                                label="Select a layer"
                                onChange={onLayerChange}
                                required
                            >
                                {
                                    allLayersFromGeoserver.map((layers, i) => (
                                        <material.MenuItem value={layers} key={i}>
                                            {layers}
                                        </material.MenuItem>
                                    ))
                                }
                                {/* <material.MenuItem value='topp:states'>
                                topp:states
                                </material.MenuItem> */}

                            </material.Select>
                        </material.FormControl>

                        <material.FormControl size="small" className='my-3'>
                            <material.InputLabel id="demo-select-small-label">Select attribute</material.InputLabel>
                            <material.Select
                                name='attributeName'
                                {...register1("attributeName", { required: true })}
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={selectedAttributeName}
                                label="Select attribute"
                                onChange={onAttributeChange}
                                required
                            >
                                {
                                    attributeFromGeoserver.map((attribute, aInd) => (
                                        <material.MenuItem value={attribute.attributeName} key={aInd}>
                                            {attribute.attributeName}
                                        </material.MenuItem>
                                    ))
                                }

                            </material.Select>
                        </material.FormControl>
                        <material.FormControl size="small" className='my-2'>
                            <material.InputLabel id="demo-select-small-label">Select an operator</material.InputLabel>
                            <material.Select
                                name='operatorName'
                                {...register1("operatorName", { required: true })}
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={selectedOperator}
                                label="Select an operator"
                                onChange={onChangeOperator}
                                required
                            >{
                                    operator.map((operator, opInd) => (
                                        <material.MenuItem value={operator.symbol} key={opInd}>
                                            {operator.name}
                                        </material.MenuItem>
                                    ))
                                }
                            </material.Select>
                        </material.FormControl>

                        <material.TextField
                            name='inputValue'
                            {...register1("inputValue", { required: true })}
                            label="Enter a value"
                            id="outlined-size-small"
                            size="small"
                            type={(selectedAttributeType == 'short') || (selectedAttributeType == 'int') || (selectedAttributeType == 'double') || (selectedAttributeType == 'decimal') ? 'number' : 'text'}
                            variant="outlined"
                            className='my-1'
                            required
                        />
                        <span className='d-flex justify-content-end my-2'>
                            <material.Button variant="contained" type='submit' sx={{ textTransform: 'none' }} onClick={handleSubmit1(createUrlForQuery)} disabled={!isValid1}>
                                <img src={queryIcon} style={{ height: '2em', width: '2em' }} alt="" className='me-2' /> Apply
                            </material.Button>
                        </span>
                    </form>
                </div>
            </div>

            {tableData.length > 0 ? (<div className='table_div'>
                <div><material.CloseIcon style={{ color: 'red' }} onClick={closeQueryPopOver} /></div>
                <Table columns={column} data={tableData} />
            </div>) : null}

            <material.Tooltip title="Active Feature Info" arrow placement="right">
                <button className='popupShowHide' style={{ background: isActiveFeature ? 'rgb(84, 234, 99)' : 'white', border: isActiveFeature ? '0.5px solid #0b0b5f' : '0.5px solid #aaa2a2' }} onClick={featureActive}><img src={Infoicon} style={{ height: '1em', width: '1em' }} alt="" /></button>
            </material.Tooltip>

            <div id="popup" ref={popupRef} className="ol-popup">
                <a href="#" id='popup-closer' className="ol-popup-closer" onClick={closePopUp}></a>
                <div id="popup-content" ref={popupContentRef} style={{
                    height: '400px',
                    overflowY: 'auto'
                }}></div>
            </div>

            <material.Tooltip title="Apply Spatial Query" arrow placement="right">
                <button className='spatial-query-btn' style={{ background: isOpenSpatialQueryDialog ? 'rgb(84, 234, 99)' : 'white', border: isOpenSpatialQueryDialog ? '0.5px solid #0b0b5f' : '0.5px solid #aaa2a2' }} onClick={openSpatialQueryDialog}><img src={spatialQueryIcon} style={{ height: '1em', width: '1em' }} alt="" /></button>
            </material.Tooltip>
            <div className="spaial-query-dialog" style={{ display: isOpenSpatialQueryDialog ? 'block' : 'none' }}>
                <form className='row p-2'>
                    <div className="col-12">
                        <div className="m-0 p-2 bg-info w-100 text-white fw-bold">Spatial Query</div>
                    </div>
                    <div className="col-12">
                        <material.FormControl size="small" className='mt-3 w-100'>
                            <material.InputLabel id="demo-select-small-label">Select feature of</material.InputLabel>
                            <material.Select
                                name='featureOf'
                                {...register2("featureOf", { required: true })}
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={selectedLayerSpeQue}
                                label="Select a layer"
                                onChange={onchangeLayerSpeQue}
                                required
                            >
                                {
                                    layerForSpatialQuery.map((layers, i) => (
                                        <material.MenuItem value={layers} key={i}>
                                            {layers}
                                        </material.MenuItem>
                                    ))
                                }

                            </material.Select>
                        </material.FormControl>
                    </div>
                    <div className="col-12">
                        <material.FormControl size="small" className='mt-3 w-100'>
                            <material.InputLabel id="demo-select-small-label">That are</material.InputLabel>
                            <material.Select
                                name='fromLocation'
                                {...register2("fromLocation", { required: true })}
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={selectedFromLocation}
                                label="Select a layer"
                                onChange={onChangeFromLocation}
                                required
                            >
                                {/* {
                                    allLayersFromGeoserver.map((layers, i) => (
                                        <material.MenuItem value={layers} key={i}>
                                            {layers}
                                        </material.MenuItem>
                                    ))
                                } */}

                                <material.MenuItem value="withinDistance">Within distance of </material.MenuItem>
                                {/* <material.MenuItem value="intersecting">Intersecting </material.MenuItem>
                                <material.MenuItem value="completelyWithin">completely within</material.MenuItem> */}

                            </material.Select>
                        </material.FormControl>
                    </div>
                    <div className="col-12">
                        <material.TextField
                            name='lengthValue'
                            {...register2("lengthValue", { required: true })}
                            label="Enter a value"
                            id="outlined-size-small"
                            size="small"
                            type="number"
                            variant="outlined"
                            className='mt-3 w-100'
                            required
                        />
                    </div>
                    <div className="col-12">
                        <material.FormControl size="small" className='mt-3 w-100'>
                            <material.InputLabel id="demo-select-small-label">Select Unit</material.InputLabel>
                            <material.Select
                                name='selectedUnit'
                                {...register2("selectedUnit", { required: true })}
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={selectedUnitSpeQue}
                                label="Select a layer"
                                onChange={onChangeUnitSpeQue}
                                required
                            >
                                <material.MenuItem value="kilometers">Kilometers </material.MenuItem>
                                <material.MenuItem value="meters">Meters </material.MenuItem>
                                <material.MenuItem value="feet">Feet</material.MenuItem>
                                <material.MenuItem value="nautical miles">Nautical Miles</material.MenuItem>
                            </material.Select>
                        </material.FormControl>
                    </div>
                    <div className="col-12">
                        <material.FormControl size="small" className='mt-3 w-100'>
                            <material.InputLabel id="demo-select-small-label">From</material.InputLabel>
                            <material.Select
                                name='markerType'
                                {...register2("markerType", { required: true })}
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={selectedMarkerType}
                                label="Select a layer"
                                onChange={onChangeMarkerType}
                                required
                            >
                                <material.MenuItem value="Point">Point Marker</material.MenuItem>
                                {/* <material.MenuItem value="lineMarker">Line Marker</material.MenuItem>
                                <material.MenuItem value="polygonMarker">Polygon Marker</material.MenuItem> */}
                            </material.Select>
                        </material.FormControl>
                    </div>

                    <div className="col-12 mt-3 d-flex align-items-center justify-content-between">
                        <button className='selectionButton' type='button' onClick={drawFeatureInThemap} disabled={!isValid2}>
                            {/* <material.SubdirectoryArrowRightIcon /> */}
                            <material.SwipeRightAltIcon />
                        </button>
                        <button className='runButton bg-success text-white fw-bold' type='button' onClick={handleSubmit2(getSpatialQueryFormData)} disabled={!isValid2}>Run<material.PlayArrowIcon disabled={!isValid2} /></button>
                        <button type='button' className='clearButton bg-danger text-white fw-bold' onClick={clearSpatialQueryFromTheMap}>Clear<material.RefreshIcon /></button>
                    </div>
                </form>
            </div>

        </div>
    )
}

export default MapComponent