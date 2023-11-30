import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    layerName: null
}

const layerNameChange = createSlice({
    name: "layername",
    initialState,
    reducers: {
        layerChangingAction: (state = initialState, action) => {
            const layerNameChangingState = {
                layerName: action.payload,
            };
            return layerNameChangingState;
        }
    },
})

export const { layerChangingAction } = layerNameChange.actions;
export default layerNameChange.reducer;