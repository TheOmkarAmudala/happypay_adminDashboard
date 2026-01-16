import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    Table,
    Tag,
    Row,
    Col,
    Statistic,
    Input,
    Select,
    Space
} from "antd";
import {
    WalletOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    FilterOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";

const { Option } = Select;

const PayoutPage = () => {
    const token = useSelector(state => state.auth.token);

    const [loading, setLoading] = useState(false);
    const [rawData, setRawData] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("NONE");

    const [amountStats, setAmountStats] = useState({
        total: 0,
        success: 0,
        pending: 0,
        failed: 0
    });

    /* ================= TABLE COLUMNS ================= */
    const columns = [
        { title: "S/N", dataIndex: "sn", width: 60, fixed: "left" },

        { title: "Reference ID", dataIndex: "serviceTxnRefId", width: 220 },

        {
            title: "Amount",
            dataIndex: "payoutAmountDisplay",
            width: 140,
            render: val => (
                <span style={{ fontWeight: 600 }}>{val}</span>
            )
        },

        {
            title: "Status",
            dataIndex: "payoutStatus",
            width: 120,
            render: status => (
                <Tag
                    style={{ borderRadius: 12, padding: "2px 10px" }}
                    color={
                        status === "SUCCESS"
                            ? "green"
                            : status === "PENDING"
                                ? "orange"
                                : "red"
                    }
                >
                    {status}
                </Tag>
            )
        },

        { title: "Beneficiary", dataIndex: "beneficiaryName", width: 200 },
        { title: "Account", dataIndex: "beneficiaryAccount", width: 180 },
        { title: "IFSC", dataIndex: "beneficiaryIfsc", width: 160 },
        { title: "Mode", dataIndex: "transferMode", width: 120 },
        { title: "UTR", dataIndex: "utr", width: 180 },
        { title: "Time", dataIndex: "transactionTime", width: 200 }
    ];

    /* ================= FETCH PAYOUTS ================= */
    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                if (!token) return;
                setLoading(true);

                const res = await axios.get(
                    "https://test.happypay.live/users/serviceTransactions",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const transactions = res.data?.data || [];
                let stats = { total: 0, success: 0, pending: 0, failed: 0 };

                const payouts = transactions
                    .filter(tx =>
                        tx.domainName === "payout" ||
                        tx.paymentType === "payout" ||
                        tx.extraInfo?.payout_response ||
                        tx.callBack === true
                    )
                    .map((tx, index) => {
                        const bank = tx.extraInfo?.bank_account || {};
                        const payout = tx.extraInfo?.payout_response || {};
                        const amount = Number(tx.amount || 0);

                        const status =
                            payout.status?.toUpperCase() ||
                            tx.paymentStatus?.toUpperCase() ||
                            tx.status?.toUpperCase() ||
                            (tx.callBack ? "FAILED" : "PENDING");

                        // stats
                        stats.total += amount;
                        if (status === "SUCCESS") stats.success += amount;
                        else if (status === "PENDING") stats.pending += amount;
                        else stats.failed += amount;

                        return {
                            key: tx.id || index,
                            sn: index + 1,
                            serviceTxnRefId: tx.serviceReferenceId || "-",
                            payoutAmount: amount,
                            payoutAmountDisplay: `₹${amount.toFixed(2)}`,
                            payoutStatus: status,
                            beneficiaryName: bank.beneficiary_name || "-",
                            beneficiaryAccount: bank.bank_account_number || "-",
                            beneficiaryIfsc: bank.bank_ifsc || "-",
                            transferMode:
                                payout.transfermode ||
                                payout.transfer_mode ||
                                "-",
                            utr:
                                payout.transferutr ||
                                payout.transfer_utr ||
                                "-",
                            transactionTime: tx.updatedAt
                                ? new Date(tx.updatedAt).toLocaleString()
                                : "-"
                        };
                    });

                setRawData(payouts);
                setAmountStats(stats);
            } catch (err) {
                console.error("Failed to fetch payout transactions", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPayouts();
    }, [token]);

    /* ================= SEARCH + FILTER + SORT ================= */
    const payoutData = useMemo(() => {
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
            data = data.filter(tx => tx.payoutStatus === statusFilter);
        }

        if (sortBy === "AMOUNT_ASC") {
            data.sort((a, b) => a.payoutAmount - b.payoutAmount);
        }
        if (sortBy === "AMOUNT_DESC") {
            data.sort((a, b) => b.payoutAmount - a.payoutAmount);
        }
        if (sortBy === "TIME_DESC") {
            data.sort(
                (a, b) =>
                    new Date(b.transactionTime) -
                    new Date(a.transactionTime)
            );
        }

        return data;
    }, [rawData, search, statusFilter, sortBy]);

    /* ================= UI ================= */
    return (
        <Card title="PayOut Transactions" bodyStyle={{ padding: 12 }}>
            {/* ===== SUMMARY CARDS ===== */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                <Col xs={12} md={6} style={{ display: "flex" }}>
                    <Card bordered={false} style={{ borderRadius: 12, flex: 1 }}>
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
                        style={{ borderRadius: 12, background: "#f6ffed", flex: 1 }}
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
                        style={{ borderRadius: 12, background: "#fffbe6", flex: 1 }}
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
                        style={{ borderRadius: 12, background: "#fff1f0", flex: 1 }}
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
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Input
                        size="large"
                        prefix={<SearchOutlined />}
                        placeholder="Search reference, amount, UTR, name…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <Space style={{ width: "100%" }}>
                        <Select
                            size="large"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ flex: 1 }}
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="ALL">All Status</Option>
                            <Option value="SUCCESS">Success</Option>
                            <Option value="PENDING">Pending</Option>
                            <Option value="FAILED">Failed</Option>
                        </Select>

                        <Select
                            size="large"
                            value={sortBy}
                            onChange={setSortBy}
                            style={{ flex: 1 }}
                        >
                            <Option value="NONE">No Sorting</Option>
                            <Option value="AMOUNT_ASC">Amount ↑</Option>
                            <Option value="AMOUNT_DESC">Amount ↓</Option>
                            <Option value="TIME_DESC">Newest</Option>
                        </Select>
                    </Space>
                </Space>
            </Card>

            {/* ===== TABLE ===== */}
            <Table
                columns={columns}
                dataSource={payoutData}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1400 }}
                size="small"
            />
        </Card>
    );
};

export default PayoutPage;
