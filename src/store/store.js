import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage/session';
import thunk from 'redux-thunk';
import MapchangerSlice from "./slice/MapchangerSlice";
import MeasurmentchangerSlice from "./slice/MeasurmentchangerSlice";
import MeasurmentvalueSlice from "./slice/MeasurmentvalueSlice";
import LayerChangerSlice from "./slice/LayerChangerSlice";

const persistConfig = {
    key: 'main-root',
    storage: storage,
};

const reducer = combineReducers({
    MapchangerSlice,
    MeasurmentchangerSlice,
    MeasurmentvalueSlice,
    LayerChangerSlice
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: [thunk]
});

export const persistor = persistStore(store);