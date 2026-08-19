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
import { formatDuration, practiceFormatMeta, rewardsForPoints, sessionRewards, type PracticeFormat } from "@/game/session";

const ASSETS = {
  mascot: "/manus-storage/robot-mit_d342b189.png",
  planets: "/manus-storage/toan-planets_2d2902d4.png",
  logo: "/manus-storage/phi-hanh-tinh-logo_cbefb56f.png",
} as const;

type AppScreen = "welcome" | "profile" | "menu" | "format" | "game" | "summary";
type ActivityId = "add" | "subtract" | "multiply" | "divide" | "tables" | "test";

const activityMeta: Record<ActivityId, { label: string; kicker: string; description: string }> = {
  add: { label: "Cộng", kicker: "PHÉP TÍNH CỘNG", description: "Gộp các nhóm số và tìm tổng thật nhanh." },
  subtract: { label: "Trừ", kicker: "PHÉP TÍNH TRỪ", description: "Tìm phần còn lại với những nhiệm vụ ngắn gọn." },
  multiply: { label: "Nhân", kicker: "PHÉP TÍNH NHÂN", description: "Xếp các nhóm bằng nhau để nhân thật tự tin." },
  divide: { label: "Chia", kicker: "PHÉP TÍNH CHIA", description: "Chia đều các nhóm số theo nhiệm vụ." },
  tables: { label: "Học Bảng Nhân và Chia", kicker: "BẢNG NHÂN VÀ CHIA", description: "Chọn bảng nhân, bảng chia hoặc cả nhân và chia." },
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

function PlayerProfileScreen({ name, onNameChange, onBack, onContinue }: { name: string; onNameChange: (name: string) => void; onBack: () => void; onContinue: () => void }) {
  return <section className="profile-screen" aria-label="Đặt tên phi hành gia">
    <button type="button" className="format-back" onClick={onBack}>← Trở về</button>
    <div className="format-brand mini-brand" aria-label="Phi Hành Tinh Phép Tính"><span className="mini-brand-rocket"><Rocket size={17} fill="currentColor" /></span><span>Phi Hành Tinh<br />Phép Tính</span></div>
    <div className="profile-orbit" aria-hidden="true" />
    <div className="profile-hana"><div className="robot-fallback"><span /><span /><i /></div></div>
    <p className="format-kicker">ROBOT HANA CHỜ BẠN</p>
    <h2>Hana nên gọi bạn<br /><em>là gì nhỉ?</em></h2>
    <p>Nhập tên của bạn để Hana đồng hành trong mỗi nhiệm vụ và ghi tên bạn lên thẻ kỷ niệm.</p>
    <label className="profile-name-field"><span>TÊN PHI HÀNH GIA</span><input value={name} maxLength={18} autoFocus placeholder="Ví dụ: Minh Anh" onChange={(event) => onNameChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && name.trim()) onContinue(); }} /></label>
    <button type="button" className="profile-continue" disabled={!name.trim()} onClick={onContinue}>Cùng Hana bắt đầu <Rocket size={18} /></button>
  </section>;
}

