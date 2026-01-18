import React, { useState, useEffect, useCallback,   } from "react";
import {
    Modal,
    InputNumber,
    Card,
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
                                selectedCustomer,
                                selectedMode,
                                baseAmount,
                                setBaseAmount,
                                onClose,
                                onApply
                            }) => {
    const userLevel = useSelector(state => state.auth?.data?.userLevel);
    const [percentage, setPercentage] = useState(DEFAULT_PERCENTAGE);

    useEffect(() => {
        if (!open || !selectedMode || !userLevel) return;

        const modeConfig = SERVICE_CHARGE_CONFIG[selectedMode.name];
        if (!modeConfig) return;

        setPercentage(modeConfig[userLevel]);
    }, [open, selectedMode, userLevel]);

    const serviceCharge = (baseAmount * percentage) / 100;
    const impsFee = baseAmount < 25000 ? 10 : baseAmount <= 50000 ? 15 : 20;
    const settlementAmount = baseAmount - serviceCharge - impsFee;
    if (!open || !selectedCustomer || !selectedMode) {
        return null;
    }

    /* ================= UI ================= */
    return (
        <Modal open={open} onCancel={onClose} footer={null} centered>

            {/* ✅ Selected Customer (READ ONLY) */}
            <Card
                style={{
                    background: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: 8,
                    marginBottom: 16
                }}
            >
                <Text strong>{selectedCustomer.name}</Text>
                <Text type="secondary"> · {selectedCustomer.phone}</Text>
            </Card>

            {/* Amount, Charges, Summary (same as you wrote) */}

            <Button
                type="primary"
                onClick={() =>
                    onApply({
                        settlementAmount,
                        serviceCharge,
                        impsFee,
                        customer: selectedCustomer,
                        mode: selectedMode
                    })
                }
            >
                Pay Now
            </Button>
        </Modal>
    );
};

export default ServiceChargeModal;
