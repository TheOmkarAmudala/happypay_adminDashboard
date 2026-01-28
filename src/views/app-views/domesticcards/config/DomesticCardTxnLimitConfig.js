/**
 * Domestic Card Transaction Limits
 * Keyed by Payment Mode Name (normalized match recommended)
 * userLevel is numeric (1–6)
 * Value is MAX TXN LIMIT in INR
 */

export const DOMESTIC_CARD_TXN_LIMIT_CONFIG = {
    "Slpe Silver Prime Edu": {
        id: 3,
        category: "edu",
        maxTxnLimit: 200000,
    },


    "Slpe Silver Edu Lite": {
        id: 8,
        category: "edu",
        maxTxnLimit: 95000,
    },


    "Slpe Silver Edu": {
        id: 11,
        category: "edu",
        maxTxnLimit: 50000,
    },


// ========= TRAVEL =========


    "Slpe Gold Travel": {
        id: 6,
        category: "travel",
        maxTxnLimit: 100000,
    },


    "Slpe Gold Travel Lite": {
        id: 4,
        category: "travel",
        maxTxnLimit: 100000,
    },


    "Slpe Gold Travel Prime": {
        id: 7,
        category: "travel",
        maxTxnLimit: 40000,
    },


    "Slpe Gold Travel Fast": {
        id: 14,
        category: "travel",
        maxTxnLimit: 100000,
    },


    "Slpe Ocean Pay": {
        id: 15,
        category: "travel",
        maxTxnLimit: 100000,
    },
};