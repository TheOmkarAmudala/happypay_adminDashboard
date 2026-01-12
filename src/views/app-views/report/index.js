import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Tag, Input, Select, DatePicker, Row, Col, Skeleton } from "antd";
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

    // 🔍 FILTER LOGIC
    const filteredData = useMemo(() => {
        return transactions.filter((tx) => {
            // 1️⃣ Status filter
            if (
                statusFilter !== "ALL" &&
                tx.transactionStatus?.toLowerCase() !== statusFilter.toLowerCase()
            ) {
                return false;
            }

            // 2️⃣ Type filter (Card / UPI / Wallet)
            if (
                typeFilter !== "ALL" &&
                tx.paymentType?.toLowerCase() !== typeFilter.toLowerCase()
            ) {
                return false;
            }

            // 3️⃣ Search filter
            if (searchText) {
                const search = searchText.toLowerCase();
                const match =
                    tx.serviceTxnRefId?.toLowerCase().includes(search) ||
                    tx.gatewayName?.toLowerCase().includes(search) ||
                    tx.customerDetails?.toLowerCase().includes(search);

                if (!match) return false;
            }

            // 4️⃣ Date filter
            if (dateRange && tx.transactionTime) {
                const txDate = dayjs(tx.transactionTime);
                const [start, end] = dateRange;
                if (!txDate.isBetween(start, end, null, "[]")) return false;
            }

            return true;
        });
    }, [transactions, statusFilter, typeFilter, searchText, dateRange]);

    const columns = [
        { title: "Ref ID", dataIndex: "serviceTxnRefId" },
        { title: "Customer", dataIndex: "customerDetails" },
        { title: "Gateway", dataIndex: "gatewayName" },
        { title: "Amount", dataIndex: "orderAmount" },
        {
            title: "Status",
            dataIndex: "transactionStatus",
            render: (status) => (
                <Tag
                    color={
                        status === "success"
                            ? "green"
                            : status === "pending"
                                ? "orange"
                                : "red"
                    }
                >
                    {status?.toUpperCase()}
                </Tag>
            )
        },
        { title: "Date", dataIndex: "transactionTime" }
    ];

    useEffect(() => {
        const fetchServiceTransactions = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem("AUTH_TOKEN");
                if (!token) return;

                const res = await axios.get(
                    "https://test.happypay.live/users/serviceTransactions",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const raw = res.data?.data || [];

                // 🔄 normalize data for table
                const formatted = raw.map((item, index) => ({
                    key: item.id || index,

                    serviceTxnRefId: item.serviceReferenceId ?? "-",
                    customerDetails: item.accountId ?? "-",
                    gatewayName: item.provider ?? "-",
                    orderAmount: item.amount
                        ? `₹${Number(item.amount).toFixed(2)}`
                        : "-",

                    transactionStatus: item.status ?? "-",

                    paymentType: item.paymentType ?? "wallet",

                    transactionTime: item.createdAt
                        ? dayjs(item.createdAt).format("DD MMM YYYY, hh:mm A")
                        : "-"
                }));

                setTransactions(formatted);
            } catch (err) {
                console.error("Failed to fetch report data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceTransactions();
    }, []);


    return (
        <Card title="Transaction Reports">
            {/* 🔎 FILTER BAR */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
                <Col xs={24} md={6}>
                    <Input
                        placeholder="Search by ID / Provider / User"
                        allowClear
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </Col>

                <Col xs={24} md={4}>
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: "100%" }}
                    >
                        <Option value="ALL">All Status</Option>
                        <Option value="success">Success</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="failed">Failed</Option>
                    </Select>
                </Col>

                <Col xs={24} md={4}>
                    <Select
                        value={typeFilter}
                        onChange={setTypeFilter}
                        style={{ width: "100%" }}
                    >
                        <Option value="ALL">All Types</Option>
                        <Option value="card">Card</Option>
                        <Option value="upi">UPI</Option>
                        <Option value="wallet">Wallet</Option>
                    </Select>
                </Col>

                <Col xs={24} md={6}>
                    <RangePicker
                        style={{ width: "100%" }}
                        onChange={(dates) => setDateRange(dates)}
                        presets={[
                            {
                                label: "This Month",
                                value: [dayjs().startOf("month"), dayjs()]
                            },
                            {
                                label: "Last 30 Days",
                                value: [dayjs().subtract(30, "day"), dayjs()]
                            },
                            {
                                label: "Last 90 Days",
                                value: [dayjs().subtract(90, "day"), dayjs()]
                            }
                        ]}
                    />
                </Col>
            </Row>

            {/* 📊 TABLE */}
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="key"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

        </Card>
    );
};

export default Report;
