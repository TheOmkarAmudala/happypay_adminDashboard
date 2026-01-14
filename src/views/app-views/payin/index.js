import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Card,
    Table,
    Tag,
    Row,
    Col,
    Button,
    Select,
    Input,
    Statistic,
    Space
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import PayInStatusChart from "./PayInStatusChart";

const { Option } = Select;

const statusColor = {
    success: "green",
    pending: "orange",
    failed: "red"
};

const PayInPage = () => {
    const [loading, setLoading] = useState(false);
    const [payInData, setPayInData] = useState([]);
    const [rawData, setRawData] = useState([]);

    const [stats, setStats] = useState({
        success: 0,
        pending: 0,
        failed: 0
    });

    const [amountStats, setAmountStats] = useState({
        total: 0,
        success: 0,
        pending: 0,
        failed: 0
    });

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("NONE");
    const [search, setSearch] = useState("");

    /* ================= FETCH PAYINS ================= */
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

            let countStats = { success: 0, pending: 0, failed: 0 };
            let amtStats = { total: 0, success: 0, pending: 0, failed: 0 };

            const formatted = transactions.map((tx, index) => {
                const status = tx.paymentStatus?.toLowerCase() || "failed";
                const amount = Number(tx.amount || 0);

                countStats[status] = (countStats[status] || 0) + 1;
                amtStats[status] = (amtStats[status] || 0) + amount;
                amtStats.total += amount;

                return {
                    key: tx.id || index,
                    sn: index + 1,
                    referenceId: tx.serviceReferenceId || "-",
                    amount,
                    amountDisplay: `₹${amount.toFixed(2)}`,
                    status,
                    time: tx.createdAt
                        ? new Date(tx.createdAt).toLocaleString()
                        : "-",
                    timestamp: tx.createdAt ? new Date(tx.createdAt).getTime() : 0
                };
            });

            setStats(countStats);
            setAmountStats(amtStats);
            setRawData(formatted);
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

    /* ================= FILTER + SORT + SEARCH ================= */
    const processedData = useMemo(() => {
        let data = [...rawData];

        // SEARCH
        if (search) {
            data = data.filter(tx =>
                tx.referenceId.toLowerCase().includes(search.toLowerCase())
            );
        }

        // FILTER
        if (statusFilter !== "ALL") {
            data = data.filter(tx => tx.status === statusFilter);
        }

        // SORT
        if (sortBy === "AMOUNT_ASC") {
            data.sort((a, b) => a.amount - b.amount);
        }
        if (sortBy === "AMOUNT_DESC") {
            data.sort((a, b) => b.amount - a.amount);
        }
        if (sortBy === "TIME_ASC") {
            data.sort((a, b) => a.timestamp - b.timestamp);
        }
        if (sortBy === "TIME_DESC") {
            data.sort((a, b) => b.timestamp - a.timestamp);
        }

        return data;
    }, [rawData, search, statusFilter, sortBy]);

    /* ================= TABLE ================= */
    const columns = [
        { title: "S/N", dataIndex: "sn", width: 60 },
        { title: "Reference ID", dataIndex: "referenceId" },
        { title: "Amount", dataIndex: "amountDisplay" },
        {
            title: "Status",
            dataIndex: "status",
            render: status => (
                <Tag color={statusColor[status] || "default"}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        { title: "Transaction Time", dataIndex: "time" }
    ];

    return (
        <>
            {/* HEADER */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
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

            {/* SUMMARY */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Statistic title="Total Amount" value={`₹${amountStats.total.toFixed(2)}`} />
                </Col>
                <Col span={6}>
                    <Statistic title="Success Amount" value={`₹${amountStats.success.toFixed(2)}`} />
                </Col>
                <Col span={6}>
                    <Statistic title="Pending Amount" value={`₹${amountStats.pending.toFixed(2)}`} />
                </Col>
                <Col span={6}>
                    <Statistic title="Failed Amount" value={`₹${amountStats.failed.toFixed(2)}`} />
                </Col>
            </Row>

            {/* FILTERS */}
            <Space style={{ marginBottom: 16 }} wrap>
                <Input
                    placeholder="Search Reference ID"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: 220 }}
                />

                <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 160 }}
                >
                    <Option value="ALL">All Status</Option>
                    <Option value="success">Success</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="failed">Failed</Option>
                </Select>

                <Select
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ width: 180 }}
                >
                    <Option value="NONE">No Sorting</Option>
                    <Option value="AMOUNT_ASC">Amount ↑</Option>
                    <Option value="AMOUNT_DESC">Amount ↓</Option>
                    <Option value="TIME_ASC">Oldest First</Option>
                    <Option value="TIME_DESC">Newest First</Option>
                </Select>
            </Space>

            <Row gutter={16}>
                {/* TABLE */}
                <Col xs={24} lg={16}>
                    <Card>
                        <Table
                            columns={columns}
                            dataSource={processedData}
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
