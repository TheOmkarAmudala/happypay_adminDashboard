import React, { useEffect, useState } from "react";
import {
	Card,
	Button,
	Spin,
	Typography,
	Modal,
	Input,
	Space,
	Row,
	Col,
	message
} from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import axios from "axios";


const { Title } = Typography;

const API_BASE = "https://test.happypay.live";

const CustomerKycManagement = () => {
	const token = localStorage.getItem("AUTH_TOKEN");

	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(true);

	const [addOpen, setAddOpen] = useState(false);
	const [adding, setAdding] = useState(false);

	const [kycOpen, setKycOpen] = useState(false);
	const [currentCustomer, setCurrentCustomer] = useState(null);
	const [currentStep, setCurrentStep] = useState(0); // 0=Aadhaar,1=PAN,2=Bank


	const [form, setForm] = useState({
		name: "",
		phone: "",
		email: ""
	});

	/* ================= KYC CHECK ================= */
	const isKycVerified = (c) =>
		Array.isArray(c?.kyc) &&
		c.kyc.some(k => k.verified === true);

	/* ================= FETCH CUSTOMERS ================= */
	const loadCustomers = async () => {
		try {
			setLoading(true);

			const res = await axios.get(`${API_BASE}/customer/getAll`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			setCustomers(res.data?.data || []);
		} catch (err) {
			console.error(err);
			message.error("Failed to load customers");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadCustomers();
	}, []);

	/* ================= ADD CUSTOMER ================= */
	const handleAddCustomer = async () => {
		if (!form.name || !form.phone) {
			message.warning("Name & Phone are required");
			return;
		}

		try {
			setAdding(true);

			await axios.post(`${API_BASE}/customer`, form, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			message.success("Customer added");
			setAddOpen(false);
			setForm({ name: "", phone: "", email: "" });
			loadCustomers();
		} catch {
			message.error("Failed to add customer");
		} finally {
			setAdding(false);
		}
	};
	const openKycModal = (customer) => {
		setCurrentCustomer(customer);
		setCurrentStep(0);
		setKycOpen(true);
	};

	/* ================= UI ================= */
	return (
		<>
			<Title level={3}>Customer Management</Title>

			<Button
				type="primary"
				style={{ marginBottom: 20 }}
				onClick={() => setAddOpen(true)}
			>
				Add Customer
			</Button>

			<div style={{ marginTop: 20 }}>
				{loading ? (
					<Spin />
				) : (
					<Row gutter={[16, 16]}>
						{customers.map((c) => {
							const verified = isKycVerified(c);

							return (
								<Col key={c.id} xs={24} sm={12} lg={8}>
									<Card
										bordered={false}
										style={{
											borderRadius: 16,
											boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
											position: "relative",
											height: "100%"
										}}
									>
										{/* STATUS ICON */}
										{verified ? (
											<CheckCircleFilled
												style={{
													position: "absolute",
													top: 14,
													right: 14,
													fontSize: 22,
													color: "#22c55e"
												}}
											/>
										) : (
											<CloseCircleFilled
												style={{
													position: "absolute",
													top: 14,
													right: 14,
													fontSize: 22,
													color: "#ef4444"
												}}
											/>
										)}

										<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
											<div style={{ fontSize: 16, fontWeight: 600 }}>{c.name}</div>
											<div style={{ fontSize: 14, color: "#555" }}>{c.phone}</div>
											<div style={{ fontSize: 14, color: "#777" }}>
												{c.email || "—"}
											</div>

											{!verified && (
												<Button
													danger
													type="default"
													style={{ marginTop: 12, width: "fit-content" }}
													onClick={() => openKycModal(c)}
												>
													Complete KYC →
												</Button>
											)}
										</div>
									</Card>
								</Col>
							);
						})}
					</Row>
				)}
			</div>

			{/* KYC MODAL */}
			<Modal
				open={kycOpen}
				footer={null}
				width={600}
				onCancel={() => setKycOpen(false)}
				destroyOnClose
				title={
					["Aadhaar Verification", "PAN Verification", "Bank Verification"][currentStep]
				}
			>
				{currentStep === 0 && (
					<AadhaarStep onSuccess={() => setCurrentStep(1)} />
				)}
				{currentStep === 1 && (
					<PanStep onSuccess={() => setCurrentStep(2)} />
				)}
				{currentStep === 2 && (
					<BankStep
						onSuccess={() => {
							message.success("KYC Completed");
							setKycOpen(false);
							loadCustomers();
						}}
					/>
				)}
			</Modal>

			<Modal
				title="Add Customer"
				open={addOpen}
				onCancel={() => setAddOpen(false)}
				onOk={handleAddCustomer}
				confirmLoading={adding}
				okText="Add"
			>
				<Space direction="vertical" style={{ width: "100%" }}>
					<Input
						placeholder="Customer Name"
						value={form.name}
						onChange={(e) =>
							setForm({ ...form, name: e.target.value })
						}
					/>
					<Input
						placeholder="Phone Number"
						value={form.phone}
						onChange={(e) =>
							setForm({ ...form, phone: e.target.value })
						}
					/>
					<Input
						placeholder="Email (optional)"
						value={form.email}
						onChange={(e) =>
							setForm({ ...form, email: e.target.value })
						}
					/>
				</Space>
			</Modal>

		</>
	);
};

export default CustomerKycManagement;
const AadhaarStep = ({ onSuccess }) => {
	const token = localStorage.getItem("AUTH_TOKEN");

	const [aadhaar, setAadhaar] = useState("");
	const [otp, setOtp] = useState("");
	const [txnId, setTxnId] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [aadhaarVerified, setAadhaarVerified] = useState(false);
	const [loading, setLoading] = useState(false);

	const sendOtp = async () => {
		try {
			setLoading(true);

			const res = await axios.get(
				`${API_BASE}/cashfree/aadhaar/sendotp?aadhaar=${aadhaar}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			// ✅ CORRECT FIELD
			const refId = res?.data?.data?.ref_id;

			if (!refId) {
				throw new Error("ref_id not received");
			}

			setTxnId(refId);      // store ref_id
			setOtpSent(true);
			message.success("OTP sent successfully");

		} catch (err) {
			console.error(err);
			message.error("Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};


	const verifyOtp = async () => {
		try {
			setLoading(true);

			console.log("VERIFY OTP PAYLOAD", {
				otp,
				ref_id: txnId,
				aadhaar
			});

			await axios.post(
				`${API_BASE}/cashfree/aadhaar/verifyotp`,
				{
					otp: otp,
					ref_id: txnId,
					aadhaar: aadhaar
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json"
					}
				}
			);

			setAadhaarVerified(true);
			message.success("Aadhaar verified");
		} catch (err) {
			console.error("VERIFY OTP ERROR:", err.response?.data || err);
			message.error(err.response?.data?.message || "OTP verification failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{/* Aadhaar input */}
			<Input
				placeholder="Aadhaar Number"
				maxLength={12}
				disabled={otpSent}
				value={aadhaar}
				onChange={e => setAadhaar(e.target.value.replace(/\D/g, ""))}
			/>

			{/* OTP flow */}
			{!otpSent && (
				<Button
					block
					type="primary"
					className="mt-3"
					disabled={aadhaar.length !== 12}
					loading={loading}
					onClick={sendOtp}
				>
					Send OTP
				</Button>
			)}

			{otpSent && !aadhaarVerified && (
				<>
					<Input
						className="mt-3"
						placeholder="OTP"
						maxLength={6}
						value={otp}
						onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
					/>
					<Button
						block
						type="primary"
						className="mt-2"
						disabled={otp.length !== 6}
						loading={loading}
						onClick={verifyOtp}
					>
						Verify OTP
					</Button>
				</>
			)}

			{/* VERIFIED STATE */}
			{aadhaarVerified && (
				<>
					<div style={{ marginTop: 16, color: "#16a34a", fontWeight: 600 }}>
						✅ Aadhaar Verified Successfully
					</div>
					<Button
						block
						type="primary"
						className="mt-3"
						onClick={onSuccess} // ✅ move to PAN
					>
						Continue →
					</Button>
				</>
			)}
		</>
	);
};

const PanStep = ({ onSuccess }) => {
	const token = localStorage.getItem("AUTH_TOKEN");
	const [pan, setPan] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);

	const verifyPan = async () => {
		setLoading(true);
		await axios.post(
			`${API_BASE}/cashfree/pan/verify`,
			{ pan, name },
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		message.success("PAN Verified");
		setLoading(false);
		onSuccess();
	};

	return (
		<>
			<Input
				placeholder="PAN Number"
				maxLength={10}
				value={pan}
				onChange={e => setPan(e.target.value.toUpperCase())}
			/>
			<Input
				className="mt-2"
				placeholder="Name as per PAN"
				value={name}
				onChange={e => setName(e.target.value)}
			/>
			<Button
				block
				type="primary"
				className="mt-3"
				disabled={pan.length !== 10 || name.length < 3}
				loading={loading}
				onClick={verifyPan}
			>
				Verify PAN
			</Button>
		</>
	);
};
const BankStep = ({ onSuccess }) => {
	const token = localStorage.getItem("AUTH_TOKEN");
	const [bank, setBank] = useState("");
	const [acc, setAcc] = useState("");
	const [name, setName] = useState("");
	const [ifsc, setIfsc] = useState("");
	const [loading, setLoading] = useState(false);

	const submit = async () => {
		setLoading(true);
		await axios.post(
			`${API_BASE}/payout/addBankAccount`,
			{
				bank_name: bank,
				account_number: acc,
				account_holder_name: name,
				ifsc
			},
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		setLoading(false);
		onSuccess();
	};

	return (
		<>
			<Input placeholder="Bank Name" value={bank} onChange={e => setBank(e.target.value)} />
			<Input className="mt-2" placeholder="Account Number" value={acc} onChange={e => setAcc(e.target.value)} />
			<Input className="mt-2" placeholder="Account Holder Name" value={name} onChange={e => setName(e.target.value)} />
			<Input className="mt-2" placeholder="IFSC" value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} />

			<Button
				block
				type="primary"
				className="mt-3"
				loading={loading}
				onClick={submit}
			>
				Submit Bank Details
			</Button>


		</>
	);
};

