import { useMemo, useState } from "react";
import { questScenario, shopItems } from "./data/questScenario";
import { languageNames, translations } from "./i18n/translations";

const FAST_MINUTES = 20;

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("ru");
  const [questStartedAt, setQuestStartedAt] = useState(null);
  const [questFinishedAt, setQuestFinishedAt] = useState(null);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [qrInput, setQrInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [proofs, setProofs] = useState({});
  const [selectedItem, setSelectedItem] = useState(shopItems[0]);
  const [paymentMethod, setPaymentMethod] = useState(questScenario.paymentMethods[0]);
  const [paymentStatus, setPaymentStatus] = useState("");

  const t = translations[lang];
  const nextLevel = questScenario.levels.find((lvl) => !completedLevels.includes(lvl.level));
  const progress = Math.round((completedLevels.length / questScenario.levels.length) * 100);

  const reward = useMemo(() => {
    if (!questFinishedAt || !questStartedAt) return "—";
    const elapsedMin = (questFinishedAt - questStartedAt) / (1000 * 60);
    const pool = elapsedMin <= FAST_MINUTES ? questScenario.rewardBySpeed.fast : questScenario.rewardBySpeed.standard;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [questFinishedAt, questStartedAt]);

  const startQuest = () => {
    if (!questStartedAt) setQuestStartedAt(Date.now());
    setPage("quest");
  };

  const completeLevel = () => {
    if (!nextLevel) return;
    if (qrInput.trim().toUpperCase() !== nextLevel.qrCode) {
      alert("QR-код не совпадает с уровнем");
      return;
    }
    if (!proofs[nextLevel.level]) {
      alert("Сначала загрузите фото или видео");
      return;
    }
    if (nextLevel.question && !answerInput.trim()) {
      alert("Введите ответ на вопрос уровня");
      return;
    }

    const updated = [...completedLevels, nextLevel.level];
    setCompletedLevels(updated);
    setQrInput("");
    setAnswerInput("");

    if (updated.length === questScenario.levels.length) {
      setQuestFinishedAt(Date.now());
      setPage("profile");
    }
  };

  const onUpload = (level, file) => {
    if (!file) return;
    setProofs((prev) => ({ ...prev, [level]: file.name }));
  };

  const payNow = () => {
    setPaymentStatus(`Заказ: ${selectedItem.title}. Способ оплаты: ${paymentMethod}. Статус: инициирована оплата.`);
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{t.appTitle}</h1>
          <p>{t.subtitle}</p>
        </div>
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          {Object.entries(languageNames).map(([code, label]) => (
            <option value={code} key={code}>
              {label}
            </option>
          ))}
        </select>
      </header>

      <nav className="nav">
        <button onClick={() => setPage("home")}>{t.nav.home}</button>
        <button onClick={() => setPage("shop")}>{t.nav.shop}</button>
        <button onClick={() => setPage("quest")}>{t.nav.quest}</button>
        <button onClick={() => setPage("profile")}>{t.nav.profile}</button>
      </nav>

      {page === "home" && <Home t={t} onBuy={() => setPage("shop")} onPlay={startQuest} />}
      {page === "shop" && (
        <Shop
          t={t}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          payNow={payNow}
          paymentStatus={paymentStatus}
        />
      )}
      {page === "quest" && (
        <Quest
          t={t}
          progress={progress}
          nextLevel={nextLevel}
          qrInput={qrInput}
          setQrInput={setQrInput}
          answerInput={answerInput}
          setAnswerInput={setAnswerInput}
          onUpload={onUpload}
          proofs={proofs}
          completeLevel={completeLevel}
        />
      )}
      {page === "profile" && (
        <Profile
          t={t}
          completedLevels={completedLevels.length}
          totalLevels={questScenario.levels.length}
          reward={reward}
          finished={Boolean(questFinishedAt)}
        />
      )}
    </div>
  );
}

function Home({ t, onBuy, onPlay }) {
  return (
    <section className="card">
      <h2>{t.nav.home}</h2>
      <p>Калык шынык: интерактивный проект в ТЦ с квестом и покупками.</p>
      <div className="actions">
        <button className="primary" onClick={onBuy}>
          {t.cta.buy}
        </button>
        <button className="secondary" onClick={onPlay}>
          {t.cta.play}
        </button>
      </div>
    </section>
  );
}

function Shop({ t, selectedItem, setSelectedItem, paymentMethod, setPaymentMethod, payNow, paymentStatus }) {
  return (
    <section className="card">
      <h2>{t.nav.shop}</h2>
      <p>Или получи товары бесплатно, если пройдёшь квест полностью.</p>
      <div className="shop-grid">
        {shopItems.map((item) => (
          <button
            key={item.id}
            className={`item ${selectedItem.id === item.id ? "selected" : ""}`}
            style={{ background: item.color }}
            onClick={() => setSelectedItem(item)}
          >
            <strong>{item.title}</strong>
            <span>{item.price} ₽</span>
          </button>
        ))}
      </div>

      <div className="payment-row">
        <label>{t.labels.payment}</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          {questScenario.paymentMethods.map((method) => (
            <option key={method}>{method}</option>
          ))}
        </select>
        <button className="primary" onClick={payNow}>
          {t.cta.buy}
        </button>
      </div>
      {paymentStatus && <p className="status">{paymentStatus}</p>}
    </section>
  );
}

function Quest({ t, progress, nextLevel, qrInput, setQrInput, answerInput, setAnswerInput, onUpload, proofs, completeLevel }) {
  if (!nextLevel) {
    return (
      <section className="card">
        <h2>{t.nav.quest}</h2>
        <p>{t.profile.done}</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>{t.nav.quest}</h2>
      <p>
        {t.labels.progress}: {progress}%
      </p>
      <progress max="100" value={progress} />

      <div className="level-card">
        <h3>
          {t.labels.level} {nextLevel.level}: {nextLevel.name}
        </h3>
        <p>{nextLevel.task}</p>
        <p>
          <strong>Локация:</strong> {nextLevel.location}
        </p>
        <p>
          <strong>Подтверждение:</strong> {nextLevel.proof}
        </p>

        <label>{t.labels.qr}</label>
        <input value={qrInput} onChange={(e) => setQrInput(e.target.value)} placeholder="Например, GREEN-START" />

        <label>{t.cta.upload}</label>
        <input type="file" onChange={(e) => onUpload(nextLevel.level, e.target.files?.[0])} />
        {proofs[nextLevel.level] && <small>Файл: {proofs[nextLevel.level]}</small>}

        {nextLevel.question && (
          <>
            <label>{nextLevel.question.text}</label>
            <select value={answerInput} onChange={(e) => setAnswerInput(e.target.value)}>
              <option value="">Выбери вариант</option>
              {nextLevel.question.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </>
        )}

        <button className="primary" onClick={completeLevel}>
          Завершить уровень
        </button>
      </div>
    </section>
  );
}

function Profile({ t, completedLevels, totalLevels, reward, finished }) {
  return (
    <section className="card">
      <h2>{t.nav.profile}</h2>
      <p>
        {t.profile.completed}: {completedLevels}/{totalLevels}
      </p>
      <p>
        {t.labels.reward}: {reward}
      </p>
      <p>
        {t.profile.status}: {finished ? t.profile.done : "В процессе"}
      </p>
    </section>
  );
}
