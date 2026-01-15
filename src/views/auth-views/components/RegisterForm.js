import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { Link } from "react-router-dom";


const RegisterForm = () => {
	const [loading, setLoading] = useState(false);

	const onFinish = async (values) => {
		setLoading(true);

		try {
			const payload = {
				phoneNumber: values.phoneNumber,
				userName: values.userName,
				referralCode: values.referralCode || "",
				opt: "123" // 🔴 backend mandatory, OTP flow disabled
			};

			const res = await axios.post(
				"https://test.happypay.live/users/signup",
				payload
			);

			if (res.data?.status === "success") {
				message.success("Registration successful 🎉");
			} else {
				message.error(res.data?.message || "Registration failed");
			}
		} catch (err) {
			message.error(
				err?.response?.data?.message || "Something went wrong"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form layout="vertical" onFinish={onFinish}>
			<Form.Item
				label="Phone Number"
				name="phoneNumber"
				rules={[
					{ required: true, message: "Phone number is required" },
					{ len: 10, message: "Phone number must be 10 digits" }
				]}
			>
				<Input placeholder="Enter phone number" maxLength={10} />
			</Form.Item>

			<Form.Item
				label="Username"
				name="userName"
				rules={[
					{ required: true, message: "Username is required" }
				]}
			>
				<Input placeholder="Enter username" />
			</Form.Item>

			<Form.Item
				label="Referral Code (Optional)"
				name="referralCode"
			>
				<Input placeholder="Enter referral code" />
			</Form.Item>

			<Button
				type="primary"
				htmlType="submit"
				block
				loading={loading}
			>
				Register
			</Button>


			<div style={{ marginTop: 16, textAlign: "center" }}>
				<Link to="/auth/login?redirect=/app/apps/customers">
					Back to Login
				</Link>
			</div>

		</Form>
	);
};

export default RegisterForm;
