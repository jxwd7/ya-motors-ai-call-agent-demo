import { useEffect, useMemo, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import {
  ArrowRight,
  Bot,
  Car,
  Check,
  ChevronRight,
  ClipboardList,
  Menu,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Workflow,
  X,
} from "lucide-react";
import { ChromaFlow, FilmGrain, FlutedGlass, Shader, Swirl } from "shaders/react";

const navLinks = [
  { label: "Situation", href: "#situation" },
  { label: "Demo", href: "#demo" },
  { label: "Offer", href: "#offer" },
];

const proofChips = ["Built around rental calls", "Uses a price file", "Sends SMS quotes"];

const defaultWhatsAppMessage = "Hi, I want to book the next step for the YA Motors AI call agent demo.";

const valuePoints = [
  { title: "Recovered enquiries", body: "Reduce the chance that rental calls disappear when the team is busy." },
  { title: "Faster quotes", body: "Give callers a consistent first answer from the current price-file context." },
  { title: "Follow-up consistency", body: "Keep the next step visible with SMS/GHL follow-up instead of relying on memory." },
];

const nextSteps = [
  "Connect the live Vapi assistant and call number.",
  "Load the approved rental price file and handoff rules.",
  "Run test calls, confirm scripts, then connect the WhatsApp handoff path.",
];

const situationCards = [
  {
    title: "Missed rental calls",
    body: "When the team is busy with vehicles or customers, new rental enquiries wait or disappear.",
    icon: PhoneCall,
  },
  {
    title: "Prices live in a file",
    body: "Customers ask for daily, weekly, or monthly prices. Staff need to check the current sheet before quoting.",
    icon: TableProperties,
  },
  {
    title: "Follow-up is manual",
    body: "Even when the call goes well, someone still has to send the SMS quote and remember the next step.",
    icon: MessageSquare,
  },
];

const solutionItems = [
  "Answers common rental questions without waiting for staff.",
  "Uses the price file instead of guessing rates.",
  "Collects name, phone, dates, vehicle type, and rental duration.",
  "Sends or prepares an SMS quote through Twilio or GoHighLevel.",
  "Hands off unusual questions to the YA Motors team.",
];

const offerItems = [
  "One working call agent for rental enquiries.",
  "One sample price sheet converted into AI context.",
  "SMS quote/follow-up template.",
  "Basic lead capture and team notification.",
  "GHL customer workflows for email, WhatsApp, iMessage/SMS, follow-up, and pipeline tracking.",
];

const priceRows = [
  ["Small hatch", "$45", "$280", "$950"],
  ["Sedan", "$55", "$340", "$1,150"],
  ["SUV", "$75", "$480", "$1,650"],
  ["Van / ute", "$90+", "$580+", "$2,100+"],
];

const sampleQuestions = [
  "How much is a sedan for a week?",
  "Can you text me the quote?",
  "Do you have monthly rental options?",
];

type CallState = "missing-config" | "idle" | "connecting" | "live" | "ended" | "error";

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
              YA Motors AI Demo
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
            <span className="rounded-full bg-gray-100 px-3 py-2 text-[13px] text-gray-600">Vapi + SMS demo</span>
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
            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[13px] text-gray-600">YA Motors AI Demo</span>
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

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#EFEFEF]">
      <ShaderBackground />
      <Navbar />
      <div className="relative z-20 flex flex-1 flex-col">
        <div className="flex-1" />
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 pb-14 sm:px-8 sm:pb-16 lg:grid-cols-[1fr_440px] lg:items-end lg:px-12 lg:pb-20">
          <div>
            <p className="mb-5 text-[13px] leading-[14px] tracking-wide text-gray-900 sm:mb-8">Quick demo for YA Motors</p>
            <h1 className="max-w-5xl text-[clamp(2.1rem,7vw,4.8rem)] font-medium leading-[1.05] tracking-[-0.04em] text-gray-900 sm:text-[clamp(3rem,5vw,5.1rem)]">
              A call-answering AI that knows your prices.
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] font-medium leading-[1.7] text-gray-700 sm:text-[17px]">
              This is not a big website pitch. It is a simple demo of what YA Motors could use tomorrow: a Vapi calling agent that answers rental enquiries, checks a price sheet, captures the customer, and sends an SMS follow-up.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-5">
              <WhatsAppCta variant="orange" />
              <CtaLink href="#price-file" variant="light">See what it knows</CtaLink>
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {proofChips.map((chip) => (
                <span key={chip} className="rounded-full bg-white px-3.5 py-2 text-[12px] font-medium text-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] bg-white/78 p-4 shadow-[0_24px_80px_rgba(17,24,39,0.12)] backdrop-blur-md">
            <div className="rounded-2xl bg-gray-900 p-5 text-white">
              <div className="mb-10 flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-[12px]">Test page</span>
                <Bot className="text-[#F26522]" size={22} />
              </div>
              <p className="text-[13px] text-gray-300">Agent context</p>
              <p className="mt-2 text-[28px] font-medium leading-[1.05] tracking-[-0.03em]">Rental calls, quote SMS, and team handoff in one flow.</p>
            </div>
          </div>
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
  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY as string | undefined;
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID as string | undefined;
  const hasConfig = Boolean(publicKey && assistantId);
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
    return "test page";
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
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
        <SectionHeader
          eyebrow="Vapi agent demo"
          title="Agent context loaded"
          body="YA Motors services, sample rental prices, handoff rules, and SMS quote template."
        />
        <div className="rounded-[28px] border border-gray-100 bg-[#F7F7F7] p-4 shadow-[0_20px_60px_rgba(17,24,39,0.08)] sm:p-6">
          <div className="rounded-2xl bg-white p-5 sm:p-7">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Vapi agent demo</p>
                <p className="mt-1 text-[13px] text-gray-500">Status: {status}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-medium text-white">
                <span className={`h-2 w-2 rounded-full ${callState === "live" ? "bg-green-400" : callState === "error" ? "bg-red-400" : "bg-[#F26522]"}`} />
                {hasConfig ? "Ready" : "Keys needed"}
              </span>
            </div>
            <p className="text-[24px] font-medium leading-[1.1] tracking-[-0.02em] text-gray-900 sm:text-[32px]">{hasConfig ? "Ready to connect." : "Live call demo not connected yet."}</p>
            <p className="mt-4 text-[15px] leading-[1.7] text-gray-600">
              {hasConfig ? "Click the button to start a browser-based Vapi test call." : "Add VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID before showing the live call."}
            </p>
            {errorMessage ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">{errorMessage}</p> : null}
            <div className="mt-6">
              <CtaButton onClick={callState === "live" ? stopCall : startCall} disabled={buttonDisabled}>{buttonLabel}</CtaButton>
            </div>
            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="mb-4 text-[13px] font-semibold text-gray-900">Try asking:</p>
              <div className="grid gap-3">
                {sampleQuestions.map((question) => (
                  <div key={question} className="rounded-2xl bg-gray-50 px-4 py-3 text-[14px] font-medium text-gray-700">
                    Ask: "{question}"
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

function Situation() {
  return (
    <section id="situation" className="bg-[#F5F5F5] py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <SectionHeader
          eyebrow="Current Situation"
          title="Calls are valuable, but they interrupt the shop."
          body="For a small auto business, the same calls come in every day. The problem is not interest. The problem is answering fast, giving the right price, and following up before the customer calls someone else."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {situationCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-2xl bg-white p-6 shadow-[0_12px_36px_rgba(17,24,39,0.06)]">
                <span className="mb-8 grid h-11 w-11 place-items-center rounded-full bg-gray-900 text-white"><Icon size={19} /></span>
                <h3 className="text-[20px] font-medium tracking-[-0.02em] text-gray-900">{card.title}</h3>
                <p className="mt-3 text-[14px] leading-[1.7] text-gray-600">{card.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SolutionAndPrice() {
  return (
    <section id="price-file" className="bg-white py-16 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
        <div className="rounded-[28px] bg-gray-900 p-6 text-white sm:p-8">
          <SectionHeader eyebrow="The Solution" title="One AI agent answers, quotes, and follows up." body="The Vapi agent is trained with YA Motors' business context. It can answer the call, ask the right qualifying questions, look up the sample pricing file, then prepare a text message with the quote and next step." inverse />
          <div className="mt-8 grid gap-3">
            {solutionItems.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-white/8 p-4 text-[14px] leading-[1.6] text-gray-100">
                <Check className="mt-0.5 shrink-0 text-[#F26522]" size={17} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] bg-[#F5F5F5] p-6 sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#F26522]"><ClipboardList size={20} /></span>
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#F26522]">Sample Price File</p>
              <h3 className="text-[28px] font-medium tracking-[-0.03em] text-gray-900">Rental rates the agent can quote</h3>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_36px_rgba(17,24,39,0.06)]">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-gray-900 text-white">
                <tr>
                  {['Vehicle', 'Daily', 'Weekly', 'Monthly'].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {priceRows.map((row) => (
                  <tr key={row[0]} className="border-b border-gray-100 last:border-0">
                    {row.map((cell, index) => <td key={cell} className={`px-4 py-4 ${index === 0 ? "font-semibold text-gray-900" : "text-gray-600"}`}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] leading-[1.6] text-gray-500">Demo prices only. Replace this with YA Motors' real rental file before launch.</p>
        </div>
      </div>
    </section>
  );
}

function SmsAndCrm() {
  return (
    <section className="bg-[#F5F5F5] py-16 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_36px_rgba(17,24,39,0.06)] sm:p-8">
          <SectionHeader eyebrow="SMS Follow-up" title="The call should end with a text message." body="A good demo should show the business owner the outcome, not just the AI talking. After the call, the system can send the customer a simple quote SMS and notify the team." />
          <p className="text-[14px] leading-[1.7] text-gray-600">Try the SMS preview. In the live version, this message would send through Twilio or GoHighLevel after the Vapi call finishes.</p>
          <div className="mt-7 rounded-3xl bg-gray-900 p-4 text-white">
            <div className="mb-4 flex items-center gap-2 text-[12px] text-gray-300"><MessageSquare size={14} /> SMS preview default</div>
            <p className="rounded-2xl bg-white px-4 py-4 text-[14px] leading-[1.7] text-gray-800">
              Hi Ahmed, thanks for calling YA Motors. Your demo quote is Sedan - $340/week. Reply YES and our team will confirm availability and pickup details.
            </p>
          </div>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_36px_rgba(17,24,39,0.06)] sm:p-8">
          <SectionHeader eyebrow="GHL Communication CRM" title="All customer messages in one place." body="The $5,000 setup also includes GoHighLevel customer workflows. Think of it as the communication CRM: calls, email, WhatsApp, and iMessage/SMS can be captured in one customer record instead of scattered across phones and inboxes." />
          <div className="grid gap-3">
            {["New lead and missed-call workflows.", "SMS quote follow-up and reminder workflows.", "Customer pipeline stages for new enquiry, quoted, follow-up, and booked.", "Team notifications so YA Motors knows who needs a callback."].map((item) => (
              <div key={item} className="flex gap-3 text-[14px] leading-[1.6] text-gray-700"><Check className="mt-0.5 shrink-0 text-[#F26522]" size={16} /> {item}</div>
            ))}
          </div>
          <div className="mt-8 rounded-3xl bg-[#F5F5F5] p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
              <div className="grid gap-2">
                {['Email', 'WhatsApp', 'iMessage / SMS'].map((label) => <span key={label} className="rounded-full bg-white px-4 py-2 text-center text-[13px] font-medium text-gray-800">{label}</span>)}
              </div>
              <ChevronRight className="mx-auto hidden text-gray-400 sm:block" />
              <div className="rounded-2xl bg-gray-900 px-4 py-6 text-center text-[14px] font-semibold text-white"><Workflow className="mx-auto mb-2 text-[#F26522]" size={22} />GHL Communication CRM</div>
              <ChevronRight className="mx-auto hidden text-gray-400 sm:block" />
              <div className="grid gap-2">
                {['Time saved', 'More leads followed up', 'Bookings recovered'].map((label) => <span key={label} className="rounded-full bg-white px-4 py-2 text-center text-[13px] font-medium text-gray-800">{label}</span>)}
              </div>
            </div>
          </div>
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
            <h2 className="max-w-3xl text-[clamp(2rem,5vw,4.2rem)] font-medium leading-[1.05] tracking-[-0.04em]">Build the first working version for YA Motors.</h2>
            <p className="mt-6 max-w-3xl text-[15px] leading-[1.7] text-gray-300 sm:text-[17px]">
              Setup includes the Vapi call agent, the first price-file context, SMS quote flow, GoHighLevel communication CRM workflows, test calls, and handoff rules. Monthly retainer covers prompt updates, price-file changes, and small workflow improvements.
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
              Demo credentials are placeholders until launch; final scripts and price file are approved before going live.
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
        <p>Vapi and SMS credentials are placeholders until launch.</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <main>
      <Hero />
      <Situation />
      <VapiDemoCard />
      <SolutionAndPrice />
      <SmsAndCrm />
      <Offer />
      <Footer />
    </main>
  );
}




