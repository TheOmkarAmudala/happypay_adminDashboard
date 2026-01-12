import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Tag, Modal, Descriptions, Skeleton } from "antd";

const WalletTransactionsPage = ({ onWalletTotalChange }) => {
    const [loading, setLoading] = useState(false);
    const [walletData, setWalletData] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns = [
        { title: "S/N", dataIndex: "sn", key: "sn", width: 70 },
        {
            title: "Reference ID",
            dataIndex: "referenceId",
            key: "referenceId",
            render: (value) =>
                value !== "-" ? (
                    <a onClick={() => fetchTransactionDetails(value)}>
                        {value}
                    </a>
                ) : (
                    "-"
                )
        },
        { title: "Amount", dataIndex: "amount", key: "amount" },
        {
            title: "Direction",
            dataIndex: "direction",
            key: "direction",
            render: (v) => <Tag color={v === "DEBIT" ? "red" : "green"}>{v}</Tag>
        },
        {
            title: "Transaction Type",
            dataIndex: "transactionType",
            key: "transactionType",
            render: (v) => <Tag color="purple">{v}</Tag>
        },
        { title: "Service", dataIndex: "serviceName", key: "serviceName" },
       {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (s) => <Tag color="green">{s?.toUpperCase()}</Tag>
        },
        { title: "Transaction Time", dataIndex: "transactionTime", key: "transactionTime" }
    ];

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

                // ✅ CALCULATE TOTALS HERE
                let totalCredit = 0;
                let totalDebit = 0;

                transactions.forEach((tx) => {
                    const isDebit = tx.to?.toLowerCase() === "external transfer";
                    isDebit
                        ? (totalDebit += Number(tx.amount))
                        : (totalCredit += Number(tx.amount));
                });

                // 👉 send to parent
                onWalletTotalChange?.(totalCredit - totalDebit);

                const formatted = transactions.map((tx, index) => {
                    const isDebit = tx.to?.toLowerCase() === "external transfer";
                    return {
                        key: tx._id,
                        sn: index + 1,
                        referenceId: tx.extraInfo?.serviceReferenceId || "-",
                        amount: `₹${Number(tx.amount).toFixed(2)}`,

                        direction: isDebit ? "DEBIT" : "CREDIT",
                        transactionType: "WALLET",
                        serviceName: tx.description || tx.transactionType || "-",

                        status: tx.status,
                        transactionTime: new Date(tx.createdAt).toLocaleString()
                    };
                });

                setWalletData(formatted);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletTransactions();
    }, [onWalletTotalChange]);

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
        <Card title="Wallet Transactions">
            <Table columns={columns} dataSource={walletData} loading={loading} />

            <Modal open={isModalOpen} footer={null} onCancel={() => setIsModalOpen(false)}>
                {detailLoading ? (
                    <Skeleton active />
                ) : (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="UTR">
                            {selectedTx?.response?.transfer_utr ||
                                selectedTx?.extraInfo?.payout_response?.transferutr ||
                                "-"}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </Card>
    );
};

export default WalletTransactionsPage;
