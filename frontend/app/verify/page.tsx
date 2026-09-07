"use client";

import { useState, useEffect, useRef } from "react";
import { verifyCaller } from "@/lib/api";
import VerificationBadgeCard from "@/components/VerificationBadgeCard";
import { PolicyRiskPreviewNote } from "@/components/PolicyNote";
import clsx from "clsx";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building2,
  MapPin,
  Phone,
  Zap,
  RotateCcw,
  BookOpen,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PhoneCall,
  Info,
  ExternalLink,
} from "lucide-react";

// ─── Preset Scenarios for 1-Click Testing ──────────────────────────────────────
interface DemoScenario {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  org: string;
  branch: string;
  city: string;
  callerId: string;
  description: string;
  threatLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "LOW";
  threatScore: number;
  expectedResult: {
    orgState: "verified" | "unknown";
    branchState: "verified" | "inconsistent" | "unknown";
    callerKnown: boolean;
  };
  stages: {
    stage1: { title: string; detail: string; status: "success" | "warning" | "danger" };
    stage2: { title: string; detail: string; status: "success" | "warning" | "danger" };
    stage3: { title: string; detail: string; status: "success" | "warning" | "danger" };
    stage4: { title: string; detail: string; status: "success" | "warning" | "danger" };
    stage5: { title: string; detail: string; status: "success" | "warning" | "danger" };
  };
  evidence: {
    severity: "critical" | "high" | "medium" | "low" | "info";
    title: string;
    description: string;
  }[];
  recommendation: string;
}

