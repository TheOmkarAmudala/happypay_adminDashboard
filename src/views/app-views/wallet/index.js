import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    Card,
    Table,
    Tag,
    Modal,
    Descriptions,
    Skeleton,
    Select,
    Space,
    Statistic,
    Row,
    Col,
    Divider,
    Grid,
    Input,
    Typography
} from "antd";
import WalletTransactionModal from "./Modal";
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    WalletOutlined,
    SearchOutlined,
    FilterOutlined
} from "@ant-design/icons";



const { Text, Title } = Typography;

const { Option } = Select;
const { useBreakpoint } = Grid;

const WalletTransactionsPage = ({ onWalletTotalChange }) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [loading, setLoading] = useState(false);
    const [walletData, setWalletData] = useState([]);
    const [search, setSearch] = useState("");

    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [directionFilter, setDirectionFilter] = useState("ALL");
    const [directionSort, setDirectionSort] = useState("NONE");

    const [totalCredit, setTotalCredit] = useState(0);
    const [totalDebit, setTotalDebit] = useState(0);

    /* ================= FETCH ================= */
    useEffect(() => {
        const fetchWalletTransactions = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("AUTH_TOKEN");

                const res = await axios.get(
                    "https://test.happypay.live/users/walletTransactions",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log(res);

                const txs = res.data?.data || [];

                let credit = 0;
                let debit = 0;

                const formatted = txs.map((tx, index) => {
                    const isDebit = tx.to?.toLowerCase() === "external transfer";
                    const amount = Number(tx.amount || 0);

                    if (isDebit) debit += amount;
                    else credit += amount;

                    return {
                        key: tx._id,
                        sn: index + 1,
                        referenceId: tx.extraInfo?.serviceReferenceId || "-",
                        amount,
                        amountDisplay: `₹${amount.toFixed(2)}`,
                        direction: isDebit ? "DEBIT" : "CREDIT",
                        serviceName: tx.description || tx.transactionType || "-",
                        status: tx.status,
                        transactionTime: new Date(tx.createdAt).toLocaleString()
                    };
                });

                setTotalCredit(credit);
                setTotalDebit(debit);
                onWalletTotalChange?.(credit - debit);
                setWalletData(formatted);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletTransactions();
    }, [onWalletTotalChange]);

    /* ================= FILTER + SEARCH + SORT ================= */
    const processedData = useMemo(() => {
        let data = [...walletData];

        if (search) {
            const q = search.toLowerCase();
            data = data.filter(tx =>
                Object.values(tx).some(v =>
                    String(v).toLowerCase().includes(q)
                )
            );
        }

        if (directionFilter !== "ALL") {
            data = data.filter(tx => tx.direction === directionFilter);
        }

        if (directionSort === "CREDIT_FIRST") {
            data.sort((a, b) => (a.direction === "CREDIT" ? -1 : 1));
        }

        if (directionSort === "DEBIT_FIRST") {
            data.sort((a, b) => (a.direction === "DEBIT" ? -1 : 1));
        }

        return data;
    }, [walletData, search, directionFilter, directionSort]);

    /* ================= TABLE ================= */
    const columns = [
        { title: "S/N", dataIndex: "sn", width: 60 },
        { title: "Reference", dataIndex: "referenceId", width: 220 },
        {
            title: "Amount",
            dataIndex: "amountDisplay",
            width: 140,
            render: v => <strong>{v}</strong>
        },
        {
            title: "Type",
            dataIndex: "direction",
            width: 120,
            render: v => (
                <Tag color={v === "DEBIT" ? "red" : "green"}>
                    {v}
                </Tag>
            )
        },
        {
            title: "Status",
            dataIndex: "status",
            width: 120,
            render: s => <Tag color="blue">{s?.toUpperCase()}</Tag>
        },
        { title: "Time", dataIndex: "transactionTime", width: 200 }
    ];

    /* ================= DETAILS ================= */
    const fetchTransactionDetails = async (referenceId) => {
        try {
            setDetailLoading(true);
            setIsModalOpen(true);
            const token = localStorage.getItem("AUTH_TOKEN");

            const res = await axios.get(
                `https://test.happypay.live/users/serviceTransaction?id=${referenceId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSelectedTx(res.data?.data);
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <Card title="Wallet Transactions" bodyStyle={{ padding: 12 }}>
            {/* ===== SUMMARY (EQUAL HEIGHT) ===== */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                {/* TOTAL TRANSACTIONS */}
                <Col xs={12} md={6} style={{ display: "flex" }}>
                    <Card bordered={false} style={{ flex: 1, borderRadius: 12 }}>
                        <Statistic
                            title="Total"
                            value={`₹${Math.round(totalCredit + totalDebit)}`}
                            prefix={<WalletOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{ fontSize: 18, fontWeight: 600 }}
                        />
                    </Card>
                </Col>

                {/* CREDIT */}
                <Col xs={12} md={6} style={{ display: "flex" }}>
                    <Card
                        bordered={false}
                        style={{
                            flex: 1,
                            borderRadius: 12,
                            background: "#f6ffed"
                        }}
                    >
                        <Statistic
                            title="Credit"
                            value={`₹${Math.round(totalCredit)}`}
                            prefix={<ArrowDownOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#389e0d"
                            }}
                        />
                    </Card>
                </Col>

                {/* DEBIT */}
                <Col xs={12} md={6} style={{ display: "flex" }}>
                    <Card
                        bordered={false}
                        style={{
                            flex: 1,
                            borderRadius: 12,
                            background: "#fff1f0"
                        }}
                    >
                        <Statistic
                            title="Debit"
                            value={`₹${Math.round(totalDebit)}`}
                            prefix={<ArrowUpOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#cf1322"
                            }}
                        />
                    </Card>
                </Col>

                {/* BALANCE */}
                <Col xs={12} md={6} style={{ display: "flex" }}>
                    <Card
                        bordered={false}
                        style={{
                            flex: 1,
                            borderRadius: 12,
                            background: "#e6f4ff"
                        }}
                    >
                        <Statistic
                            title="Balance"
                            value={`₹${Math.round(totalCredit - totalDebit)}`}
                            prefix={<WalletOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#1677ff"
                            }}
                        />
                    </Card>
                </Col>
            </Row>


            {/* ===== FILTERS (MOBILE FIRST) ===== */}
            <Card bordered={false} style={{flex:3, background: "#fafafa", borderRadius: 12, marginBottom: 16 }}>
                <Row gutter={[12, 12]} align="middle">
                    {/* SEARCH */}
                    <Col xs={24} md={10} lg={8}>
                        <Input
                            size="middle"
                            prefix={<SearchOutlined />}
                            placeholder="Search reference, amount, status…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </Col>

                    {/* DIRECTION FILTER */}
                    <Col xs={12} md={5} lg={4}>
                        <Select
                            size="middle"
                            value={directionFilter}
                            onChange={setDirectionFilter}
                            style={{ width: "100%" }}
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="ALL">All</Option>
                            <Option value="CREDIT">Credit</Option>
                            <Option value="DEBIT">Debit</Option>
                        </Select>
                    </Col>

                    {/* SORT */}
                    <Col xs={12} md={5} lg={4}>
                        <Select
                            size="middle"
                            value={directionSort}
                            onChange={setDirectionSort}
                            style={{ width: "100%" }}
                        >
                            <Option value="NONE">No Sorting</Option>
                            <Option value="CREDIT_FIRST">Credit First</Option>
                            <Option value="DEBIT_FIRST">Debit First</Option>
                        </Select>
                    </Col>
                </Row>

            </Card>

            {/* ===== TABLE ===== */}
            <Table
                columns={columns}
                dataSource={processedData}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={isMobile ? { x: 700 } : undefined}
                size="small"
                onRow={(record) => ({
                    onClick: () => fetchTransactionDetails(record.referenceId),
                    style: { cursor: "pointer" }
                })}
            />


            {/* ===== MODAL ===== */}
            {/* ===== MODAL ===== */}
            <WalletTransactionModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                loading={detailLoading}
                transaction={selectedTx}
                isMobile={isMobile}
            />

        </Card>
    );
};

export default WalletTransactionsPage;
