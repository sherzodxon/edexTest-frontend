// store/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import  api  from "../lib/axios";

interface AuthState {
  token: string | null;
  user: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", { username, password });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login xatosi");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    loadUser: (state) => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (savedToken) {
        state.token = savedToken;
        state.user = savedUser ? JSON.parse(savedUser) : null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, loadUser } = authSlice.actions;
export default authSlice.reducer;
