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
    Row,
    Col,
    Grid,
    Input
} from "antd";
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    WalletOutlined,
    SearchOutlined
} from "@ant-design/icons";

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
                        amountDisplay: `₹${Math.round(amount)}`,
                        direction: isDebit ? "DEBIT" : "CREDIT",
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
            width: 120,
            render: v => <strong>{v}</strong>
        },
        {
            title: "Type",
            dataIndex: "direction",
            width: 100,
            render: v => (
                <Tag color={v === "DEBIT" ? "red" : "green"}>{v}</Tag>
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
            {/* ===== SUMMARY (MOBILE CLEAN) ===== */}
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ borderRadius: 12 }}>
                        <Space align="center">
                            <ArrowDownOutlined style={{ fontSize: 20, color: "#3f8600" }} />
                            <div>
                                <div style={{ fontSize: 12, color: "#999" }}>Total Credit</div>
                                <div style={{ fontSize: 18, fontWeight: 600, color: "#3f8600" }}>
                                    ₹{Math.round(totalCredit)}
                                </div>
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ borderRadius: 12 }}>
                        <Space align="center">
                            <ArrowUpOutlined style={{ fontSize: 20, color: "#cf1322" }} />
                            <div>
                                <div style={{ fontSize: 12, color: "#999" }}>Total Debit</div>
                                <div style={{ fontSize: 18, fontWeight: 600, color: "#cf1322" }}>
                                    ₹{Math.round(totalDebit)}
                                </div>
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ borderRadius: 12 }}>
                        <Space align="center">
                            <WalletOutlined style={{ fontSize: 20 }} />
                            <div>
                                <div style={{ fontSize: 12, color: "#999" }}>Balance</div>
                                <div
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color:
                                            totalCredit - totalDebit < 0
                                                ? "#cf1322"
                                                : "#3f8600"
                                    }}
                                >
                                    ₹{Math.round(totalCredit - totalDebit)}
                                </div>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* ===== FILTERS ===== */}
            <Card bordered={false} style={{ background: "#fafafa", borderRadius: 12, marginBottom: 12 }}>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Search reference, amount, status"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <Row gutter={8}>
                        <Col span={12}>
                            <Select
                                value={directionFilter}
                                onChange={setDirectionFilter}
                                style={{ width: "100%" }}
                            >
                                <Option value="ALL">All</Option>
                                <Option value="CREDIT">Credit</Option>
                                <Option value="DEBIT">Debit</Option>
                            </Select>
                        </Col>

                        <Col span={12}>
                            <Select
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
                </Space>
            </Card>

            {/* ===== TABLE ===== */}
            <Table
                columns={columns}
                dataSource={processedData}
                loading={loading}
                pagination={{ pageSize: 8 }}
                scroll={isMobile ? { x: 650 } : undefined}
                size="small"
                onRow={record => ({
                    onClick: () => fetchTransactionDetails(record.referenceId)
                })}
            />

            {/* ===== MODAL ===== */}
            <Modal
                open={isModalOpen}
                footer={null}
                width={isMobile ? "100%" : 600}
                style={isMobile ? { top: 0 } : {}}
                onCancel={() => setIsModalOpen(false)}
            >
                {detailLoading ? (
                    <Skeleton active />
                ) : selectedTx && (
                    <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Reference ID">
                            {selectedTx.serviceReferenceId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Amount">
                            ₹{Math.round(selectedTx.amount || 0)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color="green">
                                {selectedTx.paymentStatus?.toUpperCase()}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </Card>
    );
};

export default WalletTransactionsPage;
