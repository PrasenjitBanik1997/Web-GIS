import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    measurmentValue: ''
}

const mesurmentValueChanege = createSlice({
    name: "measurmentvalue",
    initialState,
    reducers: {
        measurmentValueChangeAction: (state = initialState, action) => {
            const mesurmentValueChaneState = {
                measurmentValue: action.payload,
            };
            return mesurmentValueChaneState;
        }
    },
})

export const { measurmentValueChangeAction } = mesurmentValueChanege.actions;
export default mesurmentValueChanege.reducer;