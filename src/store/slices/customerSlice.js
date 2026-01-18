import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

export const fetchCustomers = createAsyncThunk(
    "customers/fetchCustomers",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get("/customer/getAll");
            return res.data?.data || [];
        } catch (err) {
            return rejectWithValue("Failed to fetch customers");
        }
    }
);

const customerSlice = createSlice({
    name: "customers",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default customerSlice.reducer;
