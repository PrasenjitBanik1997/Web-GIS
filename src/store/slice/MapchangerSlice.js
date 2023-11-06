import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    mapName: ''
}

const changeMap = createSlice({
    name: "mapname",
    initialState,
    reducers: {
        changeMapAction: (state = initialState, action) => {
            const mapChangeState = {
                mapName: action.payload,
            };
            return mapChangeState;
        }
    },
})

export const { changeMapAction } = changeMap.actions;
export default changeMap.reducer;