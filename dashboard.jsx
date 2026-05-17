/* global React */
const { useState } = React;

const USER = { name: "Ірина Мельник", firstName: "Ірина", hue: 280 };

// Tab data
const UPCOMING = [
  { id: 1, trainer: "Олена Коваленко", specs: ["Йога", "Пілатес"], hue: 18,
    date: "14 травня", time: "10:30", duration: 60, format: "Офлайн", status: "confirmed",
    countdown: "через 2 дні 4 години" },
  { id: 2, trainer: "Андрій Петренко", specs: ["Кросфіт"], hue: 210,
    date: "16 травня", time: "18:00", duration: 60, format: "Офлайн", status: "pending",
    countdown: "через 4 дні 11 годин" },
  { id: 3, trainer: "Ігор Мельник", specs: ["Біг"], hue: 150,
    date: "18 травня", time: "07:00", duration: 45, format: "Онлайн", status: "confirmed",
    countdown: "через 6 днів" },
];

const HISTORY = [
  { id: 1, trainer: "Олена Коваленко", hue: 18, date: "28 квітня 2026", price: 600, reviewed: true,
    rating: 5, review: "Чудове заняття! Олена дуже уважна до техніки виконання вправ." },
  { id: 2, trainer: "Олена Коваленко", hue: 18, date: "21 квітня 2026", price: 600, reviewed: true,
    rating: 5, review: "Як завжди, на найвищому рівні." },
  { id: 3, trainer: "Марія Іваненко", hue: 340, date: "14 квітня 2026", price: 720, reviewed: false },
  { id: 4, trainer: "Олена Коваленко", hue: 18, date: "7 квітня 2026", price: 600, reviewed: false },
  { id: 5, trainer: "Дмитро Шевченко", hue: 25, date: "30 березня 2026", price: 950, reviewed: true,
    rating: 4, review: "Інтенсивне тренування. Тренер професіонал, але темп був дуже високий для мене." },
];

const ACHIEVEMENTS = [
  { id: 1, name: "Перше заняття", desc: "Завершіть перше заняття", icon: "🌱", color: "#10B981", earned: true },
  { id: 2, name: "Тиждень руху", desc: "5 занять за тиждень", icon: "🔥", color: "#F59E0B", earned: true },
  { id: 3, name: "Постійність", desc: "10 занять поспіль", icon: "⭐", color: "#3B82F6", earned: true },
  { id: 4, name: "Перший відгук", desc: "Залишіть відгук тренеру", icon: "💬", color: "#8B5CF6", earned: true },
  { id: 5, name: "Ранкова пташка", desc: "10 ранкових занять", icon: "🌅", color: "#EC4899", earned: false, progress: "6/10" },
  { id: 7, name: "Різноманіття", desc: "3 різні спеціалізації", icon: "🎯", color: "#14B8A6", earned: false, progress: "2/3" },
  { id: 8, name: "Рік з Coachly", desc: "Активність протягом року", icon: "🏆", color: "#F59E0B", earned: false, progress: "8 міс" },
];

