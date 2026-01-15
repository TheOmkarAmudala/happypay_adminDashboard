import RazorpayIcon from "../../../assets/razorpay.png";
import CashfreeIcon from "../../../assets/cashfree.png";
import PayUIcon from "../../../assets/payu.png";

export const MODE_CONFIG = {
    "Slpe Silver Prime EDU": {
        category: "edu",
        pg: "PayU",
        icon: PayUIcon
    },
    "Slpe Silver Edu Lite": {
        category: "edu",
        pg: "Razorpay",
        icon: RazorpayIcon
    },
    "Slpe Silver Edu": {
        category: "edu",
        pg: "Cashfree",
        icon: CashfreeIcon
    },
    "Slpe Gold Travel": {
        category: "travel",
        pg: "PayU",
        icon: PayUIcon
    },
    "Slpe Gold Travel Lite": {
        category: "travel",
        pg: "Cashfree",
        icon: CashfreeIcon
    },
    "Slpe Gold Travel Prime": {
        category: "travel",
        pg: "Razorpay",
        icon: RazorpayIcon
    },
    "Slpe Gold Travel Pure": {
        category: "travel",
        pg: "Razorpay",
        icon: RazorpayIcon
    },
    "SLPE GOLD TARVEL FAST": {
        category: "travel",
        pg: "Cashfree",
        icon: CashfreeIcon
    }
};
