# BUILDING LIFECYCLE COST TRACKING SYSTEM (BLCTS)

### A Project Report Submitted to the Department of Computer Science, Mount Kenya University, in Partial Fulfilment of the Requirements for the Award of the Degree of Bachelor of Science in Computer Science

---

**Student Name:** [Student Name]
**Registration Number:** [Registration Number]
**Supervisor:** [Supervisor Name]
**Department:** Department of Computer Science
**Institution:** Mount Kenya University
**Academic Year:** 2025/2026
**Version:** 2.0.0

---

## PRELIMINARY PAGES

### DECLARATION

I declare that this project report is my original work and has not been presented for a degree or award in any other university or institution.

**Signature:** ____________________ **Date:** ____________________

**Student Name:** [Student Name]
**Registration Number:** [Registration Number]

### APPROVAL

This project report has been submitted for examination with my approval as the university supervisor.

**Signature:** ____________________ **Date:** ____________________

**Supervisor Name:** [Supervisor Name]
**Department of Computer Science, Mount Kenya University**

### DEDICATION

This project is dedicated to my family, whose unwavering support and encouragement sustained me throughout my academic journey, and to the engineering profession in Kenya, whose pursuit of cost transparency inspired this work.

### ACKNOWLEDGEMENT

I wish to acknowledge the Almighty God for the wisdom and strength granted throughout this project. I extend my sincere gratitude to my supervisor, [Supervisor Name], for invaluable guidance and constructive feedback. I thank the faculty of the Department of Computer Science, Mount Kenya University, for the academic foundation that made this project possible. I also acknowledge the open-source community whose tools — React, Vite, Supabase, and Google Gemini — made this system a reality.

### ABSTRACT

The Building Lifecycle Cost Tracking System (BLCTS) is a web-based application that leverages artificial intelligence to assist engineers, quantity surveyors, project managers, and students in analysing building lifecycle costs. The system accepts architectural blueprint uploads, employs Google Gemini 2.5 Flash to extract building parameters such as floor area, storey count, and building type, and subsequently generates a 21-line Bill of Quantities (BOQ) aligned to the Standard Method of Measurement (SMM). County-specific pricing for ten Kenyan counties is applied to determine construction cost per square metre, and a 30-year lifecycle cost forecast is produced with a 6% annual inflation adjustment. The system is built on React 19 with TypeScript and Vite for the frontend, Supabase (PostgreSQL with Row Level Security) for the backend, and Supabase Edge Functions for server-side AI integration. Role-based access control supports three user roles: Administrator, Building Owner, and Facility Manager. The system was tested with 17 automated tests across three test suites covering BOQ engine correctness, pricing engine accuracy, and AI-to-BOQ pipeline integration. All tests pass. The system produces deterministic, non-simulated cost estimates — every value originates from either AI extraction or mathematical calculation. This project demonstrates the feasibility of AI-assisted construction cost estimation in the Kenyan context and provides a foundation for future research into automated quantity surveying.

---

## TABLE OF CONTENTS

| Section | Page |
|---------|------|
| Declaration | i |
| Approval | ii |
| Dedication | iii |
| Acknowledgement | iv |
| Abstract | v |
| Table of Contents | vi |
| List of Figures | vii |
| List of Tables | viii |
| Acronyms | ix |
| **Chapter One: Introduction** | 1 |
| 1.1 Background | 1 |
| 1.2 Problem Statement | 1 |
| 1.3 Objectives | 2 |
| 1.4 Scope | 2 |
| 1.5 Justification | 2 |
| 1.6 Limitations | 3 |
| 1.7 Assumptions | 3 |
| **Chapter Two: Literature Review** | 4 |
| 2.1 Existing Systems | 4 |
| 2.2 Research Gap | 5 |
| 2.3 Related Technologies | 5 |
| 2.4 Conceptual Framework | 6 |
| **Chapter Three: Methodology** | 7 |
| 3.1 System Analysis | 7 |
| 3.2 Requirements | 7 |
| 3.3 Architecture | 9 |
| 3.4 Database Design | 10 |
| 3.5 Use Case Diagram | 12 |
| 3.6 Activity Diagram | 13 |
| 3.7 Sequence Diagram | 14 |
| 3.8 Class Diagram | 15 |
| 3.9 Technology Stack | 16 |
| 3.10 Security | 17 |
| **Chapter Four: System Implementation** | 18 |
| 4.1 User Interfaces | 18 |
| 4.2 Authentication | 19 |
| 4.3 Blueprint Upload | 20 |
| 4.4 AI Analysis | 21 |
| 4.5 BOQ Generation | 22 |
| 4.6 Pricing Engine | 23 |
| 4.7 Lifecycle Cost Engine | 24 |
| 4.8 Reports | 25 |
| 4.9 Testing | 26 |
| 4.10 Screenshots | 27 |
| **Chapter Five: Conclusion** | 32 |
| 5.1 Conclusion | 32 |
| 5.2 Recommendations | 32 |
| 5.3 Future Improvements | 33 |
| **References** | 34 |
| **Appendices** | 36 |

---

## LIST OF FIGURES

| Figure | Description | Page |
|--------|-------------|------|
| Figure 3.1 | System Architecture Diagram | 9 |
| Figure 3.2 | Entity-Relationship Diagram | 11 |
| Figure 3.3 | Use Case Diagram | 12 |
| Figure 3.4 | Activity Diagram — Blueprint Analysis Workflow | 13 |
| Figure 3.5 | Sequence Diagram — BOQ Generation | 14 |
| Figure 3.6 | Class Diagram — Core Domain Model | 15 |
| Figure 4.1 | Landing Page | 27 |
| Figure 4.2 | Login Screen | 27 |
| Figure 4.3 | Dashboard | 28 |
| Figure 4.4 | Create Project | 28 |
| Figure 4.5 | Blueprint Upload | 29 |
| Figure 4.6 | AI Analysis Results | 29 |
| Figure 4.7 | BOQ Results | 30 |
| Figure 4.8 | Lifecycle Cost Analysis | 30 |
| Figure 4.9 | Reports Page | 31 |

---

## LIST OF TABLES