const PRESET_SCENARIOS: DemoScenario[] = [
  {
    id: "scen-impersonation",
    name: "🚨 High-Risk Impersonation Scam",
    badge: "CRITICAL THREAT",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
    org: "Demo Bank",
    branch: "Delhi",
    city: "New Delhi",
    callerId: "+91-98765-43210",
    description:
      "Vishing attacker claims to be from Demo Bank's 'Delhi Main Branch' using an unlisted VoIP mobile number. Branch doesn't exist in the bank's directory.",
    threatLevel: "CRITICAL",
    threatScore: 92,
    expectedResult: {
      orgState: "verified",
      branchState: "inconsistent",
      callerKnown: false,
    },
    stages: {
      stage1: {
        title: "Authority Match Confirmed",
        detail: "Entity 'Demo Bank' resolved in authorized financial institution directory.",
        status: "success",
      },
      stage2: {
        title: "Branch Jurisdictional Inconsistency",
        detail: "FATAL: Demo Bank has branches in Chennai, Coimbatore, Bangalore, Hyderabad. 'Delhi' is an unregistered fictitious branch.",
        status: "danger",
      },
      stage3: {
        title: "Unlisted VoIP / Mobile CLI",
        detail: "Number '+91-98765-43210' is not an official PRI line. High probability of SIP trunk CLI spoofing.",
        status: "danger",
      },
      stage4: {
        title: "Multi-Factor Impersonation Detected",
        detail: "Entity is valid, but branch & phone claim are fabricated. Hallmarks of targeted financial phishing.",
        status: "danger",
      },
      stage5: {
        title: "Immediate Action Required",
        detail: "BLOCK & REJECT. Do not disclose OTP, PIN, or account identifiers. Report to National Cyber Crime portal (1930).",
        status: "danger",
      },
    },
    evidence: [
      {
        severity: "critical",
        title: "Branch Record Inconsistency",
        description: "'Delhi' is not a known branch of Demo Bank in the demo directory. Scammer is inventing branch authority.",
      },
      {
        severity: "high",
        title: "Unregistered Telephony CLI (+91-98765-43210)",
        description: "Caller ID does not match any registered corporate line for Demo Bank. Personal mobile or spoofed VoIP trunk detected.",
      },
      {
        severity: "medium",
        title: "Canonical Name Impersonation",
        description: "Legitimate corporate entity name is being exploited to establish false trust with the customer.",
      },
    ],
    recommendation:
      "TERMINATE CALL IMMEDIATELY. This caller is not authorized by Demo Bank. Official representatives never operate from personal numbers or fictitious branch locations. Never share OTP or net-banking credentials.",
  },
  {
    id: "scen-suspicious-spoof",
    name: "⚠️ Suspicious Unlisted Number (Spoof Risk)",
    badge: "HIGH RISK",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    org: "Demo Bank",
    branch: "Chennai",
    city: "Chennai",
    callerId: "+91-98210-44912",
    description:
      "Caller accurately names Demo Bank's genuine Chennai branch, but calls from an unlisted personal mobile number claiming to be a loan manager.",
    threatLevel: "HIGH",
    threatScore: 72,
    expectedResult: {
      orgState: "verified",
      branchState: "verified",
      callerKnown: false,
    },
    stages: {
      stage1: {
        title: "Organization Verified",
        detail: "'Demo Bank' matches regulatory banking entity records.",
        status: "success",
      },
      stage2: {
        title: "Branch & City Validated",
        detail: "Chennai branch is an authentic registered branch of Demo Bank in Tamil Nadu.",
        status: "success",
      },
      stage3: {
        title: "Unverified Caller ID Line",
        detail: "WARNING: Caller ID '+91-98210-44912' is NOT on file. Bank branch staff are prohibited from using unlogged personal numbers.",
        status: "warning",
      },
      stage4: {
        title: "Partial Trust Anomaly",
        detail: "Publicly accessible branch data matched, but telephony channel lacks institutional attestation.",
        status: "warning",
      },
      stage5: {
        title: "Out-of-Band Verification Mandated",
        detail: "Do not execute transactions. Request officer employee ID and perform an independent callback.",
        status: "warning",
      },
    },
    evidence: [
      {
        severity: "high",
        title: "Unverified Personal Calling Line",
        description: "Caller ID '+91-98210-44912' is not in Demo Bank's authorized trunk registry. Telephony spoofing cannot be ruled out.",
      },
      {
        severity: "low",
        title: "Valid Branch Claim",
        description: "Branch name and city match authorized registry, but branch addresses are public knowledge and alone do not authenticate the caller.",
      },
      {
        severity: "info",
        title: "STIR/SHAKEN Attestation Missing",
        description: "No cryptographic token links this incoming call to Demo Bank's registered enterprise telephony PBX.",
      },
    ],
    recommendation:
      "PROCEED WITH CAUTION. Hang up and call the official Demo Bank Chennai branch number listed on the official website or your account passbook. Do not rely on inbound caller claims.",
  },
  {
    id: "scen-verified-pri",
    name: "✅ Verified Official Bank PRI Trunk",
    badge: "OFFICIAL TRUNK",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    org: "Demo Bank",
    branch: "Chennai",
    city: "Chennai",
    callerId: "+91-DEMO-1000",
    description:
      "All credentials match registered records: Demo Bank Chennai branch calling from official Primary Rate Interface (PRI) trunk line.",
    threatLevel: "LOW",
    threatScore: 18,
    expectedResult: {
      orgState: "verified",
      branchState: "verified",
      callerKnown: true,
    },
    stages: {
      stage1: {
        title: "Organization Verified",
        detail: "'Demo Bank' matches authorized corporate directory records.",
        status: "success",
      },
      stage2: {
        title: "Branch Location Verified",
        detail: "Chennai branch confirmed active in Tamil Nadu circle.",
        status: "success",
      },
      stage3: {
        title: "Known Corporate PRI Line",
        detail: "Caller ID '+91-DEMO-1000' is registered to Demo Bank. Note: Telephony CLI can still be spoofed via VoIP.",
        status: "success",
      },
      stage4: {
        title: "Multi-Factor Consistency",
        detail: "All directory claims cross-validate with institutional records.",
        status: "success",
      },
      stage5: {
        title: "Standard Verification Protocol",
        detail: "Channel is consistent. Under RBI guidelines, legitimate bank staff will NEVER ask for OTP, CVV, or PIN.",
        status: "success",
      },
    },
    evidence: [
      {
        severity: "info",
        title: "Organization & Branch Confirmed",
        description: "Demo Bank (Chennai branch) matches official directory records.",
      },
      {
        severity: "info",
        title: "Registered Corporate Trunk",
        description: "Caller ID matches official number on file for Demo Bank in the directory.",
      },
      {
        severity: "medium",
        title: "Telephony Spoofing Policy Advisory",
        description: "Even when caller ID matches, telecom CLI is inherently spoofable. Independent verification is always recommended for sensitive requests.",
      },
    ],
    recommendation:
      "CALL APPEARS OFFICIAL, BUT ZERO-TRUST RULES APPLY. Demo Bank confirmed this number is on file. However, legitimate bank representatives will never ask for your net-banking password, OTP, or debit card PIN.",
  },
  {
    id: "scen-unregistered-agency",
    name: "🛑 Fake Regulatory / Cyber Cell Scam",
    badge: "UNREGISTERED ENTITY",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    org: "National Cyber Crime Wing",
    branch: "Central Cyber Cell",
    city: "New Delhi",
    callerId: "+91-11-23456789",
    description:
      "Impersonates law enforcement or cyber defense cells in a 'Digital Arrest' scam to coerce money transfers into 'safe RBI accounts'.",
    threatLevel: "CRITICAL",
    threatScore: 96,
    expectedResult: {
      orgState: "unknown",
      branchState: "unknown",
      callerKnown: false,
    },
    stages: {
      stage1: {
        title: "Entity Not In Authorized Registry",
        detail: "FATAL: 'National Cyber Crime Wing' does not match any recognized entity in the regulated registry.",
        status: "danger",
      },
      stage2: {
        title: "Branch Verification Aborted",
        detail: "Cannot verify branch for an unverified or bogus organization claim.",
        status: "danger",
      },
      stage3: {
        title: "Unauthenticated Landline CLI",
        detail: "CLI spoofing suspected. Government and law enforcement agencies do not conduct trials or arrests via telephone/video call.",
        status: "danger",
      },
      stage4: {
        title: "Digital Arrest Modus Operandi",
        detail: "Entity mismatch conforms to known 'digital arrest' extortion scams.",
        status: "danger",
      },
      stage5: {
        title: "Emergency Security Protocol",
        detail: "IMMEDIATELY HANG UP. No government agency will ever demand video calls or money transfers for clearance.",
        status: "danger",
      },
    },
    evidence: [
      {
        severity: "critical",
        title: "Unregistered Organization Claim",
        description: "'National Cyber Crime Wing' is not an authorized financial or regulatory entity in the directory.",
      },
      {
        severity: "critical",
        title: "Digital Arrest Scam Signature",
        description: "Fictitious law enforcement claims are a documented high-impact extortion vector.",
      },
      {
        severity: "high",
        title: "Unverified Caller ID",
        description: "Number '+91-11-23456789' is not tied to any official communication dispatch registry.",
      },
    ],
    recommendation:
      "CRITICAL FRAUD ALERT — DO NOT COMPLY. Law enforcement agencies (Police, CBI, ED, RBI) NEVER place citizens under 'digital arrest' or demand funds transfer. Hang up immediately and lodge a complaint on cybercrime.gov.in.",
  },
];

