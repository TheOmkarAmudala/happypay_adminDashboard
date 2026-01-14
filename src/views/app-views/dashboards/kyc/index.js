import React, { useEffect, useState } from "react";
import { Card, Row, Col, Input, Button, Tag, message, Divider, Typography } from "antd";
import { Modal, Select } from "antd";
import axios from "axios";

const { Title } = Typography;

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

	const fetchBankAccounts = async () => {
		try {
			setBankLoading(true);

			const res = await axiosAuth.get("payout/getAllBankAccounts");

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

			console.log("AADHAAR OTP RESPONSE:", res.data);

			if (res.data?.message === "OTP sent successfully") {
				setAadhaarTxnId(res.data?.data?.txnId);
				setOtpSent(true);
				message.success("OTP sent to registered mobile");
			} else {
				message.error(res.data?.message || "Failed to send OTP");
			}
		} catch (err) {
			console.error(
				"AADHAAR OTP ERROR:",
				err.response?.status,
				err.response?.data
			);
			message.error(err.response?.data?.message || "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};
	const verifyAadhaarOtp = async () => {
		try {
			setLoading(true);

			const token = localStorage.getItem("AUTH_TOKEN");

			const payload = {
				otp: otp.trim(),               // string, 6 digits
				refId: aadhaarTxnId,            // MUST be "32953327"
				aadhaar: aadhaar.trim()         // same Aadhaar used in send OTP
			};

			console.log("VERIFY PAYLOAD:", payload);

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

			console.log("AADHAAR VERIFY RESPONSE:", res.data);

			if (res.data?.message === "Aadhaar verified successfully") {
				setAadhaarVerified(true);
				message.success("Aadhaar verified successfully");
			} else {
				message.error(res.data?.message || "Invalid OTP");
			}
		} catch (err) {
			console.error(
				"AADHAAR VERIFY ERROR:",
				err.response?.status,
				err.response?.data
			);
			message.error(err.response?.data?.message || "Failed to verify OTP");
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
				bank_name: selectedBank,           // from dropdown
				account_number: accountNumber,
				account_holder_name: accountHolderName,
				ifsc: ifsc
			};

			console.log("ADD BANK PAYLOAD:", payload);

			const res = await axiosAuth.post(
				"payout/addBankAccount",
				payload
			);

			console.log("ADD BANK RESPONSE:", res.data);

			// ✅ SUCCESS CASE
			if (
				res.data?.status === "SUCCESS" ||
				res.data?.message?.toLowerCase().includes("success")
			) {
				message.success("Bank account added and verified successfully");
				setBankModalOpen(false);

				// optional reset
				setAccountNumber("");
				setConfirmAccountNumber("");
				setAccountHolderName("");
				setIfsc("");
				setSelectedBank(null);
			}
			// ⚠️ PENDING VERIFICATION
			else if (res.data?.status === "PENDING") {
				message.info("Bank account added. Verification pending.");
				setBankModalOpen(false);
			}
			// ❌ FAILURE
			else {
				message.error(res.data?.message || "Bank verification failed");
			}

		} catch (err) {
			const status = err.response?.status;
			const data = err.response?.data;

			console.error("ADD BANK ERROR:", status, data);

			if (status === 400) {
				message.error(data?.message || "Invalid bank details");
			} else if (status === 401) {
				message.error("Authentication failed. Please login again.");
			} else if (status === 409) {
				message.error("Bank account already exists");
			} else if (status === 422) {
				message.error("Bank verification failed");
			} else if (status >= 500) {
				message.error("Bank verification service unavailable");
			} else {
				message.error(data?.message || "Failed to add bank account");
			}
		} finally {
			setBankLoading(false);
		}
	};


	const isBankFormValid =
		accountNumber &&
		confirmAccountNumber &&
		accountNumber === confirmAccountNumber &&
		accountHolderName.length >= 3 &&
		/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);


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
							<Tag color="green" className="mt-3">
								VERIFIED
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
							borderTop: "4px solid #1a4fa3"
						}}
					>
						<Input
							placeholder="Enter PAN Number"
							maxLength={10}
							disabled={panVerified}
							value={pan}
							onChange={e =>
								setPan(e.target.value.toUpperCase())
							}
						/>

						<Input
							placeholder="Enter Name as on PAN"
							className="mt-2"
							disabled={panVerified}
							value={panName}
							onChange={e => setPanName(e.target.value)}
						/>

						{!panVerified ? (
							<Button
								type="primary"
								block
								className="mt-3"
								loading={loading}
								onClick={verifyPan}
								disabled={pan.length !== 10 || panName.length < 3}
							>
								Verify PAN
							</Button>
						) : (
							<Tag color="green" className="mt-3">
								VERIFIED
							</Tag>
						)}
					</Card>
				</Col>

			</Row>

			{/* BANK SECTION */}
				{/* ================= BANK CARD ================= */}
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
						marginTop: 24
					}}
				>
					{/* subtle gradient header */}
					<div
						style={{
							height: 6,
							background:
								"linear-gradient(90deg, #d9f7be 0%, #ffffff 50%, #f6ffed 100%)",
							marginBottom: 16,
							borderRadius: 4
						}}
					/>

					{/* STEP 1: CTA */}
					{!showBankSection && (
						<Button
							type="primary"
							block
							size="large"
							onClick={() => {
								fetchBankAccounts();
								setShowBankSection(true);
							}}
							loading={bankLoading}
						>
							Add / Verify Bank Account
						</Button>
					)}

					{/* STEP 2: BANK SELECTION */}
					{showBankSection && (
						<>
							<Divider orientation="left">Select Bank</Divider>

							<Select
								showSearch
								placeholder="Search your bank"
								style={{ width: "100%" }}
								size="large"
								value={selectedBank}
								onChange={setSelectedBank}
								options={bankList.map(bank => ({
									label: bank,
									value: bank
								}))}
								filterOption={(input, option) =>
									option.label.toLowerCase().includes(input.toLowerCase())
								}
							/>

							{/* STEP 3: DETAILS UNLOCK */}
							{selectedBank && (
								<>
									<Divider orientation="left">Bank Details</Divider>

									<Row gutter={[16, 16]}>
										<Col xs={24} md={12}>
											<Input
												size="large"
												placeholder="Account Number"
												value={accountNumber}
												onChange={e =>
													setAccountNumber(e.target.value.replace(/\D/g, ""))
												}
											/>
										</Col>

										<Col xs={24} md={12}>
											<Input
												size="large"
												placeholder="Confirm Account Number"
												value={confirmAccountNumber}
												onChange={e =>
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
												onChange={e =>
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
												onChange={e => setIfsc(e.target.value.toUpperCase())}
											/>
										</Col>
									</Row>

									<Button
										type="primary"
										size="large"
										style={{ marginTop: 20 }}
										block
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