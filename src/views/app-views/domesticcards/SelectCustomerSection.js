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
    Spin
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
                                   selectedCustomer,
                                   onSelect,          // (customer, bank) => {}
                                   onChangeCustomer
                               }) => {
    const navigate = useNavigate();

    /* ---------------- UI STATE ---------------- */
    const [search, setSearch] = useState("");
    const [kycFilter, setKycFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("new");

    const [bankModalOpen, setBankModalOpen] = useState(false);
    const [activeCustomer, setActiveCustomer] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);

    /* ---------------- HELPERS ---------------- */
    const isKycVerified = (c) =>
        Array.isArray(c?.kyc) && c.kyc.some(k => k.verified === true);

    // 🔥 IMPORTANT: banks are USER scoped
    const verifiedBanks = useMemo(
        () => bankAccounts.filter(b => b.verified === true),
        [bankAccounts]
    );

    /* ---------------- FILTER CUSTOMERS ---------------- */
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

    /* ---------------- SELECTED CUSTOMER VIEW ---------------- */
    if (selectedCustomer) {
        return (
            <Card
                style={{
                    borderRadius: 16,
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

    /* ---------------- LIST VIEW ---------------- */
    return (
        <>
            <div style={{ maxWidth: 1000 }}>
                <Title level={5}>Select Customer</Title>

                {/* CONTROLS */}
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
                        <Button type="primary" onClick={() => navigate("/app/apps/customers")}>
                            Add Customer
                        </Button>
                    </Col>
                </Row>

                {/* CUSTOMER CARDS */}
                {loading ? (
                    <Text>Loading customers…</Text>
                ) : (
                    <Row gutter={[16, 16]}>
                        {filteredCustomers.map((customer) => {
                            const verified = isKycVerified(customer);

                            return (
                                <Col key={customer.id} xs={24} sm={12} lg={8}>
                                    <Card
                                        hoverable
                                        onClick={() => {
                                            if (!verified) {
                                                navigate("/app/apps/customers");
                                                return;
                                            }
                                            setActiveCustomer(customer);
                                            setSelectedBank(null);
                                            setBankModalOpen(true);
                                        }}
                                        style={{
                                            borderRadius: 16,
                                            position: "relative",
                                            opacity: verified ? 1 : 0.6
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

                                        <Title level={5}>{customer.name}</Title>
                                        <Text>{customer.phone}</Text>

                                        <div style={{ marginTop: 8 }}>
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

            {/* ================= BANK SELECTION MODAL ================= */}
            {/* ================= BANK SELECTION MODAL ================= */}
            {/* ================= BANK SELECTION MODAL ================= */}
            <Modal
                open={bankModalOpen}
                title="Select Bank Account"
                onCancel={() => {
                    setBankModalOpen(false);
                    setSelectedBank(null);
                }}
                footer={null}
                width={620}
            >
                {bankLoading ? (
                    <Spin />
                ) : (
                    <>
                        {verifiedBanks.length === 0 ? (
                            <Tag color="orange">No verified bank accounts</Tag>
                        ) : (
                            verifiedBanks.map((bank) => {
                                const isSelected = selectedBank?.id === bank.id;

                                return (
                                    <Card
                                        key={bank.id}
                                        hoverable
                                        onClick={() => setSelectedBank(bank)}
                                        style={{
                                            marginBottom: 14,
                                            borderRadius: 12,
                                            border: isSelected
                                                ? "2px solid #22c55e"
                                                : "1px solid #e5e7eb",
                                            background: isSelected ? "#f6ffed" : "#ffffff",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease"
                                        }}
                                    >
                                        <Space
                                            align="start"
                                            style={{ width: "100%", justifyContent: "space-between" }}
                                        >
                                            <div>
                                                {/* NAME */}
                                                <Text strong style={{ fontSize: 15 }}>
                                                    {bank.beneficiary_name}
                                                </Text>

                                                {/* ACCOUNT */}
                                                <div style={{ marginTop: 6 }}>
                                                    <Text type="secondary">
                                                        Account No:{" "}
                                                        <b>{bank.bank_account_number}</b>
                                                    </Text>
                                                </div>

                                                {/* IFSC */}
                                                <Text type="secondary">
                                                    IFSC: <b>{bank.bank_ifsc}</b>
                                                </Text>

                                                {/* PHONE (FROM CUSTOMER) */}
                                                <div style={{ marginTop: 4 }}>
                                                    <Text type="secondary">
                                                        Phone: <b>{activeCustomer?.phone || "—"}</b>
                                                    </Text>
                                                </div>

                                                {/* STATUS */}
                                                <Tag color="green" style={{ marginTop: 6 }}>
                                                    VERIFIED
                                                </Tag>
                                            </div>

                                            {/* GREEN TICK */}
                                            {isSelected && (
                                                <CheckCircleFilled
                                                    style={{
                                                        color: "#22c55e",
                                                        fontSize: 22,
                                                        marginTop: 4
                                                    }}
                                                />
                                            )}
                                        </Space>
                                    </Card>
                                );
                            })

                        )}

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
                            Next
                        </Button>
                    </>
                )}
            </Modal>

        </>
    );
};

export default SelectCustomerSection;
