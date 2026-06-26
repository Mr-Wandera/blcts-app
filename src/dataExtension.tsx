import { Asset, MaintenanceRecord, UploadedDocument, AppNotification, AuditLog, UserRole } from "./types";

export const initialAssets: Asset[] = [
  {
    id: "asset-101",
    propertyId: "prop-1",
    name: "Daikin Centralized VRV HVAC System",
    category: "HVAC Systems",
    installationDate: "2024-05-15",
    expectedLifespan: 15,
    warrantyInfo: "5-Year Manufacturer Parts & Compressor Warranty",
    vendor: "Usoni Air Conditioning",
    maintenanceSchedule: "Quarterly",
    currentCondition: "Good"
  },
  {
    id: "asset-102",
    propertyId: "prop-1",
    name: "Otis Gen2 Regen Variable Frequency Elevator",
    category: "Elevators",
    installationDate: "2024-07-22",
    expectedLifespan: 25,
    warrantyInfo: "10-Year Suspension Cable & Traction Machine Warranty",
    vendor: "Otis East Africa Ltd",
    maintenanceSchedule: "Monthly",
    currentCondition: "New"
  },
  {
    id: "asset-103",
    propertyId: "prop-1",
    name: "SolarEdge Smart 35kW Central Inverter System",
    category: "Solar Installations",
    installationDate: "2024-04-10",
    expectedLifespan: 12,
    warrantyInfo: "12-Year Standard Warranty on Grid-Tied Inverters",
    vendor: "Davis & Shirtliff",
    maintenanceSchedule: "Annually",
    currentCondition: "Good"
  },
  {
    id: "asset-104",
    propertyId: "prop-1",
    name: "Cascade 120m³ Greywater Filtration & Harvest System",
    category: "Water Systems",
    installationDate: "2024-03-30",
    expectedLifespan: 20,
    warrantyInfo: "3-Year Filtration Chambers & Pumps Warranty",
    vendor: "Davis & Shirtliff",
    maintenanceSchedule: "Bi-Annually",
    currentCondition: "Good"
  },
  {
    id: "asset-201",
    propertyId: "prop-2",
    name: "Standard Low-Efficiency Belt-Driven HVAC Unit",
    category: "HVAC Systems",
    installationDate: "2023-04-01",
    expectedLifespan: 8,
    warrantyInfo: "1-Year Basic Mechanical Warranty (Expired)",
    vendor: "Fundi HVAC Technicals",
    maintenanceSchedule: "Quarterly",
    currentCondition: "Poor"
  },
  {
    id: "asset-202",
    propertyId: "prop-2",
    name: "Emergency Perkins 150kVA Standby Generator",
    category: "Generators",
    installationDate: "2023-02-18",
    expectedLifespan: 15,
    warrantyInfo: "2-Year Engine and Block Warranty",
    vendor: "PowerLink Engineers Nairobi",
    maintenanceSchedule: "Monthly",
    currentCondition: "Fair"
  },
  {
    id: "asset-203",
    propertyId: "prop-2",
    name: "Garrison Advanced Fire Annunciator Board",
    category: "Fire Safety Equipment",
    installationDate: "2023-03-05",
    expectedLifespan: 10,
    warrantyInfo: "3-Year Circuitry and Battery Warranty",
    vendor: "Apex Fire Safety Kenya",
    maintenanceSchedule: "Bi-Annually",
    currentCondition: "Critical"
  },
  {
    id: "asset-301",
    propertyId: "prop-3",
    name: "Schindler 3300 Smart Lift Core #1",
    category: "Elevators",
    installationDate: "2024-11-20",
    expectedLifespan: 22,
    warrantyInfo: "5-Year Machine Roomless Lift Mechanical Warranty",
    vendor: "Otis East Africa Ltd",
    maintenanceSchedule: "Monthly",
    currentCondition: "Good"
  }
];

