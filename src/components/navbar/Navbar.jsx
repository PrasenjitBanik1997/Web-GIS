import React, { useEffect } from 'react';
import './Navbar.css';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { material } from '../../library/material';
import osmImage from '../../assets/map-image/osm.PNG';
import topoLayerImage from '../../assets/map-image/Topo_layer.PNG';
import WorldImagineryImage from '../../assets/map-image/World_imaginery.PNG';
import { useDispatch } from 'react-redux';
import { changeMapAction } from '../../store/slice/MapchangerSlice';
import { changeMeasurmentTypeAction } from '../../store/slice/MeasurmentchangerSlice';
import { useSelector } from 'react-redux';
import { measurmentValueChangeAction } from '../../store/slice/MeasurmentvalueSlice';
import { layerChangingAction } from '../../store/slice/LayerChangerSlice';



const StyledMenu = styled((props) => (
    <material.Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 200,
        color:
            theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                //backgroundColor: '#f44336',
                //borderLeft:'#f44336'
            },
        },
    },
}));

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    border: 4,
    borderColor: 'black',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: 'white',
    '&:hover': {
        backgroundColor: '#e3f2fd',
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(material.InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '30ch',
            '&:focus': {
                width: '35ch',
            },
        },
    },
}));


const MapUrlList = [
    { url: osmImage, mapLayer: 'OSM_LAYER', name: 'OSM' },
    { url: topoLayerImage, mapLayer: 'TOPO_LAYER', name: 'Topographic Map' },
    { url: WorldImagineryImage, mapLayer: 'WORLD_IMAGINERY_LAYER', name: 'Imagery' },
]
const drawerWidth = 240;
// const AppBar = styled(material.MuiAppBar, {
//     shouldForwardProp: (prop) => prop !== 'open',
// })(({ theme, open }) => ({
//     transition: theme.transitions.create(['margin', 'width'], {
//         easing: theme.transitions.easing.sharp,
//         duration: theme.transitions.duration.leavingScreen,
//     }),
//     ...(open && {
//         width: `calc(100% - ${drawerWidth}px)`,
//         marginLeft: `${drawerWidth}px`,
//         transition: theme.transitions.create(['margin', 'width'], {
//             easing: theme.transitions.easing.easeOut,
//             duration: theme.transitions.duration.enteringScreen,
//         }),
//     }),
// }))
const Header = styled(material.AppBar)`
{'' }
${""}
${""}
`;
const Subheader = styled(material.AppBar)`
{'' }
${""}
${""}
`;

const StyledToggleButtonGroup = styled(material.ToggleButtonGroup)(({ theme }) => ({
    '& .MuiToggleButtonGroup-grouped': {
        margin: theme.spacing(0.5),
        border: 0,
        '&.Mui-disabled': {
            border: 0,
        },
        '&:not(:first-of-type)': {
            borderRadius: theme.shape.borderRadius,
        },
        '&:first-of-type': {
            borderRadius: theme.shape.borderRadius,
        },
    },
}));


