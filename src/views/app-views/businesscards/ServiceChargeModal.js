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
import { SERVICE_CHARGE_CONFIG_CONSUMER } from "./config/ServiceChargeConfig";

const { Text } = Typography;

const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 100000;

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

    const [basePercentage, setBasePercentage] = useState(null); // minimum
    const [percentage, setPercentage] = useState(null);         // editable

    /* ===== derive percentage from user level ===== */
    useEffect(() => {
        if (!open || !selectedMode || !userLevel) return;

        const modeConfig = SERVICE_CHARGE_CONFIG_CONSUMER[selectedMode.name];
        if (!modeConfig || !modeConfig[userLevel]) {
            message.error("Pricing not available");
            return;
        }

        const min = modeConfig[userLevel];
        setBasePercentage(min);
        setPercentage(min);
    }, [open, selectedMode, userLevel]);

    if (!open || !selectedCustomer || !selectedMode) return null;

    const presets = basePercentage
        ? [
            { label: "Minimum", value: basePercentage },
            { label: "Preferred", value: 2 },
            { label: "Premium", value: basePercentage + 1 }
        ]
        : [];

    const serviceCharge = (baseAmount * percentage) / 100;
    const impsFee =
        baseAmount < 25000 ? 10 : baseAmount <= 50000 ? 15 : 20;
    const settlementAmount = baseAmount - serviceCharge - impsFee;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={520}
            title="Payment Summary"
        >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>

                {/* Customer */}
                <Card size="small" style={{ background: "#f6ffed" }}>
                    <Text strong>{selectedCustomer.name}</Text>
                    <Text type="secondary"> · {selectedCustomer.phone}</Text>
                </Card>

                {/* Amount */}
                <div>
                    <Text type="secondary">Enter Amount</Text>
                    <InputNumber
                        min={MIN_AMOUNT}
                        max={MAX_AMOUNT}
                        value={baseAmount}
                        addonAfter="₹"
                        style={{ width: "100%", marginTop: 6 }}
                        onChange={(v) => v && setBaseAmount(v)}
                    />
                </div>

                {/* Service Charge */}
                <div>
                    <Text type="secondary">
                        Service Charge (%) (Min {basePercentage}%)
                    </Text>
                    <InputNumber
                        value={percentage}
                        min={basePercentage}
                        step={0.1}
                        style={{ width: "100%", marginTop: 6 }}
                        onChange={(val) => {
                            if (val < basePercentage) {
                                message.warning(
                                    `Minimum allowed is ${basePercentage}%`
                                );
                                setPercentage(basePercentage);
                            } else {
                                setPercentage(val);
                            }
                        }}
                    />

                    <Space wrap style={{ marginTop: 8 }}>
                        {presets.map((p) => (
                            <Tag
                                key={p.label}
                                color={percentage === p.value ? "green" : "default"}
                                style={{ cursor: "pointer", padding: "6px 12px" }}
                                onClick={() => setPercentage(p.value)}
                            >
                                {p.label} · {p.value}%
                            </Tag>
                        ))}
                    </Space>
                </div>

                {/* Breakdown */}
                <Card size="small">
                    <Text>
                        Service Charge: <Text strong>₹{serviceCharge.toFixed(2)}</Text>
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

                {/* Footer */}
                <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type="primary"
                        onClick={() =>
                            onApply({
                                settlementAmount,
                                serviceCharge,
                                impsFee,
                                percentage,
                                customer: selectedCustomer,
                                mode: selectedMode
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
