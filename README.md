# UdyamSetu (उद्यमसेतु) 🚀

> **AI-Driven Entrepreneur Scheme Navigator, Geo-Spatial Partner Locator & Multilingual Platform**

UdyamSetu is a single-window portal designed to guide entrepreneurs through government credit-linked welfare scheme selection (e.g., **NSFDC**, **NBCFDC**, **NSKFDC**, and **PMEGP**), calculate loan amortization schedules accurately, and connect them with nearby authorized channel partners.

---

## ✨ Key Features

- **Smart Matching Engine:** Evaluates social category (SC, OBC, Safai Karamchari, General), age, business stage, and funding requirements to deliver transparent scheme recommendations.
- **Live OpenStreetMap & Geocoding:** Converts text location or PIN code inputs into real latitude/longitude coordinates via Nominatim API, displaying interactive Leaflet map routing to channelising agencies.
- **Multilingual Read Aloud Engine:** Native Web Speech API integration providing audio narration in **English**, **Hindi (हिन्दी)**, and **Marathi (मराठी)**.
- **Dynamic Application Document Checklist:** Generates a custom document list based on profile inputs with one-click **Text Checklist Download** (`.txt`) and **Print/PDF Export**.
- **Financial Amortization Calculator:** Real-time loan interest, EMI, and tenure repayment breakdown.

---

## 🛠️ Tech Stack

- **Frontend:** Single-Page App (HTML5, Modern CSS Grid/Flexbox, Native JavaScript, Leaflet.js, OpenStreetMap)
- **Backend:** Node.js, Express.js
- **Database:** MySQL (`udyamsetu_db`) with SQL Haversine distance spatial routing

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server (running locally on port `3306`)

### Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/rajendersahni87-bit/UdyamSetu.git](https://github.com/rajendersahni87-bit/UdyamSetu.git)
   cd UdyamSetu/backend