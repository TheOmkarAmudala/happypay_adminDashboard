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
    Select
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
                                   selectedCustomer,
                                   onSelect,
                                   onChangeCustomer
                               }) => {
    const navigate = useNavigate();

    // UI state
    const [search, setSearch] = useState("");
    const [kycFilter, setKycFilter] = useState("all"); // all | verified | pending
    const [sortOrder, setSortOrder] = useState("new"); // new | old

    /* ================= HELPERS ================= */
    const isKycVerified = (c) =>
        Array.isArray(c?.kyc) && c.kyc.some(k => k.verified === true);

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
            .sort((a, b) => {
                if (sortOrder === "new") {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
    }, [customers, search, kycFilter, sortOrder]);

    /* ================= SELECTED VIEW ================= */
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

    /* ================= LIST VIEW ================= */
    return (
        <div style={{ maxWidth: 1000 }}>
            <Title level={5}>Select Customer</Title>

            {/* ===== CONTROLS (LIKE SCREENSHOT) ===== */}
            <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 20 }}>
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

            {/* ===== LIST ===== */}
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
                                        if (verified) onSelect(customer);
                                        else navigate("/app/apps/customers");
                                    }}
                                    style={{
                                        borderRadius: 16,
                                        position: "relative",
                                        height: "100%",
                                        opacity: verified ? 1 : 0.6
                                    }}
                                >
                                    {/* KYC ICON */}
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

                                    <Title level={5} style={{ marginBottom: 4 }}>
                                        {customer.name}
                                    </Title>

                                    <Text>{customer.phone}</Text>

                                    <div style={{ marginTop: 10 }}>
                                        <Tag color={verified ? "green" : "orange"}>
                                            {verified ? "KYC Verified" : "KYC Pending"}
                                        </Tag>
                                    </div>

                                    {!verified && (
                                        <Button
                                            danger
                                            size="small"
                                            style={{ marginTop: 12 }}
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
    );
};

export default SelectCustomerSection;
