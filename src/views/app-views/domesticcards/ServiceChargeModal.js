import React, { useEffect, useState } from "react";
import {
    Modal,
    InputNumber,
    Card,
    Button,
    Typography,
    Space,
    Tag,
    message
} from "antd";
import { useSelector } from "react-redux";
import { SERVICE_CHARGE_CONFIG } from "./config/ServiceChargeConfig";

const { Text } = Typography;

const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 100000;

/* ================= NUMBER → WORDS ================= */
const numberToWords = (num) => {
    if (!num) return "";
    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six",
        "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
        "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const inWords = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
        if (n < 100000)
            return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
        return "";
    };

    return `${inWords(num)} Rupees Only`;
};

const ServiceChargeModal = ({
                                open,
                                selectedCustomer,
                                selectedMode,
                                baseAmount,
                                setBaseAmount,
                                onClose,
                                onApply
                            }) => {
    const userLevel = useSelector(
        (state) => state.profile?.data?.userLevel
    );

    const [minPercentage, setMinPercentage] = useState(null);
    const [percentage, setPercentage] = useState(2); // default 2%

    /* ================= INIT PRICING ================= */
    useEffect(() => {
        if (!open || !selectedMode || !userLevel) return;

        const modeConfig = SERVICE_CHARGE_CONFIG[selectedMode.name];
        if (!modeConfig || !modeConfig[userLevel]) {
            message.error("Pricing not available");
            return;
        }

        setMinPercentage(modeConfig[userLevel]);
        setPercentage(2);
    }, [open, selectedMode, userLevel]);

    if (!open || !selectedCustomer || !selectedMode) return null;

    /* ================= AMOUNT VALIDATION ================= */
    const isBelowMin = baseAmount !== null && baseAmount < MIN_AMOUNT;
    const isAboveMax = baseAmount !== null && baseAmount > MAX_AMOUNT;
    const isAmountInvalid = baseAmount === null || isBelowMin || isAboveMax;
    /* ================= CALCULATIONS ================= */
    const serviceCharge = (baseAmount * percentage) / 100;
    const merchantCommission =
        percentage > minPercentage
            ? ((percentage - minPercentage) * baseAmount) / 100
            : 0;

    const impsFee =
        baseAmount < 25000 ? 10 : baseAmount <= 50000 ? 15 : 20;

    const settlementAmount =
        baseAmount - serviceCharge - impsFee;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={560}
            title="Payment Summary"
        >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>

                {/* CUSTOMER */}
                <Card size="small" style={{ background: "#f6ffed" }}>
                    <Text strong>{selectedCustomer.name}</Text>
                    <Text type="secondary"> · {selectedCustomer.phone}</Text>
                </Card>

                {/* AMOUNT */}
                <div>
                    <Text type="secondary">Enter Amount</Text>

                    <InputNumber
                        value={baseAmount}
                        addonAfter="₹"
                        style={{ width: "100%", marginTop: 6 }}
                        status={isAmountInvalid ? "error" : ""}
                        onChange={(v) => {
// 👈 IMPORTANT: allow null while deleting
                            setBaseAmount(v);
                        }}
                    />

                    {/* ERROR MESSAGE */}
                    {isBelowMin && (
                        <Text type="danger" style={{ fontSize: 12 }}>
                            Enter amount greater than ₹{MIN_AMOUNT}
                        </Text>
                    )}
                    {baseAmount === null && (
                        <Text type="danger" style={{ fontSize: 12 }}>
                            Enter amount greater than ₹{MIN_AMOUNT}
                        </Text>
                    )}
                    {isAboveMax && (
                        <Text type="danger" style={{ fontSize: 12 }}>
                            Maximum allowed amount is ₹{MAX_AMOUNT}
                        </Text>
                    )}

                    {!isAmountInvalid && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {numberToWords(baseAmount)}
                        </Text>
                    )}
                </div>

                {/* SERVICE CHARGE */}
                {/* SERVICE CHARGE */}
                <div>
                    <Text type="secondary">
                        Service Charge (%) · Min {minPercentage}%
                    </Text>

                    <InputNumber
                        value={percentage}
                        min={minPercentage}
                        step={0.1}
                        style={{ width: "100%", marginTop: 6 }}
                        onChange={(val) =>
                            val < minPercentage
                                ? setPercentage(minPercentage)
                                : setPercentage(val)
                        }
                    />

                    <Space wrap style={{ marginTop: 10 }}>
                        <Button
                            size="small"
                            type={percentage === minPercentage ? "primary" : "default"}
                            onClick={() => setPercentage(minPercentage)}
                        >
                            Minimum · {minPercentage}%
                        </Button>

                        <Button
                            size="small"
                            type={percentage === 2 ? "primary" : "default"}
                            onClick={() => setPercentage(2)}
                        >
                            Preferred · 2%
                        </Button>

                        <Button
                            size="small"
                            type={percentage === minPercentage + 1 ? "primary" : "default"}
                            onClick={() => setPercentage(minPercentage + 1)}
                        >
                            Premium · {minPercentage + 1}%
                        </Button>
                    </Space>
                </div>
                {/* BREAKDOWN */}
                <Card size="small">
                    <Text>
                        Service Charge: <Text strong>₹{serviceCharge.toFixed(2)}</Text>
                    </Text>
                    <br />

                    <Text>
                        Merchant Commission:{" "}
                        <Text strong style={{ color: "#2563eb" }}>
                            ₹{merchantCommission.toFixed(2)}
                        </Text>
                    </Text>
                    <br />

                    <Text>
                        IMPS Fee: <Text strong>₹{impsFee}</Text>
                    </Text>

                    <div style={{ marginTop: 8, borderTop: "1px dashed #ddd" }}>
                        <Text strong style={{ color: "green" }}>
                            Settlement Amount: ₹{settlementAmount.toFixed(2)}
                        </Text>
                    </div>
                </Card>

                {/* FOOTER */}
                <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type="primary"
                        disabled={isAmountInvalid}
                        onClick={() =>
                            onApply({
                                baseAmount,
                                percentage,
                                serviceCharge,
                                merchantCommission,
                                impsFee,
                                settlementAmount
                            })
                        }
                    >
                        Pay Now
                    </Button>
                </Space>
            </Space>
        </Modal>
    );
};

export default ServiceChargeModal;