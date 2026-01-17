import React, { useEffect, useState, useMemo } from "react";
import {
	Card,
	Button,
	Typography,
	Modal,
	Input,
	Space,
	Row,
	Col,
	Tag,
	Select,
	Divider,
	Skeleton,
	message
} from "antd";
import {
	CheckCircleFilled,
	CloseCircleFilled
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE = "https://test.happypay.live";

const CustomerKycManagement = () => {
	const token = localStorage.getItem("AUTH_TOKEN");

	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(true);

	// UI filters
	const [search, setSearch] = useState("");
	const [kycFilter, setKycFilter] = useState("all"); // all | verified | pending
	const [sortOrder, setSortOrder] = useState("new"); // new | old

	// Add customer
	const [addOpen, setAddOpen] = useState(false);
	const [adding, setAdding] = useState(false);

	// KYC modal
	const [kycOpen, setKycOpen] = useState(false);
	const [currentCustomer, setCurrentCustomer] = useState(null);
	const [currentStep, setCurrentStep] = useState(0);

	const [form, setForm] = useState({
		name: "",
		phone: "",
		email: ""
	});

	/* ================= KYC STATUS ================= */
	const isKycVerified = (c) =>
		Array.isArray(c?.kyc) &&
		c.kyc.some(k => k.verified === true);

	/* ================= FETCH ================= */
	const loadCustomers = async () => {
		try {
			setLoading(true);
			const res = await axios.get(`${API_BASE}/customer/getAll`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setCustomers(res.data?.data || []);
		} catch {
			message.error("Failed to load customers");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadCustomers();
	}, []);

	/* ================= FILTER + SORT ================= */
	const filteredCustomers = useMemo(() => {
		return customers
			.filter((c) => {
				const q = search.toLowerCase();

				const matchSearch =
					c.name?.toLowerCase().includes(q) ||
					c.phone?.includes(q) ||
					c.email?.toLowerCase().includes(q);

				const verified = isKycVerified(c);

				const matchKyc =
					kycFilter === "all"
						? true
						: kycFilter === "verified"
							? verified
							: !verified;

				return matchSearch && matchKyc;
			})
			.sort((a, b) => {
				if (sortOrder === "new") {
					return new Date(b.createdAt) - new Date(a.createdAt);
				}
				return new Date(a.createdAt) - new Date(b.createdAt);
			});
	}, [customers, search, kycFilter, sortOrder]);

	/* ================= ADD CUSTOMER ================= */
	const handleAddCustomer = async () => {
		if (!form.name || !form.phone) {
			message.warning("Name & Phone are required");
			return;
		}

		try {
			setAdding(true);
			await axios.post(`${API_BASE}/customer`, form, {
				headers: { Authorization: `Bearer ${token}` }
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

	/* ================= SKELETON ================= */
	const SkeletonGrid = () => (
		<Row gutter={[16, 16]}>
			{Array.from({ length: 6 }).map((_, i) => (
				<Col key={i} xs={24} sm={12} lg={8}>
					<Card style={{ borderRadius: 16 }}>
						<Skeleton active title paragraph={{ rows: 3 }} />
					</Card>
				</Col>
			))}
		</Row>
	);

	/* ================= UI ================= */
	return (
		<>
			<Title level={3}>Customer Management</Title>

			{/* ===== CONTROLS ===== */}
			<Row gutter={[12, 12]} align="middle">
				<Col xs={24} md={8}>
					<Input.Search
						placeholder="Search name, phone or email"
						allowClear
						onChange={(e) => setSearch(e.target.value)}
					/>
				</Col>

				<Col xs={12} md={4}>
					<Select value={kycFilter} onChange={setKycFilter} style={{ width: "100%" }}>
						<Option value="all">All KYC</Option>
						<Option value="verified">Verified</Option>
						<Option value="pending">Pending</Option>
					</Select>
				</Col>

				<Col xs={12} md={4}>
					<Select value={sortOrder} onChange={setSortOrder} style={{ width: "100%" }}>
						<Option value="new">Newest</Option>
						<Option value="old">Oldest</Option>
					</Select>
				</Col>

				<Col xs={24} md={8} style={{ textAlign: "right" }}>
					<Button type="primary" onClick={() => setAddOpen(true)}>
						Add Customer
					</Button>
				</Col>
			</Row>

			<Divider />

			{/* ===== LIST ===== */}
			{loading ? (
				<SkeletonGrid />
			) : (
				<Row gutter={[16, 16]}>
					{filteredCustomers.map((c) => {
						const verified = isKycVerified(c);

						return (
							<Col key={c.id} xs={24} sm={12} lg={8}>
								<Card
									hoverable
									style={{
										borderRadius: 16,
										position: "relative",
										height: "100%"
									}}
								>
									{verified ? (
										<CheckCircleFilled style={{ color: "#22c55e", fontSize: 22, position: "absolute", top: 16, right: 16 }} />
									) : (
										<CloseCircleFilled style={{ color: "#ef4444", fontSize: 22, position: "absolute", top: 16, right: 16 }} />
									)}

									<Title level={5}>{c.name}</Title>
									<Text>{c.phone}</Text><br />
									<Text type="secondary">{c.email || "—"}</Text>

									<div style={{ marginTop: 10 }}>
										<Tag color={verified ? "green" : "red"}>
											{verified ? "KYC Verified" : "KYC Pending"}
										</Tag>
									</div>

									{!verified && (
										<Button
											danger
											style={{ marginTop: 12 }}
											onClick={() => openKycModal(c)}
										>
											Complete KYC →
										</Button>
									)}
								</Card>
							</Col>
						);
					})}
				</Row>
			)}

			{/* ===== KYC MODAL ===== */}
			<Modal
				open={kycOpen}
				footer={null}
				width={600}
				onCancel={() => setKycOpen(false)}
				title={["Aadhaar Verification", "PAN Verification", "Bank Verification"][currentStep]}
			>
				{currentStep === 0 && <AadhaarStep onSuccess={() => setCurrentStep(1)} />}
				{currentStep === 1 && <PanStep onSuccess={() => setCurrentStep(2)} />}
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

			{/* ===== ADD MODAL ===== */}
			<Modal
				title="Add Customer"
				open={addOpen}
				onCancel={() => setAddOpen(false)}
				onOk={handleAddCustomer}
				confirmLoading={adding}
			>
				<Space direction="vertical" style={{ width: "100%" }}>
					<Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
					<Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
					<Input placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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

