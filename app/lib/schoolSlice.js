import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  schools: [],
  loading: false,
  hasSchools: false,
};

const schoolSlice = createSlice({
  name: 'schools',
  initialState,
  reducers: {
    setSchools: (state, action) => {
      state.schools = action.payload;
      state.hasSchools = action.payload.length > 0;
    },
    addSchool: (state, action) => {
      state.schools.push(action.payload);
      state.hasSchools = state.schools.length > 0;
    },
    updateSchool: (state, action) => {
      const index = state.schools.findIndex(s => s._id === action.payload._id);
      if (index !== -1) {
        state.schools[index] = action.payload;
      }
    },
    deleteSchool: (state, action) => {
      state.schools = state.schools.filter(s => s._id !== action.payload);
      state.hasSchools = state.schools.length > 0;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setSchools, addSchool, updateSchool, deleteSchool, setLoading } = schoolSlice.actions;
export default schoolSlice.reducer;