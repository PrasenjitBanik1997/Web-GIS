import { React, useEffect, useState } from 'react';
import { material } from '../../../library/material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';

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

function PolutionDataTable(props) {
    const { columns, data } = props;

    useEffect(() => {

    }, [props])


    const generateNewArry = (columns) => {
        const newArray = columns.filter(item => ["wasteCategory", "type", "activity", "amount", "unit"].includes(item));
        return newArray || [];
    }

    return (
        <material.Paper>
            <material.TableContainer sx={{ maxHeight: 350 }}>
                <material.Table stickyHeader aria-label="sticky table">
                    <material.TableHead sx={{ fontWeight: 'bold', color: 'white', textTransform: 'capitalize', backgroundColor: 'blue' }}>
                        <material.TableRow sx={{ textTransform: 'capitalize', height: 20 }} >
                            {generateNewArry(columns).map((column) => (
                                <StyledTableCell size='large'
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
                        {data?.map((rowData, ind) => {
                            return (
                                <material.TableRow key={ind}>
                                    {generateNewArry(columns).map((column, colInd) => {
                                        return (
                                            <material.TableCell size='large' key={colInd} align='center'>
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
    )
}

export default PolutionDataTable