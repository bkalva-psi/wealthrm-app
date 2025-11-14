Below is a **development plan and modularization blueprint** derived from your BRD (`BRD_MF_Order_Lifecycle_v1.0`, dated 13‑Nov‑2025) and cross‑checked against the underlying journey/spec documents in the knowledge base. It organizes the requirements into cohesive, independently developable services, shows sequencing and dependencies, and ends with **agent‑ready briefs** you can paste into OpenAI agents, OpenAI Codecs, or Cursor workspaces.

Key sources (examples shown inline throughout): BRD v1.0 high‑level flow, validations, UI/UX, access control, integrations, multi‑route routing; 360ONE/HSBC/SBI journey docs for status lifecycle, field/validation details, ARN transfer, and systematic plans.   Also see detailed operational flows for Switch/SIP/SWP from the Journey docs.

---

## A. At‑a‑Glance Module Map (independent services / micro‑frontends)

**Customer‑facing & Ops UI**

1. **RM Office UI** (order capture, review, submit) — Product Selection, Product Cart, scheme/order/doc/deviation overlays, Full Switch/Full Redemption read‑only display.  
2. **Client Portal UI** (T\&Cs, 2FA/OTP, self‑serve SIP/STP/SWP) — enforces no simultaneous inflow/outflow, masked contact, cut‑off disclaimers.  
3. **Operations Console** (systematic dashboards, MIS, slip/nomination downloads) — view status, failed/reattempts, bulk downloads per RTA.

**Core domain & orchestration** 4\) **Order Service** (capture, model order, status machine, audit) — submits to Authorization, exposes Order Book data. 5\) **Authorization Service** (claim/release/authorize/reject, reasons, escalations) — removes “Expired” process, shows next‑day NAV disclaimers if post cut‑off. 6\) **Order Book Service** (lifecycle, filters, downloads) — statuses Pending→Approved→In‑Progress→Executed→Settled/Failed/Reversal; role‑aware visibility. 7\) **Validation Engine** (CRISIL min/max, amount‑based, full redemption/switch, EUIN/PAN/nominee/guardian, RTA name rules) — centralized, reused by RM & Client flows. 8\) **2FA/OTP Service** (rules, contact‑source logic, MIS) — inflows & outflows, CBS vs Folio contact sources, MIS on mismatches. 9\) **Systematic Plans Service** (SIP/STP/SWP setup/modify/cancel, scheduler, reattempts) — daily jobs, retry windows, failure marking.

**Integrations** 10\) **Payments Adapter** (orderPaymentReference/pgPaymentReferenceNo mapping to Order Book, reconcile/pass‑through) — stored and shown in Payment Info. 11\) **Routing & Connectors Hub** (Save2/finalorderforsubmission orchestrator; RTA CFF/API; pluggable exchange adapter) — rule‑driven route selection by scheme/txn; IP/date/time stamping; bank field mapping. 12\) **RTA Connector – CAMS/KFintech** (CFF/field mapping incl. close‑AC, dividend instruction, bank fields) — conditional mandatory rules, IP logs. 13\) **Exchange Connector – Pluggable** (e.g., BSE Star) — interface defined now; field‑level spec deferred to a future connector as per BRD.

**Reference & support** 14\) **Masters & Reference** (CRISIL scheme master, fund cut‑offs, bank LOVs, branch mapping, product whitelist uploads) — drives validations, UI filters, visibility. 15\) **Nominee & Holding Pattern** (first‑time subs capture, SEBI Phase‑1, opt‑out handling, form generation & download per RTA) — percentage \= 100%, minor/guardian logic. 16\) **Folio/Investor Master Sync** (daily feeds) — used by 2FA contact‑source rules and routing decisions. 17\) **Audit & Entitlements** (role checks, IP/date/time stamping, branch visibility, logs, trace IDs) — enforced across all services. 18\) **Reports & MIS** (Systematic Plan Status, 2FA MIS, client reports with nominee display) — PDF/XLS outputs.

The above aligns to the BRD’s E2E flow and field inventory; Switch/SIP/SWP flows, overlays, and cart details follow the journey docs and BRD consolidation.

---

## B. What each module owns (scope highlights tied to BRD)

**RM Office UI** Order capture & review; fields for Investment/Settlement A/C, Branch Code, Mode (Physical/Email/Telephone), Nominee, Dividend Inst.; overlays (Scheme Info/Order Info/Docs/Deviation). Full Switch/Redemption shows as read‑only.

**Client Portal UI** T\&Cs page → OTP popup shows total amount \+ masked mobile; no simultaneous inflow/outflow; cut‑off disclaimers visible.

**Operations Console** Systematic dashboards (Active/Closed/Cancelled; Failed view with filters), bulk download of slips/nomination forms (zip by RTA), status monitoring.

