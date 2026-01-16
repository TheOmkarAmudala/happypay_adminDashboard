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
                <Col xs={24} md={8} style={{ display: "flex" }}>
                    <Card bordered={false} style={{ flex: 1, borderRadius: 12 }}>
                        <Statistic
                            title="Total Credit"
                            value={`₹${totalCredit.toFixed(2)}`}
                            valueStyle={{ color: "#3f8600" }}
                            prefix={<ArrowDownOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} md={8} style={{ display: "flex" }}>
                    <Card bordered={false} style={{ flex: 1, borderRadius: 12 }}>
                        <Statistic
                            title="Total Debit"
                            value={`₹${totalDebit.toFixed(2)}`}
                            valueStyle={{ color: "#cf1322" }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} md={8} style={{ display: "flex" }}>
                    <Card bordered={false} style={{ flex: 1, borderRadius: 12 }}>
                        <Statistic
                            title="Balance"
                            value={`₹${(totalCredit - totalDebit).toFixed(2)}`}
                            prefix={<WalletOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* ===== FILTERS (MOBILE FIRST) ===== */}
            <Card bordered={false} style={{ background: "#fafafa", borderRadius: 12, marginBottom: 16 }}>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Input
                        size="large"
                        prefix={<SearchOutlined />}
                        placeholder="Search reference, amount, status…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <Space style={{ width: "100%" }}>
                        <Select
                            size="large"
                            value={directionFilter}
                            onChange={setDirectionFilter}
                            style={{ flex: 1 }}
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="ALL">All</Option>
                            <Option value="CREDIT">Credit</Option>
                            <Option value="DEBIT">Debit</Option>
                        </Select>

                        <Select
                            size="large"
                            value={directionSort}
                            onChange={setDirectionSort}
                            style={{ flex: 1 }}
                        >
                            <Option value="NONE">No Sorting</Option>
                            <Option value="CREDIT_FIRST">Credit First</Option>
                            <Option value="DEBIT_FIRST">Debit First</Option>
                        </Select>
                    </Space>
                </Space>
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
            <Modal
                open={isModalOpen}
                footer={null}
                width={isMobile ? "100%" : 720}
                style={isMobile ? { top: 20 } : {}}
                bodyStyle={{
                    padding: isMobile ? 14 : 24,
                    maxHeight: isMobile ? "85vh" : "none",
                    overflowY: "auto"
                }}
                onCancel={() => setIsModalOpen(false)}
            >
                {detailLoading ? (
                    <Skeleton active />
                ) : (
                    selectedTx && (
                        <div style={{ maxWidth: 560, margin: "0 auto" }}>
                            {/* ===== STATUS ===== */}
                            <div style={{ textAlign: "center", marginBottom: 12 }}>
                                <Tag
                                    color="green"
                                    style={{
                                        padding: "6px 14px",
                                        fontSize: 13,
                                        borderRadius: 20
                                    }}
                                >
                                    ✓ Transfer Successful
                                </Tag>
                            </div>

                            {/* ===== AMOUNT ===== */}
                            <div style={{ textAlign: "center", marginBottom: 12 }}>
                                <div style={{ fontSize: isMobile ? 28 : 34, fontWeight: 600 }}>
                                    ₹{selectedTx.amount?.toFixed(2)}
                                </div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {new Date(selectedTx.createdAt).toLocaleString()}
                                </Text>
                            </div>

                            {/* ===== BENEFICIARY ===== */}
                            <Card
                                size="small"
                                style={{
                                    borderRadius: 12,
                                    marginBottom: 12
                                }}
                            >
                                <Row gutter={[0, 6]}>
                                    <Col span={24}>
                                        <Text strong>
                                            {selectedTx?.extraInfo?.bank_account?.beneficiary_name || "Beneficiary"}
                                        </Text>
                                    </Col>

                                    <Col span={24}>
                                        <Text type="secondary">
                                         Bank Account Number:   XXXX{" "}
                                            {selectedTx?.extraInfo?.bank_account?.bank_account_number?.slice(-4)}
                                        </Text>
                                    </Col>

                                    <Col span={24}>
                                        <Text type="secondary">
                                            IFSC: {selectedTx?.extraInfo?.bank_account?.bank_ifsc || "-"}
                                        </Text>
                                    </Col>

                                    <Col span={24}>
                                        <Tag color="blue" style={{ marginTop: 4 }}>
                                            Bank Transfer
                                        </Tag>
                                    </Col>
                                </Row>
                            </Card>

                            {/* ===== AMOUNT BREAKDOWN ===== */}
                            <Card
                                size="small"
                                style={{
                                    borderRadius: 12,
                                    marginBottom: 16
                                }}
                            >
                                <Row justify="space-between">
                                    <Text>Amount</Text>
                                    <Text>₹{selectedTx.amount?.toFixed(2)}</Text>
                                </Row>

                                <Row justify="space-between" style={{ marginTop: 6 }}>
                                    <Text>Charges</Text>
                                    <Text type="danger">
                                        -₹{selectedTx.chargeAmount?.toFixed(2) || "0.00"}
                                    </Text>
                                </Row>

                                <Divider style={{ margin: "10px 0" }} />

                                <Row justify="space-between">
                                    <Text strong>Total Sent</Text>
                                    <Text strong style={{ color: "#3f8600" }}>
                                        ₹{selectedTx.amount?.toFixed(2)}
                                    </Text>
                                </Row>
                            </Card>

                            {/* ===== DETAILS ===== */}
                            <Title level={5} style={{ marginBottom: 8 }}>
                                Transaction Details
                            </Title>

                            <Descriptions bordered size="small" column={1}>
                                <Descriptions.Item label="Reference ID">
                                    {selectedTx.serviceReferenceId}
                                </Descriptions.Item>

                                <Descriptions.Item label="UTR">
                                    {selectedTx?.extraInfo?.payout_response?.transferutr ||
                                        selectedTx?.response?.transfer_utr ||
                                        "-"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Transfer Mode">
                                    {selectedTx?.extraInfo?.payout_response?.transfermode?.toUpperCase()}
                                </Descriptions.Item>

                                <Descriptions.Item label="Status">
                                    <Tag color="green">
                                        {selectedTx?.extraInfo?.payout_response?.statuscode}
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions> </div>
                    )
                )}
            </Modal>


        </Card>
    );
};

export default WalletTransactionsPage;