// ─── 5-Stage Pipeline Definitions ─────────────────────────────────────────────
const PIPELINE_STAGES = [
  {
    step: 1,
    id: "stage-org",
    name: "Organization Registry Lookup",
    icon: Building2,
    focus: "RBI / TRAI Regulated Entity Whitelist",
    explanation:
      "VoiceShield AI canonicalizes the claimed organization name and queries the national directory of regulated financial institutions and authorized telecom operators. This immediately weeds out fabricated entity names, homoglyphic typo-squats, and spoofed regulatory bodies.",
  },
  {
    step: 2,
    id: "stage-branch",
    name: "Branch & Geolocation Consistency",
    icon: MapPin,
    focus: "IFSC & Circle Jurisdiction Cross-Match",
    explanation:
      "The claimed branch and city are validated against the institution's official branch network. Vishing rings commonly claim prestigious metropolitan branches (e.g. Mumbai, Delhi) while operating outside legitimate jurisdictions. Inconsistent branches trigger immediate fraud alarms.",
  },
  {
    step: 3,
    id: "stage-cli",
    name: "Caller-ID & Telephony CLI Analysis",
    icon: Phone,
    focus: "PRI Trunks, Toll-Free Gateways & Spoofing Risks",
    explanation:
      "In legacy SS7 and modern SIP VoIP telephony, Caller ID (CLI) is trivially spoofable by altering the 'From:' header. VoiceShield AI checks whether the number is a registered corporate PRI trunk and explicitly enforces zero-trust: even matching numbers require independent callback verification.",
  },
  {
    step: 4,
    id: "stage-matrix",
    name: "Multi-Factor Threat Matrix",
    icon: ShieldAlert,
    focus: "Composite Trust Vector & Anomaly Detection",
    explanation:
      "Combines [Entity Validity, Branch Consistency, Telephony Line Status] into a unified trust assessment. An attacker might know a public bank address or spoof an official phone number, but fabricating all three orthogonal dimensions exposes anomalies.",
  },
  {
    step: 5,
    id: "stage-advisory",
    name: "Regulatory Policy & Forensic Action",
    icon: ShieldCheck,
    focus: "RBI DPSS & TRAI TCCCPR Protection Directive",
    explanation:
      "Translates forensic findings into plain-English consumer directives. Formulates an immediate recommended protocol (e.g. hang up, call official branch from debit card, dial 1930) aligned with RBI Zero-Liability customer protection policies.",
  },
];

