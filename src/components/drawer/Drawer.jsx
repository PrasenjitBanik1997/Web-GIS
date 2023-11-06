import React from 'react';
import './Drawer.css';
import { styled, useTheme } from '@mui/material/styles';
import { material } from '../../library/material';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';

const drawerWidth = 240;
const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));
function Drawer() {

    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        console.log('open')
        setOpen(!open);
    };
    // const handleDrawerClose = () => {
    //     console.log('close')
    //     setOpen(false);
    // };

    return (
        <div>
            <Navbar open={open} setOpen={setOpen} handleDrawerOpen={handleDrawerOpen} />
            <material.Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        zIndex:100
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                {/* <DrawerHeader>
                    <material.IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <material.ChevronLeftIcon /> : <material.ChevronRightIcon />}
                    </material.IconButton>
                </DrawerHeader> */}
                <Sidebar/>
            </material.Drawer>
        </div>
    )
}

export default Drawer