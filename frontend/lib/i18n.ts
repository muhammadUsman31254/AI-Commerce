export type Lang = "en" | "ur";

export const translations = {
  en: {
    // Nav
    nav_dashboard: "Dashboard",
    nav_products: "Products",
    nav_orders: "Orders",
    nav_inventory: "Inventory",
    nav_analytics: "Analytics",
    logged_in_as: "Logged in as",

    // Topbar
    sign_out: "Sign out",

    // Dashboard
    dashboard_title: "Dashboard",
    welcome_back: "Welcome back, Clay & Craft",
    total_revenue: "Total Revenue",
    total_orders: "Total Orders",
    active_products: "Active Products",
    low_stock_alerts: "Low Stock Alerts",
    quick_actions: "Quick Actions",
    add_product: "+ Add Product",
    view_orders: "View Orders",
    check_analytics: "Check Analytics",

    // Recent Orders component
    recent_orders: "Recent Orders",
    view_all: "View all",
    no_orders_yet: "No orders yet.",

    // Low Stock component
    low_stock: "Low Stock",
    manage: "Manage",
    all_products_stocked: "All products stocked.",
    left: "left",

    // Products page
    products_title: "Products",
    manage_catalogue: "Manage your store catalogue",
    search_products: "Search products…",
    col_product: "Product",
    col_category: "Category",
    col_price: "Price",
    col_stock: "Stock",
    col_status: "Status",
    col_actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    no_products_found: "No products yet. Add your first product.",
    no_search_results: "No products match your search.",

    // Add / Edit product
    add_product_title: "Add Product",
    add_product_subtitle: "List a new item in your store",
    edit_product_title: "Edit Product",
    edit_product_subtitle: "Update product details",

    // Orders page
    orders_title: "Orders",
    manage_orders: "Manage and track customer orders",
    col_order_id: "Order ID",
    col_buyer: "Buyer",
    col_items: "Items",
    col_total: "Total",
    col_date: "Date",
    tab_all: "all",
    no_orders_found: "No orders found.",

    // Inventory page
    inventory_title: "Inventory",
    monitor_stock: "Monitor and update stock levels",
    total_products: "Total Products",
    low_stock_count: "Low Stock (< 5)",
    out_of_stock: "Out of Stock",
    col_stock_level: "Stock Level",
    col_update_stock: "Update Stock",
    save: "Save",
    no_products: "No products found.",
    out_of_stock_badge: "Out of stock",
    low_badge: "Low",

    // Analytics page
    analytics_title: "Analytics",
    sales_performance: "Sales performance and AI insights",
    period_today: "Today",
    period_week: "This Week",
    period_month: "This Month",
    avg_order_value: "Avg. Order Value",
    revenue_chart_title: "Revenue",
    orders_by_status: "Orders by Status",
    top_selling: "Top Selling Products",
    ai_insight_label: "AI Insight",
    loading_analytics: "Loading analytics…",
    failed_analytics: "Failed to load analytics.",

    // Auth — Login
    sign_in_subtitle: "Sign in to your seller dashboard",
    welcome_back_heading: "Welcome back",
    email: "Email",
    password: "Password",
    signing_in: "Signing in…",
    sign_in: "Sign in",
    no_account: "Don't have an account?",
    create_store: "Create store",

    // Auth — Register
    create_account_subtitle: "Create your seller account",
    setup_store: "Set up your store",
    full_name: "Full Name",
    store_name: "Store Name",
    phone: "Phone",
    creating_account: "Creating account…",
    create_account: "Create account",
    already_account: "Already have an account?",
    min_chars: "Min. 8 characters",

    // Voice modal
    voice_assistant: "AI Voice Assistant",
    voice_subtitle: "بولیں — Urdu یا Roman Urdu میں",

    // Chat panel
    chat_title: "AI Assistant",
    chat_placeholder: "Type a message…",
    chat_send: "Send",
    chat_thinking: "Thinking…",
    chat_empty: "Ask me anything about your store.",
    chat_error: "Something went wrong. Try again.",
    chat_you: "You",
    chat_ai: "AI",

    // Generic
    loading: "Loading…",
  },

  ur: {
    // Nav
    nav_dashboard: "ڈیش بورڈ",
    nav_products: "مصنوعات",
    nav_orders: "آرڈرز",
    nav_inventory: "انوینٹری",
    nav_analytics: "تجزیات",
    logged_in_as: "لاگ ان ہیں بطور",

    // Topbar
    sign_out: "سائن آؤٹ",

    // Dashboard
    dashboard_title: "ڈیش بورڈ",
    welcome_back: "خوش آمدید، کلے اینڈ کرافٹ",
    total_revenue: "کل آمدنی",
    total_orders: "کل آرڈرز",
    active_products: "فعال مصنوعات",
    low_stock_alerts: "کم اسٹاک الرٹس",
    quick_actions: "فوری اقدامات",
    add_product: "+ مصنوع شامل کریں",
    view_orders: "آرڈرز دیکھیں",
    check_analytics: "تجزیات چیک کریں",

    // Recent Orders component
    recent_orders: "حالیہ آرڈرز",
    view_all: "سب دیکھیں",
    no_orders_yet: "ابھی کوئی آرڈر نہیں۔",

    // Low Stock component
    low_stock: "کم اسٹاک",
    manage: "منظم کریں",
    all_products_stocked: "تمام مصنوعات موجود ہیں۔",
    left: "باقی",

    // Products page
    products_title: "مصنوعات",
    manage_catalogue: "اپنے اسٹور کی فہرست منظم کریں",
    search_products: "مصنوعات تلاش کریں…",
    col_product: "مصنوع",
    col_category: "زمرہ",
    col_price: "قیمت",
    col_stock: "اسٹاک",
    col_status: "حیثیت",
    col_actions: "اقدامات",
    edit: "ترمیم",
    delete: "حذف کریں",
    no_products_found: "ابھی کوئی مصنوع نہیں۔ پہلی مصنوع شامل کریں۔",
    no_search_results: "تلاش سے کوئی مصنوع نہیں ملی۔",

    // Add / Edit product
    add_product_title: "مصنوع شامل کریں",
    add_product_subtitle: "اپنے اسٹور میں نئی چیز درج کریں",
    edit_product_title: "مصنوع میں ترمیم",
    edit_product_subtitle: "مصنوع کی تفصیلات اپ ڈیٹ کریں",

    // Orders page
    orders_title: "آرڈرز",
    manage_orders: "کسٹمر آرڈرز منظم اور ٹریک کریں",
    col_order_id: "آرڈر نمبر",
    col_buyer: "خریدار",
    col_items: "اشیاء",
    col_total: "کل",
    col_date: "تاریخ",
    tab_all: "سب",
    no_orders_found: "کوئی آرڈر نہیں ملا۔",

    // Inventory page
    inventory_title: "انوینٹری",
    monitor_stock: "اسٹاک کی سطح مانیٹر اور اپ ڈیٹ کریں",
    total_products: "کل مصنوعات",
    low_stock_count: "کم اسٹاک (< ۵)",
    out_of_stock: "ختم شدہ",
    col_stock_level: "اسٹاک کی سطح",
    col_update_stock: "اسٹاک اپ ڈیٹ کریں",
    save: "محفوظ کریں",
    no_products: "کوئی مصنوع نہیں ملی۔",
    out_of_stock_badge: "ختم",
    low_badge: "کم",

    // Analytics page
    analytics_title: "تجزیات",
    sales_performance: "فروخت کی کارکردگی اور اے آئی بصیرت",
    period_today: "آج",
    period_week: "اس ہفتے",
    period_month: "اس مہینے",
    avg_order_value: "اوسط آرڈر قیمت",
    revenue_chart_title: "آمدنی",
    orders_by_status: "حیثیت کے مطابق آرڈرز",
    top_selling: "سب سے زیادہ فروخت",
    ai_insight_label: "اے آئی بصیرت",
    loading_analytics: "تجزیات لوڈ ہو رہے ہیں…",
    failed_analytics: "تجزیات لوڈ کرنے میں ناکامی۔",

    // Auth — Login
    sign_in_subtitle: "اپنے سیلر ڈیش بورڈ میں سائن ان کریں",
    welcome_back_heading: "خوش آمدید",
    email: "ای میل",
    password: "پاس ورڈ",
    signing_in: "سائن ان ہو رہا ہے…",
    sign_in: "سائن ان",
    no_account: "اکاؤنٹ نہیں ہے؟",
    create_store: "اسٹور بنائیں",

    // Auth — Register
    create_account_subtitle: "اپنا سیلر اکاؤنٹ بنائیں",
    setup_store: "اپنا اسٹور ترتیب دیں",
    full_name: "پورا نام",
    store_name: "اسٹور کا نام",
    phone: "فون",
    creating_account: "اکاؤنٹ بنایا جا رہا ہے…",
    create_account: "اکاؤنٹ بنائیں",
    already_account: "پہلے سے اکاؤنٹ ہے؟",
    min_chars: "کم از کم ۸ حروف",

    // Voice modal
    voice_assistant: "اے آئی وائس اسسٹنٹ",
    voice_subtitle: "بولیں — اردو یا رومن اردو میں",

    // Chat panel
    chat_title: "اے آئی اسسٹنٹ",
    chat_placeholder: "پیغام لکھیں…",
    chat_send: "بھیجیں",
    chat_thinking: "سوچ رہا ہے…",
    chat_empty: "اپنے اسٹور کے بارے میں کچھ بھی پوچھیں۔",
    chat_error: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔",
    chat_you: "آپ",
    chat_ai: "اے آئی",

    // Generic
    loading: "لوڈ ہو رہا ہے…",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
