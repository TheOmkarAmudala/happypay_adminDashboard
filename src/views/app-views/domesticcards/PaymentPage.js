import React, { useState, useEffect } from "react";
import { Button, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";

import SlpePaymentModesCards from "./index";
import ServiceChargeModal from "./ServiceChargeModal";
import SelectCustomerSection from "./SelectCustomerSection";
import { fetchCustomers } from "store/slices/customerSlice";

const PaymentPage = () => {
    const dispatch = useDispatch();

    const [step, setStep] = useState(1);
    const [selectedMode, setSelectedMode] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [baseAmount, setBaseAmount] = useState(10000);
    const [modalOpen, setModalOpen] = useState(false);

    // ✅ BANK STATE (FETCHED ONCE)
    const [bankAccounts, setBankAccounts] = useState([]);
    const [bankLoading, setBankLoading] = useState(false);
    const token = useSelector((state) => state.auth.token);

    const { data: customers, loading } = useSelector(
        (state) => state.customers
    );

    // Fetch customers
    useEffect(() => {
        if (customers.length === 0) {
            dispatch(fetchCustomers());
        }
    }, [dispatch, customers.length]);

    // Fetch banks once
    useEffect(() => {
        const fetchBanks = async () => {
            try {
                setBankLoading(true);
                const res = await fetch(
                    "https://test.happypay.live/payout/bankAccounts",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await res.json();
                console.log(data)
                setBankAccounts(Array.isArray(data?.data) ? data.data : []);
            } catch (err) {
                console.error("Bank fetch failed", err);
            } finally {
                setBankLoading(false);
            }
        };

        fetchBanks();
    }, []);

    const [selectedBank, setSelectedBank] = useState(null);


    const handleBack = () => {
        if (step === 2) setStep(1);
        if (step === 3) {
            setModalOpen(false);
            setStep(2);
        }
    };

    return (
        <div style={{ padding: 12 }}>
            {step > 1 && (
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                    style={{ marginBottom: 12 }}
                >
                    Back
                </Button>
            )}

            {/* STEP 1 */}
            {step === 1 && (
                <>
                    <SlpePaymentModesCards
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
                    />

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                        <Button
                            type="primary"
                            disabled={!selectedMode}
                            onClick={() => setStep(2)}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <>
                    <SelectCustomerSection
                        customers={customers}
                        loading={loading}
                        bankAccounts={bankAccounts}
                        bankLoading={bankLoading}
                        selectedCustomer={selectedCustomer}
                        onSelect={(customer, bank) => {
                            setSelectedCustomer(customer);
                            setSelectedBank(bank);
                        }}
                        onChangeCustomer={() => {
                            setSelectedCustomer(null);
                            setSelectedBank(null);
                        }}
                    />
                    <Space style={{ marginTop: 16 }}>
                        <Button onClick={() => setStep(1)}>Back</Button>
                        <Button
                            type="primary"
                            disabled={!selectedCustomer}
                            onClick={() => {
                                setModalOpen(true);
                                setStep(3);
                            }}
                        >
                            Next
                        </Button>
                    </Space>
                </>
            )}

            {/* STEP 3 */}
            <ServiceChargeModal
                open={modalOpen}
                selectedCustomer={selectedCustomer}
                selectedMode={selectedMode}
                baseAmount={baseAmount}
                setBaseAmount={setBaseAmount}
                bankAccounts={bankAccounts}
                bankLoading={bankLoading}
                onClose={() => {
                    setModalOpen(false);
                    setStep(2);
                }}
                onApply={(data) => {
                    console.log("FINAL PAYMENT DATA:", data);
                    setModalOpen(false);
                }}
            />

        </div>
    );
};

export default PaymentPage;
