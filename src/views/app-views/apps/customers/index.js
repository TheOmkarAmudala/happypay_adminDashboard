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
	ClockCircleFilled
} from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";

import { getAllCustomers, addCustomer } from "./customer.service";
import KYCPage from "../../customer_kyc"; // render full customer KYC page inside a modal

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE = "https://test.happypay.live";

const CustomerKycManagement = () => {
	const token = useSelector(state => state.auth.token);

	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [kycViewOpen, setKycViewOpen] = useState(false);
	const [kycLoading, setKycLoading] = useState(false);
	const [kycData, setKycData] = useState(null);
	// UI filters
	const [search, setSearch] = useState("");
	const [kycFilter, setKycFilter] = useState("all"); // all | verified | pending
	const [sortOrder, setSortOrder] = useState("new"); // new | old

	// Add customer
	const [addOpen, setAddOpen] = useState(false);
	const [adding, setAdding] = useState(false);

	// KYC modal (stepper)
	const [kycOpen, setKycOpen] = useState(false);
	const [currentCustomer, setCurrentCustomer] = useState(null);
	const [currentStep, setCurrentStep] = useState(0);

	// When true, render the full `KYCPage` (the customer_kyc index) inside the modal
	const [renderKycPage, setRenderKycPage] = useState(false);

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
			const res = await getAllCustomers(token);
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
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	/* ================= FILTER + SORT ================= */
	const filteredCustomers = useMemo(() => {
		return customers
			.filter((c) => {
				const q = search.toLowerCase();

				const matchSearch =
					(c.name || "").toLowerCase().includes(q) ||
					(c.phone || "").includes(q) ||
					(c.email || "").toLowerCase().includes(q);

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
			// pass optional customer_id from form.customer_id (if present) to ensure it's sent
			await addCustomer(form, token, form.customer_id);
			message.success("Customer added");
			setAddOpen(false);
			setForm({ name: "", phone: "", email: "" });
			loadCustomers();
		} catch (err) {
			console.error(err);
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

	/* ================= open customer KYC view (details modal) ================= */
	const openCustomerKycView = async (customer) => {
		setCurrentCustomer(customer);
		setKycViewOpen(true);
		setKycLoading(true);
		setKycData(null);

		try {
			// Log the exact API URL we're about to hit (useful for debugging / network tracing)
			console.log(`Fetching customer KYC: ${API_BASE}/customer/kyc?customer_id=${customer.id}`);
			const res = await axios.get(`${API_BASE}/customer/kyc`, {
				params: { customer_id: customer.id },
				headers: { Authorization: `Bearer ${token}` }
			});

			setKycData(res.data?.data || null);
		} catch (err) {
			console.error(err);
			message.error("Failed to load customer KYC");
		} finally {
			setKycLoading(false);
		}
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
									onClick={() => openCustomerKycView(c)}
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
										<ClockCircleFilled style={{ color: "#f97316", fontSize: 22, position: "absolute", top: 16, right: 16 }} />
									)}

									<Title level={5}>{c.name}</Title>
									<Text>{c.phone}</Text><br />
									<Text type="secondary">{c.email || "—"}</Text>

									<div style={{ marginTop: 10 }}>
										<Tag color={verified ? "green" : "orange"}>
											{verified ? "KYC Verified" : "KYC Pending"}
										</Tag>
									</div>

									{!verified && (
										<Button
											danger
											style={{ marginTop: 12 }}
											onClick={() => {
												// Open the modal and render the full customer KYC page for this customer
												setCurrentCustomer(c);
												setRenderKycPage(true);
												setKycOpen(true);
											}}
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

			{/* ===== KYC MODAL (stepper) ===== */}
			<Modal
				open={kycOpen}
				centered
				footer={null}
				width={renderKycPage ? 1000 : 600}
				bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
				onCancel={() => {
					setKycOpen(false);
					setRenderKycPage(false);
					setCurrentStep(0);
				}}
				title={renderKycPage ? `Customer KYC — ${currentCustomer?.name || currentCustomer?.id || ""}` : ["Aadhaar Verification", "PAN Verification", "Bank Verification"][currentStep]}
			>
				{renderKycPage ? (
					// Render the full KYC page and pass the customer id as prop
					<KYCPage customer_id={currentCustomer?.id} />
				) : (
					<>
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
					</>
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
					<Input placeholder="Customer ID (optional)" value={form.customer_id || ""} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} />
					<Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
					<Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
					<Input placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
				</Space>
			</Modal>

			{/* ===== VIEW KYC DETAILS MODAL ===== */}
			<Modal
				open={kycViewOpen}
				centered
				onCancel={() => setKycViewOpen(false)}
				footer={null}
				width={700}
				bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
				title="Customer KYC Details"
			>
				{kycLoading ? (
					<Skeleton active />
				) : !kycData ? (
					<Text type="secondary">No KYC data found</Text>
				) : (
					<>
						{/* CUSTOMER INFO */}
						<Divider orientation="left">Customer</Divider>
						<Space direction="vertical">
							<Text><strong>Customer ID:</strong> {kycData.customer_id}</Text>
							<Text><strong>User ID:</strong> {kycData.user}</Text>
							<Tag color={kycData.verified ? "green" : "orange"}>
								{kycData.verified ? "Verified" : "Pending"}
							</Tag>
						</Space>

						<Divider orientation="left">Aadhaar Details</Divider>
						<Space direction="vertical">
							<Text><strong>Name:</strong> {kycData.response?.name}</Text>
							<Text><strong>DOB:</strong> {kycData.response?.dob}</Text>
							<Text><strong>Gender:</strong> {kycData.response?.gender}</Text>
							<Text><strong>Address:</strong> {kycData.response?.address}</Text>
							<Text>
								<strong>Aadhaar:</strong> XXXX-XXXX-{kycData.identification?.slice(-4)}
							</Text>
						</Space>

						<Divider orientation="left">Aadhaar</Divider>
						<Tag color={kycData.aadhaar?.verified ? "green" : "orange"}>
							{kycData.aadhaar?.verified ? "Verified" : "Pending"}
						</Tag>
						{kycData.aadhaar && (
							<div>
								<Text>Name: {kycData.aadhaar.name}</Text><br />
								<Text>DOB: {kycData.aadhaar.dob}</Text>
							</div>
						)}

						<Divider orientation="left">PAN</Divider>
						<Tag color={kycData.pan?.verified ? "green" : "orange"}>
							{kycData.pan?.verified ? "Verified" : "Pending"}
						</Tag>
						{kycData.pan && (
							<div>
								<Text>PAN: XXXX{kycData.pan.last4}</Text><br />
								<Text>Name: {kycData.pan.name}</Text>
							</div>
						)}

						<Divider orientation="left">Bank</Divider>
						<Tag color={kycData.bank?.verified ? "green" : "orange"}>
							{kycData.bank?.verified ? "Verified" : "Pending"}
						</Tag>
						{kycData.bank && (
							<div>
								<Text>Account: XXXX{kycData.bank.last4}</Text><br />
								<Text>IFSC: {kycData.bank.ifsc}</Text>
							</div>
						)}
					</>
				)}
			</Modal>
		</>
	);
};

export default CustomerKycManagement;

/* --------------------- Helper step components --------------------- */

const AadhaarStep = ({ onSuccess }) => {
	const token = useSelector(state => state.auth.token);
	const [aadhaar, setAadhaar] = useState("");
	const [otp, setOtp] = useState("");
	const [txnId, setTxnId] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [aadhaarVerified, setAadhaarVerified] = useState(false);
	const [loading, setLoading] = useState(false);

	const sendOtp = async () => {
		try {
			setLoading(true);
			const res = await axios.get(`${API_BASE}/cashfree/aadhaar/sendotp?aadhaar=${aadhaar}`, { headers: { Authorization: `Bearer ${token}` } });
			const refId = res?.data?.data?.ref_id;
			if (!refId) throw new Error("ref_id not received");
			setTxnId(refId);
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
			await axios.post(`${API_BASE}/cashfree/aadhaar/verifyotp`, { otp, ref_id: txnId, aadhaar }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
			setAadhaarVerified(true);
			message.success("Aadhaar verified");
		} catch (err) {
			console.error(err.response?.data || err);
			message.error(err.response?.data?.message || "OTP verification failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Input
				placeholder="Aadhaar Number"
				maxLength={12}
				disabled={otpSent}
				value={aadhaar}
				onChange={e => setAadhaar(e.target.value.replace(/\D/g, ""))}
			/>

			{!otpSent && (
				<Button block type="primary" className="mt-3" disabled={aadhaar.length !== 12} loading={loading} onClick={sendOtp}>
					Send OTP
				</Button>
			)}

			{otpSent && !aadhaarVerified && (
				<>
					<Input className="mt-3" placeholder="OTP" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} />
					<Button block type="primary" className="mt-2" disabled={otp.length !== 6} loading={loading} onClick={verifyOtp}>
						Verify OTP
					</Button>
				</>
			)}

			{aadhaarVerified && (
				<>
					<div style={{ marginTop: 16, color: "#16a34a", fontWeight: 600 }}>
						✅ Aadhaar Verified Successfully
					</div>
					<Button block type="primary" className="mt-3" onClick={onSuccess}>
						Continue →
					</Button>
				</>
			)}
		</>
	);
};

const PanStep = ({ onSuccess }) => {
	const token = useSelector(state => state.auth.token);
	const [pan, setPan] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);

	const verifyPan = async () => {
		try {
			setLoading(true);
			await axios.post(`${API_BASE}/cashfree/pan/verify`, { pan, name }, { headers: { Authorization: `Bearer ${token}` } });
			message.success("PAN Verified");
			onSuccess();
		} catch (err) {
			console.error(err);
			message.error("Failed to verify PAN");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Input placeholder="PAN Number" maxLength={10} value={pan} onChange={e => setPan(e.target.value.toUpperCase())} />
			<Input className="mt-2" placeholder="Name as per PAN" value={name} onChange={e => setName(e.target.value)} />
			<Button block type="primary" className="mt-3" disabled={pan.length !== 10 || name.length < 3} loading={loading} onClick={verifyPan}>
				Verify PAN
			</Button>
		</>
	);
};

const BankStep = ({ onSuccess }) => {
	const token = useSelector(state => state.auth.token);
	const [bank, setBank] = useState("");
	const [acc, setAcc] = useState("");
	const [name, setName] = useState("");
	const [ifsc, setIfsc] = useState("");
	const [loading, setLoading] = useState(false);

	const submit = async () => {
		try {
			setLoading(true);
			await axios.post(`${API_BASE}/payout/addBankAccount`, { bank_name: bank, account_number: acc, account_holder_name: name, ifsc }, { headers: { Authorization: `Bearer ${token}` } });
			message.success("Bank details submitted");
			onSuccess();
		} catch (err) {
			console.error(err);
			message.error("Failed to submit bank details");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Input placeholder="Bank Name" value={bank} onChange={e => setBank(e.target.value)} />
			<Input className="mt-2" placeholder="Account Number" value={acc} onChange={e => setAcc(e.target.value)} />
			<Input className="mt-2" placeholder="Account Holder Name" value={name} onChange={e => setName(e.target.value)} />
			<Input className="mt-2" placeholder="IFSC" value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} />

			<Button block type="primary" className="mt-3" loading={loading} onClick={submit}>
				Submit Bank Details
			</Button>
		</>
	);
};
