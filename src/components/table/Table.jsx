import { React, useEffect, useState } from 'react';
import './Table.css';
import { material } from '../../library/material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';

const StyledTableCell = styled(material.TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor:"#ff9800",
        color: theme.palette.common.white,
        fontWeight: "bold",
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,

    },
}));

function Table(props) {

    const { columns, data } = props;

    return (
        <material.Paper sx={{ width: '100%',pb:1 }}>
            <material.TableContainer sx={{ maxHeight: 240 }}>
                <material.Table stickyHeader aria-label="sticky table">
                    <material.TableHead sx={{fontWeight:'bold',color:'white',textTransform:'capitalize',backgroundColor:'blue'}}>
                        <material.TableRow sx={{textTransform:'capitalize',height:20}} >
                            {columns.map((column) => (
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
                        {data?.map((ele, ind) => {
                            return (
                                <material.TableRow key={ind}>
                                    {columns.map((column, colInd) => {
                                        return (
                                            <material.TableCell size='small' key={colInd} align='center'>
                                                {ele[column]}
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
    )
}

export default Table