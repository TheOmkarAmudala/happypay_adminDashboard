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
import PayInTransactionModal from "./PayInTransactionModal";


import {
    ReloadOutlined,
    WalletOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    FilterOutlined
} from "@ant-design/icons";
import axios from "axios";
import PayInStatusChart from "./PayInStatusChart";
import { useSelector } from "react-redux";

const { Option } = Select;

const statusColor = {
    success: "green",
    pending: "orange",
    failed: "red"
};


const PayInPage = () => {
    const token = useSelector(state => state.auth.token);

    const [loading, setLoading] = useState(false);
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
    const [modalOpen, setModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);

    const fetchPayInDetails = async (referenceId) => {
        try {
            setDetailLoading(true);
            setModalOpen(true);

            const res = await axios.get(
                `https://test.happypay.live/users/serviceTransaction?id=${referenceId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Transaction details:", res.data);
            setSelectedTx(res.data?.data);
        } catch (e) {
            console.error("Failed to fetch transaction details", e);
        } finally {
            setDetailLoading(false);
        }
    };

    /* ================= FETCH PAYINS ================= */
    const fetchPayIns = useCallback(async () => {
        try {
            if (!token) return;
            setLoading(true);

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
                    timestamp: tx.createdAt
                        ? new Date(tx.createdAt).getTime()
                        : 0
                };
            });

            setStats(countStats);
            setAmountStats(amtStats);
            setRawData(formatted);
        } catch (e) {
            console.error("Failed to fetch pay-ins", e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPayIns();
    }, [fetchPayIns]);

    /* ================= SEARCH + FILTER + SORT ================= */
    const processedData = useMemo(() => {
        let data = [...rawData];

        if (search) {
            const q = search.toLowerCase();
            data = data.filter(tx =>
                Object.values(tx).some(val =>
                    String(val).toLowerCase().includes(q)
                )
            );
        }

        if (statusFilter !== "ALL") {
            data = data.filter(tx => tx.status === statusFilter);
        }

        if (sortBy === "AMOUNT_ASC") {
            data.sort((a, b) => a.amount - b.amount);
        }
        if (sortBy === "AMOUNT_DESC") {
            data.sort((a, b) => b.amount - a.amount);
        }
        if (sortBy === "TIME_DESC") {
            data.sort((a, b) => b.timestamp - a.timestamp);
        }

        return data;
    }, [rawData, search, statusFilter, sortBy]);

    /* ================= TABLE ================= */
    const columns = [
        { title: "S/N", dataIndex: "sn", width: 60 },
        { title: "Reference ID", dataIndex: "referenceId", width: 220 },
        {
            title: "Amount",
            dataIndex: "amountDisplay",
            width: 140,
            render: val => <strong>{val}</strong>
        },
        {
            title: "Status",
            dataIndex: "status",
            width: 120,
            render: status => (
                <Tag
                    style={{ borderRadius: 12, padding: "2px 10px" }}
                    color={statusColor[status]}
                >
                    {status.toUpperCase()}
                </Tag>
            )
        },
        { title: "Transaction Time", dataIndex: "time", width: 200 }
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

            {/* ===== SUMMARY (EQUAL HEIGHT) ===== */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                <Col xs={12} md={6} style={{ display: "flex" }}>
                    <Card bordered={false} style={{ flex: 1, borderRadius: 12 }}>
                        <Statistic
                            title="Total"
                            value={`₹${Math.round(amountStats.total)}`}
                            prefix={<WalletOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{ fontSize: 18, fontWeight: 600 }}
                        />
                    </Card>
                </Col>

                <Col xs={12} md={6} style={{ display: "flex" }}>
                    <Card
                        bordered={false}
                        style={{ flex: 1, borderRadius: 12, background: "#f6ffed" }}
                    >
                        <Statistic
                            title="Success"
                            value={`₹${Math.round(amountStats.success)}`}
                            prefix={<CheckCircleOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#389e0d"
                            }}
                        />
                    </Card>
                </Col>

                <Col xs={12} md={6} style={{ display: "flex" }}>
                    <Card
                        bordered={false}
                        style={{ flex: 1, borderRadius: 12, background: "#fffbe6" }}
                    >
                        <Statistic
                            title="Pending"
                            value={`₹${Math.round(amountStats.pending)}`}
                            prefix={<ClockCircleOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#d48806"
                            }}
                        />
                    </Card>
                </Col>

                <Col xs={12} md={6} style={{ display: "flex" }}>
                    <Card
                        bordered={false}
                        style={{ flex: 1, borderRadius: 12, background: "#fff1f0" }}
                    >
                        <Statistic
                            title="Failed"
                            value={`₹${Math.round(amountStats.failed)}`}
                            prefix={<CloseCircleOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#cf1322"
                            }}
                        />
                    </Card>
                </Col>
            </Row>


            {/* ===== FILTERS ===== */}
            <Card bordered={false} style={{ borderRadius: 12, background: "#fafafa", marginBottom: 16 }}>
                <Row gutter={[12, 12]} align="middle">
                    {/* SEARCH */}
                    <Col xs={24} md={12} lg={10}>
                        <Input
                            size="large"
                            prefix={<SearchOutlined />}
                            placeholder="Search reference, amount, UTR, name…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </Col>

                    {/* STATUS FILTER */}
                    <Col xs={12} md={6} lg={7}>
                        <Select
                            size="large"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: "100%" }}
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="ALL">All Status</Option>
                            <Option value="SUCCESS">Success</Option>
                            <Option value="PENDING">Pending</Option>
                            <Option value="FAILED">Failed</Option>
                        </Select>
                    </Col>

                    {/* SORT */}
                    <Col xs={12} md={6} lg={7}>
                        <Select
                            size="large"
                            value={sortBy}
                            onChange={setSortBy}
                            style={{ width: "100%" }}
                        >
                            <Option value="NONE">No Sorting</Option>
                            <Option value="AMOUNT_ASC">Amount ↑</Option>
                            <Option value="AMOUNT_DESC">Amount ↓</Option>
                            <Option value="TIME_DESC">Newest</Option>
                        </Select>
                    </Col>
                </Row>

            </Card>

            {/* ===== CONTENT ===== */}
            <Row gutter={16}>
                <Col xs={24} lg={16}>
                    <Card>
                        <Table
                            columns={columns}
                            dataSource={processedData}
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 700 }}
                            size="small"
                            onRow={(record) => ({
                                onClick: () => fetchPayInDetails(record.referenceId),
                                style: { cursor: "pointer" }
                            })}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <PayInStatusChart
                        success={stats.success}
                        pending={stats.pending}
                        failed={stats.failed}
                    />
                </Col>
            </Row>

            <PayInTransactionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                loading={detailLoading}
                transaction={selectedTx}
            />
        </>
    );
};

export default PayInPage;
