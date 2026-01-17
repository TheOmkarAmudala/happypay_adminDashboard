import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

export const fetchUserProfile = createAsyncThunk(
    "profile/fetchUserProfile",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get("/users/profile");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch profile");
        }
    }
);

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        data: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearProfile: (state) => {
            state.data = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