**Order Service** Stateful order entity, model order number, persistence of payment refs, RTARefNo, and Save2/finalorderforsubmission outcomes; exposes Order Book.

**Authorization Service** Claim/release/authorize/reject with reason; removes “auto‑expire,” treats post cut‑off as next‑day and surfaces disclaimers.

**Order Book Service** Lifecycle statuses (Pending, Pending Approval, In Progress, Settlement Pending, Executed, Settled, Failed, Settlement Reversal), search & filters, role visibility, Payment Info panel.

**Validation Engine** CRISIL (min/max purchase, redemption amounts/units; SIP/STP/SWP limits), amount‑based max ≤ market value; Full redemption/switch bypass mins with close AC=Y; EUIN format; PAN/Guardian rules; nominee % \= 100; RTA naming constraints.

**2FA/OTP Service** Applies to inflows/outflows with date‑effective rules; CBS vs Folio contact selection; MIS for contact mismatches.

**Systematic Plans Service** SIP/STP/SWP setup/modify/cancel, scheduler windows and reattempt (e.g., initial \+ two retries before cut‑off, then mark failed).

**Payments Adapter** Persists `orderPaymentReference`, `pgPaymentReferenceNo`, `paymentlinkedstatus`, `payremarks`; exposes in Order Book Payment Info.

**Routing & Connectors Hub** Calls Save2 (with ModelOrderID, idempotency, structured success/failure) then finalorderforsubmission; chooses connector via rules; maps bank fields & IP/date/time to RTA logs.

**RTA Connector – CAMS/KFintech** CFF/API for close AC flags, dividend instruction, bank fields, conditional mandatory checks; includes ARN transfers handling in holdings (Ops/reporting impact).

**Exchange Connector – Pluggable** Interface defined now; detailed field specs deferred as per BRD’s “additional processors” note.

**Masters & Reference** Whitelisted scheme master upload drives fund visibility/transactions; fund cut‑offs at security level; bank LOVs; branch codes.

**Nominee & Holding Pattern** SEBI Phase‑1 changes (opt‑out, report display), first‑time subscription nominee capture (minor/guardian), multi‑nominee totals \= 100%, nomination form generation & RTA‑specific downloads.

**Folio/Investor Master Sync** Daily files feed 2FA contact source and routing logic.

**Audit & Entitlements** Role checks for RM/Branch/Supervisor/Ops/Client, branch visibility, IP/date/time stamping across flows, structured logging with trace IDs.

**Reports & MIS** Systematic Plan Status (PDF/XLS; filters, grouping), 2FA MIS (CBS vs Folio contact), client reports (Nominee or “Not Opted”).

Detailed Switch/SIP/SWP screens and field‑level tables are consistent with the journey docs and the BRD Appendix A extract.

---

## C. Build Sequencing & Dependencies

**Phase 0 – Foundations (parallelizable)**

* **Masters & Reference** (CRISIL master ingest, scheme whitelist upload, fund cut‑offs, bank LOVs, branches). **Blocks:** Validation Engine, RM/Client UI.  
* **Audit & Entitlements** (RBAC, branch visibility, IP stamp, trace IDs). **Blocks:** all UIs/services.  
* **Folio/Investor Master Sync** (daily jobs). **Feeds:** 2FA/OTP, Routing rules.

**Phase 1 – Core Order Placement**

* **Validation Engine** (CRISIL & business rules; EUIN/PAN/nominee). **Depends on:** Masters.  
* **RM Office UI** \+ **Order Service** (product selection/cart/overlays; model order; submit). **Depends on:** Validation, Entitlements.  
* **Authorization Service** (claim/release/authorize/reject). **Depends on:** Order Service.  
* **Order Book Service** (statuses & filters). **Depends on:** Order Service.

**Parallel in Phase 1:**

* **Client Portal UI** \+ **2FA/OTP Service** (T\&Cs, masked contact, no inflow+outflow). **Depends on:** Validation, Masters, Folio contacts.

**Phase 2 – Integrations & Payments**

* **Payments Adapter** (persist & surface payment refs). **Depends on:** Order Service, Order Book.  
* **Routing & Connectors Hub** \+ **RTA Connector(s)** (Save2/finalorderforsubmission, bank/IP stamping, CFF). **Depends on:** Order Service, Masters, Folio master.  
* **Reports & Notifications (basic)** (settlement/rejected emails/SMS). **Depends on:** Order lifecycle events.

**Phase 3 – Systematic Plans**

* **Systematic Plans Service** \+ **Schedulers** (setup/modify/cancel; reattempts; Ops dashboard). **Depends on:** Order Service, Routing.  
* **Operations Console** (systematic dashboard, downloads). **Depends on:** Systematic Plans Service, Order Book.

**Phase 4 – Multi‑Route Expansion**

