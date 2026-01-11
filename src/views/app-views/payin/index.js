import React, { useEffect, useState, useCallback } from "react";
import { Card, Table, Tag, Row, Col, Statistic, Typography, Space, Button, Tooltip } from "antd";
import { ReloadOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, WalletOutlined } from "@ant-design/icons";
import axios from "axios";
import PayInStatusChart from "./PayInStatusChart";

const { Text, Title } = Typography;

// --- CONFIG & CONSTANTS ---
const STATUS_MAP = {
    success: { color: "green", icon: <CheckCircleOutlined /> },
    pending: { color: "orange", icon: <SyncOutlined spin /> },
    failed: { color: "red", icon: <CloseCircleOutlined /> },
};

const columns = [
    { title: "S/N", dataIndex: "sn", key: "sn", width: 60, align: 'center' },
    {
        title: "Reference ID",
        dataIndex: "serviceTxnRefId",
        key: "serviceTxnRefId",
        render: (text) => <Text copyable={{ tooltips: false }} code>{text}</Text>
    },
    {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: (val) => <Text strong style={{ color: '#1890ff' }}>{val}</Text>
    },
    {
        title: "Status",
        dataIndex: "paymentStatus",
        key: "paymentStatus",
        render: (status) => {
            const config = STATUS_MAP[status?.toLowerCase()] || { color: "default" };
            return (
                <Tag icon={config.icon} color={config.color} style={{ borderRadius: 12, padding: '0 10px' }}>
                    {status?.toUpperCase()}
                </Tag>
            );
        }
    },
    {
        title: "Time",
        dataIndex: "transactionTime",
        key: "transactionTime",
        render: (time) => <Text type="secondary" style={{ fontSize: '12px' }}>{time}</Text>
    }
];

const PayInPage = () => {
    const [loading, setLoading] = useState(false);
    const [payInData, setPayInData] = useState([]);
    const [stats, setStats] = useState({ totalAmount: 0, success: 0, pending: 0, failed: 0 });

    const fetchPayIns = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("AUTH_TOKEN");
            if (!token) return;

            const response = await axios.get("https://test.happypay.live/users/serviceTransactions", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const transactions = response.data?.data || [];

            // Data Processing
            let summary = { totalAmount: 0, success: 0, pending: 0, failed: 0 };

            const formattedData = transactions.map((tx, index) => {
                const s = tx.paymentStatus?.toLowerCase();
                if (s === "success") {
                    summary.success++;
                    summary.totalAmount += Number(tx.amount || 0);
                } else if (s === "pending") summary.pending++;
                else summary.failed++;

                return {
                    key: tx.id || index,
                    sn: index + 1,
                    serviceTxnRefId: tx.serviceReferenceId || "-",
                    amount: tx.amount ? `₹${Number(tx.amount).toLocaleString('en-IN')}` : "₹0",
                    paymentStatus: tx.paymentStatus || "unknown",
                    transactionTime: tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : "-"
                };
            });

            setStats(summary);
            setPayInData(formattedData);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPayIns(); }, [fetchPayIns]);

    return (
        <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
            {/* HEADER SECTION */}
            <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>PayIn Dashboard</Title>
                    <Text type="secondary">Monitor and manage your incoming transactions</Text>
                </Col>
                <Col>
                    <Button type="primary" icon={<ReloadOutlined />} onClick={fetchPayIns} loading={loading}>
                        Refresh Data
                    </Button>
                </Col>
            </Row>

            {/* TOP STATS CARDS */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        <Statistic title="Total Success Volume" value={stats.totalAmount} precision={2} prefix={<WalletOutlined style={{color: '#52c41a'}}/>} suffix="INR" />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        <Statistic title="Successful" value={stats.success} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        <Statistic title="Pending" value={stats.pending} valueStyle={{ color: '#faad14' }} prefix={<SyncOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        <Statistic title="Failed" value={stats.failed} valueStyle={{ color: '#cf1322' }} prefix={<CloseCircleOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* TABLE SECTION */}
                <Col xs={24} lg={16}>
                    <Card
                        title="Pay-In Transactions"
                        bordered={false}
                        bodyStyle={{ padding: 0 }}
                        extra={<a href="#">View All</a>}
                    >
                        <Table
                            columns={columns}
                            dataSource={payInData}
                            loading={loading}
                            pagination={{ pageSize: 8 }}
                            scroll={{ x: 800 }}
                        />
                    </Card>
                </Col>

                {/* CHART SECTION */}

            </Row>
        </div>
    );
};

export default PayInPage;