| Table | Description | Page |
|-------|-------------|------|
| Table 3.1 | Functional Requirements | 7 |
| Table 3.2 | Non-Functional Requirements | 8 |
| Table 3.3 | Database Tables | 10 |
| Table 3.4 | Technology Stack | 16 |
| Table 4.1 | BOQ Component Weights | 22 |
| Table 4.2 | Regional Pricing (10 Counties) | 23 |
| Table 4.3 | Test Suite Results | 26 |

---

## ACRONYMS

| Acronym | Expansion |
|---------|-----------|
| AI | Artificial Intelligence |
| BOQ | Bill of Quantities |
| BLCTS | Building Lifecycle Cost Tracking System |
| CAPEX | Capital Expenditure |
| CSS | Cascading Style Sheets |
| GFA | Gross Floor Area |
| GUI | Graphical User Interface |
| JWT | JSON Web Token |
| MKU | Mount Kenya University |
| NCA | National Construction Authority |
| OPEX | Operational Expenditure |
| PDF | Portable Document Format |
| RLS | Row Level Security |
| SMM | Standard Method of Measurement |
| SQL | Structured Query Language |
| TCO | Total Cost of Ownership |
| TS | TypeScript |
| UI | User Interface |
| VAT | Value Added Tax |

---

## CHAPTER ONE: INTRODUCTION

### 1.1 Background

The construction industry is a significant contributor to Kenya's economy, accounting for approximately 5.6% of the national GDP (KNBS, 2024). Despite this economic importance, cost estimation practices in the Kenyan construction sector remain largely manual, relying on quantity surveyors who perform take-offs from physical or digital blueprints — a process that is time-consuming, susceptible to human error, and inconsistent across regions.

The advent of artificial intelligence, particularly multimodal vision-language models such as Google Gemini, has created new opportunities for automating the extraction of building parameters from architectural drawings. Concurrently, modern web technologies — including React, TypeScript, and serverless database platforms like Supabase — have reduced the barrier to building production-grade engineering tools.

The Building Lifecycle Cost Tracking System (BLCTS) was conceived as an academic project at Mount Kenya University to explore the integration of AI-assisted blueprint analysis with traditional quantity surveying practices, providing a single platform that covers the full building lifecycle from construction cost estimation through 30-year operational expenditure forecasting.

### 1.2 Problem Statement

Construction cost estimation in Kenya faces three principal challenges:

1. **Manual quantity take-off is slow and error-prone.** Quantity surveyors spend hours measuring dimensions from blueprints, and transcription errors propagate through the cost estimate.

2. **Regional pricing variations are not systematically captured.** Material, labour, and transport costs vary significantly across Kenya's 47 counties, yet most estimation tools apply a single national rate.

3. **Lifecycle costs are rarely considered.** Most estimation tools focus exclusively on construction cost (CAPEX) and ignore the 30-year operational expenditure (OPEX) that often exceeds the original construction cost.

There is no widely available, accessible tool that combines AI-assisted blueprint analysis, county-specific pricing, and lifecycle cost forecasting in a single platform tailored to the Kenyan construction context.

### 1.3 Objectives

**Main Objective:** To develop a web-based system that uses AI-assisted blueprint analysis to generate Bills of Quantities with county-specific pricing and 30-year lifecycle cost forecasts for buildings in Kenya.

**Specific Objectives:**

1. To implement AI-assisted extraction of building parameters (floor area, storey count, building type) from uploaded architectural blueprints using Google Gemini 2.5 Flash.
2. To compute Gross Floor Area (GFA) mathematically from extracted parameters without manual input.
3. To generate a 21-line Bill of Quantities aligned to the Standard Method of Measurement (SMM) with per-component quantities and unit rates.
4. To apply county-specific construction cost rates for 10 Kenyan counties, including municipal adjustment factors.
5. To forecast 30-year operational expenditure with inflation-adjusted lifecycle cost modelling.
6. To implement secure, role-based access control for three user roles: Administrator, Building Owner, and Facility Manager.

### 1.4 Scope

The system covers:

- Residential, Commercial, Office, Industrial, Warehouse, School, Hospital, Maisonette, Apartment, and Mixed-Use building types.
- Ten Kenyan counties: Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Busia, Kiambu (including Thika, Ruiru, Limuru), Meru, Nyeri, and Machakos.
- Four construction standards: Economy, Standard, Premium, and Luxury.
- A 30-year lifecycle forecast horizon with 6% annual inflation.
- Three user roles with distinct access permissions.

The system does not cover:

- Structural engineering analysis or load calculations.
- Building information modelling (BIM) file parsing (IFC, DWG).
- Real-time material price feeds from suppliers.
- Counties beyond the ten seeded in the database (fallback to national baseline rates applies).

### 1.5 Justification

BLCTS addresses a real gap in the Kenyan construction industry. By automating blueprint analysis and applying region-specific pricing, the system reduces estimation time from hours to minutes. The inclusion of lifecycle cost forecasting promotes awareness of total cost of ownership among building owners and facility managers. As an academic project, it demonstrates the practical application of AI, modern web technologies, and database design to an engineering problem of national relevance.

### 1.6 Limitations

1. The AI extraction accuracy depends on the quality and clarity of the uploaded blueprint. Hand-drawn or low-resolution images may produce low-confidence results.
2. The system relies on Google Gemini API availability; if the API is unavailable, blueprint analysis cannot proceed.
3. Material prices are seeded as baseline values and do not auto-update from live market feeds.
4. The system supports only ten counties; unlisted counties fall back to national baseline rates.
5. The system does not perform structural or geotechnical analysis.

### 1.7 Assumptions

1. Users upload valid architectural drawings representing real buildings.
2. The 6% annual inflation factor is a reasonable long-term average for Kenyan construction costs.
3. The seeded regional pricing rates approximate current market conditions.
4. Users have a modern web browser with JavaScript enabled.
5. The Supabase backend and Google Gemini API are operational and accessible.

---

## CHAPTER TWO: LITERATURE REVIEW

### 2.1 Existing Systems

Several commercial and open-source systems address construction cost estimation:

**1. CostX (Exactal Technologies):** A commercial quantity surveying tool that supports 2D and 3D take-off from PDF and CAD files. It provides detailed BOQ generation but requires manual measurement and does not incorporate AI-based extraction. It is expensive and targeted at professional surveyors, not students or small-scale builders.

