/**
 * Design philosophy: a bright mission-control console over a calm indigo space
 * map. Visual excitement always supports clear Grade 3 mathematics, never hides it.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Engine } from "@babylonjs/core/Engines/engine";
import "./english-polish.css";
import "./test-flow.css";
import "./graphic-polish.css";
import "./collectibles.css";
import {
  Check,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  Gem,
  HelpCircle,
  Languages,
  Rocket,
  Settings,
  Sparkles,
  Star,
  SlidersHorizontal,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { GameHandle } from "@/game/scene";
import {
  getStoredEffectsVolume,
  getStoredMusicVolume,
  getStoredSoundPreference,
  HanaAudio,
  type SoundEffect,
} from "@/game/audio";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  generateQuestion,
  generateMissingComponentQuestion,
  generateTableQuestion,
  isQuestionConsistent,
  TIMES_TABLES,
  type Difficulty,
  type ExerciseMode,
  type Operation,
  type QuizQuestion,
  type TablePracticeKind,
} from "@/game/quiz";
import {
  formatDuration,
  practiceFormatMeta,
  rewardsForPoints,
  sessionRewards,
  type PracticeFormat,
} from "@/game/session";

type AppScreen =
  | "welcome"
  | "profile"
  | "menu"
  | "activities"
  | "format"
  | "testsetup"
  | "game"
  | "summary";
type ActivityId =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "tables"
  | "test";
type Language = "vi" | "en";
type TestDurationSeconds = 120 | 300 | 600;
type AvatarId = "minh-khoa" | "ngoc-anh" | "gia-huy" | "linh-chi";

type ThemeBadge = {
  id: string;
  symbol: string;
  threshold: number;
  accent: "coral" | "lavender" | "mint" | "gold";
  vi: { label: string; detail: string };
  en: { label: string; detail: string };
};
type PlanetUnlock = { operation: Operation; badge: ThemeBadge };

const SESSION_DRAFT_KEY = "hana-active-session-v1";
const AVATAR_STORAGE_KEY = "hana-player-avatar-v2";
const LEGACY_AVATAR_STORAGE_KEY = "hana-astronaut-avatar-v1";
const THEME_BADGE_STORAGE_KEY = "hana-theme-badges-v1";
const DRAFT_SCREENS = [
  "menu",
  "activities",
  "format",
  "testsetup",
  "game",
] as const;
const DRAFT_ACTIVITY_IDS = [
  "add",
  "subtract",
  "multiply",
  "divide",
  "tables",
  "test",
] as const;
const DRAFT_EXERCISE_MODES = ["practice", "tables", "test"] as const;
const DRAFT_OPERATIONS = ["add", "subtract", "multiply", "divide"] as const;
const DRAFT_DIFFICULTIES = ["easy", "medium", "challenge"] as const;
const DRAFT_PRACTICE_FORMATS = ["standard", "missing", "mixed"] as const;
const DRAFT_TABLE_KINDS = ["multiply", "divide", "mixed"] as const;
const DRAFT_TEST_DURATIONS = [120, 300, 600] as const;
const LEGACY_AVATAR_IDS: Record<string, AvatarId> = {
  "minh-khoa": "minh-khoa",
  "ngoc-anh": "ngoc-anh",
  "gia-huy": "gia-huy",
  "linh-chi": "linh-chi",
  "earth-astronaut": "minh-khoa",
  mars: "ngoc-anh",
  jupiter: "gia-huy",
  saturn: "linh-chi",
  "sao-mai": "minh-khoa",
  "sao-bang": "ngoc-anh",
  "ngan-ha": "gia-huy",
  "hanh-tinh": "linh-chi",
};
const AVATAR_OPTIONS: Array<{
  id: AvatarId;
}> = [
  { id: "minh-khoa" },
  { id: "ngoc-anh" },
  { id: "gia-huy" },
  { id: "linh-chi" },
];

const PLAYER_AVATAR_STYLES: Record<
  AvatarId,
  { skin: string; hair: string; suit: string; accent: string; hairstyle: "short" | "pigtails" | "waves" | "bob" }
> = {
  "minh-khoa": { skin: "#f1b887", hair: "#20223b", suit: "#4c87cf", accent: "#a8f1dc", hairstyle: "short" },
  "ngoc-anh": { skin: "#f5c59b", hair: "#2d243d", suit: "#9d83d6", accent: "#ffb39c", hairstyle: "pigtails" },
  "gia-huy": { skin: "#c98e63", hair: "#362733", suit: "#55b7a5", accent: "#ffe27d", hairstyle: "waves" },
  "linh-chi": { skin: "#e6aa7e", hair: "#1f2739", suit: "#e87872", accent: "#cfc3ff", hairstyle: "bob" },
};

function PlayerAvatar({
  avatarId,
  className = "",
  decorative = false,
}: {
  avatarId: AvatarId;
  className?: string;
  decorative?: boolean;
}) {
  const style = PLAYER_AVATAR_STYLES[avatarId];
  const pigtails = style.hairstyle === "pigtails";
  const bob = style.hairstyle === "bob";
  const waves = style.hairstyle === "waves";
  return (
    <svg
      className={`player-avatar ${className}`}
      viewBox="0 0 120 120"
      aria-hidden={decorative}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Player avatar"}
    >
      <circle cx="60" cy="60" r="58" fill="#233875" />
      <circle cx="60" cy="60" r="51" fill={style.accent} opacity="0.9" />
      <path d="M20 120c4-30 21-43 40-43s36 13 40 43H20Z" fill={style.suit} />
      <path d="M42 83h36l6 37H36l6-37Z" fill="#f9f2dd" opacity="0.94" />
      {pigtails && <><circle cx="26" cy="51" r="16" fill={style.hair} /><circle cx="94" cy="51" r="16" fill={style.hair} /></>}
      {bob && <path d="M28 49c0-25 14-38 32-38s32 13 32 38v24H28V49Z" fill={style.hair} />}
      <circle cx="60" cy="54" r="29" fill={style.skin} />
      {waves ? <path d="M31 45c2-23 18-34 31-34 19 0 29 14 29 34-8-7-14-10-22-10-8 0-14 4-20 4-7 0-12-2-18 6Z" fill={style.hair} /> : !bob && <path d="M31 46c1-25 16-36 30-36 20 0 30 15 29 35-11-8-19-10-29-10-9 0-17 3-30 11Z" fill={style.hair} />}
      {pigtails && <path d="M32 44c5-22 19-34 30-34 17 0 27 13 27 34-10-8-18-10-28-10s-18 3-29 10Z" fill={style.hair} />}
      <circle cx="49" cy="55" r="3.6" fill="#202343" /><circle cx="71" cy="55" r="3.6" fill="#202343" />
      <path d="M49 68c6 6 16 6 22 0" fill="none" stroke="#a84f57" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="38" cy="65" r="4" fill="#e98c89" opacity="0.36" /><circle cx="82" cy="65" r="4" fill="#e98c89" opacity="0.36" />
      <circle cx="60" cy="96" r="7" fill={style.accent} /><path d="M57 96h6M60 93v6" stroke="#233875" strokeWidth="2" strokeLinecap="round" />
      <circle cx="99" cy="23" r="8" fill="#fff3a3" /><path d="M99 19v8M95 23h8" stroke="#d27a54" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
const THEME_BADGES: ThemeBadge[] = [
  { id: "level-20-pathfinder", symbol: "✦", threshold: 200, accent: "coral", vi: { label: "Người Mở Đường", detail: "Chinh phục Cấp 20 của hành trình 100 cấp." }, en: { label: "Pathfinder", detail: "Reach Level 20 in the 100-level journey." } },
  { id: "level-60-orbit-captain", symbol: "◌", threshold: 600, accent: "lavender", vi: { label: "Thuyền Trưởng Quỹ Đạo", detail: "Chinh phục Cấp 60 với sự kiên trì." }, en: { label: "Orbit Captain", detail: "Reach Level 60 with persistence." } },
  { id: "level-80-math-comet", symbol: "☄", threshold: 800, accent: "mint", vi: { label: "Sao Chổi Toán Học", detail: "Chinh phục Cấp 80 thật xuất sắc." }, en: { label: "Math Comet", detail: "Reach Level 80 with skill." } },
  { id: "level-100-hana-legend", symbol: "♛", threshold: 1000, accent: "gold", vi: { label: "Huyền Thoại Hana", detail: "Hoàn thành trọn vẹn Cấp 100 huy hoàng." }, en: { label: "Hana Legend", detail: "Complete the triumphant Level 100." } },
];
const UNLOCKED_PLANET_NAMES: Record<Operation, { vi: string; en: string }> = {
  add: { vi: "Hành Tinh Phép Cộng", en: "Addition Planet" },
  subtract: { vi: "Hành Tinh Phép Trừ", en: "Subtraction Planet" },
  multiply: { vi: "Hành Tinh Phép Nhân", en: "Multiplication Planet" },
  divide: { vi: "Hành Tinh Phép Chia", en: "Division Planet" },
};

type SessionDraft = {
  version: 1;
  screen: "menu" | "activities" | "format" | "testsetup" | "game";
  selectedActivity: ActivityId;
  mode: ExerciseMode;
  operation: Operation;
  difficulty: Difficulty;
  practiceFormat: PracticeFormat;
  tableKind: TablePracticeKind;
  selectedTables: number[];
  question: QuizQuestion;
  recentExpressions: string[];
  playerName: string;
  sessionPoints: number;
  correctCount: number;
  wrongCount: number;
  elapsedSeconds: number;
  testStep: number;
  testCorrect: number;
  testDurationSeconds?: TestDurationSeconds;
  testSecondsRemaining?: number;
  avatarId?: AvatarId;
};

function isFiniteWholeNumber(
  value: unknown,
  maximum = Number.MAX_SAFE_INTEGER
) {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= maximum
  );
}

function isOneOf<T extends readonly string[]>(
  value: unknown,
  options: T
): value is T[number] {
  return typeof value === "string" && options.includes(value as T[number]);
}

function normalizeAvatarId(value: unknown): AvatarId | null {
  if (typeof value !== "string") return null;
  if (AVATAR_OPTIONS.some(avatar => avatar.id === value)) {
    return value as AvatarId;
  }
  return LEGACY_AVATAR_IDS[value] ?? null;
}

function isAvatarId(value: unknown): value is AvatarId {
  return normalizeAvatarId(value) !== null;
}

function readAvatarPreference(): AvatarId {
  try {
    const stored =
      window.localStorage.getItem(AVATAR_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_AVATAR_STORAGE_KEY);
    return normalizeAvatarId(stored) ?? "minh-khoa";
  } catch {
    return "minh-khoa";
  }
}

function readThemeBadgeCollection(): string[] {
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(THEME_BADGE_STORAGE_KEY) ?? "[]"
    ) as unknown;
    return Array.isArray(stored)
      ? stored.filter(
          id =>
            typeof id === "string" &&
            THEME_BADGES.some(badge => badge.id === id)
        )
      : [];
  } catch {
    return [];
  }
}

function themeBadgesForSession(points: number) {
  return THEME_BADGES.filter(badge => points >= badge.threshold).map(
    badge => badge.id
  );
}

function isValidSessionDraft(
  value: Partial<SessionDraft>
): value is SessionDraft {
  const durationIsValid =
    value.testDurationSeconds === undefined ||
    (typeof value.testDurationSeconds === "number" &&
      DRAFT_TEST_DURATIONS.includes(value.testDurationSeconds));
  const remainingIsValid =
    value.testSecondsRemaining === undefined ||
    (isFiniteWholeNumber(
      value.testSecondsRemaining,
      value.testDurationSeconds ?? 600
    ) &&
      value.testSecondsRemaining <= (value.testDurationSeconds ?? 600));
  return (
    value.version === 1 &&
    isOneOf(value.screen, DRAFT_SCREENS) &&
    isOneOf(value.selectedActivity, DRAFT_ACTIVITY_IDS) &&
    isOneOf(value.mode, DRAFT_EXERCISE_MODES) &&
    isOneOf(value.operation, DRAFT_OPERATIONS) &&
    isOneOf(value.difficulty, DRAFT_DIFFICULTIES) &&
    isOneOf(value.practiceFormat, DRAFT_PRACTICE_FORMATS) &&
    isOneOf(value.tableKind, DRAFT_TABLE_KINDS) &&
    Array.isArray(value.selectedTables) &&
    value.selectedTables.every(
      table =>
        typeof table === "number" &&
        (TIMES_TABLES as readonly number[]).includes(table)
    ) &&
    Array.isArray(value.recentExpressions) &&
    value.recentExpressions.length <= 5 &&
    value.recentExpressions.every(
      expression => typeof expression === "string" && expression.length <= 80
    ) &&
    typeof value.playerName === "string" &&
    value.playerName.length <= 18 &&
    isFiniteWholeNumber(value.sessionPoints, 100000) &&
    isFiniteWholeNumber(value.correctCount, 10000) &&
    isFiniteWholeNumber(value.wrongCount, 10000) &&
    isFiniteWholeNumber(value.elapsedSeconds, 86400) &&
    isFiniteWholeNumber(value.testStep, 10000) &&
    isFiniteWholeNumber(value.testCorrect, 10000) &&
    durationIsValid &&
    remainingIsValid &&
    (value.avatarId === undefined || isAvatarId(value.avatarId)) &&
    Boolean(value.question) &&
    isQuestionConsistent(value.question as QuizQuestion)
  );
}

function readSessionDraft(): SessionDraft | null {
  try {
    const raw = window.localStorage.getItem(SESSION_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<SessionDraft>;
    if (!isValidSessionDraft(draft)) return null;
    return {
      ...draft,
      avatarId:
        draft.avatarId === undefined
          ? undefined
          : normalizeAvatarId(draft.avatarId) ?? "minh-khoa",
    } as SessionDraft;
  } catch {
    return null;
  }
}

function clearSessionDraft() {
  window.localStorage.removeItem(SESSION_DRAFT_KEY);
}

function SoundControl({
  enabled,
  language,
  onToggle,
  onSettingsOpen,
  musicVolume,
  effectsVolume,
  onMusicVolumeChange,
  onEffectsVolumeChange,
  defaultSettingsOpen = false,
}: {
  enabled: boolean;
  language: Language;
  onToggle: () => void;
  onSettingsOpen: () => void;
  musicVolume: number;
  effectsVolume: number;
  onMusicVolumeChange: (volume: number) => void;
  onEffectsVolumeChange: (volume: number) => void;
  defaultSettingsOpen?: boolean;
}) {
  const label =
    language === "en"
      ? enabled
        ? "Sound on"
        : "Sound off"
      : enabled
        ? "Âm thanh bật"
        : "Âm thanh tắt";
  return (
    <Popover defaultOpen={defaultSettingsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`sound-control ${enabled ? "is-on" : "is-off"}`}
          data-sound-control
          type="button"
          onClick={onSettingsOpen}
          aria-pressed={enabled}
          aria-label={
            language === "en" ? "Open sound settings" : "Mở cài đặt âm thanh"
          }
        >
          <span className="sound-glyph">
            {enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </span>
          <span className="sound-label">
            {language === "en" ? "Sound" : "Âm thanh"}
          </span>
          <span className="sound-settings-glyph">
            <SlidersHorizontal size={13} />
          </span>
          <small>
            {language === "en" ? "music & effects" : "nhạc & hiệu ứng"}
          </small>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={9}
        className="sound-settings-panel"
      >
        <div className="sound-settings-heading">
          <span>
            <SlidersHorizontal size={16} />{" "}
            {language === "en" ? "Sound settings" : "Cài đặt âm thanh"}
          </span>
          <small>
            {language === "en"
              ? "Choose a comfortable level"
              : "Chọn mức âm lượng dễ chịu"}
          </small>
        </div>
        <button
          className={`sound-master-toggle ${enabled ? "is-on" : "is-off"}`}
          data-sound-master-toggle
          type="button"
          onClick={onToggle}
          aria-pressed={enabled}
        >
          <span>{enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</span>
          <b>{label}</b>
          <small>
            {language === "en"
              ? "Tap to turn all sound on or off"
              : "Chạm để bật hoặc tắt toàn bộ âm thanh"}
          </small>
        </button>
        <label className="sound-slider-row">
          <span>
            <Volume2 size={15} />
            <b>{language === "en" ? "Background music" : "Nhạc nền"}</b>
            <em>{musicVolume}%</em>
          </span>
          <Slider
            className="sound-slider"
            value={[musicVolume]}
            min={0}
            max={100}
            step={1}
            aria-label={
              language === "en"
                ? "Background music volume"
                : "Âm lượng nhạc nền"
            }
            onValueChange={([value]) => onMusicVolumeChange(value ?? 0)}
          />
        </label>
        <label className="sound-slider-row">
          <span>
            <Sparkles size={15} />
            <b>{language === "en" ? "Sound effects" : "Hiệu ứng âm thanh"}</b>
            <em>{effectsVolume}%</em>
          </span>
          <Slider
            className="sound-slider"
            value={[effectsVolume]}
            min={0}
            max={100}
            step={1}
            aria-label={
              language === "en" ? "Sound effects volume" : "Âm lượng hiệu ứng"
            }
            onValueChange={([value]) => onEffectsVolumeChange(value ?? 0)}
          />
        </label>
      </PopoverContent>
    </Popover>
  );
}

function AppSettings({
  language,
  onLanguageToggle,
  onGuide,
  enabled,
  onSoundToggle,
  onSettingsOpen,
  musicVolume,
  effectsVolume,
  onMusicVolumeChange,
  onEffectsVolumeChange,
  defaultOpen = false,
}: {
  language: Language;
  onLanguageToggle: () => void;
  onGuide: () => void;
  enabled: boolean;
  onSoundToggle: () => void;
  onSettingsOpen: () => void;
  musicVolume: number;
  effectsVolume: number;
  onMusicVolumeChange: (volume: number) => void;
  onEffectsVolumeChange: (volume: number) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const closeThen = (action: () => void) => {
    setOpen(false);
    action();
  };
  const nextLanguage = language === "vi" ? "English" : "Tiếng Việt";
  const soundLabel =
    language === "en"
      ? enabled
        ? "Sound on"
        : "Sound off"
      : enabled
        ? "Âm thanh bật"
        : "Âm thanh tắt";

  return (
    <Popover
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen);
        if (nextOpen) onSettingsOpen();
      }}
    >
      <PopoverTrigger asChild>
        <button
          className="app-settings-trigger"
          type="button"
          aria-label={language === "en" ? "Open settings" : "Mở cài đặt"}
          aria-expanded={open}
        >
          <Settings size={20} strokeWidth={2.4} />
          <span>{language === "en" ? "Settings" : "Cài đặt"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="app-settings-panel"
      >
        <div className="app-settings-heading">
          <span>
            <Settings size={17} /> {language === "en" ? "Settings" : "Cài đặt"}
          </span>
          <small>
            {language === "en"
              ? "Make Hana's learning space feel right for you."
              : "Tùy chỉnh không gian học cùng Hana cho thật dễ chịu."}
          </small>
        </div>
        <button
          className="app-settings-row"
          type="button"
          onClick={() => closeThen(onLanguageToggle)}
        >
          <span className="app-settings-row-icon is-language">
            <Languages size={17} />
          </span>
          <span>
            <b>{language === "en" ? "Language" : "Ngôn ngữ"}</b>
            <small>{language === "en" ? "English" : "Tiếng Việt"}</small>
          </span>
          <em>{nextLanguage}</em>
        </button>
        <button
          className="app-settings-row"
          type="button"
          onClick={() => closeThen(onGuide)}
        >
          <span className="app-settings-row-icon is-guide">
            <HelpCircle size={17} />
          </span>
          <span>
            <b>{language === "en" ? "Guide" : "Hướng dẫn"}</b>
            <small>
              {language === "en" ? "How to play with Hana" : "Cách chơi cùng Hana"}
            </small>
          </span>
          <ChevronRight size={17} />
        </button>
        <div className="app-settings-sound" data-sound-control>
          <div className="app-settings-sound-title">
            {enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            <span>{language === "en" ? "Sound" : "Âm thanh"}</span>
          </div>
          <button
            className={`sound-master-toggle ${enabled ? "is-on" : "is-off"}`}
            data-sound-master-toggle
            type="button"
            onClick={onSoundToggle}
            aria-pressed={enabled}
          >
            <span>{enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</span>
            <b>{soundLabel}</b>
            <small>
              {language === "en"
                ? "Tap to turn all sound on or off"
                : "Chạm để bật hoặc tắt toàn bộ âm thanh"}
            </small>
          </button>
          <label className="sound-slider-row">
            <span>
              <Volume2 size={15} />
              <b>{language === "en" ? "Background music" : "Nhạc nền"}</b>
              <em>{musicVolume}%</em>
            </span>
            <Slider
              className="sound-slider"
              value={[musicVolume]}
              min={0}
              max={100}
              step={1}
              aria-label={
                language === "en" ? "Background music volume" : "Âm lượng nhạc nền"
              }
              onValueChange={([value]) => onMusicVolumeChange(value ?? 0)}
            />
          </label>
          <label className="sound-slider-row">
            <span>
              <Sparkles size={15} />
              <b>{language === "en" ? "Sound effects" : "Hiệu ứng âm thanh"}</b>
              <em>{effectsVolume}%</em>
            </span>
            <Slider
              className="sound-slider"
              value={[effectsVolume]}
              min={0}
              max={100}
              step={1}
              aria-label={
                language === "en" ? "Sound effects volume" : "Âm lượng hiệu ứng"
              }
              onValueChange={([value]) => onEffectsVolumeChange(value ?? 0)}
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const textOrigins = new WeakMap<Text, string>();
const englishText: Record<string, string> = {
  "Hướng dẫn": "Guide",
  "Bắt đầu": "Start",
  "Xem cách chơi": "How to play",
  "Cùng Hana": "Learn with Hana",
  "ôn toán học": "math together",
  Cộng: "Addition",
  Trừ: "Subtraction",
  Nhân: "Multiplication",
  Chia: "Division",
  "Trở về": "Back",
  "Chọn nhiệm vụ": "Choose a mission",
  "Bạn muốn chinh phục điều gì?": "What would you like to explore?",
  "Chạm vào một thẻ để bắt đầu nhé.": "Tap a card to begin.",
  "Chọn dạng bài": "Choose practice type",
  "Bạn muốn học thế nào?": "How would you like to learn?",
  "Bài bình thường": "Standard practice",
  "Tìm thành phần": "Find the missing number",
  "Cả hai": "Both types",
  "Đổi nhiệm vụ": "Change mission",
  "Kết thúc lượt": "End session",
  "Điểm hiện tại": "Current points",
  "ĐIỂM HIỆN TẠI": "CURRENT POINTS",
  "Bình thường": "Standard",
  "ROBOT HANA SẴN SÀNG": "ROBOT HANA IS READY",
  "ROBOT HANA CHỜ BẠN": "ROBOT HANA IS WAITING",
  Đúng: "Correct",
  Sai: "Incorrect",
  Điểm: "Points",
  "Thời gian": "Time",
  Câu: "Question",
  "Xem tổng kết": "View summary",
  "Nhiệm vụ tiếp": "Next mission",
  "Thử lại": "Try again",
  "Xem kết quả": "View results",
  "Chọn Tất Cả": "Select all",
  "Bỏ Chọn Tất Cả": "Clear all",
  "Bảng nhân": "Multiplication tables",
  "Bảng chia": "Division tables",
  "Cả nhân và chia": "Both multiplication & division",
  "Chọn một hoặc nhiều bảng": "Choose one or more tables",
  "Chọn bảng để luyện nhé": "Choose a table to practise",
  "Quay lại chơi tiếp": "Keep playing",
  "Lưu ảnh kỷ niệm": "Save souvenir image",
  "Chơi lượt mới": "Start a new session",
  "MỐC HÀNH TRÌNH CAO NHẤT": "HIGHEST JOURNEY LEVEL",
  "Chưa có điểm": "No points yet",
  "Mình đã hiểu": "Got it!",
  "Đang tạo ảnh...": "Creating image...",
  "Tên phi hành gia": "Astronaut name",
  "Cùng Hana bắt đầu": "Start with Hana",
  "Hana nên gọi bạn là gì nhỉ?": "What should Hana call you?",
  "Hana nên gọi bạn": "What should Hana call",
  "là gì nhỉ?": "you?",
  "Lượt học của": "Learning session for",
  "thật đáng tự hào!": "You should be proud!",
  "HANA CHÚC MỪNG": "HANA CONGRATULATES",
  "ROBOT HANA CHÚC MỪNG": "ROBOT HANA CONGRATULATES",
  "Chưa chọn bảng": "No table selected",
  "Đang luyện bảng": "Practising table",
  "bảng đã chọn": "tables selected",
  "8 câu thử thách": "8-question challenge",
  "Hoàn thành kiểm tra!": "Test complete!",
  "Bạn đã hoàn thành 8 nhiệm vụ!": "You completed 8 missions!",
  "Bay thật giỏi!": "You flew brilliantly!",
  "Cố gắng rất đáng khen!": "Great effort!",
  "TÌM THÀNH PHẦN CHƯA BIẾT": "FIND THE MISSING NUMBER",
  "NHIỆM VỤ TOÁN HỌC": "MATH MISSION",
  "NHIỆM VỤ BẢNG NHÂN VÀ CHIA": "TIMES-TABLE MISSION",
  "Tìm số còn thiếu để hoàn thành phép tính.":
    "Find the missing number to complete the equation.",
  "Chọn đáp án đúng để nhận điểm thưởng.":
    "Choose the correct answer to earn points.",
  "CHÀO MỪNG PHI HÀNH GIA NHỎ": "WELCOME, YOUNG ASTRONAUT",
  "Cùng Robot Hana chinh phục các hoạt động Cộng, Trừ, Nhân và Chia qua những nhiệm vụ thật vui.":
    "Join Robot Hana for fun addition, subtraction, multiplication and division missions.",
  "PHÉP TÍNH CỘNG": "ADDITION",
  "PHÉP TÍNH TRỪ": "SUBTRACTION",
  "PHÉP TÍNH NHÂN": "MULTIPLICATION",
  "PHÉP TÍNH CHIA": "DIVISION",
  "BẢNG NHÂN VÀ CHIA": "MULTIPLICATION & DIVISION TABLES",
  "8 CÂU THỬ THÁCH": "8-QUESTION CHALLENGE",
  "Gộp các nhóm số và tìm tổng thật nhanh.":
    "Combine number groups and find the total.",
  "Tìm phần còn lại với những nhiệm vụ ngắn gọn.":
    "Find what remains in short missions.",
  "Xếp các nhóm bằng nhau để nhân thật tự tin.":
    "Multiply equal groups with confidence.",
  "Chia đều các nhóm số theo nhiệm vụ.":
    "Share groups equally in each mission.",
  "Chọn bảng nhân, bảng chia hoặc cả nhân và chia.":
    "Choose multiplication tables, division tables, or both.",
  "Hoàn thành tám nhiệm vụ để nhận thật nhiều sao.":
    "Complete eight missions to earn lots of stars.",
  "Robot Hana:": "Robot Hana:",
  "bạn làm được mà!": "you can do it!",
  "HÀNH TINH NHÂN": "MULTIPLICATION PLANET",
  "HÀNH TINH CỘNG": "ADDITION PLANET",
  "HÀNH TINH TRỪ": "SUBTRACTION PLANET",
  "HÀNH TINH CHIA": "DIVISION PLANET",
  "Làm quen": "Getting started",
  "Tự tin": "Confident",
  "Thám hiểm": "Explorer",
  "Khởi động bảng nhân quen thuộc.":
    "Start with a familiar multiplication fact.",
  "← Trở về": "← Back",
  "← Trở về chọn hoạt động": "← Back to activities",
  "Nhập tên của bạn để Hana đồng hành trong mỗi nhiệm vụ và ghi tên bạn lên thẻ kỷ niệm.":
    "Enter your name so Hana can join every mission and add it to your souvenir card.",
  "TÊN PHI HÀNH GIA": "ASTRONAUT NAME",
  "Ví dụ: Minh Anh": "Example: Minh Anh",
  "Gộp các nhóm và tìm tổng.": "Combine groups and find the total.",
  "Tìm phần còn lại.": "Find what remains.",
  "Chọn từng bảng hoặc luyện cả nhân và chia.":
    "Choose tables or practise both operations.",
  "Xếp những nhóm bằng nhau.": "Arrange equal groups.",
  "Chia đều các nhóm số.": "Share number groups equally.",
  "Thử sức và nhận sao.": "Try the challenge and earn stars.",
  "Robot Hana sẽ đồng hành cùng bạn trong mọi chuyến bay.":
    "Robot Hana will join you on every flight.",
  "Học Bảng Nhân và Bảng Chia": "Learn Multiplication and Division Tables",
  "Bài kiểm tra": "Test",
  "CHỌN NHIỆM VỤ": "CHOOSE A MISSION",
  "Hãy chọn dạng bài phù hợp để Hana bắt đầu lượt học nhé.":
    "Choose a practice type so Hana can begin your session.",
  "Tính kết quả của phép tính.": "Calculate the answer.",
  "Tìm số còn thiếu trong phép tính.":
    "Find the missing number in the equation.",
  "Luyện xen kẽ cả hai dạng bài.": "Alternate between both practice types.",
  "Nhân và chia xen kẽ": "Mix multiplication and division",
  "Học Toán": "Learn Math",
  "BẢNG CỬU CHƯƠNG": "TIMES TABLES",
  "TIẾN ĐỘ CỦA": "PROGRESS FOR",
};

function localizeVisibleText(language: Language) {
  const root = document.querySelector(".game-shell");
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach(node => {
    if (
      node.parentElement?.closest(
        ".language-control, [data-brand-wordmark], [data-sound-control], [data-dynamic-text], [data-i18n-direct]"
      )
    )
      return;
    const original = textOrigins.get(node) ?? node.nodeValue ?? "";
    if (!textOrigins.has(node)) textOrigins.set(node, original);
    if (language === "vi") {
      node.nodeValue = original;
      return;
    }
    const leading = original.match(/^\s*/)?.[0] ?? "";
    const trailing = original.match(/\s*$/)?.[0] ?? "";
    const core = original.trim();
    let translated = englishText[core] ?? core;
    translated = translated
      .replace(/^PHI HÀNH GIA:/, "ASTRONAUT:")
      .replace(/^HÀNH TRÌNH 4 HÀNH TINH$/, "FOUR-PLANET JOURNEY")
      .replace(/^ROBOT HANA CHÚC MỪNG /, "ROBOT HANA CONGRATULATES ")
      .replace(/^Lượt học của (.+)$/, "Learning session for $1")
      .replace(/^thật đáng tự hào!$/, "You should be proud!")
      .replace(/^Cấp (\d+)\/(\d+)$/, "Level $1/$2")
      .replace(/^Cấp (\d+): /, "Level $1: ")
      .replace(/^Còn (\d+) điểm để nhận /, "$1 points until ")
      .replace(/^Còn (\d+) điểm để mở /, "$1 points to unlock ")
      .replace(/^Còn (\d+) điểm nhận /, "$1 points until ")
      .replace(/\+10 điểm/g, "+10 points")
      .replace(/giảm 2 điểm/g, "lose 2 points")
      .replace(
        /^(.+), dù đúng hay sai, bạn đã kiên trì hoàn thành một chuyến luyện cùng Hana\.$/,
        "$1, whether right or wrong, you kept going through a session with Hana."
      )
      .replace(
        /^Hana đã cất các huy hiệu của (.+) vào khoang phi thuyền!$/,
        "Hana has stored $1's badges in the spaceship cabin!"
      )
      .replace(
        /^Robot Hana: “(.+), bạn làm được mà!”$/,
        "Robot Hana: “$1, you can do it!”"
      )
      .replace(
        /^Chưa sao đâu, lượt này giảm 2 điểm\. /,
        "That is okay. This try loses 2 points. "
      );
    node.nodeValue = `${leading}${translated}${trailing}`;
  });
}

