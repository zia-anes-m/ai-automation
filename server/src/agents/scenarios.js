export const DEMO_SCENARIOS = [
  {
    id: "climate-tech",
    title: "Plan a Climate Tech Startup",
    badge: "Startup Planning",
    budget: "$500K",
    timeline: "6 Months to MVP",
    prompt: "I have $500K and want to start a climate tech company focused on hyper-local urban heat mitigation and carbon accounting for commercial real estate. What should I build and how do I get to market in 6 months?",
    planner: {
      content: `## Executive Strategic Breakdown
Targeting commercial real estate (CRE) urban heat island mitigation and micro-climate carbon offset verification. The $500K seed budget requires a lean software-first and satellite/IoT sensor integration approach before heavy hardware deployment.

## Phase Breakdown
- Phase 1: Problem Validation & CRE Stakeholder Interviews (Est. Time: 3 Weeks) - Interview 35 facility managers and ESG directors across tier-1 cities.
- Phase 2: MVP Sensor + Satellite Micro-Grid Analytics Engine (Est. Time: 6 Weeks) - Combine Sentinel satellite thermography with lightweight sub-$50 environmental IoT nodes.
- Phase 3: Pilot Deployment in 3 Commercial Hubs (Est. Time: 8 Weeks) - Field test thermal envelope measurement and carbon accounting reporting.
- Phase 4: Enterprise GTM & Series-A Pipeline (Est. Time: 7 Weeks) - Convert pilot users to annual recurring contracts ($25k-$60k ACV).

## Dependencies & Execution Flow
- Phase 2 (Engine) cannot freeze architecture until Phase 1 (Customer requirements) completes 20+ validated interviews.
- Phase 3 pilots must run in parallel with early ESG certification audits to ensure compliance.

## Risk & Resource Estimates
- Primary resource bottleneck: Embedded IoT/Geospatial engineering talent and access to high-resolution urban heat data.

## Confidence: 92%
Reasoning: High market appetite driven by EU CSRD and SEC ESG reporting mandates; clear phased path to revenue before seed capital depletion.`,
      confidence: 92,
      reasoning: "Strong market tailwinds and proven customer pain point in commercial property compliance.",
      flaggedIssues: ["Need early hardware supply chain validation", "Risk of prolonged pilot cycles with enterprise REITs"]
    },
    executor: {
      content: `## Technical Implementation Roadmap
- Core Stack & Frameworks: Next.js 14 + TailwindCSS dashboard, FastAPI (Python) geospatial backend with GeoPandas and Shapely.
- Architecture & Patterns: Event-driven microservices architecture using Apache Kafka/RabbitMQ for high-throughput sensor telemetry ingestion.
- Infrastructure & Deployment: AWS ECS Fargate, TimescaleDB (PostgreSQL) for time-series climate telemetry, Tile38 for real-time spatial indexing, Mapbox GL for 3D thermal heat maps.

## Engineering Milestones
- Milestone 1 (Week 4): Ingestion pipeline processing Sentinel-2 thermal bands and OpenWeather API feeds into GeoJSON tile server.
- Milestone 2 (Week 8): Low-power LoRaWAN sensor firmware running on ESP32 microcontrollers transmitting ambient temperature & particulate data.
- Milestone 3 (Week 12): Automated ESG PDF Report Generator adhering to GHG Protocol Scope 1 & Scope 2 standards.

## Feasibility Analysis
- Feasibility Verdict: High (Software & IoT ingestion are standard; key complexity is automated calibration of satellite vs ground-truth sensor thermography).
- Critical Blockers: Hardware sensor lead times (6-8 weeks for customized enclosures) and city-level API rate limits.
- Required Profiles: 1 Lead Fullstack Eng, 1 Geospatial/Python Data Eng, 1 Contract Hardware Firmware Specialist.

## Confidence: 88%
Reasoning: Architectural patterns are proven; TimescaleDB and Mapbox offer turnkey stability for real-time geospatial rendering.`,
      confidence: 88,
      reasoning: "Clean separation of satellite ingestion and on-prem IoT telemetry minimizes technical debt.",
      flaggedIssues: ["Hardware lead times could delay Phase 3", "Sensor drift in extreme weather requires auto-calibration algorithms"]
    },
    critic: {
      content: `## Adversarial Risk Assessment
- Risk 1: Long Enterprise Sales Cycles (6-12 months) - Severity: Critical
  - Mitigation: Target mid-market prop-tech managers with self-serve 14-day micro-climate audits rather than enterprise REIT conglomerates upfront.
- Risk 2: Hardware Distraction & Cash Burn - Severity: High
  - Mitigation: Do NOT manufacture custom hardware! Use off-the-shelf certified LoRaWAN gateways (Milesight/Dragino) with white-labeled firmware.
- Risk 3: Satellite Thermal Resolution Discrepancy (60m resolution misses single rooftop heat leaks) - Severity: High
  - Mitigation: Use drone thermal imaging partners for high-density audits and utilize AI super-resolution downscaling models.

## Flawed Assumptions Under Question
- Assumption: "CRE building managers will pay upfront for carbon accounting."
  - Reality: Facility managers prioritize immediate HVAC energy cost savings over long-term CSRD ESG reports. Reposition the value proposition around 18% HVAC power reduction.

## Worst-Case Failure Scenarios
- Failure Mode: Seed runway exhausted at month 5 with 3 unpaid enterprise pilots stuck in legal review.
- Contingency Plan (Plan B): Pivot to automated municipal micro-climate risk scoring SaaS sold to insurance underwriters.

## Confidence: 84%
Reasoning: Identified 3 existential vulnerabilities in hardware over-engineering and B2B sales friction that would drain the $500k budget.`,
      confidence: 84,
      reasoning: "Strict financial and operational stress testing reveals critical need to strip custom hardware out of MVP.",
      flaggedIssues: ["Custom hardware manufacturing will exhaust seed capital", "Enterprise procurement cycles will kill runway", "Satellite resolution limits require drone partners"]
    },
    synthesizer: {
      content: `## Master Consensus Execution Plan
Synthesizing Planner's strategic phases, Executor's resilient geospatial stack, and Critic's risk-hardened operational guardrails into a streamlined 6-month launch plan.

1. **Strategic Pivot to Off-the-Shelf Hardware**: Eliminate custom PCB design. Procure standard LoRaWAN commercial sensors, saving $95,000 and 8 weeks of development time.
2. **Value Proposition Alignment**: Frame product as **'Thermal AI: 18% HVAC Energy Reduction & Automated ESG Compliance'** to secure budget from Operations rather than wait for ESG committees.
3. **Rapid Pilot Acceleration**: Deploy 14-day lightweight thermal assessments using public satellite data + drone imagery to convert customers before installing physical hardware.

## Multi-Agent Alignment & Consensus Points
- Alignment: All agents agree Next.js + FastAPI + TimescaleDB is the optimal, low-overhead software architecture.
- Alignment: Unanimous consensus that $500K is ample budget IF custom hardware manufacturing is strictly avoided.

## Resolved Disagreements & Trade-offs
- Conflict Point: Planner proposed 6-week custom sensor development; Critic warned of fatal cash drain.
- Synthesized Resolution: Executor builds firmware for off-the-shelf commercial nodes in 10 days, redirecting $80k savings to enterprise sales and pilot incentives.
- Strategic Rationale: Accelerates time-to-first-revenue by 60 days while keeping total burn under $42,000/month.

## Immediate Priority Action Items
1. Priority 1 (Days 1-14): Conduct 20 customer interviews focusing on commercial HVAC energy waste and launch satellite thermal landing page.
2. Priority 2 (Days 15-45): Deliver MVP cloud dashboard with Sentinel-2 ingestion and automated ESG score generator.
3. Priority 3 (Days 46-75): Onboard first 3 paid commercial pilot properties with off-the-shelf sensor kits.

## Confidence: 94%
Reasoning: Master plan eliminates high-risk hardware R&D, focuses on quantifiable ROI (HVAC savings), and preserves $210k of seed cushion for Series-A runway.`,
      confidence: 94,
      reasoning: "Harmonized roadmap eliminates single point of failures while delivering faster time-to-market.",
      flaggedIssues: []
    }
  },

  {
    id: "disaster-relief",
    title: "Design a Disaster Relief Operation",
    badge: "Crisis Coordination",
    budget: "Emergency Allocation",
    timeline: "First 48 Hours Post-Impact",
    prompt: "A magnitude 7.4 earthquake strikes a dense coastal metropolitan zone with collapsed bridges and severed cellular communication. Design a coordinated emergency response and resource allocation plan for the first 48 hours.",
    planner: {
      content: `## Executive Strategic Breakdown
Immediate crisis response prioritized into 4 distinct time-critical triage windows over the first 48 hours to minimize mortality and establish lifeline corridors.

## Phase Breakdown
- Phase 1: Rapid Reconnaissance & Search-and-Rescue Triage (Hours 0-6) - Deploy UAV swarm photogrammetry and acoustic sensor grid for trapped survivor detection.
- Phase 2: Mesh Communication & Lifeline Corridor Clearance (Hours 6-18) - Establish emergency Starlink/LoRa packet radio gateways and clear primary arterial access.
- Phase 3: Field Medical Mobilization & Clean Water Logistics (Hours 18-30) - Deploy Level-2 mobile surgical units and reverse-osmosis purification hubs.
- Phase 4: Evacuation Corridors & Supply Chain Stabilization (Hours 30-48) - Open maritime amphibious landing zones and helicopter air-bridges for critical evacuations.

## Dependencies & Execution Flow
- Medical triage deployment (Phase 3) strictly depends on securing heavy-lift bridge clearance or landing zones from Phase 2.
- Air-drop logistics require real-time mesh radio tracking to prevent dangerous crowd surges.

## Risk & Resource Estimates
- Critical bottleneck: Airspace collision risk between military, civilian, and drone fleets; acute potable water deficit within 24 hours.

## Confidence: 91%
Reasoning: Standardized FEMA Incident Command System (ICS) phase segmentation tailored for island/coastal isolation constraints.`,
      confidence: 91,
      reasoning: "Strict phased sequencing ensures life-saving assets reach high-density structural collapses in Golden Window.",
      flaggedIssues: ["Airspace deconfliction required", "Cellular blackout will paralyze uncoordinated volunteer squads"]
    },
    executor: {
      content: `## Technical Implementation Roadmap
- Core Stack & Systems: ATAK (Android Tactical Assault Kit) for field GIS tracking, OpenTAK server deployed on rugged edge servers.
- Communications Infrastructure: Off-grid VHF/UHF tactical radio repeaters + meshtastic LoRa pocket nodes distributed to first responder units; high-altitude tethered Starlink drone relays.
- Logistics & Resource Allocation: Dynamic linear optimization algorithms for fuel and helicopter payload distribution; QR-code NFC patient triage wristbands.

## Engineering Milestones
- Milestone 1 (Hour 3): Primary Tactical Operations Center (TOC) online with satellite backhaul and live thermal drone map streaming.
- Milestone 2 (Hour 12): Local LoRa peer-to-peer mesh covering a 15km radius for civilian SOS beacon reception.
- Milestone 3 (Hour 24): Digital triage dashboard tracking surgical bed capacity across all 4 regional field hospitals.

## Feasibility Analysis
- Feasibility Verdict: High operational readiness with pre-staged disaster relief tech kits.
- Critical Blockers: Jet A-1 helicopter fuel depots contaminated or unreachable; road bridge structural integrity unverified.
- Required Personnel: Incident Commander, 4 Search & Rescue Squad Leads, 2 Tactical Comm Engineers, 1 Chief Medical Officer.

## Confidence: 89%
Reasoning: ATAK and Meshtastic are combat-proven in zero-connectivity disaster zones.`,
      confidence: 89,
      reasoning: "Decentralized mesh networks eliminate reliance on severed fiber optic cables or cellular towers.",
      flaggedIssues: ["Fuel availability is single point of failure for aviation", "Need instant structural assessment before crossing bridges"]
    },
    critic: {
      content: `## Adversarial Risk Assessment
- Risk 1: Duplicate Aid & Chaos at Chokepoints - Severity: Critical
  - Mitigation: Establish a Unified Multi-Agency Command (ICS-201) with mandatory geofenced drop zones to prevent supply hoarding.
- Risk 2: Secondary Structural Collapses & Aftershocks - Severity: High
  - Mitigation: Install seismic motion tripwires on damaged high-rises with automatic siren alarms broadcast over LoRa mesh.
- Risk 3: Contaminated Water Outbreak (Cholera/Dysentery) - Severity: High
  - Mitigation: Pre-distribute chlorine purification tablets via drone payload drops directly into isolated neighborhoods at Hour 12.

## Flawed Assumptions Under Question
- Assumption: "Evacuation can be handled via land routes."
  - Reality: Ground liquefaction and collapsed bridges frequently render coastal highways impassable. Response MUST pivot immediately to maritime barges and amphibious vessels.

## Worst-Case Failure Scenarios
- Failure Mode: Complete comms jamming and friendly helicopter rotor collisions due to uncoordinated air traffic.
- Contingency Plan (Plan B): Enforce strict altitude ceiling bands (Drones <400ft, Medevac 1000-2500ft, Supply 3000ft+) and optical signaling beacons.

## Confidence: 86%
Reasoning: Highlighted lethal operational blindspots in maritime evacuation, aftershock hazards, and waterborne disease prevention.`,
      confidence: 86,
      reasoning: "Ground-truth disaster analysis shows more casualties occur in hours 24-48 from secondary hazards if unmitigated.",
      flaggedIssues: ["Coastal highways will be severed by liquefaction", "Secondary aftershocks will trap search teams", "Air traffic congestion requires strict altitude separation"]
    },
    synthesizer: {
      content: `## Master Consensus Execution Plan
Unified Multi-Agency 48-Hour Tactical Directive integrating rapid search, rugged mesh telecom, and maritime-first evacuation corridors.

1. **Immediate Tri-Tier Altitude & Comms Protocol (Hour 0-4)**:
   - Drones operate below 400ft AGL for thermal mapping; SAR helicopters allocated 1,000-2,500ft band.
   - Deploy 100 Meshtastic emergency emergency beacons across key community shelters.
2. **Maritime Amphibious Supply Corridor (Hour 6-24)**:
   - Bypass blocked bridges by establishing amphibious barge routes along the coastline for fuel, surgical supplies, and water purifiers.
3. **Automated Triage & Secondary Collapse Early-Warning (Hour 12-48)**:
   - Equip search teams with seismic vibration sensors linked to emergency sirens to protect first responders against magnitude 6+ aftershocks.

## Multi-Agent Alignment & Consensus Points
- Alignment: All agents agree that communications blackout is the primary hazard to resolve in Hour 0-6.
- Alignment: Unanimous agreement on ATAK/Meshtastic software protocol for zero-infrastructure telemetry.

## Resolved Disagreements & Trade-offs
- Conflict Point: Planner relied heavily on clearing land highway bridges; Critic demonstrated coastal liquefaction makes bridges impassable.
- Synthesized Resolution: Master plan pivots 70% of heavy logistics to maritime naval/barge assets, preserving land clearance exclusively for light emergency ATVs.
- Strategic Rationale: Guarantees uninterrupted heavy supply lines even if all main bridges remain destroyed.

## Immediate Priority Action Items
1. Priority 1 (Hour 0-6): Stand up Starlink tactical edge command node & launch autonomous thermal drone mapping flights.
2. Priority 2 (Hour 6-18): Launch maritime ferry route and deploy portable water purification units.
3. Priority 3 (Hour 18-48): Execute targeted surgical triage using live NFC patient tracking.

## Confidence: 96%
Reasoning: Comprehensive strategy eliminates dependence on vulnerable land infrastructure while ensuring full redundancy in communications and air safety.`,
      confidence: 96,
      reasoning: "Flawless multi-domain synthesis addressing logistics, comms, medical triage, and responder safety.",
      flaggedIssues: []
    }
  },

  {
    id: "ai-safety",
    title: "Build an AI Safety Framework",
    badge: "AI Governance & Alignment",
    budget: "Enterprise Scale",
    timeline: "Continuous Deployment",
    prompt: "Design a comprehensive multi-layered AI Safety and Alignment framework for an autonomous multi-modal LLM enterprise deployment, covering prompt injection defense, hallucination monitoring, red-teaming, and human-in-the-loop overrides.",
    planner: {
      content: `## Executive Strategic Breakdown
Engineering a defense-in-depth AI safety architecture spanning pre-inference guardrails, real-time runtime monitoring, adversarial red-teaming, and post-generation governance.

## Phase Breakdown
- Phase 1: Threat Modeling & Alignment Taxonomy Definition (Est. Time: 3 Weeks) - Map OWASP Top 10 for LLMs, jailbreak vectors, PII leakage, and unauthorized tool execution.
- Phase 2: In-Line Gateway & Semantic Guardrails (Est. Time: 5 Weeks) - Deploy dual-model semantic classifiers (Llama Guard / NeMo Guardrails) for input sanitation and output filtering.
- Phase 3: Automated Adversarial Red-Teaming Engine (Est. Time: 6 Weeks) - Construct autonomous multi-turn attack agents generating mutation fuzzing and prompt injection tests.
- Phase 4: Real-time Uncertainty & Human-in-the-Loop Arbitration (Est. Time: 4 Weeks) - Implement entropy/confidence scoring triggers routing low-certainty actions to human reviewers.

## Dependencies & Execution Flow
- Gateway deployment (Phase 2) requires the taxonomy rules defined in Phase 1.
- Production autonomy escalation requires passing 99.5% threshold on automated red-teaming benchmarks (Phase 3).

## Risk & Resource Estimates
- Primary resource constraint: Latency overhead introduced by multi-layer semantic guardrails during real-time user inference.

## Confidence: 90%
Reasoning: Layered defense-in-depth model adheres to NIST AI RMF and ISO 42001 governance standards.`,
      confidence: 90,
      reasoning: "Systematic categorization covers entire lifecycle from input ingestion to tool execution.",
      flaggedIssues: ["Guardrail inference latency could degrade user UX", "Adversarial evasion through multi-lingual or steganographic prompts"]
    },
    executor: {
      content: `## Technical Implementation Roadmap
- Core Stack & Frameworks: Rust-based proxy gateway (Envoy + custom WASM filter), Python Guardrail Workers (NeMo Guardrails, Guardrails AI, LangKit).
- Architecture & Patterns: Zero-trust sidecar proxy pattern intercepting all LLM completions; embedding-based vector similarity checks against known vector jailbreak clusters.
- Storage & Observability: OpenTelemetry tracing, ClickHouse for immutable prompt-response audit logs, Prometheus/Grafana for safety trigger telemetry.

## Engineering Milestones
- Milestone 1: Under-15ms sub-millisecond regex & embedding token safety filter intercepting 90% of basic prompt injections.
- Milestone 2: Asynchronous secondary LLM-as-a-judge auditor validating high-risk tool invocations with JSON-schema enforcement.
- Milestone 3: Webhook-based Human-in-the-Loop review portal with Slack/PagerDuty escalation triggers for high-entropy outputs.

## Feasibility Analysis
- Feasibility Verdict: Feasible with optimized inference caching and streaming token inspection.
- Critical Blockers: High GPU cluster compute costs for running dedicated safety classifier models alongside foundation LLMs.
- Required Engineering: 1 Security/Rust Systems Engineer, 1 AI Alignment Specialist, 1 Fullstack Observability Dev.

## Confidence: 87%
Reasoning: Rust WASM proxy keeps latency under budget while ClickHouse provides compliant tamper-proof audit trails.`,
      confidence: 87,
      reasoning: "WASM edge filters minimize latency degradation to under 20ms.",
      flaggedIssues: ["Compute costs for dedicated safety models", "Complex multi-turn state tracking across distributed sessions"]
    },
    critic: {
      content: `## Adversarial Risk Assessment
- Risk 1: Adaptive & Indirect Prompt Injections via RAG / Tool Calling - Severity: Critical
  - Mitigation: Isolate retrieved external documents in sandboxed context frames; enforce strict read-only execution permissions unless explicit user re-authorization is provided.
- Risk 2: Over-Refusal & False Positive Hallucination Flagging - Severity: High
  - Mitigation: Implement calibrated uncertainty sampling (token logprob entropy) rather than binary keyword bans to prevent degrading model utility.
- Risk 3: Model Drift & Safety Degradation Post-Fine-Tuning - Severity: High
  - Mitigation: CI/CD automated safety regression test gate blocking deployment if safety benchmark score drops by >0.1%.

## Flawed Assumptions Under Question
- Assumption: "A single guardrail model at the API boundary is sufficient."
  - Reality: Jailbreaks frequently bypass top-level filters using encoded ciphers (Base64, Rot13) or roleplay personas. Protection must be enforced at the Tool Execution layer via capability containment.

## Worst-Case Failure Scenarios
- Failure Mode: An agent receives an indirect prompt injection via an ingested email, triggering unauthorized database exfiltration.
- Contingency Plan (Plan B): Hard cryptographic policy engine (Open Policy Agent) that validates SQL queries against strict row-level security before execution.

## Confidence: 89%
Reasoning: Pinpointed critical risks in indirect RAG injection and capability over-permissioning that perimeter filters fail to catch.`,
      confidence: 89,
      reasoning: "Perimeter defenses are insufficient against indirect injection; tool execution layer security is mandatory.",
      flaggedIssues: ["Indirect injection via retrieved documents", "Excessive false positives alienate users", "Need cryptographic tool capability control"]
    },
    synthesizer: {
      content: `## Master Consensus Execution Plan
Comprehensive 4-Tier Zero-Trust AI Safety Architecture fusing fast WASM perimeter filtering, cryptographic capability control, and continuous adversarial fuzzing.

1. **Tier 1: High-Speed Perimeter WASM Filter (<15ms)**:
   - Filter known jailbreak embeddings, PII, and prompt injection signatures before hitting the main LLM.
2. **Tier 2: Dual-Context Sandboxing for RAG & Tool Execution**:
   - Treat all external data (web pages, user documents, emails) as untrusted tainted inputs with strict Open Policy Agent (OPA) permission gates.
3. **Tier 3: Calibrated Uncertainty & Token Entropy Scoring**:
   - Continuously evaluate generation confidence; automatically route outputs with high perplexity or high-stakes actions (financial transfers, data deletion) to Human-in-the-Loop review.
4. **Tier 4: Automated Continuous Red-Teaming CI/CD**:
   - Daily automated attack mutations running 500+ adversarial scenarios to catch model drift prior to release.

## Multi-Agent Alignment & Consensus Points
- Alignment: All agents agree that defense must be multi-layered and cannot rely solely on system prompts.
- Alignment: Unanimous consensus that tamper-proof ClickHouse logging is necessary for audit compliance.

## Resolved Disagreements & Trade-offs
- Conflict Point: Executor proposed heavy secondary LLM verification on every token (high cost & latency); Critic warned of unacceptable latency.
- Synthesized Resolution: Adopt a tiered approach: Fast Rust WASM filter handles 95% of traffic, reserving secondary LLM evaluation solely for high-risk tool invocations.
- Strategic Rationale: Maintains sub-30ms latency while ensuring 100% inspection coverage for destructive tool calls.

## Immediate Priority Action Items
1. Priority 1 (Weeks 1-2): Deploy Rust WASM proxy filter with OWASP Top 10 LLM detection rules.
2. Priority 2 (Weeks 3-5): Implement sandboxed tool execution engine with cryptographic OPA permission checks.
3. Priority 3 (Weeks 6-8): Launch automated continuous red-teaming pipeline with regression telemetry dashboard.

## Confidence: 95%
Reasoning: Combines ultra-low latency runtime defense with ironclad capability containment and automated vulnerability scanning.`,
      confidence: 95,
      reasoning: "Eliminates blindspots in tool execution and RAG poisoning while keeping runtime latency within enterprise SLA.",
      flaggedIssues: []
    }
  }
];
