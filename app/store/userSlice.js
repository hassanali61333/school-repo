import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loginAdmin: null,  
  adminID: null,    
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setLoginAdmin: (state, action) => {  
      state.loginAdmin = action.payload; 
    },
    setAdminID: (state, action) => {    
      state.adminID = action.payload;
    },
    logoutAdmin: (state) => {            
      state.loginAdmin = null;
      state.adminID = null;
    },
  },
});

export const { setLoginAdmin, setAdminID, logoutAdmin } = userSlice.actions;
export default userSlice.reducer;