import { useMemo, useState } from "react";

const questScenario = {
  title: "Банк покупок",
  brand: "Калык шынык",
  levels: [
    {
      level: 1,
      name: {
        ru: "Дух входа",
        en: "Entrance Spirit",
        mar: "Пурлык толын"
      },
      location: {
        ru: "Главный вход ТЦ",
        en: "Main mall entrance",
        mar: "ТЦ тӱшкы вход"
      },
      task: {
        ru: "Найди 3 предмета светло-зелёного цвета и сделай фото",
        en: "Find 3 light-green objects and upload one photo",
        mar: "Кум тӱрлӧ ужар предметым муо да фотом колто"
      },
      proof: "photo"
    },
    {
      level: 2,
      name: {
        ru: "Код предков",
        en: "Ancestors' Code",
        mar: "Кугыза код"
      },
      location: {
        ru: "Декор на любом этаже",
        en: "Decor spot on any floor",
        mar: "Кеч-могай этажыште декор"
      },
      task: {
        ru: "Найди орнамент, сделай фото и выбери значение символа",
        en: "Find an ornament, upload photo and pick symbol meaning",
        mar: "Орнаментым муо, фотом колто да палымашым ойло"
      },
      proof: "photo+answer"
    },
    {
      level: 3,
      name: {
        ru: "Живое пространство",
        en: "Living Space",
        mar: "Илыме вер"
      },
      location: {
        ru: "Партнёрский магазин",
        en: "Partner shop",
        mar: "Партнер кевыт"
      },
      task: {
        ru: "Сними видео до 10 секунд с фразой «Я в Банке покупок»",
        en: "Record up to 10s video saying: 'I am in Shopping Bank'",
        mar: "10 сек видеом пыште: «Мый Банк покупокышто»"
      },
      proof: "video"
    },
    {
      level: 4,
      name: {
        ru: "Связь людей",
        en: "People Connection",
        mar: "Еҥ-влак кыл"
      },
      location: {
        ru: "Любая зона ТЦ",
        en: "Any mall zone",
        mar: "ТЦ-ште кеч-могай вер"
      },
      task: {
        ru: "Сделай совместное фото с другим участником",
        en: "Take a joint photo with another participant",
        mar: "Весе йоча дене ик фотом пыште"
      },
      proof: "photo"
    },
    {
      level: 5,
      name: {
        ru: "Испытание знания",
        en: "Knowledge Challenge",
        mar: "Шанче тергымаш"
      },
      location: {
        ru: "Финальная зона с QR",
        en: "Final QR zone",
        mar: "Пытартыш QR вер"
      },
      task: {
        ru: "Ответь на вопрос: что означает «Калык шынык»?",
        en: "Answer: what does 'Kalyk shynyk' mean?",
        mar: "«Калык шынык» могайшым ойлеш?"
      },
      proof: "answer"
    }
  ],
  reward: ["Сумка", "Игрушка", "Украшение", "Открытка"]
};

const translations = {
  ru: {
    home: "Главная",
    shop: "Каталог",
    quest: "Квест",
    profile: "Профиль",
    buy: "Купить товар",
    passQuest: "Пройти квест",
    title: "Банк покупок",
    subtitle: "Купи товар или получи подарок, пройдя квест",
    progress: "Прогресс",
    upload: "Загрузить",
    scanQR: "Сканировать QR",
    payment: "Перейти к оплате",
    paymentHint: "Поддержка VTB Pay / Sber Pay / Stripe / PayPal (через backend API)",
    reward: "Награда",
    language: "Язык",
    done: "Завершено",
    chooseMeaning: "Что символизирует знак?",
    meaningOptions: ["Солнце и жизнь", "Победу", "Реку"],
    finishFast: "Быстрое прохождение",
    finishSlow: "Спокойное прохождение"
  },
  en: {
    home: "Home",
    shop: "Shop",
    quest: "Quest",
    profile: "Profile",
    buy: "Buy product",
    passQuest: "Start quest",
    title: "Shopping Bank",
    subtitle: "Buy or complete quest to get a reward",
    progress: "Progress",
    upload: "Upload",
    scanQR: "Scan QR",
    payment: "Go to payment",
    paymentHint: "VTB Pay / Sber Pay / Stripe / PayPal via backend API",
    reward: "Reward",
    language: "Language",
    done: "Done",
    chooseMeaning: "What does the symbol mean?",
    meaningOptions: ["Sun and life", "Victory", "River"],
    finishFast: "Fast finish",
    finishSlow: "Slow finish"
  },
  mar: {
    home: "Тӱшка",
    shop: "Каталог",
    quest: "Квест",
    profile: "Профиль",
    buy: "Налымаш",
    passQuest: "Квестым тӱҥал",
    title: "Банк покупок",
    subtitle: "Налыме але квест гоч подарок",
    progress: "Ончыктымаш",
    upload: "Колтымаш",
    scanQR: "QR лудмаш",
    payment: "Тӱлымашыш кайыше",
    paymentHint: "VTB Pay / Sber Pay / Stripe / PayPal backend гоч",
    reward: "Кучылтмаш",
    language: "Йылме",
    done: "Пытым",
    chooseMeaning: "Тиде пале мом ончыкта?",
    meaningOptions: ["Кече да илыш", "Сеҥымаш", "Энер"],
    finishFast: "Вашкен пытарыме",
    finishSlow: "Пӧрынь пытарыме"
  }
};

