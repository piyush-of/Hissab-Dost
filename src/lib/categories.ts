export const CATEGORIES = [
  "food",
  "chai_snacks",
  "transport",
  "rent_mess",
  "education",
  "shopping",
  "entertainment",
  "health",
  "recharge_bills",
  "lent_money",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface CategoryMeta {
  id: Category;
  label: string;
  hindiLabel: string;
  icon: string;
  color: string;
}

export const CATEGORY_MAP: Record<Category, CategoryMeta> = {
  food: {
    id: "food",
    label: "Food & Meals",
    hindiLabel: "खाना / Mess / Canteen",
    icon: "🍲",
    color: "#f97316",
  },
  chai_snacks: {
    id: "chai_snacks",
    label: "Chai & Snacks",
    hindiLabel: "चाय, मैगी, नाश्ता",
    icon: "☕",
    color: "#eab308",
  },
  transport: {
    id: "transport",
    label: "Transport",
    hindiLabel: "ऑटो, कैब, मेट्रो",
    icon: "🛺",
    color: "#06b6d4",
  },
  rent_mess: {
    id: "rent_mess",
    label: "Hostel / Mess Fees",
    hindiLabel: "हॉस्टल / मेस फीस",
    icon: "🏠",
    color: "#6366f1",
  },
  education: {
    id: "education",
    label: "Education & Books",
    hindiLabel: "किताबें, ज़ेरॉक्स, स्टेशनरी",
    icon: "📚",
    color: "#3b82f6",
  },
  shopping: {
    id: "shopping",
    label: "Shopping & Clothes",
    hindiLabel: "कपड़े, शॉपिंग, पर्सनल",
    icon: "🛍️",
    color: "#ec4899",
  },
  entertainment: {
    id: "entertainment",
    label: "Outings & Fun",
    hindiLabel: "मूवी, दोस्तों के साथ पार्टी",
    icon: "🎬",
    color: "#a855f7",
  },
  health: {
    id: "health",
    label: "Health & Medical",
    hindiLabel: "दवाइयाँ, डॉक्टर",
    icon: "💊",
    color: "#ef4444",
  },
  recharge_bills: {
    id: "recharge_bills",
    label: "Recharge & Bills",
    hindiLabel: "मोबाइल रिचार्ज, वाईफाई",
    icon: "📱",
    color: "#10b981",
  },
  lent_money: {
    id: "lent_money",
    label: "Lent / Udhaar",
    hindiLabel: "दोस्त को उधार दिया",
    icon: "🤝",
    color: "#84cc16",
  },
  other: {
    id: "other",
    label: "Other Expenses",
    hindiLabel: "अन्य खर्चे",
    icon: "📦",
    color: "#64748b",
  },
};