function Navbar(props) {
    const dispatch = useDispatch();
    const measurmentValue = useSelector((state) => state.MeasurmentvalueSlice.measurmentValue);
    const layerDetails = useSelector((state) => state.LayerChangerSlice.layerName);

    const allLayers = [
        // {
        //     name: 'Add All Layer To Map',
        //     value: 'ALL'
        // },
        // {
        //     name: 'Remove All Layer From Map',
        //     value: 'REMOVE_ALL'
        // },
        {
            name: 'Haldia Mouza',
            value: 'HALDIA_MOUZA'
        },
        {
            name: 'Haldia Planning Area',
            value: 'HALDIA_PLANNING_AREA'
        },
        {
            name: 'Haldia Industry',
            value: 'HALDIA_INDUSTRY'
        },
        {
            name: 'Haldia Road',
            value: 'HALDIA_ ROAD'
        },
        {
            name: 'Haldia Storage',
            value: 'HALDIA_STORAGE'
        },
        {
            name: '	Layer 1503 Ha Khasra Polygon',
            value: 'LAYER_KHASRA_POLYGON'
        }
    ]
    const { open, setOpen, handleDrawerOpen } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [anchorE2, setAnchorE2] = React.useState(null);
    const [anchorE3, setAnchorE3] = React.useState(null);
    const [anchorE4, setAnchorE4] = React.useState(null);
    const [measurmentType, setMeasurmentType] = React.useState();
    const [unit, setUnit] = React.useState('');
    const [unitOption, setUnitOption] = React.useState([]);
    const [layer, setLayer] = React.useState('');
    const [selectedViewLayer, setSelectedViewLayer] = React.useState([]);
    const [openMeasurmentDialog, setOpenMeasurmentDialog] = React.useState(false);


    const openMenu = Boolean(anchorEl);
    const openPopover = Boolean(anchorE2);
    const openPopoverForMeasorment = Boolean(anchorE3);
    const openLayerSwitcherPopover = Boolean(anchorE4);
    const id = openPopover ? 'simple-popover' : undefined;
    const idMeasurment = openPopoverForMeasorment ? 'simple-popover' : undefined;
    const idLayerSwitcher = openLayerSwitcherPopover ? 'simple-popover' : undefined;

    const [getFormatValue, setGetFormatValue] = React.useState(0);


    useEffect(() => {
        let value = formatValue(measurmentValue, measurmentType, unit);
        setGetFormatValue(value)
    }, [measurmentValue, unit])


    useEffect(() => {
        if (layerDetails != null && layerDetails?.changeFrom == 'view' && layerDetails?.layerName.length > 0) {
            setSelectedViewLayer(layerDetails?.layerName)
        } else if (layerDetails != null && layerDetails?.changeFrom == 'view' && layerDetails?.layerName.length == 0) {
            setSelectedViewLayer([]);
        }
        else if (layerDetails != null && layerDetails?.changeFrom == 'active' && layerDetails?.layerName.length > 0) {
            setLayer(layerDetails?.layerName[0]);
        }
    }, [layerDetails])

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    /**** Map change popOver code ****/
    const handleOpenPopover = (event) => {
        setAnchorE2(event.currentTarget);
    };
    const handleClosePopover = () => {
        setAnchorE2(false);
    };

    const changeMap = (mapDetails) => {
        console.log(mapDetails)
        dispatch(changeMapAction(mapDetails.mapLayer))
    }

    /**** Measurment Popover code****/

    const handleOpenPopoverForMeasurment = (event) => {
        //setAnchorE3(event.currentTarget);
        setOpenMeasurmentDialog(true)
    };
    const handleClosePopoverForMeasurment = () => {
        //setAnchorE3(false);
        setOpenMeasurmentDialog(false);
        setMeasurmentType(null)
        setUnit('')
        dispatch(changeMeasurmentTypeAction(null));
        dispatch(measurmentValueChangeAction(0))
    };
    const changeMesaurmentType = (event, newMeasurmentType) => {
        dispatch(measurmentValueChangeAction(0))
        let lengthUnit = [
            'Meters', 'Kilometers', 'Miles', 'Feet'
        ]
        let areaUnit = [
            'Sq-meters', 'Sq-kilometers', 'Sq-miles', 'Sq-feet'
        ]
        let pointUnit = ['Degree', 'DNS']

        setUnitOption(newMeasurmentType === 'Polygon' ? areaUnit : newMeasurmentType === 'LineString' ? lengthUnit : newMeasurmentType === 'Point' ? pointUnit : []);
        setUnit(newMeasurmentType === 'Polygon' ? areaUnit[0] : newMeasurmentType === 'LineString' ? lengthUnit[0] : newMeasurmentType === 'Point' ? pointUnit[0] : [])
        setMeasurmentType(newMeasurmentType);
        dispatch(changeMeasurmentTypeAction(newMeasurmentType));
    };

    const handleChange = (event) => {
        setUnit(event.target.value);
        console.log(event.target.value)
    };

    const formatValue = (value, measureType, unitType) => {
        if (measureType === 'LineString') {
            let length = value;
            let unitString = '';
            if (unitType === 'Meters') {
                unitString = 'm';
            } else if (unitType === 'Kilometers') {
                length /= 1000; // Convert meters to kilometers
                unitString = 'km';
            } else if (unitType === 'Miles') {
                length /= 1609.344; // Convert meters to miles
                unitString = 'mi';
            } else if (unitType === 'Feet') {
                length *= 3.28084; // Convert meters to feet
                unitString = 'ft';
            }
            return `${length.toFixed(4)} ${unitString}`
        } else if (measureType === 'Polygon') {
            let length = value;
            switch (unitType) {
                case 'Sq-meters':
                    return `${length.toFixed(4)} m<sup> 2</sup>`;
                case 'Sq-kilometers':
                    return `${(length / 1000000).toFixed(4)} km<sup> 2</sup>`;
                case 'Sq-feet':
                    return `${(length * 10.7639).toFixed(4)} ft<sup> 2</sup>`;
                case 'Sq-miles':
                    return `${(length * 3.861e-7).toFixed(4)} mi<sup> 2</sup>`;
                // Add other unit conversions as needed
                default:
                    return '';

            }
        }
    }

    /******Layer switcher code******/
    const handleCloseLayerViewer = () => {
        setAnchorE4(false);
    }
    const handleOpenLayerViewer = (event) => {
        setAnchorE4(event.currentTarget)
        if (layerDetails != null && layerDetails?.changeFrom == 'view' && layerDetails?.layerName.length > 0) {
            setSelectedViewLayer(layerDetails?.layerName)
        } else if (layerDetails != null && layerDetails?.changeFrom == 'view' && layerDetails?.layerName.length == 0) {
            setSelectedViewLayer([]);
        } else if (layerDetails != null && layerDetails?.changeFrom == 'active' && layerDetails?.layerName.length > 0) {
            setLayer(layerDetails?.layerName[0]);
        }
    }

    const activeLayerChange = (event) => {
        setSelectedViewLayer([]);
        let obj = { changeFrom: 'active', layerName: [event.target.value] }
        setLayer(event.target.value);
        dispatch(layerChangingAction(obj))
    }

    const viewLayerChange = (event) => {
        setLayer('');
        let obj = { changeFrom: 'view', layerName: [] }
        if (layerDetails != null && layerDetails?.changeFrom == 'view' && layerDetails?.layerName.length > 0) {
            if (layerDetails?.layerName.findIndex((ele) => ele == event.target.value) != -1 && event.target.checked == false) {
                let newObj = { ...layerDetails }
                let ind = newObj?.layerName.findIndex((ele) => ele == event.target.value);
                let arr = newObj?.layerName.filter((ele, i) => i !== ind);
                newObj.layerName = arr;
                dispatch(layerChangingAction(newObj));
            } else {
                let newAddLayer = { ...layerDetails }
                let newArr = [...newAddLayer.layerName];
                newArr.push(event.target.value);
                newAddLayer.layerName = newArr;
                dispatch(layerChangingAction(newAddLayer));
            }
        } else {
            obj.layerName.push(event.target.value)
            dispatch(layerChangingAction(obj));
        }

        console.log(event.target.checked)

    }

    return (
        <div>
            <Header position="fixed" open={open} style={{ backgroundColor: 'white', boxShadow: 'none' }}>
                <material.Toolbar>
                    <material.Button
                        id="basic-button"
                        aria-controls={openMenu ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={openMenu ? 'true' : undefined}
                        onClick={handleClick}
                        sx={{ textTransform: 'none' }}
                    >
                        Web<strong>GIS</strong><material.ArrowDropDownIcon></material.ArrowDropDownIcon>
                    </material.Button>
                    <StyledMenu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                        className='menu_list'
                    >
                        <material.MenuItem onClick={handleClose}>Overview</material.MenuItem>
                        <material.Divider sx={{ borderBottomWidth: 1, borderColor: 'black' }} />
                        <material.MenuItem onClick={handleClose}>Pricing</material.MenuItem>
                        <material.Divider sx={{ borderBottomWidth: 1, borderColor: 'black' }} />
                        <material.MenuItem onClick={handleClose}>Scene</material.MenuItem>
                        <material.Divider sx={{ borderBottomWidth: 1, borderColor: 'black' }} />
                        <material.MenuItem onClick={handleClose}>Help</material.MenuItem>
                    </StyledMenu>

                    <material.Typography variant="h6" noWrap component="div" sx={{ color: '#82b1ff', flexGrow: 1 }} className='ms-2'>
                        Esri Streets Basemap
                    </material.Typography>

                    <material.Button sx={{ textTransform: 'none' }} >Open Map Viewer</material.Button>
                    <material.Button sx={{ textTransform: 'none' }} className='mx-2'>Modify Map</material.Button>
                    <material.Button sx={{ textTransform: 'none' }} startIcon={<material.AccountCircleIcon />}>Sign In</material.Button>
                </material.Toolbar>
            </Header>

            <Subheader position="fixed" open={open} style={{ top: '64px', backgroundColor: '#eaeaea' }} >
                <material.Toolbar className='sub-header'>

                    <material.Button
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        sx={{ textTransform: 'none' }}
                        startIcon={<material.ListAltIcon />}
                    >
                        Details
                    </material.Button>
                    <material.Divider sx={{ borderBottomWidth: 2, borderColor: 'black' }} orientation="vertical" variant="middle" className='mx-1' />
                    <material.Button sx={{ textTransform: 'none' }} className='mx-2' onClick={handleOpenPopover} startIcon={<material.GridViewIcon />}>Basemap</material.Button>
                    <material.Button sx={{ textTransform: 'none' }} className='mx-2' onClick={handleOpenLayerViewer} startIcon={<material.DvrIcon />}>Layers</material.Button>

                    <material.Typography variant="h6" noWrap component="div" sx={{ color: '#82b1ff', flexGrow: 1 }} className='ms-2'>
                    </material.Typography>

                    {/* For Showing Base Map */}
                    <material.Popover
                        id={id}
                        open={openPopover}
                        anchorEl={anchorE2}
                        onClose={handleClosePopover}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <div style={{ width: 500 }}>
                            <div className="row ps-2 pe-2 pb-3" sx={{ minHeight: 300 }}>
                                <div className="col-12 px-4 py-2 d-flex flex-clumn justify-content-between">
                                    <material.Typography noWrap variant='h6' component="div">
                                        Select a basemap
                                    </material.Typography>
                                    <material.Typography noWrap component="div" sx={{ fontSize: '15px' }}>
                                        <material.CloseIcon onClick={handleClosePopover} />
                                    </material.Typography>
                                </div>
                                <material.Divider sx={{ borderBottomWidth: 2, borderColor: 'black' }} className='fs-4 fw-bold mb-3' />
                                {MapUrlList.map((mapDetails, ind) => (
                                    <div className="col-4 d-flex align-items-center justify-content-center flex-column " key={ind} onClick={() => changeMap(mapDetails)}>
                                        <material.Card variant="outlined" className='card-active'>
                                            <img src={mapDetails.url} alt="" style={{ width: '130px', height: '100px' }} />

                                        </material.Card>
                                        <material.Typography noWrap component="div" sx={{ fontSize: '15px' }}>
                                            {mapDetails.name}
                                        </material.Typography>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </material.Popover>

                    {/* For Showing Layer  */}
                    <material.Popover
                        id={idLayerSwitcher}
                        open={openLayerSwitcherPopover}
                        anchorEl={anchorE4}
                        onClose={handleCloseLayerViewer}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <div style={{ width: 500 }}>
                            <div className="row ps-3 pe-3 pb-3" sx={{ minHeight: 300 }}>
                                <div className="col-12 px-4 py-2 d-flex flex-clumn justify-content-between">
                                    <material.Typography noWrap variant='h6' component="div">
                                        Select a layer
                                    </material.Typography>
                                    <material.Typography noWrap component="div" sx={{ fontSize: '15px' }}>
                                        <material.CloseIcon onClick={handleCloseLayerViewer} />
                                    </material.Typography>
                                </div>
                                <material.Divider sx={{ borderBottomWidth: 2, borderColor: 'black' }} className='fs-4 fw-bold mb-3' />
                                <div className="col-6">
                                    <span className='fw-bold px-5 py-2  text-primary border border-primary rounded'>VIEW LAYERS</span>
                                    <material.FormGroup className="mt-2 px-2">
                                        {allLayers.map((radioValue, rInd) => (
                                            //<material.Checkbox value={radioValue.value} key={rInd}  />
                                            <material.FormControlLabel key={rInd} control={<material.Checkbox value={radioValue.value} checked={selectedViewLayer.includes(radioValue.value)} onChange={viewLayerChange} />} label={radioValue.name} />
                                        ))}
                                    </material.FormGroup>
                                </div>
                                <div className="col-6">
                                    <span className='fw-bold px-5 py-2 text-primary border border-primary rounded'>ACTIVE LAYERS</span>
                                    <material.FormControl className="mt-2 px-2">
                                        <material.RadioGroup
                                            aria-labelledby="demo-controlled-radio-buttons-group"
                                            name="controlled-radio-buttons-group"
                                            value={layer}
                                            onChange={activeLayerChange}
                                        >
                                            {allLayers.map((radioValue, rInd) => (
                                                <material.FormControlLabel key={rInd} value={radioValue.value} control={<material.Radio />} className='fs-5' label={radioValue.name} />
                                            ))}
                                        </material.RadioGroup>
                                    </material.FormControl>
                                </div>

                                {/* <div className="col-8 d-flex flex-column">
                                    {allLayers.map((radioValue, rInd) => (
                                        <span key={rInd} className='fs-5 py-1' >{radioValue.name}</span>
                                    ))}
                                </div> */}
                            </div>
                        </div>

                    </material.Popover>
                    {/* <material.IconButton
                        color="black"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                    //sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    >
                        <material.MenuIcon />
                    </material.IconButton> */}
                    {/* <material.Typography variant="h6" noWrap component="div">
                        Persistent drawer
                    </material.Typography> */}
                    <material.Button sx={{ textTransform: 'none' }} className='mx-2' startIcon={<material.ShareIcon />} >Share</material.Button>
                    <material.Button sx={{ textTransform: 'none' }} startIcon={<material.PrintIcon />} >Print</material.Button>
                    <material.Button sx={{ textTransform: 'none' }} className='mx-2' startIcon={<material.DesignServicesIcon />} onClick={handleOpenPopoverForMeasurment} >Measure</material.Button>
                    <Search >
                        <SearchIconWrapper sx={{ color: 'black' }}>
                            <material.SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase sx={{ color: 'black' }}
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>
                </material.Toolbar>
            </Subheader>

            {/* code for measurment dialog start */}

            <div className='bg-white measurment-dialog' style={{ display: openMeasurmentDialog ? 'block' : 'none' }}>
                <div className="row p-2 ">
                    <div className="col-12">
                        <div className='m-0 p-2 d-flex flex-clumn justify-content-between bg-info w-100 text-white fw-bold'>
                            <material.Typography noWrap component="div" className='fw-bold'>
                                Find area and length
                            </material.Typography>
                            <material.Typography noWrap component="div" sx={{ fontSize: '15px' }}  className='fw-bold'>
                                <material.CloseIcon onClick={handleClosePopoverForMeasurment} />
                            </material.Typography>
                        </div>
                    </div>
                    <div className="col-12 d-flex flex-row">
                        {/* <div className="row">
                                <div className="col-3">b</div>
                                <div className="col-3"></div>
                                <div className="col-3"></div>
                                </div> */}

                        <StyledToggleButtonGroup
                            size="small"
                            value={measurmentType}
                            exclusive
                            onChange={changeMesaurmentType}
                            aria-label="text alignment"
                        >
                            <material.ToggleButton value="Polygon" aria-label="left aligned">
                                <material.Tooltip title="Measure Area" arrow placement="bottom">
                                    <material.SquareFootIcon />
                                </material.Tooltip>
                            </material.ToggleButton>
                            <material.ToggleButton value="LineString" aria-label="centered">
                                <material.Tooltip title="Measure Length" arrow placement="bottom">
                                    <material.StraightenIcon />
                                </material.Tooltip>
                            </material.ToggleButton>
                            {/* <material.ToggleButton value="Point" aria-label="right aligned">
                                            <material.GpsFixedIcon />
                                        </material.ToggleButton> */}
                            {/* <material.ToggleButton value="" aria-label="right aligned">
                                            <material.RefreshIcon />
                                        </material.ToggleButton> */}
                        </StyledToggleButtonGroup>
                        <material.FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                            <material.InputLabel id="demo-select-small-label">Unit</material.InputLabel>
                            <material.Select
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={unit}
                                label="Select unit"
                                onChange={handleChange}
                            >
                                {/* <material.MenuItem value="">
                                            </material.MenuItem> */}
                                {unitOption?.map((ele, i) => (
                                    <material.MenuItem value={ele} key={i}>
                                        {ele}
                                    </material.MenuItem>
                                ))}
                            </material.Select>
                        </material.FormControl>

                    </div>
                    <div className="col-12 d-flex justify-content-center mt-2">
                        <span className='fw-bold'>Measurement Result</span>
                    </div>
                    <div className="col-12"><material.Divider className='mb-3' sx={{ borderBottomWidth: 3, borderColor: 'black' }} /></div>
                    <div className="col-12 d-flex justify-content-center mt-2">
                        {measurmentValue > 0 ? (<span dangerouslySetInnerHTML={{ __html: getFormatValue }}></span>) : (<span>no result</span>)}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Navbar