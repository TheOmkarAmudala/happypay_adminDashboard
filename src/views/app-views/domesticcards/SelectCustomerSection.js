import React, { useState, useMemo } from "react";
import {
    Card,
    Typography,
    Tag,
    Button,
    Row,
    Col,
    Input,
    Select,
    Modal,
    Divider,
    Spin,
    Empty
} from "antd";
import {
    SearchOutlined,
    CheckCircleFilled,
    CloseCircleFilled
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import KYCPage from "../customer_kyc"; // render full customer KYC page inside a modal

const { Title, Text } = Typography;
const { Option } = Select;

const SelectCustomerSection = ({
                                   customers = [],
                                   loading,
                                   bankAccounts = [],
                                   bankLoading,
                                   fetchCustomerBanks,
                                   onSelect
                               }) => {
    const navigate = useNavigate();

    /* ================= UI STATE ================= */
    const [search, setSearch] = useState("");
    const [kycFilter, setKycFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("new");

    const [bankModalOpen, setBankModalOpen] = useState(false);
    const [activeCustomer, setActiveCustomer] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);

    // --- NEW: KYC modal state ---
    const [kycOpen, setKycOpen] = useState(false);
    const [renderKycPage, setRenderKycPage] = useState(false);
    const [currentKycCustomer, setCurrentKycCustomer] = useState(null);

    /* ================= HELPERS ================= */
    const isKycVerified = (c) =>
        Array.isArray(c?.kyc) && c.kyc.some((k) => k.verified === true);

    const verifiedBanks = useMemo(
        () => bankAccounts.filter((b) => b.verified === true),
        [bankAccounts]
    );

    /* ================= FILTER CUSTOMERS ================= */
    const filteredCustomers = useMemo(() => {
        return customers
            .filter((c) => {
                const q = search.toLowerCase();
                const matchSearch =
                    c.name?.toLowerCase().includes(q) || c.phone?.includes(q);

                const verified = isKycVerified(c);
                const matchKyc =
                    kycFilter === "all"
                        ? true
                        : kycFilter === "verified"
                            ? verified
                            : !verified;

                return matchSearch && matchKyc;
            })
            .sort((a, b) =>
                sortOrder === "new"
                    ? new Date(b.createdAt) - new Date(a.createdAt)
                    : new Date(a.createdAt) - new Date(b.createdAt)
            );
    }, [customers, search, kycFilter, sortOrder]);

    /* ================= SELECTED CUSTOMER ================= */
    /* ================= LIST VIEW ================= */
    return (
        <>
            <div style={{ maxWidth: 1000 }}>
                <Title level={5}>Select Customer</Title>

                {/* FILTER BAR */}
                <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                    <Col xs={24} md={8}>
                        <Input
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder="Search name or phone"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Col>

                    <Col xs={12} md={4}>
                        <Select
                            value={kycFilter}
                            onChange={setKycFilter}
                            style={{ width: "100%" }}
                        >
                            <Option value="all">All KYC</Option>
                            <Option value="verified">Verified</Option>
                            <Option value="pending">Pending</Option>
                        </Select>
                    </Col>

                    <Col xs={12} md={4}>
                        <Select
                            value={sortOrder}
                            onChange={setSortOrder}
                            style={{ width: "100%" }}
                        >
                            <Option value="new">Newest</Option>
                            <Option value="old">Oldest</Option>
                        </Select>
                    </Col>

                    <Col xs={24} md={8} style={{ textAlign: "right" }}>
                        <Button
                            type="primary"
                            onClick={() => navigate("/app/apps/customers")}
                        >
                            Add Customer
                        </Button>
                    </Col>
                </Row>

                {/* CUSTOMER GRID */}
                {loading ? (
                    <Spin />
                ) : filteredCustomers.length === 0 ? (
                    <Empty description="No customers found" />
                ) : (
                    <Row gutter={[16, 16]}>
                        {filteredCustomers.map((customer) => {
                            const verified = isKycVerified(customer);

                            return (
                                <Col key={customer.id} xs={24} sm={12} lg={8}>
                                    <Card
                                        hoverable={verified}
                                        onClick={async () => {
                                            // only allow bank-selection when verified; otherwise do nothing (button opens KYC)
                                            if (!verified) return;

                                            setActiveCustomer(customer);
                                            setSelectedBank(null);

                                            await fetchCustomerBanks(customer.customer);
                                            setBankModalOpen(true);
                                        }}
                                        style={{
                                            borderRadius: 16,
                                            position: "relative"
                                        }}
                                    >
                                        {verified ? (
                                            <CheckCircleFilled
                                                style={{
                                                    color: "#22c55e",
                                                    fontSize: 20,
                                                    position: "absolute",
                                                    top: 16,
                                                    right: 16
                                                }}
                                            />
                                        ) : (
                                            <CloseCircleFilled
                                                style={{
                                                    color: "#f97316",
                                                    fontSize: 20,
                                                    position: "absolute",
                                                    top: 16,
                                                    right: 16
                                                }}
                                            />
                                        )}

                                        <Title level={5} style={{ color: verified ? undefined : '#64748b' }}>{customer.name}</Title>
                                        <Text style={{ color: verified ? undefined : '#64748b' }}>{customer.phone}</Text>

                                        <div style={{ marginTop: 8 }}>
                                            <Tag color={verified ? "green" : "orange"}>
                                                {verified ? "KYC Verified" : "KYC Pending"}
                                            </Tag>
                                        </div>

                                        {/* If not verified, show prominent Complete KYC button (only button opens KYC) */}
                                        {!verified && (
                                            <Button
                                                type="primary"
                                                danger
                                                style={{ marginTop: 12, cursor: 'pointer', zIndex: 2 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentKycCustomer(customer);
                                                    setRenderKycPage(true);
                                                    setKycOpen(true);
                                                }}
                                                aria-label={`Complete KYC for ${customer.name}`}
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
            </div>

            {/* ===== KYC MODAL (renders full customer_kyc page) ===== */}
            <Modal
                open={kycOpen}
                centered
                footer={null}
                width={renderKycPage ? 1000 : 600}
                bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
                onCancel={() => {
                    setKycOpen(false);
                    setRenderKycPage(false);
                    setCurrentKycCustomer(null);
                }}
                title={renderKycPage ? `Customer KYC — ${currentKycCustomer?.name || currentKycCustomer?.id || ""}` : "Complete KYC"}
            >
                {renderKycPage ? (
                    <KYCPage customer_id={currentKycCustomer?.id} readOnlyOnVerified={true} />
                ) : null}
            </Modal>

            {/* ================= BANK SELECTION MODAL ================= */}
            <Modal
                open={bankModalOpen}
                title="Select Bank Account"
                footer={null}
                centered
                destroyOnClose
                maskClosable={false}
                width={640}
                bodyStyle={{
                    maxHeight: "60vh",
                    overflowY: "auto",
                    paddingRight: 12
                }}
                style={{
                    top: 0
                }}
                onCancel={() => {
                    setBankModalOpen(false);
                    setSelectedBank(null);
                }}
            >
                {bankLoading ? (
                    <div style={{ textAlign: "center", padding: 32 }}>
                        <Spin />
                    </div>
                ) : verifiedBanks.length === 0 ? (
                    <Empty description="No verified bank accounts available" />
                ) : (
                    <>
                        {verifiedBanks.map((bank) => {
                            const isSelected = selectedBank?.id === bank.id;

                            // 🔒 Mask account number (last 4 digits only)
                            const maskedAccount =
                                "•••• " + bank.bank_account_number.slice(-4);

                            return (
                                <Card
                                    key={bank.id}
                                    hoverable
                                    onClick={() => setSelectedBank(bank)}
                                    style={{
                                        marginBottom: 10,
                                        borderRadius: 12,
                                        padding: "8px 12px",
                                        border: isSelected
                                            ? "2px solid #2563eb"
                                            : "1px solid #e5e7eb",
                                        background: isSelected ? "#f0f7ff" : "#ffffff",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease"
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between"
                                        }}
                                    >
                                        {/* LEFT: Bank Icon + Info */}
                                        <div style={{ display: "flex", gap: 12 }}>
                                            {/* Bank Icon */}
                                            <div
                                                style={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: 10,
                                                    background: "#eef2ff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#2563eb",
                                                    fontSize: 20,
                                                    fontWeight: 600
                                                }}
                                            >
                                                🏦
                                            </div>

                                            {/* Bank Info */}
                                            <div>
                                                <Text strong style={{ fontSize: 14 }}>
                                                    {bank.beneficiary_name}
                                                </Text>

                                                <div style={{ fontSize: 13, color: "#475569" }}>
                                                    {maskedAccount}
                                                </div>

                                                {/* IFSC – de-emphasized */}
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#94a3b8",
                                                        marginTop: 2
                                                    }}
                                                >
                                                    IFSC · {bank.bank_ifsc}
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT: Selection Indicator */}
                                        <div
                                            style={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: "50%",
                                                border: isSelected
                                                    ? "6px solid #2563eb"
                                                    : "2px solid #cbd5e1",
                                                transition: "all 0.15s ease"
                                            }}
                                        />
                                    </div>
                                </Card>
                            );
                        })}

                        {/* FOOTER CTA */}
                        <Divider />

                        <Button
                            type="primary"
                            block
                            size="large"
                            disabled={!selectedBank}
                            onClick={() => {
                                onSelect(activeCustomer, selectedBank);
                                setBankModalOpen(false);
                            }}
                        >
                            Select & Continue
                        </Button>
                    </>
                )}
            </Modal>
        </>
    );
};

export default SelectCustomerSection;

