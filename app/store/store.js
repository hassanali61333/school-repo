import { configureStore } from '@reduxjs/toolkit';
import schoolReducer from './schoolSlice.js';
import userReducer from './userSlice.js'
export const store = configureStore({
  reducer: {
    schools: schoolReducer,
    users:userReducer
  },
});