**2. Bluebeam Revu:** A PDF-based construction documentation tool that supports measurement and take-off. It does not generate BOQs or lifecycle cost forecasts and lacks AI integration.

**3. Autodesk Takeoff:** Integrated with the Autodesk Construction Cloud, this tool performs 2D and 3D quantity take-off. It requires BIM models for 3D take-off and does not provide county-specific Kenyan pricing.

**4. Excel-based estimation sheets:** Widely used in Kenya, these are manual, error-prone, and lack standardised pricing databases. They do not support AI extraction or lifecycle forecasting.

**5. QS Online (Kenya):** A local web-based estimation tool. It provides basic BOQ templates but does not integrate AI blueprint analysis or lifecycle cost modelling.

### 2.2 Research Gap

Existing systems exhibit the following gaps:

- None integrate AI vision-language models for automated blueprint parameter extraction.
- None provide county-specific pricing for Kenyan counties with municipal sub-tier adjustments.
- None combine construction cost estimation with 30-year lifecycle cost forecasting in a single platform.
- Most are commercial and inaccessible to students and small-scale builders.
- None are designed as academic research platforms for exploring AI-assisted quantity surveying.

BLCTS addresses these gaps by integrating Google Gemini 2.5 Flash for blueprint analysis, seeding county-specific pricing for 10 Kenyan counties, and providing a 30-year lifecycle cost model — all within an open, web-based platform.

### 2.3 Related Technologies

**Google Gemini 2.5 Flash:** A multimodal large language model capable of analysing images and extracting structured data. Gemini processes architectural drawings and returns JSON-structured building parameters including estimated floor area, storey count, building type, room counts, and observations. The model is accessed via a Supabase Edge Function that keeps the API key server-side (Google, 2024).

**Supabase:** An open-source Firebase alternative providing PostgreSQL databases, authentication, edge functions, and row-level security. Supabase was chosen for its real-time capabilities, built-in auth, and serverless edge function runtime (Supabase, 2024).

**React 19 with TypeScript:** A component-based frontend framework with static typing. React's component model enables reusable UI elements, and TypeScript provides compile-time type safety (React, 2024).

**Vite:** A modern build tool that provides fast hot-module replacement during development and optimised production builds (Vite, 2024).

**Tailwind CSS 4:** A utility-first CSS framework that enables rapid, consistent styling without writing custom CSS (Tailwind, 2024).

### 2.4 Conceptual Framework

The BLCTS conceptual framework follows a pipeline architecture:

```
Blueprint Upload → AI Extraction (Gemini) → Parameter Review → GFA Calculation
→ BOQ Generation (SMM) → Regional Pricing Application → CAPEX Computation
→ Lifecycle OPEX Forecast → Total Cost of Ownership → Report Generation
```

Each stage feeds deterministically into the next. The AI extraction stage is the only point where external intelligence is introduced; all subsequent stages are mathematical calculations. This design ensures that no simulated or invented values enter the pipeline — every cost figure originates from either AI-extracted parameters or seeded database rates.

---

## CHAPTER THREE: METHODOLOGY

### 3.1 System Analysis

The system was analysed using a use-case-driven approach. Three primary actors were identified:

- **Administrator:** Manages material prices, regional pricing, and system settings. Has full access to all modules.
- **Building Owner:** Creates projects, uploads blueprints, runs cost estimates, and views reports. Cannot access maintenance or pricing administration.
- **Facility Manager:** Manages maintenance tasks for existing buildings. Cannot create projects or upload blueprints.

### 3.2 Requirements

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | The system shall allow users to register with email, password, name, role, and organization. |
| FR-02 | The system shall authenticate users via email/password and maintain sessions. |
| FR-03 | The system shall allow users to create, view, update, and delete projects. |
| FR-04 | The system shall accept blueprint uploads in JPEG, PNG, WebP, and PDF formats up to 10MB. |
| FR-05 | The system shall send uploaded blueprints to Google Gemini 2.5 Flash for analysis via an edge function. |
| FR-06 | The system shall extract estimated floor area, storey count, building type, room count, bedrooms, bathrooms, roof type, and drawing scale from AI responses. |
| FR-07 | The system shall allow users to review and edit AI-extracted parameters before proceeding. |
| FR-08 | The system shall compute GFA as floor area per floor multiplied by the number of floors. |
| FR-09 | The system shall generate a 21-line BOQ with SMM-based quantities and unit rates. |
| FR-10 | The system shall apply county-specific cost-per-square-metre rates from the database. |
| FR-11 | The system shall apply a 3% municipal adjustment for Thika town within Kiambu county. |
| FR-12 | The system shall compute CAPEX including external works, preliminaries, professional fees, statutory costs, contingency (7.5%), and VAT (16%). |
| FR-13 | The system shall forecast 30-year lifecycle OPEX with 6% annual inflation. |
| FR-14 | The system shall compute Total Cost of Ownership (TCO) as CAPEX plus lifecycle OPEX. |
| FR-15 | The system shall save BOQ estimates to the database with full line-item detail. |
| FR-16 | The system shall export BOQ estimates as CSV files. |
| FR-17 | The system shall generate print-optimised reports via browser print-to-PDF. |
| FR-18 | The system shall allow Administrators to manage material prices and regional pricing. |
| FR-19 | The system shall allow Facility Managers to manage maintenance tasks. |
| FR-20 | The system shall display a landing page with system information, features, workflow, and benefits. |

#### Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | The system shall load the landing page within 2 seconds on a standard broadband connection. |
| NFR-02 | The system shall be fully responsive across mobile, tablet, and desktop viewports. |
| NFR-03 | The system shall support dark and light themes. |
| NFR-04 | The system shall enforce Row Level Security on all database tables. |
| NFR-05 | The system shall keep the Gemini API key server-side; the browser shall never access it. |
| NFR-06 | The system shall pass TypeScript strict mode compilation with zero errors. |
| NFR-07 | The system shall pass ESLint with zero errors. |
| NFR-08 | The system shall pass all automated unit and integration tests. |
| NFR-09 | The system shall be accessible with keyboard navigation and ARIA labels. |
| NFR-10 | The system shall use lazy loading for route-level code splitting. |

### 3.3 Architecture

