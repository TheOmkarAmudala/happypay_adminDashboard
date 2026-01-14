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
    Divider
} from "antd";

const { Option } = Select;

const WalletTransactionsPage = ({ onWalletTotalChange }) => {
    const [loading, setLoading] = useState(false);
    const [walletData, setWalletData] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [directionFilter, setDirectionFilter] = useState("ALL");
    const [directionSort, setDirectionSort] = useState("NONE");

    const [totalCredit, setTotalCredit] = useState(0);
    const [totalDebit, setTotalDebit] = useState(0);

    /* ================= FETCH TRANSACTIONS ================= */
    useEffect(() => {
        const fetchWalletTransactions = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("AUTH_TOKEN");

                const response = await axios.get(
                    "https://test.happypay.live/users/walletTransactions",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const transactions = response.data?.data || [];

                let credit = 0;
                let debit = 0;

                const formatted = transactions.map((tx, index) => {
                    const isDebit = tx.to?.toLowerCase() === "external transfer";
                    const amount = Number(tx.amount);

                    if (isDebit) debit += amount;
                    else credit += amount;

                    return {
                        key: tx._id,
                        sn: index + 1,
                        referenceId: tx.extraInfo?.serviceReferenceId || "-",
                        amount: amount,
                        amountDisplay: `₹${amount.toFixed(2)}`,
                        direction: isDebit ? "DEBIT" : "CREDIT",
                        transactionType: "WALLET",
                        serviceName: tx.description || tx.transactionType || "-",
                        status: tx.status,
                        transactionTime: new Date(tx.createdAt).toLocaleString()
                    };
                });

                setTotalCredit(credit);
                setTotalDebit(debit);
                onWalletTotalChange?.(credit - debit);

                setWalletData(formatted);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletTransactions();
    }, [onWalletTotalChange]);

    /* ================= FILTER + SORT ================= */
    const processedData = useMemo(() => {
        let data = [...walletData];

        // FILTER
        if (directionFilter !== "ALL") {
            data = data.filter(tx => tx.direction === directionFilter);
        }

        // SORT
        if (directionSort === "CREDIT_FIRST") {
            data.sort((a, b) =>
                a.direction === b.direction ? 0 : a.direction === "CREDIT" ? -1 : 1
            );
        }

        if (directionSort === "DEBIT_FIRST") {
            data.sort((a, b) =>
                a.direction === b.direction ? 0 : a.direction === "DEBIT" ? -1 : 1
            );
        }

        return data;
    }, [walletData, directionFilter, directionSort]);

    /* ================= COLUMNS ================= */
    const columns = [
        { title: "S/N", dataIndex: "sn", width: 70 },
        {
            title: "Reference ID",
            dataIndex: "referenceId",
            render: value =>
                value !== "-" ? (
                    <a onClick={() => fetchTransactionDetails(value)}>{value}</a>
                ) : (
                    "-"
                )
        },
        { title: "Amount", dataIndex: "amountDisplay" },
        {
            title: "Direction",
            dataIndex: "direction",
            render: v => <Tag color={v === "DEBIT" ? "red" : "green"}>{v}</Tag>
        },
        {
            title: "Transaction Type",
            dataIndex: "transactionType",
            render: v => <Tag color="purple">{v}</Tag>
        },
        { title: "Service", dataIndex: "serviceName" },
        {
            title: "Status",
            dataIndex: "status",
            render: s => <Tag color="blue">{s?.toUpperCase()}</Tag>
        },
        { title: "Transaction Time", dataIndex: "transactionTime" }
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
    const maskAccount = (acc = "") => {
        if (!acc || acc.length < 4) return "XXXX";
        return `XXXX XXXX ${acc.slice(-4)}`;
    };

    /* ================= UI ================= */
    return (
        <Card title="Wallet Transactions">
            {/* ===== WALLET SUMMARY ===== */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Statistic title="Total Credit" value={`₹${totalCredit.toFixed(2)}`} />
                </Col>
                <Col span={8}>
                    <Statistic title="Total Debit" value={`₹${totalDebit.toFixed(2)}`} />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="Wallet Balance"
                        value={`₹${(totalCredit - totalDebit).toFixed(2)}`}
                        valueStyle={{ color: "#3f8600" }}
                    />
                </Col>
            </Row>

            {/* ===== FILTERS ===== */}
            <Space style={{ marginBottom: 16 }}>
                <Select
                    value={directionFilter}
                    style={{ width: 160 }}
                    onChange={setDirectionFilter}
                >
                    <Option value="ALL">All Transactions</Option>
                    <Option value="CREDIT">Credit Only</Option>
                    <Option value="DEBIT">Debit Only</Option>
                </Select>

                <Select
                    value={directionSort}
                    style={{ width: 180 }}
                    onChange={setDirectionSort}
                >
                    <Option value="NONE">No Sorting</Option>
                    <Option value="CREDIT_FIRST">Credit </Option>
                    <Option value="DEBIT_FIRST">Debit </Option>
                </Select>
            </Space>

            {/* ===== TABLE ===== */}
            <Table
                columns={columns}
                dataSource={processedData}
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* ===== DETAILS MODAL ===== */}
            <Modal
                open={isModalOpen}
                footer={null}
                width={640}
                onCancel={() => setIsModalOpen(false)}
                title={null}
            >
                {detailLoading ? (
                    <Skeleton active />
                ) : (
                    <>
                        {/* ================= HERO ================= */}
                        <div style={{ textAlign: "center", marginBottom: 24 }}>
                            <Tag
                                color={
                                    selectedTx?.paymentStatus === "success"
                                        ? "green"
                                        : "red"
                                }
                                style={{ fontSize: 14, padding: "4px 14px" }}
                            >
                                {selectedTx?.paymentStatus === "success"
                                    ? "✅ Transfer Successful"
                                    : "❌ Transfer Failed"}
                            </Tag>

                            <h1 style={{ margin: "12px 0 4px", fontSize: 30 }}>
                                ₹{selectedTx?.request?.transfer_amount?.toFixed(2)}
                            </h1>

                            <div style={{ color: "#888" }}>
                                {new Date(selectedTx?.createdAt).toLocaleString()}
                            </div>
                        </div>

                        {/* ================= BENEFICIARY ================= */}
                        <Card
                            bordered
                            style={{
                                marginBottom: 16,
                                background: "#fafafa",
                                borderRadius: 10
                            }}
                        >
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                                        {
                                            selectedTx?.extraInfo?.bank_account
                                                ?.beneficiary_name
                                        }
                                    </div>

                                    <div style={{ color: "#666", marginTop: 4 }}>
                                        {selectedTx?.extraInfo?.bank_account?.provider?.toUpperCase() ||
                                            "BANK"}{" "}
                                        •{" "}
                                        {maskAccount(
                                            selectedTx?.extraInfo?.bank_account
                                                ?.bank_account_number
                                        )}
                                    </div>

                                    <div style={{ color: "#888", marginTop: 2 }}>
                                        IFSC:{" "}
                                        {
                                            selectedTx?.extraInfo?.bank_account
                                                ?.bank_ifsc
                                        }
                                    </div>
                                </Col>

                                <Col>
                                    <Tag color="blue">
                                        {selectedTx?.response?.transfer_mode?.toUpperCase() ||
                                            "IMPS"}
                                    </Tag>
                                </Col>
                            </Row>
                        </Card>

                        {/* ================= AMOUNT BREAKDOWN ================= */}
                        <Card
                            bordered
                            size="small"
                            style={{ marginBottom: 16, borderRadius: 10 }}
                        >
                            <Row justify="space-between">
                                <span>Amount</span>
                                <span>₹{selectedTx?.amount?.toFixed(2)}</span>
                            </Row>

                            <Row justify="space-between" style={{ marginTop: 6 }}>
                                <span>Charges</span>
                                <span style={{ color: "#cf1322" }}>
                        - ₹{selectedTx?.transactionCharges?.toFixed(2)}
                    </span>
                            </Row>

                            <Divider style={{ margin: "10px 0" }} />

                            <Row justify="space-between" style={{ fontWeight: 600 }}>
                                <span>Total Sent</span>
                                <span style={{ color: "#3f8600" }}>
                        ₹{selectedTx?.request?.transfer_amount?.toFixed(2)}
                    </span>
                            </Row>
                        </Card>

                        {/* ================= TECHNICAL DETAILS ================= */}
                        <Descriptions
                            bordered
                            size="small"
                            column={1}
                            title="Transaction Details"
                        >
                            <Descriptions.Item label="Reference ID">
                                {selectedTx?.serviceReferenceId}
                            </Descriptions.Item>

                            <Descriptions.Item label="UTR">
                                {selectedTx?.extraInfo?.payout_response?.transferutr || "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Status">
                                <Tag color="green">
                                    {selectedTx?.paymentStatus?.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </>
                )}
            </Modal>

        </Card>
    );
};

export default WalletTransactionsPage;
