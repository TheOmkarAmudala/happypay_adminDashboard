// PAYMENT MODE → ID + TRANSACTION LIMIT CONFIG
// Limits are in INR
// Source: SLPE table reference

export const PAYMENT_MODE_TXN_CONFIG = {
    // ================== EDUCATION ==================

    "Slpe Silver Prime EDU": {
        id: 3,
        category: "edu",
        txnLimit: {
            max: 200000,
        },
    },

    "Slpe Silver Edu Lite": {
        id: 8,
        category: "edu",
        txnLimit: {
            max: 150000,
        },
    },

    "Slpe Silver Edu": {
        id: 11,
        category: "edu",
        txnLimit: {
            max: 50000,
        },
    },

    // ================== TRAVELS ==================

    "Slpe Gold Travel": {
        id: 6,
        category: "travel",
        txnLimit: {
            max: 100000,
        },
    },

    "Slpe Gold Travel Lite": {
        id: 4,
        category: "travel",
        txnLimit: {
            max: 100000,
        },
    },

    "Slpe Gold Travel Prime": {
        id: 7,
        category: "travel",
        txnLimit: {
            max: 40000,
        },
    },

    "Slpe Gold Travel Pure": {
        id: 9,
        category: "travel",
        txnLimit: {
            max: 50000,
        },
    },

    "SLPE GOLD TARVEL FAST": {
        id: 14,
        category: "travel",
        txnLimit: {
            max: 100000,
        },
    },

    "SLPE OCEAN PAY": {
        id: 15,
        category: "travel",
        txnLimit: {
            max: 100000,
        },
    },
};
