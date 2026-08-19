/**
 * Design philosophy: a bright mission-control console over a calm indigo space
 * map. Visual excitement always supports clear Grade 3 mathematics, never hides it.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import {
  Check,
  ChevronRight,
  Gem,
  HelpCircle,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { createGameScene, type GameHandle } from "@/game/scene";
import {
  generateQuestion,
  generateMissingComponentQuestion,
  generateTableQuestion,
  TIMES_TABLES,
  type Difficulty,
  type ExerciseMode,
  type Operation,
  type QuizQuestion,
  type TablePracticeKind,
} from "@/game/quiz";

const ASSETS = {
  mascot: "/manus-storage/robot-mit_d342b189.png",
  planets: "/manus-storage/toan-planets_2d2902d4.png",
  logo: "/manus-storage/phi-hanh-tinh-logo_cbefb56f.png",
} as const;

type AppScreen = "welcome" | "menu" | "game";
type ActivityId = "add" | "subtract" | "multiply" | "divide" | "tables" | "test";

const activityMeta: Record<ActivityId, { label: string; kicker: string; description: string }> = {
  add: { label: "Cộng", kicker: "PHÉP TÍNH CỘNG", description: "Gộp các nhóm năng lượng và tìm tổng thật nhanh." },
  subtract: { label: "Trừ", kicker: "PHÉP TÍNH TRỪ", description: "Tìm phần còn lại với những nhiệm vụ ngắn gọn." },
  multiply: { label: "Nhân", kicker: "PHÉP TÍNH NHÂN", description: "Xếp các nhóm bằng nhau để nhân thật tự tin." },
  divide: { label: "Chia", kicker: "PHÉP TÍNH CHIA", description: "Chia đều tinh thể cho các bạn robot." },
  tables: { label: "Học Bảng Nhân và Chia từ 2 đến 9", kicker: "BẢNG NHÂN VÀ CHIA 2–9", description: "Chọn bảng nhân, bảng chia hoặc cả nhân và chia." },
  test: { label: "Bài kiểm tra", kicker: "8 CÂU THỬ THÁCH", description: "Hoàn thành tám nhiệm vụ để nhận thật nhiều sao." },
};

function WelcomeScreen({ onStart, onGuide }: { onStart: () => void; onGuide: () => void }) {
  return (
    <section className="welcome-screen" aria-label="Chào mừng đến với Phi Hành Tinh Phép Tính">
      <div className="welcome-topbar">
        <div className="mini-brand"><span className="mini-brand-rocket"><Rocket size={19} fill="currentColor" /></span><span>Phi Hành Tinh<br />Phép Tính</span></div>
        <button type="button" className="welcome-help" onClick={onGuide}><HelpCircle size={17} /> Hướng dẫn</button>
      </div>
      <div className="welcome-content">
        <div className="welcome-robot" aria-hidden="true"><div className="robot-fallback"><span /><span /><i /></div><span className="robot-orbit" /></div>
        <p className="welcome-kicker"><Sparkles size={15} /> CHÀO MỪNG PHI HÀNH GIA NHỎ</p>
        <h2><span>Cùng Hana</span><em>ôn toán học</em></h2>
        <p className="welcome-intro">Cùng Robot Hana chinh phục các hoạt động Cộng, Trừ, Nhân và Chia qua những nhiệm vụ thật vui.</p>
        <div className="welcome-actions">
          <button type="button" className="welcome-primary" onClick={onStart}>Bắt đầu <Rocket size={19} fill="currentColor" /></button>
          <button type="button" className="welcome-secondary" onClick={onGuide}><HelpCircle size={18} /> Xem cách chơi</button>
        </div>
        <div className="welcome-path" aria-label="Bốn hành tinh sẽ khám phá">
          <span><b className="orange">+</b> Cộng</span><i /><span><b className="purple">−</b> Trừ</span><i /><span><b className="teal">×</b> Nhân</span><i /><span><b className="yellow">÷</b> Chia</span>
        </div>
      </div>
    </section>
  );
}

function ActivityMenu({ onBack, onGuide, onChoose }: { onBack: () => void; onGuide: () => void; onChoose: (activity: ActivityId) => void }) {
  const activities: Array<{ id: ActivityId; eyebrow: string; detail: string; tone: string; symbol: string }> = [
    { id: "add", eyebrow: "PHÉP TÍNH CỘNG", detail: "Gộp các nhóm và tìm tổng.", tone: "add", symbol: "+" },
    { id: "subtract", eyebrow: "PHÉP TÍNH TRỪ", detail: "Tìm phần còn lại.", tone: "subtract", symbol: "−" },
    { id: "tables", eyebrow: "BẢNG NHÂN VÀ CHIA 2–9", detail: "Chọn từng bảng hoặc luyện cả nhân và chia.", tone: "tables", symbol: "×÷" },
    { id: "multiply", eyebrow: "PHÉP TÍNH NHÂN", detail: "Xếp những nhóm bằng nhau.", tone: "multiply", symbol: "×" },
    { id: "divide", eyebrow: "PHÉP TÍNH CHIA", detail: "Chia đều các tinh thể.", tone: "divide", symbol: "÷" },
    { id: "test", eyebrow: "8 CÂU THỬ THÁCH", detail: "Thử sức và nhận sao.", tone: "test", symbol: "★" },
  ];

  return (
    <section className="activity-screen" aria-label="Chọn hoạt động học">
      <div className="activity-topbar">
        <button type="button" className="menu-back" onClick={onBack}>← Trở về</button>
        <div className="mini-brand"><span className="mini-brand-rocket"><Rocket size={19} fill="currentColor" /></span><span>Phi Hành Tinh<br />Phép Tính</span></div>
        <button type="button" className="welcome-help" onClick={onGuide}><HelpCircle size={17} /> Hướng dẫn</button>
      </div>
      <div className="activity-heading">
        <p>CHỌN NHIỆM VỤ</p>
        <h2>Bạn muốn chinh phục điều gì?</h2>
        <span>Chạm vào một thẻ để bắt đầu nhé.</span>
      </div>
      <div className="activity-grid">
        {activities.map((activity, index) => {
          return (
            <button key={activity.id} type="button" className={`activity-card ${activity.tone}`} onClick={() => onChoose(activity.id)}>
              <span className="activity-order">0{index + 1}</span>
              <span className="activity-icon sigil"><i /><b>{activity.symbol}</b></span>
              <span className="activity-copy"><b>{activity.eyebrow}</b><strong>{activityMeta[activity.id].label}</strong><small>{activity.detail}</small></span>
              <ChevronRight className="activity-arrow" size={22} />
            </button>
          );
        })}
      </div>
      <p className="activity-footer">Robot Hana sẽ đồng hành cùng bạn trong mọi chuyến bay.</p>
    </section>
  );
}

const difficultyMeta: Record<Difficulty, { label: string; detail: string }> = {
  easy: { label: "Làm quen", detail: "Tính nhẩm nhẹ nhàng" },
  medium: { label: "Tự tin", detail: "Tính theo cột và bảng nhân" },
  challenge: { label: "Thám hiểm", detail: "Nhiệm vụ lớn hơn" },
};

const tableKindMeta: Record<TablePracticeKind, { label: string; subtitle: string; accent: string }> = {
  multiply: { label: "Bảng nhân", subtitle: "Nhân theo từng bảng", accent: "#54cbb4" },
  divide: { label: "Bảng chia", subtitle: "Chia theo từng bảng", accent: "#f3c85e" },
  mixed: { label: "Cả nhân và chia", subtitle: "Nhân và chia xen kẽ", accent: "#ff7b5a" },
};

function pickTestOperation() {
  const operations: Operation[] = ["add", "subtract", "multiply", "divide"];
  return operations[Math.floor(Math.random() * operations.length)];
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const handleRef = useRef<GameHandle | null>(null);
  const demoParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const isDemo = demoParams.has("demo");
  const isTableDemo = demoParams.has("tables");
  const isMenuPreview = demoParams.has("menu");
  const missingDemoOperation = demoParams.get("missing");
  const isMissingDemo = missingDemoOperation === "add" || missingDemoOperation === "subtract" || missingDemoOperation === "multiply" || missingDemoOperation === "divide";
  const tableDemoKind: TablePracticeKind = demoParams.get("tables") === "divide" ? "divide" : demoParams.get("tables") === "mixed" ? "mixed" : "multiply";
  const initialOperation: Operation = isMissingDemo
    ? missingDemoOperation
    : isDemo || isTableDemo
    ? (tableDemoKind === "divide" ? "divide" : "multiply")
    : "add";

  const [screen, setScreen] = useState<AppScreen>(isDemo || isTableDemo || isMissingDemo ? "game" : isMenuPreview ? "menu" : "welcome");
  const [mode, setMode] = useState<ExerciseMode>(isTableDemo ? "tables" : "practice");
  const [selectedActivity, setSelectedActivity] = useState<ActivityId>(isTableDemo ? "tables" : isMissingDemo ? initialOperation : isDemo ? "multiply" : "add");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [operation, setOperation] = useState<Operation>(initialOperation);
  const [question, setQuestion] = useState<QuizQuestion>(() => isTableDemo
    ? generateTableQuestion({ kind: tableDemoKind, tables: [2, 4, 6] })
    : isMissingDemo
    ? generateMissingComponentQuestion(initialOperation, "easy")
    : generateQuestion(initialOperation, "easy"));
  const [tableKind, setTableKind] = useState<TablePracticeKind>(tableDemoKind);
  const [selectedTables, setSelectedTables] = useState<number[]>(isTableDemo ? [2, 4, 6] : [2]);
  const [answered, setAnswered] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [energy, setEnergy] = useState(isDemo ? 3 : 0);
  const [stars, setStars] = useState(isDemo ? 3 : 0);
  const [testStep, setTestStep] = useState(0);
  const [testCorrect, setTestCorrect] = useState(0);
  const [testComplete, setTestComplete] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const createNextQuestion = useCallback(
    (nextMode = mode, nextOperation = operation, nextDifficulty = difficulty) => {
      if (nextMode === "tables") {
        if (selectedTables.length === 0) {
          setAnswered(null);
          setFeedback("idle");
          return;
        }
        const tableQuestion = generateTableQuestion({ kind: tableKind, tables: selectedTables });
        setOperation(tableQuestion.operation);
        setQuestion(tableQuestion);
        setAnswered(null);
        setFeedback("idle");
        handleRef.current?.setActivePlanet(tableQuestion.operation);
        return;
      }
      const operationForQuestion = nextMode === "test" ? pickTestOperation() : nextOperation;
      setOperation(operationForQuestion);
      setQuestion(generateQuestion(operationForQuestion, nextDifficulty));
      setAnswered(null);
      setFeedback("idle");
      handleRef.current?.setActivePlanet(operationForQuestion);
    },
    [difficulty, mode, operation, selectedTables, tableKind],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });
    let disposed = false;

    createGameScene(engine, canvas)
      .then((handle) => {
        if (disposed) {
          handle.dispose();
          return;
        }
        handleRef.current = handle;
        handle.setActivePlanet(initialOperation);
        handle.setEnergy(isDemo ? 3 : 0);
        engine.runRenderLoop(() => handle.scene.render());
      })
      .catch((error) => console.error("Không thể khởi tạo bản đồ hành tinh", error));

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      handleRef.current?.dispose();
      handleRef.current = null;
      engine.dispose();
      startedRef.current = false;
    };
  }, [initialOperation, isDemo, isTableDemo]);

  const selectOperation = (nextOperation: Operation) => {
    setOperation(nextOperation);
    setTestComplete(false);
    setTestStep(0);
    setTestCorrect(0);
    setQuestion(generateQuestion(nextOperation, difficulty));
    setAnswered(null);
    setFeedback("idle");
    handleRef.current?.setActivePlanet(nextOperation);
  };

  const selectDifficulty = (nextDifficulty: Difficulty) => {
    setDifficulty(nextDifficulty);
    setTestComplete(false);
    setTestStep(0);
    setTestCorrect(0);
    setQuestion(generateQuestion(operation, nextDifficulty));
    setAnswered(null);
    setFeedback("idle");
  };

  const selectMode = (nextMode: ExerciseMode) => {
    setMode(nextMode);
    setTestStep(0);
    setTestCorrect(0);
    setTestComplete(false);
    createNextQuestion(nextMode);
  };

  const setTablePractice = (nextKind: TablePracticeKind, nextTables = selectedTables) => {
    if (nextTables.length === 0) {
      setMode("tables");
      setTableKind(nextKind);
      setSelectedTables([]);
      setAnswered(null);
      setFeedback("idle");
      setTestComplete(false);
      setTestStep(0);
      setTestCorrect(0);
      return;
    }
    const tableQuestion = generateTableQuestion({ kind: nextKind, tables: nextTables });
    setMode("tables");
    setTableKind(nextKind);
    setSelectedTables(nextTables);
    setOperation(tableQuestion.operation);
    setQuestion(tableQuestion);
    setAnswered(null);
    setFeedback("idle");
    setTestComplete(false);
    setTestStep(0);
    setTestCorrect(0);
    handleRef.current?.setActivePlanet(tableQuestion.operation);
  };

  const startActivity = (nextActivity: ActivityId) => {
    setEnergy(0);
    setStars(0);
    setAnswered(null);
    setFeedback("idle");
    setTestComplete(false);
    setTestStep(0);
    setTestCorrect(0);
    handleRef.current?.setEnergy(0);
    setScreen("game");
    setSelectedActivity(nextActivity);
    if (nextActivity === "tables") {
      setTablePractice(tableKind, selectedTables);
      return;
    }
    if (nextActivity === "test") {
      selectMode("test");
      return;
    }
    setMode("practice");
    selectOperation(nextActivity);
  };

  const toggleTable = (table: number) => {
    const nextTables = selectedTables.includes(table)
      ? (selectedTables.length === 1 ? selectedTables : selectedTables.filter((item) => item !== table))
      : [...selectedTables, table].sort((a, b) => a - b);
    setTablePractice(tableKind, nextTables);
  };

  const changeTableKind = (nextKind: TablePracticeKind) => {
    setTableKind(nextKind);
    if (selectedTables.length > 0) setTablePractice(nextKind, selectedTables);
  };

  const clearAllTables = () => {
    setSelectedTables([]);
    setAnswered(null);
    setFeedback("idle");
    setTestComplete(false);
  };

  const answerQuestion = useCallback(
    (choice: number) => {
      if (answered !== null || testComplete || (mode === "tables" && selectedTables.length === 0)) return;
      setAnswered(choice);
      if (choice === question.answer) {
        setFeedback("correct");
        setEnergy((current) => {
          const next = Math.min(5, current + 1);
          handleRef.current?.setEnergy(next);
          return next;
        });
        setStars((current) => current + 1);
        if (mode === "test") setTestCorrect((current) => current + 1);
        handleRef.current?.celebrate();
      } else {
        setFeedback("wrong");
      }
    },
    [answered, mode, question.answer, selectedTables.length, testComplete],
  );

  const continueMission = () => {
    if (mode === "tables" && selectedTables.length === 0) return;
    if (feedback === "wrong") {
      setAnswered(null);
      setFeedback("idle");
      return;
    }
    if (mode === "test") {
      if (testStep + 1 >= 8) {
        setTestComplete(true);
        return;
      }
      setTestStep((step) => step + 1);
      createNextQuestion("test");
      return;
    }
    createNextQuestion();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (screen !== "game") return;
      const numeric = Number(event.key);
      if (numeric >= 1 && numeric <= 4) {
        const option = question.options[numeric - 1];
        if (option !== undefined) answerQuestion(option);
      }
      if (event.key === "Enter" && feedback !== "idle") continueMission();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answerQuestion, feedback, question.options, screen]);

  const missionCount = mode === "test" ? `${Math.min(testStep + 1, 8)}/8` : `${energy}/5`;
  const isTableMode = mode === "tables";
  const hasSelectedTables = selectedTables.length > 0;
  const hasAllTables = selectedTables.length === TIMES_TABLES.length;
  const activeActivity = activityMeta[selectedActivity];

  return (
    <main className="game-shell">
      <canvas ref={canvasRef} className="game-canvas" aria-label="Không gian trò chơi toán học" />
      <div className="space-atmosphere" aria-hidden="true" />

      {screen === "welcome" && <WelcomeScreen onStart={() => setScreen("menu")} onGuide={() => setShowGuide(true)} />}
      {screen === "menu" && <ActivityMenu onBack={() => setScreen("welcome")} onGuide={() => setShowGuide(true)} onChoose={startActivity} />}

      {screen === "game" && <>
      <header className="mission-header">
        <div className="brand-lockup">
          <div className="brand-emblem" aria-hidden="true">
            <span className="emblem-orbit" />
            <Rocket className="emblem-rocket" size={24} fill="currentColor" />
            <span className="emblem-plus">+</span>
            <img className="brand-mark" src={ASSETS.logo} alt="" />
          </div>
          <div>
            <p className="eyebrow">TOÁN LỚP 3</p>
            <h1>Phi Hành Tinh<br />Phép Tính</h1>
          </div>
        </div>
        <div className="header-middle" aria-label="Tiến độ năng lượng">
          <span className="header-label"><Zap size={15} /> Năng lượng</span>
          <div className="energy-track">
            {[0, 1, 2, 3, 4].map((index) => (
              <span key={index} className={index < energy ? "energy-dot is-filled" : "energy-dot"}>
                <Gem size={13} fill="currentColor" />
              </span>
            ))}
          </div>
        </div>
        <button className="mission-menu-button" type="button" onClick={() => setScreen("menu")}><span>☰</span> Menu</button>
        <button className="star-bank" type="button" onClick={() => setShowGuide(true)} aria-label="Xem thông tin tiến độ">
          <span className="star-icon"><Star size={20} fill="currentColor" /></span>
          <span><strong>{stars}</strong> sao</span>
          <HelpCircle size={16} />
        </button>
      </header>

      <section className="mission-copy" aria-live="polite">
        <div className="mission-kicker"><Rocket size={15} /> {activeActivity.kicker}</div>
        <h2>{activeActivity.label}</h2>
        <p>{activeActivity.description}</p>
      </section>

      <aside className="robot-guide" aria-label="Robot Hana hướng dẫn">
        <div className="robot-fallback" aria-hidden="true"><span /><span /><i /></div>
        <div className="robot-note"><span className="robot-note-dot" />Robot Hana: “Bạn làm được mà!”</div>
      </aside>

      <section className="mission-control" aria-label="Bảng điều khiển bài tập">
        <div className="console-topline">
          <div className="mascot-wrap">
            <span className="speech-spark"><Sparkles size={14} /></span>
          </div>
          <div className="console-title">
            <p>{activeActivity.label} <span>•</span> {isTableMode ? tableKindMeta[tableKind].subtitle : mode === "test" ? "8 câu thử thách" : difficultyMeta[difficulty].label}</p>
            <h3>{testComplete ? "Hoàn thành kiểm tra!" : isTableMode && !hasSelectedTables ? "Hãy chọn ít nhất một bảng để bắt đầu." : question.mission}</h3>
          </div>
          <div className="mission-counter">
            <span>{mode === "test" ? "Câu" : "Tinh thể"}</span>
            <strong>{testComplete ? "8/8" : missionCount}</strong>
          </div>
        </div>

        {testComplete ? (
          <div className="completion-card">
            <div className="completion-icon"><Trophy size={30} /></div>
            <div>
              <p>Con đã hoàn thành 8 nhiệm vụ!</p>
              <h3>{testCorrect}/8 câu đúng · {testCorrect >= 6 ? "Bay thật giỏi!" : "Cố gắng rất đáng khen!"}</h3>
            </div>
            <button type="button" className="primary-action" onClick={() => selectMode("test")}>
              Làm lại <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <>
            {isTableMode && (
              <section className="table-practice-panel" aria-label="Chọn bảng cửu chương để luyện">
                <div className="table-panel-heading">
                  <div>
                    <span>BẢNG CỬU CHƯƠNG</span>
                    <strong>{tableKindMeta[tableKind].label}</strong>
                  </div>
                  <p>{!hasSelectedTables ? "Chưa chọn bảng" : selectedTables.length === 1 ? `Đang luyện bảng ${selectedTables[0]}` : `${selectedTables.length} bảng đã chọn`}</p>
                </div>
                <div className="table-kind-switch" aria-label="Chọn kiểu bảng cửu chương">
                  {(Object.keys(tableKindMeta) as TablePracticeKind[]).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      className={tableKind === kind ? "is-active" : ""}
                      style={{ "--table-accent": tableKindMeta[kind].accent } as React.CSSProperties}
                      onClick={() => changeTableKind(kind)}
                    >
                      {tableKindMeta[kind].label}
                    </button>
                  ))}
                </div>
                <div className="table-picker-head">
                  <span>Chọn một hoặc nhiều bảng</span>
                  <div className="table-picker-actions">
                    <button type="button" onClick={() => setTablePractice(tableKind, [...TIMES_TABLES])} disabled={hasAllTables}>Chọn Tất Cả</button>
                    <button type="button" onClick={clearAllTables} disabled={!hasSelectedTables}>Bỏ Chọn Tất Cả</button>
                  </div>
                </div>
                <div className="table-number-grid" aria-label="Các bảng từ 2 đến 9">
                  {TIMES_TABLES.map((table) => (
                    <button
                      key={table}
                      type="button"
                      className={selectedTables.includes(table) ? "is-selected" : ""}
                      style={{ "--table-accent": tableKindMeta[tableKind].accent } as React.CSSProperties}
                      aria-pressed={selectedTables.includes(table)}
                      onClick={() => toggleTable(table)}
                    >
                      {table}
                    </button>
                  ))}
                </div>
              </section>
            )}
            {(!isTableMode || hasSelectedTables) ? <>
            <div className="question-panel">
              <span className="question-label">{isTableMode ? "NHIỆM VỤ BẢNG NHÂN VÀ CHIA" : question.kind === "missing" ? "TÌM THÀNH PHẦN CHƯA BIẾT" : "NHIỆM VỤ TOÁN HỌC"}</span>
              <p className="math-expression">{question.expression}</p>
              <p className="math-helper">{question.kind === "missing" ? "Tìm số còn thiếu để hoàn thành phép tính." : "Chọn đáp án đúng để gửi tinh thể vào động cơ."}</p>
            </div>
            <div className="answer-grid">
              {question.options.map((choice, index) => {
                const isChosen = choice === answered;
                const isCorrect = choice === question.answer;
                const classNames = [
                  "answer-button",
                  isChosen ? "is-chosen" : "",
                  feedback === "correct" && isCorrect ? "is-correct" : "",
                  feedback === "wrong" && isChosen ? "is-wrong" : "",
                ].filter(Boolean).join(" ");
                return (
                  <button className={classNames} key={`${question.id}-${choice}`} type="button" onClick={() => answerQuestion(choice)}>
                    <span className="answer-index">{index + 1}</span>
                    <strong>{choice}</strong>
                    {feedback === "correct" && isCorrect && <Check className="answer-status" size={19} />}
                    {feedback === "wrong" && isChosen && <X className="answer-status" size={19} />}
                  </button>
                );
              })}
            </div>
            {feedback !== "idle" && (
              <div className={feedback === "correct" ? "feedback-banner is-correct" : "feedback-banner is-wrong"}>
                {feedback === "correct" ? <div><Check size={18} /><span>Đúng rồi! Một tinh thể đã bay vào động cơ.</span></div> : <div className="hana-hint">
                  <div className="hana-hint-robot" aria-label="Robot Hana đang gợi ý"><span /><span /><i /></div>
                  <div className="hana-hint-copy"><strong>Robot Hana gợi ý:</strong><span>{question.hint}</span><ol>{question.hintSteps.map((step) => <li key={step}>{step}</li>)}</ol></div>
                </div>}
                <button type="button" onClick={continueMission}>
                  {feedback === "correct" ? (mode === "test" && testStep + 1 >= 8 ? "Xem kết quả" : "Nhiệm vụ tiếp") : "Thử lại"}
                  <ChevronRight size={17} />
                </button>
              </div>
            )}
            </> : <div className="table-empty-state"><Gem size={25} /><strong>Chọn bảng để luyện nhé</strong><span>Bạn có thể chọn một bảng, nhiều bảng hoặc bấm “Chọn Tất Cả”.</span></div>}
          </>
        )}

        <div className="control-row">
          <button type="button" className="change-activity" onClick={() => setScreen("menu")}><Rocket size={15} /> Chọn hoạt động khác</button>
          {!isTableMode && <div className="level-switch" aria-label="Chọn cấp độ">
            {(Object.keys(difficultyMeta) as Difficulty[]).map((key) => (
              <button key={key} type="button" className={difficulty === key ? "is-active" : ""} onClick={() => selectDifficulty(key)}>{difficultyMeta[key].label}</button>
            ))}
          </div>}
        </div>
      </section>
      </>}

      {showGuide && (
        <div className="guide-backdrop" role="dialog" aria-modal="true" aria-label="Hướng dẫn cách chơi">
          <section className="guide-card">
            <button className="guide-close" type="button" onClick={() => setShowGuide(false)} aria-label="Đóng lộ trình"><X size={19} /></button>
            <div className="guide-heading">
              <div>
                <p className="eyebrow">ROBOT HANA HƯỚNG DẪN</p>
                <h2>Cách chơi thật dễ</h2>
                <p>Chọn một hoạt động, làm phép tính và thu thập tinh thể năng lượng nhé.</p>
              </div>
            </div>
            <ol className="curriculum-list">
              <li><span>01</span><div><strong>Chọn hoạt động</strong><p>Bạn chọn Cộng, Trừ, Học Bảng Nhân và Chia từ 2 đến 9, Nhân, Chia hoặc Bài kiểm tra.</p></div></li>
              <li><span>02</span><div><strong>Đọc thật kỹ phép tính</strong><p>Nhìn vào bài toán lớn ở bảng điều khiển trước khi chọn đáp án.</p></div></li>
              <li><span>03</span><div><strong>Chọn đáp án đúng</strong><p>Mỗi câu có bốn đáp án. Bạn có thể nhấn phím 1 đến 4 trên máy tính.</p></div></li>
              <li><span>04</span><div><strong>Không sao nếu chưa đúng</strong><p>Robot Hana sẽ đưa gợi ý để bạn thử lại và tiếp tục học.</p></div></li>
            </ol>
            <p className="guide-note">Bạn có thể bấm nút Menu bất cứ lúc nào để đổi sang một hoạt động khác.</p>
            <button type="button" className="primary-action" onClick={() => setShowGuide(false)}>Mình đã hiểu <Rocket size={18} /></button>
          </section>
        </div>
      )}
    </main>
  );
}