* **Exchange Connector – Pluggable** (e.g., BSE Star) implementing the pre‑defined adapter interface. **Depends on:** Routing Hub.

**Phase 5 – MIS & Hardening**

* **Reports & MIS (full)** (Systematic Plan Status, 2FA MIS, client reports), NFR/perf/observability tuning, failure drills.

**Parallelization guidance:** Phase 0 can run entirely in parallel. During Phase 1, RM UI/Order/Authorization/Order Book can progress together with Client Portal \+ 2FA (shared Validation/Masters dependencies). Integration teams can stub Save2/finalorderforsubmission early using the BRD‑specified shapes.

---

## D. Module Dependency Matrix (selected)

| Module | Depends On | Can start in parallel with |
| :---- | :---- | :---- |
| Masters & Reference | — | All foundations |
| Audit & Entitlements | — | All foundations |
| Folio/Investor Master Sync | — | Masters |
| Validation Engine | Masters | Audit & Entitlements |
| RM Office UI | Validation, Entitlements | Authorization, Order Book |
| Client Portal UI | Validation, Folio contacts, 2FA | RM Office UI |
| Order Service | Entitlements | Validation |
| Authorization Service | Order Service | Order Book |
| Order Book | Order Service | Authorization |
| 2FA/OTP | Folio contacts, Entitlements | Client Portal UI |
| Payments Adapter | Order Service | Order Book |
| Routing Hub | Order Service, Masters | Payments Adapter |
| RTA Connector(s) | Routing Hub | Reports |
| Systematic Plans | Order Service, Routing | Ops Console |
| Operations Console | Systematic Plans, Order Book | Reports |
| Reports & MIS | Order lifecycle events | Ops Console |
| Exchange Connector | Routing Hub | — |

---

## E. Non‑functional, security, and audit expectations (cross‑cutting)

* **2FA/OTP** mandatory by txn type (inflow/outflow), contact source rules, masked UI; structured **MIS** on contact mismatches.  
* **Audit & traceability**: IP/date/time stamps at placement; structured logging with `orderId`, `modelOrderId`, `rtaRefNo`, payment refs; end‑to‑end trace IDs.  
* **Performance**: p95 ≤ 2s for Save2/finalorderforsubmission paths (configurable) and scheduler windows within cut‑off times.  
* **Security & visibility**: role‑aware Order Book; branch‑based visibility; reject reasons required; slip downloads controlled in Ops.  
* **Cut‑off handling**: “Expired” process removed; orders authorized after cut‑off treated as next‑day, with explicit disclaimers.

---

## F. Edge cases & compliance nuances to preserve

* **Full Redemption/Full Switch**: bypass min validations; **close AC \= Y**; do not auto‑round units; display the full flags read‑only in UI & Order Book.  
* **EUIN & PAN**: EUIN `E` \+ 6 chars; nominee/guardian PAN pattern checks; nominee % \= 100\.  
* **Systematic reattempts**: up to 3 runs before cut‑off; then mark failed; allow manual redemption if needed.  
* **RTA logging**: IP, date (DDMMYYYY), time (hhmmss); bank fields conditional mandatory; bank LOVs.  
* **Nominee Phase‑1**: physical/online capture, opt‑out handling, outbound feed updates; download forms per RTA format.

---

## G. Deliverables by phase (acceptance criteria excerpts)

**Phase 1**

* RM Office flow creates **Model Order** and submits for Authorization; **Order Book** shows Pending→Pending Approval; **reject reason** mandatory; **Full Switch/Redemption** visible read‑only.  
* Client Portal shows **T\&Cs → OTP** with masked contact; hard stops on simultaneous inflow/outflow.  
* Validation Engine enforces CRISIL min/max, amount‑based max ≤ market value, SIP/STP/SWP limits.

**Phase 2**

* Save2 returns **orderId**; finalorderforsubmission persists **orderPaymentReference** & **pgPaymentReferenceNo**; Payment Info panel renders both; **RTARefNo** captured.  
* RTA outbound file meets CAMS/KFintech mapping with **close AC**, **dividend instruction**, **bank fields**, **IP logs**.

**Phase 3**

* Ops dashboard lists **Active/Closed/Cancelled** and **Failed**, with filters and schedules; reattempt job windows configurable and logged.

**Phase 4**

* Routing Hub selects **RTA vs Exchange** via rules; exchange connector conforms to agreed adapter interface (field spec deferred).

**Phase 5**

* **Systematic Plan Status**, **2FA MIS**, and client reports (Nominee/Not Opted) export to PDF/XLS; observable system with trace IDs and error codes.

---

## H. Agent‑Ready Work Packets (copy/paste prompts)