export const initialMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: "rec-101",
    propertyId: "prop-1",
    assetId: "asset-101",
    type: "Preventive",
    cost: 145000,
    vendor: "Usoni Air Conditioning",
    date: "2026-05-18",
    status: "Completed",
    notes: "Flushed condensates, replaced synthetic medium dynamic air filters, stabilized refrigeration vapor coefficients. Power factor checked out at 0.94.",
    attachments: ["HVAC_Q2_Report.pdf", "Synthetic_Medium_Receipt.png"]
  },
  {
    id: "rec-102",
    propertyId: "prop-1",
    assetId: "asset-103",
    type: "Scheduled",
    cost: 180000,
    vendor: "Davis & Shirtliff",
    date: "2026-05-01",
    status: "Completed",
    notes: "Tightened electrical contacts on string inv-3, calibrated reactive power exports feedback loop, cleaned dust from localized vents.",
    attachments: ["Solar_Inverter_Verification_052026.pdf"]
  },
  {
    id: "rec-103",
    propertyId: "prop-1",
    assetId: "asset-104",
    type: "Scheduled",
    cost: 120000,
    vendor: "Davis & Shirtliff",
    date: "2026-05-20",
    status: "Completed",
    notes: "Flushed sand filter block, tested chlorination residue indexes (stable at 1.8 ppm), verified auxiliary pump suction rating.",
    attachments: ["Greywater_Filtration_TestLog.pdf"]
  },
  {
    id: "rec-201",
    propertyId: "prop-2",
    assetId: "asset-201",
    type: "Corrective",
    cost: 75000,
    vendor: "Fundi HVAC Technicals",
    date: "2026-06-02",
    status: "In-Progress",
    notes: "Greased dry bearings and tightened slipping motor drive belts. Compressor scheduled for mechanical swap within Q3.",
    attachments: ["fundi_compressor_diagnostics.png"]
  },
  {
    id: "rec-202",
    propertyId: "prop-2",
    assetId: "asset-202",
    type: "Emergency",
    cost: 460000,
    vendor: "PowerLink Engineers Nairobi",
    date: "2026-05-24",
    status: "Completed",
    notes: "Emergency callout for generator failing to crank during power outage. Replaced failed starter solenoid and localized water jacket preheaters.",
    attachments: ["Solenoid_Invoice_NBO_524.pdf", "Starter_Motor_Diagnostics_Log.pdf"]
  }
];

export const initialDocuments: UploadedDocument[] = [
  {
    id: "doc-101",
    propertyId: "prop-1",
    title: "Kilimani_Structural_Drawings_Approved.dwg",
    category: "Architectural Drawings",
    uploadedAt: "2024-01-10 14:35",
    uploadedBy: "Super Admin",
    fileSize: "45.2 MB",
    version: 2,
    history: [
      { version: 1, date: "2023-12-15", user: "Super Admin", action: "Initial onboarding upload" },
      { version: 2, date: "2024-01-10", user: "Super Admin", action: "Approved revision with municipal stamp" }
    ]
  },
  {
    id: "doc-102",
    propertyId: "prop-1",
    title: "Kilimani_EIA_Certificate_NEMA.pdf",
    category: "Inspection Reports",
    uploadedAt: "2024-02-05 09:12",
    uploadedBy: "Property Manager",
    fileSize: "4.8 MB",
    version: 1,
    history: [
      { version: 1, date: "2024-02-05", user: "Property Manager", action: "NEMA certification of environment compliance" }
    ]
  },
  {
    id: "doc-103",
    propertyId: "prop-1",
    title: "Davis_Shirtliff_Annual_Agreement.pdf",
    category: "Vendor Agreements",
    uploadedAt: "2025-12-28 16:45",
    uploadedBy: "Finance Officer",
    fileSize: "1.2 MB",
    version: 1,
    history: [
      { version: 1, date: "2025-12-28", user: "Finance Officer", action: "Executed 12-month solar and water SLA" }
    ]
  },
  {
    id: "doc-201",
    propertyId: "prop-2",
    title: "Thika_HVAC_Bill_Of_Quantities.xlsx",
    category: "BOQs",
    uploadedAt: "2023-01-08 11:15",
    uploadedBy: "Property Manager",
    fileSize: "8.4 MB",
    version: 1,
    history: [
      { version: 1, date: "2023-01-08", user: "Property Manager", action: "Initial bill of mechanical components" }
    ]
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: "not-1",
    propertyId: "prop-2",
    title: "Budget Overrun Alert",
    message: "Thika Road Commercial Park has exceeded its monthly scheduled budget for energy utility load-factor penalties by 150%. Action required on VFD retrofits.",
    type: "budget",
    timestamp: "2026-06-18 14:30",
    isRead: false,
    channel: "both"
  },
  {
    id: "not-2",
    propertyId: "prop-1",
    title: "Upcoming Scheduled Maintenance",
    message: "Otis Lift monthly hoist cable fatigue and sweep diagnostic is due in 3 days on Kilimani Crest Heights.",
    type: "maintenance",
    timestamp: "2026-06-17 09:00",
    isRead: false,
    channel: "in-app"
  },
  {
    id: "not-3",
    propertyId: "prop-2",
    title: "Asset Warranty Expiring Soon",
    message: "Garrison Fire Annunciator system battery & circuitry warranty expires in 14 days.",
    type: "warranty",
    timestamp: "2026-06-15 11:20",
    isRead: true,
    channel: "email"
  },
  {
    id: "not-4",
    propertyId: "prop-1",
    title: "Critical AI Energy Recommendation",
    message: "Solar production exceeds afternoon baseline draws. Enroll in KPLC Net Metering Scheme immediately to claim credits.",
    type: "ai_recommendation",
    timestamp: "2026-06-19 01:10",
    isRead: false,
    channel: "both"
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-06-19 02:40",
    userId: "user-demo-admin",
    userName: "Abdulwahab Wandera",
    role: "Super Admin",
    action: "Onboarded Property",
    details: "Created a new multi-property register entry for 'Kahawa West Industrial Park'.",
    propertyId: "prop-4"
  },
  {
    id: "log-2",
    timestamp: "2026-06-18 16:15",
    userId: "user-demo-admin",
    userName: "Abdulwahab Wandera",
    role: "Super Admin",
    action: "Registered Asset",
    details: "Added Otis Elevator model Gen2 under Kilimani Crest Heights inventory.",
    propertyId: "prop-1"
  },
  {
    id: "log-3",
    timestamp: "2026-06-18 14:50",
    userId: "user-pm-01",
    userName: "Njuguna PM",
    role: "Property Manager",
    action: "Uploaded Contract Agreement",
    details: "Added NEMA environment safety certification document to files.",
    propertyId: "prop-1"
  }
];