function translateLearningText(text: string, language: Language) {
  if (language === "vi") return text;
  const direct: Record<string, string> = {
    "Khởi động với một phép cộng nhỏ.": "Warm up with a small addition.",
    "Gộp hai nhóm số lại với nhau.": "Combine two number groups.",
    "Hoàn thành phép cộng nhiều chữ số.": "Complete a multi-digit addition.",
    "Gỡ bớt đá vũ trụ khỏi đường bay.":
      "Clear space rocks from the flight path.",
    "Tìm số còn lại sau phép trừ.": "Find what remains after subtraction.",
    "Mở lối đi qua vành đai thiên thạch.":
      "Open a path through the asteroid belt.",
    "Khởi động bảng nhân quen thuộc.":
      "Start with a familiar multiplication fact.",
    "Xếp các nhóm bằng nhau để nhân.": "Multiply equal groups.",
    "Nhân công suất động cơ phi thuyền.":
      "Multiply the spaceship engine power.",
    "Chia đều các nhóm số.": "Share number groups equally.",
    "Chia đều nhiên liệu cho các trạm sao.":
      "Share fuel equally among star stations.",
    "Tìm thương của phép chia.": "Find the quotient.",
    "Bạn hãy đếm thêm từng bước từ số lớn hơn.":
      "Count on step by step from the larger number.",
    "Bạn hãy đặt tính thẳng cột rồi cộng từ hàng đơn vị.":
      "Line up the numbers and add from the ones place.",
    "Bạn hãy cộng từng hàng và nhớ nếu cần.":
      "Add each place value and regroup when needed.",
    "Bạn hãy đếm lùi từ số đầu tiên.": "Count backwards from the first number.",
    "Bạn hãy đặt tính thẳng cột rồi trừ từ hàng đơn vị.":
      "Line up the numbers and subtract from the ones place.",
    "Nếu không đủ để trừ, bạn hãy đổi 1 chục hoặc 1 trăm nhé.":
      "Regroup a ten or hundred when needed.",
    "Bạn có thể cộng lặp lại hoặc dùng bảng nhân.":
      "Use repeated addition or a times table.",
    "Bạn hãy nhân lần lượt với hàng đơn vị rồi hàng chục.":
      "Multiply the ones place, then the tens place.",
    "Bạn hãy đổi phép chia thành phép nhân để kiểm tra đáp án.":
      "Turn division into multiplication to check your answer.",
    "Số còn thiếu chính là kết quả phép chia.":
      "The missing number is the division answer.",
    "Số điền vào dấu hỏi là thương của phép chia.":
      "The number in the question mark is the quotient.",
    "Sau đó chọn kết quả vừa tìm được.": "Then choose the answer you found.",
    "Chọn số cuối cùng bạn đếm được.": "Choose the last number you counted.",
    "Bạn hãy tìm số hạng chưa biết.": "Find the missing addend.",
    "Bạn hãy tìm số bị trừ chưa biết.": "Find the missing minuend.",
    "Bạn hãy tìm số trừ chưa biết.": "Find the missing subtrahend.",
    "Bạn hãy tìm thừa số chưa biết.": "Find the missing factor.",
    "Bạn hãy tìm số bị chia chưa biết.": "Find the missing dividend.",
    "Bạn hãy tìm số chia chưa biết.": "Find the missing divisor.",
    "Muốn tìm số hạng, lấy tổng trừ số hạng đã biết.":
      "To find the missing addend, subtract the known addend from the total.",
    "Muốn tìm số bị trừ, lấy hiệu cộng số trừ.":
      "To find the minuend, add the difference and the subtrahend.",
    "Muốn tìm số trừ, lấy số bị trừ trừ hiệu.":
      "To find the subtrahend, subtract the difference from the minuend.",
    "Muốn tìm thừa số, lấy tích chia thừa số đã biết.":
      "To find the missing factor, divide the product by the known factor.",
    "Muốn tìm số bị chia, lấy thương nhân số chia.":
      "To find the dividend, multiply the quotient by the divisor.",
    "Muốn tìm số chia, lấy số bị chia chia thương.":
      "To find the divisor, divide the dividend by the quotient.",
  };
  if (direct[text]) return direct[text];
  const translated = text
    .replace(
      /^Bạn hãy nhớ lại bảng nhân (\d+) nhé\.$/,
      "Remember the $1 times table."
    )
    .replace(
      /^Bạn hãy dùng bảng nhân (\d+) để tìm kết quả chia\.$/,
      "Use the $1 times table to solve the division."
    )
    .replace(
      /^Bạn hãy nghĩ: (\d+) nhân mấy thì được (\d+)\?$/,
      "Think: $1 times what equals $2?"
    )
    .replace(
      /^Có (\d+) nhóm bằng nhau, mỗi nhóm có (\d+)\.$/,
      "There are $1 equal groups with $2 in each group."
    )
    .replace(
      /^Bạn có thể cộng (\d+) lặp lại (\d+) lần\.$/,
      "You can add $1, $2 times."
    )
    .replace(
      /^Hoặc dùng bảng nhân (\d+) để tìm kết quả\.$/,
      "Or use the $1 times table to find the answer."
    )
    .replace(/^Bắt đầu từ (\d+)\.$/, "Start from $1.")
    .replace(
      /^Đếm thêm (\d+) bước: mỗi bước tăng thêm 1\.$/,
      "Count on $1 steps, adding 1 each time."
    )
    .replace(
      /^Đếm lùi (\d+) bước, mỗi bước giảm 1\.$/,
      "Count back $1 steps, taking away 1 each time."
    )
    .replace(
      /^Đổi (\d+) ÷ (\d+) thành phép nhân (\d+) × \? = (\d+)\.$/,
      "Turn $1 ÷ $2 into $3 × ? = $4."
    )
    .replace(
      /^Đổi (\d+) ÷ (\d+) thành (\d+) × \? = (\d+)\.$/,
      "Turn $1 ÷ $2 into $3 × ? = $4."
    )
    .replace(
      /^Dùng bảng nhân (\d+) để tìm số còn thiếu\.$/,
      "Use the $1 times table to find the missing number."
    )
    .replace(
      /^Khởi động bảng nhân (\d+)\.$/,
      "Start the $1 multiplication table."
    )
    .replace(/^Khởi động bảng chia (\d+)\.$/, "Start the $1 division table.")
    .replace(
      /^Tổng là (\d+); số hạng đã biết là (\d+)\.$/,
      "The total is $1 and the known addend is $2."
    )
    .replace(
      /^Hiệu là (\d+); số trừ là (\d+)\.$/,
      "The difference is $1 and the subtrahend is $2."
    )
    .replace(
      /^Số bị trừ là (\d+); hiệu là (\d+)\.$/,
      "The minuend is $1 and the difference is $2."
    )
    .replace(
      /^Tích là (\d+); thừa số đã biết là (\d+)\.$/,
      "The product is $1 and the known factor is $2."
    )
    .replace(
      /^Thương là (\d+); số chia là (\d+)\.$/,
      "The quotient is $1 and the divisor is $2."
    )
    .replace(
      /^Số bị chia là (\d+); thương là (\d+)\.$/,
      "The dividend is $1 and the quotient is $2."
    )
    .replace(
      /^Viết (\d+) và (\d+) thẳng cột theo từng hàng\.$/,
      "Write $1 and $2 in aligned columns by place value."
    )
    .replace(
      /^Cộng từ hàng đơn vị, rồi đến hàng chục và hàng trăm\.$/,
      "Add the ones, then the tens and hundreds places."
    )
    .replace(
      /^Trừ từ hàng đơn vị, rồi đến hàng chục và hàng trăm\.$/,
      "Subtract the ones, then the tens and hundreds places."
    );
  return /[À-ỹ]/.test(translated)
    ? "Follow Hana's step-by-step clue, then choose your answer."
    : translated;
}