function ActivityMenu({ onBack, onGuide, onChoose }: { onBack: () => void; onGuide: () => void; onChoose: (activity: ActivityId) => void }) {
  const activities: Array<{ id: ActivityId; eyebrow: string; detail: string; tone: string; symbol: string }> = [
    { id: "add", eyebrow: "PHÉP TÍNH CỘNG", detail: "Gộp các nhóm và tìm tổng.", tone: "add", symbol: "+" },
    { id: "subtract", eyebrow: "PHÉP TÍNH TRỪ", detail: "Tìm phần còn lại.", tone: "subtract", symbol: "−" },
    { id: "tables", eyebrow: "BẢNG NHÂN VÀ CHIA", detail: "Chọn từng bảng hoặc luyện cả nhân và chia.", tone: "tables", symbol: "×÷" },
    { id: "multiply", eyebrow: "PHÉP TÍNH NHÂN", detail: "Xếp những nhóm bằng nhau.", tone: "multiply", symbol: "×" },
    { id: "divide", eyebrow: "PHÉP TÍNH CHIA", detail: "Chia đều các nhóm số.", tone: "divide", symbol: "÷" },
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

function PracticeFormatScreen({ operation, playerName, onBack, onStart }: { operation: Operation; playerName: string; onBack: () => void; onStart: (format: PracticeFormat) => void }) {
  const activity = activityMeta[operation];
  const options: Array<{ format: PracticeFormat; symbol: string; description: string }> = [
    { format: "standard", symbol: "✓", description: "Tính kết quả của phép tính." },
    { format: "missing", symbol: "?", description: "Tìm số còn thiếu trong phép tính." },
    { format: "mixed", symbol: "↻", description: "Luyện xen kẽ cả hai dạng bài." },
  ];
  return <section className="format-screen" aria-label="Chọn dạng bài">
    <button type="button" className="format-back" onClick={onBack}>← Trở về chọn hoạt động</button>
    <div className="format-brand mini-brand" aria-label="Phi Hành Tinh Phép Tính"><span className="mini-brand-rocket"><Rocket size={17} fill="currentColor" /></span><span>Phi Hành Tinh<br />Phép Tính</span></div>
    <div className="format-orbit" aria-hidden="true" />
    <div className="format-hana"><div className="robot-fallback"><span /><span /><i /></div></div>
    <p className="format-kicker">ROBOT HANA SẴN SÀNG</p>
    <h2>{activity.label}<br /><em>Bạn muốn học thế nào?</em></h2>
    <p className="format-intro">{playerName}, hãy chọn một dạng bài trước khi Hana khởi động lượt học của bạn.</p>
    <div className="format-option-grid">
      {options.map((option, index) => <button key={option.format} type="button" className={index === 0 ? "format-option is-recommended" : "format-option"} onClick={() => onStart(option.format)}>
        <b>{option.symbol}</b><strong>{practiceFormatMeta[option.format].label}</strong><small>{option.description}</small><span className="format-go">Bắt đầu <ChevronRight size={16} /></span>
      </button>)}
    </div>
    <p className="format-note">Hãy chọn dạng bài phù hợp để Hana bắt đầu lượt học nhé.</p>
  </section>;
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
  const isSummaryDemo = demoParams.has("summary");
  const isProfileDemo = demoParams.has("profile");
  const isScoreDemo = demoParams.has("score");
  const isGuideDemo = demoParams.has("guide");
  const isMaxRewardDemo = demoParams.has("maxrewards");
  const missingDemoOperation = demoParams.get("missing");
  const formatDemoOperation = demoParams.get("format");
  const isMissingDemo = missingDemoOperation === "add" || missingDemoOperation === "subtract" || missingDemoOperation === "multiply" || missingDemoOperation === "divide";
  const isFormatDemo = formatDemoOperation === "add" || formatDemoOperation === "subtract" || formatDemoOperation === "multiply" || formatDemoOperation === "divide";
  const tableDemoKind: TablePracticeKind = demoParams.get("tables") === "divide" ? "divide" : demoParams.get("tables") === "mixed" ? "mixed" : "multiply";
  const initialOperation: Operation = isMissingDemo
    ? missingDemoOperation
    : isFormatDemo
    ? formatDemoOperation
    : isDemo || isTableDemo
    ? (tableDemoKind === "divide" ? "divide" : "multiply")
    : "add";

  const [screen, setScreen] = useState<AppScreen>(isSummaryDemo || isMaxRewardDemo ? "summary" : isProfileDemo ? "profile" : isFormatDemo ? "format" : isScoreDemo || isDemo || isTableDemo || isMissingDemo ? "game" : isMenuPreview ? "menu" : "welcome");
  const [mode, setMode] = useState<ExerciseMode>(isTableDemo ? "tables" : "practice");
  const [selectedActivity, setSelectedActivity] = useState<ActivityId>(isTableDemo ? "tables" : isMissingDemo || isFormatDemo ? initialOperation : isDemo ? "multiply" : "add");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [practiceFormat, setPracticeFormat] = useState<PracticeFormat>("standard");
  const [operation, setOperation] = useState<Operation>(initialOperation);
  const [question, setQuestion] = useState<QuizQuestion>(() => isTableDemo
    ? generateTableQuestion({ kind: tableDemoKind, tables: [2, 4, 6] })
    : isMissingDemo
    ? generateMissingComponentQuestion(initialOperation, "easy")
    : generateQuestion(initialOperation, "easy"));
  const recentQuestionExpressionsRef = useRef<string[]>([question.expression]);
  const [tableKind, setTableKind] = useState<TablePracticeKind>(tableDemoKind);
  const [selectedTables, setSelectedTables] = useState<number[]>(isTableDemo ? [2, 4, 6] : [2]);
  const [answered, setAnswered] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [testStep, setTestStep] = useState(0);
  const [testCorrect, setTestCorrect] = useState(0);
  const [testComplete, setTestComplete] = useState(false);
  const [showGuide, setShowGuide] = useState(isGuideDemo);
  const [showScorePanel, setShowScorePanel] = useState(isScoreDemo);
  const [playerName, setPlayerName] = useState(isSummaryDemo || isProfileDemo || isScoreDemo || isMaxRewardDemo ? "Minh Anh" : "");
  const [sessionPoints, setSessionPoints] = useState(isMaxRewardDemo ? 1000 : isSummaryDemo || isScoreDemo ? 100 : 0);
  const [correctCount, setCorrectCount] = useState(isMaxRewardDemo ? 100 : isSummaryDemo || isScoreDemo ? 10 : 0);
  const [wrongCount, setWrongCount] = useState(isMaxRewardDemo ? 5 : isSummaryDemo || isScoreDemo ? 2 : 0);
  const [elapsedSeconds, setElapsedSeconds] = useState(isMaxRewardDemo ? 721 : isSummaryDemo || isScoreDemo ? 93 : 0);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const displayName = playerName.trim() || "Phi hành gia nhỏ";

  const generatePracticeQuestion = useCallback(
    (nextOperation: Operation, nextDifficulty: Difficulty, nextFormat = practiceFormat) => {
      const shouldFindComponent = nextFormat === "missing" || (nextFormat === "mixed" && Math.random() < 0.5);
      return shouldFindComponent
        ? generateMissingComponentQuestion(nextOperation, nextDifficulty)
        : generateQuestion(nextOperation, nextDifficulty);
    },
    [practiceFormat],
  );

  const freshQuestion = useCallback((buildQuestion: () => QuizQuestion) => {
    let candidate = buildQuestion();
    let attempts = 0;
    while (recentQuestionExpressionsRef.current.includes(candidate.expression) && attempts < 20) {
      candidate = buildQuestion();
      attempts += 1;
    }
    recentQuestionExpressionsRef.current = [...recentQuestionExpressionsRef.current, candidate.expression].slice(-5);
    return candidate;
  }, []);

  const createNextQuestion = useCallback(
    (nextMode = mode, nextOperation = operation, nextDifficulty = difficulty) => {
      if (nextMode === "tables") {
        if (selectedTables.length === 0) {
          setAnswered(null);
          setFeedback("idle");
          return;
        }
        const tableQuestion = freshQuestion(() => generateTableQuestion({ kind: tableKind, tables: selectedTables }));
        setOperation(tableQuestion.operation);
        setQuestion(tableQuestion);
        setAnswered(null);
        setFeedback("idle");
        handleRef.current?.setActivePlanet(tableQuestion.operation);
        return;
      }
      const operationForQuestion = nextMode === "test" ? pickTestOperation() : nextOperation;
      setOperation(operationForQuestion);
      setQuestion(freshQuestion(() => generatePracticeQuestion(operationForQuestion, nextDifficulty)));
      setAnswered(null);
      setFeedback("idle");
      handleRef.current?.setActivePlanet(operationForQuestion);
    },
    [difficulty, freshQuestion, generatePracticeQuestion, mode, operation, selectedTables, tableKind],
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
    setQuestion(freshQuestion(() => generatePracticeQuestion(nextOperation, difficulty)));
    setAnswered(null);
    setFeedback("idle");
    handleRef.current?.setActivePlanet(nextOperation);
  };

  const selectDifficulty = (nextDifficulty: Difficulty) => {
    setDifficulty(nextDifficulty);
    setTestComplete(false);
    setTestStep(0);
    setTestCorrect(0);
    setQuestion(freshQuestion(() => generatePracticeQuestion(operation, nextDifficulty)));
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
    const tableQuestion = freshQuestion(() => generateTableQuestion({ kind: nextKind, tables: nextTables }));
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
    if (nextActivity === "add" || nextActivity === "subtract" || nextActivity === "multiply" || nextActivity === "divide") {
      setSelectedActivity(nextActivity);
      setOperation(nextActivity);
      setMode("practice");
      setPracticeFormat("standard");
      handleRef.current?.setActivePlanet(nextActivity);
      setScreen("format");
      return;
    }
    setAnswered(null);
    setFeedback("idle");
    setTestComplete(false);
    setTestStep(0);
    setTestCorrect(0);
    if (sessionStartedAt === null) {
      recentQuestionExpressionsRef.current = [];
      setSessionPoints(0);
      setCorrectCount(0);
      setWrongCount(0);
      setElapsedSeconds(0);
      setSessionStartedAt(Date.now());
    }
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

  const beginPractice = (nextFormat: PracticeFormat) => {
    setAnswered(null);
    setFeedback("idle");
    setTestComplete(false);
    setTestStep(0);
    setTestCorrect(0);
    if (sessionStartedAt === null) {
      recentQuestionExpressionsRef.current = [];
      setSessionPoints(0);
      setCorrectCount(0);
      setWrongCount(0);
      setElapsedSeconds(0);
      setSessionStartedAt(Date.now());
    }
    setMode("practice");
    setPracticeFormat(nextFormat);
    setQuestion(freshQuestion(() => generatePracticeQuestion(operation, difficulty, nextFormat)));
    handleRef.current?.setActivePlanet(operation);
    setScreen("game");
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
        setCorrectCount((current) => current + 1);
        setSessionPoints((current) => current + 10);
        if (mode === "test") setTestCorrect((current) => current + 1);
      } else {
        setFeedback("wrong");
        setWrongCount((current) => current + 1);
        setSessionPoints((current) => Math.max(0, current - 2));
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
      if (screen !== "game" || showScorePanel) return;
      const numeric = Number(event.key);
      if (numeric >= 1 && numeric <= 4) {
        const option = question.options[numeric - 1];
        if (option !== undefined) answerQuestion(option);
      }
      if (event.key === "Enter" && feedback !== "idle") continueMission();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answerQuestion, feedback, question.options, screen, showScorePanel]);

  useEffect(() => {
    if (screen !== "game" || sessionStartedAt === null) return;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - sessionStartedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [screen, sessionStartedAt]);

  const currentDuration = () => sessionStartedAt === null
    ? elapsedSeconds
    : Math.max(elapsedSeconds, Math.floor((Date.now() - sessionStartedAt) / 1000));

  const finishSession = () => {
    setElapsedSeconds(currentDuration());
    setScreen("summary");
  };

  const earnedRewards = rewardsForPoints(sessionPoints);
  const highestReward = earnedRewards.at(-1);
  const nextReward = sessionRewards.find((reward) => sessionPoints < reward.threshold);
  const pointsUntilReward = nextReward ? nextReward.threshold - sessionPoints : 0;

  const saveSessionImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 760;
    const context = canvas.getContext("2d");
    if (!context) return;
    const background = context.createLinearGradient(0, 0, 1200, 760);
    background.addColorStop(0, "#101b62");
    background.addColorStop(1, "#2b175e");
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255,255,255,0.08)";
    for (let index = 0; index < 34; index += 1) {
      context.beginPath();
      context.arc((index * 89) % 1180 + 12, (index * 53) % 600 + 18, index % 3 === 0 ? 4 : 2, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = "#fdf7e5";
    context.font = "800 64px Baloo 2, sans-serif";
    context.fillText("Phi Hành Tinh Phép Tính", 72, 112);
    context.fillStyle = "#7de4d1";
    context.font = "700 25px Be Vietnam Pro, sans-serif";
    context.fillText(`KỶ NIỆM LƯỢT HỌC CỦA ${displayName.toUpperCase()} CÙNG ROBOT HANA`, 76, 154);
    context.fillStyle = "#fff8df";
    context.roundRect(72, 208, 1056, 310, 32);
    context.fill();
    const stats = [["Điểm", `${sessionPoints}`], ["Đúng", `${correctCount}`], ["Sai", `${wrongCount}`], ["Thời gian", formatDuration(currentDuration())]];
    stats.forEach(([label, value], index) => {
      const x = 118 + index * 254;
      context.fillStyle = "#766f94";
      context.font = "700 23px Be Vietnam Pro, sans-serif";
      context.fillText(label, x, 290);
      context.fillStyle = "#292963";
      context.font = "800 64px Baloo 2, sans-serif";
      context.fillText(value, x, 365);
    });
    context.fillStyle = "#f3eee0";
    context.roundRect(72, 560, 1056, 126, 26);
    context.fill();
    context.fillStyle = "#5f5d89";
    context.font = "700 21px Be Vietnam Pro, sans-serif";
    context.fillText("QUÀ BẠN NHẬN ĐƯỢC", 108, 610);
    context.fillStyle = "#2b2e69";
    context.font = "800 30px Baloo 2, sans-serif";
    const rewardText = highestReward ? `${highestReward.symbol} Cấp ${highestReward.level}: ${highestReward.label}` : "Hãy trả lời đúng để nhận quà đầu tiên nhé!";
    context.fillText(rewardText, 108, 654);
    const link = document.createElement("a");
    link.download = `hanh-trinh-hana-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const isTableMode = mode === "tables";
  const hasSelectedTables = selectedTables.length > 0;
  const hasAllTables = selectedTables.length === TIMES_TABLES.length;
  const activeActivity = activityMeta[selectedActivity];

  return (
    <main className="game-shell">
      <canvas ref={canvasRef} className="game-canvas" aria-label="Không gian trò chơi toán học" />
      <div className="space-atmosphere" aria-hidden="true" />

      {screen === "welcome" && <WelcomeScreen onStart={() => setScreen("profile")} onGuide={() => setShowGuide(true)} />}
      {screen === "profile" && <PlayerProfileScreen name={playerName} onNameChange={setPlayerName} onBack={() => setScreen("welcome")} onContinue={() => setScreen("menu")} />}
      {screen === "menu" && <ActivityMenu onBack={() => setScreen("welcome")} onGuide={() => setShowGuide(true)} onChoose={startActivity} />}
      {screen === "format" && <PracticeFormatScreen operation={operation} playerName={displayName} onBack={() => setScreen("menu")} onStart={beginPractice} />}
      {screen === "summary" && <section className="summary-screen" aria-label="Tổng kết lượt chơi">
        <div className="summary-brand mini-brand" aria-label="Phi Hành Tinh Phép Tính"><span className="mini-brand-rocket"><Rocket size={17} fill="currentColor" /></span><span>Phi Hành Tinh<br />Phép Tính</span></div>
        <div className="summary-orbit" aria-hidden="true" />
        <div className="summary-stars" aria-hidden="true"><span>✦</span><span>★</span><span>✦</span></div>
        <div className="summary-robot"><div className="robot-fallback"><span /><span /><i /></div></div>
        <p className="summary-kicker">ROBOT HANA CHÚC MỪNG {displayName.toUpperCase()}</p>
        <h2>Lượt học của {displayName}<br /><em>thật đáng tự hào!</em></h2>
        <p className="summary-intro">{displayName}, dù đúng hay sai, bạn đã kiên trì hoàn thành một chuyến luyện cùng Hana.</p>
        <p className="summary-hana-line">Hana đã cất các huy hiệu của {displayName} vào khoang phi thuyền!</p>
        <div className="summary-stats">
          <div><span>Điểm</span><strong>{sessionPoints}</strong></div>
          <div><span>Đúng</span><strong>{correctCount}</strong></div>
          <div><span>Sai</span><strong>{wrongCount}</strong></div>
          <div><span>Thời gian</span><strong>{formatDuration(elapsedSeconds)}</strong></div>
        </div>
        <section className="reward-board highest-reward-board" aria-label="Phần thưởng cao nhất trong lượt chơi">
          <div className="reward-board-heading"><span>PHẦN THƯỞNG CAO NHẤT</span><strong>{earnedRewards.length ? `Cấp ${highestReward?.level}/${sessionRewards.length}` : "Chưa mở"}</strong></div>
          {highestReward ? <div className="highest-reward"><b>{highestReward.symbol}</b><span><small>HANA CHÚC MỪNG {displayName.toUpperCase()}</small><strong>{highestReward.label}</strong><em>{highestReward.detail}</em></span></div> : <p className="reward-empty">{displayName}, bạn hãy trả lời đúng để mở phần thưởng đầu tiên nhé.</p>}
        </section>
        <div className="summary-actions">
          <button type="button" className="save-memory" onClick={saveSessionImage}>Lưu ảnh kỷ niệm <Sparkles size={18} /></button>
          <button type="button" className="summary-again" onClick={() => { setSessionStartedAt(null); setScreen("menu"); }}>Chơi lượt mới <Rocket size={18} /></button>
        </div>
      </section>}

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
            <p className="eyebrow">PHI HÀNH GIA: {displayName.toUpperCase()}</p>
            <h1>Phi Hành Tinh<br />Phép Tính</h1>
          </div>
        </div>
        <div className="mission-actions">
          <button className="mission-menu-button" type="button" onClick={() => setScreen("menu")}><span>↔</span> Đổi nhiệm vụ</button>
          <button className="mission-menu-button mission-end-button" type="button" onClick={finishSession}><span>■</span> Kết thúc lượt</button>
        </div>
        <button className="reward-progress" type="button" onClick={() => setShowScorePanel(true)} aria-label="Xem điểm hiện tại và tiến độ nhận quà">
          <span className="reward-progress-icon">{nextReward?.symbol ?? "♛"}</span>
          <span><small>ĐIỂM HIỆN TẠI</small><strong>{sessionPoints}</strong><em>{nextReward ? `Còn ${pointsUntilReward} điểm nhận ${nextReward.label}` : "Đã mở đủ phần thưởng!"}</em></span>
        </button>
      </header>

      <section className="mission-copy" aria-live="polite">
        <div className="mission-kicker"><Rocket size={15} /> {activeActivity.kicker}</div>
        <h2>{activeActivity.label}</h2>
        <p>{activeActivity.description}</p>
      </section>

      <div className={`mission-orbit-map operation-${operation}`} aria-hidden="true">
        <span className="mission-orbit-ring ring-one" />
        <span className="mission-orbit-ring ring-two" />
        <span className="mission-orbit-node add">+</span>
        <span className="mission-orbit-node subtract">−</span>
        <span className="mission-orbit-node multiply">×</span>
        <span className="mission-orbit-node divide">÷</span>
        <span className="mission-orbit-status">HÀNH TINH {activityMeta[operation].label.toUpperCase()}</span>
      </div>

      <aside className="robot-guide" aria-label="Robot Hana hướng dẫn">
        <div className="robot-fallback" aria-hidden="true"><span /><span /><i /></div>
        <div className="robot-note"><span className="robot-note-dot" />Robot Hana: “{displayName}, bạn làm được mà!”</div>
      </aside>

      <section className="mission-control" aria-label="Bảng điều khiển bài tập">
        <div className="console-topline">
          <div className="mascot-wrap">
            <span className="speech-spark"><Sparkles size={14} /></span>
          </div>
          <div className="console-title">
            <p>{activeActivity.label} <span>•</span> {isTableMode ? tableKindMeta[tableKind].subtitle : mode === "test" ? "8 câu thử thách" : practiceFormatMeta[practiceFormat].shortLabel}</p>
            <h3>{testComplete ? "Hoàn thành kiểm tra!" : isTableMode && !hasSelectedTables ? "Hãy chọn ít nhất một bảng để bắt đầu." : question.mission}</h3>
          </div>
          <div className="mission-counter">
            <span>{mode === "test" ? "Câu" : "Điểm hiện tại"}</span>
            <strong>{mode === "test" ? (testComplete ? "8/8" : `${Math.min(testStep + 1, 8)}/8`) : sessionPoints}</strong>
          </div>
        </div>

        {testComplete ? (
          <div className="completion-card">
            <div className="completion-icon"><Trophy size={30} /></div>
            <div>
              <p>Bạn đã hoàn thành 8 nhiệm vụ!</p>
              <h3>{testCorrect}/8 câu đúng · {testCorrect >= 6 ? "Bay thật giỏi!" : "Cố gắng rất đáng khen!"}</h3>
            </div>
            <button type="button" className="primary-action" onClick={finishSession}>
              Xem tổng kết <ChevronRight size={18} />
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
              <p className="math-helper">{question.kind === "missing" ? "Tìm số còn thiếu để hoàn thành phép tính." : "Chọn đáp án đúng để nhận điểm thưởng."}</p>
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
                {feedback === "correct" ? <div><Check size={18} /><span>Đúng rồi, {displayName}! +10 điểm. {nextReward ? `Còn ${pointsUntilReward} điểm để nhận ${nextReward.label}.` : "Bạn đã mở đủ phần thưởng!"}</span></div> : <div className="hana-hint">
                  <div className="hana-hint-robot" aria-label="Robot Hana đang gợi ý"><span /><span /><i /></div>
                  <div className="hana-hint-copy"><strong>Robot Hana gợi ý cho {displayName}:</strong><span>Chưa sao đâu, lượt này giảm 2 điểm. {question.hint}</span><ol>{question.hintSteps.map((step) => <li key={step}>{step}</li>)}</ol></div>
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
                <p>Nhập tên, chọn nhiệm vụ và cùng Hana tích điểm để mở khóa thật nhiều phần thưởng nhé.</p>
              </div>
            </div>
            <ol className="curriculum-list">
              <li><span>01</span><div><strong>Đặt tên phi hành gia</strong><p>Hana sẽ gọi tên bạn trong nhiệm vụ, lúc gợi ý và trên thẻ kỷ niệm cuối lượt.</p></div></li>
              <li><span>02</span><div><strong>Chọn nhiệm vụ và dạng bài</strong><p>Bạn chọn Cộng, Trừ, Học Bảng Nhân và Chia, Nhân, Chia hoặc Bài kiểm tra; với bốn phép tính, hãy chọn dạng bài trước khi chơi.</p></div></li>
              <li><span>03</span><div><strong>Tích điểm, mở 100 phần thưởng</strong><p>Mỗi câu đúng được +10 điểm. Nếu chưa đúng, bạn trừ 2 điểm nhưng điểm không âm. Cứ đủ 10 điểm, bạn mở một phần thưởng mới, từ Thẻ Khởi Động đến Cúp Thuyền Trưởng Hana ở mốc 1.000 điểm.</p></div></li>
              <li><span>04</span><div><strong>Hana luôn gợi ý</strong><p>Mỗi câu có bốn đáp án. Nếu bạn cần thêm thời gian, Hana sẽ gợi ý từng bước để bạn thử lại.</p></div></li>
              <li><span>05</span><div><strong>Xem điểm hoặc đổi nhiệm vụ</strong><p>Bấm Điểm hiện tại để xem tiến độ rồi quay lại chơi tiếp. Bạn cũng có thể Đổi nhiệm vụ mà vẫn giữ điểm, hoặc Kết thúc lượt khi đã sẵn sàng.</p></div></li>
            </ol>
            <p className="guide-note">Mỗi lượt học là hành trình của riêng bạn; hãy bình tĩnh suy nghĩ, thử lại và sưu tập từng phần thưởng nhé.</p>
            <button type="button" className="primary-action" onClick={() => setShowGuide(false)}>Mình đã hiểu <Rocket size={18} /></button>
          </section>
        </div>
      )}

      {showScorePanel && (
        <div className="guide-backdrop score-backdrop" role="dialog" aria-modal="true" aria-label="Điểm hiện tại và tiến độ phần thưởng">
          <section className="score-card">
            <button className="guide-close" type="button" onClick={() => setShowScorePanel(false)} aria-label="Đóng bảng điểm"><X size={19} /></button>
            <div className="score-card-heading">
              <span className="score-card-symbol">{nextReward?.symbol ?? "♛"}</span>
              <div><p className="eyebrow">TIẾN ĐỘ CỦA {displayName.toUpperCase()}</p><h2>Điểm hiện tại</h2><p>{nextReward ? `Còn ${pointsUntilReward} điểm để mở ${nextReward.label}.` : "Bạn đã mở trọn bộ 30 phần thưởng rồi!"}</p></div>
            </div>
            <div className="score-stats">
              <div><span>Điểm</span><strong>{sessionPoints}</strong></div>
              <div><span>Đúng</span><strong>{correctCount}</strong></div>
              <div><span>Sai</span><strong>{wrongCount}</strong></div>
              <div><span>Thời gian</span><strong>{formatDuration(currentDuration())}</strong></div>
            </div>
            <section className="score-reward-board" aria-label="Phần thưởng đã mở">
              <div><span>PHẦN THƯỞNG GẦN NHẤT</span><strong>{earnedRewards.length}/{sessionRewards.length}</strong></div>
              {earnedRewards.length ? <div className="score-reward-list">{earnedRewards.slice(-6).map((reward) => <span key={reward.id}><b>{reward.symbol}</b><em>Cấp {reward.level}</em><small>{reward.label}</small></span>)}</div> : <p>Hãy trả lời đúng để mở phần thưởng đầu tiên nhé.</p>}
            </section>
            <button type="button" className="primary-action score-continue" onClick={() => setShowScorePanel(false)}>Quay lại chơi tiếp <Rocket size={18} /></button>
          </section>
        </div>
      )}
    </main>
  );
}
