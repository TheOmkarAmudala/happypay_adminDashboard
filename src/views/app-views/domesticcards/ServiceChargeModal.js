import React, { useState, useEffect, useCallback } from "react";
import { Modal, InputNumber, Button, Typography, Space } from "antd";

const { Text } = Typography;

const PRESET_RATES = [1.4, 2.2, 3];

const ServiceChargeModal = ({
                                open,
                                baseAmount,
                                setBaseAmount,
                                onClose,
                                onApply
                            }) => {
    const [percentage, setPercentage] = useState(1.4);

    useEffect(() => {
        if (open) setPercentage(1.4);
    }, [open]);

    const serviceCharge = (baseAmount * percentage) / 100;
    const settlementAmount = baseAmount - serviceCharge;

    const handleApply = useCallback(() => {
        onApply(Number(settlementAmount.toFixed(2)));
    }, [settlementAmount, onApply]);

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            destroyOnClose
            title="Payment Summary"
        >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div>


                    <InputNumber
                        min={1}
                        value={baseAmount}
                        style={{ width: 200 }}
                        addonAfter="₹"
                        onChange={(v) => {
                            if (v === null) return;
                            setBaseAmount(v);
                        }}
                    />



                </div>

                <div>
                    <Text type="secondary">Customize Service Charge (%)</Text>
                    <InputNumber
                        min={0}
                        step={0.1}
                        value={percentage}
                        style={{ width: "100%", marginTop: 8 }}
                        onChange={(v) => setPercentage(Number(v) || 0)}
                    />
                </div>

                <Space>
                    {PRESET_RATES.map((rate) => (
                        <Button
                            key={rate}
                            type={percentage === rate ? "primary" : "default"}
                            onClick={() => setPercentage(rate)}
                        >
                            {rate}%
                        </Button>
                    ))}
                </Space>

                <div>
                    <Text>Service Charge: </Text>
                    <Text strong>₹{serviceCharge.toFixed(2)}</Text>
                </div>

                <div>
                    <Text strong style={{ color: "green" }}>
                        Settlement Amount: ₹{settlementAmount.toFixed(2)}
                    </Text>
                </div>

                <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" onClick={handleApply}>
                        Apply Changes
                    </Button>
                </Space>
            </Space>
        </Modal>
    );
};

export default ServiceChargeModal;