The system follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION TIER                    │
│   React 19 + TypeScript + Tailwind CSS 4 (Vite build)  │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│   │ Landing  │ │   Auth   │ │Dashboard │ │ Projects│ │
│   │  Page    │ │  Screen  │ │   +Nav   │ │  Page   │ │
│   └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│   │Blueprint │ │   Cost   │ │Mainten-  │ │ Reports │ │
│   │ Upload   │ │Estimation│ │  ance    │ │  Page   │ │
│   └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS (Supabase JS SDK)
┌───────────────────────┴─────────────────────────────┐
│                    LOGIC TIER                          │
│              Supabase Edge Functions (Deno)            │
│   ┌────────────────────┐  ┌────────────────────────┐ │
│   │ analyze-blueprint  │  │    confirm-signup      │ │
│   │ (Gemini 2.5 Flash) │  │  (auto-confirm account) │ │
│   └────────────────────┘  └────────────────────────┘ │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│                   DATA TIER                           │
│              Supabase PostgreSQL                      │
│   ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ │
│   │regional_    │ │construction_ │ │ boq_estimates│ │
│   │  pricing    │ │  materials   │ │              │ │
│   └─────────────┘ └──────────────┘ └──────────────┘ │
│   ┌─────────────┐ ┌──────────────┐                   │
│   │  projects   │ │maintenance_  │                   │
│   │             │ │   tasks      │                   │
│   └─────────────┘ └──────────────┘                   │
│         Row Level Security on all tables              │
└───────────────────────────────────────────────────────┘
```

*Figure 3.1: System Architecture Diagram*

### 3.4 Database Design

The database consists of five tables:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `regional_pricing` | County-specific construction rates | county, base_cost_per_sqm_{standard}, multipliers |
| `construction_materials` | Material, labour, and service prices | county, category, item_id, unit_price |
| `boq_estimates` | Saved BOQ calculations | property_id, gfa, total_project_cost, boq_line_items (JSONB) |
| `projects` | User projects | name, county, building_type, floor_area_per_floor, floors, blueprint_analysis (JSONB) |
| `maintenance_tasks` | Facility maintenance records | property_id, title, priority, status, estimated_cost |

*Table 3.3: Database Tables*

**Entity-Relationship Diagram (textual representation):**

```
projects (1) ────── (N) boq_estimates
    │                      │
    │                      │ property_id
    │                      │
    └── (N) maintenance_tasks
    │
    └── blueprint_analysis (JSONB, embedded)

regional_pricing (standalone, referenced by county name)
construction_materials (standalone, referenced by county + category)
```

*Figure 3.2: Entity-Relationship Diagram*

All tables have Row Level Security enabled with four CRUD policies each (SELECT, INSERT, UPDATE, DELETE) scoped to `anon, authenticated` roles.

### 3.5 Use Case Diagram

```
                    ┌──────────────┐
                    │  Administrator │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ Manage     │  │ Manage     │  │ View       │
    │ Materials  │  │ Regional   │  │ System     │
    │            │  │ Pricing    │  │ Settings   │
    └────────────┘  └────────────┘  └────────────┘

                    ┌──────────────┐
                    │Building Owner│
                    └──────┬───────┘
                           │
    ┌──────────┬───────────┼───────────┬──────────┐
    ▼          ▼           ▼           ▼          ▼
┌────────┐┌────────┐┌──────────┐┌────────┐┌────────┐
│Create  ││Upload  ││Run Cost  ││View    ││Export  │
│Project ││Blueprint││Estimate ││Reports ││CSV/PDF │
└────────┘└────────┘└──────────┘└────────┘└────────┘

                    ┌──────────────┐
                    │Facility Mgr  │
                    └──────┬───────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
             ┌──────────┐  ┌──────────┐
             │ Manage   │  │  View    │
             │Mainten.  │  │ Reports  │
             │ Tasks    │  │          │
             └──────────┘  └──────────┘
```

*Figure 3.3: Use Case Diagram*

### 3.6 Activity Diagram

```
     ┌─────────────────┐
     │  Start          │
     └────────┬────────┘
              ▼
     ┌─────────────────┐
     │  Upload Blueprint│
     └────────┬────────┘
              ▼
     ┌─────────────────┐
     │  AI Analysis     │──→ If error ──→ ┌──────────┐
     │  (Gemini 2.5)    │                 │ Show Error│
     └────────┬────────┘                 │  & Retry  │
              │                          └──────────┘
              ▼
     ┌─────────────────┐
     │  Review Extracted│
     │  Parameters      │
     └────────┬────────┘
              ▼
     ┌─────────────────┐
     │  Calculate GFA   │
     └────────┬────────┘
              ▼
     ┌─────────────────┐
     │  Generate BOQ    │
     │  (21 lines, SMM) │
     └────────┬────────┘
              ▼
     ┌─────────────────┐
     │  Apply Regional  │
     │  Pricing         │
     └────────┬────────┘
              ▼
     ┌─────────────────┐
     │  Compute CAPEX   │
     │  + Lifecycle OPEX│
     └────────┬────────┘
              ▼
     ┌─────────────────┐
     │  Save to Database│
     └────────┬────────┘
              ▼
     ┌─────────────────┐
     │  Display Results │
     │  / Export Report  │
     └────────┬────────┘
              ▼
     ┌─────────────────┐
     │  End             │
     └─────────────────┘
```

*Figure 3.4: Activity Diagram — Blueprint Analysis Workflow*

### 3.7 Sequence Diagram

```
User        Frontend        Edge Func      Gemini API     Supabase DB
 │              │               │              │              │
 │──Upload─────▶│               │              │              │
 │              │──POST base64─▶│              │              │
 │              │               │──POST image─▶│              │
 │              │               │              │──Extract─────▶│
 │              │               │              │  parameters   │
 │              │               │◀──JSON result│              │
 │              │◀──200 result──│              │              │
 │              │               │              │              │
 │──Review─────▶│               │              │              │
 │──Confirm────▶│               │              │              │
 │              │──calculateBOQ() (client-side)│              │
 │              │──fetchRegionalPricing()─────▶──────────────▶│
 │              │◀──────────────pricing rows────────────────│
 │              │──saveBOQ()───▶─────────────▶──────────────▶│
 │              │◀──────────────success──────────────────────│
 │──View Report▶│               │              │              │
