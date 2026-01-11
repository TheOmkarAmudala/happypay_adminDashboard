import React, { useEffect } from "react";
import { connect } from "react-redux";
import {
	PhoneOutlined,
	UserOutlined,
	NumberOutlined,
	GiftOutlined
} from "@ant-design/icons";
import { Button, Form, Input, Alert } from "antd";
import {
	signUp,
	showAuthMessage,
	showLoading,
	hideAuthMessage
} from "store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";


const rules = {
	phoneNumber: [
		{ required: true, message: "Please enter phone number" },
		{ pattern: /^[0-9]{10}$/, message: "Enter valid 10-digit number" }
	],
	userName: [
		{ required: true, message: "Please enter username" }
	],
	otp: [
		{ required: true, message: "Please enter OTP" },
		{ len: 6, message: "OTP must be 6 digits" }
	]
};

export const RegisterForm = (props) => {
	const {
		signUp,
		showLoading,
		token,
		loading,
		redirect,
		message,
		showMessage,
		hideAuthMessage,
		allowRedirect = true
	} = props;

	const [otpSent, setOtpSent] = React.useState(false);
	const [sendingOtp, setSendingOtp] = React.useState(false);
	const [form] = Form.useForm();
	const navigate = useNavigate();

	const onSignUp = () => {
		form.validateFields()
			.then(values => {
				const payload = {
					phoneNumber: values.phoneNumber,
					userName: values.userName,
					otp: values.otp,
					referralCode: values.referralCode || ""
				};

				signUp(payload);
			})
			.catch(info => {
				console.log("Validate Failed:", info);
			});
	};



	useEffect(() => {
		// ✅ Redirect based on redirect state, not token
		if (redirect && allowRedirect) {
			navigate(redirect);
		}

		// ✅ Auto-hide error message
		if (showMessage) {
			const timer = setTimeout(() => hideAuthMessage(), 3000);
			return () => clearTimeout(timer);
		}


	}, [redirect, showMessage]);

	useEffect(() => {
		if (showMessage && message === "User already exists") {
			form.setFields([
				{
					name: "phoneNumber",
					errors: ["This phone number is already registered"]
				}
			]);
		}
	}, [showMessage, message]);




	const sendOtp = async () => {
		try {
			const phoneNumber = form.getFieldValue("phoneNumber");

			if (!phoneNumber || phoneNumber.length !== 10) {
				form.setFields([
					{
						name: "phoneNumber",
						errors: ["Enter valid phone number before requesting OTP"]
					}
				]);
				return;
			}

			setSendingOtp(true);

			await axios.get(
				`https://test.happypay.live/users/getotp?phoneNumber=${phoneNumber}`
			);

			setOtpSent(true);
		} catch (error) {
			console.error("OTP Error:", error);
		} finally {
			setSendingOtp(false);
		}
	};


	return (
		<>
			<motion.div
				initial={{ opacity: 0, marginBottom: 0 }}
				animate={{
					opacity: showMessage ? 1 : 0,
					marginBottom: showMessage ? 20 : 0
				}}
			>
				<Alert type="error" showIcon message={message} />
			</motion.div>

			<Form.Item style={{ textAlign: "center", marginTop: 8 }}>
				<span>Already have an account? </span>
				<a
					href="/auth/login?redirect=/app/dashboards/default"
					style={{ fontWeight: 500 }}
				>
					Login
				</a>
			</Form.Item>


			<Form
				form={form}
				layout="vertical"
				name="register-form"
				onFinish={onSignUp}
			>

				<Form.Item
					name="phoneNumber"
					label="Phone Number"
					rules={rules.phoneNumber}
					hasFeedback
				>
					<Input prefix={<PhoneOutlined />} />
				</Form.Item>




				<Form.Item
					name="otp"
					label="OTP"
					rules={rules.otp}
					hasFeedback
				>
					<Input
						prefix={<NumberOutlined className="text-primary" />}
						disabled={!otpSent}
						placeholder={otpSent ? "Enter OTP" : "Request OTP first"}
					/>
				</Form.Item>

				<Form.Item>
					<Button
						type="primary"
						block
						onClick={sendOtp}
						loading={sendingOtp}
					>
						Get OTP
					</Button>
				</Form.Item>





				<Form.Item
					name="userName"
					label="Username"
					rules={rules.userName}
					hasFeedback
				>
					<Input prefix={<UserOutlined className="text-primary" />} />
				</Form.Item>



				<Form.Item
					name="referralCode"
					label="Referral Code"
				>
					<Input prefix={<GiftOutlined className="text-primary" />} />
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit" block loading={loading}>
						Register
					</Button>
				</Form.Item>

			</Form>
		</>
	);
};

const mapStateToProps = ({ auth }) => {
	const { loading, message, showMessage, token, redirect } = auth;
	return { loading, message, showMessage, token, redirect };
};

const mapDispatchToProps = {
	signUp,
	showAuthMessage,
	hideAuthMessage,
	showLoading
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(RegisterForm);
