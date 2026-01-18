import React, { useState, useEffect } from "react";
import { Typography } from "antd";
import SlpePaymentModesCards from "./index";
import ServiceChargeModal from "./ServiceChargeModal";
import SelectCustomerSection from "./SelectCustomerSection";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { fetchCustomers } from "store/slices/customerSlice";



const PaymentPage = () => {
    const dispatch = useDispatch();
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedMode, setSelectedMode] = useState(null);
    const [baseAmount, setBaseAmount] = useState(10000);
    const [modalOpen, setModalOpen] = useState(false);
    const { data: customers, loading } = useSelector(
        (state) => state.customers
    );


    const customer = useSelector(state => state.customers.data);

    useEffect(() => {
        if (customers.length === 0) {
            dispatch(fetchCustomers());
        }
    }, [dispatch, customers.length]);

    return (
        <>
            <div style={{ padding: "6px 6px" }}>
            {/* ===== STEP 1: CUSTOMER ===== */}
            <SelectCustomerSection
                customers={customer}
                loading={false}
                selectedCustomer={selectedCustomer}
                onSelect={setSelectedCustomer}
                onChangeCustomer={() => setSelectedCustomer(null)}
            />

            {/* ===== STEP 2: PAYMENT MODE ===== */}
            <SlpePaymentModesCards
                disabled={!selectedCustomer}
                onSelect={(mode) => {
                    setSelectedMode(mode);
                    setModalOpen(true);
                }}
            />

            {/* ===== STEP 3: PAYMENT MODAL ===== */}
            <ServiceChargeModal
                open={modalOpen}
                selectedCustomer={selectedCustomer}
                selectedMode={selectedMode}
                baseAmount={baseAmount}
                setBaseAmount={setBaseAmount}
                onClose={() => setModalOpen(false)}
                onApply={(data) => {
                    console.log("FINAL PAYMENT DATA:", data);
                    setModalOpen(false);
                }}
            />
            </div>
        </>
    );
};

export default PaymentPage;
