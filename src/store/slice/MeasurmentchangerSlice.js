import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    mesurmentType: ''
}

const changeMeasurmentType = createSlice({
    name: "mesurmenttype",
    initialState,
    reducers: {
        changeMeasurmentTypeAction: (state = initialState, action) => {
            const mesurmentTypeState = {
                mesurmentType: action.payload,
            };
            return mesurmentTypeState;
        }
    },
})

export const { changeMeasurmentTypeAction } = changeMeasurmentType.actions;
export default changeMeasurmentType.reducer;