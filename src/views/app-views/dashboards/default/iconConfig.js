import {
    FaWallet,
    FaCreditCard,
    FaBuilding,
    FaCcAmex,
    FaArrowDown,
    FaArrowUp,
} from "react-icons/fa";

import { MdPayments } from "react-icons/md";

/**
 * Icon + color mapping by card title
 */
export const ICON_CONFIG = {
    "Wallet Balance": {
        icon: FaWallet,
        color: "#16a34a", // green
    },

    "Domestic Cards": {
        icon: FaCreditCard,
        color: "#2563eb", // blue
    },

    "Business Cards": {
        icon: FaBuilding,
        color: "#7c3aed", // indigo
    },

    "Amex & Diner Cards": {
        icon: FaCcAmex,
        color: "#0ea5e9", // sky
    },

    "Pay-In": {
        icon: FaArrowDown,
        color: "#22c55e", // green
    },

    "Pay-Out": {
        icon: FaArrowUp,
        color: "#ef4444", // red
    },
};

/**
 * Fallback (important)
 */
export const DEFAULT_ICON = {
    icon: MdPayments,
    color: "#64748b", // slate
};
