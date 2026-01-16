import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AUTH_TOKEN } from 'constants/AuthConstant';
import FirebaseService from 'services/FirebaseService';
import axios from "axios"


/* -------------------- INITIAL STATE -------------------- */

export const initialState = {
	loading: false,
	message: '',
	showMessage: false,
	redirect: '',
	token: localStorage.getItem(AUTH_TOKEN) || null,
	isAuthenticated: !!localStorage.getItem(AUTH_TOKEN),

};

/* -------------------- HAPPY PAY LOGIN -------------------- */

export const signIn = createAsyncThunk(
	"auth/signIn",
	async ({ phoneNumber, passcode }, { rejectWithValue }) => {
		try {
			const response = await fetch(
				"https://test.happypay.live/users/login",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						phoneNumber,
						passcode: parseInt(passcode, 10),
					}),
				}
			);

			const data = await response.json();
			console.log("🟦 Login API response:", data);

			if (!response.ok) {
				return rejectWithValue(data.message || "Login failed");
			}

			// ✅ CORRECT TOKEN EXTRACTION
			const token = data?.data?.token;

			if (!token) {
				return rejectWithValue("Token not found in login response");
			}

			// ✅ STORE TOKEN
			localStorage.setItem(AUTH_TOKEN, token);
			console.log("🔐 Token stored successfully:", token);

			return token;
		} catch (err) {
			return rejectWithValue("Server not reachable");
		}
	}
);

/* -------------------- OPTIONAL: SIGN UP (IF NOT USED, CAN REMOVE) -------------------- */



export const signUp = createAsyncThunk(
	"auth/register",
	async (data, { rejectWithValue }) => {
		console.group("🟦 SIGNUP API DEBUG");

		console.log("📤 Payload being sent:", data);

		try {
			console.time("⏱ Signup API Time");

			const response = await axios.post(
				"https://test.happypay.live/users/signup",
				{
					phoneNumber: data.phoneNumber,
					userName: data.userName,
					otp: data.otp,
					referralCode: data.referralCode
				},
				{
					timeout: 10000 // ⛔ prevent infinite loading
				}
			);

			console.timeEnd("⏱ Signup API Time");

			console.log("✅ Response Status:", response.status);
			console.log("📥 Response Data:", response.data);

			if (response.data?.token) {
				localStorage.setItem(AUTH_TOKEN, response.data.token);
				console.log("🔐 Token stored in localStorage");
			}

			console.groupEnd();
			return response.data;

		} catch (err) {
			const backendData = err.response?.data;

			console.timeEnd("⏱ Signup API Time");

			console.error("❌ Signup API Error (raw):", backendData);

			if (err.response) {
				console.error("Status:", err.response.status);
				console.error("Headers:", err.response.headers);
			} else if (err.request) {
				console.error("No response received (CORS / Network issue)");
				console.error(err.request);
			} else {
				console.error("Request setup error:", err.message);
			}

			console.groupEnd();

			// ✅ IMPORTANT: normalize duplicate-user error for UI
			if (
				backendData?.error?.includes("E11000") ||
				backendData?.error?.includes("duplicate")
			) {
				return rejectWithValue("User already exists");
			}

			return rejectWithValue(
				backendData?.message || "Signup failed"
			);
		}

	}
);


/* -------------------- SIGN OUT -------------------- */

export const signOut = createAsyncThunk('auth/signOut', async () => {
	localStorage.removeItem(AUTH_TOKEN);
	return true;
});



/* -------------------- SOCIAL LOGIN (KEEP FIREBASE) -------------------- */

export const signInWithGoogle = createAsyncThunk(
	'auth/signInWithGoogle',
	async (_, { rejectWithValue }) => {
		const response = await FirebaseService.signInGoogleRequest();
		if (response.user) {
			const token = response.user.refreshToken;
			localStorage.setItem(AUTH_TOKEN, token);
			return token;
		}
		return rejectWithValue(response.message?.replace('Firebase: ', ''));
	}
);

export const signInWithFacebook = createAsyncThunk(
	'auth/signInWithFacebook',
	async (_, { rejectWithValue }) => {
		const response = await FirebaseService.signInFacebookRequest();
		if (response.user) {
			const token = response.user.refreshToken;
			localStorage.setItem(AUTH_TOKEN, token);
			return token;
		}
		return rejectWithValue(response.message?.replace('Firebase: ', ''));
	}
);