**1\) Backend – “Order Service”** **Goal:** Implement order capture domain, model order, status transitions, events to Authorization/Order Book. **Scope:** Entities (Order, OrderItem, PaymentInfo), .events (`OrderSubmitted`, `OrderAuthorized`, `OrderRouted`, `OrderSettled`, `OrderFailed`, `OrderReversed`), persistence of `modelOrderId`, `orderPaymentReference`, `pgPaymentReferenceNo`, `rtaRefNo`. **Rules:** Respect BRD status model & no “Expired”; next‑day NAV disclaimers surfaced via status metadata.

**2\) Backend – “Validation Engine”** **Goal:** Central validation library callable from RM/Client/UI and APIs. **Rules to implement:** CRISIL min/max (purchase/redeem), amount‑based (max ≤ market; units auto‑calc but never auto‑round user‑declared), SIP/STP/SWP date/frequency/installment limits, EUIN pattern, PAN/Guardian/nominee %, RTA name rules, Full redemption/switch bypass with `closeAc=true`.

**3\) Backend – “Authorization Service”** **Goal:** Claim/release/authorize/reject with reason; publish authorization outcomes; remove “auto‑expire”. **UI metadata:** Provide `postCutoff=true` hint for disclaimers.

**4\) Backend – “Routing & Connectors Hub”** **Goal:** Orchestrate Save2 → finalorderforsubmission; abstract **Connector** interface; rule‑based route choice. **BRD Fields:** include `ModelOrderID`; map bank fields; stamp IP/date/time; store success/failure with remarks.

**5\) Backend – “RTA Connector (CAMS/KFin)”** **Goal:** Generate CFF/API payloads: **close AC**, dividend instruction, bank fields; conditional mandatory checks; log IP/date/time; return `rtaRefNo`.

**6\) Backend – “Payments Adapter”** **Goal:** Persist `orderPaymentReference`, `pgPaymentReferenceNo`, `paymentlinkedstatus`, `payremarks`. Expose to Order Book APIs.

**7\) Backend – “Systematic Plans Service”** **Goal:** SIP/STP/SWP setup/modify/cancel; scheduler & reattempt jobs (e.g., initial \+ two retries); failure marking; Ops dashboard APIs.

**8\) Frontend – “RM Office UI”** **Goal:** Product Selection & Cart with overlays (Scheme/Order/Docs/Deviation), Mode of Transaction, Nominee, Dividend Inst., read‑only Full Switch/Redemption.

**9\) Frontend – “Client Portal UI”** **Goal:** T\&Cs page → 2FA popup with masked contact and total amount; block inflow+outflow; show cut‑off disclaimers; convey Full Switch/Redemption read‑only.

**10\) Frontend – “Operations Console”** **Goal:** Systematic dashboards (filters, status, scheduler view), bulk downloads (slips/nomination forms per RTA), view Payment Info on orders.

**11\) Data – “Masters & Reference”** **Goal:** Ingest CRISIL master; maintain cut‑offs; whitelist upload; bank LOVs/branch mapping; daily Folio/Investor masters.

**12\) Security/Platform – “Entitlements & Audit”** **Goal:** Enforce RM/Branch/Supervisor/Ops/Client visibility; branch scoping; capture and store IP/date/time; emit trace IDs.

**13\) Reporting – “Reports & MIS”** **Goal:** Systematic Plan Status (grouping & filters), 2FA MIS (contact mismatches), client reports showing nominee details or “Not Opted”.

**14\) Optional – “Exchange Connector (Adapter)”** **Goal:** Implement adapter interface defined in Routing Hub to add exchange (e.g., BSE Star) without changing core flows; field spec to follow in a later spec.

---

## I. How this satisfies the BRD (trace highlights)

* **E2E process** from initiation → authorization → routing → settlement → notifications is preserved; Client Portal 2FA rules and disclaimers included.  
* **Integrations** implement Save2 & finalorderforsubmission changes incl. `ModelOrderID`, payment refs, and `rtaRefNo`.  
* **Validations** reflect CRISIL & business rules, amount‑based entries, and Full redemption/switch handling.  
* **Order Book & Ops tooling** align to status model, downloads, and systematic dashboards.  
* **Multi‑route routing** enables today’s RTA flows and future exchange connectors without core rewrites.

---

## J. Notes on overlaps and “latest wins”

Where earlier journey docs differed, the plan reflects the **latest BRD v1.0** positions (e.g., **remove auto‑expiry**, add payment refs to **finalorderforsubmission**, **read‑only full switch/redemption** fields, **2FA MIS**), while still honoring detailed behaviors in the journeys (status vocabulary, field patterns, ARN transfer behavior).

---

### Ready to execute

If you’d like, I can turn the “Agent‑Ready Work Packets” into **separate Markdown files or task tickets** by module, each with acceptance tests and API stubs (based strictly on the BRD and cited specs).  
