import React, { useState } from "react";
import { Modal, Input, Button, Typography } from "antd";

const { Text } = Typography;

const quickPercents = [1.4, 2.2, 3.0];

const ServiceChargeModal = ({ open, onClose, baseAmount, onApply }) => {
    const [percent, setPercent] = useState(1.4);

    const charge = (baseAmount * percent) / 100;
    const finalAmount = baseAmount - charge;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={350}
        >
            <Text strong>Payment Summary</Text>

            <div style={{ marginTop: 12 }}>
                <Text>Base Amount</Text>
                <div>₹{baseAmount.toFixed(2)}</div>
            </div>

            <div style={{ marginTop: 12 }}>
                <Text>Customize Service Charge (%)</Text>
                <Input
                    value={percent}
                    onChange={(e) => setPercent(Number(e.target.value))}
                    placeholder="Enter %"
                />
            </div>

            <div style={{ marginTop: 10 }}>
                {quickPercents.map((p) => (
                    <Button
                        key={p}
                        size="small"
                        style={{ marginRight: 8 }}
                        onClick={() => setPercent(p)}
                    >
                        {p}%
                    </Button>
                ))}
            </div>

            <div style={{ marginTop: 16 }}>
                <Text>Service Charge: ₹{charge.toFixed(2)}</Text>
                <br />
                <Text strong style={{ color: "green" }}>
                    Settlement Amount: ₹{finalAmount.toFixed(2)}
                </Text>
            </div>

            <div style={{ marginTop: 16, textAlign: "right" }}>
                <Button onClick={onClose} style={{ marginRight: 8 }}>
                    Cancel
                </Button>
                <Button
                    type="primary"
                    onClick={() => {
                        onApply(finalAmount);
                        onClose();
                    }}
                >
                    Apply Changes
                </Button>
            </div>
        </Modal>
    );
};

export default ServiceChargeModal;
