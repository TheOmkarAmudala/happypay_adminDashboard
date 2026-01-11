import React, { useEffect, useState } from "react";
import { Card, Table, Tag } from "antd";
import axios from "axios";

const WalletTransactionsPage = () => {
    const [loading, setLoading] = useState(false);
    const [walletData, setWalletData] = useState([]);

    const columns = [
        {
            title: "S/N",
            dataIndex: "sn",
            key: "sn",
            width: 70
        },
        {
            title: "Reference ID",
            dataIndex: "referenceId",
            key: "referenceId"
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount"
        },
        {
            title: "Direction",
            dataIndex: "direction",
            key: "direction",
            render: (value) => (
                <Tag color={value === "DEBIT" ? "red" : "green"}>
                    {value}
                </Tag>
            )
        },
        {
            title: "Transaction Type",
            dataIndex: "transactionType",
            key: "transactionType",
            render: (value) => (
                <Tag color={value === "REFUND" ? "blue" : "purple"}>
                    {value}
                </Tag>
            )
        },
        {
            title: "Service",
            dataIndex: "serviceName",
            key: "serviceName"
        },
        {
            title: "Provider",
            dataIndex: "provider",
            key: "provider"
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "success" ? "green" : "orange"}>
                    {status?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: "Transaction Time",
            dataIndex: "transactionTime",
            key: "transactionTime"
        }
    ];

    useEffect(() => {
        const fetchWalletTransactions = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem("AUTH_TOKEN");
                if (!token) {
                    console.warn("❌ No auth token found");
                    return;
                }

                const response = await axios.get(
                    "https://test.happypay.live/users/walletTransactions",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log("RAW API DATA:", response.data.data);

                const transactions = response.data?.data || [];
                console.log("💰 WALLET TX COUNT:", transactions.length);

                const formatted = transactions.map((tx, index) => {
                    const extra = tx.extraInfo || {};
                    const isDebit = tx.to?.toLowerCase() !== "happy pay";

                    return {
                        key: tx._id,
                        sn: index + 1,
                        referenceId: extra.serviceReferenceId || "-",
                        amount: `₹${tx.amount}`,
                        direction: isDebit ? "DEBIT" : "CREDIT",
                        transactionType: extra.transactionType
                            ? extra.transactionType === "refund"
                                ? "REFUND"
                                : "SERVICE"
                            : "WALLET",

                        serviceName: extra.serviceName || "-",
                        provider: extra.provider || "-",
                        status: tx.status || "-",
                        transactionTime: tx.createdAt
                            ? new Date(tx.createdAt).toLocaleString()
                            : "-"
                    };
                });


                setWalletData(formatted);
            } catch (error) {
                console.error("❌ Failed to fetch wallet transactions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletTransactions();
    }, []);

    return (
        <Card title="Wallet Transactions">
            <Table
                columns={columns}
                dataSource={walletData}
                loading={loading}
                pagination={false}
                locale={{
                    emptyText: "No wallet transactions available"
                }}
                scroll={{ x: true }}
            />
        </Card>
    );
};

export default WalletTransactionsPage;