```

*Figure 3.5: Sequence Diagram — BOQ Generation*

### 3.8 Class Diagram

```
┌──────────────────────┐       ┌──────────────────────────┐
│      Project         │       │    BlueprintAnalysis     │
├──────────────────────┤       │        Result            │
│+ id: string          │──────▶│+ estimatedFloorArea:    │
│+ name: string         │  1   │    number|null           │
│+ location: string     │      │+ floors: number|null     │
│+ county: string       │      │+ buildingType: string|null│
│+ buildingType: string │      │+ confidence: number|null │
│+ constructionStandard │      │+ observations: string[]  │
│+ floorAreaPerFloor    │      │+ roomCount: number|null  │
│+ floors: number       │      │+ bedrooms: number|null   │
│+ blueprintAnalysis    │      │+ bathrooms: number|null  │
│+ blueprintFileName    │      │+ roofType: string|null   │
│+ status: string       │      │+ drawingScale: string|null│
└──────────┬───────────┘      └──────────────────────────┘
           │
           │ 1
           │
           ▼ N
┌──────────────────────┐       ┌──────────────────────────┐
│    BOQEstimate        │       │   RegionalPricingRow     │
├──────────────────────┤       ├──────────────────────────┤
│+ projectId: string    │      │+ county: string           │
│+ county: string       │      │+ base_cost_per_sqm_*: int │
│+ buildingType: string │      │+ material_multiplier      │
│+ gfa: number          │      │+ labour_multiplier         │
│+ costPerSqm: number   │      │+ inflation_factor          │
│+ constructionCost     │      │+ transport_factor          │
│+ subtotal: number     │      └──────────────────────────┘
│+ contingency: number  │
│+ vatAmount: number    │       ┌──────────────────────────┐
│+ totalProjectCost     │       │      BOQLineItem          │
│+ totalLifecycleCost   │──────▶├──────────────────────────┤
│+ tco: number          │  1..N│+ section: string          │
│+ lineItems: BOQLine[] │      │+ quantity: number         │
│+ yearlyProjection     │      │+ unit: string              │
└──────────────────────┘      │+ unitRate: number          │
                               │+ amount: number            │
                               └──────────────────────────┘
