import React, { useState, useEffect, useCallback,   } from "react";
import {
    Modal,
    InputNumber,
    Button,
    Typography,
    Space,
    List,
    Tag,
    Spin,
    message,
    Popover
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { SERVICE_CHARGE_CONFIG } from "./ServiceChargeConfig";
import { useSelector } from "react-redux";



const { Text } = Typography;

/* ================= CONSTANTS ================= */
const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 100000;
const DEFAULT_PERCENTAGE = 1.8;

/* ================= COMPONENT ================= */
const ServiceChargeModal = ({
                                open,
                                baseAmount,
                                selectedMode,
                                setBaseAmount,
                                onClose,
                                onApply
                            }) => {
    const [percentage, setPercentage] = useState(DEFAULT_PERCENTAGE);
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const navigate = useNavigate();

    const userLevel = useSelector(
        (state) => state.auth?.data?.userLevel
    );



    /* ================= EFFECTS ================= */
    useEffect(() => {
        if (open) {
            setPercentage(DEFAULT_PERCENTAGE);
            fetchCustomers();
        }
    }, [open]);

    const token = useSelector(state => state.auth.token);


    useEffect(() => {
        if (!open || !selectedMode || !userLevel) return;

        const modeName = selectedMode.name;
        const modeConfig = SERVICE_CHARGE_CONFIG[modeName];

        if (!modeConfig) {
            message.error("Pricing not configured for this mode");
            return;
        }

        const derivedPercentage = modeConfig[userLevel];

        if (!derivedPercentage) {
            message.error("Invalid user level pricing");
            return;
        }

        setPercentage(derivedPercentage);
    }, [open, selectedMode, userLevel]);



    /* ================= API ================= */
    const fetchCustomers = async () => {
        try {
            setLoadingCustomers(true);

            const res = await axios.get(
                "https://test.happypay.live/customer/getAll",
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setCustomers(res.data?.data || []);
        } catch (err) {
            console.error("FETCH CUSTOMERS ERROR:", err);
        } finally {
            setLoadingCustomers(false);
        }
    };

    /* ================= HELPERS ================= */
    const isKycVerified = (customer) =>
        customer?.kyc?.some((k) => k.verified === true);

    const getImpsFee = (amount) => {
        if (amount < 25000) return 10;
        if (amount <= 50000) return 15;
        return 20;
    };

    /* ================= CALCULATIONS ================= */
    const serviceCharge = (baseAmount * percentage) / 100;
    const impsFee = getImpsFee(baseAmount);
    const settlementAmount = baseAmount - serviceCharge - impsFee;

    /* ================= ACTIONS ================= */
    const handleAmountChange = (v) => {
        if (!v) return;

        // HARD CLAMP (no invalid states)
        const value = Math.max(MIN_AMOUNT, Math.min(MAX_AMOUNT, v));
        setBaseAmount(value);
    };

    const handleSelectCustomer = (customer) => {
        if (!isKycVerified(customer)) {
            message.info("Complete KYC to add this customer");
            return;
        }
        setSelectedCustomer(customer);
    };

    const handleApply = useCallback(() => {
        onApply({
            settlementAmount: Number(settlementAmount.toFixed(2)),
            customer: selectedCustomer,
            serviceCharge: Number(serviceCharge.toFixed(2)),
            impsFee
        });
    }, [settlementAmount, selectedCustomer, serviceCharge, impsFee, onApply]);


    const [inputAmount, setInputAmount] = useState(baseAmount);
    const [amountError, setAmountError] = useState("");
    const [showAmountHelp, setShowAmountHelp] = useState(false);

    useEffect(() => {
        if (open) {
            setInputAmount(baseAmount);
            setAmountError("");
        }
    }, [open, baseAmount]);


    const validateAmount = (value) => {
        if (value === null || value === undefined) return "";
        if (value < 10000) return "Minimum amount is ₹10,000";
        if (value > 100000) return "Maximum amount is ₹1,00,000";
        return "";
    };


    /* ================= UI ================= */
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            destroyOnClose
            title="Payment Summary"
            width={600}
        >
            <Space direction="vertical" size={18} style={{ width: "100%" }}>
                {/* ===== Selected Customer ===== */}
                {selectedCustomer && (
                    <div
                        style={{
                            background: "#f6ffed",
                            border: "1px solid #b7eb8f",
                            borderRadius: 8,
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 10
                        }}
                    >
                        <Text strong>{selectedCustomer.name}</Text>
                        <Text type="secondary">• {selectedCustomer.phone}</Text>

                        <Tag color="green" style={{ marginLeft: "auto" }}>
                            KYC
                        </Tag>

                        {/* ❌ Remove customer */}
                        <Button
                            type="text"
                            danger
                            size="small"
                            onClick={() => setSelectedCustomer(null)}
                            style={{ padding: "0 6px" }}
                        >
                            ✕
                        </Button>
                    </div>
                )}

                {/* ===== Amount ===== */}
                <div style={{ marginBottom: 20 }}>
                    <Text
                        type="secondary"
                        style={{ display: "block", marginBottom: 8 }}
                    >
                        Enter Amount
                    </Text>

                    <Popover
                        content={amountError}
                        open={!!amountError && showAmountHelp}
                        placement="topLeft"
                    >
                        <InputNumber
                            value={inputAmount}
                            addonAfter="₹"
                            style={{
                                width: 240,
                                height: 40,
                                borderRadius: 8,
                                borderColor: amountError ? "#ff4d4f" : undefined,
                                animation: amountError ? "shake 0.3s" : "none"
                            }}
                            onChange={(v) => {
                                if (v === null) return;

                                setInputAmount(v);
                                const error = validateAmount(v);
                                setAmountError(error);

                                if (!error) {
                                    setBaseAmount(v);
                                }
                            }}
                            onBlur={() => {
                                if (amountError) {
                                    setInputAmount(baseAmount);
                                    setAmountError("");
                                }
                            }}
                        />
                    </Popover>

                    <div style={{ marginTop: 6 }}>
                        {amountError ? (
                            <Text type="danger" style={{ fontSize: 12 }}>
                                {amountError}
                            </Text>
                        ) : (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Min ₹10,000 · Max ₹1,00,000
                            </Text>
                        )}
                    </div>
                </div>




                {/* ===== Service Charge ===== */}
                <div style={{ marginBottom: 20 }}>
                    <Text
                        type="secondary"
                        style={{ display: "block", marginBottom: 10 }}
                    >
                        Service Charge
                    </Text>

                    <InputNumber
                        value={percentage}
                        disabled
                        addonAfter="%"
                        style={{ width: 120 }}
                    />

                </div>

                {/* ===== Fee Breakdown ===== */}
                <div
                    style={{
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: 12
                    }}
                >
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <Text>
                            Service Charge:{" "}
                            <Text strong>₹{serviceCharge.toFixed(2)}</Text>
                        </Text>
                        <Text>
                            IMPS Fee: <Text strong>₹{impsFee}</Text>
                        </Text>

                        <div
                            style={{
                                borderTop: "1px dashed #ddd",
                                marginTop: 6,
                                paddingTop: 6
                            }}
                        >
                            <Text strong style={{ color: "green" }}>
                                Settlement Amount: ₹{settlementAmount.toFixed(2)}
                            </Text>
                        </div>
                    </Space>
                </div>

                {/* ===== Customers (Progressive) ===== */}
                {/* ===== Customers (Progressive) ===== */}
                {baseAmount >= MIN_AMOUNT && !selectedCustomer && (
                    <>
                        <Text strong>Select Customer</Text>

                        <div
                            style={{
                                maxHeight: 220,
                                overflowY: "auto",
                                border: "1px solid #f0f0f0",
                                borderRadius: 8,
                                padding: 8,
                                display: "flex",
                                flexDirection: "column",
                                gap: 8
                            }}
                        >
                            {loadingCustomers ? (
                                <Spin style={{ padding: 16 }} />
                            ) : (
                                customers.map((item) => {
                                    const kyc = isKycVerified(item);

                                    return (
                                        <div
                                            key={item.id}
                                            style={{
                                                background: "#fff",
                                                border: "1px solid #f0f0f0",
                                                borderRadius: 8,
                                                padding: "10px 12px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10
                                            }}
                                        >
                                            {/* Left: Name + Phone */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <Text strong>{item.name}</Text>
                                                <Text type="secondary">· {item.phone}</Text>
                                            </div>

                                            {/* Middle: KYC Tag */}
                                            <Tag color={kyc ? "green" : "red"}>
                                                {kyc ? "KYC" : "No KYC"}
                                            </Tag>

                                            {/* Right: Action */}
                                            <div style={{ marginLeft: "auto" }}>
                                                <Button
                                                    type="link"
                                                    onClick={() => {
                                                        if (kyc) {
                                                            handleSelectCustomer(item);
                                                        } else {
                                                            navigate("/app/apps/customers");
                                                        }
                                                    }}
                                                >
                                                    {kyc ? "Add" : "Complete KYC →"}
                                                </Button>

                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}


                {/* ===== Footer ===== */}
                <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type="primary"
                        disabled={!selectedCustomer}
                        onClick={handleApply}
                    >
                        Apply Changes
                    </Button>
                </Space>
            </Space>
        </Modal>
    );
};

export default ServiceChargeModal;
