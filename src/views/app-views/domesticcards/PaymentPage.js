import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";

import SlpePaymentModesCards from "./index";
import SelectCustomerSection from "./SelectCustomerSection";
import ServiceChargeModal from "./ServiceChargeModal";
import { fetchCustomers } from "store/slices/customerSlice";

const PaymentPage = () => {
    const dispatch = useDispatch();

    const token = useSelector((state) => state.auth.token);
    const { data: customers, loading } = useSelector(
        (state) => state.customers
    );

    const [step, setStep] = useState(1);
    const [selectedMode, setSelectedMode] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);

    const [bankAccounts, setBankAccounts] = useState([]);
    const [bankLoading, setBankLoading] = useState(false);
    const [baseAmount, setBaseAmount] = useState(10000);

    /* ================= FETCH CUSTOMERS ================= */
    useEffect(() => {
        if (!customers.length) {
            dispatch(fetchCustomers());
        }
    }, [dispatch, customers.length]);

    /* ================= FETCH BANKS ================= */
    const fetchCustomerBanks = async (customerId) => {
        if (!customerId || !token) return;

        try {
            setBankLoading(true);
            const res = await fetch(
                `https://test.happypay.live/customer/getAllBankAccounts?customer_id=${customerId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );

            const json = await res.json();
            setBankAccounts(Array.isArray(json?.data) ? json.data : []);
        } catch (err) {
            console.error(err);
            message.error("Failed to fetch bank accounts");
            setBankAccounts([]);
        } finally {
            setBankLoading(false);
        }
    };

    return (
        <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
            {step > 1 && (
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setStep(step - 1)}
                >
                    Back
                </Button>
            )}

            {/* STEP 1 – PAYMENT MODE */}
            {step === 1 && (
                <>
                    <SlpePaymentModesCards
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
                    />

                    <div style={{ textAlign: "right", marginTop: 16 }}>
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

            {/* STEP 2 – CUSTOMER + BANK */}
            {step === 2 && (
                <SelectCustomerSection
                    customers={customers}
                    loading={loading}
                    bankAccounts={bankAccounts}
                    bankLoading={bankLoading}
                    fetchCustomerBanks={fetchCustomerBanks}
                    onSelect={(customer, bank) => {
                        setSelectedCustomer(customer);
                        setSelectedBank(bank);
                        setStep(3);
                    }}
                    onChangeCustomer={() => {
                        setSelectedCustomer(null);
                        setSelectedBank(null);
                        setBankAccounts([]);
                    }}
                />
            )}

            {/* STEP 3 – PAYMENT SUMMARY */}
            <ServiceChargeModal
                open={step === 3}
                selectedCustomer={selectedCustomer}
                selectedMode={selectedMode}
                baseAmount={baseAmount}
                setBaseAmount={setBaseAmount}
                onClose={() => setStep(2)}
                onApply={(data) => {
                    console.log("FINAL PAYMENT DATA:", {
                        ...data,
                        customer: selectedCustomer,
                        bank: selectedBank
                    });
                }}
            />
        </div>
    );
};

export default PaymentPage;