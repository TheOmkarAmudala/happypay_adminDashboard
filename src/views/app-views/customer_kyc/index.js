import React, { useEffect, useState } from "react";
import { Card, Row, Col, Input, Button, Tag, message, Typography, Modal } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { CheckCircleFilled, DeleteOutlined, BankOutlined, PlusOutlined, CopyOutlined, NumberOutlined, PhoneOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

const { Text } = Typography;
const AddBankCard = ({
				 accountNumber, setAccountNumber,
				 confirmAccountNumber, setConfirmAccountNumber,
				 accountHolderName, setAccountHolderName,
				 ifsc, setIfsc,
				 bankPhone, setBankPhone,
				 onSubmit, loading, isValid
			 }) => {

	const [aadhaarName, setAadhaarName] = useState("");
	const [aadhaarVerified, setAadhaarVerified] = useState(false);


	useEffect(() => {
		if (aadhaarVerified && aadhaarName) {
			setDisplayName(aadhaarName);
		}
	}, [aadhaarVerified, aadhaarName]);

	const [displayName, setDisplayName] = useState("");

	return (
		<Card
			style={{
				borderRadius: 16,
				border: "1px solid #f0f0f0", // Subtle border
				boxShadow: "0 4px 20px rgba(0,0,0,0.05)", // Soft expensive shadow
				height: "100%",
			}}
			title={
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<BankOutlined style={{ color: "#1890ff", fontSize: 18 }} />
					<span>Link New Bank Account</span>
				</div>
			}
		>
			{/* 1. Account Holder */}
			<div style={{ marginBottom: 16 }}>
				<Text type="secondary" style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, display: "block" }}>
					ACCOUNT HOLDER NAME
				</Text>
				<Input
					size="large"
					value={displayName}
					disabled
					style={{
						borderRadius: 8,
						background: "#f9fafb",
						fontWeight: 600
					}}
				/>
				<Text type="secondary" style={{ fontSize: 11 }}>
					Name fetched from Aadhaar (cannot be edited)
				</Text>

			</div>

			{/* 2. Account Number & Confirm (Grouped visually) */}
			<div style={{ marginBottom: 16, background: "#fafafa", padding: 12, borderRadius: 8, border: "1px dashed #d9d9d9" }}>
				<Text type="secondary" style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, display: "block" }}>
					BANK DETAILS
				</Text>

				<Input
					size="large"
					prefix={<NumberOutlined style={{ color: "#bfbfbf" }} />}
					placeholder="Account Number"
					value={accountNumber}
					onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))}
					style={{ borderRadius: 8, marginBottom: 12 }}
				/>

				<Input
					size="large"
					prefix={<CheckCircleFilled style={{ color: isValid ? "#52c41a" : "#bfbfbf" }} />} // Visual feedback icon
					placeholder="Confirm Account Number"
					value={confirmAccountNumber}
					onChange={e => setConfirmAccountNumber(e.target.value.replace(/\D/g, ""))}
					status={confirmAccountNumber && confirmAccountNumber !== accountNumber ? "error" : ""}
					style={{ borderRadius: 8 }}
				/>
			</div>

			{/* 3. IFSC & Phone (Side-by-Side to break layout) */}
			<Row gutter={16}>
				<Col span={12}>
					<div style={{ marginBottom: 16 }}>
                  <span style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>IFSC CODE</Text>
                      <Tooltip title="Found on your cheque book">
                          <InfoCircleOutlined style={{ fontSize: 12, color: "#1890ff" }} />
                      </Tooltip>
                  </span>
						<Input
							size="large"
							placeholder="ABCD0123456"
							maxLength={11}
							value={ifsc}
							onChange={e => setIfsc(e.target.value.toUpperCase())}
							style={{ borderRadius: 8 }}
						/>
					</div>
				</Col>

				<Col span={12}>
					<div style={{ marginBottom: 16 }}>
						<Text type="secondary" style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, display: "block" }}>
							LINKED MOBILE
						</Text>
						<Input
							size="large"
							prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
							placeholder="9876543210"
							maxLength={10}
							value={bankPhone}
							onChange={e => setBankPhone(e.target.value.replace(/\D/g, ""))}
							style={{ borderRadius: 8 }}
						/>
					</div>
				</Col>
			</Row>

			{/* 4. Strong Call to Action */}
			<Button
				type="primary"
				block
				size="large"
				loading={loading}
				disabled={!isValid}
				style={{
					height: 48,
					borderRadius: 8,
					fontWeight: 600,
					marginTop: 8,
					fontSize: 16
				}}
				onClick={onSubmit}
			>
				{loading ? "Verifying..." : "Verify & Add Bank"}
			</Button>
		</Card>
	);
};


