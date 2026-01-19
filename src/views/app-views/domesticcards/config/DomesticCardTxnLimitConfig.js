/**
 * Domestic Card Transaction Limits
 * Keyed by Payment Mode Name (normalized match recommended)
 * userLevel is numeric (1–6)
 * Value is MAX TXN LIMIT in INR
 */

export const DOMESTIC_CARD_TXN_LIMIT_CONFIG = {
    "Slpe Silver Prime Edu": {
        1: 50000,
        2: 75000,
        3: 100000,
        4: 150000,
        5: 200000,
        6: 250000,
    },

    "Slpe Silver Edu Lite": {
        1: 50000,
        2: 75000,
        3: 100000,
        4: 150000,
        5: 200000,
        6: 250000,
    },

    "Slpe Silver Edu": {
        1: 30000,
        2: 50000,
        3: 75000,
        4: 100000,
        5: 150000,
        6: 200000,
    },

    /* -------- TRAVEL -------- */

    "Slpe Gold Travel": {
        1: 50000,
        2: 100000,
        3: 150000,
        4: 200000,
        5: 300000,
        6: 500000,
    },

    "Slpe Gold Travel Lite": {
        1: 30000,
        2: 75000,
        3: 100000,
        4: 150000,
        5: 200000,
        6: 300000,
    },

    "Slpe Gold Travel Prime": {
        1: 75000,
        2: 150000,
        3: 200000,
        4: 300000,
        5: 500000,
        6: 1000000,
    },

    "Slpe Gold Travel Pure": {
        1: 75000,
        2: 150000,
        3: 200000,
        4: 300000,
        5: 500000,
        6: 1000000,
    },

    "Slpe Gold Travel Fast": {
        1: 50000,
        2: 100000,
        3: 150000,
        4: 200000,
        5: 300000,
        6: 500000,
    },

    /* -------- OCEAN PAY -------- */

    "Slpe Ocean Pay": {
        1: 50000,
        2: 100000,
        3: 150000,
        4: 200000,
        5: 300000,
        6: 500000,
    },
};
