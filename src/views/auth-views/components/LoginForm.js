import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Input, Divider, Alert } from "antd"; //
import { PhoneOutlined, ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion"; //
import { useNavigate } from "react-router-dom";

import CustomIcon from "components/util-components/CustomIcon";
import { GoogleSVG, FacebookSVG } from "assets/svg/icon";

import {
	signInSuccess,
	hideAuthMessage,
	signInWithGoogle,
	signInWithFacebook,
	showAuthMessage,
	resetRedirect,
} from "store/slices/authSlice";

const BRAND_BLUE = "#1E63E9";

const LoginForm = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [form] = Form.useForm();

	const { loading, redirect, showMessage, message, isAuthenticated } = useSelector((state) => state.auth);

	const [otpSent, setOtpSent] = useState(false);
	const [otpLoading, setOtpLoading] = useState(false);

	/* ----------------------------- SEND OTP ---------------------------------- */
	const sendOtp = async () => {
		try {
			const phone = form.getFieldValue("phoneNumber");
			if (!phone) {
				dispatch(showAuthMessage("Enter mobile number"));
				return;
			}

			setOtpLoading(true);
			const res = await fetch(`https://test.happypay.live/users/getotp?phoneNumber=${phone}`);
			const data = await res.json();

			if (data.status !== "success") {
				throw new Error(data.message || "Failed to send OTP");
			}
             console.log(data);
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

			const res = await fetch(`https://test.happypay.live/users/loginWithOPT?phoneNumber=${phoneNumber}&otp=${otp}`);
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

	useEffect(() => {
		if (redirect && isAuthenticated) {
			navigate(redirect);
			dispatch(resetRedirect());
		}
	}, [redirect, isAuthenticated, navigate, dispatch]);

	return (
		<div className="login-form-wrapper">
			<AnimatePresence mode="wait">
				{showMessage && (
					<motion.div
						key="alert"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
					>
						<Alert type="error" showIcon message={message} className="mb-4" />
					</motion.div>
				)}
			</AnimatePresence>

			<Form form={form} layout="vertical">
				<Form.Item
					name="phoneNumber"
					label={<span className="font-semibold text-gray-600">Mobile Number</span>}
					rules={[{ required: true, message: "Enter mobile number" }, { pattern: /^[6-9]\d{9}$/, message: "Enter valid mobile number" }]}
				>
					<Input
						prefix={<PhoneOutlined className="text-gray-400" />}
						size="large"
						disabled={otpSent}
						style={{ borderRadius: '8px' }}
						onChange={(e) => form.setFieldsValue({ phoneNumber: e.target.value.replace(/\D/g, "") })}
					/>
				</Form.Item>

				<AnimatePresence mode="wait">
					{otpSent && (
						<motion.div
							key="otp-section"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
						>
							<div className="flex justify-between items-center mb-1">
								<span className="text-gray-600 font-semibold ant-form-item-label">OTP</span>
								<Button
									type="link"
									size="small"
									onClick={() => setOtpSent(false)}
									icon={<ArrowLeftOutlined />}
									className="p-0 text-xs"
								>
									Change Number
								</Button>
							</div>
							<Form.Item name="otp" rules={[{ required: true, message: "Enter OTP" }]}>
								<Input
									size="large"
									maxLength={6}
									placeholder="000000"
									style={{ borderRadius: '8px', textAlign: 'center', letterSpacing: '12px', fontSize: '20px', fontWeight: 'bold' }}
								/>
							</Form.Item>

							<div className="flex justify-center mb-4">
								<Button
									type="link"
									icon={<ReloadOutlined />}
									onClick={sendOtp}
									loading={otpLoading}
									className="p-0 text-xs font-bold"
								>
									Resend OTP
								</Button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<Button
					block
					size="large"
					type="primary"
					loading={otpLoading}
					onClick={otpSent ? verifyOtp : sendOtp}
					style={{ background: BRAND_BLUE, borderRadius: '8px', height: '48px', fontWeight: 600 }}
				>
					{otpSent ? "Verify & Continue" : "Send OTP"}
				</Button>
			</Form>

			<Divider plain className="my-8">
				<span className="text-gray-400 text-xs uppercase tracking-widest">Secure Login</span>
			</Divider>


		</div>
	);
};

export default LoginForm;