const KYCPage = ({ customer_id, readOnlyOnVerified = true }) => {
    const token = useSelector(state => state.auth.token);



    // Create an axios instance that automatically includes the Authorization header
    // NOTE: we deliberately do NOT add customer_id as a header - the API expects it as a query param
    const axiosAuth = React.useMemo(() => {
        return axios.create({
            baseURL: "https://test.happypay.live/",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }, [token]);

	/* -------------------- STATE -------------------- */
	const [aadhaar, setAadhaar] = useState("");
	const [uid, setUid] = useState("");
	const [pageLoading, setPageLoading] = useState(true);

	const [otp, setOtp] = useState("");
	const [aadhaarTxnId, setAadhaarTxnId] = useState("");
	const [aadhaarVerified, setAadhaarVerified] = useState(false);
	const [otpSent, setOtpSent] = useState(false);
	const [hasBanks, setHasBanks] = useState(false);
	const [showAddBankForm, setShowAddBankForm] = useState(false);
	const [aadhaarDob, setAadhaarDob] = useState("");
	const [aadhaarName, setAadhaarName] = useState("");
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

const [aadhaarLast4, setAadhaarLast4] = useState("");



	const [bankVerified, setBankVerified] = useState(false);
	const [verifiedBankData, setVerifiedBankData] = useState(null);


	const selectedBankData = bankList.find(
		b => b.id === selectedBank
	);



	/* -------------------- GET KYC STATUS -------------------- */
	useEffect(() => {
		const fetchKycStatus = async () => {
			try {
				setPageLoading(true);

				// Decide endpoint: customer KYC vs user KYC
				if (customer_id) {
					console.log(`Fetching customer KYC: ${axiosAuth.defaults.baseURL}customer/kyc?customer_id=${customer_id}`);
					const res = await axiosAuth.get("customer/kyc", { params: { customer_id } });
					// backend may return a single object or an array
					const kycRaw = res.data?.data;
					const kycList = Array.isArray(kycRaw) ? kycRaw : kycRaw ? [kycRaw] : [];

					// process kycList same as before
					const aadhaarEntry = kycList
						.filter(item => item.type === "aadhaar" && item.verified)
						.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

					if (aadhaarEntry) {
						setAadhaarVerified(true);
						setAadhaarName(aadhaarEntry.response?.name || "");
						setAadhaarDob(aadhaarEntry.response?.dob || "");
						// Populate Aadhaar input with masked value if available
						const aadhaarValue = aadhaarEntry.response?.aadhaar || aadhaarEntry.identification || "";
						if (aadhaarValue) {
							// mask all but last 4
							const masked = aadhaarValue.length > 4 ? `XXXX${aadhaarValue.slice(-4)}` : aadhaarValue;
							setAadhaar(masked);
							setAadhaarLast4(aadhaarValue.slice(-4));
						}
					}

					const panEntry = kycList
						.filter(item => item.type === "pan" && item.verified)
						.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

					if (panEntry) {
						setPanVerified(true);
						const panIdent = panEntry.identification || panEntry.response?.pan || "";
						setPan(panIdent ? `XXXX${panIdent.slice(-4)}` : "");
						setPanName(panEntry.response?.registered_name || "");
					}

					await fetchBankAccounts();
				} else {
					console.log(`Fetching user KYC: ${axiosAuth.defaults.baseURL}users/kyc`);
					const res = await axiosAuth.get("users/kyc");
					const kycList = Array.isArray(res.data?.data) ? res.data.data : [];

					const aadhaarEntry = kycList
						.filter(item => item.type === "aadhaar" && item.verified)
						.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

					if (aadhaarEntry) {
						setAadhaarVerified(true);
						setAadhaarName(aadhaarEntry.response?.name || "");
						setAadhaarDob(aadhaarEntry.response?.dob || "");
						const aadhaarValue = aadhaarEntry.response?.aadhaar || aadhaarEntry.identification || "";
						if (aadhaarValue) {
							const masked = aadhaarValue.length > 4 ? `XXXX${aadhaarValue.slice(-4)}` : aadhaarValue;
							setAadhaar(masked);
							setAadhaarLast4(aadhaarValue.slice(-4));
						}
					}

					const panEntry = kycList
						.filter(item => item.type === "pan" && item.verified)
						.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

					if (panEntry) {
						setPanVerified(true);
						const panIdent = panEntry.identification || panEntry.response?.pan || "";
						setPan(panIdent ? `XXXX${panIdent.slice(-4)}` : "");
						setPanName(panEntry.response?.registered_name || "");
					}

					await fetchBankAccounts();
				}
			} catch (err) {
				message.error("Failed to load KYC");
			} finally {
				setPageLoading(false);
			}
		};

		fetchKycStatus();
	}, [axiosAuth, customer_id]);



	useEffect(() => {
		if (panVerified) {
			// Previously we toggled the Add Bank modal automatically here.
			// Don't open the Add Bank modal automatically — let the user click "Add Bank Account".
			// Keep fetching bank accounts so we can reflect any newly added bank.

			fetchBankAccounts();
		}
	}, [panVerified]);




	const fetchBankAccounts = async () => {
		try {
			setBankLoading(true);

			// Debug log: bank accounts endpoint
			if (customer_id) console.log(`Fetching Bank Accounts: ${axiosAuth.defaults.baseURL}payout/bankAccounts?customer_id=${customer_id}`);
			else console.log(`Fetching Bank Accounts: ${axiosAuth.defaults.baseURL}payout/bankAccounts`);

			const res = await axiosAuth.get("/payout/bankAccounts", { params: customer_id ? { customer_id } : {} });
			const banks = Array.isArray(res.data?.data) ? res.data.data : [];

			setBankList(banks);

			if (banks.length === 0) {
				// No banks → mark hasBanks false. Do NOT auto-open add-bank modal; user must click Add Bank.
				setHasBanks(false);
				// do not call setShowAddBankForm(true)
			} else {
				// Banks exist → hide add form initially
				setHasBanks(true);
				setShowAddBankForm(false);
			}
		} catch (err) {
			message.error("Failed to fetch banks");
		} finally {
			setBankLoading(false);
		}
	};

	const fintechCardStyle = {
		borderRadius: 14,
		background: "#ffffff",
		border: "1px solid rgba(0,0,0,0.04)",
		boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
		transition: "box-shadow 0.2s ease, transform 0.2s ease"
	};

	const fintechHover = {
		onMouseEnter: e => {
			e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
		},
		onMouseLeave: e => {
			e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
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
				aadhaar: aadhaar.trim(),
				...(customer_id ? { customer_id } : {})
			};

			// Use axiosAuth so the Authorization header and customer_id header (if present)
			// are sent automatically. Also pass Content-Type explicitly.
			console.log(`Calling Aadhaar verify: ${axiosAuth.defaults.baseURL}cashfree/aadhaar/verifyotp`, payload);
			const res = await axiosAuth.post(
				"cashfree/aadhaar/verifyotp",
				payload,
				{ headers: { "Content-Type": "application/json" } }
			);

			// ✅ IF REQUEST DID NOT FAIL → SUCCESS
			if (res.data?.data) {
				setAadhaarVerified(true);

				setAadhaarName(res.data.data.name);
				setAadhaarLast4(res.data.data.aadhaar);

				message.success("Aadhaar verified successfully");
			}


		} catch (err) {
			console.error("AADHAAR VERIFY ERROR:", err.response?.data || err);
			message.error(
				err.response?.data?.message || "OTP verification failed"
			);
		} finally {
			setLoading(false);
		}
	};

	const BankAccountRow = ({ bank, onDelete }) => {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "14px 16px",
					borderRadius: 12,
					background: "#fff",
					boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
					marginBottom: 12
				}}
			>
				{/* LEFT */}
				<div
					style={{
						display: "flex",
						gap: 12,
						alignItems: "flex-start" // ⬅️ IMPORTANT FIX
					}}
				>
					{/* BANK ICON */}
					<BankOutlined
						style={{
							fontSize: 20,
							color: "#1677ff",
							marginTop: 2 // aligns with name text
						}}
					/>

					{/* TEXT BLOCK */}
					<div style={{ display: "flex", flexDirection: "column" }}>
						{/* BANK / HOLDER NAME */}
						<div
							style={{
								fontSize: 14,
								fontWeight: 600,
								color: "#111827",
								lineHeight: "20px"
							}}
						>
							{bank.beneficiary_name}
						</div>

						{/* ACCOUNT NUMBER ROW */}
						<div
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 6,
								background: "#eff6ff",
								padding: "0 10px", // ⬅️ FIXED
								height: 22,        // ⬅️ FIXED
								borderRadius: 6,
								border: "1px solid #bfdbfe",
								marginTop: 6
							}}
						>
			<span
				style={{
					fontFamily: "monospace",
					fontSize: 12,
					lineHeight: "22px",
					color: "#1e40af"
				}}
			>
				ACC No: {bank.bank_account_number}
			</span>

							<Tooltip title="Copy account number">
								<CopyOutlined
									style={{
										fontSize: 13,
										color: "#2563eb",
										cursor: "pointer"
									}}
									onClick={() => {
										navigator.clipboard.writeText(bank.bank_account_number);
										message.success("Copied");
									}}
								/>
							</Tooltip>
						</div>

						{/* IFSC */}
						<div
							style={{
								fontSize: 12,
								color: "#6b7280",
								marginTop: 4,
								fontFamily: "monospace"
							}}
						>
							IFSC: {bank.bank_ifsc}
						</div>
					</div>
				</div>


				{/* RIGHT */}
				{/* RIGHT */}
				<div style={{ display: "flex", alignItems: "center", gap: 12 }}>

					<Tooltip title="Add another bank account">
						<PlusOutlined
							onClick={() =>setShowAddBankForm(prev => !prev)}
							style={{
								color: "#16a34a",
								fontSize: 18,
								cursor: "pointer",
								background: "#dcfce7",
								padding: 6,
								borderRadius: "50%"
							}}
						/>
					</Tooltip>

					<Tag
						color="green"
						icon={<CheckCircleFilled />}
						style={{ margin: 0 }}
					>
						Verified
					</Tag>

					{/* ADD BANK (+) */}

					{/* DELETE */}
					<DeleteOutlined
						onClick={() => onDelete(bank.id)}
						style={{
							color: "#ef4444",
							fontSize: 16,
							cursor: "pointer"
						}}
					/>
				</div>

			</div>
		);
	};


	const getPrimaryBankAccounts = (banks = []) => {
		if (!Array.isArray(banks)) return [];

		// 1️⃣ Filter only primary banks
		const primaryBanks = banks.filter(bank => bank.is_primary === true);

		// 2️⃣ If primary exists → return only those
		if (primaryBanks.length > 0) {
			return primaryBanks;
		}

		// 3️⃣ Fallback (safety): latest verified bank
		const verifiedBanks = banks
			.filter(bank => bank.verified === true)
			.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

		return verifiedBanks.slice(0, 1); // show only one
	};




	const deleteBankAccount = async (bankId) => {
		try {
			await axiosAuth.delete(`payout/deleteBankAccount/${bankId}`);
			message.success("Bank deleted successfully");
			fetchBankAccounts();
		} catch (err) {
			message.error("Failed to delete bank");
		}
	};




	/* -------------------- PAN -------------------- */
	const verifyPan = async () => {
		try {
			setLoading(true);

			console.log(`Calling PAN verify: ${axiosAuth.defaults.baseURL}cashfree/pan/verify` , { pan: pan.trim(), name: panName.trim(), ...(customer_id ? { customer_id } : {}) });
			const res = await axiosAuth.post("cashfree/pan/verify", {
				pan: pan.trim(),
				name: panName.trim(),
				...(customer_id ? { customer_id } : {})
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
				Name: aadhaarName,
				Phone: bankPhone,
				...(customer_id ? { customer_id } : {})
			};

			console.log(`Calling Add Bank Account: ${axiosAuth.defaults.baseURL}payout/addBankAccount`, payload);
			const res = await axiosAuth.post("payout/addBankAccount", payload);

			if (
				res.data?.status === "success" &&
				res.data?.data?.verified === true
			) {
				message.success("Bank account verified successfully");

				setBankVerified(true);
				setVerifiedBankData(res.data.data);

				// lock bank form
				setShowBankSection(false);
			} else {
				message.error("Bank verification failed");
			}

		} catch (err) {
			message.error(
				err.response?.data?.message ||
				"Bank verification failed"
			);
		} finally {
			setBankLoading(false);
		}
	};

	const maskedPan = pan ? `XXXX${pan.slice(-4)}` : "";


	const isBankFormValid =
		accountNumber &&
		confirmAccountNumber &&
		accountNumber === confirmAccountNumber &&
		aadhaarName.length >= 3 && // ✅ use this
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
							disabled={readOnlyOnVerified ? aadhaarVerified : false}
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
							<div
								style={{
									marginTop: 12,
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									gap: 16
								}}
							>
								<Tag color="green" icon={<CheckCircleFilled />} style={{ margin: 0 }}>
									Aadhaar Verified
								</Tag>

								<div
									style={{
										display: "flex",
										gap: 24,
										background: "#f8fafc",
										border: "1px solid #e5e7eb",
										borderRadius: 10,
										padding: "8px 14px"
									}}
								>
									<div>
										<div style={{ fontSize: 11, color: "#6b7280" }}>NAME</div>
										<div style={{ fontWeight: 600 }}>{aadhaarName}</div>
									</div>

									<div>
										<div style={{ fontSize: 11, color: "#6b7280" }}>DOB</div>
										<div style={{ fontWeight: 600 }}>{aadhaarDob}</div>
									</div>
								</div>
							</div>
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
							disabled={readOnlyOnVerified ? (panVerified || !aadhaarVerified) : !aadhaarVerified}

							value={pan}
							onChange={e => setPan(e.target.value.toUpperCase())}
						/>


						<Input
							placeholder="Enter Name as on PAN"
							className="mt-2"
							disabled={readOnlyOnVerified ? (panVerified || !aadhaarVerified) : !aadhaarVerified}
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



					</Card>
				</Col>

			</Row>

			{/* BANK SECTION */}
			{/* ================= BANK ACCOUNT VERIFICATION ================= */}
			<Card
				title="Bank Accounts"
				style={{
					borderRadius: 14,
					background: "#f8fafc"
				}}
			>
				{/* Top toolbar: always-visible Add button (right-aligned) */}
				<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
					<Button type="primary" onClick={() => setShowAddBankForm(true)}>
						Add Bank Account
					</Button>
				</div>

				{hasBanks && getPrimaryBankAccounts(bankList).map(bank => (
					<BankAccountRow key={bank.id} bank={bank} onDelete={deleteBankAccount} />
				))}

				{/* When showBankSection === true, show your AddBankCard BELOW */}
				<Modal
					open={showAddBankForm}
					centered
					footer={null}
					width={700}
					onCancel={() => setShowAddBankForm(false)}
					bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
					title="Add Bank Account"
				>
					<AddBankCard
						accountNumber={accountNumber}
						setAccountNumber={setAccountNumber}
						confirmAccountNumber={confirmAccountNumber}
						setConfirmAccountNumber={setConfirmAccountNumber}
						accountHolderName={accountHolderName}
						setAccountHolderName={setAccountHolderName}
						ifsc={ifsc}
						setIfsc={setIfsc}
						bankPhone={bankPhone}
						setBankPhone={setBankPhone}
						onSubmit={async () => {
							await submitBankAccount();
							// close modal after submit attempt; fetchBankAccounts will refresh list
							setShowAddBankForm(false);
						}}
						loading={bankLoading}
						isValid={isBankFormValid}
						aadhaarName={aadhaarName}
						aadhaarVerified={aadhaarVerified}
					/>
				</Modal>
			</Card>


		</>
	);
};

export default KYCPage;
