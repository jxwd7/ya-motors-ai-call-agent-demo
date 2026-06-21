import { useEffect, useMemo, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { VapiWidget } from "@vapi-ai/client-sdk-react";
import "@vapi-ai/client-sdk-react/styles";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  ClipboardList,
  Menu,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  TableProperties,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { ChromaFlow, FilmGrain, FlutedGlass, Shader, Swirl } from "shaders/react";

const navLinks = [
  { label: "Demo", href: "#demo" },
  { label: "Workflow", href: "#workflow" },
  { label: "Price File", href: "#price-file" },
  { label: "Offer", href: "#offer" },
];

const proofChips = ["Answers rental calls", "Quotes from price file", "SMS / WhatsApp follow-up"];

const defaultWhatsAppMessage = "Hi, I want to book the next step for the YA Motors AI receptionist demo.";

const demoScenarios: Array<{ question: string; test: string; icon: LucideIcon }> = [
  {
    question: "How much is a Corolla for a week?",
    test: "Tests weekly price lookup from the rental knowledge file.",
    icon: TableProperties,
  },
  {
    question: "Can you text me the quote?",
    test: "Tests the SMS or WhatsApp follow-up handoff.",
    icon: MessageSquare,
  },
  {
    question: "I need a car tomorrow morning.",
    test: "Tests lead capture for date, vehicle type, and callback intent.",
    icon: PhoneCall,
  },
];

const oldWayItems = [
  {
    title: "Missed calls",
    body: "Rental enquiries can arrive while the team is with customers, vehicles, or after-hours calls.",
  },
  {
    title: "Manual quote checking",
    body: "Staff still need to open the current price file before giving daily, weekly, or monthly rates.",
  },
  {
    title: "Inconsistent follow-up",
    body: "Even a good call can stall if the SMS quote, WhatsApp reply, or team callback is delayed.",
  },
];

const aiReceptionistItems = [
  {
    title: "Immediate response",
    body: "The assistant answers rental questions quickly and keeps the conversation moving.",
  },
  {
    title: "Approved price-file quoting",
    body: "Rates come from the uploaded rental context instead of being guessed during the call.",
  },
  {
    title: "Structured handoff",
    body: "Name, phone, dates, vehicle preference, and next step are captured for the team.",
  },
];

const workflowCards: Array<{ title: string; body: string; icon: LucideIcon }> = [
  {
    title: "Automated SMS quotes",
    body: "After the call, the launch workflow can send the customer the quote and next step by SMS or WhatsApp.",
    icon: MessageSquare,
  },
  {
    title: "Smart follow-up reminders",
    body: "Follow-up tasks can keep quoted leads visible instead of relying on memory or scattered phone notes.",
    icon: ClipboardList,
  },
  {
    title: "GHL communication CRM",
    body: "Calls, messages, lead details, and pipeline stages can be configured into GoHighLevel before launch.",
    icon: Workflow,
  },
];

const priceRows = [
  ["Toyota Corolla", "$45", "$250", "$950"],
  ["Toyota Camry", "$60", "$360", "$1,250"],
  ["Hyundai i30", "$48", "$260", "$980"],
  ["Mazda 3", "$52", "$280", "$1,050"],
  ["Toyota RAV4", "$85", "$450", "$1,700"],
  ["Toyota HiAce", "$120", "$650", "$2,400"],
];

const offerItems = [
  "One working Vapi AI receptionist for rental enquiries.",
  "Approved rental price file converted into assistant context.",
  "Call script, qualifying questions, and handoff rules.",
  "SMS or WhatsApp quote follow-up template.",
  "GoHighLevel workflow plan for leads, reminders, and pipeline stages.",
  "Test calls and launch-ready approval pass before going live.",
];

const valuePoints = [
  { title: "Recovered enquiries", body: "More rental calls get answered while the team stays focused on the shop." },
  { title: "Faster quotes", body: "Customers hear a clear first quote from the same approved pricing context." },
  { title: "Follow-up consistency", body: "Quote and callback steps are captured instead of disappearing after the call." },
];

const nextSteps = [
  "Connect Vapi assistant and phone path.",
  "Load approved rental price file and handoff rules.",
  "Run test calls, approve scripts, then connect WhatsApp/GHL workflows.",
];

type CallState = "missing-config" | "idle" | "connecting" | "live" | "ended" | "error";

function getVapiConfig() {
  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY as string | undefined;
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID as string | undefined;

  return {
    publicKey,
    assistantId,
    hasConfig: Boolean(publicKey && assistantId),
  };
}

function RollingText({ children }: { children: string }) {
  return (
    <span className="block h-[20px] overflow-hidden">
      <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
        <span>{children}</span>
        <span>{children}</span>
      </span>
    </span>
  );
}

function CtaLink({ children, href, variant = "orange", target, rel }: { children: string; href: string; variant?: "orange" | "dark" | "light"; target?: string; rel?: string }) {
  const classes = {
    orange: "bg-[#F26522] text-white hover:bg-[#e05a1a]",
    dark: "bg-gray-900 text-white hover:bg-gray-800",
    light: "bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
  }[variant];

  return (
    <a href={href} target={target} rel={rel} className={`group inline-flex w-fit items-center gap-3 rounded-full py-2 pl-5 pr-2 text-[13px] font-medium leading-[14px] transition-all duration-300 sm:pl-6 ${classes}`}>
      <RollingText>{children}</RollingText>
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white sm:h-8 sm:w-8">
        <ArrowRight size={15} className={`transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45 ${variant === "light" ? "text-gray-900" : "text-[#F26522]"}`} />
      </span>
    </a>
  );
}

function getWhatsAppLink() {
  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;
  const number = rawNumber?.replace(/[^\d]/g, "");
  const message = (import.meta.env.VITE_WHATSAPP_MESSAGE as string | undefined) || defaultWhatsAppMessage;

  if (!number) return undefined;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function WhatsAppCta({ variant = "dark" }: { variant?: "orange" | "dark" | "light" }) {
  const href = getWhatsAppLink();

  if (!href) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex w-fit cursor-not-allowed items-center gap-3 rounded-full bg-gray-200 py-2 pl-5 pr-2 text-[13px] font-medium leading-[14px] text-gray-500 sm:pl-6"
      >
        <span className="block h-[20px]">Add WhatsApp number before launch</span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white sm:h-8 sm:w-8">
          <MessageSquare size={15} className="text-gray-400" />
        </span>
      </button>
    );
  }

  return (
    <CtaLink href={href} target="_blank" rel="noreferrer" variant={variant}>
      Message to book next step
    </CtaLink>
  );
}

