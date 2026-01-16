import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Form, Input, Divider, Alert } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import CustomIcon from 'components/util-components/CustomIcon'
import { GoogleSVG, FacebookSVG } from 'assets/svg/icon'

import {
	signIn,
	signInSuccess,
	showLoading,
	hideAuthMessage,
	signInWithGoogle,
	signInWithFacebook,
	showAuthMessage,
	resetRedirect
} from 'store/slices/authSlice'

/* -------------------------------------------------------------------------- */
/*                               LOGIN FORM                                   */
/* -------------------------------------------------------------------------- */

const LoginForm = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [form] = Form.useForm()

	/* ----------------------------- REDUX STATE ----------------------------- */
	const {
		token,
		loading,
		redirect,
		showMessage,
		message,
		isAuthenticated
	} = useSelector(state => state.auth)

	/* ----------------------------- UI STATE -------------------------------- */
	const [loginMode, setLoginMode] = useState('PASSWORD') // PASSWORD | OTP
	const [otpSent, setOtpSent] = useState(false)
	const [otpLoading, setOtpLoading] = useState(false)

	/* -------------------------------------------------------------------------- */
	/*                               PASSWORD LOGIN                               */
	/* -------------------------------------------------------------------------- */

	const onLogin = (values) => {
		if (loginMode === 'PASSWORD') {
			dispatch(showLoading())
			dispatch(signIn(values))
		} else {
			verifyOtp()
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                                  SEND OTP                                  */
	/* -------------------------------------------------------------------------- */

	const sendOtp = async () => {
		try {
			const phone = form.getFieldValue('phoneNumber')
			if (!phone) {
				dispatch(showAuthMessage('Enter phone number'))
				return
			}

			setOtpLoading(true)

			const res = await fetch(
				`https://test.happypay.live/users/getotp?phoneNumber=${phone}`
			)

			const data = await res.json()

			if (data.status !== 'success') {
				throw new Error(data.message || 'Failed to send OTP')
			}

			setOtpSent(true)
		} catch (err) {
			dispatch(showAuthMessage(err.message))
		} finally {
			setOtpLoading(false)
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                                 VERIFY OTP                                 */
	/* -------------------------------------------------------------------------- */

	const verifyOtp = async () => {
		try {
			setOtpLoading(true)

			const phoneNumber = form.getFieldValue('phoneNumber')
			const otp = form.getFieldValue('otp')

			if (!otp || otp.length !== 6) {
				throw new Error('Enter valid 6-digit OTP')
			}

			const res = await fetch(
				`https://test.happypay.live/users/loginWithOPT?phoneNumber=${encodeURIComponent(
					phoneNumber
				)}&otp=${encodeURIComponent(otp)}`
			)

			const result = await res.json()

			if (result.status !== 'success') {
				throw new Error(result.message || 'OTP verification failed')
			}

			const token = result?.data?.token
			if (!token) {
				throw new Error('Token not received')
			}

			// ✅ Update Redux
			dispatch(signInSuccess(token))

			navigate('/app/dashboard')
		} catch (err) {
			dispatch(showAuthMessage(err.message))
		} finally {
			setOtpLoading(false)
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                               SOCIAL LOGIN                                 */
	/* -------------------------------------------------------------------------- */

	const onGoogleLogin = () => {
		dispatch(showLoading())
		dispatch(signInWithGoogle())
	}

	const onFacebookLogin = () => {
		dispatch(showLoading())
		dispatch(signInWithFacebook())
	}

	/* -------------------------------------------------------------------------- */
	/*                                REDIRECT LOGIC                               */
	/* -------------------------------------------------------------------------- */

	useEffect(() => {
		if (redirect && isAuthenticated) {
			navigate(redirect)
			dispatch(resetRedirect())
		}
	}, [redirect, isAuthenticated, navigate, dispatch])

	useEffect(() => {
		if (showMessage) {
			const timer = setTimeout(() => {
				dispatch(hideAuthMessage())
			}, 3000)
			return () => clearTimeout(timer)
		}
	}, [showMessage, dispatch])

	/* -------------------------------------------------------------------------- */
	/*                                 SOCIAL UI                                  */
	/* -------------------------------------------------------------------------- */

	const renderSocialLogin = (
		<div>
			<Divider>
				<span className="text-muted">or connect with</span>
			</Divider>

			<div className="d-flex justify-content-center">
				<Button
					className="mr-2"
					onClick={onGoogleLogin}
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
	)

	/* -------------------------------------------------------------------------- */
	/*                                   RENDER                                   */
	/* -------------------------------------------------------------------------- */

	return (
		<>
			{/* -------------------------- ERROR MESSAGE -------------------------- */}
			<motion.div
				initial={{ opacity: 0, marginBottom: 0 }}
				animate={{
					opacity: showMessage ? 1 : 0,
					marginBottom: showMessage ? 20 : 0
				}}
			>
				<Alert type="error" showIcon message={message} />
			</motion.div>

			{/* ------------------------------- FORM -------------------------------- */}
			<Form
				form={form}
				layout="vertical"
				name="login-form"
				onFinish={onLogin}
			>
				{/* 📱 PHONE NUMBER */}
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
						<Input maxLength={6} inputMode="numeric" />
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

				{/* 🔄 MODE TOGGLE */}
				<div className="d-flex justify-content-between mt-2">
					<Button
						type="link"
						onClick={() => {
							setLoginMode('OTP')
							setOtpSent(false)
							form.resetFields(['otp'])
						}}
					>
						Login using OTP
					</Button>

					<Button
						type="link"
						onClick={() => {
							setLoginMode('PASSWORD')
							setOtpSent(false)
							form.resetFields(['otp'])
						}}
					>
						Login using Password
					</Button>
				</div>

				{/* 🌐 SOCIAL LOGIN */}
				{loginMode === 'PASSWORD' && renderSocialLogin}
			</Form>
		</>
	)
}

export default LoginForm