const activityMeta: Record<
  ActivityId,
  { label: string; kicker: string; description: string }
> = {
  add: {
    label: "Cộng",
    kicker: "PHÉP TÍNH CỘNG",
    description: "Gộp các nhóm số và tìm tổng thật nhanh.",
  },
  subtract: {
    label: "Trừ",
    kicker: "PHÉP TÍNH TRỪ",
    description: "Tìm phần còn lại với những nhiệm vụ ngắn gọn.",
  },
  multiply: {
    label: "Nhân",
    kicker: "PHÉP TÍNH NHÂN",
    description: "Xếp các nhóm bằng nhau để nhân thật tự tin.",
  },
  divide: {
    label: "Chia",
    kicker: "PHÉP TÍNH CHIA",
    description: "Chia đều các nhóm số theo nhiệm vụ.",
  },
  tables: {
    label: "Học Bảng Nhân và Bảng Chia",
    kicker: "BẢNG NHÂN VÀ CHIA",
    description: "Chọn bảng nhân, bảng chia hoặc cả nhân và chia.",
  },
  test: {
    label: "Bài kiểm tra",
    kicker: "8 CÂU THỬ THÁCH",
    description: "Hoàn thành tám nhiệm vụ để nhận thật nhiều sao.",
  },
};

function GameBrand({ language }: { language: Language }) {
  return (
    <span data-brand-wordmark data-i18n-direct>
      {language === "en" ? (
        <>
          Learn Math
          <br />
          with Hana
        </>
      ) : (
        <>
          Học Toán
          <br />
          Cùng Hana
        </>
      )}
    </span>
  );
}

function activityName(activity: ActivityId | Operation, language: Language) {
  if (language === "vi") return activityMeta[activity].label;
  return (
    {
      add: "Addition",
      subtract: "Subtraction",
      multiply: "Multiplication",
      divide: "Division",
      tables: "Learn Multiplication and Division Tables",
      test: "Test",
    } as const
  )[activity];
}

function practiceFormatName(format: PracticeFormat, language: Language) {
  if (language === "vi") return practiceFormatMeta[format].label;
  return (
    {
      standard: "Standard practice",
      missing: "Find the missing number",
      mixed: "Both practice types",
    } as const
  )[format];
}

