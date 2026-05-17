import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loginuser: null,  
  userId: null,    
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setloginuser: (state, action) => {  
      state.loginuser = action.payload; 
    },
    setuserId: (state, action) => {    
      state.userId = action.payload;
    },
    logoutAdmin: (state) => {            
      state.loginuser = null;
      state.userId = null;
    },
  },
});

export const { setloginuser, setuserId, logoutAdmin } = userSlice.actions;
export default userSlice.reducer;