import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Button, Form, Input, Divider, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { GoogleSVG, FacebookSVG } from 'assets/svg/icon';
import CustomIcon from 'components/util-components/CustomIcon';
import { resetRedirect } from 'store/slices/authSlice';
import {
	signIn,
	showLoading,
	hideAuthMessage,
	signInWithGoogle,
	signInWithFacebook,
	showAuthMessage
} from 'store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const LoginForm = props => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [form] = Form.useForm();

	// 🔹 UI STATES
	const [loginMode, setLoginMode] = useState('PASSWORD'); // PASSWORD | OTP
	const [otpSent, setOtpSent] = useState(false);
	const [otpLoading, setOtpLoading] = useState(false);

	const {
		otherSignIn,
		showForgetPassword,
		onForgetPasswordClick,
		signIn,
		token,
		loading,
		redirect,
		showMessage,
		message,
		isAuthenticated,
		allowRedirect = true
	} = props;

	// 🔹 PASSWORD LOGIN
	const onLogin = values => {
		if (loginMode === 'PASSWORD') {
			showLoading();
			signIn(values);
		} else {
			verifyOtp(); // ✅ DO NOT pass values manually
		}
	};

	// 🔹 SEND OTP
	const sendOtp = async () => {
		try {
			const phone = form.getFieldValue('phoneNumber');
			if (!phone) return;

			setOtpLoading(true);
			await fetch(
				`https://test.happypay.live/users/getotp?phoneNumber=${phone}`
			);
			setOtpSent(true);
		} catch (err) {
			console.error(err);
		} finally {
			setOtpLoading(false);
		}
	};

	// 🔹 VERIFY OTP
	const verifyOtp = async () => {
		try {
			setOtpLoading(true);

			const phoneNumber = form.getFieldValue('phoneNumber');
			const otp = form.getFieldValue('otp');

			const res = await fetch(
				`https://test.happypay.live/users/loginWithOPT?phoneNumber=${encodeURIComponent(
					phoneNumber
				)}&otp=${encodeURIComponent(otp)}`,
				{ method: 'GET' }
			);

			const result = await res.json();

			// ❌ DO NOT treat message as error
			if (result.status !== 'success') {
				throw new Error(result.message || 'OTP verification failed');
			}

			// ✅ STORE TOKEN
			const token = result?.data?.token;
			if (!token) {
				throw new Error('Token not received');
			}

			localStorage.setItem('AUTH_TOKEN', token);

			// ✅ OPTIONAL: update redux auth
			signIn({
				token,
				phoneNumber
			});

			// ✅ redirect
			navigate(redirect || '/app');

		} catch (err) {
			console.error('OTP LOGIN ERROR:', err);
			showAuthMessage(err.message || 'Login failed');
		} finally {
			setOtpLoading(false);
		}
	};


	// 🔹 SOCIAL LOGIN
	const onGoogleLogin = () => {
		props.showLoading();
		signInWithGoogle();
	};

	const onFacebookLogin = () => {
		props.showLoading();
		signInWithFacebook();
	};

	// 🔹 REDIRECT HANDLING
	useEffect(() => {
		if (token !== null && allowRedirect) {
			navigate(redirect);
		}
		if (showMessage) {
			const timer = setTimeout(() => hideAuthMessage(), 3000);
			return () => clearTimeout(timer);
		}
	}, []);

	useEffect(() => {
		if (redirect && isAuthenticated) {
			navigate(redirect);
			dispatch(resetRedirect());
		}
	}, [redirect, isAuthenticated, navigate, dispatch]);

	// 🔹 SOCIAL UI
	const renderOtherSignIn = (
		<div>
			<Divider>
				<span className="text-muted">or connect with</span>
			</Divider>
			<div className="d-flex justify-content-center">
				<Button
					onClick={onGoogleLogin}
					className="mr-2"
					disabled={loading}
					icon={<CustomIcon svg={GoogleSVG} />}
				>
					Google
				</Button>
				<Button
					onClick={onFacebookLogin}
					disabled={loading}
					icon={<CustomIcon svg={FacebookSVG} />}
				>
					Facebook
				</Button>
			</div>
		</div>
	);

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

			<Form
				form={form}
				layout="vertical"
				name="login-form"
				onFinish={onLogin}
			>
				{/* 📱 PHONE */}
				<Form.Item
					name="phoneNumber"
					label="Mobile Number"
					rules={[
						{ required: true, message: 'Enter mobile number' },
						{
							pattern: /^[6-9]\d{9}$/,
							message: 'Enter valid Indian mobile number'
						}
					]}
				>
					<Input
						prefix={<MailOutlined />}
						maxLength={10}
						inputMode="numeric"
					/>
				</Form.Item>

				{/* 🔐 PASSWORD MODE */}
				{loginMode === 'PASSWORD' && (
					<Form.Item
						name="passcode"
						label="Password"
						rules={[{ required: true, message: 'Enter password' }]}
					>
						<Input.Password prefix={<LockOutlined />} />
					</Form.Item>
				)}

				{/* 🔢 OTP MODE */}
				{loginMode === 'OTP' && otpSent && (
					<Form.Item
						name="otp"
						label="OTP"
						rules={[{ required: true, message: 'Enter OTP' }]}
					>
						<Input maxLength={6} />
					</Form.Item>
				)}

				{/* 🔘 ACTION BUTTONS */}
				{loginMode === 'OTP' && !otpSent && (
					<Button
						type="primary"
						block
						loading={otpLoading}
						onClick={sendOtp}
					>
						Send OTP
					</Button>
				)}

				{(loginMode === 'PASSWORD' || otpSent) && (
					<Button
						type="primary"
						htmlType="submit"
						block
						loading={loading || otpLoading}
					>
						{loginMode === 'PASSWORD' ? 'Sign In' : 'Verify OTP'}
					</Button>
				)}

				{/* 🔄 TOGGLE */}
				<div className="d-flex justify-content-between mt-2">
					<Button
						type="link"
						onClick={() => {
							setLoginMode('OTP');
							setOtpSent(false);
							form.resetFields(['otp']);
						}}
					>
						Login using OTP
					</Button>

					<Button
						type="link"
						onClick={() => {
							setLoginMode('PASSWORD');
							setOtpSent(false);
							form.resetFields(['otp']);
						}}
					>
						Login using Password
					</Button>
				</div>

				{/* 🌐 SOCIAL */}
				{otherSignIn && loginMode === 'PASSWORD' && renderOtherSignIn}
			</Form>
		</>
	);
};

LoginForm.propTypes = {
	otherSignIn: PropTypes.bool,
	showForgetPassword: PropTypes.bool
};

LoginForm.defaultProps = {
	otherSignIn: true,
	showForgetPassword: false
};

const mapStateToProps = ({ auth }) => {
	const { loading, message, showMessage, token, redirect, isAuthenticated } = auth;
	return { loading, message, showMessage, token, redirect, isAuthenticated };
};

const mapDispatchToProps = {
	signIn,
	showLoading,
	hideAuthMessage,
	signInWithGoogle,
	signInWithFacebook
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