export const rolePermissions: Record<UserRole, { module: string; access: "None" | "Read" | "Read-Write" | "All" }[]> = {
  "Developer": [
    { module: "Property Management", access: "All" },
    { module: "Asset Inventory", access: "All" },
    { module: "Maintenance Logs", access: "All" },
    { module: "Document Library", access: "All" },
    { module: "Financial Ledger", access: "All" },
    { module: "Notification Settings", access: "All" }
  ],
  "Super Admin": [
    { module: "Property Management", access: "All" },
    { module: "Asset Inventory", access: "All" },
    { module: "Maintenance Logs", access: "All" },
    { module: "Document Library", access: "All" },
    { module: "Financial Ledger", access: "All" },
    { module: "Notification Settings", access: "All" }
  ],
  "Property Manager": [
    { module: "Property Management", access: "Read-Write" },
    { module: "Asset Inventory", access: "Read-Write" },
    { module: "Maintenance Logs", access: "Read-Write" },
    { module: "Document Library", access: "Read-Write" },
    { module: "Financial Ledger", access: "Read" },
    { module: "Notification Settings", access: "Read" }
  ],
  "Finance Officer": [
    { module: "Property Management", access: "Read" },
    { module: "Asset Inventory", access: "Read" },
    { module: "Maintenance Logs", access: "Read" },
    { module: "Document Library", access: "Read-Write" },
    { module: "Financial Ledger", access: "All" },
    { module: "Notification Settings", access: "Read" }
  ],
  "Maintenance Officer": [
    { module: "Property Management", access: "Read" },
    { module: "Asset Inventory", access: "Read-Write" },
    { module: "Maintenance Logs", access: "All" },
    { module: "Document Library", access: "Read-Write" },
    { module: "Financial Ledger", access: "None" },
    { module: "Notification Settings", access: "Read-Write" }
  ],
  "Vendor": [
    { module: "Property Management", access: "None" },
    { module: "Asset Inventory", access: "Read" },
    { module: "Maintenance Logs", access: "Read-Write" },
    { module: "Document Library", access: "Read-Write" },
    { module: "Financial Ledger", access: "None" },
    { module: "Notification Settings", access: "None" }
  ],
  "Auditor": [
    { module: "Property Management", access: "Read" },
    { module: "Asset Inventory", access: "Read" },
    { module: "Maintenance Logs", access: "Read" },
    { module: "Document Library", access: "Read" },
    { module: "Financial Ledger", access: "Read" },
    { module: "Notification Settings", access: "Read" }
  ],
  "Executive": [
    { module: "Property Management", access: "Read" },
    { module: "Asset Inventory", access: "Read" },
    { module: "Maintenance Logs", access: "Read" },
    { module: "Document Library", access: "Read" },
    { module: "Financial Ledger", access: "Read" },
    { module: "Notification Settings", access: "Read" }
  ],
  "Facility Manager": [
    { module: "Property Management", access: "Read-Write" },
    { module: "Asset Inventory", access: "All" },
    { module: "Maintenance Logs", access: "All" },
    { module: "Document Library", access: "All" },
    { module: "Financial Ledger", access: "Read" },
    { module: "Notification Settings", access: "All" }
  ],
  "Maintenance Engineer": [
    { module: "Property Management", access: "Read" },
    { module: "Asset Inventory", access: "Read-Write" },
    { module: "Maintenance Logs", access: "All" },
    { module: "Document Library", access: "Read-Write" },
    { module: "Financial Ledger", access: "None" },
    { module: "Notification Settings", access: "Read" }
  ]
};
