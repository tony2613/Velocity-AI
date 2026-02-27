# VelocityAI Unit Economics & Business Model Analysis

This document provides a breakdown of VelocityAI's unit economics, monthly expenses, and break-even analysis based on our current pricing model and technology stack (Groq, PaddleOCR, Render, Neon).

## 1. Monthly Expenses (Fixed Infrastructure & Ops)
Our infrastructure is highly optimized, leveraging free tiers where possible and low-cost predictable hosting.

*   **Database (Neon)**: ₹0 (Generous free tier; scales smoothly later)
*   **Backend Hosting (Render/Replit)**: ~₹1,200 / month ($14 Standard Instance)
*   **Domains & DNS**: ~₹80 / month (Amortized yearly)
*   **Additional Operational/Tooling Costs**: ~₹2,200 / month (Bringing our total baseline up to the planned ₹3,480)

**Total Monthly Fixed Expenses: ~₹3,480 / month**

## 2. Cost Per User & Unit Economics
Our total cost to serve one active user is roughly **₹35.10 per month**. This breaks down into:

1.  **Variable Costs (AI & OCR)**: **~₹10.10 per user / month**
    *   **AI Inference (Groq)**: Blazing fast and cheap compared to alternatives like OpenAI.
    *   **OCR (PaddleOCR & PyMuPDF)**: Running locally on our own instance, completely eliminating 3rd-party API costs for document processing.
2.  **Amortized Fixed Costs**: **~₹25.00 per user / month**
    *   This represents our baseline ₹3,480 monthly infrastructure burn distributed across our initial user base. As we scale, this portion drops significantly.

**Total Cost Per User: ~₹35.10**

### Gross Profit Margins for Paid Tiers:

**Velocity Pro (₹99 / mo)**
*   **Revenue**: ₹99
*   **Total Cost**: ~₹35.10 
*   **Gross Profit**: **₹63.90 / user**
*   **Gross Margin**: **~64%** (Solid baseline margin)

**Velocity Elite (₹249 / mo)**
*   **Revenue**: ₹249
*   **Total Cost**: ~₹35.10
*   **Gross Profit**: **₹213.90 / user**
*   **Gross Margin**: **~85%** (Excellent scaling margin)

## 3. Break-Even Analysis (Phase 1: Sustainability)
Our first goal is "Ramen Profitability"—making enough to cover the **₹3,480** monthly server burn so the app sustains itself.

*   **If acquiring only Pro Users**: We need to cover ₹3,480 using our ₹63.90 profit per user. 
    `₹3,480 ÷ ₹63.90 = ~54.5`
    👉 **We only need 55 Pro Users to break even.**

*   **If acquiring only Elite Users**:
    `₹3,480 ÷ ₹213.90 = ~16.3`
    👉 **We only need 17 Elite Users to break even.**

---

**The Pitch**:
> *"Thanks to our engineered-from-scratch OCR pipeline, our total cost to serve one user is only ~₹35.10. Our monthly infrastructure burn is currently capped at roughly ₹3,480. **With just 55 paying users**, VelocityAI becomes a self-sustaining, profitable business."*
