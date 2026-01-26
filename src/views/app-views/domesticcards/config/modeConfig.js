import RazorpayIcon from "../../../../assets/razorpay.svg";
import CashfreeIcon from "../../../../assets/cashfree.png";
import PayUIcon from "../../../../assets/payu.png";

export const MODE_CONFIG = {
    "Slpe Silver Prime EDU": {
        category: "edu",

        icon: PayUIcon
    },
    "Slpe Silver Edu Lite": {
        category: "edu",
        icon: RazorpayIcon,
        iconStyle: {
            width: 28,
            height: 28
        },

    },
    "Slpe Silver Edu": {
        category: "edu",

        icon: CashfreeIcon
    },
    "Slpe Gold Travel": {
        category: "travel",

        icon: PayUIcon
    },
    "Slpe Gold Travel Lite": {
        category: "travel",

        icon: CashfreeIcon
    },
    "Slpe Gold Travel Prime": {
        category: "travel",

        icon: RazorpayIcon
    },
    "Slpe Gold Travel Pure": {
        category: "travel",

        icon: RazorpayIcon
    },
    "SLPE GOLD TARVEL FAST": {
        category: "travel",

        icon: CashfreeIcon
    }
};
