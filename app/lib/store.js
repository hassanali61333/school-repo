import { configureStore } from '@reduxjs/toolkit';
import schoolReducer from './schoolSlice.js';

export const store = configureStore({
  reducer: {
    schools: schoolReducer,
  },
});