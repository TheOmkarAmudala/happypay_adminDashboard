import React, { useEffect, useState } from "react";
import { Card, Row, Col, Input, Button, Tag, message, Divider } from "antd";
import axios from "axios";

const KYCPage = () => {
	const token = localStorage.getItem("AUTH_TOKEN");

	const axiosAuth = axios.create({
		baseURL: "https://test.happypay.live/",
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	/* -------------------- STATE -------------------- */
	const [aadhaar, setAadhaar] = useState("");
	const [otp, setOtp] = useState("");
	const [aadhaarTxnId, setAadhaarTxnId] = useState("");
	const [aadhaarVerified, setAadhaarVerified] = useState(false);
	const [otpSent, setOtpSent] = useState(false);

	const [pan, setPan] = useState("");
	const [panVerified, setPanVerified] = useState(false);

	const [loading, setLoading] = useState(false);

	/* -------------------- GET KYC STATUS -------------------- */
	useEffect(() => {
		const fetchKyc = async () => {
			try {
				const res = await axiosAuth.get("users/kyc");
				if (res.data?.data?.aadhaarVerified) setAadhaarVerified(true);
				if (res.data?.data?.panVerified) setPanVerified(true);
			} catch (err) {
				console.warn("KYC status not found");
			}
		};
		fetchKyc();
	}, []);

	/* -------------------- AADHAAR -------------------- */
	const sendAadhaarOtp = async () => {
		try {
			setLoading(true);
			const res = await axiosAuth.post("cashfree/aadhaar/sendotp", {
				aadhaar
			});

			setAadhaarTxnId(res.data?.data?.txnId);
			setOtpSent(true);
			message.success("OTP sent to registered mobile");
		} catch (err) {
			message.error("Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};

	const verifyAadhaarOtp = async () => {
		try {
			setLoading(true);
			await axiosAuth.post("cashfree/aadhaar/verifyotp", {
				otp,
				txnId: aadhaarTxnId
			});

			setAadhaarVerified(true);
			message.success("Aadhaar verified successfully");
		} catch (err) {
			message.error("Invalid OTP");
		} finally {
			setLoading(false);
		}
	};

	/* -------------------- PAN -------------------- */
	const verifyPan = async () => {
		try {
			setLoading(true);
			await axiosAuth.post("cashfree/pan/verify", { pan });
			setPanVerified(true);
			message.success("PAN verified successfully");
		} catch (err) {
			message.error("PAN verification failed");
		} finally {
			setLoading(false);
		}
	};

	/* -------------------- UI -------------------- */
	return (
		<Card title="KYC Verification">
			{/* Aadhaar Section */}
			<Divider orientation="left">Aadhaar Verification</Divider>

			<Row gutter={16} align="middle">
				<Col xs={24} md={10}>
					<Input
						placeholder="Enter Aadhaar Number"
						maxLength={12}
						disabled={aadhaarVerified}
						value={aadhaar}
						onChange={e => setAadhaar(e.target.value)}
					/>
				</Col>

				<Col>
					{!aadhaarVerified && !otpSent && (
						<Button type="primary" onClick={sendAadhaarOtp} loading={loading}>
							Verify Aadhaar
						</Button>
					)}

					{aadhaarVerified && <Tag color="green">VERIFIED</Tag>}
				</Col>
			</Row>

			{otpSent && !aadhaarVerified && (
				<Row gutter={16} className="mt-3">
					<Col xs={24} md={6}>
						<Input
							placeholder="Enter OTP"
							value={otp}
							onChange={e => setOtp(e.target.value)}
						/>
					</Col>
					<Col>
						<Button type="primary" onClick={verifyAadhaarOtp} loading={loading}>
							Submit OTP
						</Button>
					</Col>
				</Row>
			)}

			{/* PAN Section */}
			<Divider orientation="left">PAN Verification</Divider>

			<Row gutter={16} align="middle">
				<Col xs={24} md={10}>
					<Input
						placeholder="Enter PAN Number"
						maxLength={10}
						disabled={panVerified}
						value={pan}
						onChange={e => setPan(e.target.value.toUpperCase())}
					/>
				</Col>
				<Col>
					{!panVerified ? (
						<Button type="primary" onClick={verifyPan} loading={loading}>
							Verify PAN
						</Button>
					) : (
						<Tag color="green">VERIFIED</Tag>
					)}
				</Col>
			</Row>
		</Card>
	);
};

export default KYCPage;
