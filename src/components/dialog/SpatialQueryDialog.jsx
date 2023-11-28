import { React, useEffect, useState, useRef } from 'react';
import './SpatialQueryDialog.css';
import { material } from '../../library/material';
import Table from '../table/Table';
import pdfIcon from '../../assets/map-image/pdfIcon.png';
import excelIcon from '../../assets/map-image/excleIcon.png';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import { downloadPdf, downloadExcel } from '../../utils/downloadExcelAndPdf';

const StyledTableCell = styled(material.TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#0d47a1",
        color: theme.palette.common.white,
        fontWeight: "bold",
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,

    },
}));

function SpatialQueryDialog({ openInfo, spatialQueryInfoDialogClose }) {

    const handleClose = () => {
        spatialQueryInfoDialogClose();
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // const downloadExcelAndPdf = (fileType, featureData, ind) => {
    //     if (featureData?.tableData?.length > 0) {
    //         if (fileType === 'PDF') {
    //             downloadPdf(featureData.tableData, featureData.layerName);
    //         } else if (fileType === 'EXCEL') {
    //             downloadExcel(featureData.tableData, featureData.layerName);
    //         }
    //     }
    //     setAnchorEl(null);
    // }


    const downloadPdfDoc = (featureData) => {
        downloadPdf(featureData);
    }


    return (
        <div>
            <material.Dialog
                fullWidth={true}
                maxWidth={'xl'}
                open={openInfo.open}
            // onClose={handleClose}
            >
                <material.DialogTitle className='d-flex justify-content-between align-items-center fw-bold'>
                    <span>Spatial Query Information</span>
                    <material.IconButton aria-label="delete" size="large" color="error" onClick={handleClose}>
                        <material.CloseIcon color="error" />
                    </material.IconButton>
                </material.DialogTitle>
                <material.DialogContent>
                    <material.DialogContentText>
                    <material.Button variant="contained" color="success" sx={{ textTransform: 'none',mb:2 }} startIcon={<img src={pdfIcon} alt="" style={{ width: 25, height: 25 }} />} onClick={()=>downloadPdfDoc(openInfo.spatilQueryInfo)}>Download Pdf</material.Button>
                        </material.DialogContentText>
                    {openInfo.spatilQueryInfo.map((ele, i) =>
                        <material.Accordion className='mb-2 border border-3 border-primary' key={i}>
                            <material.AccordionSummary
                                expandIcon={<material.ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <material.Typography className='fw-bold text-primary'>{ele.layerName.toUpperCase()}</material.Typography>
                            </material.AccordionSummary>
                            <material.AccordionDetails className='mt-0'>
                                <div className='d-flex justify-content-end mb-2'>
                                    {/* <material.Button variant="contained" color="success" sx={{ textTransform: 'none' ,mr:1}} startIcon={<img src={excelIcon} alt="" style={{ width: 25, height: 25 }} />} onClick={()=>downloadExcelAndPdf('EXCEL', ele,i)}>Download Excel</material.Button>
                                <material.Button variant="contained" color="success" sx={{ textTransform: 'none' }} startIcon={<img src={pdfIcon} alt="" style={{ width: 25, height: 25 }} />} onClick={()=>downloadExcelAndPdf('EXCEL', ele,i)}>Download Pdf</material.Button>   */}
                                    {/* <material.Button
                                        id="basic-button"
                                        variant="contained"
                                        startIcon={<material.FileDownloadIcon />}
                                        color="success"
                                        aria-controls={menuOpen ? 'basic-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={menuOpen ? 'true' : undefined}
                                        onClick={handleClick}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Download data
                                    </material.Button>
                                    <material.Menu
                                        id="basic-menu"
                                        anchorEl={anchorEl}
                                        open={menuOpen}
                                        onClose={handleMenuClose}
                                        MenuListProps={{
                                            'aria-labelledby': 'basic-button',
                                            sx: { width: anchorEl && anchorEl.offsetWidth }
                                        }}
                                    >
                                        <material.MenuItem onClick={() => downloadExcelAndPdf('EXCEL', ele,i)}>
                                            <material.ListItemIcon>
                                                <img src={excelIcon} alt="" style={{ width: 30, height: 30 }} />
                                            </material.ListItemIcon>
                                            
                                            In Excel
                                        </material.MenuItem>
                                        <material.MenuItem onClick={() => downloadExcelAndPdf('PDF', ele,i)}>
                                            <material.ListItemIcon>
                                                <img src={pdfIcon} alt="" style={{ width: 30, height: 30 }} />
                                            </material.ListItemIcon>
                                         
                                            In Pdf
                                        </material.MenuItem>
                                    </material.Menu> */}


                                </div>
                                {/* <Table columns={ele.columnName} data={ele.tableData} /> */}
                                <material.Paper>
                                    <material.TableContainer sx={{ maxHeight: 350 }}>
                                        <material.Table stickyHeader aria-label="sticky table">
                                            <material.TableHead sx={{ fontWeight: 'bold', color: 'white', textTransform: 'capitalize', backgroundColor: 'blue' }}>
                                                <material.TableRow sx={{ textTransform: 'capitalize', height: 20 }} >
                                                    {ele.columnName.map((column) => (
                                                        <StyledTableCell size='small'
                                                            key={column}
                                                            align='center'
                                                        //sx={{fontWeight:'bold',color:'white'}}
                                                        >
                                                            {column}
                                                        </StyledTableCell>
                                                    ))}
                                                </material.TableRow>
                                            </material.TableHead>
                                            <material.TableBody>
                                                {ele.tableData?.map((rowData, ind) => {
                                                    return (
                                                        <material.TableRow key={ind}>
                                                            {ele.columnName.map((column, colInd) => {
                                                                return (
                                                                    <material.TableCell size='small' key={colInd} align='center'>
                                                                        {rowData[column]}
                                                                    </material.TableCell>
                                                                );
                                                            })}
                                                        </material.TableRow>
                                                    );
                                                })}
                                            </material.TableBody>
                                        </material.Table>
                                    </material.TableContainer>
                                </material.Paper>
                            </material.AccordionDetails>
                        </material.Accordion>
                    )}


                </material.DialogContent>
                <material.DialogActions>
                    {/* <material.Button  variant="contained" onClick={handleClose} color="error" startIcon={ <material.CloseIcon/>} className='me-2'>Close</material.Button> */}
                </material.DialogActions>
            </material.Dialog>
        </div>
    )
}

export default SpatialQueryDialog