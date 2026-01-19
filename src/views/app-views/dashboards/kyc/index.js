import React, { useEffect, useState } from "react";
import { Card, Row, Col, Input, Button, Tag, message, Divider, Typography,  } from "antd";
import { Modal, Select } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { CheckCircleFilled } from "@ant-design/icons";


const { Text } = Typography;

const KYCPage = () => {
	const token = useSelector(state => state.auth.token);



	const axiosAuth = axios.create({
		baseURL: "https://test.happypay.live/",
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	/* -------------------- STATE -------------------- */
	const [aadhaar, setAadhaar] = useState("");
	const [uid, setUid] = useState("");

	const [otp, setOtp] = useState("");
	const [aadhaarTxnId, setAadhaarTxnId] = useState("");
	const [aadhaarVerified, setAadhaarVerified] = useState(false);
	const [otpSent, setOtpSent] = useState(false);

	const [panName, setPanName] = useState("");
	const [pan, setPan] = useState("");

	const [panVerified, setPanVerified] = useState(false);

	const [loading, setLoading] = useState(false);

	/* -------------------- BANK -------------------- */
	const [bankList, setBankList] = useState([]);
	const [showBankForm, setShowBankForm] = useState(false);

	const [accountNumber, setAccountNumber] = useState("");
	const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
	const [accountHolderName, setAccountHolderName] = useState("");
	const [ifsc, setIfsc] = useState("");

	const [bankLoading, setBankLoading] = useState(false);
	const [bankModalOpen, setBankModalOpen] = useState(false);
	const [selectedBank, setSelectedBank] = useState(null);

	const [showBankSection, setShowBankSection] = useState(false);


	const [bankPhone, setBankPhone] = useState("");




	/* -------------------- GET KYC STATUS -------------------- */
	useEffect(() => {
		const fetchKycStatus = async () => {
			try {
				const res = await axiosAuth.get("users/kyc");

				const kycList = Array.isArray(res.data?.data)
					? res.data.data
					: [];

				const isAadhaarVerified = kycList.some(
					(item) => item.type === "aadhaar" && item.verified === true
				);

				const isPanVerified = kycList.some(
					(item) => item.type === "pan" && item.verified === true
				);

				setAadhaarVerified(isAadhaarVerified);
				setPanVerified(isPanVerified);

				// Auto-unlock bank if PAN already verified
				if (isPanVerified) {
					setShowBankSection(true);
					fetchBankAccounts();
				}
			} catch (err) {
				console.warn("Failed to fetch KYC status", err);
			}
		};

		fetchKycStatus();
	}, []);


	useEffect(() => {
		if (panVerified) {
			setShowBankSection(true);
			fetchBankAccounts();
		}
	}, [panVerified]);


	const fetchBankAccounts = async () => {
		try {
			setBankLoading(true);

			const res = await axiosAuth.get("/payout/bankAccounts");

			console.log("BANK LIST RESPONSE:", res.data);

			if (Array.isArray(res.data?.data)) {
				setBankList(res.data.data);
				setShowBankForm(true);
			} else {
				message.error("No bank accounts found");
			}

		} catch (err) {
			console.error("BANK LIST ERROR:", err.response?.data);
			message.error("Failed to fetch bank accounts");
		} finally {
			setBankLoading(false);
		}
	};


	/* -------------------- AADHAAR -------------------- */
	const sendAadhaarOtp = async () => {
		try {
			setLoading(true);

			const res = await axiosAuth.get(
				`cashfree/aadhaar/sendotp?aadhaar=${aadhaar.trim()}`
			);


			if (res.data?.message === "OTP sent successfully") {
				const refId =
					res.data?.data?.ref_id ||
					res.data?.data?.refId ||
					res.data?.refId;

				if (!refId) {
					message.error("Failed to get Aadhaar reference ID");
					return;
				}

				setAadhaarTxnId(refId);

				setOtpSent(true);
				message.success("OTP sent to registered mobile");
			} else {
				message.error(res.data?.message || "Failed to send OTP");
			}
		} catch (err) {
			message.error(err.response?.data?.message || "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};
	const verifyAadhaarOtp = async () => {
		try {
			setLoading(true);

			const payload = {
				otp: otp.trim(),
				refId: aadhaarTxnId,
				aadhaar: aadhaar.trim()
			};

			const res = await axios.post(
				"https://test.happypay.live/cashfree/aadhaar/verifyotp",
				payload,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json"
					}
				}
			);

			// ✅ IF REQUEST DID NOT FAIL → SUCCESS
			setAadhaarVerified(true);
			message.success("Aadhaar verified successfully");

		} catch (err) {
			console.error("AADHAAR VERIFY ERROR:", err.response?.data || err);
			message.error(
				err.response?.data?.message || "OTP verification failed"
			);
		} finally {
			setLoading(false);
		}
	};


	/* -------------------- PAN -------------------- */
	const verifyPan = async () => {
		try {
			setLoading(true);

			const res = await axiosAuth.post("cashfree/pan/verify", {
				pan: pan.trim(),
				name: panName.trim()
			});

			console.log("PAN VERIFY RESPONSE:", res.data);

			if (res.data?.message === "Verified successfully") {
				setPanVerified(true);
				message.success("PAN verified successfully");
			} else {
				message.error(res.data?.message || "PAN verification failed");
			}

		} catch (err) {
			console.error("PAN verification error:", err.response?.data);
			message.error(err.response?.data?.message || "PAN verification failed");
		} finally {
			setLoading(false);
		}
	};

	const submitBankAccount = async () => {
		try {
			setBankLoading(true);

			const payload = {
				BankAccountNumber: accountNumber,
				BankIFSC: ifsc,
				Name: accountHolderName,
				Phone: bankPhone
			};

			console.log("ADD BANK PAYLOAD:", payload);

			const res = await axiosAuth.post(
				"payout/addBankAccount",
				payload
			);

			console.log("ADD BANK RESPONSE:", res.data);

			if (
				res.data?.status === "SUCCESS" ||
				res.data?.message?.toLowerCase().includes("success")
			) {
				message.success("Bank account added successfully");

				// reset
				setAccountNumber("");
				setConfirmAccountNumber("");
				setAccountHolderName("");
				setIfsc("");
				setBankPhone("");
				setSelectedBank(null);
				setShowBankSection(false);
			} else {
				message.error(res.data?.message || "Bank verification failed");
			}

		} catch (err) {
			console.error("ADD BANK ERROR:", err.response?.data || err);
			message.error(
				err.response?.data?.message ||
				"Bank verification service unavailable"
			);
		} finally {
			setBankLoading(false);
		}
	};



	const isBankFormValid =
		accountNumber &&
		confirmAccountNumber &&
		accountNumber === confirmAccountNumber &&
		accountHolderName.length >= 3 &&
		/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc) &&
		bankPhone.length === 10;


	/* -------------------- UI -------------------- */
	return (
		<>
			{/* ================= Aadhaar + PAN ================= */}
			<Row gutter={[16, 16]}>

				{/* Aadhaar Card */}
				<Col xs={24} md={12}>
					<Card
						title={
							<div style={{display: "flex", alignItems: "center", gap: 8}}>
								<span>Aadhaar Verification</span>
								<span style={{fontSize: 12, color: "#888"}}>
                • Government of India
              </span>
							</div>
						}
						bordered
						style={{
							borderRadius: 12,
							overflow: "hidden"
						}}
					>
						<div
							style={{
								height: 4,
								background:
									"linear-gradient(to right, #FF9933 0%, #FFFFFF 50%, #138808 100%)",
								marginBottom: 12
							}}
						/>

						<Input
							placeholder="Enter Aadhaar Number"
							maxLength={12}
							disabled={aadhaarVerified}
							value={aadhaar}
							onChange={e =>
								setAadhaar(e.target.value.replace(/\D/g, ""))
							}
						/>

						{!aadhaarVerified && !otpSent && (
							<Button
								type="primary"
								block
								className="mt-3"
								loading={loading}
								onClick={sendAadhaarOtp}
								disabled={aadhaar.length !== 12}
							>
								Send OTP
							</Button>
						)}

						{otpSent && !aadhaarVerified && (
							<>
								<Input
									placeholder="Enter OTP"
									maxLength={6}
									className="mt-3"
									value={otp}
									onChange={e =>
										setOtp(e.target.value.replace(/\D/g, ""))
									}
								/>

								<Button
									type="primary"
									block
									className="mt-2"
									loading={loading}
									disabled={otp.length !== 6}
									onClick={verifyAadhaarOtp}
								>
									Verify OTP
								</Button>
							</>
						)}

						{aadhaarVerified && (
							<Tag
								color="green"
								icon={<CheckCircleFilled />}
								style={{ marginTop: 12 }}
							>
								Aadhaar Verified
							</Tag>
						)}

					</Card>
				</Col>

				{/* PAN Card */}
				<Col xs={24} md={12}>
					<Card
						title={
							<div style={{display: "flex", alignItems: "center", gap: 8}}>
								<span>PAN Verification</span>
								<span style={{fontSize: 12, color: "#1a4fa3"}}>
                • Income Tax Dept.
              </span>
							</div>
						}
						bordered
						style={{
							borderRadius: 12,
							opacity: aadhaarVerified ? 1 : 0.45,
							pointerEvents: aadhaarVerified ? "auto" : "none"	}}
					>
						<Input
							placeholder="Enter PAN Number"
							maxLength={10}
							disabled={!aadhaarVerified || panVerified}

							value={pan}
							onChange={e => setPan(e.target.value.toUpperCase())}
						/>

						<Input
							placeholder="Enter Name as on PAN"
							className="mt-2"
							disabled={!aadhaarVerified || panVerified}
							value={panName}
							onChange={e => setPanName(e.target.value)}
						/>

						{!panVerified ? (
							<Button
								type="primary"
								block
								className="mt-3"
								loading={loading}
								disabled={
									!aadhaarVerified ||
									pan.length !== 10 ||
									panName.length < 3
								}
								onClick={verifyPan} >
								Verify PAN
							</Button>
						) : (
							<Tag color="green" className="mt-3">
								VERIFIED
							</Tag>
						)}


						{!aadhaarVerified && (
							<Text type="secondary" style={{ display: "block", marginTop: 8 }}>
								Verify Aadhaar to unlock PAN
							</Text>
						)}
					</Card>
				</Col>

			</Row>

			{/* BANK SECTION */}
			{/* ================= BANK ACCOUNT VERIFICATION ================= */}
			<Card
				title={
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<span>Bank Account Verification</span>
						<span style={{ fontSize: 12, color: "#389e0d" }}>
				• Secure Payout Setup
			</span>
					</div>
				}
				bordered
				style={{
					borderRadius: 12,
					borderTop: "4px solid #52c41a",
					marginTop: 24,
					opacity: panVerified ? 1 : 0.5,
					pointerEvents: panVerified ? "auto" : "none",
				}}
			>
				{/* Helper message */}
				{!panVerified && (
					<Text type="secondary">
						Complete PAN verification to unlock Bank setup
					</Text>
				)}

				{/* BANK FORM */}
				{showBankSection && panVerified && (
					<>
						<Divider orientation="left">Select Bank</Divider>

						<Select
							showSearch
							size="large"
							placeholder="Search your bank"
							style={{ width: "100%" }}
							value={selectedBank}
							onChange={setSelectedBank}
							loading={bankLoading}
							options={bankList.map((bank) => ({
								label: bank,
								value: bank,
							}))}
							filterOption={(input, option) =>
								option.label.toLowerCase().includes(input.toLowerCase())
							}
						/>

						{selectedBank && (
							<>
								<Divider orientation="left">Bank Details</Divider>

								<Row gutter={[16, 16]}>
									<Col xs={24} md={12}>
										<Input
											size="large"
											placeholder="Account Number"
											value={accountNumber}
											onChange={(e) =>
												setAccountNumber(e.target.value.replace(/\D/g, ""))
											}
										/>
									</Col>

									<Col xs={24} md={12}>
										<Input
											size="large"
											placeholder="Confirm Account Number"
											value={confirmAccountNumber}
											onChange={(e) =>
												setConfirmAccountNumber(e.target.value.replace(/\D/g, ""))
											}
											status={
												confirmAccountNumber &&
												confirmAccountNumber !== accountNumber
													? "error"
													: ""
											}
										/>
									</Col>

									<Col xs={24} md={12}>
										<Input
											size="large"
											placeholder="Account Holder Name"
											value={accountHolderName}
											onChange={(e) =>
												setAccountHolderName(e.target.value.toUpperCase())
											}
										/>
									</Col>

									<Col xs={24} md={12}>
										<Input
											size="large"
											placeholder="IFSC Code"
											maxLength={11}
											value={ifsc}
											onChange={(e) => setIfsc(e.target.value.toUpperCase())}
										/>
									</Col>

									<Col xs={24} md={12}>
										<Input
											size="large"
											placeholder="Phone Number"
											maxLength={10}
											value={bankPhone}
											onChange={(e) =>
												setBankPhone(e.target.value.replace(/\D/g, ""))
											}
										/>
									</Col>
								</Row>

								<Button
									type="primary"
									size="large"
									block
									style={{ marginTop: 20 }}
									disabled={!isBankFormValid}
									loading={bankLoading}
									onClick={submitBankAccount}
								>
									Submit Bank Details
								</Button>
							</>
						)}
					</>
				)}
			</Card>


		</>
	);
};

export default KYCPage;