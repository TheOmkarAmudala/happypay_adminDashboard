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
    Space
} from "antd";
import dayjs from "dayjs";
import axios from "axios";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Report = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [searchText, setSearchText] = useState("");
    const [dateRange, setDateRange] = useState(null);

    /* ================= FETCH ================= */
    useEffect(() => {
        const fetchServiceTransactions = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("AUTH_TOKEN");
                if (!token) return;

                const res = await axios.get(
                    "https://test.happypay.live/users/serviceTransactions",
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const raw = res.data?.data || [];

                const formatted = raw.map((item, index) => {
                    const amount = Number(item.amount || 0);
                    const status = item.status?.toLowerCase() || "failed";

                    return {
                        key: item.id || index,
                        referenceId: item.serviceReferenceId ?? "-",
                        customer: item.accountId ?? "-",
                        gateway: item.provider ?? "-",
                        paymentType: item.paymentType ?? "wallet",
                        amount,
                        amountDisplay: `₹${amount.toFixed(2)}`,
                        status,
                        timestamp: item.createdAt ? new Date(item.createdAt).getTime() : 0,
                        date: item.createdAt
                            ? dayjs(item.createdAt).format("DD MMM YYYY, hh:mm A")
                            : "-"
                    };
                });

                setTransactions(formatted);
            } catch (err) {
                console.error("Failed to fetch report data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceTransactions();
    }, []);

    /* ================= FILTERING ================= */
    const filteredData = useMemo(() => {
        return transactions.filter(tx => {
            if (statusFilter !== "ALL" && tx.status !== statusFilter) return false;
            if (typeFilter !== "ALL" && tx.paymentType !== typeFilter) return false;

            if (searchText) {
                const q = searchText.toLowerCase();
                const match =
                    tx.referenceId.toLowerCase().includes(q) ||
                    tx.gateway.toLowerCase().includes(q) ||
                    tx.customer.toLowerCase().includes(q);
                if (!match) return false;
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
        let total = 0,
            success = 0,
            pending = 0,
            failed = 0;

        filteredData.forEach(tx => {
            total += tx.amount;
            if (tx.status === "success") success += tx.amount;
            if (tx.status === "pending") pending += tx.amount;
            if (tx.status === "failed") failed += tx.amount;
        });

        return { total, success, pending, failed };
    }, [filteredData]);

    /* ================= TABLE ================= */
    const columns = [
        { title: "Ref ID", dataIndex: "referenceId" },
        { title: "Customer", dataIndex: "customer" },
        { title: "Gateway", dataIndex: "gateway" },
        {
            title: "Amount",
            dataIndex: "amountDisplay",
            sorter: (a, b) => a.amount - b.amount
        },
        {
            title: "Status",
            dataIndex: "status",
            filters: [
                { text: "Success", value: "success" },
                { text: "Pending", value: "pending" },
                { text: "Failed", value: "failed" }
            ],
            onFilter: (value, record) => record.status === value,
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
            sorter: (a, b) => a.timestamp - b.timestamp
        }
    ];

    return (
        <Card title="Transaction Reports">
            {/* ===== TOTALS ===== */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Statistic title="Total Amount" value={`₹${totals.total.toFixed(2)}`} />
                </Col>
                <Col span={6}>
                    <Statistic title="Success" value={`₹${totals.success.toFixed(2)}`} />
                </Col>
                <Col span={6}>
                    <Statistic title="Pending" value={`₹${totals.pending.toFixed(2)}`} />
                </Col>
                <Col span={6}>
                    <Statistic title="Failed" value={`₹${totals.failed.toFixed(2)}`} />
                </Col>
            </Row>

            {/* ===== FILTER BAR ===== */}
            <Space style={{ marginBottom: 16 }} wrap>
                <Input
                    placeholder="Search ID / Gateway / Customer"
                    allowClear
                    style={{ width: 260 }}
                    onChange={e => setSearchText(e.target.value)}
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
                    value={typeFilter}
                    onChange={setTypeFilter}
                    style={{ width: 160 }}
                >
                    <Option value="ALL">All Types</Option>
                    <Option value="card">Card</Option>
                    <Option value="upi">UPI</Option>
                    <Option value="wallet">Wallet</Option>
                </Select>

                <RangePicker
                    onChange={setDateRange}
                    presets={[
                        { label: "This Month", value: [dayjs().startOf("month"), dayjs()] },
                        { label: "Last 30 Days", value: [dayjs().subtract(30, "day"), dayjs()] },
                        { label: "Last 90 Days", value: [dayjs().subtract(90, "day"), dayjs()] }
                    ]}
                />
            </Space>

            {/* ===== TABLE ===== */}
            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </Card>
    );
};

export default Report;
