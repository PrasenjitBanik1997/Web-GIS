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
import { createStringXY } from 'ol/coordinate.js';
import MousePosition from 'ol/control/MousePosition.js';
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
import { getAllLayer, getLayerDataByQuery, getAttributeByLayerName, getLayerData, getFeatureByQuery } from '../../services/LayerInfoService';
import XMLParser from 'react-xml-parser';
import ZoomToExtent from 'ol/control/ZoomToExtent.js';
import queryIcon from '../../assets/map-image/queryIcon.png';
import popupShowIcon from '../../assets/map-image/showIcon.png';
import popupHideIcon from '../../assets/map-image/hideIcon.png';
import spatialQueryIcon from '../../assets/map-image/spatialqueryicon.png';
import { Icon, Style, Fill, Circle } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON.js';
import Stroke from 'ol/style/Stroke.js';
import Overlay from 'ol/Overlay';
import * as ReactDOM from 'react-dom';
import Infodialog from '../featureinfo/Infodialog';
import Infoicon from '../../assets/map-image/infoIcon.png';
import * as olLoadingStrategy from 'ol/loadingstrategy';
import { toStringHDMS } from 'ol/coordinate.js';
import SpatialQueryDialog from '../dialog/SpatialQueryDialog';
import { createStyle } from '../../utils/vectorLayerCustomStyle';
import { createCircleVectorLayerFromTheCoordinate } from '../../utils/generateCircleVectorLayer'
import { generateDataForSpatialQuery, generateListOfUrlForFetchingSpatialQueryData } from '../../utils/generateUrl';
import { addLayerToMap } from '../../utils/layerManagement';
import Alert from '../alert-message/Alert';
import Loader from '../loader/Loader';


var map;
var layerAfterQuery = null;
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
var currentLayer = null;
var popup;
var spatialDrawFeature;
var coordinatesForSpatialFeature = null;
var newPointLayer = null;
var drawFeatureForMeasurment = null;
var newLayerforSpatialQuery = null;
var circleLayer = null;
var isActiveFeatureInfo = false;