function CtaButton({ children, onClick, disabled }: { children: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group inline-flex w-fit items-center gap-3 rounded-full bg-[#F26522] py-2 pl-5 pr-2 text-[13px] font-medium leading-[14px] text-white transition-colors duration-300 hover:bg-[#e05a1a] disabled:cursor-not-allowed disabled:bg-gray-300 sm:pl-6"
    >
      <RollingText>{children}</RollingText>
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white sm:h-8 sm:w-8">
        <ArrowRight size={15} className="text-[#F26522] transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45" />
      </span>
    </button>
  );
}

function ShaderBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <Shader className="h-full w-full">
        <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
        <ChromaFlow baseColor="#ffffff" downColor="#ff5f03" leftColor="#ff5f03" rightColor="#ff5f03" upColor="#ff5f03" momentum={13} radius={3.5} />
        <FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.12} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
        <FilmGrain strength={0.05} />
      </Shader>
    </div>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="relative z-20 mx-auto max-w-[1440px] p-2 sm:p-3">
        <nav className="flex items-center justify-between rounded-full bg-white p-[5px] shadow-[0_2px_18px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
            <a href="#" className="grid h-9 w-9 place-items-center rounded-full bg-gray-900 text-[10px] font-bold leading-[11px] tracking-tight text-white sm:h-10 sm:w-10">
              YA
            </a>
            <a href="#" className="hidden text-[14px] font-semibold text-gray-900 sm:block">
              YA Motors AI Receptionist
            </a>
            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="text-[14px] text-gray-900 transition-colors duration-300 hover:text-gray-500">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-full bg-gray-100 px-3 py-2 text-[13px] text-gray-600">Vapi + workflow demo</span>
            <WhatsAppCta />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full bg-gray-900 text-white md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </header>

      <div className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 md:hidden ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setMenuOpen(false)}>
        <div
          className={`absolute inset-x-0 bottom-0 mx-3 mb-3 rounded-2xl bg-white p-5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "translate-y-0" : "translate-y-full"}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[13px] text-gray-600">YA Motors AI Receptionist</span>
            <button type="button" onClick={() => setMenuOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-gray-900 text-white" aria-label="Close menu">
              <X size={17} />
            </button>
          </div>
          <div className="mb-8 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="text-[28px] font-medium leading-[32px] text-gray-900">
                {link.label}
              </a>
            ))}
          </div>
          <WhatsAppCta variant="orange" />
        </div>
      </div>
    </>
  );
}

function AgentContextCard() {
  return (
    <div className="rounded-[28px] bg-white/78 p-4 shadow-[0_24px_80px_rgba(17,24,39,0.12)] backdrop-blur-md">
      <div className="relative overflow-hidden rounded-2xl bg-gray-900 p-5 text-white">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F26522]/25 blur-3xl" />
        <div className="relative z-10">
          <div className="mb-9 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] text-white">
              <span className="h-2 w-2 rounded-full bg-[#F26522]" />
              Agent context loaded
            </span>
            <Bot className="text-[#F26522]" size={24} />
          </div>
          <p className="text-[13px] text-gray-300">YA Motors custom solution</p>
          <p className="mt-2 text-[28px] font-medium leading-[1.05] tracking-[-0.03em]">Rental calls, price lookup, quote follow-up, and team handoff.</p>
          <div className="mt-8 flex h-12 items-end gap-1.5">
            {[45, 76, 100, 60, 82, 38, 70].map((height, index) => (
              <span key={`${height}-${index}`} className="w-2 rounded-t-full bg-[#F26522]" style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="mt-7 grid gap-2 text-[13px] text-gray-200">
            {["Price-file context", "Lead capture", "SMS / WhatsApp handoff"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/8 px-3 py-2">
                <Check size={14} className="text-[#F26522]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#EFEFEF]">
      <ShaderBackground />
      <Navbar />
      <div className="relative z-20 flex flex-1 flex-col">
        <div className="flex-1" />
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 pb-14 sm:px-8 sm:pb-16 lg:grid-cols-[1fr_460px] lg:items-end lg:px-12 lg:pb-20">
          <div>
            <p className="mb-5 text-[13px] font-semibold uppercase leading-[14px] tracking-[0.12em] text-[#F26522] sm:mb-8">YA Motors Custom Solution</p>
            <h1 className="max-w-5xl text-[clamp(2.35rem,7vw,5.25rem)] font-medium leading-[1.02] tracking-[-0.05em] text-gray-900 sm:text-[clamp(3rem,5vw,5.4rem)]">
              Your 24/7 AI Receptionist
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] font-medium leading-[1.7] text-gray-700 sm:text-[17px]">
              Never miss a rental enquiry again. The AI answers calls, quotes from your price sheet, captures the customer, and follows up by SMS or WhatsApp automatically.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-5">
              <WhatsAppCta variant="orange" />
              <CtaLink href="#demo" variant="light">Try live demo</CtaLink>
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {proofChips.map((chip) => (
                <span key={chip} className="rounded-full bg-white px-3.5 py-2 text-[12px] font-medium text-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <AgentContextCard />
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, body, inverse = false }: { eyebrow: string; title: string; body?: string; inverse?: boolean }) {
  return (
    <div className="mb-10 max-w-3xl sm:mb-14">
      <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#F26522]">{eyebrow}</p>
      <h2 className={`text-[clamp(1.8rem,4vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.03em] ${inverse ? "text-white" : "text-gray-900"}`}>{title}</h2>
      {body ? <p className={`mt-5 text-[15px] font-medium leading-[1.7] sm:text-[17px] ${inverse ? "text-gray-300" : "text-gray-600"}`}>{body}</p> : null}
    </div>
  );
}

function VapiDemoCard() {
  const { publicKey, assistantId, hasConfig } = getVapiConfig();
  const [callState, setCallState] = useState<CallState>(hasConfig ? "idle" : "missing-config");
  const [errorMessage, setErrorMessage] = useState("");
  const vapiRef = useRef<any>(null);

  useEffect(() => {
    if (!hasConfig || !publicKey) {
      setCallState("missing-config");
      return;
    }

    const instance: any = new Vapi(publicKey);
    vapiRef.current = instance;
    instance.on("call-start", () => setCallState("live"));
    instance.on("call-end", () => setCallState("ended"));
    instance.on("error", (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "The Vapi call could not start.");
      setCallState("error");
    });

    return () => {
      instance.stop?.();
      vapiRef.current = null;
    };
  }, [hasConfig, publicKey]);

  const status = useMemo(() => {
    if (callState === "missing-config") return "missing config";
    if (callState === "connecting") return "connecting";
    if (callState === "live") return "live call";
    if (callState === "ended") return "call ended";
    if (callState === "error") return "error";
    return "ready";
  }, [callState]);

  const startCall = async () => {
    if (!hasConfig || !assistantId || !vapiRef.current) {
      setCallState("missing-config");
      return;
    }

    setErrorMessage("");
    setCallState("connecting");
    try {
      await Promise.resolve(vapiRef.current.start(assistantId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The Vapi call could not start.");
      setCallState("error");
    }
  };

  const stopCall = () => {
    vapiRef.current?.stop?.();
    setCallState("ended");
  };

  const buttonLabel = callState === "live" ? "Stop live AI call" : callState === "connecting" ? "Connecting..." : "Start live AI call";
  const buttonDisabled = callState === "missing-config" || callState === "connecting";

  return (
    <section id="demo" className="bg-white py-16 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
        <div>
          <SectionHeader
            eyebrow="Live Vapi demo"
            title="Experience the AI receptionist."
            body="Use the live Vapi assistant and try rental questions that prove price lookup, lead capture, and quote follow-up."
          />
          <div className="grid gap-3">
            {demoScenarios.map((scenario) => {
              const Icon = scenario.icon;
              return (
                <article key={scenario.question} className="group rounded-2xl border border-gray-100 bg-[#F7F7F7] p-4 transition-colors hover:border-[#F26522]/30 hover:bg-white">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#F26522] shadow-[0_8px_20px_rgba(17,24,39,0.06)]">
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold leading-[1.4] text-gray-900">"{scenario.question}"</p>
                      <p className="mt-1 text-[13px] leading-[1.6] text-gray-600">{scenario.test}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <div className="rounded-[28px] border border-gray-100 bg-[#F7F7F7] p-4 shadow-[0_20px_60px_rgba(17,24,39,0.08)] sm:p-6">
          <div className="rounded-2xl bg-white p-5 sm:p-7">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-gray-900">YA Motors Vapi assistant</p>
                <p className="mt-1 text-[13px] text-gray-500">Status: {status}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-medium text-white">
                <span className={`h-2 w-2 rounded-full ${callState === "live" ? "bg-green-400" : callState === "error" ? "bg-red-400" : "bg-[#F26522]"}`} />
                {hasConfig ? "Live-ready" : "Keys needed"}
              </span>
            </div>
            <p className="text-[24px] font-medium leading-[1.1] tracking-[-0.02em] text-gray-900 sm:text-[32px]">{hasConfig ? "Ready to connect." : "Live call demo not connected yet."}</p>
            <p className="mt-4 text-[15px] leading-[1.7] text-gray-600">
              {hasConfig ? "Use the floating YA Motors widget, or start a direct browser-based Vapi test call here." : "Add VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID before showing the live call."}
            </p>
            {errorMessage ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">{errorMessage}</p> : null}
            <div className="mt-6">
              <CtaButton onClick={callState === "live" ? stopCall : startCall} disabled={buttonDisabled}>{buttonLabel}</CtaButton>
            </div>
            <div className="mt-8 rounded-2xl bg-gray-50 p-4">
              <p className="text-[13px] font-semibold text-gray-900">What the assistant is loaded with</p>
              <div className="mt-4 grid gap-2 text-[13px] leading-[1.6] text-gray-700">
                {["Rental pricing examples", "Lead capture questions", "SMS / WhatsApp quote template", "Team handoff rules"].map((item) => (
                  <div key={item} className="flex gap-2">
                    <Check className="mt-0.5 shrink-0 text-[#F26522]" size={15} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VapiFloatingWidget() {
  const { publicKey, assistantId, hasConfig } = getVapiConfig();

  if (!hasConfig || !publicKey || !assistantId) return null;

  return (
    <VapiWidget
      publicKey={publicKey}
      assistantId={assistantId}
      mode="hybrid"
      theme="light"
      position="bottom-right"
      size="full"
      borderRadius="large"
      baseBgColor="#ffffff"
      accentColor="#F26522"
      ctaButtonColor="#111827"
      ctaButtonTextColor="#ffffff"
      title="YA Motors AI Receptionist"
      ctaTitle="Ask about rentals"
      ctaSubtitle="Voice or chat"
      startButtonText="Start voice call"
      endButtonText="End call"
      chatPlaceholder="Ask about Corolla weekly rates..."
      chatFirstMessage="Hi, I can help with YA Motors rental pricing and quote follow-up. What type of car are you looking for?"
      chatEmptyMessage="Ask about rental prices, weekly options, or SMS quote follow-up."
      voiceEmptyMessage="Start a voice call and ask about cars, weekly rates, or monthly options."
      hybridEmptyMessage="Choose voice or chat to ask about YA Motors rental options."
      voiceShowTranscript
      consentRequired
      consentTitle="Before you start"
      consentContent="This demo uses AI voice and chat. Do not share payment details, passwords, or private documents. Conversations may be processed to provide the demo response."
      consentStorageKey="ya_motors_vapi_widget_consent"
    />
  );
}

function OldWayVsSolution() {
  return (
    <section className="bg-[#F5F5F5] py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <SectionHeader
          eyebrow="The operating gap"
          title="The problem is not demand. It is speed to answer and follow up."
          body="YA Motors already has valuable rental enquiries. The AI receptionist gives those calls a consistent first response, a price-file quote, and a clear next step."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_12px_36px_rgba(17,24,39,0.06)] sm:p-8">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-[28px] font-medium tracking-[-0.03em] text-gray-900">The old way</h3>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-600">Manual</span>
            </div>
            <div className="grid gap-4">
              {oldWayItems.map((item) => (
                <div key={item.title} className="flex gap-3 rounded-2xl bg-[#F7F7F7] p-4">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gray-400" />
                  <div>
                    <p className="text-[16px] font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-[14px] leading-[1.7] text-gray-600">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article className="relative overflow-hidden rounded-[28px] bg-gray-900 p-6 text-white shadow-[0_22px_70px_rgba(17,24,39,0.18)] sm:p-8">
            <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#F26522]/25 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-[28px] font-medium tracking-[-0.03em] text-white">The AI receptionist</h3>
                <span className="rounded-full bg-[#F26522] px-3 py-1.5 text-[12px] font-medium text-white">Configured flow</span>
              </div>
              <div className="grid gap-4">
                {aiReceptionistItems.map((item) => (
                  <div key={item.title} className="flex gap-3 rounded-2xl bg-white/8 p-4">
                    <Check className="mt-0.5 shrink-0 text-[#F26522]" size={18} />
                    <div>
                      <p className="text-[16px] font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-[14px] leading-[1.7] text-gray-300">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function CompleteLoopIntegration() {
  return (
    <section id="workflow" className="bg-white py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <SectionHeader
          eyebrow="Complete loop integration"
          title="From first ring to the next booked step."
          body="The launch workflow can connect the call, quote follow-up, reminders, and GHL pipeline so rental enquiries do not fall through the cracks."
        />
        <div className="grid gap-6 lg:grid-cols-12">
          <article className="rounded-[28px] bg-[#F5F5F5] p-6 shadow-[0_12px_36px_rgba(17,24,39,0.06)] sm:p-8 lg:col-span-5">
            <div className="mb-8 flex items-start gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#F26522]">
                <MessageSquare size={22} />
              </span>
              <div>
                <h3 className="text-[24px] font-medium tracking-[-0.03em] text-gray-900">Automated SMS quotes</h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-gray-600">The configured launch flow can send a simple quote after the call, keeping the next step in the customer thread.</p>
              </div>
            </div>
            <div className="mx-auto flex min-h-[300px] max-w-[300px] flex-col rounded-t-[2rem] border-x-4 border-t-4 border-gray-900 bg-gray-900 px-4 pt-6 text-white shadow-[0_20px_60px_rgba(17,24,39,0.18)]">
              <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-white/20" />
              <div className="grid gap-3 text-[12px] leading-[1.5]">
                <p className="w-5/6 rounded-2xl bg-white px-3 py-3 text-gray-800">Hi Ahmed, thanks for calling YA Motors. Your quote for a Toyota Camry is $360/week.</p>
                <p className="w-4/6 justify-self-end rounded-2xl bg-[#F26522] px-3 py-3 text-white">Great, how do I book?</p>
                <p className="w-5/6 rounded-2xl bg-white px-3 py-3 text-gray-800">Reply YES and the team will confirm availability and pickup details.</p>
              </div>
            </div>
          </article>
          <div className="grid gap-6 lg:col-span-7">
            <div className="grid gap-6 md:grid-cols-2">
              {workflowCards.slice(1).map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.title} className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_12px_36px_rgba(17,24,39,0.06)] sm:p-8">
                    <span className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-[#F5F5F5] text-[#F26522]">
                      <Icon size={21} />
                    </span>
                    <h3 className="text-[22px] font-medium tracking-[-0.03em] text-gray-900">{card.title}</h3>
                    <p className="mt-3 text-[14px] leading-[1.7] text-gray-600">{card.body}</p>
                  </article>
                );
              })}
            </div>
            <div className="rounded-[28px] bg-gray-900 p-6 text-white sm:p-8">
              <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#F26522]">Communication CRM</p>
                  <h3 className="mt-2 text-[26px] font-medium tracking-[-0.03em] text-white">Channels into one customer record</h3>
                </div>
                <Workflow className="text-[#F26522]" size={28} />
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                <div className="grid gap-2">
                  {["Calls", "WhatsApp", "SMS / iMessage"].map((label) => <span key={label} className="rounded-full bg-white/10 px-4 py-2 text-center text-[13px] font-medium text-gray-100">{label}</span>)}
                </div>
                <ChevronRight className="mx-auto hidden text-[#F26522] sm:block" />
                <div className="rounded-2xl bg-white px-4 py-6 text-center text-[14px] font-semibold text-gray-900">GHL workflow setup</div>
                <ChevronRight className="mx-auto hidden text-[#F26522] sm:block" />
                <div className="grid gap-2">
                  {["Lead captured", "Reminder created", "Booking recovered"].map((label) => <span key={label} className="rounded-full bg-white/10 px-4 py-2 text-center text-[13px] font-medium text-gray-100">{label}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DataDrivenPricing() {
  return (
    <section id="price-file" className="bg-[#F5F5F5] py-16 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
        <SectionHeader
          eyebrow="Data-driven rental quotes"
          title="The AI quotes from the uploaded price file instead of guessing."
          body="This demo knowledge file gives the assistant a few sample vehicles and weekly rates. Before launch, it is replaced with YA Motors' approved rental file."
        />
        <div className="rounded-[28px] bg-white p-4 shadow-[0_12px_36px_rgba(17,24,39,0.06)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-900 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-[#F26522]" size={20} />
              <div>
                <p className="text-[13px] font-semibold">YA_MOTORS_DEMO_PRICING.csv</p>
                <p className="mt-1 text-[12px] text-gray-300">Demo knowledge source</p>
              </div>
            </div>
            <span className="rounded-full bg-[#F26522] px-3 py-1.5 text-[12px] font-semibold text-white">Demo price file</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full min-w-[620px] text-left text-[14px]">
              <thead className="bg-[#F7F7F7] text-gray-900">
                <tr>
                  {["Vehicle", "Daily", "Weekly", "Monthly"].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}
                </tr>
              </thead>
              <tbody className="bg-white">
                {priceRows.map((row) => (
                  <tr key={row[0]} className="border-t border-gray-100">
                    {row.map((cell, index) => <td key={cell} className={`px-4 py-4 ${index === 0 ? "font-semibold text-gray-900" : index === 2 ? "font-semibold text-[#F26522]" : "text-gray-600"}`}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] leading-[1.6] text-gray-500">Demo price file. Replace with YA Motors' approved file before launch.</p>
        </div>
      </div>
    </section>
  );
}

function Offer() {
  return (
    <section id="offer" className="bg-white py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid overflow-hidden rounded-[32px] bg-gray-900 lg:grid-cols-[1fr_420px]">
          <div className="p-6 text-white sm:p-10 lg:p-12">
            <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#F26522]">Simple Offer</p>
            <h2 className="max-w-3xl text-[clamp(2rem,5vw,4.2rem)] font-medium leading-[1.05] tracking-[-0.04em]">Build the first working AI receptionist for YA Motors.</h2>
            <p className="mt-6 max-w-3xl text-[15px] leading-[1.7] text-gray-300 sm:text-[17px]">
              Setup includes the Vapi AI receptionist, the approved price-file context, quote follow-up workflow, GoHighLevel communication CRM setup, test calls, and handoff rules. Monthly retainer covers prompt updates, price-file changes, and small workflow improvements.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {offerItems.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-white/8 p-4 text-[14px] leading-[1.6] text-gray-100">
                  <Check className="mt-0.5 shrink-0 text-[#F26522]" size={17} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 grid gap-3 md:grid-cols-3">
              {valuePoints.map((point) => (
                <div key={point.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[14px] font-semibold text-white">{point.title}</p>
                  <p className="mt-2 text-[13px] leading-[1.6] text-gray-300">{point.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 rounded-3xl bg-white/5 p-5">
              <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#F26522]">What happens next</p>
              <div className="grid gap-3 md:grid-cols-3">
                {nextSteps.map((step, index) => (
                  <div key={step} className="rounded-2xl bg-white/8 p-4 text-[14px] leading-[1.6] text-gray-100">
                    <span className="mb-4 grid h-8 w-8 place-items-center rounded-full bg-[#F26522] text-[12px] font-semibold text-white">{index + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <aside className="bg-[#F26522] p-6 text-white sm:p-10 lg:p-12">
            <ShieldCheck className="mb-8" size={34} />
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/80">Price</p>
            <p className="mt-3 text-[42px] font-medium leading-[1] tracking-[-0.04em]">$5,000 setup</p>
            <p className="mt-3 text-[24px] font-medium tracking-[-0.02em]">+ $199/month</p>
            <div className="mt-9">
              <WhatsAppCta />
            </div>
            <p className="mt-6 rounded-2xl bg-white/15 p-4 text-[13px] leading-[1.6] text-white/90">
              Final scripts, pricing, credentials, and handoff rules are approved before going live.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#F5F5F5] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 text-[13px] text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Demo page by Autosyntech for YA Motors.</p>
        <p>Vapi, SMS, WhatsApp, and GHL credentials are configured before launch.</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <main>
      <Hero />
      <VapiDemoCard />
      <OldWayVsSolution />
      <CompleteLoopIntegration />
      <DataDrivenPricing />
      <Offer />
      <Footer />
      <VapiFloatingWidget />
    </main>
  );
}