const card = { background: "white", border: "1px solid #E7E9EE", borderRadius: 14, padding: 20 };
const sectionTitle = { margin: 0, fontSize: 17, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em", fontFamily: "var(--display)" };

// ---------- UPCOMING TAB ----------
function UpcomingTab() {
  const [list, setList] = useState(UPCOMING);

  if (list.length === 0) return <EmptyState title="Немає запланованих занять" subtitle="Знайдіть тренера та заплануйте заняття" cta="Знайти тренера" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {list.map(b => (
        <article key={b.id} style={{
          ...card, padding: 18,
          display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center",
        }}>
          <window.DashAvatar name={b.trainer} hue={b.hue} size={62} />

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0F172A", letterSpacing: "-0.01em" }}>
                {b.trainer}
              </h3>
              <StatusBadge status={b.status} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 13, color: "#6B7280" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <window.DashIcon d="M8 2v3 M16 2v3 M3 9h18 M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" size={13} />
                <strong style={{ color: "#0F172A", fontWeight: 600 }}>{b.date}, {b.time}</strong>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <window.DashIcon d="M12 8v4l3 2 M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={13} />
                {b.duration} хв
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <window.DashIcon d={b.format === "Онлайн" ? "M15 10l5-5 M9 14l-5 5 M5 14l-2 6 6-2 M14 10l1-1 4-4 4 4-4 4-1 1-4-4z" : "M12 21s-7-7.5-7-13a7 7 0 1114 0c0 5.5-7 13-7 13z M12 11a2 2 0 100-4 2 2 0 000 4z"} size={13} />
                {b.format}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                color: "var(--accent-700)", fontWeight: 600,
              }}>
                <window.DashIcon d="M12 8v4l3 2 M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={13} />
                {b.countdown}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={btnGhost}>Деталі</button>
            <button onClick={() => setList(l => l.filter(x => x.id !== b.id))} style={btnDanger}>
              Скасувати
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    confirmed: { bg: "#ECFDF5", color: "#047857", label: "Підтверджено", dot: "#10B981" },
    pending: { bg: "#FFFBEB", color: "#B45309", label: "Очікує оплати", dot: "#F59E0B" },
  }[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px 3px 9px", fontSize: 11.5, fontWeight: 600,
      borderRadius: 999, background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ---------- HISTORY TAB ----------
function HistoryTab() {
  const [list, setList] = useState(HISTORY);
  const [drafting, setDrafting] = useState(null);
  const [draftRating, setDraftRating] = useState(0);
  const [draftText, setDraftText] = useState("");

  const submit = (id) => {
    setList(l => l.map(b => b.id === id ? { ...b, reviewed: true, rating: draftRating, review: draftText } : b));
    setDrafting(null); setDraftRating(0); setDraftText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {list.map(b => (
        <article key={b.id} style={card}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "flex-start" }}>
            <window.DashAvatar name={b.trainer} hue={b.hue} size={56} />
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: "#0F172A", letterSpacing: "-0.01em" }}>
                {b.trainer}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 13, color: "#6B7280", marginTop: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <window.DashIcon d="M8 2v3 M16 2v3 M3 9h18 M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" size={13} />
                  {b.date}
                </span>
                <span style={{ color: "#0F172A", fontWeight: 600 }}>{b.price} грн</span>
              </div>

              {b.reviewed && (
                <div style={{
                  marginTop: 12, padding: "12px 14px", background: "#FAFBFC",
                  borderRadius: 10, border: "1px solid #EDEFF3",
                }}>
                  <div style={{ display: "inline-flex", color: "#F5A524", marginBottom: 6 }}>
                    {[1,2,3,4,5].map(i => <window.DashStar key={i} filled={b.rating >= i} size={13} />)}
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, color: "#3F4651", lineHeight: 1.55 }}>{b.review}</p>
                </div>
              )}

              {drafting === b.id && (
                <div style={{
                  marginTop: 12, padding: 14, background: "var(--accent-50)",
                  borderRadius: 10, border: "1px solid var(--accent-100)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setDraftRating(n)} style={{
                        background: "none", border: "none", padding: 2, cursor: "pointer",
                        color: draftRating >= n ? "#F5A524" : "#D9DCE2",
                      }}>
                        <window.DashStar filled size={22} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={draftText} onChange={e => setDraftText(e.target.value)}
                    placeholder="Поділіться враженнями від заняття…"
                    style={{
                      width: "100%", minHeight: 70, padding: 10,
                      border: "1px solid #D9DCE2", borderRadius: 8,
                      fontSize: 13.5, fontFamily: "inherit", resize: "vertical",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={() => submit(b.id)} disabled={!draftRating}
                      style={{ ...btnPrimary, opacity: draftRating ? 1 : 0.5, cursor: draftRating ? "pointer" : "not-allowed" }}>
                      Опублікувати
                    </button>
                    <button onClick={() => setDrafting(null)} style={btnGhost}>Скасувати</button>
                  </div>
                </div>
              )}
            </div>
            <div>
              {!b.reviewed && drafting !== b.id && (
                <button onClick={() => setDrafting(b.id)} style={btnPrimary}>
                  Залишити відгук
                </button>
              )}
              {b.reviewed && (
                <button style={btnGhost}>Записатись знову</button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

// ---------- ACHIEVEMENTS TAB ----------
function AchievementsTab() {
  const earned = ACHIEVEMENTS.filter(a => a.earned).length;
  return (
    <div>
      <div style={{
        ...card, marginBottom: 18, padding: "18px 22px",
        background: "linear-gradient(135deg, var(--accent-50) 0%, white 100%)",
        border: "1px solid var(--accent-100)",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
      }}>
        <div>
          <h2 style={sectionTitle}>Прогрес досягнень</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#6B7280" }}>
            Отримано <strong style={{ color: "var(--accent-700)" }}>{earned}</strong> з {ACHIEVEMENTS.length} досягнень
          </p>
        </div>
        <div style={{ width: 200 }}>
          <div style={{ height: 8, background: "#E7E9EE", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              width: `${(earned / ACHIEVEMENTS.length) * 100}%`, height: "100%",
              background: "var(--accent-600)", borderRadius: 999, transition: "width 300ms",
            }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {ACHIEVEMENTS.map(a => (
          <div key={a.id} style={{
            ...card, padding: 18, textAlign: "center",
            background: a.earned ? "white" : "#FAFBFC",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", margin: "0 auto 12px",
              background: a.earned
                ? `linear-gradient(135deg, ${a.color}22, ${a.color}11)`
                : "#F1F2F4",
              border: `2px solid ${a.earned ? a.color : "#E7E9EE"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, position: "relative",
              filter: a.earned ? "none" : "grayscale(100%)",
              opacity: a.earned ? 1 : 0.5,
            }}>
              {a.icon}
              {!a.earned && (
                <div style={{
                  position: "absolute", inset: 0, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: "rgba(248, 249, 251, 0.85)", borderRadius: "50%",
                  color: "#9CA3AF",
                }}>
                  <window.DashIcon d="M8 11V7a4 4 0 018 0v4 M4 11h16v10H4z" size={20} stroke={2} />
                </div>
              )}
            </div>
            <div style={{
              fontSize: 14, fontWeight: 600,
              color: a.earned ? "#0F172A" : "#6B7280",
              marginBottom: 4,
            }}>{a.name}</div>
            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>{a.desc}</div>
            {a.earned && (
              <div style={{
                marginTop: 10, padding: "3px 9px", display: "inline-block",
                background: `${a.color}15`, color: a.color,
                borderRadius: 999, fontSize: 11.5, fontWeight: 600,
              }}>Отримано</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- SETTINGS TAB ----------
function SettingsTab() {
  const [form, setForm] = useState({
    firstName: "Ірина", lastName: "Мельник",
    email: "iryna.melnyk@example.com",
    city: "Київ",
    height: 168, weight: 62,
    goals: ["flexibility", "weight"],
    accessibility: [],
  });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v],
  }));

  const goals = [
    { v: "weight", label: "Зниження ваги" },
    { v: "muscle", label: "Набір м'язової маси" },
    { v: "flexibility", label: "Гнучкість" },
    { v: "endurance", label: "Витривалість" },
    { v: "rehab", label: "Реабілітація" },
    { v: "wellness", label: "Загальне здоров'я" },
  ];
  const accTags = [
    { v: "mobility", label: "Обмеження рухливості" },
    { v: "vision", label: "Проблеми із зором" },
    { v: "hearing", label: "Проблеми зі слухом" },
    { v: "chronic", label: "Хронічні захворювання" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section style={card}>
          <h2 style={sectionTitle}>Особисті дані</h2>
          <div style={{ display: "flex", gap: 18, alignItems: "center", margin: "16px 0 20px" }}>
            <window.DashAvatar name={`${form.firstName} ${form.lastName}`} hue={280} size={72} />
            <div>
              <button style={{ ...btnPrimary, marginRight: 8 }}>Завантажити фото</button>
              <button style={btnGhost}>Видалити</button>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9CA3AF" }}>JPG або PNG, макс. 5 МБ</p>
            </div>
          </div>
          <Grid2>
            <Field label="Ім'я"><Input value={form.firstName} onChange={v => update("firstName", v)} /></Field>
            <Field label="Прізвище"><Input value={form.lastName} onChange={v => update("lastName", v)} /></Field>
            <Field label="Електронна пошта"><Input value={form.email} onChange={v => update("email", v)} type="email" /></Field>
            <Field label="Місто"><Input value={form.city} onChange={v => update("city", v)} /></Field>
          </Grid2>
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Фізичні параметри</h2>
          <p style={{ margin: "4px 0 16px", fontSize: 13, color: "#6B7280" }}>
            Допоможе тренерам підібрати оптимальну програму
          </p>
          <Grid2>
            <Field label="Зріст, см">
              <Input value={form.height} onChange={v => update("height", v)} type="number" />
            </Field>
            <Field label="Вага, кг">
              <Input value={form.weight} onChange={v => update("weight", v)} type="number" />
            </Field>
          </Grid2>
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Особливі потреби</h2>
          <p style={{ margin: "4px 0 16px", fontSize: 13, color: "#6B7280" }}>
            Допомагає підбирати тренерів з відповідною кваліфікацією. Інформація приватна.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {accTags.map(t => {
              const active = form.accessibility.includes(t.v);
              return (
                <button key={t.v} onClick={() => toggleArr("accessibility", t.v)} style={{
                  padding: "8px 14px", fontSize: 13, fontWeight: 500,
                  borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                  background: active ? "var(--accent-50)" : "white",
                  color: active ? "var(--accent-700)" : "#3F4651",
                  border: `1.5px solid ${active ? "var(--accent-600)" : "#D9DCE2"}`,
                  transition: "all 120ms",
                }}>{t.label}</button>
              );
            })}
          </div>
        </section>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={btnGhost}>Скасувати</button>
          <button style={btnPrimary}>Зберегти зміни</button>
        </div>
      </div>

      <aside style={{
        ...card, position: "sticky", top: 80, padding: 18,
      }}>
        <h3 style={{ ...sectionTitle, fontSize: 14, marginBottom: 10 }}>Захист даних</h3>
        <p style={{ margin: 0, fontSize: 12.5, color: "#6B7280", lineHeight: 1.6 }}>
          Ваші особисті дані видимі лише тренеру, до якого ви записались. Ми не передаємо їх третім особам.
        </p>
        <button style={{
          width: "100%", marginTop: 14, padding: "9px 14px",
          background: "transparent", border: "none", color: "#DC2626",
          fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          borderRadius: 8,
        }}>Видалити акаунт</button>
      </aside>
    </div>
  );
}

function Grid2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A" }}>{label}</label>
      {children}
    </div>
  );
}
function Input({ value, onChange, type = "text" }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{
      padding: "10px 12px", borderRadius: 9, border: "1px solid #D9DCE2",
      fontSize: 13.5, color: "#0F172A", fontFamily: "inherit",
      background: "white", outline: "none",
    }} />
  );
}

function EmptyState({ title, subtitle, cta }) {
  return (
    <div style={{
      ...card, padding: "60px 24px", textAlign: "center", border: "1px dashed #D9DCE2",
    }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "#6B7280", marginBottom: 18 }}>{subtitle}</div>
      <a href="Coachly.html" style={{ ...btnPrimary, display: "inline-block", textDecoration: "none" }}>
        {cta}
      </a>
    </div>
  );
}

// ---------- BUTTON STYLES ----------
const btnPrimary = {
  padding: "9px 16px", background: "var(--accent-600)", color: "white",
  border: "none", borderRadius: 9, fontSize: 13.5, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit",
};
const btnGhost = {
  padding: "9px 16px", background: "white", color: "#3F4651",
  border: "1.5px solid #E7E9EE", borderRadius: 9,
  fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};
const btnDanger = {
  padding: "9px 16px", background: "white", color: "#DC2626",
  border: "1.5px solid #FECACA", borderRadius: 9,
  fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};

// ---------- APP ----------
function App() {
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks({ accent: "blue" })
    : [{ accent: "blue" }, () => {}];
  const [tab, setTab] = useState("upcoming");

  React.useEffect(() => {
    const root = document.documentElement;
    if (tweaks.accent === "green") {
      root.style.setProperty("--accent-50", "#ECFDF5");
      root.style.setProperty("--accent-100", "#D1FAE5");
      root.style.setProperty("--accent-200", "#A7F3D0");
      root.style.setProperty("--accent-600", "#059669");
      root.style.setProperty("--accent-700", "#047857");
      root.style.setProperty("--accent-shadow", "rgba(5, 150, 105, 0.25)");
    } else {
      root.style.setProperty("--accent-50", "#EFF6FF");
      root.style.setProperty("--accent-100", "#DBEAFE");
      root.style.setProperty("--accent-200", "#BFDBFE");
      root.style.setProperty("--accent-600", "#2563EB");
      root.style.setProperty("--accent-700", "#1D4ED8");
      root.style.setProperty("--accent-shadow", "rgba(37, 99, 235, 0.25)");
    }
  }, [tweaks.accent]);

  const tabs = [
    { id: "upcoming", label: "Майбутні заняття", count: UPCOMING.length },
    { id: "history", label: "Історія занять", count: HISTORY.length },
    { id: "achievements", label: "Досягнення" },
    { id: "settings", label: "Налаштування профілю" },
  ];

  return (
    <div style={{ background: "#F8F9FB", minHeight: "100vh" }}>
      <window.DashHeader user={USER} />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 64px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            margin: 0, fontSize: 28, fontWeight: 700, color: "#0F172A",
            letterSpacing: "-0.025em", fontFamily: "var(--display)",
          }}>Привіт, {USER.firstName} 👋</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "#6B7280" }}>
            Ваш персональний кабінет на Coachly
          </p>
        </div>

        <window.DashTabs value={tab} onChange={setTab} tabs={tabs} />

        {tab === "upcoming" && <UpcomingTab />}
        {tab === "history" && <HistoryTab />}
        {tab === "achievements" && <AchievementsTab />}
        {tab === "settings" && <SettingsTab />}
      </main>

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Брендинг">
            <window.TweakRadio
              label="Акцентний колір"
              value={tweaks.accent}
              options={[{ value: "blue", label: "Синій" }, { value: "green", label: "Зелений" }]}
              onChange={(v) => setTweak("accent", v)}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