/* -------------------- SLICE -------------------- */
export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		// 🔑 Generic login success (OTP / custom login)
		signInSuccess: (state, action) => {
			state.loading = false;
			state.token = action.payload;
			state.isAuthenticated = true;
			state.redirect = '/app/dashboard';
			localStorage.setItem('AUTH_TOKEN', action.payload);
		},

		// 🔄 Reset redirect after navigation
		resetRedirect: (state) => {
			state.redirect = '';
		},

		// ⚠️ Show auth error/info message
		showAuthMessage: (state, action) => {
			state.message = action.payload;
			state.showMessage = true;
			state.loading = false;
		},

		// ❌ Hide auth message
		hideAuthMessage: (state) => {
			state.message = '';
			state.showMessage = false;
		},

		// 🚪 Logout
		signOutSuccess: (state) => {
			state.loading = false;
			state.token = null;
			state.isAuthenticated = false;
			state.redirect = '/';
			localStorage.removeItem('AUTH_TOKEN');
		},

		// ⏳ Global auth loading
		showLoading: (state) => {
			state.loading = true;
		}
	},

	extraReducers: (builder) => {
		builder
			/* -------- SIGN IN -------- */
			.addCase(signIn.pending, (state) => {
				state.loading = true;
			})
			.addCase(signIn.fulfilled, (state, action) => {
				state.loading = false;
				state.token = action.payload;
				state.isAuthenticated = true;
				state.redirect = '/app/dashboard';
				localStorage.setItem('AUTH_TOKEN', action.payload);
			})
			.addCase(signIn.rejected, (state, action) => {
				state.loading = false;
				state.message = action.payload;
				state.showMessage = true;
			})

			/* -------- SIGN OUT -------- */
			.addCase(signOut.fulfilled, (state) => {
				state.loading = false;
				state.token = null;
				state.isAuthenticated = false;
				state.redirect = '/';
				localStorage.removeItem('AUTH_TOKEN');
			})

			/* -------- GOOGLE -------- */
			.addCase(signInWithGoogle.pending, (state) => {
				state.loading = true;
			})
			.addCase(signInWithGoogle.fulfilled, (state, action) => {
				state.loading = false;
				state.token = action.payload;
				state.isAuthenticated = true;
				state.redirect = '/app/dashboard';
				localStorage.setItem('AUTH_TOKEN', action.payload);
			})
			.addCase(signInWithGoogle.rejected, (state, action) => {
				state.loading = false;
				state.message = action.payload;
				state.showMessage = true;
			})

			/* -------- FACEBOOK -------- */
			.addCase(signInWithFacebook.pending, (state) => {
				state.loading = true;
			})
			.addCase(signInWithFacebook.fulfilled, (state, action) => {
				state.loading = false;
				state.token = action.payload;
				state.isAuthenticated = true;
				state.redirect = '/app/dashboard';
				localStorage.setItem('AUTH_TOKEN', action.payload);
			})
			.addCase(signInWithFacebook.rejected, (state, action) => {
				state.loading = false;
				state.message = action.payload;
				state.showMessage = true;
			})

			/* -------- SIGN UP -------- */
			.addCase(signUp.pending, (state) => {
				state.loading = true;
				state.showMessage = false;
			})
			.addCase(signUp.fulfilled, (state, action) => {
				state.loading = false;
				state.showMessage = false;

				// if backend returns token on signup
				if (action.payload?.token) {
					state.token = action.payload.token;
					state.isAuthenticated = true;
					localStorage.setItem('AUTH_TOKEN', action.payload.token);
				}

				state.redirect = '/app/dashboard';
			})
			.addCase(signUp.rejected, (state, action) => {
				state.loading = false;
				state.message = action.payload;
				state.showMessage = true;
			});
	}
});



/* -------------------- EXPORTS -------------------- */

export const {
	showAuthMessage,
	resetRedirect,
	hideAuthMessage,
	signOutSuccess,
	showLoading,
	signInSuccess
} = authSlice.actions;


export default authSlice.reducer;