function WelcomeScreen({
  onStart,
  onGuide,
  language,
}: {
  onStart: () => void;
  onGuide: () => void;
  language: Language;
}) {
  return (
    <section
      className="welcome-screen"
      data-i18n-direct
      aria-label={
        language === "en"
          ? "Welcome to Learn Math with Hana"
          : "Chào mừng đến với Học Toán Cùng Hana"
      }
    >
      <div className="welcome-operation-stage" aria-hidden="true">
        <span className="welcome-flight-orbit orbit-a" />
        <span className="welcome-flight-orbit orbit-b" />
        <span className="welcome-operation-planet add">+</span>
        <span className="welcome-operation-planet subtract">−</span>
        <span className="welcome-operation-planet multiply">×</span>
        <span className="welcome-operation-planet divide">÷</span>
      </div>
      <div className="welcome-content">
        <div className="welcome-robot" aria-hidden="true">
          <div className="robot-fallback">
            <span />
            <span />
            <i />
          </div>
          <span className="robot-orbit" />
        </div>
        <p className="welcome-kicker">
          <Sparkles size={15} />{" "}
          {language === "en"
            ? "WELCOME, YOUNG ASTRONAUT"
            : "CHÀO MỪNG PHI HÀNH GIA NHỎ"}
        </p>
        <h2>
          {language === "en" ? (
            <>
              <span>Learn Math</span>
              <em>with Hana</em>
            </>
          ) : (
            <>
              <span>Học Toán</span>
              <em>Cùng Hana</em>
            </>
          )}
        </h2>
        <p className="welcome-intro">
          {language === "en"
            ? "Join Robot Hana for a cheerful space mission through addition, subtraction, multiplication and division."
            : "Cùng Robot Hana chinh phục các hoạt động Cộng, Trừ, Nhân và Chia qua những nhiệm vụ thật vui."}
        </p>
        <div className="welcome-actions">
          <button type="button" className="welcome-primary" onClick={onStart}>
            {language === "en" ? "Start" : "Bắt đầu"}{" "}
            <Rocket size={19} fill="currentColor" />
          </button>
          <button type="button" className="welcome-secondary" onClick={onGuide}>
            <HelpCircle size={18} />{" "}
            {language === "en" ? "How to play" : "Xem cách chơi"}
          </button>
        </div>
        <div
          className="welcome-path"
          aria-label={
            language === "en"
              ? "Four-planet journey"
              : "Bốn hành tinh sẽ khám phá"
          }
        >
          <span className="welcome-path-title">
            {language === "en"
              ? "FOUR-PLANET JOURNEY"
              : "HÀNH TRÌNH 4 HÀNH TINH"}
          </span>
          <div className="welcome-path-route">
            <span>
              <b className="orange">+</b>{" "}
              {language === "en" ? "Addition" : "Cộng"}
            </span>
            <i />
            <span>
              <b className="purple">−</b>{" "}
              {language === "en" ? "Subtraction" : "Trừ"}
            </span>
            <i />
            <span>
              <b className="teal">×</b>{" "}
              {language === "en" ? "Multiplication" : "Nhân"}
            </span>
            <i />
            <span>
              <b className="yellow">÷</b>{" "}
              {language === "en" ? "Division" : "Chia"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlayerProfileScreen({
  name,
  onNameChange,
  avatarId,
  onAvatarChange,
  onBack,
  onContinue,
  language,
}: {
  name: string;
  onNameChange: (name: string) => void;
  avatarId: AvatarId;
  onAvatarChange: (avatarId: AvatarId) => void;
  onBack: () => void;
  onContinue: () => void;
  language: Language;
}) {
  return (
    <section
      className="profile-screen"
      data-i18n-direct
      aria-label={
        language === "en" ? "Choose an astronaut name" : "Đặt tên phi hành gia"
      }
    >
      <button type="button" className="format-back" onClick={onBack}>
        ← {language === "en" ? "Back" : "Trở về"}
      </button>
      <div className="profile-orbit" aria-hidden="true" />
      <div className="profile-hana">
        <div className="robot-fallback">
          <span />
          <span />
          <i />
        </div>
      </div>
      <p className="format-kicker">
        {language === "en" ? "ROBOT HANA IS WAITING" : "ROBOT HANA CHỜ BẠN"}
      </p>
      <h2>
        {language === "en" ? (
          <>
            What should Hana
            <br />
            <em>call you?</em>
          </>
        ) : (
          <>
            Hana nên gọi bạn
            <br />
            <em>là gì nhỉ?</em>
          </>
        )}
      </h2>
      <p>
        {language === "en"
          ? "Enter your name so Hana can join each mission and add it to your souvenir card."
          : "Nhập tên của bạn để Hana đồng hành trong mỗi nhiệm vụ và ghi tên bạn lên thẻ kỷ niệm."}
      </p>
      <section
        className="profile-avatar-chooser"
        aria-label={
          language === "en"
            ? "Choose your player avatar"
            : "Chọn avatar của bạn"
        }
      >
        <div className="avatar-chooser-heading">
          <span>
            {language === "en"
              ? "CHOOSE YOUR AVATAR"
              : "CHỌN AVATAR CỦA BẠN"}
          </span>
          <small>
            {language === "en"
              ? "Tap to choose your player character"
              : "Chạm để chọn nhân vật đại diện của bạn"}
          </small>
        </div>
        <div className="avatar-option-grid" role="radiogroup">
          {AVATAR_OPTIONS.map((avatar, index) => {
            const selected = avatar.id === avatarId;
            return (
              <button
                key={avatar.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={selected ? "is-selected" : ""}
                onClick={() => onAvatarChange(avatar.id)}
                aria-label={`${language === "en" ? "Player avatar" : "Avatar người chơi"} ${index + 1}`}
              >
                <PlayerAvatar avatarId={avatar.id} decorative />
                {selected && <Check className="avatar-selected-check" size={15} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>
      <label className="profile-name-field">
        <span>{language === "en" ? "ASTRONAUT NAME" : "TÊN PHI HÀNH GIA"}</span>
        <input
          value={name}
          maxLength={18}
          autoFocus
          placeholder={language === "en" ? "Example: Alex" : "Ví dụ: Minh Anh"}
          onChange={event => onNameChange(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter" && name.trim()) onContinue();
          }}
        />
      </label>
      <button
        type="button"
        className="profile-continue"
        disabled={!name.trim()}
        onClick={onContinue}
      >
        {language === "en" ? "Start with Hana" : "Cùng Hana bắt đầu"}{" "}
        <Rocket size={18} />
      </button>
    </section>
  );
}

function ActivityMenu({
  onBack,
  onChoose,
  language,
}: {
  onBack: () => void;
  onChoose: (activity: ActivityId) => void;
  language: Language;
}) {
  const activities: Array<{
    id: ActivityId;
    eyebrow: string;
    detail: string;
    tone: string;
    symbol: string;
  }> = [
    {
      id: "add",
      eyebrow: language === "en" ? "ADDITION" : "PHÉP TÍNH CỘNG",
      detail:
        language === "en"
          ? "Combine groups and find the total."
          : "Gộp các nhóm và tìm tổng.",
      tone: "add",
      symbol: "+",
    },
    {
      id: "subtract",
      eyebrow: language === "en" ? "SUBTRACTION" : "PHÉP TÍNH TRỪ",
      detail: language === "en" ? "Find what remains." : "Tìm phần còn lại.",
      tone: "subtract",
      symbol: "−",
    },
    {
      id: "tables",
      eyebrow:
        language === "en"
          ? "MULTIPLICATION & DIVISION TABLES"
          : "BẢNG NHÂN VÀ CHIA",
      detail:
        language === "en"
          ? "Choose tables or practise both operations."
          : "Chọn từng bảng hoặc luyện cả nhân và chia.",
      tone: "tables",
      symbol: "×÷",
    },
    {
      id: "multiply",
      eyebrow: language === "en" ? "MULTIPLICATION" : "PHÉP TÍNH NHÂN",
      detail:
        language === "en"
          ? "Arrange equal groups."
          : "Xếp những nhóm bằng nhau.",
      tone: "multiply",
      symbol: "×",
    },
    {
      id: "divide",
      eyebrow: language === "en" ? "DIVISION" : "PHÉP TÍNH CHIA",
      detail:
        language === "en" ? "Share groups equally." : "Chia đều các nhóm số.",
      tone: "divide",
      symbol: "÷",
    },
  ];

  return (
    <section
      className="activity-screen"
      data-i18n-direct
      aria-label={
        language === "en" ? "Choose a learning activity" : "Chọn hoạt động học"
      }
    >
      <button type="button" className="menu-back" onClick={onBack}>
        ← {language === "en" ? "Back" : "Trở về"}
      </button>
      <div className="activity-heading">
        <p>{language === "en" ? "CHOOSE A MISSION" : "CHỌN NHIỆM VỤ"}</p>
        <h2>
          {language === "en"
            ? "What would you like to explore?"
            : "Bạn muốn chinh phục điều gì?"}
        </h2>
        <span>
          {language === "en"
            ? "Tap a card to begin."
            : "Chạm vào một thẻ để bắt đầu nhé."}
        </span>
      </div>
      <div className="activity-grid">
        {activities.map((activity, index) => {
          return (
            <button
              key={activity.id}
              type="button"
              className={`activity-card ${activity.tone}`}
              onClick={() => onChoose(activity.id)}
            >
              <span className="activity-order">0{index + 1}</span>
              <span className="activity-icon sigil">
                <b>{activity.symbol}</b>
              </span>
              <span className="activity-copy">
                <b>{activity.eyebrow}</b>
                <strong>{activityName(activity.id, language)}</strong>
                <small>{activity.detail}</small>
              </span>
              <ChevronRight className="activity-arrow" size={22} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function StartModeScreen({
  onBack,
  onPractice,
  onTest,
  language,
}: {
  onBack: () => void;
  onPractice: () => void;
  onTest: () => void;
  language: Language;
}) {
  return (
    <section
      className="start-mode-screen"
      data-i18n-direct
      aria-label={
        language === "en" ? "Choose learning mode" : "Chọn chế độ học"
      }
    >
      <button type="button" className="format-back" onClick={onBack}>
        ← {language === "en" ? "Back" : "Trở về"}
      </button>
      <div className="start-mode-orbit" aria-hidden="true" />
      <div
        className="start-mode-planet-map"
        aria-label={
          language === "en" ? "Four maths planets" : "Bốn hành tinh Toán học"
        }
      >
        <span className="add">+</span>
        <i />
        <span className="subtract">−</span>
        <i />
        <span className="multiply">×</span>
        <i />
        <span className="divide">÷</span>
      </div>
      <div className="start-mode-hana">
        <div className="robot-fallback">
          <span />
          <span />
          <i />
        </div>
      </div>
      <p className="format-kicker">
        {language === "en" ? "ROBOT HANA IS READY" : "ROBOT HANA SẴN SÀNG"}
      </p>
      <h2>
        {language === "en" ? (
          <>
            Choose your
            <br />
            <em>math mission</em>
          </>
        ) : (
          <>
            Chọn chuyến bay
            <br />
            <em>toán học của bạn</em>
          </>
        )}
      </h2>
      <p className="start-mode-intro">
        {language === "en"
          ? "Practise at your own pace, or enjoy a gentle timed mission with Hana."
          : "Bạn có thể luyện tập theo nhịp riêng hoặc thử sức cùng Hana trong bài kiểm tra tính giờ."}
      </p>
      <div className="start-mode-options">
        <button
          type="button"
          className="start-mode-card is-practice"
          onClick={onPractice}
        >
          <span className="start-mode-icon">
            <Rocket size={30} />
          </span>
          <strong>{language === "en" ? "Practice" : "Luyện Tập"}</strong>
          <small>
            {language === "en"
              ? "Choose Addition, Subtraction, Multiplication, Division or Times Tables."
              : "Chọn Cộng, Trừ, Nhân, Chia hoặc Học Bảng Nhân và Bảng Chia."}
          </small>
          <em>
            {language === "en" ? "Explore missions" : "Khám phá nhiệm vụ"}{" "}
            <ChevronRight size={16} />
          </em>
        </button>
        <button
          type="button"
          className="start-mode-card is-test"
          onClick={onTest}
        >
          <span className="start-mode-icon">
            <ClipboardCheck size={30} />
          </span>
          <strong>{language === "en" ? "Test" : "Bài Kiểm Tra"}</strong>
          <small>
            {language === "en"
              ? "Choose a level and time for a calm, continuous mission."
              : "Chọn cấp độ, thời gian và làm các câu hỏi liên tục."}
          </small>
          <em>
            {language === "en" ? "Set up test" : "Thiết lập kiểm tra"}{" "}
            <ChevronRight size={16} />
          </em>
        </button>
      </div>
    </section>
  );
}

function TestSetupScreen({
  difficulty,
  durationSeconds,
  onDifficultyChange,
  onDurationChange,
  onBack,
  onStart,
  language,
}: {
  difficulty: Difficulty;
  durationSeconds: TestDurationSeconds;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onDurationChange: (duration: TestDurationSeconds) => void;
  onBack: () => void;
  onStart: () => void;
  language: Language;
}) {
  const durations: Array<{
    seconds: TestDurationSeconds;
    vi: string;
    en: string;
  }> = [
    { seconds: 120, vi: "2 phút", en: "2 minutes" },
    { seconds: 300, vi: "5 phút", en: "5 minutes" },
    { seconds: 600, vi: "10 phút", en: "10 minutes" },
  ];
  const levels: Array<{
    value: Difficulty;
    vi: string;
    en: string;
    detailVi: string;
    detailEn: string;
  }> = [
    {
      value: "easy",
      vi: "Làm quen",
      en: "Getting started",
      detailVi: "Tính nhẩm nhẹ nhàng",
      detailEn: "Gentle mental maths",
    },
    {
      value: "medium",
      vi: "Tự tin",
      en: "Confident",
      detailVi: "Theo cột và bảng nhân",
      detailEn: "Columns and times tables",
    },
    {
      value: "challenge",
      vi: "Thám hiểm",
      en: "Explorer",
      detailVi: "Nhiệm vụ lớn hơn",
      detailEn: "Bigger missions",
    },
  ];
  return (
    <section
      className="test-setup-screen"
      data-i18n-direct
      aria-label={
        language === "en"
          ? "Set up timed test"
          : "Thiết lập bài kiểm tra tính giờ"
      }
    >
      <button type="button" className="format-back" onClick={onBack}>
        ← {language === "en" ? "Back" : "Trở về"}
      </button>
      <div className="test-setup-orbit" aria-hidden="true" />
      <div
        className="test-setup-planet-map"
        aria-label={
          language === "en" ? "Four maths planets" : "Bốn hành tinh Toán học"
        }
      >
        <span className="add">+</span>
        <i />
        <span className="subtract">−</span>
        <i />
        <span className="multiply">×</span>
        <i />
        <span className="divide">÷</span>
      </div>
      <div className="test-setup-heading">
        <span>
          <Clock3 size={18} />{" "}
          {language === "en" ? "TIMED TEST" : "BÀI KIỂM TRA TÍNH GIỜ"}
        </span>
        <h2>
          {language === "en" ? (
            <>
              Ready for a gentle
              <br />
              <em>math mission?</em>
            </>
          ) : (
            <>
              Sẵn sàng cho
              <br />
              <em>thử thách Toán học?</em>
            </>
          )}
        </h2>
        <p>
          {language === "en"
            ? "Choose a level and time. Hana will bring a new question after every answer until time is up."
            : "Chọn cấp độ và thời gian. Hana sẽ đưa câu hỏi mới sau mỗi đáp án đến khi hết giờ."}
        </p>
      </div>
      <div className="test-setup-panel">
        <section>
          <h3>{language === "en" ? "1. Choose a level" : "1. Chọn cấp độ"}</h3>
          <div className="test-choice-label">
            <span>{language === "en" ? "LEVEL" : "CẤP ĐỘ"}</span>
            <small>
              {language === "en"
                ? "Pick the level that feels right for you."
                : "Chọn cấp độ phù hợp với bạn."}
            </small>
          </div>
          <div className="test-level-options">
            {levels.map(level => (
              <button
                key={level.value}
                type="button"
                className={difficulty === level.value ? "is-active" : ""}
                onClick={() => onDifficultyChange(level.value)}
              >
                <strong>{language === "en" ? level.en : level.vi}</strong>
                <small>
                  {language === "en" ? level.detailEn : level.detailVi}
                </small>
              </button>
            ))}
          </div>
        </section>
        <section>
          <h3>
            {language === "en" ? "2. Choose a time" : "2. Chọn thời gian"}
          </h3>
          <div className="test-duration-options">
            {durations.map(duration => (
              <button
                key={duration.seconds}
                type="button"
                className={
                  durationSeconds === duration.seconds ? "is-active" : ""
                }
                onClick={() => onDurationChange(duration.seconds)}
              >
                <Clock3 size={17} />
                <strong>{language === "en" ? duration.en : duration.vi}</strong>
              </button>
            ))}
          </div>
        </section>
        <button type="button" className="test-start-button" onClick={onStart}>
          {language === "en" ? "Start timed test" : "Bắt đầu kiểm tra"}{" "}
          <Rocket size={18} />
        </button>
      </div>
    </section>
  );
}

function PracticeFormatScreen({
  operation,
  playerName,
  onBack,
  onStart,
  language,
}: {
  operation: Operation;
  playerName: string;
  onBack: () => void;
  onStart: (format: PracticeFormat) => void;
  language: Language;
}) {
  const activity = activityName(operation, language);
  const options: Array<{
    format: PracticeFormat;
    symbol: string;
    description: string;
  }> = [
    {
      format: "standard",
      symbol: "✓",
      description:
        language === "en"
          ? "Calculate the answer."
          : "Tính kết quả của phép tính.",
    },
    {
      format: "missing",
      symbol: "?",
      description:
        language === "en"
          ? "Find the missing number in the equation."
          : "Tìm số còn thiếu trong phép tính.",
    },
    {
      format: "mixed",
      symbol: "↻",
      description:
        language === "en"
          ? "Alternate between both practice types."
          : "Luyện xen kẽ cả hai dạng bài.",
    },
  ];
  return (
    <section
      className="format-screen"
      data-i18n-direct
      aria-label={language === "en" ? "Choose practice type" : "Chọn dạng bài"}
    >
      <button type="button" className="format-back" onClick={onBack}>
        ← {language === "en" ? "Back to activities" : "Trở về chọn hoạt động"}
      </button>
      <div className="format-orbit" aria-hidden="true" />
      <div className="format-hana">
        <div className="robot-fallback">
          <span />
          <span />
          <i />
        </div>
      </div>
      <p className="format-kicker">
        {language === "en" ? "ROBOT HANA IS READY" : "ROBOT HANA SẴN SÀNG"}
      </p>
      <h2>
        {activity}
        <br />
        <em>
          {language === "en"
            ? "How would you like to learn?"
            : "Bạn muốn học thế nào?"}
        </em>
      </h2>
      <p className="format-intro">
        {language === "en"
          ? `${playerName}, choose a practice type before Hana starts your learning session.`
          : `${playerName}, hãy chọn một dạng bài trước khi Hana khởi động lượt học của bạn.`}
      </p>
      <div className="format-option-grid">
        {options.map((option, index) => (
          <button
            key={option.format}
            type="button"
            className={
              index === 0 ? "format-option is-recommended" : "format-option"
            }
            onClick={() => onStart(option.format)}
          >
            <b>{option.symbol}</b>
            <strong>{practiceFormatName(option.format, language)}</strong>
            <small>{option.description}</small>
            <span className="format-go">
              {language === "en" ? "Start" : "Bắt đầu"}{" "}
              <ChevronRight size={16} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

const difficultyMeta: Record<Difficulty, { label: string; detail: string }> = {
  easy: { label: "Làm quen", detail: "Tính nhẩm nhẹ nhàng" },
  medium: { label: "Tự tin", detail: "Tính theo cột và bảng nhân" },
  challenge: { label: "Thám hiểm", detail: "Nhiệm vụ lớn hơn" },
};

const tableKindMeta: Record<
  TablePracticeKind,
  { label: string; subtitle: string; accent: string }
> = {
  multiply: {
    label: "Bảng nhân",
    subtitle: "Nhân theo từng bảng",
    accent: "#54cbb4",
  },
  divide: {
    label: "Bảng chia",
    subtitle: "Chia theo từng bảng",
    accent: "#f3c85e",
  },
  mixed: {
    label: "Cả nhân và chia",
    subtitle: "Nhân và chia xen kẽ",
    accent: "#ff7b5a",
  },
};

function pickTestOperation() {
  const operations: Operation[] = ["add", "subtract", "multiply", "divide"];
  return operations[Math.floor(Math.random() * operations.length)];
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const handleRef = useRef<GameHandle | null>(null);
  const demoParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );
  const isDemo = demoParams.has("demo");
  const isTableDemo = demoParams.has("tables");
  const isMenuPreview = demoParams.has("menu");
  const isActivitiesPreview = demoParams.has("activities");
  const isSummaryDemo = demoParams.has("summary");
  const isProfileDemo = demoParams.has("profile");
  const isScoreDemo = demoParams.has("score");
  const isGuideDemo = demoParams.has("guide");
  const isSoundSettingsDemo = demoParams.has("soundsettings");
  const isTestSetupDemo = demoParams.has("testsetup");
  const isEndSessionConfirmDemo = demoParams.has("endconfirm");
  const isHomeConfirmDemo = demoParams.has("homeconfirm");
  const isMaxRewardDemo = demoParams.has("maxrewards");
  const forceCanvasFallback = demoParams.has("nowebgl");
  const unlockDemoOperation = demoParams.get("unlock");
  const isUnlockDemo =
    unlockDemoOperation === "add" ||
    unlockDemoOperation === "subtract" ||
    unlockDemoOperation === "multiply" ||
    unlockDemoOperation === "divide";
  const missingDemoOperation = demoParams.get("missing");
  const formatDemoOperation = demoParams.get("format");
  const isMissingDemo =
    missingDemoOperation === "add" ||
    missingDemoOperation === "subtract" ||
    missingDemoOperation === "multiply" ||
    missingDemoOperation === "divide";
  const isFormatDemo =
    formatDemoOperation === "add" ||
    formatDemoOperation === "subtract" ||
    formatDemoOperation === "multiply" ||
    formatDemoOperation === "divide";
  const tableDemoKind: TablePracticeKind =
    demoParams.get("tables") === "divide"
      ? "divide"
      : demoParams.get("tables") === "mixed"
        ? "mixed"
        : "multiply";
  const initialOperation: Operation = isMissingDemo
    ? missingDemoOperation
    : isFormatDemo
      ? formatDemoOperation
      : isDemo || isTableDemo
        ? tableDemoKind === "divide"
          ? "divide"
          : "multiply"
        : "add";

  const [screen, setScreen] = useState<AppScreen>(
    isSummaryDemo || isMaxRewardDemo
      ? "summary"
      : isProfileDemo
        ? "profile"
        : isFormatDemo
          ? "format"
          : isTestSetupDemo
            ? "testsetup"
            : isScoreDemo ||
                isDemo ||
                isTableDemo ||
                isMissingDemo ||
                isEndSessionConfirmDemo
              ? "game"
              : isActivitiesPreview
                ? "activities"
                : isMenuPreview
                  ? "menu"
                  : "welcome"
  );
  const [mode, setMode] = useState<ExerciseMode>(
    isTableDemo ? "tables" : isTestSetupDemo ? "test" : "practice"
  );
  const [selectedActivity, setSelectedActivity] = useState<ActivityId>(
    isTableDemo
      ? "tables"
      : isTestSetupDemo
        ? "test"
        : isMissingDemo || isFormatDemo
          ? initialOperation
          : isDemo
            ? "multiply"
            : "add"
  );
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [practiceFormat, setPracticeFormat] =
    useState<PracticeFormat>("standard");
  const [operation, setOperation] = useState<Operation>(initialOperation);
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    isTableDemo
      ? generateTableQuestion({ kind: tableDemoKind, tables: [2, 4, 6] })
      : isMissingDemo
        ? generateMissingComponentQuestion(initialOperation, "easy")
        : generateQuestion(initialOperation, "easy")
  );
  const recentQuestionExpressionsRef = useRef<string[]>([question.expression]);
  const lastShownQuestionExpressionRef = useRef(question.expression);
  const lastTableSelectionRef = useRef<string | null>(null);
  const [tableKind, setTableKind] = useState<TablePracticeKind>(tableDemoKind);
  const [selectedTables, setSelectedTables] = useState<number[]>(
    isTableDemo ? [2, 4, 6] : []
  );
  const [answered, setAnswered] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">(
    "idle"
  );
  const [testStep, setTestStep] = useState(0);
  const [testCorrect, setTestCorrect] = useState(0);
  const [testComplete, setTestComplete] = useState(false);
  const [testDurationSeconds, setTestDurationSeconds] =
    useState<TestDurationSeconds>(120);
  const [testSecondsRemaining, setTestSecondsRemaining] = useState(120);
  const [testTimedOut, setTestTimedOut] = useState(false);
  const [showGuide, setShowGuide] = useState(isGuideDemo);
  const [showScorePanel, setShowScorePanel] = useState(isScoreDemo);
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(
    isEndSessionConfirmDemo
  );
  const [showHomeConfirm, setShowHomeConfirm] = useState(isHomeConfirmDemo);
  const [playerName, setPlayerName] = useState(
    isSummaryDemo || isProfileDemo || isScoreDemo || isMaxRewardDemo
      ? "Minh Anh"
      : ""
  );
  const [avatarId, setAvatarId] = useState<AvatarId>(readAvatarPreference);
  const [collectedThemeBadgeIds, setCollectedThemeBadgeIds] = useState<string[]>(
    readThemeBadgeCollection
  );
  const [planetUnlock, setPlanetUnlock] = useState<PlanetUnlock | null>(() =>
    isUnlockDemo
      ? {
          operation: unlockDemoOperation,
          badge: THEME_BADGES[0],
        }
      : null
  );
  const activePlanetUnlock: PlanetUnlock | null = isUnlockDemo
    ? { operation: unlockDemoOperation as Operation, badge: THEME_BADGES[0] }
    : planetUnlock;
  const [sessionPoints, setSessionPoints] = useState(
    isMaxRewardDemo ? 1000 : isSummaryDemo || isScoreDemo ? 100 : 0
  );
  const previousSessionPointsRef = useRef(sessionPoints);
  const unlockedBadgeIdsThisSessionRef = useRef<Set<string>>(new Set());
  const [correctCount, setCorrectCount] = useState(
    isMaxRewardDemo ? 100 : isSummaryDemo || isScoreDemo ? 10 : 0
  );
  const [wrongCount, setWrongCount] = useState(
    isMaxRewardDemo ? 5 : isSummaryDemo || isScoreDemo ? 2 : 0
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(
    isMaxRewardDemo ? 721 : isSummaryDemo || isScoreDemo ? 93 : 0
  );
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [resumeDraft, setResumeDraft] = useState<SessionDraft | null>(() =>
    isDemo || isTableDemo || isSummaryDemo ? null : readSessionDraft()
  );
  const [showResumeSession, setShowResumeSession] = useState(
    () =>
      !isDemo && !isTableDemo && !isSummaryDemo && Boolean(readSessionDraft())
  );
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [imageSaveStatus, setImageSaveStatus] = useState("");
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    const requestedLanguage = demoParams.get("lang");
    if (requestedLanguage === "vi" || requestedLanguage === "en")
      return requestedLanguage;
    return window.localStorage.getItem("hana-language") === "en" ? "en" : "vi";
  });
  const [soundEnabled, setSoundEnabled] = useState(getStoredSoundPreference);
  const [musicVolume, setMusicVolume] = useState(getStoredMusicVolume);
  const [effectsVolume, setEffectsVolume] = useState(getStoredEffectsVolume);
  const audioRef = useRef<HanaAudio | null>(null);
  const pausedStartedAtRef = useRef<number | null>(null);
  const pausedDurationRef = useRef(0);
  const testEndsAtRef = useRef<number | null>(null);
  const testFinalizedRef = useRef(false);
  const displayName =
    playerName.trim() ||
    (language === "en" ? "Young astronaut" : "Phi hành gia nhỏ");
  const copy = (vietnamese: string, english: string) =>
    language === "en" ? english : vietnamese;
  const operationLabel = (value: Operation) =>
    language === "en"
      ? {
          add: "Addition",
          subtract: "Subtraction",
          multiply: "Multiplication",
          divide: "Division",
        }[value]
      : activityMeta[value].label;
  const tableLabel = (value: TablePracticeKind) =>
    language === "en"
      ? {
          multiply: "Multiplication tables",
          divide: "Division tables",
          mixed: "Both multiplication & division",
        }[value]
      : tableKindMeta[value].label;
  const tableSubtitle = (value: TablePracticeKind) =>
    language === "en"
      ? {
          multiply: "Practise one multiplication table",
          divide: "Practise one division table",
          mixed: "Mix multiplication and division",
        }[value]
      : tableKindMeta[value].subtitle;
  const rewardLabel = (reward: (typeof sessionRewards)[number]) => {
    if (language !== "en") return reward.label;
    if (reward.level === 100) return "Hana Captain's Trophy";
    const rewardFamilies = [
      "Little Star Sticker",
      "Explorer Badge",
      "Junior Pilot Trophy",
    ];
    return `${rewardFamilies[(reward.level - 1) % rewardFamilies.length]} · Level ${reward.level}`;
  };
  const rewardDetail = (reward: (typeof sessionRewards)[number]) =>
    language === "en"
      ? "A new treasure for your space collection."
      : reward.detail;

  useEffect(() => {
    const audio = new HanaAudio(soundEnabled, musicVolume, effectsVolume);
    audioRef.current = audio;
    audio.prime();
    return () => audio.dispose();
  }, []);

  useEffect(() => {
    const unlockAudio = () => audioRef.current?.activate();
    // Capture the very first trusted gesture before any screen transition so
    // mobile browsers authorize media playback reliably.
    window.addEventListener("pointerdown", unlockAudio, {
      capture: true,
      once: true,
    });
    window.addEventListener("keydown", unlockAudio, {
      capture: true,
      once: true,
    });
    window.addEventListener("touchend", unlockAudio, {
      capture: true,
      once: true,
    });
    window.addEventListener("click", unlockAudio, {
      capture: true,
      once: true,
    });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, { capture: true });
      window.removeEventListener("keydown", unlockAudio, { capture: true });
      window.removeEventListener("touchend", unlockAudio, { capture: true });
      window.removeEventListener("click", unlockAudio, { capture: true });
    };
  }, []);

  useEffect(() => {
    audioRef.current?.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    audioRef.current?.setMusicVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    audioRef.current?.setEffectsVolume(effectsVolume);
  }, [effectsVolume]);

  const playSound = useCallback((effect: SoundEffect) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.activate();
    audio.play(effect);
  }, []);

  const collectThemeBadges = useCallback((points: number) => {
    const unlockedIds = themeBadgesForSession(points);
    if (unlockedIds.length === 0) return;
    setCollectedThemeBadgeIds(current =>
      Array.from(new Set([...current, ...unlockedIds]))
    );
  }, []);

  useEffect(() => {
    const previousPoints = previousSessionPointsRef.current;
    const newlyUnlocked = THEME_BADGES.find(
      badge =>
        previousPoints < badge.threshold &&
        sessionPoints >= badge.threshold &&
        !unlockedBadgeIdsThisSessionRef.current.has(badge.id)
    );
    previousSessionPointsRef.current = sessionPoints;
    if (!newlyUnlocked) return;
    unlockedBadgeIdsThisSessionRef.current.add(newlyUnlocked.id);
    collectThemeBadges(sessionPoints);
    setPlanetUnlock({ operation, badge: newlyUnlocked });
    playSound("reward");
  }, [collectThemeBadges, operation, playSound, sessionPoints]);

  useEffect(() => {
    if (!planetUnlock) return;
    if (isUnlockDemo) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const timer = window.setTimeout(
      () => setPlanetUnlock(null),
      reduceMotion ? 4500 : 3000
    );
    return () => window.clearTimeout(timer);
  }, [isUnlockDemo, planetUnlock]);

  const toggleSound = () => {
    const nextEnabled = !soundEnabled;
    setSoundEnabled(nextEnabled);
    audioRef.current?.setEnabled(nextEnabled);
    if (nextEnabled) playSound("tap");
  };

  const changeMusicVolume = (volume: number) => {
    setMusicVolume(volume);
    audioRef.current?.setMusicVolume(volume);
    audioRef.current?.activate();
  };

  const changeEffectsVolume = (volume: number) => {
    setEffectsVolume(volume);
    audioRef.current?.setEffectsVolume(volume);
    playSound("tap");
  };

  const generatePracticeQuestion = useCallback(
    (
      nextOperation: Operation,
      nextDifficulty: Difficulty,
      nextFormat = practiceFormat
    ) => {
      const shouldFindComponent =
        nextFormat === "missing" ||
        (nextFormat === "mixed" && Math.random() < 0.5);
      return shouldFindComponent
        ? generateMissingComponentQuestion(nextOperation, nextDifficulty)
        : generateQuestion(nextOperation, nextDifficulty);
    },
    [practiceFormat]
  );

  const freshQuestion = useCallback((buildQuestion: () => QuizQuestion) => {
    let candidate = buildQuestion();
    let attempts = 0;
    while (
      (!isQuestionConsistent(candidate) ||
        recentQuestionExpressionsRef.current.includes(candidate.expression) ||
        candidate.expression === lastShownQuestionExpressionRef.current) &&
      attempts < 50
    ) {
      candidate = buildQuestion();
      attempts += 1;
    }
    if (!isQuestionConsistent(candidate))
      throw new Error("Không thể tạo câu hỏi Toán hợp lệ.");
    recentQuestionExpressionsRef.current = [
      ...recentQuestionExpressionsRef.current,
      candidate.expression,
    ].slice(-5);
    lastShownQuestionExpressionRef.current = candidate.expression;
    return candidate;
  }, []);

  const createNextQuestion = useCallback(
    (
      nextMode = mode,
      nextOperation = operation,
      nextDifficulty = difficulty
    ) => {
      if (nextMode === "tables") {
        if (selectedTables.length === 0) {
          setAnswered(null);
          setFeedback("idle");
          return;
        }
        const tableQuestion = freshQuestion(() =>
          generateTableQuestion({ kind: tableKind, tables: selectedTables })
        );
        setOperation(tableQuestion.operation);
        setQuestion(tableQuestion);
        setAnswered(null);
        setFeedback("idle");
        handleRef.current?.setActivePlanet(tableQuestion.operation);
        return;
      }
      const operationForQuestion =
        nextMode === "test" ? pickTestOperation() : nextOperation;
      setOperation(operationForQuestion);
      setQuestion(
        freshQuestion(() =>
          generatePracticeQuestion(operationForQuestion, nextDifficulty)
        )
      );
      setAnswered(null);
      setFeedback("idle");
      handleRef.current?.setActivePlanet(operationForQuestion);
    },
    [
      difficulty,
      freshQuestion,
      generatePracticeQuestion,
      mode,
      operation,
      selectedTables,
      tableKind,
    ]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    let disposed = false;
    let engine: Engine | null = null;
    const initializeScene = async () => {
      try {
        const [{ Engine: BabylonEngine }, { createGameScene }] =
          await Promise.all([
            import("@babylonjs/core/Engines/engine"),
            import("@/game/scene"),
          ]);
        if (disposed) return;
        if (forceCanvasFallback || !BabylonEngine.IsSupported) {
          setWebglUnavailable(true);
          return;
        }
        engine = new BabylonEngine(canvas, true, {
          preserveDrawingBuffer: true,
          stencil: true,
          adaptToDeviceRatio: true,
        });
        startedRef.current = true;
        const handle = await createGameScene(engine, canvas);
        if (disposed) {
          handle.dispose();
          return;
        }
        handleRef.current = handle;
        handle.setActivePlanet(initialOperation);
        engine.runRenderLoop(() => handle.scene.render());
      } catch (error) {
        console.warn(
          "Không thể khởi tạo bản đồ hành tinh; dùng nền vũ trụ 2D.",
          error
        );
        engine?.dispose();
        startedRef.current = false;
        if (!disposed) setWebglUnavailable(true);
      }
    };
    const idleStart = window.setTimeout(() => {
      void initializeScene();
    }, 120);
    const onResize = () => engine?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.clearTimeout(idleStart);
      window.removeEventListener("resize", onResize);
      handleRef.current?.dispose();
      handleRef.current = null;
      engine?.dispose();
      startedRef.current = false;
    };
  }, [forceCanvasFallback, initialOperation, isDemo, isTableDemo]);

  const selectOperation = (nextOperation: Operation) => {
    setOperation(nextOperation);
    setTestComplete(false);
    setTestStep(0);
    setTestCorrect(0);
    setQuestion(
      freshQuestion(() => generatePracticeQuestion(nextOperation, difficulty))
    );
    setAnswered(null);
    setFeedback("idle");
    handleRef.current?.setActivePlanet(nextOperation);
  };

  const selectDifficulty = (nextDifficulty: Difficulty) => {
    if (mode === "test" && testEndsAtRef.current !== null) return;
    setDifficulty(nextDifficulty);
    setTestComplete(false);
    setTestStep(0);
    setTestCorrect(0);
    setQuestion(
      freshQuestion(() => generatePracticeQuestion(operation, nextDifficulty))
    );
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

  const setTablePractice = (
    nextKind: TablePracticeKind,
    nextTables = selectedTables
  ) => {
    if (nextTables.length === 0) {
      lastTableSelectionRef.current = null;
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
    setMode("tables");
    setTableKind(nextKind);
    setSelectedTables(nextTables);
    setAnswered(null);
    setFeedback("idle");
    setTestComplete(false);
    setTestStep(0);
    setTestCorrect(0);
  };

  useEffect(() => {
    if (mode !== "tables" || selectedTables.length === 0) return;
    const selectionKey = `${tableKind}:${selectedTables.join(",")}`;
    if (lastTableSelectionRef.current === selectionKey) return;
    lastTableSelectionRef.current = selectionKey;
    const excludedExpressions = [
      ...recentQuestionExpressionsRef.current,
      lastShownQuestionExpressionRef.current,
    ];
    const tableQuestion = freshQuestion(() =>
      generateTableQuestion({
        kind: tableKind,
        tables: selectedTables,
        excludedExpressions,
      })
    );
    setOperation(tableQuestion.operation);
    setQuestion(tableQuestion);
    setAnswered(null);
    setFeedback("idle");
    handleRef.current?.setActivePlanet(tableQuestion.operation);
  }, [freshQuestion, mode, selectedTables, tableKind]);

  const startActivity = (nextActivity: ActivityId) => {
    playSound("launch");
    if (
      nextActivity === "add" ||
      nextActivity === "subtract" ||
      nextActivity === "multiply" ||
      nextActivity === "divide"
    ) {
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
    if (sessionStartedAt === null) startFreshSession();
    setScreen("game");
    setSelectedActivity(nextActivity);
    if (nextActivity === "tables") {
      setTablePractice(tableKind, []);
      return;
    }
    if (nextActivity === "test") return;
    setMode("practice");
    selectOperation(nextActivity);
  };

  const beginPractice = (nextFormat: PracticeFormat) => {
    playSound("launch");
    setAnswered(null);
    setFeedback("idle");
    setTestComplete(false);
    setTestStep(0);
    setTestCorrect(0);
    if (sessionStartedAt === null) startFreshSession();
    setMode("practice");
    setPracticeFormat(nextFormat);
    setQuestion(
      freshQuestion(() =>
        generatePracticeQuestion(operation, difficulty, nextFormat)
      )
    );
    handleRef.current?.setActivePlanet(operation);
    setScreen("game");
  };

  const beginTimedTest = () => {
    playSound("launch");
    startFreshSession();
    setSelectedActivity("test");
    setMode("test");
    setPracticeFormat("standard");
    setTestStep(0);
    setTestCorrect(0);
    setTestComplete(false);
    setTestTimedOut(false);
    testFinalizedRef.current = false;
    testEndsAtRef.current = Date.now() + testDurationSeconds * 1000;
    setTestSecondsRemaining(testDurationSeconds);
    const firstOperation = pickTestOperation();
    setOperation(firstOperation);
    setQuestion(
      freshQuestion(() =>
        generatePracticeQuestion(firstOperation, difficulty, "standard")
      )
    );
    setAnswered(null);
    setFeedback("idle");
    handleRef.current?.setActivePlanet(firstOperation);
    setScreen("game");
  };

  const toggleTable = (table: number) => {
    const isAddingTable = !selectedTables.includes(table);
    const nextTables = selectedTables.includes(table)
      ? selectedTables.length === 1
        ? selectedTables
        : selectedTables.filter(item => item !== table)
      : [...selectedTables, table].sort((a, b) => a - b);
    setTablePractice(tableKind, nextTables);
    playSound("tap");
  };

  const changeTableKind = (nextKind: TablePracticeKind) => {
    setTableKind(nextKind);
    if (selectedTables.length > 0) setTablePractice(nextKind, selectedTables);
    playSound("tap");
  };

  const clearAllTables = () => {
    lastTableSelectionRef.current = null;
    setSelectedTables([]);
    setAnswered(null);
    setFeedback("idle");
    setTestComplete(false);
  };

  const answerQuestion = useCallback(
    (choice: number) => {
      if (
        answered !== null ||
        testComplete ||
        (mode === "tables" && selectedTables.length === 0)
      )
        return;
      setAnswered(choice);
      if (choice === question.answer) {
        playSound("correct");
        setFeedback("correct");
        setCorrectCount(current => current + 1);
        setSessionPoints(current => current + 10);
        if (mode === "test") setTestCorrect(current => current + 1);
      } else {
        playSound("wrong");
        setFeedback("wrong");
        setWrongCount(current => current + 1);
        setSessionPoints(current => Math.max(0, current - 2));
      }
    },
    [
      answered,
      mode,
      playSound,
      question.answer,
      selectedTables.length,
      testComplete,
    ]
  );

  const continueMission = () => {
    if (mode === "tables" && selectedTables.length === 0) return;
    playSound(feedback === "wrong" ? "tap" : "next");
    if (feedback === "wrong" && mode !== "test") {
      setAnswered(null);
      setFeedback("idle");
      return;
    }
    if (mode === "test") {
      setTestStep(step => step + 1);
      createNextQuestion("test");
      return;
    }
    createNextQuestion();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (screen !== "game" || showScorePanel || showEndSessionConfirm) return;
      const numeric = Number(event.key);
      if (numeric >= 1 && numeric <= 4) {
        const option = question.options[numeric - 1];
        if (option !== undefined) answerQuestion(option);
      }
      if (event.key === "Enter" && feedback !== "idle") continueMission();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    answerQuestion,
    feedback,
    question.options,
    screen,
    showEndSessionConfirm,
    showScorePanel,
  ]);

  const currentDuration = () =>
    sessionStartedAt === null
      ? elapsedSeconds
      : Math.max(
          elapsedSeconds,
          Math.floor(
            (Date.now() -
              sessionStartedAt -
              pausedDurationRef.current -
              (pausedStartedAtRef.current === null
                ? 0
                : Date.now() - pausedStartedAtRef.current)) /
              1000
          )
        );

  useEffect(() => {
    if (
      mode !== "test" ||
      screen !== "game" ||
      testComplete ||
      testEndsAtRef.current === null
    )
      return;
    const syncTestClock = () => {
      const remaining = Math.max(
        0,
        Math.ceil((testEndsAtRef.current! - Date.now()) / 1000)
      );
      setTestSecondsRemaining(remaining);
      if (remaining > 0 || testFinalizedRef.current) return;
      testFinalizedRef.current = true;
      testEndsAtRef.current = null;
      setTestTimedOut(true);
      setTestComplete(true);
      clearSessionDraft();
      setResumeDraft(null);
      setElapsedSeconds(currentDuration());
      playSound("reward");
      setScreen("summary");
    };
    syncTestClock();
    const timer = window.setInterval(syncTestClock, 250);
    return () => window.clearInterval(timer);
  }, [mode, playSound, screen, testComplete]);

  useEffect(() => {
    if (sessionStartedAt === null) return;
    const syncClock = () => {
      const isLearningActive =
        screen === "game" && document.visibilityState === "visible";
      if (isLearningActive && pausedStartedAtRef.current !== null) {
        pausedDurationRef.current += Date.now() - pausedStartedAtRef.current;
        pausedStartedAtRef.current = null;
      }
      if (!isLearningActive && pausedStartedAtRef.current === null)
        pausedStartedAtRef.current = Date.now();
      if (isLearningActive) setElapsedSeconds(currentDuration());
    };
    syncClock();
    const timer = window.setInterval(syncClock, 1000);
    document.addEventListener("visibilitychange", syncClock);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", syncClock);
    };
  }, [screen, sessionStartedAt]);

  useEffect(() => {
    const persistedScreen: SessionDraft["screen"] | null =
      screen === "menu" ||
      screen === "activities" ||
      screen === "format" ||
      screen === "testsetup" ||
      screen === "game"
        ? screen
        : null;
    if (sessionStartedAt === null || persistedScreen === null) return;
    const draft: SessionDraft = {
      version: 1,
      screen: persistedScreen,
      selectedActivity,
      mode,
      operation,
      difficulty,
      practiceFormat,
      tableKind,
      selectedTables,
      question,
      recentExpressions: recentQuestionExpressionsRef.current,
      playerName,
      avatarId,
      sessionPoints,
      correctCount,
      wrongCount,
      elapsedSeconds: currentDuration(),
      testStep,
      testCorrect,
      testDurationSeconds,
      testSecondsRemaining,
    };
    window.localStorage.setItem(SESSION_DRAFT_KEY, JSON.stringify(draft));
  }, [
    avatarId,
    correctCount,
    difficulty,
    elapsedSeconds,
    mode,
    operation,
    playerName,
    practiceFormat,
    question,
    screen,
    selectedActivity,
    selectedTables,
    sessionPoints,
    sessionStartedAt,
    tableKind,
    testCorrect,
    testDurationSeconds,
    testSecondsRemaining,
    testStep,
    wrongCount,
  ]);

  useEffect(() => {
    window.localStorage.setItem(AVATAR_STORAGE_KEY, avatarId);
  }, [avatarId]);

  useEffect(() => {
    window.localStorage.setItem(
      THEME_BADGE_STORAGE_KEY,
      JSON.stringify(collectedThemeBadgeIds)
    );
  }, [collectedThemeBadgeIds]);

  const finishSession = () => {
    setShowEndSessionConfirm(false);
    testEndsAtRef.current = null;
    clearSessionDraft();
    setResumeDraft(null);
    collectThemeBadges(sessionPoints);
    playSound("reward");
    setElapsedSeconds(currentDuration());
    setScreen("summary");
  };

  const requestEndSession = () => {
    playSound("tap");
    setShowEndSessionConfirm(true);
  };

  const startFreshSession = () => {
    clearSessionDraft();
    setResumeDraft(null);
    setShowResumeSession(false);
    pausedStartedAtRef.current = null;
    pausedDurationRef.current = 0;
    testEndsAtRef.current = null;
    testFinalizedRef.current = false;
    recentQuestionExpressionsRef.current = [];
    previousSessionPointsRef.current = 0;
    unlockedBadgeIdsThisSessionRef.current = new Set();
    setPlanetUnlock(null);
    setSessionPoints(0);
    setCorrectCount(0);
    setWrongCount(0);
    setElapsedSeconds(0);
    setSessionStartedAt(Date.now());
  };

  const requestHome = () => {
    if (screen === "welcome") return;
    playSound("tap");
    setShowHomeConfirm(true);
  };

  const returnHomeAndReset = () => {
    startFreshSession();
    setPlayerName("");
    setSelectedActivity("add");
    setMode("practice");
    setOperation("add");
    setDifficulty("easy");
    setPracticeFormat("standard");
    setTableKind("multiply");
    setSelectedTables([]);
    setTestStep(0);
    setTestCorrect(0);
    setTestTimedOut(false);
    setTestComplete(false);
    setAnswered(null);
    setFeedback("idle");
    setShowGuide(false);
    setShowScorePanel(false);
    setShowHomeConfirm(false);
    setScreen("welcome");
    playSound("launch");
  };

  const resumeSavedSession = () => {
    if (!resumeDraft) return;
    setSelectedActivity(resumeDraft.selectedActivity);
    setMode(resumeDraft.mode);
    setOperation(resumeDraft.operation);
    setDifficulty(resumeDraft.difficulty);
    setPracticeFormat(resumeDraft.practiceFormat);
    setTableKind(resumeDraft.tableKind);
    setSelectedTables(resumeDraft.selectedTables);
    setQuestion(resumeDraft.question);
    recentQuestionExpressionsRef.current = resumeDraft.recentExpressions;
    lastShownQuestionExpressionRef.current = resumeDraft.question.expression;
    lastTableSelectionRef.current =
      resumeDraft.mode === "tables" && resumeDraft.selectedTables.length
        ? `${resumeDraft.tableKind}:${resumeDraft.selectedTables.join(",")}`
        : null;
    setPlayerName(resumeDraft.playerName);
    setAvatarId(resumeDraft.avatarId ?? readAvatarPreference());
    setSessionPoints(resumeDraft.sessionPoints);
    setCorrectCount(resumeDraft.correctCount);
    setWrongCount(resumeDraft.wrongCount);
    setElapsedSeconds(resumeDraft.elapsedSeconds);
    setTestStep(resumeDraft.testStep);
    setTestCorrect(resumeDraft.testCorrect);
    setTestDurationSeconds(resumeDraft.testDurationSeconds ?? 120);
    setTestSecondsRemaining(
      resumeDraft.testSecondsRemaining ?? resumeDraft.testDurationSeconds ?? 120
    );
    testEndsAtRef.current =
      resumeDraft.mode === "test" && resumeDraft.screen === "game"
        ? Date.now() +
          (resumeDraft.testSecondsRemaining ??
            resumeDraft.testDurationSeconds ??
            120) *
            1000
        : null;
    testFinalizedRef.current = false;
    setTestTimedOut(false);
    setTestComplete(false);
    setAnswered(null);
    setFeedback("idle");
    pausedStartedAtRef.current = null;
    pausedDurationRef.current = 0;
    setSessionStartedAt(Date.now());
    setScreen(resumeDraft.screen);
    setShowResumeSession(false);
    playSound("launch");
  };

  const discardSavedSession = () => {
    clearSessionDraft();
    setResumeDraft(null);
    setShowResumeSession(false);
  };

  const earnedRewards = rewardsForPoints(sessionPoints);
  const hasSessionPoints = sessionPoints > 0;
  const highestReward = earnedRewards.at(-1);
  const nextThemeBadge = THEME_BADGES.find(
    badge => sessionPoints < badge.threshold
  );
  const pointsUntilNextBadge = nextThemeBadge
    ? nextThemeBadge.threshold - sessionPoints
    : 0;
  const selectedAvatar =
    AVATAR_OPTIONS.find(avatar => avatar.id === avatarId) ?? AVATAR_OPTIONS[0];
  const sessionThemeBadges = THEME_BADGES.filter(badge =>
    themeBadgesForSession(sessionPoints).includes(badge.id)
  );
  const displayedBadgeCollectionIds = Array.from(
    new Set([
      ...collectedThemeBadgeIds,
      ...sessionThemeBadges.map(badge => badge.id),
    ])
  );

  useLayoutEffect(() => {
    window.localStorage.setItem("hana-language", language);
    document.documentElement.lang = language;
    localizeVisibleText(language);
  }, [
    language,
    mode,
    practiceFormat,
    screen,
    showGuide,
    showScorePanel,
    feedback,
    question,
    tableKind,
    selectedTables.length,
    difficulty,
    testComplete,
    testTimedOut,
    testDurationSeconds,
    testSecondsRemaining,
    sessionPoints,
    correctCount,
    wrongCount,
    elapsedSeconds,
    playerName,
    isSavingImage,
    imageSaveStatus,
  ]);

  const saveSessionImage = async () => {
    if (isSavingImage) return;
    setIsSavingImage(true);
    setImageSaveStatus(
      copy(
        "Hana đang tạo ảnh kỷ niệm...",
        "Hana is creating your souvenir image..."
      )
    );
    const downloadSouvenirBlob = async (blob: Blob) => {
      const fileName = `hanh-trinh-hana-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const canUseNativeShare =
        window.matchMedia("(pointer: coarse)").matches &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canUseNativeShare) {
        try {
          await navigator.share({
            title: "Ảnh kỷ niệm cùng Robot Hana",
            text: `Lượt học của ${displayName}`,
            files: [file],
          });
          setImageSaveStatus(
            copy(
              "Bạn có thể chọn Lưu ảnh trong bảng chia sẻ nhé!",
              "Choose Save Image in the share sheet to keep it."
            )
          );
        } catch (error) {
          if ((error as DOMException).name === "AbortError")
            setImageSaveStatus(
              copy(
                "Bạn chưa lưu ảnh. Bấm nút để thử lại nhé.",
                "The image was not saved. Tap the button to try again."
              )
            );
          else throw error;
        }
        return;
      }

      const imageUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      window.setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(imageUrl);
      }, 1000);
      setImageSaveStatus(
        copy(
          "Ảnh đã được gửi vào mục Tải xuống của thiết bị.",
          "The image has been saved to your device downloads."
        )
      );
    };
    const drawRoundedRectangle = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      const corner = Math.min(radius, width / 2, height / 2);
      context.beginPath();
      context.moveTo(x + corner, y);
      context.arcTo(x + width, y, x + width, y + height, corner);
      context.arcTo(x + width, y + height, x, y + height, corner);
      context.arcTo(x, y + height, x, y, corner);
      context.arcTo(x, y, x + width, y, corner);
      context.closePath();
    };
    const drawWrappedText = (
      context: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number
    ) => {
      const words = text.split(" ");
      let line = "";
      let lineY = y;
      words.forEach(word => {
        const nextLine = line ? `${line} ${word}` : word;
        if (context.measureText(nextLine).width > maxWidth && line) {
          context.fillText(line, x, lineY);
          line = word;
          lineY += lineHeight;
        } else {
          line = nextLine;
        }
      });
      if (line) context.fillText(line, x, lineY);
    };

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1440;
    const context = canvas.getContext("2d");
    if (!context) {
      setImageSaveStatus(
        copy(
          "Thiết bị này chưa thể tạo ảnh. Bạn hãy thử lại trên trình duyệt khác nhé.",
          "This device cannot create the image. Please try another browser."
        )
      );
      setIsSavingImage(false);
      return;
    }

    try {
      await document.fonts?.ready;
      const drawOrbit = (
        x: number,
        y: number,
        radiusX: number,
        radiusY: number,
        rotation: number,
        color: string
      ) => {
        context.save();
        context.translate(x, y);
        context.rotate(rotation);
        context.setLineDash([8, 11]);
        context.lineWidth = 2;
        context.strokeStyle = color;
        context.beginPath();
        context.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
        context.stroke();
        context.restore();
      };
      const drawPlanet = (
        x: number,
        y: number,
        radius: number,
        lightColor: string,
        deepColor: string,
        withRing = false
      ) => {
        context.save();
        context.shadowColor = "rgba(2, 6, 37, .36)";
        context.shadowBlur = 22;
        context.shadowOffsetY = 10;
        const fill = context.createRadialGradient(
          x - radius * 0.32,
          y - radius * 0.35,
          radius * 0.08,
          x,
          y,
          radius
        );
        fill.addColorStop(0, lightColor);
        fill.addColorStop(0.58, deepColor);
        fill.addColorStop(1, "#242b70");
        context.fillStyle = fill;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.shadowColor = "transparent";
        context.fillStyle = "rgba(255,255,255,.18)";
        context.beginPath();
        context.arc(
          x - radius * 0.25,
          y - radius * 0.28,
          radius * 0.25,
          0,
          Math.PI * 2
        );
        context.fill();
        if (withRing) {
          context.strokeStyle = "rgba(255,255,255,.55)";
          context.lineWidth = 5;
          context.beginPath();
          context.ellipse(
            x,
            y,
            radius * 1.44,
            radius * 0.48,
            -0.32,
            0,
            Math.PI * 2
          );
          context.stroke();
        }
        context.restore();
      };
      const drawHana = (x: number, y: number) => {
        context.save();
        context.translate(x, y);
        context.strokeStyle = "#6de0c8";
        context.lineWidth = 7;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(0, -57);
        context.lineTo(-8, -82);
        context.stroke();
        context.fillStyle = "#ffbd72";
        context.beginPath();
        context.arc(-10, -84, 7, 0, Math.PI * 2);
        context.fill();
        context.shadowColor = "rgba(10, 17, 72, .45)";
        context.shadowBlur = 16;
        context.shadowOffsetY = 8;
        const body = context.createLinearGradient(-54, -50, 54, 52);
        body.addColorStop(0, "#fff9d6");
        body.addColorStop(1, "#a7f3df");
        context.fillStyle = body;
        drawRoundedRectangle(context, -61, -52, 122, 104, 46);
        context.fill();
        context.shadowColor = "transparent";
        context.fillStyle = "#202d6d";
        drawRoundedRectangle(context, -42, -25, 84, 48, 22);
        context.fill();
        context.fillStyle = "#fff8c9";
        context.beginPath();
        context.arc(-17, -1, 6, 0, Math.PI * 2);
        context.arc(17, -1, 6, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "#ff9c70";
        context.lineWidth = 4;
        context.beginPath();
        context.arc(0, 8, 11, 0.15, Math.PI - 0.15);
        context.stroke();
        context.fillStyle = "rgba(34, 73, 133, .2)";
        context.beginPath();
        context.ellipse(0, 62, 60, 12, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      };
      const drawCanvasPlayerAvatar = (x: number, y: number, radius: number) => {
        const style = PLAYER_AVATAR_STYLES[selectedAvatar.id];
        context.save();
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.clip();
        context.fillStyle = style.accent;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        context.fillStyle = style.suit;
        context.beginPath();
        context.arc(x, y + radius * 0.85, radius * 0.92, Math.PI, Math.PI * 2);
        context.fill();
        context.fillStyle = style.skin;
        context.beginPath();
        context.arc(x, y - radius * 0.06, radius * 0.43, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = style.hair;
        context.beginPath();
        context.arc(x, y - radius * 0.33, radius * 0.43, Math.PI, Math.PI * 2);
        context.fill();
        if (style.hairstyle === "pigtails") {
          context.beginPath();
          context.arc(x - radius * 0.48, y - radius * 0.06, radius * 0.2, 0, Math.PI * 2);
          context.arc(x + radius * 0.48, y - radius * 0.06, radius * 0.2, 0, Math.PI * 2);
          context.fill();
        }
        context.fillStyle = "#202343";
        context.beginPath();
        context.arc(x - radius * 0.16, y - radius * 0.04, radius * 0.05, 0, Math.PI * 2);
        context.arc(x + radius * 0.16, y - radius * 0.04, radius * 0.05, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "#a84f57";
        context.lineWidth = radius * 0.05;
        context.lineCap = "round";
        context.beginPath();
        context.arc(x, y + radius * 0.15, radius * 0.14, 0.2, Math.PI - 0.2);
        context.stroke();
        context.restore();
      };
      const background = context.createLinearGradient(0, 0, 1080, 1350);
      background.addColorStop(0, "#172b78");
      background.addColorStop(0.58, "#101c5d");
      background.addColorStop(1, "#281557");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "rgba(255,255,255,0.34)";
      for (let index = 0; index < 72; index += 1) {
        context.beginPath();
        context.arc(
          ((index * 137) % 1050) + 16,
          ((index * 71) % 1320) + 14,
          index % 5 === 0 ? 3 : 1.5,
          0,
          Math.PI * 2
        );
        context.fill();
      }
      drawOrbit(540, 205, 454, 124, -0.08, "rgba(160, 221, 255, .3)");
      drawOrbit(540, 208, 334, 92, 0.18, "rgba(122, 238, 209, .24)");
      drawPlanet(104, 210, 54, "#ffd7ac", "#ed8778", true);
      drawPlanet(976, 210, 54, "#e7ddff", "#a99be5", true);
      drawPlanet(960, 1350, 52, "#d7fff2", "#5bcbb3", true);
      context.save();
      context.translate(540, 210);
      context.scale(0.7, 0.7);
      drawHana(0, 0);
      context.restore();

      context.fillStyle = "#d8fff2";
      context.font = "800 20px Be Vietnam Pro, Trebuchet MS, sans-serif";
      context.textAlign = "center";
      context.fillText(
        copy("THẺ KỶ NIỆM CHUYẾN BAY", "FLIGHT SOUVENIR CARD"),
        540,
        70
      );
      context.fillStyle = "#fff9e3";
      context.font = "800 52px Baloo 2, Trebuchet MS, sans-serif";
      context.fillText(copy("Học Toán Cùng Hana", "Learn Math with Hana"), 540, 126);

      context.shadowColor = "rgba(1, 8, 49, .34)";
      context.shadowBlur = 28;
      context.shadowOffsetY = 14;
      context.fillStyle = "#fffaf0";
      drawRoundedRectangle(context, 66, 310, 948, 1000, 42);
      context.fill();
      context.shadowColor = "transparent";

      context.fillStyle = "#dff9f4";
      drawRoundedRectangle(context, 98, 350, 884, 210, 30);
      context.fill();
      drawCanvasPlayerAvatar(220, 455, 82);
      context.lineWidth = 7;
      context.strokeStyle = "#ffffff";
      context.beginPath();
      context.arc(220, 455, 85, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = "#1a2b67";
      context.font = "800 42px Baloo 2, sans-serif";
      context.textAlign = "left";
      context.fillText(displayName, 360, 435);
      context.fillStyle = "#267b72";
      context.font = "800 18px Be Vietnam Pro, sans-serif";
      context.fillText(copy("AVATAR CỦA BẠN", "YOUR AVATAR"), 360, 470);
      context.fillStyle = "#63759a";
      context.font = "700 20px Be Vietnam Pro, sans-serif";
      drawWrappedText(
        context,
        isTimedTestSummary
          ? copy(
              "Bạn đã hoàn thành Bài kiểm tra tính giờ.",
              "You completed the timed test."
            )
          : copy(
              "Bạn đã hoàn thành một chuyến học thật chăm chỉ cùng Hana!",
              "You completed a thoughtful learning mission with Hana!"
            ),
        360,
        510,
        540,
        28
      );

      const stats = [
        [copy("Điểm", "Points"), `${sessionPoints}`],
        [copy("Đúng", "Correct"), `${correctCount}`],
        [copy("Sai", "Incorrect"), `${wrongCount}`],
        [copy("Thời gian", "Time"), formatDuration(currentDuration())],
      ];
      stats.forEach(([label, value], index) => {
        const x = 98 + index * 221;
        context.fillStyle = index === 0 ? "#fff1c8" : "#eef5ff";
        drawRoundedRectangle(context, x, 600, 201, 152, 24);
        context.fill();
        context.fillStyle = index === 0 ? "#a0692f" : "#5e709b";
        context.font = "800 18px Be Vietnam Pro, sans-serif";
        context.textAlign = "center";
        context.fillText(label, x + 100, 644);
        context.fillStyle = "#27316d";
        context.font = "800 47px Baloo 2, sans-serif";
        context.fillText(value, x + 100, 708);
      });

      context.fillStyle = "#fff4cf";
      drawRoundedRectangle(context, 98, 790, 884, 190, 30);
      context.fill();
      context.fillStyle = "#a66f2d";
      context.font = "800 18px Be Vietnam Pro, sans-serif";
      context.textAlign = "left";
      context.fillText(copy("PHẦN THƯỞNG CAO NHẤT", "HIGHEST REWARD"), 138, 838);
      const badgeFill = context.createRadialGradient(188, 896, 8, 188, 896, 58);
      badgeFill.addColorStop(0, "#fffbe0");
      badgeFill.addColorStop(0.64, "#ffd66d");
      badgeFill.addColorStop(1, "#ec9a48");
      context.fillStyle = badgeFill;
      context.beginPath();
      context.arc(188, 896, 58, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#8a4211";
      context.font = "800 45px Baloo 2, sans-serif";
      context.textAlign = "center";
      context.fillText(highestReward?.symbol ?? "✦", 188, 912);
      context.fillStyle = "#29316c";
      context.font = "800 31px Baloo 2, sans-serif";
      context.textAlign = "left";
      drawWrappedText(
        context,
        highestReward
          ? `${language === "en" ? "Level" : "Cấp"} ${highestReward.level} · ${rewardLabel(highestReward)}`
          : copy("Phần thưởng đầu tiên đang chờ bạn!", "Your first reward is waiting!"),
        286,
        886,
        620,
        38
      );
      context.fillStyle = "#756d8d";
      context.font = "700 18px Be Vietnam Pro, sans-serif";
      drawWrappedText(
        context,
        highestReward
          ? rewardDetail(highestReward)
          : copy(
              "Hãy làm thêm vài phép tính để mở phần thưởng nhé!",
              "Solve a few more questions to unlock a reward!"
            ),
        286,
        940,
        620,
        27
      );

      const earnedBadges = sessionThemeBadges;
      context.fillStyle = "#32417c";
      context.font = "800 18px Be Vietnam Pro, sans-serif";
      context.textAlign = "left";
      context.fillText(copy("BỘ SƯU TẬP HUY HIỆU", "BADGE COLLECTION"), 98, 1034);
      const badgeColors: Record<ThemeBadge["accent"], string> = {
        coral: "#ffae95",
        lavender: "#cfc3ff",
        mint: "#a8f1dc",
        gold: "#ffe27c",
      };
      const displayedBadges = THEME_BADGES;
      displayedBadges.forEach((badge, index) => {
        const isEarned = earnedBadges.some(earnedBadge => earnedBadge.id === badge.id);
        const x = 98 + (index % 2) * 442;
        const y = 1062 + Math.floor(index / 2) * 108;
        context.fillStyle = isEarned ? "#eef5ff" : "#f3f0f7";
        drawRoundedRectangle(context, x, y, 410, 92, 22);
        context.fill();
        context.fillStyle = isEarned ? badgeColors[badge.accent] : "#d7d9e1";
        context.beginPath();
        context.arc(x + 44, y + 46, 25, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#29316c";
        context.font = "800 26px Baloo 2, sans-serif";
        context.textAlign = "center";
        context.fillText(badge.symbol, x + 44, y + 55);
        context.fillStyle = "#33416f";
        context.font = "800 15px Be Vietnam Pro, sans-serif";
        context.textAlign = "left";
        const badgeName = language === "en" ? badge.en.label : badge.vi.label;
        context.fillText(`${copy("Cấp", "Level")} ${badge.threshold / 10}`, x + 84, y + 30);
        drawWrappedText(context, badgeName, x + 84, y + 55, 290, 19);
      });
      context.fillStyle = "#b9c8ef";
      context.font = "700 17px Be Vietnam Pro, sans-serif";
      context.textAlign = "center";
      context.fillText(
        copy("Hana luôn sẵn sàng bay cùng bạn ở chuyến học tiếp theo!", "Hana is ready for your next learning flight!"),
        540,
        1384
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          imageBlob =>
            imageBlob
              ? resolve(imageBlob)
              : reject(new Error("Không thể tạo tệp PNG")),
          "image/png"
        );
      });
      await downloadSouvenirBlob(blob);
    } catch (error) {
      console.error("Không thể lưu ảnh kỷ niệm", error);
      setImageSaveStatus(
        copy(
          "Hana chưa thể lưu ảnh. Bạn hãy thử lại nhé.",
          "Hana could not save the image. Please try again."
        )
      );
    } finally {
      setIsSavingImage(false);
    }
  };

  const isTableMode = mode === "tables";
  const hasSelectedTables = selectedTables.length > 0;
  const hasAllTables = selectedTables.length === TIMES_TABLES.length;
  const activeActivity = activityMeta[selectedActivity];
  const operationSymbol: Record<Operation, string> = {
    add: "+",
    subtract: "−",
    multiply: "×",
    divide: "÷",
  };
  const isTimedTestSummary = mode === "test" && selectedActivity === "test";
  const testLevelLabel =
    language === "en"
      ? (
          {
            easy: "Getting started",
            medium: "Confident",
            challenge: "Explorer",
          } as const
        )[difficulty]
      : difficultyMeta[difficulty].label;

  return (
    <main className="game-shell">
      <canvas
        ref={canvasRef}
        className={webglUnavailable ? "game-canvas is-hidden" : "game-canvas"}
        aria-label={copy("Không gian trò chơi toán học", "Math game space")}
      />
      {webglUnavailable && (
        <div className="space-fallback" aria-hidden="true">
          <span className="fallback-planet coral" />
          <span className="fallback-planet lavender" />
          <span className="fallback-planet mint" />
          <span className="fallback-orbit one" />
          <span className="fallback-orbit two" />
          <span className="fallback-stars">✦ · ✧ · ★ · ✦ · ✧</span>
        </div>
      )}
      <div className="space-atmosphere" aria-hidden="true" />
      <button
        className="app-home-brand mini-brand"
        type="button"
        data-i18n-direct
        onClick={requestHome}
        aria-label={
          language === "en"
            ? "Return to the start and reset this learning session"
            : "Quay về màn đầu và làm mới lượt học"
        }
      >
        <span className="mini-brand-rocket">
          <Rocket size={19} fill="currentColor" />
        </span>
        <GameBrand language={language} />
      </button>
      {screen !== "summary" &&
        !showGuide &&
        !showScorePanel &&
        !showEndSessionConfirm &&
        !showHomeConfirm &&
        !activePlanetUnlock && (
        <div className="app-settings-dock" data-i18n-direct>
          <AppSettings
            language={language}
            onLanguageToggle={() =>
              setLanguage(current => (current === "vi" ? "en" : "vi"))
            }
            onGuide={() => {
              playSound("tap");
              setShowGuide(true);
            }}
            enabled={soundEnabled}
            onSoundToggle={toggleSound}
            onSettingsOpen={() => playSound("tap")}
            musicVolume={musicVolume}
            effectsVolume={effectsVolume}
            onMusicVolumeChange={changeMusicVolume}
            onEffectsVolumeChange={changeEffectsVolume}
            defaultOpen={isSoundSettingsDemo}
          />
        </div>
      )}

      <AlertDialog open={showHomeConfirm} onOpenChange={setShowHomeConfirm}>
        <AlertDialogContent
          className={`home-confirm-card ${hasSessionPoints ? "has-points" : "no-points"}`}
          data-i18n-direct
          aria-describedby="home-confirm-description"
        >
          <div className="home-confirm-rocket" aria-hidden="true">
            {hasSessionPoints ? <Trophy size={30} fill="currentColor" /> : <Rocket size={30} fill="currentColor" />}
          </div>
          <p className="end-session-confirm-kicker">
            {hasSessionPoints
              ? copy("ĐIỂM CỦA BẠN", "YOUR POINTS")
              : copy("QUAY VỀ MÀN HÌNH ĐẦU", "RETURN TO THE START")}
          </p>
          <AlertDialogTitle>
            {hasSessionPoints
              ? copy(
                  `Bạn có chắc muốn bỏ ${sessionPoints} điểm của lượt này không?`,
                  `Are you sure you want to discard this session's ${sessionPoints} points?`
                )
              : copy(
                  "Bạn muốn trở lại từ đầu không?",
                  "Would you like to return to the beginning?"
                )}
          </AlertDialogTitle>
          <AlertDialogDescription id="home-confirm-description">
            {hasSessionPoints
              ? copy(
                  "Điểm và tiến độ của lượt này sẽ được làm mới. Hana sẽ đưa bạn về màn hình đầu tiên.",
                  "This session's points and progress will reset. Hana will take you to the first screen."
                )
              : copy(
                  "Hana sẽ đưa bạn về màn hình đầu tiên để bắt đầu một chuyến học mới.",
                  "Hana will take you to the first screen to begin a new learning journey."
                )}
          </AlertDialogDescription>
          <div className="home-confirm-actions">
            <AlertDialogCancel onClick={() => setShowHomeConfirm(false)}>
              {hasSessionPoints
                ? copy("Không, học tiếp", "No, keep learning")
                : copy("Ở lại đây", "Stay here")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={returnHomeAndReset}>
              {hasSessionPoints
                ? copy("Đồng ý, bỏ điểm", "Yes, discard points")
                : copy("Đồng ý, về đầu", "Yes, return to start")}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showResumeSession}
        onOpenChange={open => {
          if (!open) discardSavedSession();
        }}
      >
        <AlertDialogContent
          className="resume-session-card"
          aria-describedby="resume-session-description"
        >
          <div className="resume-session-hana" aria-hidden="true">
            <div className="robot-fallback">
              <span />
              <span />
              <i />
            </div>
          </div>
          <p className="end-session-confirm-kicker">
            {copy("ROBOT HANA ĐÃ GIỮ LẠI", "ROBOT HANA KEPT")}
          </p>
          <AlertDialogTitle>
            {copy(
              "Lượt học trước của bạn vẫn ở đây!",
              "Your previous learning session is still here!"
            )}
          </AlertDialogTitle>
          <AlertDialogDescription id="resume-session-description">
            {copy(
              "Bạn muốn tiếp tục đúng nơi mình đang học, hay bắt đầu một lượt mới?",
              "Would you like to continue where you were, or begin a new session?"
            )}
          </AlertDialogDescription>
          {resumeDraft && (
            <div
              className="resume-session-stats"
              aria-label={copy("Tiến độ đã lưu", "Saved progress")}
            >
              <div>
                <span>{copy("Điểm", "Points")}</span>
                <strong>{resumeDraft.sessionPoints}</strong>
              </div>
              <div>
                <span>{copy("Đúng", "Correct")}</span>
                <strong>{resumeDraft.correctCount}</strong>
              </div>
              <div>
                <span>{copy("Thời gian", "Time")}</span>
                <strong>{formatDuration(resumeDraft.elapsedSeconds)}</strong>
              </div>
            </div>
          )}
          <div className="resume-session-actions">
            <AlertDialogCancel
              className="resume-session-new"
              onClick={discardSavedSession}
            >
              {copy("Lượt mới", "New session")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="resume-session-continue"
              onClick={resumeSavedSession}
            >
              {copy("Học tiếp", "Continue learning")} <ChevronRight size={18} />
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {screen === "welcome" && (
        <WelcomeScreen
          onStart={() => {
            playSound("launch");
            setScreen("profile");
          }}
          onGuide={() => {
            playSound("tap");
            setShowGuide(true);
          }}
          language={language}
        />
      )}
      {screen === "profile" && (
        <PlayerProfileScreen
          name={playerName}
          onNameChange={setPlayerName}
          avatarId={avatarId}
          onAvatarChange={setAvatarId}
          onBack={() => setScreen("welcome")}
          onContinue={() => {
            playSound("launch");
            setScreen("menu");
          }}
          language={language}
        />
      )}
      {screen === "menu" && (
        <StartModeScreen
          onBack={() => setScreen("welcome")}
          onPractice={() => {
            playSound("launch");
            setScreen("activities");
          }}
          onTest={() => {
            playSound("launch");
            setSelectedActivity("test");
            setMode("test");
            setTestTimedOut(false);
            setTestComplete(false);
            setScreen("testsetup");
          }}
          language={language}
        />
      )}
      {screen === "activities" && (
        <ActivityMenu
          onBack={() => setScreen("menu")}
          onChoose={startActivity}
          language={language}
        />
      )}
      {screen === "format" && (
        <PracticeFormatScreen
          operation={operation}
          playerName={displayName}
          onBack={() => setScreen("activities")}
          onStart={beginPractice}
          language={language}
        />
      )}
      {screen === "testsetup" && (
        <TestSetupScreen
          difficulty={difficulty}
          durationSeconds={testDurationSeconds}
          onDifficultyChange={setDifficulty}
          onDurationChange={setTestDurationSeconds}
          onBack={() => setScreen("menu")}
          onStart={beginTimedTest}
          language={language}
        />
      )}
      {screen === "summary" && (
        <section
          className="summary-screen"
          data-i18n-direct
          aria-label={copy("Tổng kết lượt chơi", "Learning session summary")}
        >
          <div className="summary-orbit" aria-hidden="true" />
          <div className="summary-journey" aria-hidden="true">
            <i className="add">+</i>
            <i className="subtract">−</i>
            <i className="multiply">×</i>
            <i className="divide">÷</i>
          </div>
          <div className="summary-stars" aria-hidden="true">
            <span>✦</span>
            <span>★</span>
            <span>✦</span>
          </div>
          <div className="summary-robot">
            <div className="robot-fallback">
              <span />
              <span />
              <i />
            </div>
          </div>
          <p className="summary-kicker">
            {isTimedTestSummary
              ? testTimedOut
                ? copy("HẾT GIỜ RỒI", "TIME IS UP")
                : copy("KẾT QUẢ BÀI KIỂM TRA", "TEST RESULTS")
              : language === "en"
                ? "ROBOT HANA CONGRATULATES"
                : "ROBOT HANA CHÚC MỪNG"}{" "}
            {displayName.toUpperCase()}
          </p>
          <h2>
            {isTimedTestSummary ? (
              language === "en" ? (
                <>
                  Your timed test,
                  <br />
                  <em>{displayName}, is complete!</em>
                </>
              ) : (
                <>
                  Bài kiểm tra của
                  <br />
                  <em>{displayName} đã hoàn thành!</em>
                </>
              )
            ) : language === "en" ? (
              <>
                Your learning session, {displayName}
                <br />
                <em>is something to be proud of!</em>
              </>
            ) : (
              <>
                Lượt học của {displayName}
                <br />
                <em>thật đáng tự hào!</em>
              </>
            )}
          </h2>
          <div className="summary-player-identity">
            <PlayerAvatar avatarId={selectedAvatar.id} decorative />
            <span>{copy("Người chơi", "Player")}</span>
            <strong>{displayName}</strong>
          </div>
          <p className="summary-intro">
            {isTimedTestSummary
              ? language === "en"
                ? `${displayName}, you kept working until the timer reached zero. Great focus!`
                : `${displayName}, bạn đã kiên trì làm bài đến khi đồng hồ về 0. Thật tập trung!`
              : language === "en"
                ? `${displayName}, whether right or wrong, you kept going through a session with Hana.`
                : `${displayName}, dù đúng hay sai, bạn đã kiên trì hoàn thành một chuyến luyện cùng Hana.`}
          </p>
          {isTimedTestSummary && (
            <div
              className="test-summary-settings"
              aria-label={copy("Thiết lập bài kiểm tra", "Test settings")}
            >
              <span>
                <Clock3 size={15} /> {copy("Thời gian", "Time")}:{" "}
                <b>{formatDuration(testDurationSeconds)}</b>
              </span>
              <span>
                <Star size={15} /> {copy("Cấp độ", "Level")}:{" "}
                <b>{testLevelLabel}</b>
              </span>
            </div>
          )}
          <div className="summary-stats">
            <div>
              <span>{copy("Điểm", "Points")}</span>
              <strong data-dynamic-text>{sessionPoints}</strong>
            </div>
            <div>
              <span>{copy("Đúng", "Correct")}</span>
              <strong data-dynamic-text>{correctCount}</strong>
            </div>
            <div>
              <span>{copy("Sai", "Incorrect")}</span>
              <strong data-dynamic-text>{wrongCount}</strong>
            </div>
            <div>
              <span>{copy("Thời gian", "Time")}</span>
              <strong data-dynamic-text>
                {formatDuration(elapsedSeconds)}
              </strong>
            </div>
          </div>
          <section
            className="reward-board highest-reward-board"
            aria-label={copy(
              "Mốc hành trình cao nhất trong lượt chơi",
              "Highest journey level from this session"
            )}
          >
            <div className="reward-board-heading">
              <span>{copy("MỐC HÀNH TRÌNH CAO NHẤT", "HIGHEST JOURNEY LEVEL")}</span>
              <strong>
                {earnedRewards.length
                  ? `${copy("Cấp", "Level")} ${highestReward?.level}/${sessionRewards.length}`
                  : copy("Chưa có điểm", "No points yet")}
              </strong>
            </div>
            {highestReward ? (
              <div className="highest-reward">
                <b>{highestReward.symbol}</b>
                <span>
                  <small>
                    {language === "en"
                      ? "HANA CONGRATULATES"
                      : "HANA CHÚC MỪNG"}{" "}
                    {displayName.toUpperCase()}
                  </small>
                  <strong>{rewardLabel(highestReward)}</strong>
                  <em>{rewardDetail(highestReward)}</em>
                </span>
              </div>
            ) : (
              <p className="reward-empty">
                {language === "en"
                  ? `${displayName}, solve a few questions to begin your journey.`
                  : `${displayName}, hãy làm vài phép tính để bắt đầu hành trình nhé.`}
              </p>
            )}
          </section>
          <section
            className="theme-badge-section"
            aria-label={copy(
              "Huy hiệu theo chủ đề trong lượt này",
              "Theme badges earned this session"
            )}
          >
            <div className="theme-badge-heading">
              <span>
                {copy("BỘ SƯU TẬP HUY HIỆU", "THEME BADGE COLLECTION")}
                <small>{copy("Cấp 20 · 60 · 80 · 100", "Levels 20 · 60 · 80 · 100")}</small>
              </span>
              <strong>
                {displayedBadgeCollectionIds.length}/{THEME_BADGES.length}
              </strong>
            </div>
            <div className="collectible-operation-route is-summary" aria-hidden="true">
              <i className="add">+</i><i className="subtract">−</i><i className="multiply">×</i><i className="divide">÷</i>
            </div>
            <div className="theme-badge-row" role="list">
              {THEME_BADGES.map(badge => {
                const badgeCopy = language === "en" ? badge.en : badge.vi;
                const isCollected = displayedBadgeCollectionIds.includes(badge.id);
                const isEarnedThisSession = sessionThemeBadges.some(
                  earnedBadge => earnedBadge.id === badge.id
                );
                return (
                  <article
                    key={badge.id}
                    className={`theme-badge-item accent-${badge.accent} ${isCollected ? "is-collected" : "is-locked"}`}
                    role="listitem"
                  >
                    <b aria-hidden="true">{badge.symbol}</b>
                    <span>
                      <small className="theme-badge-level">
                        {copy("Cấp", "Level")} {badge.threshold / 10}
                        {isEarnedThisSession
                          ? ` · ${copy("Mới nhận", "New")}`
                          : ""}
                      </small>
                      <strong>{badgeCopy.label}</strong>
                      <small>{badgeCopy.detail}</small>
                    </span>
                  </article>
                );
              })}
            </div>
          </section>
          <div className="summary-actions">
            <button
              type="button"
              className="save-memory"
              data-dynamic-text
              onClick={saveSessionImage}
              disabled={isSavingImage}
            >
              {isSavingImage
                ? copy("Đang tạo ảnh...", "Creating image...")
                : copy("Lưu ảnh kỷ niệm", "Save souvenir image")}{" "}
              <Sparkles size={18} />
            </button>
            <button
              type="button"
              className="summary-again"
              onClick={() => {
                setSessionStartedAt(null);
                setScreen("menu");
              }}
            >
              {copy("Chơi lượt mới", "Start a new session")}{" "}
              <Rocket size={18} />
            </button>
          </div>
          {imageSaveStatus && (
            <p className="image-save-status" data-dynamic-text role="status">
              {imageSaveStatus}
            </p>
          )}
        </section>
      )}

      {activePlanetUnlock && (
        <div
          className="planet-unlock-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={copy("Mở khóa hành tinh", "Planet unlocked")}
        >
          <button
            type="button"
            className="planet-unlock-dismiss"
            onClick={() => setPlanetUnlock(null)}
          >
            {copy("Chạm để tiếp tục", "Tap to continue")}
          </button>
          <div className="planet-unlock-card">
            <div className="planet-unlock-sparkles" aria-hidden="true">
              <i>✦</i><i>★</i><i>✦</i><i>·</i><i>★</i>
            </div>
            <div
              className={`planet-unlock-orb operation-${activePlanetUnlock.operation}`}
              aria-hidden="true"
            >
              {activePlanetUnlock.operation === "add"
                ? "+"
                : activePlanetUnlock.operation === "subtract"
                  ? "−"
                  : activePlanetUnlock.operation === "multiply"
                    ? "×"
                    : "÷"}
            </div>
            <p>{copy("HANA VỪA MỞ KHÓA", "HANA JUST UNLOCKED")}</p>
            <h2>
              {language === "en"
                ? UNLOCKED_PLANET_NAMES[activePlanetUnlock.operation].en
                : UNLOCKED_PLANET_NAMES[activePlanetUnlock.operation].vi}
            </h2>
            <div className={`planet-unlock-badge accent-${activePlanetUnlock.badge.accent}`}>
              <b aria-hidden="true">{activePlanetUnlock.badge.symbol}</b>
              <span>
                <strong>
                  {language === "en"
                    ? activePlanetUnlock.badge.en.label
                    : activePlanetUnlock.badge.vi.label}
                </strong>
                <small>
                  {copy(
                    "Huy hiệu chủ đề đã vào bộ sưu tập của bạn!",
                    "A theme badge has joined your collection!"
                  )}
                </small>
              </span>
            </div>
          </div>
        </div>
      )}

      {screen === "game" && (
        <>
          <div
            className={`mission-orbit-map operation-${operation}`}
            aria-hidden="true"
          >
            <span className="mission-orbit-ring ring-one" />
            <span className="mission-orbit-ring ring-two" />
            <span className="mission-orbit-node add">+</span>
            <span className="mission-orbit-node subtract">−</span>
            <span className="mission-orbit-node multiply">×</span>
            <span className="mission-orbit-node divide">÷</span>
            <span className="mission-orbit-status">
              {language === "en"
                ? `${operationLabel(operation).toUpperCase()} PLANET`
                : `HÀNH TINH ${operationLabel(operation).toUpperCase()}`}
            </span>
          </div>

          <section
            className={`mission-control operation-${operation}`}
            aria-label={copy(
              "Bảng điều khiển bài tập",
              "Exercise control panel"
            )}
          >
            <div className="console-topline">
              <div className="console-title">
                <p data-dynamic-text>
                  {isTableMode
                    ? copy(
                        "Học Bảng Nhân và Bảng Chia",
                        "Multiplication and Division Tables"
                      )
                    : operationLabel(operation)}{" "}
                  <span>•</span>{" "}
                  {isTableMode
                    ? tableSubtitle(tableKind)
                    : mode === "test"
                      ? copy("Bài kiểm tra tính giờ", "Timed test")
                      : practiceFormatName(practiceFormat, language)}
                </p>
                <h3 data-dynamic-text>
                  {testComplete
                    ? copy("Hết giờ rồi!", "Time is up!")
                    : isTableMode && !hasSelectedTables
                      ? copy(
                          "Hãy chọn ít nhất một bảng để bắt đầu.",
                          "Choose at least one table to begin."
                        )
                      : isTableMode
                        ? selectedTables.length === 1
                          ? language === "en"
                            ? `Table ${selectedTables[0]}: ${tableKind === "mixed" ? "mixed mission" : `${tableKind} mission`}.`
                            : `Cùng Hana luyện bảng ${selectedTables[0]} với ${tableLabel(tableKind).toLowerCase()}.`
                          : language === "en"
                            ? `${selectedTables.length}-table ${tableKind === "mixed" ? "mixed" : tableKind} mission.`
                            : `Cùng Hana luyện ${selectedTables.length} bảng với ${tableLabel(tableKind).toLowerCase()}.`
                        : translateLearningText(question.mission, language)}
                </h3>
              </div>
              <button
                className="mission-counter current-score-button"
                data-current-score
                type="button"
                onClick={() => setShowScorePanel(true)}
                aria-label={copy(
                  "Xem điểm hiện tại và tiến độ phần thưởng",
                  "View current points and reward progress"
                )}
              >
                <span data-dynamic-text>
                  {mode === "test"
                    ? copy("Còn lại", "Remaining")
                    : copy("Điểm hiện tại", "Current points")}
                </span>
                <strong data-dynamic-text>
                  {mode === "test"
                    ? formatDuration(testSecondsRemaining)
                    : sessionPoints}
                </strong>
              </button>
            </div>
            <div className="mission-flight-rail" data-i18n-direct>
              <span className={`mission-planet-chip operation-${operation}`}>
                <b aria-hidden="true">
                  {operation === "add"
                    ? "+"
                    : operation === "subtract"
                      ? "−"
                      : operation === "multiply"
                        ? "×"
                        : "÷"}
                </b>
                <span>
                  {language === "en"
                    ? UNLOCKED_PLANET_NAMES[operation].en
                    : UNLOCKED_PLANET_NAMES[operation].vi}
                </span>
              </span>
              <span className="mission-hana-signal">
                <span className="mission-hana-avatar" aria-hidden="true">
                  <span className="robot-fallback">
                    <span />
                    <span />
                    <i />
                  </span>
                </span>
                <span className="mission-hana-label">
                  {copy("Hana sẵn sàng", "Hana is ready")}
                </span>
              </span>
              <span className="mission-reward-signal">
                <Trophy size={14} aria-hidden="true" />
                {mode === "test"
                  ? copy("Chế độ kiểm tra", "Test mode")
                  : `${copy("Mốc huy hiệu", "Badge milestones")} ${sessionThemeBadges.length}/${THEME_BADGES.length}`}
              </span>
            </div>
            {testComplete ? (
              <div className="completion-card">
                <div className="completion-icon">
                  <Trophy size={30} />
                </div>
                <div>
                  <p data-dynamic-text>
                    {copy(
                      "Bạn đã hoàn thành 8 nhiệm vụ!",
                      "You completed 8 missions!"
                    )}
                  </p>
                  <h3 data-dynamic-text>
                    {testCorrect}/8 {copy("câu đúng", "correct answers")} ·{" "}
                    {testCorrect >= 6
                      ? copy("Bay thật giỏi!", "You flew brilliantly!")
                      : copy("Cố gắng rất đáng khen!", "Great effort!")}
                  </h3>
                </div>
                <button
                  type="button"
                  className="primary-action"
                  onClick={finishSession}
                >
                  <span data-dynamic-text>
                    {copy("Xem tổng kết", "View summary")}
                  </span>{" "}
                  <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <>
                {isTableMode && (
                  <section
                    className="table-practice-panel"
                    aria-label={copy(
                      "Chọn bảng cửu chương để luyện",
                      "Choose times tables to practise"
                    )}
                  >
                    <div className="table-panel-heading">
                      <div>
                        <span data-dynamic-text>
                          {copy("BẢNG CỬU CHƯƠNG", "TIMES TABLES")}
                        </span>
                        <strong data-dynamic-text>
                          {tableLabel(tableKind)}
                        </strong>
                      </div>
                      <p data-dynamic-text>
                        {!hasSelectedTables
                          ? copy("Chưa chọn bảng", "No table selected")
                          : selectedTables.length === 1
                            ? language === "en"
                              ? `Practising the ${selectedTables[0]} table`
                              : `Đang luyện bảng ${selectedTables[0]}`
                            : language === "en"
                              ? `${selectedTables.length} tables selected`
                              : `${selectedTables.length} bảng đã chọn`}
                      </p>
                    </div>
                    <div className="table-selection-label">
                      <span data-dynamic-text>
                        {copy("CHỌN KIỂU LUYỆN", "CHOOSE PRACTICE TYPE")}
                      </span>
                      <small data-dynamic-text>
                        {copy(
                          "Chọn nhân, chia hoặc cả hai.",
                          "Choose multiplication, division or both."
                        )}
                      </small>
                    </div>
                    <div
                      className="table-kind-switch"
                      aria-label={copy(
                        "Chọn kiểu bảng cửu chương",
                        "Choose table practice type"
                      )}
                    >
                      {(Object.keys(tableKindMeta) as TablePracticeKind[]).map(
                        kind => (
                          <button
                            key={kind}
                            type="button"
                            data-dynamic-text
                            className={tableKind === kind ? "is-active" : ""}
                            style={
                              {
                                "--table-accent": tableKindMeta[kind].accent,
                              } as React.CSSProperties
                            }
                            onClick={() => changeTableKind(kind)}
                          >
                            {tableLabel(kind)}
                          </button>
                        )
                      )}
                    </div>
                    <div className="table-picker-head">
                      <span data-dynamic-text>
                        {copy(
                          "CHỌN BẢNG TỪ 2 ĐẾN 9",
                          "CHOOSE TABLES 2 TO 9"
                        )}
                      </span>
                      <div className="table-picker-actions">
                        <button
                          type="button"
                          data-dynamic-text
                          onClick={() =>
                            setTablePractice(tableKind, [...TIMES_TABLES])
                          }
                          disabled={hasAllTables}
                        >
                          {copy("Chọn Tất Cả", "Select all")}
                        </button>
                        <button
                          type="button"
                          data-dynamic-text
                          onClick={clearAllTables}
                          disabled={!hasSelectedTables}
                        >
                          {copy("Bỏ Chọn Tất Cả", "Clear all")}
                        </button>
                      </div>
                    </div>
                    <div
                      className="table-number-grid"
                      aria-label={copy("Các bảng từ 2 đến 9", "Tables 2 to 9")}
                    >
                      {TIMES_TABLES.map(table => (
                        <button
                          key={table}
                          type="button"
                          className={
                            selectedTables.includes(table) ? "is-selected" : ""
                          }
                          style={
                            {
                              "--table-accent": tableKindMeta[tableKind].accent,
                            } as React.CSSProperties
                          }
                          aria-pressed={selectedTables.includes(table)}
                          onClick={() => toggleTable(table)}
                        >
                          {table}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {!isTableMode || hasSelectedTables ? (
                  <>
                    <div
                      className="question-panel"
                      key={`prompt-${question.id}`}
                    >
                      <span className="question-label" data-dynamic-text>
                        {isTableMode
                          ? copy(
                              "NHIỆM VỤ BẢNG NHÂN VÀ CHIA",
                              "TIMES-TABLE MISSION"
                            )
                          : question.kind === "missing"
                            ? copy(
                                "TÌM THÀNH PHẦN CHƯA BIẾT",
                                "FIND THE MISSING NUMBER"
                              )
                            : `${copy("NHIỆM VỤ", "MISSION")} ${operationSymbol[operation]} ${operationLabel(operation).toUpperCase()}`}
                      </span>
                      <p className="math-expression" data-dynamic-text>
                        {question.expression}
                      </p>
                      <p className="math-helper" data-dynamic-text>
                        {question.kind === "missing"
                          ? copy(
                              "Tìm số còn thiếu để hoàn thành phép tính.",
                              "Find the missing number to complete the equation."
                            )
                          : copy(
                              "Chọn đáp án đúng để nhận điểm.",
                              "Choose the correct answer to earn points."
                            )}
                      </p>
                    </div>
                    <div
                      className="answer-grid"
                      key={`answers-${question.id}`}
                      aria-label={
                        language === "en"
                          ? `Answers for ${question.expression}`
                          : `Đáp án cho ${question.expression}`
                      }
                    >
                      {question.options.map((choice, index) => {
                        const isChosen = choice === answered;
                        const isCorrect = choice === question.answer;
                        const classNames = [
                          "answer-button",
                          isChosen ? "is-chosen" : "",
                          feedback === "correct" && isCorrect
                            ? "is-correct"
                            : "",
                          feedback === "wrong" && isChosen ? "is-wrong" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <button
                            className={classNames}
                            key={`${question.id}-${choice}`}
                            type="button"
                            onClick={() => answerQuestion(choice)}
                          >
                            <span className="answer-index">{index + 1}</span>
                            <strong data-dynamic-text>{choice}</strong>
                            {feedback === "correct" && isCorrect && (
                              <Check className="answer-status" size={19} />
                            )}
                            {feedback === "wrong" && isChosen && (
                              <X className="answer-status" size={19} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {feedback !== "idle" && (
                      <div
                        className={
                          feedback === "correct"
                            ? "feedback-banner is-correct"
                            : "feedback-banner is-wrong"
                        }
                      >
                        {feedback === "correct" ? (
                          <div>
                            <Check size={18} />
                            <span>
                              {language === "en"
                                ? `Correct, ${displayName}! +10 points.`
                                : `Đúng rồi, ${displayName}! +10 điểm.`}
                            </span>
                          </div>
                        ) : (
                          <div className="hana-hint">
                            <div
                              className="hana-hint-robot"
                              aria-label="Robot Hana đang gợi ý"
                            >
                              <span />
                              <span />
                              <i />
                            </div>
                            <div className="hana-hint-copy">
                              <strong>
                                {language === "en"
                                  ? `Robot Hana's hint for ${displayName}:`
                                  : `Robot Hana gợi ý cho ${displayName}:`}
                              </strong>
                              <span>
                                {language === "en"
                                  ? `That is okay. This try loses 2 points. ${translateLearningText(question.hint, language)}`
                                  : `Chưa sao đâu, lượt này giảm 2 điểm. ${translateLearningText(question.hint, language)}`}
                              </span>
                              <ol>
                                {question.hintSteps.map(step => (
                                  <li key={step}>
                                    {translateLearningText(step, language)}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          className={`feedback-action ${feedback === "correct" ? "is-next" : "is-retry"}`}
                          onClick={continueMission}
                        >
                          {feedback === "correct"
                            ? mode === "test"
                              ? copy("Câu tiếp", "Next question")
                              : copy("Nhiệm vụ tiếp", "Next mission")
                            : mode === "test"
                              ? copy("Câu tiếp", "Next question")
                              : copy("Thử lại", "Try again")}
                          <ChevronRight size={17} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="table-empty-state" data-i18n-direct>
                    <Gem size={25} />
                    <strong>
                      {copy(
                        "Chọn bảng để luyện nhé",
                        "Choose a table to practise"
                      )}
                    </strong>
                    <span>
                      {copy(
                        "Bạn có thể chọn một bảng, nhiều bảng hoặc bấm “Chọn Tất Cả”.",
                        "Choose one table, several tables, or tap Select all."
                      )}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="control-row">
              {!isTableMode && mode !== "test" && (
                <div className="exercise-level-control">
                  <span data-dynamic-text>
                    {copy("CẤP ĐỘ", "LEVEL")}
                  </span>
                  <div
                    className="level-switch"
                    aria-label={copy("Chọn cấp độ", "Choose level")}
                  >
                    {(Object.keys(difficultyMeta) as Difficulty[]).map(key => (
                      <button
                        key={key}
                        type="button"
                        className={difficulty === key ? "is-active" : ""}
                        onClick={() => selectDifficulty(key)}
                      >
                        {difficultyMeta[key].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {!testComplete && (
              <div
                className="session-bottom-actions"
                aria-label={copy("Điều khiển nhiệm vụ", "Mission controls")}
              >
                <button
                  className="session-change-mission"
                  type="button"
                  onClick={() => {
                    playSound("tap");
                    setScreen(mode === "test" ? "menu" : "activities");
                  }}
                >
                  <span>↔</span>
                  {copy("Đổi nhiệm vụ", "Change mission")}
                </button>
                <button
                  className="session-end-button"
                  type="button"
                  onClick={requestEndSession}
                >
                  <span>■</span>
                  {copy("Kết thúc lượt", "End session")}
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {showGuide && (
        <div
          className="guide-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={copy("Hướng dẫn cách chơi", "How to play guide")}
        >
          <section className="guide-card" data-i18n-direct>
            <button
              className="guide-close"
              type="button"
              onClick={() => setShowGuide(false)}
              aria-label={copy("Đóng lộ trình", "Close guide")}
            >
              <X size={19} />
            </button>
            <div className="guide-heading">
              <div>
                <p className="eyebrow">
                  {copy("ROBOT HANA HƯỚNG DẪN", "ROBOT HANA'S GUIDE")}
                </p>
                <h2>{copy("Cách chơi thật dễ", "How to play")}</h2>
                <p>
                  {copy(
                    "Tạo hồ sơ, chọn cách học phù hợp rồi cùng Hana chinh phục từng phép tính nhé.",
                    "Create your profile, choose a learning path and solve each math mission with Hana."
                  )}
                </p>
              </div>
            </div>
            <ol className="curriculum-list">
              <li>
                <span>01</span>
                <div>
                  <strong>
                    {copy("Tạo hồ sơ của bạn", "Create your player profile")}
                  </strong>
                  <p>
                    {copy(
                      "Nhập tên và chọn avatar đại diện cho bạn. Hana sẽ dùng tên của bạn trong nhiệm vụ, lời gợi ý và thẻ kỷ niệm.",
                      "Enter your name and choose an avatar that represents you. Hana uses your name in missions, hints and your souvenir card."
                    )}
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>
                    {copy(
                      "Chọn nhiệm vụ và dạng bài",
                      "Choose a mission and practice type"
                    )}
                  </strong>
                  <p>
                    {copy(
                        "Ở Luyện tập, bạn chọn Cộng, Trừ, Học Bảng Nhân và Bảng Chia, Nhân hoặc Chia. Với bốn phép tính, chọn Bài bình thường, Tìm thành phần hoặc Cả hai. Ở Bài kiểm tra, chọn cấp độ và 2, 5 hoặc 10 phút.",
                        "In Practice, choose Addition, Subtraction, Multiplication and Division Tables, Multiplication or Division. For the four operations, choose Standard, Missing Part or Both. In Test, choose a level and 2, 5 or 10 minutes."
                    )}
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>
                    {copy(
                      "Tính điểm rõ ràng",
                      "Simple, clear scoring"
                    )}
                  </strong>
                  <p>
                    {copy(
                      "Mỗi câu đúng được +10 điểm. Nếu chưa đúng, bạn bị trừ 2 điểm nhưng tổng điểm không bao giờ âm. Bấm Điểm hiện tại để xem điểm, số câu đúng, số câu sai và thời gian học.",
                      "Each correct answer earns +10 points. A wrong answer subtracts 2 points, but your total never goes below zero. Tap Current points to view your score, correct answers, incorrect answers and learning time."
                    )}
                  </p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <strong>
                    {copy("Sưu tập 4 huy hiệu", "Collect 4 milestone badges")}
                  </strong>
                  <p>
                    {copy(
                      "Bốn huy hiệu đặc biệt chờ bạn ở Cấp 20, 60, 80 và 100 — tương ứng 200, 600, 800 và 1.000 điểm. Khi chạm một mốc mới, Hana mở khóa một Hành Tinh Phép Tính.",
                      "Four special badges wait at Levels 20, 60, 80 and 100 — 200, 600, 800 and 1,000 points. When you reach a new milestone, Hana unlocks a Math Operation Planet."
                    )}
                  </p>
                </div>
              </li>
              <li>
                <span>05</span>
                <div>
                  <strong>
                    {copy(
                      "Gợi ý, kết thúc và lưu",
                      "Get hints, finish and save"
                    )}
                  </strong>
                  <p>
                    {copy(
                      "Nếu chọn chưa đúng, Hana sẽ hướng dẫn từng bước để bạn thử lại. Bấm Điểm hiện tại để xem điểm và mốc huy hiệu tiếp theo, Đổi nhiệm vụ để giữ điểm, hoặc Kết thúc lượt để xem tổng kết và lưu ảnh kỷ niệm.",
                      "If an answer is not right yet, Hana gives step-by-step help so you can try again. Tap Current points to view your score and next badge milestone, Change mission to keep your points, or End session to see your summary and save a souvenir image."
                    )}
                  </p>
                </div>
              </li>
            </ol>
            <p className="guide-note">
              {copy(
                "Mỗi lượt học là hành trình của riêng bạn. Hãy bình tĩnh suy nghĩ, thử lại khi cần và cùng Hana chinh phục các mốc huy hiệu nhé.",
                "Each session is your own journey. Think calmly, try again when needed and travel with Hana toward each badge milestone."
              )}
            </p>
            <button
              type="button"
              className="primary-action"
              onClick={() => setShowGuide(false)}
            >
              {copy("Mình đã hiểu", "Got it")} <Rocket size={18} />
            </button>
          </section>
        </div>
      )}

      {showScorePanel && (
        <div
          className="guide-backdrop score-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={copy(
            "Điểm hiện tại và tiến độ huy hiệu",
            "Current points and badge progress"
          )}
        >
          <section className="score-card" data-i18n-direct>
            <button
              className="guide-close"
              type="button"
              onClick={() => setShowScorePanel(false)}
              aria-label={copy("Đóng bảng điểm", "Close points panel")}
            >
              <X size={19} />
            </button>
            <div className="score-card-heading">
              <span className="score-card-symbol">
                {nextThemeBadge?.symbol ?? "♛"}
              </span>
              <div>
                <p className="eyebrow">
                  {copy("TIẾN ĐỘ CỦA", "PROGRESS FOR")}{" "}
                  {displayName.toUpperCase()}
                </p>
                <h2>{copy("Điểm hiện tại", "Current points")}</h2>
                <p>
                  {nextThemeBadge
                    ? language === "en"
                      ? `${pointsUntilNextBadge} points until ${nextThemeBadge.en.label}.`
                      : `Còn ${pointsUntilNextBadge} điểm để đạt ${nextThemeBadge.vi.label}.`
                    : copy(
                        "Bạn đã sưu tập đủ 4 huy hiệu đặc biệt rồi!",
                        "You have collected all 4 special badges!"
                      )}
                </p>
              </div>
            </div>
            <div className="score-stats">
              <div>
                <span>{copy("Điểm", "Points")}</span>
                <strong data-dynamic-text>{sessionPoints}</strong>
              </div>
              <div>
                <span>{copy("Đúng", "Correct")}</span>
                <strong data-dynamic-text>{correctCount}</strong>
              </div>
              <div>
                <span>{copy("Sai", "Incorrect")}</span>
                <strong data-dynamic-text>{wrongCount}</strong>
              </div>
              <div>
                <span>{copy("Thời gian", "Time")}</span>
                <strong data-dynamic-text>
                  {formatDuration(currentDuration())}
                </strong>
              </div>
            </div>
            <section
              className="score-badge-board"
              aria-label={copy("Tiến độ huy hiệu", "Badge progress")}
            >
              <div>
                <span>{copy("TIẾN ĐỘ HUY HIỆU", "BADGE PROGRESS")}</span>
                <strong>
                  {sessionThemeBadges.length}/{THEME_BADGES.length}
                </strong>
              </div>
              <div className="score-badge-list">
                {THEME_BADGES.map(badge => {
                  const badgeCopy = language === "en" ? badge.en : badge.vi;
                  const isEarned = sessionThemeBadges.some(
                    earnedBadge => earnedBadge.id === badge.id
                  );
                  return (
                    <span className={isEarned ? "is-earned" : ""} key={badge.id}>
                      <b>{badge.symbol}</b>
                      <em>{copy("Cấp", "Level")} {badge.threshold / 10}</em>
                      <small>{badgeCopy.label}</small>
                    </span>
                  );
                })}
              </div>
            </section>
            <button
              type="button"
              className="primary-action score-continue"
              onClick={() => setShowScorePanel(false)}
            >
              {copy("Quay lại chơi tiếp", "Keep learning")} <Rocket size={18} />
            </button>
          </section>
        </div>
      )}

      <AlertDialog
        open={showEndSessionConfirm}
        onOpenChange={setShowEndSessionConfirm}
      >
        <AlertDialogContent
          className="end-session-confirm-card"
          aria-describedby="end-session-confirm-description"
        >
          <div className="end-session-confirm-hana" aria-hidden="true">
            <div className="robot-fallback">
              <span />
              <span />
              <i />
            </div>
          </div>
          <p className="end-session-confirm-kicker">
            {copy("ROBOT HANA HỎI BẠN", "ROBOT HANA ASKS")}
          </p>
          <AlertDialogTitle>
            {copy(
              "Bạn muốn kết thúc lượt học không?",
              "Would you like to end this learning session?"
            )}
          </AlertDialogTitle>
          <AlertDialogDescription id="end-session-confirm-description">
            {copy(
              "Hana sẽ lưu kết quả hiện tại và đưa bạn đến màn tổng kết.",
              "Hana will save your current results and take you to the session summary."
            )}
          </AlertDialogDescription>
          <div
            className="end-session-confirm-stats"
            aria-label={copy("Kết quả hiện tại", "Current results")}
          >
            <div>
              <span>{copy("Điểm", "Points")}</span>
              <strong data-dynamic-text>{sessionPoints}</strong>
            </div>
            <div>
              <span>{copy("Đúng", "Correct")}</span>
              <strong data-dynamic-text>{correctCount}</strong>
            </div>
            <div>
              <span>{copy("Sai", "Incorrect")}</span>
              <strong data-dynamic-text>{wrongCount}</strong>
            </div>
          </div>
          <div className="end-session-confirm-actions">
            <AlertDialogCancel className="end-session-confirm-cancel">
              {copy("Quay lại học tiếp", "Keep learning")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="end-session-confirm-action"
              onClick={finishSession}
            >
              {copy("Kết thúc lượt", "End session")} <ChevronRight size={18} />
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