const productList = [
  { id: 1, name: "Экосумка", price: "590 ₽" },
  { id: 2, name: "Игрушка", price: "490 ₽" },
  { id: 3, name: "Украшение", price: "790 ₽" }
];

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("ru");
  const [completed, setCompleted] = useState([]);
  const [symbolAnswer, setSymbolAnswer] = useState("");
  const t = translations[lang];

  const currentLevel = useMemo(
    () => questScenario.levels.find((l) => !completed.includes(l.level)),
    [completed]
  );

  const completeLevel = (level) => {
    if (!completed.includes(level)) {
      setCompleted([...completed, level]);
    }
  };

  const smartReward = completed.length >= 5 ? t.finishFast : t.finishSlow;

  return (
    <div className="app">
      <header className="header">
        <h1>{t.title}</h1>
        <div className="lang-switcher">
          <span>{t.language}:</span>
          {Object.keys(translations).map((code) => (
            <button key={code} onClick={() => setLang(code)} className={lang === code ? "active" : ""}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <nav className="nav">
        <button onClick={() => setPage("home")}>{t.home}</button>
        <button onClick={() => setPage("shop")}>{t.shop}</button>
        <button onClick={() => setPage("quest")}>{t.quest}</button>
        <button onClick={() => setPage("profile")}>{t.profile}</button>
      </nav>

      {page === "home" && <Home t={t} setPage={setPage} />}
      {page === "shop" && <Shop t={t} />}
      {page === "quest" && (
        <Quest
          t={t}
          lang={lang}
          levels={questScenario.levels}
          completed={completed}
          currentLevel={currentLevel}
          onComplete={completeLevel}
          symbolAnswer={symbolAnswer}
          setSymbolAnswer={setSymbolAnswer}
        />
      )}
      {page === "profile" && (
        <Profile t={t} completed={completed} total={questScenario.levels.length} smartReward={smartReward} />
      )}
    </div>
  );
}

function Home({ t, setPage }) {
  return (
    <section className="panel home">
      <p>{t.subtitle}</p>
      <div className="cta-row">
        <button onClick={() => setPage("shop")}>{t.buy}</button>
        <button onClick={() => setPage("quest")}>{t.passQuest}</button>
      </div>
    </section>
  );
}

function Shop({ t }) {
  return (
    <section className="panel">
      <h2>{t.shop}</h2>
      <div className="cards">
        {productList.map((p) => (
          <article key={p.id} className="card">
            <h3>{p.name}</h3>
            <p>{p.price}</p>
            <button>{t.buy}</button>
          </article>
        ))}
      </div>
      <div className="payment-block">
        <button>{t.payment}</button>
        <small>{t.paymentHint}</small>
      </div>
    </section>
  );
}

function Quest({ t, lang, levels, completed, currentLevel, onComplete, symbolAnswer, setSymbolAnswer }) {
  const progress = `${completed.length}/${levels.length}`;

  return (
    <section className="panel">
      <h2>{t.quest}</h2>
      <p>
        {t.progress}: <strong>{progress}</strong>
      </p>
      <div className="progress-bar">
        <span style={{ width: `${(completed.length / levels.length) * 100}%` }} />
      </div>

      {currentLevel ? (
        <article className="level-card">
          <h3>
            #{currentLevel.level} — {currentLevel.name[lang]}
          </h3>
          <p>{currentLevel.location[lang]}</p>
          <p>{currentLevel.task[lang]}</p>
          {currentLevel.level === 2 && (
            <label>
              {t.chooseMeaning}
              <select value={symbolAnswer} onChange={(e) => setSymbolAnswer(e.target.value)}>
                <option value="">—</option>
                {t.meaningOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="cta-row">
            <button>{t.scanQR}</button>
            <button>{t.upload}</button>
            <button
              onClick={() => onComplete(currentLevel.level)}
              disabled={currentLevel.level === 2 && !symbolAnswer}
            >
              {t.done}
            </button>
          </div>
        </article>
      ) : (
        <h3>🎉 Quest completed!</h3>
      )}
    </section>
  );
}

function Profile({ t, completed, total, smartReward }) {
  return (
    <section className="panel">
      <h2>{t.profile}</h2>
      <p>
        {t.progress}: {completed.length}/{total}
      </p>
      <p>
        {t.reward}: <strong>{smartReward}</strong>
      </p>
    </section>
  );
}