function MapComponent() {
    const [messageInfo, setMessageInfo] = useState({});
    const [isLoadingLoader, setIsLoasingLoader] = useState(false);
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
        zIndex: 5,
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
        zIndex: 5,
    });
    //const defaultExtent = [7636978.342053802, 2546460.5921668783, 10847015.302693773, 3301476.3264769614];
    const defaultExtent = [9800109.536237817, 2516093.8790986254, 9810033.861218063, 2533895.066382993];

    const [isShowTable, setIsShowTable] = useState(true);
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
    const [isActiveMousePosition, setIsActiveMousePosition] = useState(false);

    /******FOR SPATIAL QUERY******/
    const [layerForSpatialQuery, setLayerForSpatialQuery] = useState([]);
    const [selectedUnitSpeQue, setSelectedUnitSpeQue] = useState("");
    const [selectedLayerSpeQue, setSelectedLayerSpeQue] = useState([]);
    const [selectedMarkerType, setSelectedMarkerType] = useState("");
    const [selectedFromLocation, setSelectedFromLocation] = useState("");
    const [spatilQueryDialogData, setSpatilQueryDialogData] = useState({ open: false, spatilQueryInfo: [] });


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

    const mousePositionControl = new MousePosition({
        // coordinateFormat: function (coord) {
        //   return  toStringHDMS(coord, 1)
        // },
        coordinateFormat: createStringXY(4),
        projection: 'EPSG:4326',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
        placeholder: 'No position'
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
        //projection: 'EPSG:3857',
        center: [9804544.97917343, 2526365.6759351245],
        zoom: 9,
        // center: [9804544.97917343, 2526365.6759351245],
        // zoom: 4,
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
            controls: defaultControls().extend([overviewMapControl, scaleControl, mousePositionControl, ZoomToHome]),
            interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
            extent: [9775518.017682133, 2521301.7228112314, 9833571.940664725, 2531429.6290590176],
            //extent: [7636978.342053802, 2546460.5921668783, 10847015.302693773, 3301476.3264769614],
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
            ],

        })
        map.addOverlay(popup);
        currentLayer = addLayerToMap(map, layerDetails); //this function is created in util folder
        map.on('click', (event) => {
            let coordinate = event.coordinate;
            console.log(coordinate);
            let resolution = view.getResolution();
            //console.log(resolution, coordinate,)
            if (currentLayer != null && isActiveFeatureInfo) {
                let tiledSource = currentLayer.getSource();
                console.log(isActiveFeature)
                let url = tiledSource.getFeatureInfoUrl(coordinate, resolution, 'EPSG:3857', { 'INFO_FORMAT': 'application/json' });
                console.log(url)

                if (url) {
                    getLayerData(url).then((res) => {
                        if (res.data.features.length > 0) {
                            closePopUp();
                            setMessageInfo(
                                {
                                    message: 'Feature fetched succesfully',
                                    type: 'success',
                                    isVisiable: true
                                }
                            )
                            setTimeout(() => {
                                let col = Object.keys(res.data.features[0].properties);
                                let tbData = res.data.features.map((ele) => ele.properties);
                                let layerData = renderHtmltomap(col, tbData)
                                popupContentRef.current.innerHTML = layerData;
                                popup.setPosition(coordinate);
                            }, 2000)

                        } else {
                            setMessageInfo(
                                {
                                    message: `No data found from this (${coordinate[0]} , ${coordinate[1]}) coordinate`,
                                    type: 'error',
                                    isVisiable: true
                                }
                            )
                        }
                    }).catch((err) => {
                        setMessageInfo(
                            {
                                message: err,
                                type: 'error',
                                isVisiable: true
                            }
                        )
                    })
                } else {
                }
                // console.log(tiledSource.getFeaturesAtCoordinate(coordinate))

            } else {
                if (isActiveFeatureInfo === true) {
                    setMessageInfo(
                        {
                            message: 'To get feature Info please active one layer',
                            type: 'info',
                            isVisiable: true
                        }
                    )
                }
            }

            //layerAfterQuery.getSource().getFeaturesAtCoordinate(coordinate)
            // console.log(layerAfterQuery.getSource().getFeaturesAtCoordinate(coordinate))

            // console.log(event)

        });

        map.on('pointerdrag', function (event) {
            // You can perform custom actions when the map is dragged here
            //console.log(event);
        });
        map.on('pointermove', function (event) {
            setIsActiveMousePosition(false);
            setIsActiveMousePosition(true);
            setTimeout(() => {
                setIsActiveMousePosition(false)
            }, 10000)
        });

        setLayerForSpatialQuery(getSelectedLayer())

        return () => {
            map.dispose();
        };
    }, [selectedMapName, layerDetails, isReload])

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
        //setOpenQueryDialog(false);
        //setIsActiveQueryButton(false);
        setColumn([]);
        setTableData([]);
        if (layerAfterQuery !== null) {
            setIsLoasingLoader(true);
            setTimeout(() => {
                layerAfterQuery?.getSource().clear();
                map.removeLayer(layerAfterQuery);
                //setIsReload(!isReload)
                map.getView().fit(defaultExtent, { duration: 1590, size: map.getSize(), maxZoom: 4 });
                layerAfterQuery = null;
                setIsLoasingLoader(false);
            }, 1000)
        }

    }

    const openQueryPopOver = (event) => {
        setColumn([]);
        setTableData([]);
        //setIsShowTable(false)
        setOpenQueryDialog(!openQueryDialog);
        setIsActiveQueryButton(!isActiveQueryButton);
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
            let data = dataSequenceTag[0].getElementsByTagName("xsd:element");
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
            source: new VectorSource({
                format: new GeoJSON(),
                url: url,
                //projection: 'EPSG:4326',
                // loader: (extent, resolution, projection) => {
                //     getFeatureByQuery(url).then((res) => {
                //         console.log(res.data)
                //     });
                // }
            }),
            visible: true,
            style: new Style({
                fill: new Fill({
                    color: "#F0F8FF",
                }),
                stroke: new Stroke({
                    color: "#0047ab",
                    width: 2,
                }),
                image: new Circle({
                    radius: 6,
                    fill: new Fill({
                        color: "#F0F8FF",
                    }),
                    stroke: new Stroke({
                        color: "#0047ab",
                        width: 2,
                    }),
                }),
            }),
            zIndex: 1,
        });

        layerAfterQuery.getSource().on('addfeature', function (e) {
            const layerExtent = layerAfterQuery.getSource().getExtent();
            console.log(layerExtent)
            map.getView().fit(
                layerExtent,
                { duration: 1590, size: map.getSize(), maxZoom: 15 }
            )
        })
        map.addLayer(layerAfterQuery)
        setIsLoasingLoader(true)
        getLayerDataByQuery(url).then((res) => {
            if (res.data.features.length > 0) {
                setMessageInfo(
                    {
                        message: 'Data fetched successfully for this criteria',
                        type: 'success',
                        isVisiable: true
                    }
                )
                let col = Object.keys(res.data.features[0].properties);
                setColumn(col);
                let tbData = res.data.features.map((ele) => ele.properties);
                setTableData(tbData);
            } else {
                setMessageInfo(
                    {
                        message: 'No data found for this criteria!! Please change the criteria and apply query.',
                        type: 'warning',
                        isVisiable: true
                    }
                )
            }
            setIsLoasingLoader(false)
        }).catch(() => {
            setMessageInfo(
                {
                    message: 'Problem from the server',
                    type: 'error',
                    isVisiable: true
                }
            )
        })
    }

    const featureActive = () => {
        setIsActiveFeature(!isActiveFeature)
        isActiveFeatureInfo = !isActiveFeatureInfo;
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
        resetSpatialQueryForm();
        if (layersAlreadyAddedToThemap.length > 0) {
            setIsOpenSpatialQueryDialog(!isOpenSpatialQueryDialog);
            setLayerForSpatialQuery(layersAlreadyAddedToThemap)
        } else {
            setMessageInfo(
                {
                    message: 'Opps!! Please project one layer on the map ,then click on it.',
                    type: 'info',
                    isVisiable: true
                }
            )
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
        if (layerDetails && layerDetails?.layerList.length > 0) {
            if (layerDetails?.layerList.find(ele => ele.layerName === 'HALDIA_MOUZA')) {
                layerAddedTotheMap.push('haldia:mouza')
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'HALDIA_PLANNING_AREA')) {
                layerAddedTotheMap.push('haldia:haldia_planning_area')
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'HALDIA_ ROAD')) {
                layerAddedTotheMap.push('haldia:road')
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'HALDIA_STORAGE')) {
                layerAddedTotheMap.push('haldia:storage')
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'HALDIA_INDUSTRY')) {
                layerAddedTotheMap.push('haldia:industry')
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'INDIA_STATE')) {
                layerAddedTotheMap.push('haldia:india_state_boundary')
            }
            if (layerDetails?.layerList.find(ele => ele.layerName === 'INDIA_VILLAGE_WB')) {
                layerAddedTotheMap.push('haldia:wb_village')
            }
        }
        return layerAddedTotheMap;
    }

    const getSpatialQueryFormData = async (formData) => {
        setIsLoasingLoader(true);
        console.log(formData)
        if (coordinatesForSpatialFeature) {
            let cordList = coordinatesForSpatialFeature.getGeometry().getCoordinates()[0] + " " + coordinatesForSpatialFeature.getGeometry().getCoordinates()[1];
            let lengthValue;
            if (formData.selectedUnit === 'meters') {
                lengthValue = Number(formData.lengthValue);
            } else if (formData.selectedUnit === 'kilometers') {
                lengthValue = (Number(formData.lengthValue) * 1000).toFixed(4);
            } else if (formData.selectedUnit === 'feet') {
                lengthValue = (Number(formData.lengthValue) / 3.28084).toFixed(4);
                //lengthValue = lengthValue.toFixed(4);
            } else if (formData.selectedUnit === 'nautical miles') {
                lengthValue = (Number(formData.lengthValue) * 1852).toFixed(4);
            }
            if (circleLayer !== null) {
                map.removeLayer(circleLayer);
            }

            circleLayer = createCircleVectorLayerFromTheCoordinate(coordinatesForSpatialFeature.getGeometry().getCoordinates(), lengthValue);
            map.addLayer(circleLayer);
            // let selectedGeom = '';
            // if (formData.featureOf === 'haldia:haldia_planning_area' || formData.featureOf === 'haldia:road' || formData.featureOf === 'haldia:road') {
            //     selectedGeom = 'the_geom'
            // } else {
            //     selectedGeom = 'geom'
            // }

            let selectedGeom = 'geom'
            let url = `http://localhost:8080/geoserver/haldia/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${formData.featureOf}&CQL_FILTER=DWITHIN(${selectedGeom},${formData.markerType.toUpperCase()}(${cordList}),${Number(lengthValue)},${'meters'})&outputFormat=application/json`

            if (newLayerforSpatialQuery != null) {
                map.removeLayer(newLayerforSpatialQuery);
                newLayerforSpatialQuery = null;
                // map.render()
            };
            newLayerforSpatialQuery = new VectorLayer({
                name: 'Spatial',
                source: new VectorSource({
                    url: url,
                    format: new GeoJSON(),
                }),
                visible: true,
                zIndex: 2,
                style: (feature) => createStyle(feature)
            });


            newLayerforSpatialQuery.getSource().on('addfeature', function (e) {
                const layerExtent = newLayerforSpatialQuery.getSource().getExtent();
                map.getView().fit(
                    layerExtent,
                    { duration: 1590, size: map.getSize(), maxZoom: 15 }
                )
            });
            map.addLayer(newLayerforSpatialQuery);

            /**code for create dialog data start**/
            let urlList = generateListOfUrlForFetchingSpatialQueryData(formData.featureOf, selectedGeom, formData.markerType, cordList, lengthValue);
            setSpatilQueryDialogData({ open: false, spatilQueryInfo: [] });
            let spatilData = await generateDataForSpatialQuery(urlList, formData.featureOf);
            setSpatilQueryDialogData({ open: true, spatilQueryInfo: [...spatilData] });
            /**code for create dialog data end**/
            setIsLoasingLoader(false)
        }
    }


    const drawFeatureInThemap = () => {
        //map.removeLayer(vector)
        let listener2;
        let drawType = getValues2('markerType');
        spatialDrawFeature = new Draw({
            source: drawPoint.getSource(),
            type: drawType
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
            drawnFeature.set('geometry', drawnFeature.getGeometry())
            coordinatesForSpatialFeature = drawnFeature;
            map.removeInteraction(spatialDrawFeature);
            newPointLayer = drawPoint
            map.addLayer(newPointLayer)
            map.render();
            unByKey(listener2);
        });
    }

    const clearSpatialQueryFromTheMap = () => {
        setIsLoasingLoader(true);
        resetSpatialQueryForm()
        setTimeout(() => {
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
            if (newLayerforSpatialQuery != null) {
                coordinatesForSpatialFeature = null;
                newLayerforSpatialQuery.getSource().clear();
                map.removeLayer(newLayerforSpatialQuery);
                newLayerforSpatialQuery = null;
                map.render();
            }
            if (circleLayer != null) {
                circleLayer.getSource().clear();
                map.removeLayer(circleLayer);
                circleLayer = null;
                map.render();
            }
            map.getView().fit(defaultExtent, { duration: 1590, size: map.getSize(), maxZoom: 11.6 });
            setIsLoasingLoader(false)
        }, 1000)

    }

    const resetSpatialQueryForm = () => {
        reset2({
            "featureOf": [],
            "fromLocation": "",
            "lengthValue": "",
            "selectedUnit": "",
            "markerType": ""
        })
        setSelectedLayerSpeQue([]);
        setSelectedMarkerType('');
        setSelectedUnitSpeQue('');
        setSelectedFromLocation('');
    }

    const spatialQueryInfoDialogClose = () => {
        setSpatilQueryDialogData({ open: false, spatilQueryInfo: [] });
    }

    const showHideTable = () => {
        setIsShowTable(!isShowTable);
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

            <div id="mouse-position" style={{ display: isActiveMousePosition ? 'block' : 'none' }}>
            </div>

            <material.Tooltip title="Table Visiblity" arrow placement="right">
                <button className='tableHideShowButton' style={{ background: isShowTable ? 'rgb(84, 234, 99)' : 'white', border: isShowTable ? '0.5px solid #0b0b5f' : '0.5px solid #aaa2a2', display: tableData.length > 0 ? 'flex' : 'none' }} onClick={showHideTable} >
                    {isShowTable ? <material.VisibilityOffIcon fontSize='small' /> : <material.VisibilityIcon fontSize='small' />}
                </button>
            </material.Tooltip>

            <material.Tooltip title="Apply Attribute Query" arrow placement="right">
                <button className='queryButton' style={{ background: isActiveQueryButton ? 'rgb(84, 234, 99)' : 'white', border: isActiveQueryButton ? '0.5px solid #0b0b5f' : '0.5px solid #aaa2a2' }} onClick={openQueryPopOver}><img src={queryIcon} style={{ height: '1em', width: '1em' }} alt="" /></button>
            </material.Tooltip>
            <div className="query_popup" style={{ display: openQueryDialog ? 'block' : 'none' }}>
                <div className="row p-2 psition-relative m-0">
                    <div className="col-12 bg-warning d-flex flex-clumn justify-content-between align-items-center py-2" style={{ borderRadious: '5px' }}>
                        <div className='text-white'>
                            Apply Query
                        </div>
                        {/* <div>
                            <material.CloseIcon style={{ color: 'white' }} onClick={closeQueryPopOver} />
                        </div> */}
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

                            <material.Button variant="contained" sx={{ textTransform: 'none', mr: 2 }} color="error" disabled={layerAfterQuery == null} onClick={closeQueryPopOver}>
                                <material.HighlightOffIcon /> Clear
                            </material.Button>

                            <material.Button variant="contained" type='submit' sx={{ textTransform: 'none' }} onClick={handleSubmit1(createUrlForQuery)} disabled={!isValid1 || layerAfterQuery !== null}>
                                <img src={queryIcon} style={{ height: '2em', width: '2em' }} alt="" className='me-2' /> Apply
                            </material.Button>

                        </span>
                    </form>
                </div>
            </div>

            {tableData.length > 0 ? (
                <div className='table_div' style={{ display: isShowTable ? 'block' : 'none' }}>
                    {/* <div><material.CloseIcon style={{ color: 'red' }} onClick={closeQueryPopOver} /></div> */}
                    <Table columns={column} data={tableData} />
                </div>
            ) : null}

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

                                multiple
                                // value={selectedValues}
                                // onChange={handleChange}

                                value={selectedLayerSpeQue}
                                label="Select a layer"
                                onChange={onchangeLayerSpeQue}
                                required
                                renderValue={(selected) => selected.join(', ')}
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
            <SpatialQueryDialog openInfo={spatilQueryDialogData} spatialQueryInfoDialogClose={spatialQueryInfoDialogClose} />
            <Alert messageInfo={messageInfo} />
            <Loader isLoading={isLoadingLoader} />

        </div>
    )
}

export default MapComponent