```

*Figure 3.6: Class Diagram — Core Domain Model*

### 3.9 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.0.0 |
| Language | TypeScript | 5.6+ |
| Build Tool | Vite | 8.0.0 |
| Styling | Tailwind CSS | 4.0.0 |
| Charts | Recharts | 2.12.0 |
| Icons | Lucide React | 0.400.0 |
| Backend | Supabase (PostgreSQL) | — |
| Auth | Supabase Auth (email/password) | — |
| AI | Google Gemini 2.5 Flash | — |
| Edge Runtime | Deno (Supabase Edge Functions) | — |
| Testing | Vitest | 4.1.10 |
| Linting | ESLint | 9.0.0 |
| Package Manager | npm | — |

*Table 3.4: Technology Stack*

### 3.10 Security

**Authentication:** Supabase Auth with email/password. Password minimum length is 6 characters. A custom edge function (`confirm-signup`) auto-confirms new accounts server-side using the service role key, eliminating the need for email confirmation links.

**Authorization:** Role-based access control with three roles. The frontend checks `user.role` (stored in user metadata) and restricts navigation items and route access accordingly. The sidebar dynamically renders only the navigation items permitted for the user's role.

**Database Security:** Row Level Security (RLS) is enabled on all five database tables. Each table has four CRUD policies (SELECT, INSERT, UPDATE, DELETE) scoped to `anon, authenticated` roles. The service role key is never exposed to the browser; it is only used within edge functions.

**API Key Security:** The Google Gemini API key is stored as a Supabase Edge Function secret (`GEMINI_API_KEY`). It is never exposed to the browser. All Gemini API calls are proxied through the `analyze-blueprint` edge function, which runs on the Deno runtime server-side.

**Session Management:** Supabase manages JWT sessions automatically. The frontend subscribes to `onAuthStateChange` to detect session changes and updates the UI accordingly. Sessions persist across page reloads.

---

## CHAPTER FOUR: SYSTEM IMPLEMENTATION

### 4.1 User Interfaces

The system's user interface follows a consistent design language across all screens:

- **Colour System:** Primary emerald-600 (#059669), neutral slate tones, dark mode backgrounds (#0a0f1e, #0d1424, #0f1629).
- **Typography:** Inter font family, 3 weights (normal, semibold, black).
- **Spacing:** 8px spacing system with rounded-2xl (16px) card corners.
- **Components:** Reusable UI primitives — Button, Card, Badge, Input, Modal, Table, Toast, StepBar, KpiCard, SearchBar, Loading.
- **Responsive Design:** Mobile-first with breakpoints at sm (640px), md (768px), lg (1024px).
- **Dark Mode:** Full dark theme support toggled via a button in the sidebar/nav.
- **Animations:** Fade-in, slide-up, and scale-in transitions for page and component mounting.

### 4.2 Authentication

The authentication flow is implemented in `AuthScreen.tsx` and `src/lib/supabase.ts`:

1. **Sign Up:** The user provides name, email, password, role (Building Owner or Facility Manager), and optional organization. The frontend calls `supabase.auth.signUp()` with user metadata. A second call to the `confirm-signup` edge function auto-confirms the account using the service role key. The user is then immediately signed in via `signInWithPassword()`.

2. **Sign In:** The user provides email and password. The frontend calls `supabase.auth.signInWithPassword()`. On success, `onAuthStateChange` fires and the user state is set.

3. **Session Restoration:** On application mount, `supabase.auth.getSession()` is called to restore any existing session. The `authReady` flag prevents rendering until the session check completes.

4. **Sign Out:** Calls `supabase.auth.signOut()`, clears user state, and resets to the landing page.

5. **Role Mapping:** The `mapSupabaseUser()` function extracts `name`, `role`, and `organization` from user metadata. Default role is "Building Owner" if metadata is absent.

### 4.3 Blueprint Upload

The blueprint upload interface is implemented in `BlueprintUpload.tsx`:

- **File Selection:** Drag-and-drop zone or file picker button. Accepts `image/*` and `.pdf` files up to 10MB.
- **File Reading:** Uses `FileReader.readAsDataURL()` to convert the file to a base64 data URL.
- **Step Indicator:** A three-step progress bar (Upload → AI Analysis → Review) shows the current stage.
- **Error Handling:** If the file exceeds 10MB, a toast notification is shown. If reading fails, an error state with a retry option is displayed.

### 4.4 AI Analysis

The AI analysis is implemented in `src/lib/gemini.ts` and the `analyze-blueprint` edge function:

**Edge Function (`supabase/functions/analyze-blueprint/index.ts`):**

1. Receives the base64-encoded image and MIME type from the frontend.
2. Retrieves the `GEMINI_API_KEY` from Deno environment variables.
3. Constructs a prompt instructing Gemini to analyse the architectural drawing and return JSON with specific fields: `estimatedFloorArea`, `floors`, `buildingType`, `confidence`, `observations`, `roomCount`, `bedrooms`, `bathrooms`, `roofType`, `drawingScale`.
4. Calls the Gemini 2.5 Flash API with the image and prompt.
5. Parses the JSON response, handling malformed JSON with a regex-based fallback.
6. Returns the parsed result to the frontend with HTTP 200 and CORS headers.

**Client-Side Parsing (`gemini.ts`):**

1. Sends the authenticated request to the edge function with the user's JWT.
2. Parses the response with bounded number validation (`parseBoundedNumber`, `parseBoundedInt`).
3. Normalises the building type using a pattern-matching system that maps free-text descriptions (e.g., "bungalow", "maisonette", "factory") to the system's canonical building types.
4. Returns a `BlueprintAnalysisResult` object with null-safe fields.

**Key Design Principle:** If Gemini cannot determine a value with confidence, it returns `null` or `0`. The system does not invent or default missing values — it surfaces them as "Not detected" in the UI.

### 4.5 BOQ Generation

The BOQ engine is implemented in `src/utils/boqEngine.ts`. The `calculateBOQ()` function:

1. **GFA Calculation:** `gfa = floorAreaPerFloor × floors`. If GFA is zero, the function returns an empty result with zero costs.

2. **Cost per Square Metre:** Calls `resolveCostPerSqm()` from the pricing engine, which looks up the county-specific rate from the database or falls back to `BASE_RATES` for unmapped counties.

3. **Construction Cost:** `constructionCost = gfa × costPerSqm`.

4. **21 BOQ Line Items:** Each component has a weight (summing to 1.0) that allocates a portion of the construction cost. Quantities are derived from GFA using SMM-based formulas:

| # | Component | Weight | Quantity Formula |
|---|-----------|--------|------------------|
| 1 | Substructure Excavation & Earthworks | 2.5% | GFA × 1.15 m³ |
| 2 | Foundation Reinforced Concrete | 4.0% | GFA × 0.18 m³ |
| 3 | Foundation Wall Infill | 3.0% | GFA × 0.3875 m² |
| 4 | Damp Proof Course & Membrane | 0.5% | GFA × 0.3 m² |
| 5 | Superstructure Walls | 15.0% | GFA × 1.2 m² |
| 6 | Columns & Beams | 8.0% | GFA × 0.08 m³ |
| 7 | Floor Slabs & Suspended Floors | 10.0% | GFA × 0.12 m³ |
| 8 | Staircases | 1.5% | floors × 1.5 m² |
| 9 | Roof Structure | 5.0% | GFA × 1.1 m² |
| 10 | Roof Covering | 4.0% | GFA × 1.1 m² |
| 11 | Ceilings | 2.0% | GFA × 1.0 m² |
| 12 | Internal Doors | 2.5% | GFA × 0.04 No. |
| 13 | External Doors & Windows | 4.0% | GFA × 0.06 No. |
| 14 | Internal Plastering | 5.0% | GFA × 1.8 m² |
| 15 | External Render | 3.0% | GFA × 0.8 m² |
| 16 | Floor Finishes | 5.0% | GFA × 1.0 m² |
| 17 | Wall Finishes (Tiles/Paint) | 4.0% | GFA × 0.6 m² |
| 18 | Plumbing Installation | 4.0% | GFA × 0.03 No. |
| 19 | Electrical Installation | 4.0% | GFA × 1.0 m² |
| 20 | Drainage & Sewage | 2.5% | GFA × 0.5 m run |
| 21 | External Works | 10.5% | GFA × 0.3 m² |

*Table 4.1: BOQ Component Weights and Quantity Formulas*

5. **CAPEX Additions:**
   - External Works: 8% of construction cost
   - Preliminaries: 12% of construction cost
   - Professional Fees: 13% of construction cost (architect 4%, structural engineer 3%, QS 2%, MEP 2%, project manager 2%)
   - Statutory Costs: 2% of construction cost
   - Subtotal = construction + external + preliminaries + professional + statutory
   - Contingency: 7.5% of subtotal
   - Pre-VAT Total = subtotal + contingency
   - VAT: 16% of pre-VAT total
   - Total Project Cost (CAPEX) = pre-VAT + VAT

### 4.6 Pricing Engine

The pricing engine is implemented in `src/utils/pricingEngine.ts`:

**`resolveCostPerSqm(buildingType, standard, county, town, regionalPricingRows)`:**

1. Searches the `regional_pricing` table for the specified county.
2. If found, uses the county-specific `base_cost_per_sqm_{standard}` rate.
3. If not found, falls back to `BASE_RATES[buildingType][standard]` — a hardcoded national baseline.
4. **County Hierarchy:** If the county is "Thika", it is normalised to "Kiambu" (Thika is a municipality within Kiambu County).
5. **Municipal Adjustment:** If the town is "Thika" (within Kiambu), a 3% upward adjustment is applied to reflect Thika's industrial premium.

**Seeded County Rates (Standard, KSh/m²):**

| County | Economy | Standard | Premium | Luxury |
|--------|---------|----------|---------|--------|
| Nairobi | 28,000 | 38,000 | 52,000 | 75,000 |
| Mombasa | 32,200 | 43,700 | 59,800 | 86,250 |
| Kisumu | 29,400 | 39,900 | 54,600 | 78,750 |
| Nakuru | 25,760 | 34,960 | 47,840 | 69,000 |
| Eldoret | 25,200 | 34,200 | 46,800 | 67,500 |
| Busia | 24,640 | 33,440 | 45,760 | 66,000 |
| Thika (Kiambu) | 26,600 | 36,100 | 49,400 | 71,250 |
| Meru | 24,920 | 33,820 | 46,280 | 66,750 |
| Nyeri | 25,480 | 34,580 | 47,320 | 68,250 |
| Machakos | 26,040 | 35,340 | 48,360 | 69,750 |

*Table 4.2: Regional Pricing (10 Counties)*

### 4.7 Lifecycle Cost Engine

The lifecycle cost model is implemented within `calculateBOQ()`:

1. **Annual OPEX:** Calculated as a percentage of construction cost, covering maintenance (2%), utilities (1.5%), insurance (0.5%), and inspections (0.5%) — totalling 4.5% annually.

2. **30-Year Projection:** For each year from 1 to 30, the annual OPEX is inflated by the county-specific `inflation_factor` (default 6%): `opex_year_n = annual_opex × (1 + inflation)^n`.

3. **Total Lifecycle Cost:** Sum of all 30 yearly projections.

4. **Total Cost of Ownership (TCO):** `TCO = totalProjectCost (CAPEX) + totalLifecycleCost (OPEX)`.

5. **Yearly Projection Array:** The function returns an array of 30 objects, each containing `year`, `annualCost`, and `cumulativeCost`, used by the Recharts area chart in the UI.

### 4.8 Reports

The reports page is implemented in `ReportsPage.tsx`:

- **Summary Tab:** KPI cards showing GFA, cost per m², construction cost, CAPEX, lifecycle cost, and TCO.
- **BOQ Tab:** Full 21-line BOQ table with section, quantity, unit, unit rate, and amount columns. Collapsible detail for each line.
- **Lifecycle Tab:** Area chart showing 30-year cumulative cost projection, plus a breakdown table.
- **CSV Export:** Generates a CSV file with all BOQ line items and downloads it via `Blob` and `URL.createObjectURL()`.
- **Print/PDF:** Print-optimised CSS (`@media print` in `index.css`) hides sidebar, navigation, and buttons, and renders only the report content with clean borders and light theme. The user selects "Save as PDF" from the browser print dialog.

### 4.9 Testing

The system includes 17 automated tests across three test suites, run via Vitest:

| Suite | Tests | Coverage |
|-------|-------|----------|
| `boqEngine.vitest.test.ts` | 8 | Zero GFA safety, fallback rates, county hierarchy, multi-storey scaling, lifecycle/TCO, component weights, VAT/contingency |
| `pricingEngine.vitest.test.ts` | 6 | Base rates, DB rates, Thika→Kiambu, 3% municipal adjustment, standard ordering |
| `pipelineIntegration.vitest.test.ts` | 3 | AI-to-GFA mapping, null extraction guards, observation/confidence preservation |
| **Total** | **17** | **All pass** |

*Table 4.3: Test Suite Results*

**Live End-to-End Test:** Two distinct blueprint images (240 m² bungalow and 96 m² maisonette) were uploaded to the deployed edge function. Both returned HTTP 200 with different extracted values. The BOQ engine produced different GFA (240 vs 96), different construction costs (KSh 9.84M vs 3.94M), different CAPEX (KSh 16.57M vs 6.63M), and different lifecycle costs (KSh 26.45M vs 10.58M). No fallback or simulated values were used.

**Build Verification:**
- `npm run typecheck` — 0 errors
- `npm run build` — passes
- `npm run lint` — 0 errors (1 cosmetic warning)
- `npm test` — 17/17 pass

### 4.10 Screenshots

The following screenshots should be captured from the running application and inserted here. Only real screenshots from the live system are permitted.

**Figure 4.1: Landing Page**
*Screenshot of the restored landing page showing the hero section with BLCTS logo, headline, subheading, Get Started and Sign In CTAs, and the blueprint analysis illustration card. Captured from the running dev server.*

**Figure 4.2: Login Screen**
*Screenshot of the AuthScreen showing the BLCTS logo, email and password fields, and Sign In button. Toggle between login and signup modes visible.*

**Figure 4.3: Dashboard**
*Screenshot of the Dashboard showing KPI cards, project summary, and navigation sidebar. Role badge visible in the top bar.*

**Figure 4.4: Create Project**
*Screenshot of the ProjectsPage showing the project creation form with name, location, county, building type, construction standard, floor area, and floors fields.*

**Figure 4.5: Blueprint Upload**
*Screenshot of the BlueprintUpload component showing the drag-and-drop zone, file picker, and three-step progress indicator.*

**Figure 4.6: AI Analysis Results**
*Screenshot of the review step showing AI-extracted parameters (floor area, floors, building type, confidence), observations list, and editable parameter fields.*

**Figure 4.7: BOQ Results**
*Screenshot of the CostEstimationPage summary tab showing GFA, cost per m², construction cost, CAPEX breakdown, and the 21-line BOQ table.*

**Figure 4.8: Lifecycle Cost Analysis**
*Screenshot of the lifecycle tab showing the 30-year area chart, annual cost breakdown, and TCO figure.*

**Figure 4.9: Reports Page**
*Screenshot of the ReportsPage showing KPI cards, BOQ table, and export buttons (CSV and Print).*

> Note: Actual screenshots must be captured from the running application at `http://localhost:5173` and inserted into this document. The screenshots should be taken in light mode for print readability. If a screenshot cannot be captured for a specific state (e.g., AI analysis requires a valid blueprint upload), clearly state: "Unable to verify from the current implementation."

---

## CHAPTER FIVE: CONCLUSION

### 5.1 Conclusion

The Building Lifecycle Cost Tracking System (BLCTS) was successfully developed as a web-based application that integrates AI-assisted blueprint analysis with county-specific construction cost estimation and 30-year lifecycle cost forecasting. The system meets all six specific objectives:

1. AI extraction via Google Gemini 2.5 Flash was implemented and verified with live end-to-end tests producing HTTP 200 responses with accurate parameter extraction.
2. GFA is computed mathematically as floor area × floors — no manual input required.
3. A 21-line BOQ aligned to SMM is generated with per-component quantities and unit rates.
4. County-specific pricing for 10 Kenyan counties is applied from the database, with a 3% municipal adjustment for Thika.
5. A 30-year lifecycle cost forecast with 6% annual inflation is computed.
6. Role-based access control for three roles (Administrator, Building Owner, Facility Manager) is implemented with RLS on all database tables.

The system was tested with 17 automated tests, all passing, and the live end-to-end test confirmed that different blueprints produce different extracted values, different GFA, different BOQ, and different lifecycle costs — with no fallback or simulated values.

### 5.2 Recommendations

1. **Expand county coverage:** The system currently covers 10 counties. Extending to all 47 Kenyan counties would make the system nationally comprehensive.
2. **Integrate live material price feeds:** Connecting to supplier APIs or web-scraping current material prices would improve estimation accuracy.
3. **Add user-defined project templates:** Allowing users to save and reuse project configurations would speed up repeated estimations.
4. **Implement multi-user project sharing:** Enabling multiple users to collaborate on the same project would support team-based surveying.
5. **Add historical cost trend analysis:** Storing estimates over time would enable cost trend analysis and inflation validation.

### 5.3 Future Improvements

1. **BIM file support:** Adding support for IFC and DWG file parsing would enable direct import from BIM software.
2. **3D visualisation:** Integrating a 3D model viewer would allow users to visualise the building alongside the cost estimate.
3. **Mobile application:** A native mobile app would enable on-site blueprint capture and estimation.
4. **Machine learning cost optimisation:** Training a model on historical estimates to suggest cost-saving alternatives.
5. **Integration with Kenyan government construction databases:** Connecting to NCA and BORAQS databases for real-time regulatory compliance checking.
6. **Multi-currency support:** Adding USD and EUR conversion for international project comparison.

---

## REFERENCES

[1] Google. (2024). *Gemini API Documentation: Vision and Multimodal Models*. Google AI. Available at: https://ai.google.dev/gemini-api/docs

[2] Supabase. (2024). *Supabase Documentation: Authentication, Row Level Security, and Edge Functions*. Supabase. Available at: https://supabase.com/docs

[3] React. (2024). *React 19 Documentation*. Meta Open Source. Available at: https://react.dev

[4] Vite. (2024). *Vite Build Tool Documentation*. Available at: https://vitejs.dev

[5] Tailwind CSS. (2024). *Tailwind CSS v4 Documentation*. Available at: https://tailwindcss.com

[6] Institute of Electrical and Electronics Engineers (IEEE). (2014). *IEEE 1016-2009 — Standard for Software Design Descriptions*. IEEE.

[7] International Organization for Standardization (ISO). (2011). *ISO/IEC 25010:2011 — Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*. ISO.

[8] Project Management Institute (PMI). (2021). *A Guide to the Project Management Body of Knowledge (PMBOK Guide)*. 7th ed. PMI.

[9] Royal Institution of Chartered Surveyors (RICS). (2023). *New Rules of Measurement (NRM): Detailed Measurement for Building Works*. RICS.

[10] Kenya National Bureau of Statistics (KNBS). (2024). *Economic Survey 2024: Construction Sector Analysis*. KNBS.

[11] National Construction Authority of Kenya (NCA). (2023). *Construction Industry Performance Report*. NCA.

[12] Board of Registration of Architects and Quantity Surveyors (BORAQS). (2023). *Quantity Surveying Practice Guidelines*. BORAQS.

[13] TypeScript. (2024). *TypeScript Documentation*. Microsoft. Available at: https://www.typescriptlang.org

[14] Vitest. (2024). *Vitest Testing Framework Documentation*. Available at: https://vitest.dev

[15] Deno Land. (2024). *Deno Runtime Documentation*. Available at: https://deno.land

---

## APPENDICES

### Appendix A: Database Migration SQL

The complete SQL migration files are available in the project repository at `supabase/migrations/`:

1. `20260712035239_blcts_regional_pricing_and_materials.sql` — Creates `regional_pricing`, `construction_materials`, `boq_estimates`, and `maintenance_tasks` tables with RLS policies and seed data for 10 counties and 44 materials.

2. `20260719151813_tighten_rls_pricing_tables.sql` — Tightens RLS policies on pricing tables.

3. `20260719152711_add_projects_table_and_owner_scoped_rls.sql` — Creates the `projects` table with owner-scoped RLS policies using `auth.uid()`.

### Appendix B: Edge Function Source

The `analyze-blueprint` edge function source is available at `supabase/functions/analyze-blueprint/index.ts`. It:
- Validates the JWT token
- Retrieves `GEMINI_API_KEY` from environment
- Constructs a structured prompt for Gemini 2.5 Flash
- Calls the Gemini API with the uploaded image
- Parses and validates the JSON response
- Returns the result with CORS headers

### Appendix C: Test Suite Source

The three Vitest test suites are available at:
- `src/utils/boqEngine.vitest.test.ts`
- `src/utils/pricingEngine.vitest.test.ts`
- `src/utils/pipelineIntegration.vitest.test.ts`

### Appendix D: Live End-to-End Test Results

**Test Date:** 20 July 2025

**Blueprint 1 (240 m² Bungalow):**
- HTTP Status: 200
- Response Time: 5.15s
- Extracted Floor Area: 240 m²
- Extracted Floors: 1
- Building Type: Residential
- Confidence: 1.0
- GFA: 240 m²
- Construction Cost: KSh 9,840,000
- Total CAPEX: KSh 16,565,148
- Lifecycle Cost (30yr): KSh 26,449,708
- TCO: KSh 43,014,856

**Blueprint 2 (96 m² Maisonette):**
- HTTP Status: 200
- Response Time: 7.33s
- Extracted Floor Area: 96 m²
- Extracted Floors: 1
- Building Type: Residential
- Confidence: 0.9
- GFA: 96 m²
- Construction Cost: KSh 3,936,000
- Total CAPEX: KSh 6,626,059
- Lifecycle Cost (30yr): KSh 10,579,884
- TCO: KSh 17,205,943

**Verification:** Different blueprints produced different extracted values, different GFA, different BOQ, different lifecycle costs. No fallback or simulated values were used. All values originated from Gemini AI extraction and mathematical calculation.

---

*End of Documentation*
