import React, { useEffect, useState, useCallback } from "react";
import { Card, Table, Tag, Row, Col, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import PayInStatusChart from "./PayInStatusChart";

const statusColor = {
    success: "green",
    pending: "orange",
    failed: "red"
};

const PayInPage = () => {
    const [loading, setLoading] = useState(false);
    const [payInData, setPayInData] = useState([]);
    const [stats, setStats] = useState({ success: 0, pending: 0, failed: 0 });

    const fetchPayIns = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("AUTH_TOKEN");
            if (!token) return;

            const res = await axios.get(
                "https://test.happypay.live/users/serviceTransactions",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const transactions = res.data?.data || [];

            let summary = { success: 0, pending: 0, failed: 0 };

            const formatted = transactions.map((tx, index) => {
                const status = tx.paymentStatus?.toLowerCase() || "failed";

                summary[status] = (summary[status] || 0) + 1;

                return {
                    key: tx.id || index,
                    sn: index + 1,
                    referenceId: tx.serviceReferenceId || "-",
                    amount: tx.amount
                        ? `₹${Number(tx.amount).toFixed(2)}`
                        : "₹0.00",
                    status,
                    time: tx.createdAt
                        ? new Date(tx.createdAt).toLocaleString()
                        : "-"
                };
            });

            setStats(summary);
            setPayInData(formatted);
        } catch (e) {
            console.error("Failed to fetch pay-ins", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayIns();
    }, [fetchPayIns]);

    const columns = [
        { title: "S/N", dataIndex: "sn", key: "sn", width: 60 },
        { title: "Reference ID", dataIndex: "referenceId", key: "referenceId" },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount"
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={statusColor[status] || "default"}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: "Transaction Time",
            dataIndex: "time",
            key: "time"
        }
    ];

    return (
        <>
            {/* HEADER */}
            <Row justify="space-between" style={{ marginBottom: 16 }}>
                <Col>
                    <h3 style={{ margin: 0 }}>Pay-In Transactions</h3>
                </Col>
                <Col>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchPayIns}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </Col>
            </Row>

            <Row gutter={16}>
                {/* TABLE */}
                <Col xs={24} lg={16}>
                    <Card>
                        <Table
                            columns={columns}
                            dataSource={payInData}
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: true }}
                        />
                    </Card>
                </Col>

                {/* STATUS CHART */}
                <Col xs={24} lg={8}>
                    <PayInStatusChart
                        success={stats.success}
                        pending={stats.pending}
                        failed={stats.failed}
                    />
                </Col>
            </Row>
        </>
    );
};

export default PayInPage;
