/**
 * Design philosophy: a bright mission-control console over a calm indigo space
 * map. Visual excitement always supports clear Grade 3 mathematics, never hides it.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import {
  Check,
  ChevronRight,
  Compass,
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

const planetMeta: Record<Operation, { label: string; subtitle: string; icon: string; color: string }> = {
  add: { label: "Hành tinh Cộng", subtitle: "Gộp năng lượng", icon: "+", color: "#FF8E67" },
  subtract: { label: "Hành tinh Trừ", subtitle: "Tìm phần còn lại", icon: "−", color: "#AFA2E9" },
  multiply: { label: "Hành tinh Nhân", subtitle: "Xếp nhóm bằng nhau", icon: "×", color: "#63D8BF" },
  divide: { label: "Hành tinh Chia", subtitle: "Chia đều tinh thể", icon: "÷", color: "#F3CD61" },
};

const mapStops: Array<{ operation: Operation; crystal: string }> = [
  { operation: "add", crystal: "diamond" },
  { operation: "subtract", crystal: "hex" },
  { operation: "multiply", crystal: "star" },
  { operation: "divide", crystal: "drop" },
];

const difficultyMeta: Record<Difficulty, { label: string; detail: string }> = {
  easy: { label: "Làm quen", detail: "Tính nhẩm nhẹ nhàng" },
  medium: { label: "Tự tin", detail: "Tính theo cột và bảng nhân" },
  challenge: { label: "Thám hiểm", detail: "Nhiệm vụ lớn hơn" },
};

const modeMeta: Record<ExerciseMode, string> = {
  journey: "Ôn theo hành trình",
  practice: "Luyện từng phép",
  tables: "Bảng cửu chương",
  test: "Bài kiểm tra 8 câu",
};

const tableKindMeta: Record<TablePracticeKind, { label: string; subtitle: string; accent: string }> = {
  multiply: { label: "Bảng nhân", subtitle: "Nhân theo từng bảng", accent: "#54cbb4" },
  divide: { label: "Bảng chia", subtitle: "Chia theo từng bảng", accent: "#f3c85e" },
  mixed: { label: "Hỗn hợp", subtitle: "Nhân và chia xen kẽ", accent: "#ff7b5a" },
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
  const tableDemoKind: TablePracticeKind = demoParams.get("tables") === "divide" ? "divide" : demoParams.get("tables") === "mixed" ? "mixed" : "multiply";
  const initialOperation: Operation = isDemo || isTableDemo
    ? (tableDemoKind === "divide" ? "divide" : "multiply")
    : "add";

  const [mode, setMode] = useState<ExerciseMode>(isTableDemo ? "tables" : "journey");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [operation, setOperation] = useState<Operation>(initialOperation);
  const [question, setQuestion] = useState<QuizQuestion>(() => isTableDemo
    ? generateTableQuestion({ kind: tableDemoKind, tables: [2, 4, 6] })
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

  const toggleTable = (table: number) => {
    const nextTables = selectedTables.includes(table)
      ? (selectedTables.length === 1 ? selectedTables : selectedTables.filter((item) => item !== table))
      : [...selectedTables, table].sort((a, b) => a - b);
    setTablePractice(tableKind, nextTables);
  };

  const answerQuestion = useCallback(
    (choice: number) => {
      if (answered !== null || testComplete) return;
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
    [answered, mode, question.answer, testComplete],
  );

  const continueMission = () => {
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
      const numeric = Number(event.key);
      if (numeric >= 1 && numeric <= 4) {
        const option = question.options[numeric - 1];
        if (option !== undefined) answerQuestion(option);
      }
      if (event.key === "Enter" && feedback !== "idle") continueMission();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answerQuestion, feedback, question.options]);

  const activePlanet = planetMeta[operation];
  const missionCount = mode === "test" ? `${Math.min(testStep + 1, 8)}/8` : `${energy}/5`;
  const isTableMode = mode === "tables";

  return (
    <main className="game-shell">
      <canvas ref={canvasRef} className="game-canvas" aria-label="Bản đồ bốn hành tinh phép tính" />
      <div className="space-atmosphere" aria-hidden="true" />

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
        <button className="star-bank" type="button" onClick={() => setShowGuide(true)} aria-label="Xem thông tin tiến độ">
          <span className="star-icon"><Star size={20} fill="currentColor" /></span>
          <span><strong>{stars}</strong> sao</span>
          <HelpCircle size={16} />
        </button>
      </header>

      <section className="mission-copy" aria-live="polite">
        <div className="mission-kicker"><Rocket size={15} /> Chuyến bay đang mở</div>
        <h2>{activePlanet.label}</h2>
        <p>{activePlanet.subtitle}. Robot Mít đang chờ con nạp tinh thể!</p>
      </section>

      <div className="map-destinations" aria-label="Các điểm dừng trên quỹ đạo">
        <div className="route-beam" aria-hidden="true" />
        {mapStops.map((stop, index) => {
          const planet = planetMeta[stop.operation];
          const selected = stop.operation === operation;
          return (
            <button
              key={stop.operation}
              type="button"
              className={selected ? "destination-stop is-active" : "destination-stop"}
              style={{ "--stop-color": planet.color } as React.CSSProperties}
              onClick={() => selectOperation(stop.operation)}
              aria-label={`Đến ${planet.label}`}
            >
              <span className={`crystal-shape ${stop.crystal}`} aria-hidden="true" />
              <span className="destination-copy"><b>0{index + 1}</b>{planet.label.replace("Hành tinh ", "")}</span>
              <span className="destination-symbol">{planet.icon}</span>
            </button>
          );
        })}
      </div>

      <aside className="robot-guide" aria-label="Robot Mít hướng dẫn">
        <div className="robot-fallback" aria-hidden="true"><span /><span /><i /></div>
        <div className="robot-note"><span className="robot-note-dot" />Robot Mít: “Con làm được mà!”</div>
      </aside>

      <aside className="orbit-guide" aria-label="Bản đồ hành tinh">
        <div className="orbit-guide-heading"><Compass size={17} /> Bản đồ hành trình</div>
        <div className="planet-selector">
          {(Object.keys(planetMeta) as Operation[]).map((key, index) => (
            <button
              key={key}
              className={operation === key ? "planet-pill is-selected" : "planet-pill"}
              style={{ "--planet-color": planetMeta[key].color } as React.CSSProperties}
              type="button"
              onClick={() => selectOperation(key)}
            >
              <span className="planet-order">0{index + 1}</span>
              <span className={`planet-symbol ${key}`}><span className={`crystal-shape ${key === "add" ? "diamond" : key === "subtract" ? "hex" : key === "multiply" ? "star" : "drop"}`} />{planetMeta[key].icon}</span>
              <span>{planetMeta[key].label.replace("Hành tinh ", "")}</span>
            </button>
          ))}
        </div>
        <button type="button" className="route-link" onClick={() => setShowGuide(true)}>
          Xem lộ trình chuẩn lớp 3 <ChevronRight size={15} />
        </button>
      </aside>

      <section className="mission-control" aria-label="Bảng điều khiển bài tập">
        <div className="console-topline">
          <div className="mascot-wrap">
            <span className="speech-spark"><Sparkles size={14} /></span>
          </div>
          <div className="console-title">
            <p>{modeMeta[mode]} <span>•</span> {isTableMode ? tableKindMeta[tableKind].subtitle : difficultyMeta[difficulty].label}</p>
            <h3>{testComplete ? "Hoàn thành kiểm tra!" : question.mission}</h3>
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
                  <p>{selectedTables.length === 1 ? `Đang luyện bảng ${selectedTables[0]}` : `${selectedTables.length} bảng đã chọn`}</p>
                </div>
                <div className="table-kind-switch" aria-label="Chọn kiểu bảng cửu chương">
                  {(Object.keys(tableKindMeta) as TablePracticeKind[]).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      className={tableKind === kind ? "is-active" : ""}
                      style={{ "--table-accent": tableKindMeta[kind].accent } as React.CSSProperties}
                      onClick={() => setTablePractice(kind)}
                    >
                      {tableKindMeta[kind].label}
                    </button>
                  ))}
                </div>
                <div className="table-picker-head">
                  <span>Chọn một hoặc nhiều bảng</span>
                  <button type="button" onClick={() => setTablePractice(tableKind, [...TIMES_TABLES])}>Chọn cả 2–9</button>
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
                      <span>×</span>{table}
                    </button>
                  ))}
                </div>
              </section>
            )}
            <div className="question-panel">
              <span className="question-label">{isTableMode ? "NHIỆM VỤ CỬU CHƯƠNG" : "NHIỆM VỤ TOÁN HỌC"}</span>
              <p className="math-expression">{question.expression}</p>
              <p className="math-helper">Chọn đáp án đúng để gửi tinh thể vào động cơ.</p>
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
                <div>
                  {feedback === "correct" ? <Check size={18} /> : <HelpCircle size={18} />}
                  <span>{feedback === "correct" ? "Đúng rồi! Một tinh thể đã bay vào động cơ." : question.hint}</span>
                </div>
                <button type="button" onClick={continueMission}>
                  {feedback === "correct" ? (mode === "test" && testStep + 1 >= 8 ? "Xem kết quả" : "Nhiệm vụ tiếp") : "Thử lại"}
                  <ChevronRight size={17} />
                </button>
              </div>
            )}
          </>
        )}

        <div className="control-row">
          <div className="mode-switch" aria-label="Chọn chế độ">
            {(Object.keys(modeMeta) as ExerciseMode[]).map((key) => (
              <button key={key} type="button" className={mode === key ? "is-active" : ""} onClick={() => selectMode(key)}>{modeMeta[key]}</button>
            ))}
          </div>
          {!isTableMode && <div className="level-switch" aria-label="Chọn cấp độ">
            {(Object.keys(difficultyMeta) as Difficulty[]).map((key) => (
              <button key={key} type="button" className={difficulty === key ? "is-active" : ""} onClick={() => selectDifficulty(key)}>{difficultyMeta[key].label}</button>
            ))}
          </div>}
        </div>
      </section>

      {showGuide && (
        <div className="guide-backdrop" role="dialog" aria-modal="true" aria-label="Lộ trình chuẩn lớp 3">
          <section className="guide-card">
            <button className="guide-close" type="button" onClick={() => setShowGuide(false)} aria-label="Đóng lộ trình"><X size={19} /></button>
            <div className="guide-heading">
              <img src={ASSETS.planets} alt="Bốn hành tinh phép tính" />
              <div>
                <p className="eyebrow">ÔN THEO HÀNH TRÌNH</p>
                <h2>Lộ trình chuẩn lớp 3</h2>
                <p>Bốn điểm dừng giúp con luyện dần từ tính nhẩm đến bài toán một bước.</p>
              </div>
            </div>
            <ol className="curriculum-list">
              <li><span>01</span><div><strong>Cộng và trừ số tự nhiên</strong><p>Tính nhẩm, đặt tính theo cột, tìm số còn lại trong phạm vi phù hợp.</p></div></li>
              <li><span>02</span><div><strong>Bảng nhân và bảng chia</strong><p>Nhớ các phép nhân, chia cơ bản bằng hoạt động chia nhóm tinh thể.</p></div></li>
              <li><span>03</span><div><strong>Nhân, chia với số một chữ số</strong><p>Tăng dần độ khó với các phép tính có nhiều chữ số nhưng kết quả luôn rõ ràng.</p></div></li>
              <li><span>04</span><div><strong>Bài toán một bước</strong><p>Vận dụng phép tính để hoàn thành nhiệm vụ ngắn trong từng chuyến bay.</p></div></li>
            </ol>
            <p className="guide-note">Nội dung theo mạch Số và phép tính của Chương trình GDPT 2018 lớp 3; có thể dùng cùng các bộ sách giáo khoa hiện hành.</p>
            <button type="button" className="primary-action" onClick={() => setShowGuide(false)}>Bắt đầu chuyến bay <Rocket size={18} /></button>
          </section>
        </div>
      )}
    </main>
  );
}
