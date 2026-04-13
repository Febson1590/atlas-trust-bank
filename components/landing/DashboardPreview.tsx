import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

const transactions = [
  {
    description: "Salary Deposit",
    type: "credit" as const,
    amount: "+$8,450.00",
    date: "Today",
  },
  {
    description: "Netflix Subscription",
    type: "debit" as const,
    amount: "-$15.99",
    date: "Yesterday",
  },
  {
    description: "Transfer to Savings",
    type: "debit" as const,
    amount: "-$2,000.00",
    date: "Apr 10",
  },
  {
    description: "Client Payment",
    type: "credit" as const,
    amount: "+$3,200.00",
    date: "Apr 9",
  },
];

export default function DashboardPreview() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-navy-950" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            See It in Action
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your money, <span className="gold-text">all in one place</span>
          </h2>
          <p className="mt-4 leading-relaxed text-text-secondary">
            A clean dashboard that shows you everything. Check your balance,
            track spending, and stay on top of things.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="relative mt-12 lg:mt-16">
          {/* Glow behind dashboard */}
          <div
            className="pointer-events-none absolute -inset-8"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(197,165,90,0.06) 0%, transparent 70%)",
            }}
          />

          <div className="card-premium relative mx-auto max-w-5xl rounded-2xl p-4 sm:p-6 lg:rounded-3xl lg:p-8">
            {/* Window chrome */}
            <div className="mb-5 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-error/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
              <span className="ml-3 text-[11px] text-text-muted">
                dashboard.atlastrust.com
              </span>
            </div>

            {/* Dashboard grid */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 sm:gap-4">
              {/* Balance card */}
              <div className="rounded-xl border border-border-subtle bg-navy-800 p-4 sm:p-5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                  Total Balance
                </p>
                <p className="mt-2 text-xl font-bold sm:text-2xl gold-text">
                  $124,850.00
                </p>
                <p className="mt-1 text-[11px] text-text-muted">
                  Checking **** 4821
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-xs font-medium text-success">
                    +12.4%
                  </span>
                  <span className="text-[10px] text-text-muted">
                    this month
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="rounded-xl border border-border-subtle bg-navy-800 p-4 sm:p-5 md:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                    Portfolio Trend
                  </p>
                  <span className="text-[10px] text-gold-400">
                    Last 7 Days
                  </span>
                </div>
                <svg
                  className="h-20 w-full sm:h-24"
                  viewBox="0 0 400 80"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="chartFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#c5a55a"
                        stopOpacity="0.2"
                      />
                      <stop
                        offset="100%"
                        stopColor="#030811"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,60 C20,55 40,48 57,45 C74,42 90,50 114,55 C138,60 155,38 171,30 C187,22 210,30 228,35 C246,40 265,20 285,15 C305,10 325,16 342,20 C359,24 380,10 400,8"
                    fill="none"
                    stroke="#c5a55a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,60 C20,55 40,48 57,45 C74,42 90,50 114,55 C138,60 155,38 171,30 C187,22 210,30 228,35 C246,40 265,20 285,15 C305,10 325,16 342,20 C359,24 380,10 400,8 L400,80 L0,80 Z"
                    fill="url(#chartFill)"
                  />
                </svg>
              </div>

              {/* Transactions */}
              <div className="rounded-xl border border-border-subtle bg-navy-800 p-4 sm:p-5 md:col-span-2">
                <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-text-muted">
                  Recent Transactions
                </p>
                <div className="flex flex-col gap-2.5">
                  {transactions.map((tx) => (
                    <div
                      key={tx.description}
                      className="flex items-center justify-between rounded-lg bg-navy-900/50 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            tx.type === "credit"
                              ? "bg-success/15 text-success"
                              : "bg-error/15 text-error"
                          }`}
                        >
                          {tx.type === "credit" ? (
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-text-primary">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {tx.date}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          tx.type === "credit"
                            ? "text-success"
                            : "text-text-secondary"
                        }`}
                      >
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credit card mockup */}
              <div className="flex items-center justify-center">
                <div className="card-gold relative h-36 w-full max-w-[240px] overflow-hidden rounded-xl p-5 sm:h-40">
                  <p className="text-[10px] font-semibold tracking-widest text-navy-950/70">
                    ATLAS TRUST
                  </p>
                  <div className="absolute bottom-11 left-5">
                    <p className="font-mono text-xs tracking-wider text-navy-950/80">
                      **** **** **** 4821
                    </p>
                  </div>
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <p className="text-[9px] font-medium uppercase text-navy-950/60">
                      Cardholder Name
                    </p>
                    <p className="text-[9px] font-medium text-navy-950/60">
                      09/28
                    </p>
                  </div>
                  {/* Card chip */}
                  <div className="absolute left-5 top-12 h-6 w-8 rounded-sm bg-navy-950/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