export default function VerifyPage() {
  const [org, setOrg] = useState("Demo Bank");
  const [branch, setBranch] = useState("Delhi");
  const [city, setCity] = useState("New Delhi");
  const [callerId, setCallerId] = useState("+91-98765-43210");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Demo Pipeline State
  const [activeScenario, setActiveScenario] = useState<DemoScenario>(PRESET_SCENARIOS[0]);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<number>(0);
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [expandedStage, setExpandedStage] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<"demo" | "form" | "guide">("demo");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer
  useEffect(() => {
    const currentTimer = timerRef.current;
    return () => {
      if (currentTimer) clearInterval(currentTimer);
    };
  }, []);

  // Handle Scenario Selection
  function handleSelectScenario(scen: DemoScenario) {
    setActiveScenario(scen);
    setOrg(scen.org);
    setBranch(scen.branch);
    setCity(scen.city);
    setCallerId(scen.callerId);
    setPipelineComplete(false);
    setPipelineStage(0);
    setPipelineProgress(0);
  }

  // Run 1-Click Interactive Demo Pipeline
  async function run1ClickDemo(scenarioToRun = activeScenario) {
    if (pipelineRunning) return;
    setPipelineRunning(true);
    setPipelineComplete(false);
    setPipelineStage(1);
    setPipelineProgress(15);
    setExpandedStage(1);

    // Call real backend API in parallel to populate badge cards
    try {
      const apiRes = await verifyCaller({
        claimed_organization: scenarioToRun.org || undefined,
        claimed_branch: scenarioToRun.branch || undefined,
        claimed_city: scenarioToRun.city || undefined,
        caller_id: scenarioToRun.callerId || undefined,
      });
      setResult(apiRes);
    } catch {
      // If offline or network error, fallback to simulated expected result
      setResult({
        organization: {
          state: scenarioToRun.expectedResult.orgState,
          claimed_organization: scenarioToRun.org,
          matched_organization: scenarioToRun.expectedResult.orgState === "verified" ? scenarioToRun.org : undefined,
          reason:
            scenarioToRun.expectedResult.orgState === "verified"
              ? "Organization name matches an entry in the demo verification directory."
              : `'${scenarioToRun.org}' does not match any organization in the demo directory.`,
          is_fictional_demo_data: true,
        },
        branch: {
          state: scenarioToRun.expectedResult.branchState,
          claimed_branch: scenarioToRun.branch,
          reason:
            scenarioToRun.expectedResult.branchState === "verified"
              ? "Branch/location is consistent with the demo directory."
              : scenarioToRun.expectedResult.branchState === "inconsistent"
              ? `'${scenarioToRun.branch}' is not a known branch of ${scenarioToRun.org} in the demo directory.`
              : "Organization is unverified or unknown, so branch cannot be checked.",
          is_fictional_demo_data: true,
        },
        caller: {
          state: "requires_independent_verification",
          caller_id_known: scenarioToRun.expectedResult.callerKnown,
          reason: scenarioToRun.expectedResult.callerKnown
            ? "Caller ID matches a number on file for the claimed organization in the demo directory, but caller ID can be spoofed and is never treated as sole proof of identity."
            : "Caller ID does not match any number on file for the claimed organization. Caller ID alone — even if it matched — would not prove identity.",
        },
      });
    }

    // Step through the 5 stages with smooth simulated audit progression
    const stageDelays = [
      { stage: 1, progress: 20, expand: 1, delay: 500 },
      { stage: 2, progress: 45, expand: 2, delay: 1100 },
      { stage: 3, progress: 70, expand: 3, delay: 1100 },
      { stage: 4, progress: 90, expand: 4, delay: 1100 },
      { stage: 5, progress: 100, expand: 5, delay: 1000 },
    ];

    for (const step of stageDelays) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      setPipelineStage(step.stage);
      setPipelineProgress(step.progress);
      setExpandedStage(step.expand);
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    setPipelineRunning(false);
    setPipelineComplete(true);
  }

  // Handle Manual Form Verification
  async function handleManualVerify() {
    setLoading(true);
    try {
      const res = await verifyCaller({
        claimed_organization: org || undefined,
        claimed_branch: branch || undefined,
        claimed_city: city || undefined,
        caller_id: callerId || undefined,
      });
      setResult(res);

      // Create a matching dynamic demo scenario view
      const orgState = res.organization?.state || "unknown";
      const branchState = res.branch?.state || "unknown";
      const callerKnown = Boolean(res.caller?.caller_id_known);

      let threatScore = 30;
      let threatLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "LOW" = "LOW";
      if (orgState !== "verified") {
        threatScore = 95;
        threatLevel = "CRITICAL";
      } else if (branchState === "inconsistent") {
        threatScore = 90;
        threatLevel = "CRITICAL";
      } else if (!callerKnown) {
        threatScore = 70;
        threatLevel = "HIGH";
      } else {
        threatScore = 20;
        threatLevel = "LOW";
      }

      const customScenario: DemoScenario = {
        id: "custom",
        name: `Analysis for ${org || "Caller"}`,
        badge: threatLevel,
        badgeColor:
          threatLevel === "CRITICAL"
            ? "bg-red-500/20 text-red-300 border-red-500/40"
            : threatLevel === "HIGH"
            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        org: org,
        branch: branch,
        city: city,
        callerId: callerId,
        description: `Custom evaluation for organization claim '${org}', branch '${branch}', caller '${callerId}'.`,
        threatLevel,
        threatScore,
        expectedResult: {
          orgState: orgState === "verified" ? "verified" : "unknown",
          branchState:
            branchState === "verified"
              ? "verified"
              : branchState === "inconsistent"
              ? "inconsistent"
              : "unknown",
          callerKnown,
        },
        stages: {
          stage1: {
            title: orgState === "verified" ? "Organization Verified" : "Organization Unregistered",
            detail: res.organization?.reason || "Checked against demo directory.",
            status: orgState === "verified" ? "success" : "danger",
          },
          stage2: {
            title:
              branchState === "verified"
                ? "Branch Consistent"
                : branchState === "inconsistent"
                ? "Branch Inconsistent"
                : "Branch Check Inconclusive",
            detail: res.branch?.reason || "Branch lookup performed.",
            status: branchState === "verified" ? "success" : "danger",
          },
          stage3: {
            title: callerKnown ? "Registered Corporate Trunk" : "Unverified Calling Line",
            detail: res.caller?.reason || "Caller ID check against registered numbers.",
            status: callerKnown ? "success" : "warning",
          },
          stage4: {
            title: "Multi-Factor Synthesis",
            detail: `Overall calculated identity threat rating: ${threatScore}/100 (${threatLevel}).`,
            status: threatLevel === "CRITICAL" ? "danger" : threatLevel === "HIGH" ? "warning" : "success",
          },
          stage5: {
            title: "Policy Directive",
            detail:
              threatLevel === "CRITICAL"
                ? "Immediate threat: Reject call and refuse disclosure of confidential information."
                : "Mandatory zero-trust: Independent out-of-band verification required.",
            status: threatLevel === "CRITICAL" ? "danger" : "warning",
          },
        },
        evidence: [
          {
            severity: orgState === "verified" ? "info" : "critical",
            title: `Organization: ${res.organization?.reason ? "Directory status" : "Result"}`,
            description: res.organization?.reason || "No claim provided.",
          },
          {
            severity: branchState === "verified" ? "low" : branchState === "inconsistent" ? "critical" : "medium",
            title: `Branch / Location: ${branch || "Not specified"}`,
            description: res.branch?.reason || "Branch evaluation completed.",
          },
          {
            severity: callerKnown ? "info" : "high",
            title: `Caller ID: ${callerId || "None"}`,
            description: res.caller?.reason || "Caller ID verification completed.",
          },
        ],
        recommendation:
          threatLevel === "CRITICAL"
            ? "TERMINATE CALL IMMEDIATELY. Inconsistencies detected in caller identity claims. Never disclose OTP, PIN, or banking passwords."
            : "PROCEED WITH OUT-OF-BAND VERIFICATION. Even if numbers match, telephony CLI can be forged. Call the institution back using their publicly verified number.",
      };

      setActiveScenario(customScenario);
      setPipelineComplete(true);
      setPipelineStage(5);
      setPipelineProgress(100);
      setExpandedStage(5);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setPipelineRunning(false);
    setPipelineComplete(false);
    setPipelineStage(0);
    setPipelineProgress(0);
    setResult(null);
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Header & Compliance Badge ───────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono-vs text-3xl font-bold text-white">Verify Caller</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-300">
              <Shield className="h-3.5 w-3.5" />
              Telephony Forensic Registry
            </span>
          </div>
          <p className="mt-1 text-slate-400">
            Check an organization, branch, and caller-ID claim against the verification directory with multi-layer spoofing detection.
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
            🛡️ RBI Security Framework
          </span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
            📞 STIR/SHAKEN CLI Anti-Spoof
          </span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
            🏛️ Canonical Entity Whitelist
          </span>
        </div>
      </div>

      {/* ─── Mode Navigation Tabs ────────────────────────────────────────── */}
      <div className="flex border-b border-white/10 text-sm">
        <button
          onClick={() => setActiveTab("demo")}
          className={clsx(
            "flex items-center gap-2 border-b-2 px-5 py-3 font-semibold transition-colors",
            activeTab === "demo"
              ? "border-cyan-400 text-cyan-300"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          <Zap className="h-4 w-4" />
          ⚡ 1-Click Demo Model & Scenarios
        </button>
        <button
          onClick={() => setActiveTab("form")}
          className={clsx(
            "flex items-center gap-2 border-b-2 px-5 py-3 font-semibold transition-colors",
            activeTab === "form"
              ? "border-cyan-400 text-cyan-300"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          <Building2 className="h-4 w-4" />
          Custom Input Form
        </button>
        <button
          onClick={() => setActiveTab("guide")}
          className={clsx(
            "flex items-center gap-2 border-b-2 px-5 py-3 font-semibold transition-colors",
            activeTab === "guide"
              ? "border-cyan-400 text-cyan-300"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          <BookOpen className="h-4 w-4" />
          📖 Full Architecture & Spoofing Guide
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1-CLICK DEMO SECTION                                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {(activeTab === "demo" || activeTab === "form") && (
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-navy-900/40 to-black/60 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Zap className="h-4 w-4" />
                </span>
                <h2 className="font-mono-vs text-lg font-bold text-white">
                  ⚡ 1-Click Interactive Demo Model
                </h2>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  Ready to test
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Select a real-world scenario below and watch the 5-stage forensic verification pipeline run in real-time.
              </p>
            </div>

            {/* Main 1-Click Action Buttons */}
            <div className="flex items-center gap-3">
              {pipelineComplete && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
              <button
                onClick={() => run1ClickDemo(activeScenario)}
                disabled={pipelineRunning}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-400 px-5 py-2.5 font-bold text-navy-950 shadow-lg shadow-cyan-500/20 transition-all hover:opacity-95 disabled:opacity-50"
              >
                <Zap className="h-4 w-4 fill-navy-950" />
                {pipelineRunning
                  ? "Auditing Pipeline..."
                  : pipelineComplete
                  ? "⚡ Re-run 1-Click Demo"
                  : "⚡ Run 1-Click Interactive Demo"}
              </button>
            </div>
          </div>

          {/* Scenario Picker Grid */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PRESET_SCENARIOS.map((scen) => {
              const isSelected = activeScenario.id === scen.id;
              return (
                <button
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen)}
                  className={clsx(
                    "group relative flex flex-col rounded-xl border p-4 text-left transition-all",
                    isSelected
                      ? "border-cyan-400 bg-cyan-950/40 shadow-md shadow-cyan-500/10"
                      : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-black/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={clsx(
                        "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        scen.badgeColor
                      )}
                    >
                      {scen.badge}
                    </span>
                    {isSelected && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-navy-950">
                        ✓
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2.5 text-sm font-semibold text-white group-hover:text-cyan-300">
                    {scen.name}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
                    {scen.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-slate-400 font-mono-vs">
                    <span>{scen.org}</span>
                    <span className="text-cyan-400">{scen.callerId}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Scenario Details Preview Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-slate-300">
              <span>
                <strong className="text-slate-500">Org:</strong>{" "}
                <span className="font-semibold text-white">{activeScenario.org}</span>
              </span>
              <span>
                <strong className="text-slate-500">Branch:</strong>{" "}
                <span className="font-semibold text-white">{activeScenario.branch}</span> ({activeScenario.city})
              </span>
              <span>
                <strong className="text-slate-500">Caller ID:</strong>{" "}
                <span className="font-mono text-cyan-300">{activeScenario.callerId}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Simulated Risk:</span>
              <span
                className={clsx(
                  "font-mono-vs font-bold",
                  activeScenario.threatScore >= 70
                    ? "text-red-400"
                    : activeScenario.threatScore >= 40
                    ? "text-amber-400"
                    : "text-emerald-400"
                )}
              >
                {activeScenario.threatScore}/100 ({activeScenario.threatLevel})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* PIPELINE PROGRESS & 5-STAGE INTERACTIVE AUDIT                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Animated Header & Progress Bar */}
        <div className="glass-panel p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <span className="text-[11px] font-mono-vs uppercase tracking-widest text-cyan-400">
                Forensic Pipeline Architecture · 5 Inspection Phases
              </span>
              <h3 className="text-base font-bold text-white">
                {pipelineRunning
                  ? `Executing Stage ${pipelineStage}/5: ${PIPELINE_STAGES[pipelineStage - 1]?.name}`
                  : pipelineComplete
                  ? "✅ Forensic Verification Pipeline Complete"
                  : "⚡ 5-Stage Interactive Inspection Pipeline (Ready)"}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono-vs">
              <span className="text-slate-400">Audit Status:</span>
              <span
                className={clsx(
                  "font-bold",
                  pipelineRunning
                    ? "text-cyan-400 animate-pulse"
                    : pipelineComplete
                    ? "text-emerald-400"
                    : "text-slate-400"
                )}
              >
                {pipelineRunning
                  ? "INSPECTION IN PROGRESS"
                  : pipelineComplete
                  ? "VERDICT RENDERED"
                  : "STANDBY · READY TO RUN"}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${pipelineRunning || pipelineComplete ? pipelineProgress : 0}%` }}
            />
          </div>
        </div>

          {/* 5-Stage Explanatory Cards */}
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage) => {
              const stageKey = `stage${stage.step}` as keyof typeof activeScenario.stages;
              const stageResult = activeScenario.stages[stageKey];
              const isPast = pipelineStage > stage.step || pipelineComplete;
              const isCurrent = pipelineStage === stage.step && pipelineRunning;
              const isPending = pipelineStage < stage.step && !pipelineComplete;
              const isExpanded = expandedStage === stage.step;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className={clsx(
                    "overflow-hidden rounded-xl border transition-all duration-300",
                    isCurrent
                      ? "border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10"
                      : isPast
                      ? "border-white/10 bg-black/40"
                      : "border-white/5 bg-black/20 opacity-60"
                  )}
                >
                  {/* Stage Summary Bar */}
                  <div
                    onClick={() => setExpandedStage(isExpanded ? null : stage.step)}
                    className="flex cursor-pointer items-center justify-between p-4 hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={clsx(
                          "flex h-9 w-9 items-center justify-center rounded-lg border",
                          isCurrent
                            ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 animate-pulse"
                            : isPast
                            ? stageResult.status === "danger"
                              ? "border-red-500/40 bg-red-500/20 text-red-400"
                              : stageResult.status === "warning"
                              ? "border-amber-500/40 bg-amber-500/20 text-amber-400"
                              : "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                            : "border-white/10 bg-white/5 text-slate-500"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-vs text-xs font-semibold text-slate-400">
                            Stage 0{stage.step}
                          </span>
                          <h4 className="text-sm font-bold text-white">{stage.name}</h4>
                          <span className="hidden text-xs text-slate-400 sm:inline">
                            · {stage.focus}
                          </span>
                        </div>
                        {!pipelineRunning && !pipelineComplete ? (
                          <p className="mt-0.5 text-xs text-slate-400">
                            <span className="text-slate-500">Target:</span> {stage.focus} ·{" "}
                            <span className="text-cyan-400 font-medium">Scenario expected: {stageResult.title}</span>
                          </p>
                        ) : isPast ? (
                          <p
                            className={clsx(
                              "mt-0.5 text-xs font-medium",
                              stageResult.status === "danger"
                                ? "text-red-400"
                                : stageResult.status === "warning"
                                ? "text-amber-400"
                                : "text-emerald-400"
                            )}
                          >
                            {stageResult.title}: {stageResult.detail}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCurrent && (
                        <span className="flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 animate-pulse">
                          <Zap className="h-3 w-3" />
                          Auditing...
                        </span>
                      )}
                      {isPast && (
                        <span
                          className={clsx(
                            "rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
                            stageResult.status === "danger"
                              ? "border-red-500/40 bg-red-500/20 text-red-300"
                              : stageResult.status === "warning"
                              ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                              : "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                          )}
                        >
                          {stageResult.status === "danger"
                            ? "FLAGGED"
                            : stageResult.status === "warning"
                            ? "CAUTION"
                            : "VERIFIED"}
                        </span>
                      )}
                      {!pipelineRunning && !pipelineComplete && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
                          READY
                        </span>
                      )}
                      {pipelineRunning && isPending && (
                        <span className="text-xs text-slate-500">Queued</span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Stage Explanation */}
                  {isExpanded && (
                    <div className="border-t border-white/10 bg-black/50 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* What happens under the hood */}
                        <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                          <h5 className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                            <Info className="h-3.5 w-3.5" />
                            How this check operates
                          </h5>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                            {stage.explanation}
                          </p>
                        </div>

                        {/* Finding & Forensic Impact */}
                        <div
                          className={clsx(
                            "rounded-lg border p-3",
                            isPast || (!pipelineRunning && !pipelineComplete)
                              ? stageResult.status === "danger"
                                ? "border-red-500/30 bg-red-950/20"
                                : stageResult.status === "warning"
                                ? "border-amber-500/30 bg-amber-950/20"
                                : "border-emerald-500/30 bg-emerald-950/20"
                              : "border-white/5 bg-white/5"
                          )}
                        >
                          <h5
                            className={clsx(
                              "text-xs font-semibold uppercase tracking-wider",
                              isPast || (!pipelineRunning && !pipelineComplete)
                                ? stageResult.status === "danger"
                                  ? "text-red-300"
                                  : stageResult.status === "warning"
                                  ? "text-amber-300"
                                  : "text-emerald-300"
                                : "text-slate-400"
                            )}
                          >
                            Forensic Finding
                          </h5>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                            {isPast
                              ? stageResult.detail
                              : "Awaiting execution of preceding inspection phases..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VERIFICATION BADGES & IDENTITY RISK SUMMARY                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-6">
          {/* Identity Threat Summary Banner */}
          <div
            className={clsx(
              "rounded-2xl border p-6 shadow-xl",
              activeScenario.threatLevel === "CRITICAL"
                ? "border-red-500/40 bg-gradient-to-r from-red-950/40 via-black to-red-950/20"
                : activeScenario.threatLevel === "HIGH"
                ? "border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-black to-amber-950/20"
                : "border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-black to-emerald-950/20"
            )}
          >
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider",
                      activeScenario.threatLevel === "CRITICAL"
                        ? "border-red-500/40 bg-red-500/20 text-red-300"
                        : activeScenario.threatLevel === "HIGH"
                        ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                        : "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                    )}
                  >
                    Identity Threat: {activeScenario.threatLevel}
                  </span>
                  <span className="text-xs text-slate-400">
                    Calculated by VoiceShield Multi-Factor Matrix
                  </span>
                </div>

                <h3 className="mt-2 text-xl font-bold text-white">
                  {activeScenario.name}
                </h3>
                <p className="mt-1 max-w-2xl text-xs text-slate-300">
                  {activeScenario.recommendation}
                </p>
              </div>

              {/* Threat Score Dial */}
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono-vs">
                    Identity Risk
                  </div>
                  <div
                    className={clsx(
                      "font-mono-vs text-3xl font-black",
                      activeScenario.threatScore >= 70
                        ? "text-red-400"
                        : activeScenario.threatScore >= 40
                        ? "text-amber-400"
                        : "text-emerald-400"
                    )}
                  >
                    {activeScenario.threatScore}
                    <span className="text-base text-slate-500">/100</span>
                  </div>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
                <div className="text-xs text-slate-300 font-medium">
                  {activeScenario.threatScore >= 70
                    ? "🚨 HIGH THREAT"
                    : activeScenario.threatScore >= 40
                    ? "⚠️ SUSPICIOUS"
                    : "✅ LOW RISK"}
                </div>
              </div>
            </div>

            {/* Official Recommendation Box */}
            <div className="mt-4 rounded-xl border border-white/10 bg-black/50 p-4 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  className={clsx(
                    "mt-0.5 h-4 w-4 shrink-0",
                    activeScenario.threatScore >= 70
                      ? "text-red-400"
                      : activeScenario.threatScore >= 40
                      ? "text-amber-400"
                      : "text-emerald-400"
                  )}
                />
                <div>
                  <span className="font-bold text-white uppercase tracking-wider">
                    Recommended Security Protocol:{" "}
                  </span>
                  <span className="text-slate-300">{activeScenario.recommendation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Verification Badge Cards */}
          <div>
            <h3 className="mb-3 font-mono-vs text-xs uppercase tracking-wider text-slate-400">
              Directory Verification Badges
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <VerificationBadgeCard title="Organization" entry={result.organization} />
              <VerificationBadgeCard title="Branch / Location" entry={result.branch} />
              <VerificationBadgeCard title="Caller Identity" entry={result.caller} />
            </div>
          </div>

          {/* Evidence Panel Trail */}
          <div className="glass-panel p-6">
            <h3 className="font-mono-vs text-xs uppercase tracking-wider text-slate-400">
              Forensic Evidence Trail & Audit Items
            </h3>
            <div className="mt-4 space-y-2.5">
              {activeScenario.evidence.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/30 p-3.5"
                >
                  <span
                    className={clsx(
                      "mt-0.5 shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                      item.severity === "critical"
                        ? "border-red-500/40 bg-red-500/20 text-red-300"
                        : item.severity === "high"
                        ? "border-orange-500/40 bg-orange-500/20 text-orange-300"
                        : item.severity === "medium"
                        ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                        : item.severity === "low"
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border-slate-500/40 bg-slate-500/20 text-slate-300"
                    )}
                  >
                    {item.severity}
                  </span>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-white">{item.title}</h5>
                    <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <PolicyRiskPreviewNote />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MANUAL VERIFICATION FORM                                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-mono-vs text-base font-bold text-white">Manual Claim Lookup</h2>
            <p className="text-xs text-slate-400">
              Enter any organization name, branch, city, and phone number to query the directory.
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono-vs">Endpoint: POST /api/verify/caller</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Claimed Organization</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              placeholder="e.g. Demo Bank, Demo Telecom"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Claimed Branch</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              placeholder="e.g. Chennai, Bangalore, Coimbatore"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Claimed City</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              placeholder="e.g. Chennai, Hyderabad, Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Caller ID (Phone Number)</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none font-mono"
              placeholder="e.g. +91-DEMO-1000, +91-98765-43210"
              value={callerId}
              onChange={(e) => setCallerId(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleManualVerify}
              disabled={loading}
              className="flex-1 rounded-lg bg-cyan-accent px-5 py-2.5 font-bold text-navy-950 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Verifying with Directory..." : "Verify Caller Claim"}
            </button>
            <button
              onClick={() => {
                setOrg("");
                setBranch("");
                setCity("");
                setCallerId("");
                setResult(null);
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-400 hover:bg-white/10"
            >
              Clear Inputs
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* FORENSIC ARCHITECTURE & SPOOFING EXPLANATION GUIDE                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-cyan-400" />
          <h2 className="font-mono-vs text-lg font-bold text-white">
            How Caller Verification Works in VoiceShield AI
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          A forensic explanation of telephony spoofing, multi-tier trust resolution, and regulatory compliance.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Card 1: The Telephony Spoofing Vulnerability */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <div className="flex items-center gap-2 text-red-400">
              <Phone className="h-4 w-4" />
              <h4 className="text-sm font-bold">Why Caller ID Alone is Broken</h4>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              In legacy <strong>SS7 signaling</strong> and SIP VoIP protocols, the Caller Line Identification (CLI) is merely an unverified string transmitted in the <code>From:</code> SIP header.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Anyone using an unauthenticated VoIP softswitch or cheap SIP trunk can transmit any arbitrary phone number—including official bank toll-free numbers (e.g. 1800-XXX-XXXX). Consequently, <strong>displaying a bank's real number on your phone screen is NEVER proof that the call came from the bank</strong>.
            </p>
          </div>

          {/* Card 2: 3-Tier Multi-Factor Verification */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <div className="flex items-center gap-2 text-cyan-400">
              <Lock className="h-4 w-4" />
              <h4 className="text-sm font-bold">The 3-Tier Verification Protocol</h4>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              VoiceShield AI separates identity claims into three orthogonal, non-overlapping verification tiers:
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-400">
              <li>
                <strong className="text-white">Tier 1: Canonical Entity Whitelisting</strong> — Resolves claimed name against regulated registries (RBI/TRAI).
              </li>
              <li>
                <strong className="text-white">Tier 2: Jurisdictional Consistency</strong> — Verifies branch & city against legitimate branch rosters.
              </li>
              <li>
                <strong className="text-white">Tier 3: Telephony Trunk Mapping</strong> — Evaluates CLI against known PRI trunks with zero-trust fallbacks.
              </li>
            </ul>
          </div>

          {/* Card 3: RBI & TRAI Zero-Trust Rule */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <h4 className="text-sm font-bold">The Golden Rule: Out-of-Band Callback</h4>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Under RBI Consumer Protection Guidelines and VoiceShield AI policy, even a call that passes all directory checks produces a status of{" "}
              <code className="text-amber-300">requires_independent_verification</code>.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              If an inbound caller requests money transfers, credential updates, or OTPs, the recipient must disconnect and initiate an <strong>out-of-bound callback</strong> to the official number printed on their physical debit card or account statement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
