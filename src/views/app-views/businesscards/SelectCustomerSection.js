import React, { useState, useMemo } from "react";
import {
    Card,
    Typography,
    Tag,
    Button,
    Row,
    Col,
    Input,
    Space,
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

const { Title, Text } = Typography;
const { Option } = Select;

const SelectCustomerSection = ({
                                   customers = [],
                                   loading,
                                   bankAccounts = [],
                                   bankLoading,
                                   fetchCustomerBanks,
                                   selectedCustomer,
                                   onSelect,
                                   onChangeCustomer
                               }) => {
    const navigate = useNavigate();

    /* ================= UI STATE ================= */
    const [search, setSearch] = useState("");
    const [kycFilter, setKycFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("new");

    const [bankModalOpen, setBankModalOpen] = useState(false);
    const [activeCustomer, setActiveCustomer] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);

    /* ================= HELPERS ================= */
    const isKycVerified = (c) =>
        Array.isArray(c?.kyc) && c.kyc.some((k) => k.verified === true);

    const verifiedBanks = useMemo(
        () => bankAccounts.filter((b) => b.verified === true),
        [bankAccounts]
    );

    /* ================= FILTER + SORT ================= */
    const filteredCustomers = useMemo(() => {
        return customers
            .filter((c) => {
                const q = search.toLowerCase();

                const matchSearch =
                    c.name?.toLowerCase().includes(q) ||
                    c.phone?.includes(q);

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

    /* ================= SELECTED CUSTOMER VIEW (TEMPLATE) ================= */
    if (selectedCustomer) {
        return (
            <Card
                style={{
                    borderRadius: 16,
                    width: 260,

                    flexShrink: 0,
                    border: "2px solid #22c55e",
                    background: "#f6ffed",
                    marginBottom: 24,
                    maxWidth: 720
                }}
            >
                <Space align="center" style={{ width: "100%" }}>
                    <CheckCircleFilled style={{ color: "#22c55e", fontSize: 22 }} />

                    <div>
                        <Text strong>{selectedCustomer.name}</Text><br />
                        <Text type="secondary">{selectedCustomer.phone}</Text>
                    </div>

                    <Tag color="green">KYC Verified</Tag>

                    <Button
                        type="link"
                        danger
                        onClick={onChangeCustomer}
                        style={{ marginLeft: "auto" }}
                    >
                        Change
                    </Button>
                </Space>
            </Card>
        );
    }

    /* ================= LIST VIEW (TEMPLATE) ================= */
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
                                            if (!verified) {
                                                navigate("/app/apps/customers");
                                                return;
                                            }

                                            setActiveCustomer(customer);
                                            setSelectedBank(null);
                                            await fetchCustomerBanks(customer.customer);
                                            setBankModalOpen(true);
                                        }}
                                        style={{
                                            borderRadius: 16,
                                            position: "relative",
                                            opacity: verified ? 1 : 0.5,
                                            cursor: verified ? "pointer" : "not-allowed"
                                        }}
                                    >
                                        {verified ? (
                                            <CheckCircleFilled
                                                style={{
                                                    color: "#22c55e",
                                                    fontSize: 22,
                                                    position: "absolute",
                                                    top: 16,
                                                    right: 16
                                                }}
                                            />
                                        ) : (
                                            <CloseCircleFilled
                                                style={{
                                                    color: "#f97316",
                                                    fontSize: 22,
                                                    position: "absolute",
                                                    top: 16,
                                                    right: 16
                                                }}
                                            />
                                        )}

                                        <Title level={5}>{customer.name}</Title>
                                        <Text>{customer.phone}</Text>

                                        <div style={{ marginTop: 10 }}>
                                            <Tag color={verified ? "green" : "orange"}>
                                                {verified ? "KYC Verified" : "KYC Pending"}
                                            </Tag>
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </div>

            {/* ================= BANK MODAL ================= */}
            <Modal
                open={bankModalOpen}
                title="Select Bank Account"
                footer={null}
                centered
                destroyOnClose
                width={640}
                onCancel={() => {
                    setBankModalOpen(false);
                    setSelectedBank(null);
                }}
                bodyStyle={{
                    maxHeight: "60vh",
                    overflowY: "auto",
                    paddingRight: 12
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
                                        {/* LEFT SIDE */}
                                        <div style={{ display: "flex", gap: 12 }}>
                                            {/* BANK ICON */}
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

                                            {/* BANK DETAILS */}
                                            <div>
                                                <Text strong style={{ fontSize: 14 }}>
                                                    {bank.beneficiary_name}
                                                </Text>

                                                <div style={{ fontSize: 13, color: "#475569" }}>
                                                    {maskedAccount}
                                                </div>

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

                                        {/* RIGHT SIDE SELECTION DOT */}
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