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

			const res = await axiosAuth.post("cashfree/aadhaar/sendotp", {
				uid: aadhaar.trim()   // ✅ send uid, not aadhaar key
			});

			console.log("AADHAAR OTP RESPONSE:", res.data);

			if (res.data?.message === "OTP sent successfully") {
				setAadhaarTxnId(res.data?.data?.txnId);
				setOtpSent(true);
				message.success("OTP sent to registered mobile");
			} else {
				message.error(res.data?.message || "Failed to send OTP");
			}

		} catch (err) {
			console.error("AADHAAR OTP ERROR:", err.response?.status, err.response?.data);
			message.error(err.response?.data?.message || "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};


	const verifyAadhaarOtp = async () => {
		try {
			setLoading(true);

			const res = await axiosAuth.post("cashfree/aadhaar/verifyotp", {
				otp: otp.trim(),
				txnId: aadhaarTxnId
			});

			console.log("AADHAAR VERIFY RESPONSE:", res.data);

			if (res.data?.message === "Aadhaar verified successfully") {
				setAadhaarVerified(true);
				message.success("Aadhaar verified successfully");
			} else {
				message.error(res.data?.message || "Invalid OTP");
			}

		} catch (err) {
			console.error("AADHAAR VERIFY ERROR:", err.response?.data);
			message.error(err.response?.data?.message || "Invalid OTP");
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
		<Card title="KYC Verification">
			{/* Aadhaar Section */}
			<Title level={5} style={{ marginBottom: 16 }}>
				Aadhaar Verification
			</Title>

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
				<Row gutter={16} className="mt-3" align="middle">
					<Col xs={24} md={6}>
						<Input
							placeholder="Enter OTP"
							maxLength={6}
							value={otp}
							onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
						/>
					</Col>
					<Col>
						<Button
							type="primary"
							onClick={verifyAadhaarOtp}
							loading={loading}
							disabled={otp.length !== 6}
						>
							Submit OTP
						</Button>
					</Col>
				</Row>
			)}



			{/* PAN Section */}
			<Title level={5}  style={{ marginBottom: 16, marginTop: 16 }}>
				PAN Verification
			</Title>

			<Row gutter={16} align="middle">
				<Col xs={24} md={8}>
					<Input
						placeholder="Enter PAN Number"
						maxLength={10}
						disabled={panVerified}
						value={pan}
						onChange={e => setPan(e.target.value.toUpperCase())}
					/>
				</Col>

				<Col xs={24} md={10}>
					<Input
						placeholder="Enter Name as on PAN"
						disabled={panVerified}
						value={panName}
						onChange={e => setPanName(e.target.value)}
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
			{/* BANK SECTION */}
			<Title level={5} style={{ marginBottom: 16, marginTop: 16 }}>
				Bank Account Verification
			</Title>

			<Row gutter={16} align="middle">
				<Col>
					<Button
						type="primary"
						onClick={() => {
							fetchBankAccounts();
							setBankModalOpen(true);
						}}
						loading={bankLoading}
					>
						Add / Verify Bank Account
					</Button>



				</Col>
			</Row>

			<Modal
				title="Add Bank Account"
				open={bankModalOpen}
				onCancel={() => {
					setBankModalOpen(false);
					setSelectedBank(null);
				}}
				footer={null}
				width={800}
			>
				{/* BANK SELECT */}
				<Row gutter={16}>
					<Col xs={24} md={12}>
						<Select
							showSearch
							placeholder="Select Bank"
							style={{ width: "100%" }}
							options={bankList.map(bank => ({
								label: bank,
								value: bank
							}))}
							onChange={value => setSelectedBank(value)}
							filterOption={(input, option) =>
								option.label.toLowerCase().includes(input.toLowerCase())
							}
						/>
					</Col>
				</Row>

				{/* SHOW FORM ONLY AFTER BANK SELECTED */}
				{selectedBank && (
					<>
						<Divider orientation="left" className="mt-3">
							Bank Details
						</Divider>

						<Row gutter={16}>
							<Col xs={24} md={12}>
								<Input
									placeholder="Account Number"
									value={accountNumber}
									onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))}
								/>
							</Col>

							<Col xs={24} md={12}>
								<Input
									placeholder="Confirm Account Number"
									value={confirmAccountNumber}
									onChange={e =>
										setConfirmAccountNumber(e.target.value.replace(/\D/g, ""))
									}
								/>
							</Col>
						</Row>

						<Row gutter={16} className="mt-2">
							<Col xs={24} md={12}>
								<Input
									placeholder="Account Holder Name"
									value={accountHolderName}
									onChange={e =>
										setAccountHolderName(e.target.value.toUpperCase())
									}
								/>
							</Col>

							<Col xs={24} md={12}>
								<Input
									placeholder="IFSC Code"
									maxLength={11}
									value={ifsc}
									onChange={e => setIfsc(e.target.value.toUpperCase())}
								/>
							</Col>
						</Row>

						<Row className="mt-3">
							<Col>
								<Button
									type="primary"
									disabled={!isBankFormValid}
									loading={bankLoading}
									onClick={submitBankAccount}
								>
									Submit Bank Details
								</Button>

							</Col>
						</Row>
					</>
				)}
			</Modal>


			{showBankForm && bankList.length > 0 && (
				<Row gutter={[16, 16]} className="mt-3">
					{bankList.map((bank, index) => (
						<Col xs={24} md={8} key={index}>

						</Col>
					))}
				</Row>

			)}

			{showBankForm && (
				<>
					<Row gutter={16} className="mt-4">
						<Col xs={24} md={6}>
							<Input
								placeholder="Account Number"
								value={accountNumber}
								onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))}
							/>
						</Col>

						<Col xs={24} md={6}>
							<Input
								placeholder="Confirm Account Number"
								value={confirmAccountNumber}
								onChange={e => setConfirmAccountNumber(e.target.value.replace(/\D/g, ""))}
							/>
						</Col>

						<Col xs={24} md={6}>
							<Input
								placeholder="Account Holder Name"
								value={accountHolderName}
								onChange={e => setAccountHolderName(e.target.value.toUpperCase())}
							/>
						</Col>

						<Col xs={24} md={6}>
							<Input
								placeholder="IFSC Code"
								maxLength={10}
								value={ifsc}
								onChange={e => setIfsc(e.target.value.toUpperCase())}
							/>
						</Col>
					</Row>
				</>
			)}


			{showBankForm && (
				<Row gutter={16} className="mt-3">
					<Col xs={24} md={8}>
						<Select
							showSearch
							placeholder="Select Bank"
							style={{ width: "100%" }}
							options={bankList.map(bank => ({
								label: bank,
								value: bank
							}))}
							filterOption={(input, option) =>
								option.label.toLowerCase().includes(input.toLowerCase())
							}
						/>
					</Col>
				</Row>
			)}





		</Card>
	);
};

export default KYCPage;
