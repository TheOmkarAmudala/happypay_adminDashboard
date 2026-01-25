import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Input, Divider, Alert } from "antd";
import {
	PhoneOutlined,
	LockOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { setUserProfile } from "store/slices/authSlice";

import CustomIcon from "components/util-components/CustomIcon";
import { GoogleSVG, FacebookSVG } from "assets/svg/icon";

import {
	signIn,
	signInSuccess,
	showLoading,
	hideAuthMessage,
	signInWithGoogle,
	signInWithFacebook,
	showAuthMessage,
	resetRedirect
} from "store/slices/authSlice";

const BRAND_BLUE = "#1E63E9";

/* -------------------------------------------------------------------------- */
/*                               LOGIN FORM                                   */
/* -------------------------------------------------------------------------- */

const LoginForm = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [form] = Form.useForm();

	const {
		token,
		loading,
		redirect,
		showMessage,
		message,
		isAuthenticated
	} = useSelector((state) => state.auth);

	const [loginMode, setLoginMode] = useState("PASSWORD");
	const [otpSent, setOtpSent] = useState(false);
	const [otpLoading, setOtpLoading] = useState(false);

	/* ----------------------------- LOGIN HANDLER ----------------------------- */

	const onLogin = (values) => {
		if (loginMode === "PASSWORD") {
			dispatch(showLoading());
			dispatch(signIn(values));
		} else {
			verifyOtp();
		}
	};

	/* ----------------------------- SEND OTP ---------------------------------- */

	const sendOtp = async () => {
		try {
			const phone = form.getFieldValue("phoneNumber");
			if (!phone) {
				dispatch(showAuthMessage("Enter mobile number"));
				return;
			}

			setOtpLoading(true);

			const res = await fetch(
				`https://test.happypay.live/users/getotp?phoneNumber=${phone}`
			);
			const data = await res.json();

			if (data.status !== "success") {
				throw new Error(data.message || "Failed to send OTP");
			}

			setOtpSent(true);
		} catch (err) {
			dispatch(showAuthMessage(err.message));
		} finally {
			setOtpLoading(false);
		}
	};

	/* ----------------------------- VERIFY OTP -------------------------------- */

	const verifyOtp = async () => {
		try {
			setOtpLoading(true);

			const phoneNumber = form.getFieldValue("phoneNumber");
			const otp = form.getFieldValue("otp");

			if (!otp || otp.length !== 6) {
				throw new Error("Enter valid 6-digit OTP");
			}

			const res = await fetch(
				`https://test.happypay.live/users/loginWithOPT?phoneNumber=${phoneNumber}&otp=${otp}`
			);
			const result = await res.json();

			if (result.status !== "success") {
				throw new Error(result.message || "OTP verification failed");
			}

			const token = result?.data?.token;
			dispatch(signInSuccess(token));
			navigate("/app/dashboard");
		} catch (err) {
			dispatch(showAuthMessage(err.message));
		} finally {
			setOtpLoading(false);
		}
	};

	/* ----------------------------- SIDE EFFECTS ------------------------------ */

	useEffect(() => {
		if (redirect && isAuthenticated) {
			navigate(redirect);
			dispatch(resetRedirect());
		}
	}, [redirect, isAuthenticated]);

	useEffect(() => {
		if (showMessage) {
			const timer = setTimeout(() => {
				dispatch(hideAuthMessage());
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [showMessage]);

	/* ----------------------------- SOCIAL UI -------------------------------- */

	const renderSocialLogin = (
		<>
			<Divider plain>
				<span className="text-gray-400 text-sm">or continue with</span>
			</Divider>

			<div className="flex justify-center gap-3">
				<Button
					shape="round"
					icon={<CustomIcon svg={GoogleSVG} />}
					disabled={loading}
					className="h-10 px-4"
					onClick={() => dispatch(signInWithGoogle())}
				>
					Google
				</Button>

				<Button
					shape="round"
					icon={<CustomIcon svg={FacebookSVG} />}
					disabled={loading}
					className="h-10 px-4"
					onClick={() => dispatch(signInWithFacebook())}
				>
					Facebook
				</Button>
			</div>
		</>
	);

	/* ----------------------------- RENDER ----------------------------------- */

	return (
		<>
			{/* ERROR MESSAGE */}
			<motion.div
				initial={{ opacity: 0, marginBottom: 0 }}
				animate={{
					opacity: showMessage ? 1 : 0,
					marginBottom: showMessage ? 16 : 0
				}}
			>
				<Alert type="error" showIcon message={message} />
			</motion.div>

			<Form
				form={form}
				layout="vertical"
				onFinish={onLogin}
				className="w-full"
			>
				{/* MOBILE NUMBER */}
				<Form.Item
					name="phoneNumber"
					label="Mobile Number"
					rules={[
						{ required: true, message: "Enter mobile number" },
						{ pattern: /^[6-9]\d{9}$/, message: "Enter valid mobile number" }
					]}
				>
					<Input
						prefix={<PhoneOutlined />}
						size="large"
						maxLength={10}
						inputMode="numeric"
						className="pl-2"
					/>
				</Form.Item>

				{/* PASSWORD */}
				{loginMode === "PASSWORD" && (
					<Form.Item
						name="passcode"
						label="Password"
						rules={[{ required: true, message: "Enter password" }]}
					>
						<Input.Password
							prefix={<LockOutlined />}
							size="large"
						/>
					</Form.Item>
				)}

				{/* OTP */}
				{loginMode === "OTP" && otpSent && (
					<Form.Item
						name="otp"
						label="OTP"
						rules={[{ required: true, message: "Enter OTP" }]}
					>
						<Input
							size="large"
							maxLength={6}
							inputMode="numeric"
							className="tracking-widest text-center"
						/>
					</Form.Item>
				)}

				{/* PRIMARY ACTION */}
				{loginMode === "OTP" && !otpSent && (
					<Button
						block
						size="large"
						loading={otpLoading}
						onClick={sendOtp}
						style={{ background: BRAND_BLUE, borderColor: BRAND_BLUE }}
						type="primary"
					>
						Send OTP
					</Button>
				)}

				{(loginMode === "PASSWORD" || otpSent) && (
					<Button
						block
						size="large"
						htmlType="submit"
						loading={loading || otpLoading}
						style={{ background: BRAND_BLUE, borderColor: BRAND_BLUE }}
						type="primary"
					>
						Sign In
					</Button>
				)}

				{/* MODE SWITCH */}
				<div className="flex justify-between mt-3 text-sm">
					<Button type="link" className="px-0" onClick={() => setLoginMode("OTP")}>
						Sign in with OTP
					</Button>
					<Button type="link" className="px-0" onClick={() => setLoginMode("PASSWORD")}>
						Use password instead
					</Button>
				</div>

				{/* SOCIAL LOGIN */}
				{loginMode === "PASSWORD" && <div className="mt-4">{renderSocialLogin}</div>}
			</Form>
		</>
	);
};

export default LoginForm;