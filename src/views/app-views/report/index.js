import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    Table,
    Tag,
    Input,
    Select,
    DatePicker,
    Row,
    Col,
    Statistic,
    Space,
    Grid
} from "antd";
import {
    SearchOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    WalletOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import { useSelector } from "react-redux";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { useBreakpoint } = Grid;

const Report = () => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [searchText, setSearchText] = useState("");
    const [dateRange, setDateRange] = useState(null);

    const token = useSelector(state => state.auth.token);

    /* ================= FETCH ================= */
    useEffect(() => {
        const fetchServiceTransactions = async () => {
            try {
                setLoading(true);
                if (!token) return;

                const res = await axios.get(
                    "https://test.happypay.live/users/serviceTransactions",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const raw = res.data?.data || [];

                const formatted = raw.map((item, index) => {
                    const amount = Number(item.amount || 0);
                    const status = item.status?.toLowerCase() || "failed";

                    return {
                        key: item.id || index,
                        referenceId: item.serviceReferenceId ?? "-",
                        customer: item.accountId ?? "-",
                        gateway: item.provider && item.provider.trim() !== "" ? item.provider : "N/A",
                        paymentType: item.paymentType ?? "wallet",
                        amount,
                        amountDisplay: `₹${amount.toFixed(2)}`,
                        status,
                        timestamp: item.createdAt
                            ? new Date(item.createdAt).getTime()
                            : 0,
                        date: item.createdAt
                            ? dayjs(item.createdAt).format("DD MMM YYYY, hh:mm A")
                            : "-"
                    };
                });

                setTransactions(formatted);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceTransactions();
    }, [token]);

    /* ================= FILTERING ================= */
    const filteredData = useMemo(() => {
        return transactions.filter(tx => {
            if (statusFilter !== "ALL" && tx.status !== statusFilter) return false;
            if (typeFilter !== "ALL" && tx.paymentType !== typeFilter) return false;

            if (searchText) {
                const q = searchText.toLowerCase();
                if (
                    !tx.referenceId.toLowerCase().includes(q) &&
                    !tx.gateway.toLowerCase().includes(q) &&
                    !tx.customer.toLowerCase().includes(q) &&
                    !String(tx.amount).includes(q)
                ) {
                    return false;
                }
            }

            if (dateRange) {
                const [start, end] = dateRange;
                const txDate = dayjs(tx.timestamp);
                if (!txDate.isBetween(start, end, null, "[]")) return false;
            }

            return true;
        });
    }, [transactions, statusFilter, typeFilter, searchText, dateRange]);

    /* ================= TOTALS ================= */
    const totals = useMemo(() => {
        let total = 0, success = 0, pending = 0, failed = 0;

        filteredData.forEach(tx => {
            total += tx.amount;
            if (tx.status === "success") success += tx.amount;
            else if (tx.status === "pending") pending += tx.amount;
            else failed += tx.amount;
        });

        return { total, success, pending, failed };
    }, [filteredData]);

    /* ================= TABLE ================= */
    const columns = [
        { title: "Ref ID", dataIndex: "referenceId", width: 220 },
        { title: "Customer", dataIndex: "customer", width: 160 },

        {
            title: "Amount",
            dataIndex: "amountDisplay",
            width: 140,
            sorter: (a, b) => a.amount - b.amount
        },
        {
            title: "Status",
            dataIndex: "status",
            width: 120,
            render: status => (
                <Tag
                    color={
                        status === "success"
                            ? "green"
                            : status === "pending"
                                ? "orange"
                                : "red"
                    }
                >
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: "Date",
            dataIndex: "date",
            width: 200,
            sorter: (a, b) => a.timestamp - b.timestamp
        },  { title: "Gateway", dataIndex: "gateway", width: 120 }
    ];

    return (
        <Card title="Transaction Reports" bodyStyle={{ padding: 12 }}>
            {/* ===== SUMMARY (EQUAL HEIGHT) ===== */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                <Col xs={12} md={6} style={{ display: "flex" }}>
                    <Card bordered={false} style={{ flex: 1, borderRadius: 12 }}>
                        <Statistic
                            title="Total"
                            value={`₹${Math.round(totals.total)}`}
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
                            value={`₹${Math.round(totals.success)}`}
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
                            value={`₹${Math.round(totals.pending)}`}
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
                            value={`₹${Math.round(totals.failed)}`}
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


            {/* ===== FILTERS (MOBILE FIRST) ===== */}
            <Card
                bordered={false}
                style={{ background: "#fafafa", borderRadius: 12, marginBottom: 16 }}
            >
                <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                >
                    <Input
                        size="small"
                        prefix={<SearchOutlined />}
                        placeholder="Search ref / customer / gateway / amount"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />

                    <Space direction={isMobile ? "vertical" : "horizontal"} style={{ width: "100%" }}>
                        <Select
                            size="large"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ flex: 1 }}
                        >
                            <Option value="ALL">All Status</Option>
                            <Option value="success">Success</Option>
                            <Option value="pending">Pending</Option>
                            <Option value="failed">Failed</Option>
                        </Select>

                        <Select
                            size="large"
                            value={typeFilter}
                            onChange={setTypeFilter}
                            style={{ flex: 1 }}
                        >
                            <Option value="ALL">All Types</Option>
                            <Option value="card">Card</Option>
                            <Option value="upi">UPI</Option>
                            <Option value="wallet">Wallet</Option>
                        </Select>
                    </Space>

                    <RangePicker
                        size="large"
                        style={{ width: "100%" }}
                        onChange={setDateRange}
                        presets={[
                            { label: "This Month", value: [dayjs().startOf("month"), dayjs()] },
                            { label: "Last 30 Days", value: [dayjs().subtract(30, "day"), dayjs()] },
                            { label: "Last 90 Days", value: [dayjs().subtract(90, "day"), dayjs()] }
                        ]}
                    />
                </Space>
            </Card>

            {/* ===== TABLE ===== */}
            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={isMobile ? { x: 900 } : undefined}
                size="small"
            />
        </Card>
    );
};

export default Report;
