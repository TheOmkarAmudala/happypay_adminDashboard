import React, { useState, useMemo } from "react";
import {
    Card,
    Typography,
    Tag,
    Button,
    Row,
    Col,
    Input,
    Space
} from "antd";
import {
    SearchOutlined,
    CheckCircleFilled,
    CloseCircleFilled
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const SelectCustomerSection = ({
                                   customers = [],
                                   loading,
                                   selectedCustomer,
                                   onSelect,
                                   onChangeCustomer
                               }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    /* ================= HELPERS ================= */
    const isKycVerified = (c) =>
        Array.isArray(c?.kyc) && c.kyc.some(k => k.verified === true);

    const filteredCustomers = useMemo(() => {
        const q = search.toLowerCase();
        return customers.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.phone?.includes(q)
        );
    }, [customers, search]);

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
        <div style={{ maxWidth: 960 }}>
            <Title level={5}>Select Customer</Title>

            {/* SEARCH */}
            <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Search name or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 360, marginBottom: 20 }}
            />

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
                                                color: "#ef4444",
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

                                    <Text>{customer.phone}</Text><br />

                                    <div style={{ marginTop: 10 }}>
                                        <Tag color={verified ? "green" : "red"}>
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
