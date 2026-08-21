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
import html2canvas from "html2canvas";
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
  ImagePlus,
  Languages,
  LockKeyhole,
  LoaderCircle,
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
const AVATAR_PHOTO_SESSION_KEY = "hana-session-avatar-photo-v1";
const LEGACY_AVATAR_PHOTO_STORAGE_KEY = "hana-player-avatar-photo-v1";
const LEGACY_AVATAR_STORAGE_KEY = "hana-astronaut-avatar-v1";
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
  vi: string;
  en: string;
}> = [
  { id: "minh-khoa", vi: "Phi hành gia bé trai", en: "Boy astronaut" },
  { id: "ngoc-anh", vi: "Phi hành gia bé gái", en: "Girl astronaut" },
  { id: "gia-huy", vi: "Mèo nhỏ đáng yêu", en: "Cute little cat" },
  { id: "linh-chi", vi: "Bông hoa đáng yêu", en: "Cute little flower" },
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
  photoUrl,
  className = "",
  decorative = false,
}: {
  avatarId: AvatarId;
  photoUrl?: string | null;
  className?: string;
  decorative?: boolean;
}) {
  if (photoUrl) {
    return (
      <img
        className={`player-avatar player-avatar-photo ${className}`}
        src={photoUrl}
        alt={decorative ? "" : "Player avatar"}
        aria-hidden={decorative}
      />
    );
  }
  const accessibleLabel = {
    "minh-khoa": "Boy astronaut avatar",
    "ngoc-anh": "Girl astronaut avatar",
    "gia-huy": "Cute cat avatar",
    "linh-chi": "Cute flower avatar",
  }[avatarId];
  if (avatarId === "gia-huy") {
    return (
      <svg className={`player-avatar ${className}`} viewBox="0 0 120 120" aria-hidden={decorative} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : accessibleLabel}>
        <circle cx="60" cy="60" r="58" fill="#233875" />
        <circle cx="60" cy="60" r="51" fill="#9de9d0" opacity="0.94" />
        <path d="M25 106c6-22 19-33 35-33s29 11 35 33H25Z" fill="#4f90cb" />
        <path d="M38 45 45 22l14 19-21 4ZM61 41l14-19 7 23-21-4Z" fill="#4b5c86" />
        <circle cx="60" cy="58" r="31" fill="#ffd6af" />
        <path d="M35 52c2-20 13-29 25-29s23 9 25 29c-8-6-16-8-25-8s-17 2-25 8Z" fill="#4b5c86" />
        <path d="M49 56h5M66 56h5" stroke="#26345f" strokeWidth="4" strokeLinecap="round" />
        <path d="M55 66 60 70l5-4" fill="#e98991" stroke="#9b5162" strokeWidth="2" strokeLinejoin="round" />
        <path d="M49 74c7 4 15 4 22 0" fill="none" stroke="#9b5162" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 63h15m26 0h15M34 70h13m26 0h13" stroke="#4b5c86" strokeWidth="2" strokeLinecap="round" />
        <circle cx="60" cy="96" r="10" fill="#fff7d2" /><path d="M56 96h8M60 92v8" stroke="#4f90cb" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (avatarId === "linh-chi") {
    return (
      <svg className={`player-avatar ${className}`} viewBox="0 0 120 120" aria-hidden={decorative} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : accessibleLabel}>
        <circle cx="60" cy="60" r="58" fill="#233875" />
        <circle cx="60" cy="60" r="51" fill="#cfc3ff" opacity="0.92" />
        <path d="M56 115V81h8v34h-8Z" fill="#4aa484" />
        <path d="M58 92c-15-2-23-12-24-25 15 2 23 12 24 25ZM62 101c15-2 23-12 24-25-15 2-23 12-24 25Z" fill="#67c7a0" />
        <g fill="#ff9ba6"><ellipse cx="60" cy="31" rx="14" ry="23" /><ellipse cx="87" cy="51" rx="23" ry="14" transform="rotate(35 87 51)" /><ellipse cx="76" cy="82" rx="23" ry="14" transform="rotate(105 76 82)" /><ellipse cx="44" cy="82" rx="23" ry="14" transform="rotate(75 44 82)" /><ellipse cx="33" cy="51" rx="23" ry="14" transform="rotate(145 33 51)" /></g>
        <circle cx="60" cy="59" r="22" fill="#ffd96c" /><circle cx="52" cy="57" r="3.5" fill="#26345f" /><circle cx="68" cy="57" r="3.5" fill="#26345f" />
        <path d="M51 69c5 5 13 5 18 0" fill="none" stroke="#a65b57" strokeWidth="3" strokeLinecap="round" />
        <circle cx="52" cy="67" r="3" fill="#f49a91" opacity="0.55" /><circle cx="68" cy="67" r="3" fill="#f49a91" opacity="0.55" />
      </svg>
    );
  }
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
  { id: "level-20-pathfinder", symbol: "✦", threshold: 200, accent: "coral", vi: { label: "Người Mở Đường", detail: "Chinh phục Cấp 20 của hành trình 100 cấp." }, en: { label: "Pathfinder", detail: "Reach Level 20 first." } },
  { id: "level-60-orbit-captain", symbol: "◌", threshold: 600, accent: "lavender", vi: { label: "Thuyền Trưởng Quỹ Đạo", detail: "Chinh phục Cấp 60 với sự kiên trì." }, en: { label: "Orbit Captain", detail: "Reach Level 60 with persistence." } },
  { id: "level-80-math-comet", symbol: "☄", threshold: 800, accent: "mint", vi: { label: "Sao Chổi Toán Học", detail: "Chinh phục Cấp 80 thật xuất sắc." }, en: { label: "Math Comet", detail: "Reach Level 80 with skill." } },
  { id: "level-100-hana-legend", symbol: "♛", threshold: 1000, accent: "gold", vi: { label: "Huyền Thoại Hana", detail: "Hoàn thành trọn vẹn Cấp 100 huy hoàng." }, en: { label: "Hana Legend", detail: "Complete the triumphant Level 100." } },
];
const JOURNEY_LEVEL_MAX = 100;
const JOURNEY_LEVEL_POINTS = 10;

function journeyLevelForPoints(points: number) {
  return Math.min(
    JOURNEY_LEVEL_MAX,
    Math.floor(Math.max(0, points) / JOURNEY_LEVEL_POINTS)
  );
}

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
  avatarPhotoUrl?: string | null;
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

function isAvatarPhotoUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 700_000 &&
    /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/i.test(value)
  );
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

function readAvatarPhotoPreference() {
  try {
    // Personal photos intentionally live only in the active browser tab.
    // Remove a legacy public URL so one learner never inherits another's image.
    window.localStorage.removeItem(LEGACY_AVATAR_PHOTO_STORAGE_KEY);
    const stored = window.sessionStorage.getItem(AVATAR_PHOTO_SESSION_KEY);
    return isAvatarPhotoUrl(stored) ? stored : null;
  } catch {
    return null;
  }
}

async function prepareAvatarPhoto(file: File) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("avatar-file-type");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("avatar-file-size");
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    if (image.naturalWidth < 80 || image.naturalHeight < 80) {
      throw new Error("avatar-file-resolution");
    }
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 320;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("avatar-file-canvas");
    const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
    context.drawImage(
      image,
      (image.naturalWidth - cropSize) / 2,
      (image.naturalHeight - cropSize) / 2,
      cropSize,
      cropSize,
      0,
      0,
      320,
      320
    );
    return canvas.toDataURL("image/jpeg", 0.84);
  } finally {
    URL.revokeObjectURL(objectUrl);
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
    (value.avatarPhotoUrl === undefined ||
      value.avatarPhotoUrl === null ||
      isAvatarPhotoUrl(value.avatarPhotoUrl)) &&
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
      avatarPhotoUrl:
        draft.avatarPhotoUrl === undefined
          ? undefined
          : isAvatarPhotoUrl(draft.avatarPhotoUrl)
            ? draft.avatarPhotoUrl
            : null,
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
  "Tính kết quả của phép tính.": "Solve it.",
  "Tìm số còn thiếu trong phép tính.":
    "Find it.",
  "Luyện xen kẽ cả hai dạng bài.": "Use both.",
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
    "Bạn hãy đặt tính rồi cộng từng hàng, nhớ khi cần.":
      "Set up the addition in columns and regroup when needed.",
    "Đặt các chữ số cùng hàng thẳng cột.":
      "Line up digits with the same place value.",
    "Cộng lần lượt từ phải sang trái.":
      "Add one place at a time from right to left.",
    "Trừ từ phải sang trái.":
      "Subtract one place at a time from right to left.",
    "Bạn hãy đếm lùi từ số đầu tiên.": "Count backwards from the first number.",
    "Bạn hãy đặt tính thẳng cột rồi trừ từ hàng đơn vị.":
      "Line up the numbers and subtract from the ones place.",
    "Nếu không đủ để trừ, bạn hãy đổi 1 chục hoặc 1 trăm nhé.":
      "Regroup a ten or hundred when needed.",
    "Bạn hãy đặt tính rồi đổi một chục hoặc một trăm khi hàng đó không đủ để trừ.":
      "Set up the subtraction in columns and regroup a ten or hundred when a place is not enough.",
    "Bạn có thể cộng lặp lại hoặc dùng bảng nhân.":
      "Use repeated addition or a times table.",
    "Bạn hãy nhân lần lượt với hàng đơn vị rồi hàng chục.":
      "Multiply the ones place, then the tens place.",
    "Hãy hiểu mỗi nhóm có bao nhiêu phần tử trước, rồi dùng bảng nhân để kiểm tra.":
      "Understand what is in each group first, then use the times table to check.",
    "Hãy hiểu phép nhân là các nhóm bằng nhau, rồi dùng bảng nhân để kiểm tra.":
      "Understand multiplication as equal groups, then use the times table to check.",
    "Hãy đặt tính và nhân từng hàng để không bỏ sót số nhớ.":
      "Set up the multiplication and work one place at a time so you do not miss regrouping.",
    "Kiểm tra lại các hàng đã nhân và số nhớ trước khi chọn đáp án.":
      "Check each place you multiplied and any regrouping before choosing an answer.",
    "Dùng bảng nhân để kiểm tra lại tích bạn vừa tìm.":
      "Use the times table to check the product you just worked out.",
    "Hãy hình dung chia đều đồ vật vào các nhóm trước, rồi dùng phép nhân để kiểm tra.":
      "Picture sharing objects equally into groups first, then use multiplication to check.",
    "Hãy chia đều theo nhóm trước, rồi dùng bảng nhân để kiểm tra.":
      "Share into equal groups first, then use the times table to check.",
    "Bạn hãy đổi phép chia thành phép nhân để kiểm tra đáp án.":
      "Turn division into multiplication to check your answer.",
    "Bạn hãy dùng phép nhân để tìm thương rồi kiểm tra lại.":
      "Use multiplication to find the quotient, then check it.",
    "Bạn hãy đặt tính chia theo từng hàng rồi dùng phép nhân để kiểm tra.":
      "Set up the division by place value, then use multiplication to check it.",
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
      /^Bạn hãy dùng bảng nhân (\d+) để tính thật chắc\.$/,
      "Use the $1 times table to calculate carefully."
    )
    .replace(
      /^(\d+) × (\d+) nghĩa là lấy (\d+) nhóm(?: bằng nhau)?, mỗi nhóm có (\d+)\.$/,
      "$1 × $2 means $3 equal groups with $4 in each group."
    )
    .replace(
      /^Hãy tưởng tượng có (\d+) bao kẹo bằng nhau, mỗi bao có (\d+) cục kẹo\.$/,
      "Imagine $1 equal bags of candy with $2 candies in each bag."
    )
    .replace(
      /^Hãy tưởng tượng có (\d+) hộp bút màu bằng nhau, mỗi hộp có (\d+) bút màu\.$/,
      "Imagine $1 equal boxes of coloured pencils with $2 pencils in each box."
    )
    .replace(
      /^Hãy tưởng tượng có (\d+) bình hoa bằng nhau, mỗi bình có (\d+) bông hoa\.$/,
      "Imagine $1 equal vases with $2 flowers in each vase."
    )
    .replace(
      /^Hãy tưởng tượng có (\d+) kệ sách bằng nhau, mỗi kệ có (\d+) quyển sách\.$/,
      "Imagine $1 equal bookshelves with $2 books on each shelf."
    )
    .replace(
      /^Hãy tưởng tượng có (\d+) khay bánh bằng nhau, mỗi khay có (\d+) chiếc bánh\.$/,
      "Imagine $1 equal trays with $2 cakes on each tray."
    )
    .replace(
      /^Vậy (\d+) × (\d+) là lấy (\d+) lặp lại (\d+) lần\. Hãy cộng (\d+) thêm (\d+) lần\.$/,
      "So $1 × $2 means repeating $3, $4 times. Add $5 another $6 times."
    )
    .replace(
      /^Hãy tưởng tượng (\d+) cục kẹo được chia đều vào (\d+) bao kẹo\.$/,
      "Imagine sharing $1 candies equally into $2 bags."
    )
    .replace(
      /^Hãy tưởng tượng (\d+) bút màu được chia đều vào (\d+) hộp bút màu\.$/,
      "Imagine sharing $1 coloured pencils equally into $2 boxes."
    )
    .replace(
      /^Hãy tưởng tượng (\d+) bông hoa được chia đều vào (\d+) bình hoa\.$/,
      "Imagine sharing $1 flowers equally into $2 vases."
    )
    .replace(
      /^Hãy tưởng tượng (\d+) quyển sách được chia đều vào (\d+) kệ sách\.$/,
      "Imagine sharing $1 books equally across $2 bookshelves."
    )
    .replace(
      /^Hãy tưởng tượng (\d+) chiếc bánh được chia đều vào (\d+) khay bánh\.$/,
      "Imagine sharing $1 cakes equally onto $2 trays."
    )
    .replace(
      /^Mỗi bao có mấy cục kẹo\? Hãy tìm số còn thiếu trong \? × (\d+) = (\d+)\.$/,
      "How many candies are in each bag? Find the missing number in ? × $1 = $2."
    )
    .replace(
      /^Mỗi hộp có mấy bút màu\? Hãy tìm số còn thiếu trong \? × (\d+) = (\d+)\.$/,
      "How many coloured pencils are in each box? Find the missing number in ? × $1 = $2."
    )
    .replace(
      /^Mỗi bình có mấy bông hoa\? Hãy tìm số còn thiếu trong \? × (\d+) = (\d+)\.$/,
      "How many flowers are in each vase? Find the missing number in ? × $1 = $2."
    )
    .replace(
      /^Mỗi kệ có mấy quyển sách\? Hãy tìm số còn thiếu trong \? × (\d+) = (\d+)\.$/,
      "How many books are on each shelf? Find the missing number in ? × $1 = $2."
    )
    .replace(
      /^Mỗi khay có mấy chiếc bánh\? Hãy tìm số còn thiếu trong \? × (\d+) = (\d+)\.$/,
      "How many cakes are on each tray? Find the missing number in ? × $1 = $2."
    )
    .replace(
      /^Dùng bảng nhân (\d+) để kiểm tra số phần trong mỗi (bao|hộp|bình|kệ|khay)\.$/,
      "Use the $1 times table to check how many are in each group."
    )
    .replace(
      /^Hãy cộng (\d+) thêm (\d+) lần để (?:biết tất cả có bao nhiêu|tìm tổng số phần tử)\.$/,
      "Add $1 another $2 times to find how many there are altogether."
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
    .replace(
      /^Đọc bảng nhân (\d+) đến phép nhân với (\d+)\.$/,
      "Read the $1 times table up to the fact with $2."
    )
    .replace(
      /^Tìm dòng (\d+) × (\d+) trong bảng nhân\.$/,
      "Find the $1 × $2 fact in the times table."
    )
    .replace(
      /^Xác định phép tính (\d+) × (\d+)\.$/,
      "Find the $1 × $2 fact."
    )
    .replace(/^Chọn tích của phép nhân đó\.$/, "Choose the product of that fact.")
    .replace(
      /^Chọn tích bạn vừa đọc được trong bảng nhân\.$/,
      "Choose the product you just found in the times table."
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
      /^Đặt tính (\d+) − (\d+) theo cột, rồi tìm số hạng chưa biết\.$/,
      "Set up $1 − $2 in columns, then find the missing addend."
    )
    .replace(
      /^Đặt tính (\d+) \+ (\d+) theo cột, rồi tìm số bị trừ chưa biết\.$/,
      "Set up $1 + $2 in columns, then find the missing minuend."
    )
    .replace(
      /^Đặt tính (\d+) − (\d+) theo cột, rồi tìm số trừ chưa biết\.$/,
      "Set up $1 − $2 in columns, then find the missing subtrahend."
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
    )
    .replace(
      /^Nếu hàng đơn vị không đủ để trừ, mượn 1 chục ở hàng chục; sau đó tiếp tục trừ\.$/,
      "If there are not enough ones to subtract, regroup one ten into the ones place, then continue."
    )
    .replace(
      /^Nếu một hàng không đủ để trừ, mượn 1 ở hàng bên trái; đổi 1 chục thành 10 đơn vị hoặc 1 trăm thành 10 chục rồi tiếp tục\.$/,
      "If a place does not have enough to subtract, regroup 1 from the place to its left: 1 ten becomes 10 ones or 1 hundred becomes 10 tens."
    )
    .replace(
      /^Dùng bảng nhân (\d+) hoặc nhân nhẩm để tìm số còn thiếu\.$/,
      "Use the $1 times table or mental multiplication to find the missing number."
    )
    .replace(
      /^Kiểm tra: lấy số vừa tìm được nhân (\d+); nếu được (\d+) thì đó là thương\.$/,
      "Check: multiply the number you found by $1. If the result is $2, it is the quotient."
    )
    .replace(
      /^Nếu một hàng được từ 10 trở lên, viết hàng đơn vị và nhớ 1 sang hàng bên trái\.$/,
      "If a column totals 10 or more, write the ones digit and carry 1 to the place on the left."
    )
    .replace(
      /^Cộng từ hàng đơn vị sang hàng chục, hàng trăm rồi hàng nghìn\.$/,
      "Add from the ones place to the tens, hundreds, then thousands places."
    )
    .replace(
      /^Nếu tổng ở một hàng từ 10 trở lên, viết chữ số ở hàng đó và nhớ 1 sang hàng bên trái\.$/,
      "If a place-value sum is 10 or more, write the digit for that place and carry 1 to the place on the left."
    )
    .replace(
      /^Trừ từ hàng đơn vị sang trái, lần lượt đến các hàng lớn hơn\.$/,
      "Subtract from the ones place to the larger places on the left."
    )
    .replace(
      /^Nếu một hàng không đủ để trừ, đổi 1 ở hàng bên trái: 1 chục thành 10 đơn vị hoặc 1 trăm thành 10 chục\.$/,
      "If a place is not enough to subtract, regroup 1 from the place to its left: 1 ten becomes 10 ones or 1 hundred becomes 10 tens."
    )
    .replace(
      /^Đặt tính (\d+) × (\d+)\.$/,
      "Set up $1 × $2 in columns."
    )
    .replace(
      /^Nhân (\d+) lần lượt với từng hàng của (\d+), từ phải sang trái\.$/,
      "Multiply $1 by each place in $2, from right to left."
    )
    .replace(
      /^Nếu tích ở một hàng từ 10 trở lên, viết hàng đơn vị và nhớ sang hàng tiếp theo\.$/,
      "If a place-value product is 10 or more, write the ones digit and regroup to the next place."
    )
    .replace(
      /^Đặt tính (\d+) × (\d+); viết (\d+) thẳng cột với hàng đơn vị của (\d+)\.$/,
      "Set up $1 × $2, placing $3 under the ones place of $4."
    )
    .replace(
      /^Nhân (\d+) với hàng đơn vị của (\d+); ghi chữ số đơn vị và nhớ nếu tích có hai chữ số\.$/,
      "Multiply $1 by the ones place of $2; write the ones digit and regroup if the product has two digits."
    )
    .replace(
      /^Tiếp tục nhân (\d+) với các hàng còn lại của (\d+); cộng số nhớ vào đúng hàng\.$/,
      "Continue multiplying $1 by the remaining places of $2; add any regrouped amount in the correct place."
    )
    .replace(
      /^Đặt tính (\d+) ÷ (\d+); chia lần lượt từ hàng lớn nhất bên trái\.$/,
      "Set up $1 ÷ $2 and divide one place at a time from the largest place on the left."
    )
    .replace(/^Đặt tính (\d+) ÷ (\d+)\.$/, "Set up $1 ÷ $2 in columns.")
    .replace(
      /^Chia từ hàng lớn nhất bên trái; viết từng chữ số của thương đúng hàng\.$/,
      "Divide from the largest place on the left and write each quotient digit in the correct place."
    )
    .replace(
      /^Kiểm tra: lấy thương nhân (\d+); nếu được (\d+) thì thương đúng\.$/,
      "Check: multiply the quotient by $1. If the result is $2, the quotient is correct."
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
  soundEnabled,
  language,
}: {
  onStart: () => void;
  onGuide: () => void;
  soundEnabled: boolean;
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
        <p className="welcome-audio-note" data-sound-control>
          {soundEnabled
            ? language === "en"
              ? "Music begins when you tap Start."
              : "Nhạc nền sẽ bật khi bạn chạm Bắt đầu."
            : language === "en"
              ? "Sound is off. Turn it on in Settings."
              : "Âm thanh đang tắt. Bạn có thể bật trong Cài đặt."}
        </p>
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
  avatarPhotoUrl,
  onAvatarChange,
  onAvatarPhotoSelect,
  isUploadingAvatar,
  avatarUploadError,
  onBack,
  onContinue,
  language,
}: {
  name: string;
  onNameChange: (name: string) => void;
  avatarId: AvatarId;
  avatarPhotoUrl: string | null;
  onAvatarChange: (avatarId: AvatarId) => void;
  onAvatarPhotoSelect: (file: File) => void;
  isUploadingAvatar: boolean;
  avatarUploadError: string | null;
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
      <button type="button" className="format-back profile-back" onClick={onBack}>
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
          {AVATAR_OPTIONS.map(avatar => {
            const selected = !avatarPhotoUrl && avatar.id === avatarId;
            return (
              <button
                key={avatar.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={selected ? "is-selected" : ""}
                onClick={() => onAvatarChange(avatar.id)}
                aria-label={language === "en" ? avatar.en : avatar.vi}
              >
                <PlayerAvatar avatarId={avatar.id} decorative />
                {selected && <Check className="avatar-selected-check" size={15} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <label className={`avatar-photo-upload ${avatarPhotoUrl ? "has-photo" : ""}`} aria-label={language === "en" ? "Upload your own avatar photo" : "Tải ảnh của bạn làm avatar"}>
          <span className="avatar-photo-upload-icon" aria-hidden="true">
            {avatarPhotoUrl ? <PlayerAvatar avatarId={avatarId} photoUrl={avatarPhotoUrl} decorative /> : <ImagePlus size={24} />}
            {avatarPhotoUrl && <Check className="avatar-selected-check" size={15} aria-hidden="true" />}
            {isUploadingAvatar && <LoaderCircle className="avatar-upload-spinner" size={19} aria-hidden="true" />}
          </span>
          <span className="avatar-photo-upload-copy">
            <strong>{avatarPhotoUrl ? (language === "en" ? "Your photo is selected" : "Bạn đang dùng ảnh của mình") : (language === "en" ? "Use your own photo" : "Dùng ảnh của bạn")}</strong>
            <small>{isUploadingAvatar ? (language === "en" ? "Hana is preparing your round avatar..." : "Hana đang chuẩn bị avatar tròn của bạn...") : avatarPhotoUrl ? (language === "en" ? "Only this browser tab can use this photo. Tap to change it." : "Ảnh này chỉ được dùng trong tab đang học. Chạm để đổi ảnh.") : (language === "en" ? "Private in this tab · JPG/PNG/WEBP · 8 MB max" : "Riêng tư trong tab này · JPG/PNG/WEBP · dưới 8 MB")}</small>
          </span>
          <ImagePlus className="avatar-photo-upload-action" size={20} aria-hidden="true" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploadingAvatar}
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) onAvatarPhotoSelect(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
        {avatarUploadError && <p className="avatar-upload-error" role="status">{avatarUploadError}</p>}
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
          ? "Solve it."
          : "Tính kết quả của phép tính.",
    },
    {
      format: "missing",
      symbol: "?",
      description:
        language === "en"
          ? "Find it."
          : "Tìm số còn thiếu trong phép tính.",
    },
    {
      format: "mixed",
      symbol: "↻",
      description:
        language === "en"
          ? "Use both."
          : "Luyện xen kẽ cả hai dạng bài.",
    },
  ];
  return (
    <section
      className="format-screen"
      data-i18n-direct
      aria-label={language === "en" ? "Choose practice type" : "Chọn dạng bài"}
    >
      <button type="button" className="format-back format-back-secondary" onClick={onBack}>
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
              ? "Choose your learning path."
              : "Chọn cách học nhé."}
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

type HanaVisualPlan = {
  operation: Operation;
  first: number;
  second: number;
  result: number;
  hiddenPart: "first" | "second" | "result" | null;
};

function hanaEquation(question: QuizQuestion) {
  const match = question.expression.match(
    /^\s*(\?|\d+)\s*([+−×÷])\s*(\?|\d+)\s*=\s*(\?|\d+)\s*$/
  );
  if (!match) {
    return { first: 0, second: 0, result: question.answer, missing: null };
  }
  const [, firstToken, , secondToken, resultToken] = match;
  const resolve = (token: string) => (token === "?" ? question.answer : Number(token));
  return {
    first: resolve(firstToken),
    second: resolve(secondToken),
    result: resolve(resultToken),
    missing: firstToken === "?" ? "first" : secondToken === "?" ? "second" : resultToken === "?" ? "result" : null,
  } as const;
}

function hanaCheckGuidance(question: QuizQuestion, language: Language) {
  if (question.kind === "missing") {
    const missingGuidance = {
      add: language === "en"
        ? "Put the number you found back into the addition. The total must match the number already shown."
        : "Thay số bạn tìm được vào phép cộng. Tổng phải đúng bằng số đã cho.",
      subtract: language === "en"
        ? "Put the number you found back into the subtraction. The difference must match the number already shown."
        : "Thay số bạn tìm được vào phép trừ. Hiệu phải đúng bằng số đã cho.",
      multiply: language === "en"
        ? "Put the number you found back into the multiplication. The product must match the number already shown."
        : "Thay số bạn tìm được vào phép nhân. Tích phải đúng bằng số đã cho.",
      divide: language === "en"
        ? "Put the number you found back into the division, then multiply the quotient by the divisor to check the dividend."
        : "Thay số bạn tìm được vào phép chia, rồi lấy thương nhân số chia để kiểm tra số bị chia.",
    } as const;
    return missingGuidance[question.operation];
  }

  const equation = hanaEquation(question);
  if (question.operation === "add") {
    return language === "en"
      ? `Subtract ${equation.second} from the total you chose. It should return ${equation.first}.`
      : `Lấy tổng bạn chọn trừ ${equation.second}; kết quả phải trở lại ${equation.first}.`;
  }
  if (question.operation === "subtract") {
    return language === "en"
      ? `Add ${equation.second} to the difference you chose. It should return ${equation.first}.`
      : `Lấy hiệu bạn chọn cộng ${equation.second}; kết quả phải trở lại ${equation.first}.`;
  }
  if (question.operation === "multiply") {
    return language === "en"
      ? `Read the ${equation.first} times table and check that ${equation.first} × ${equation.second} matches the product you chose.`
      : `Đọc bảng nhân ${equation.first} và kiểm tra ${equation.first} × ${equation.second} có đúng bằng tích bạn chọn không.`;
  }
  return language === "en"
    ? `Multiply the quotient you chose by ${equation.second}. The product should return ${equation.first}.`
    : `Lấy thương bạn chọn nhân ${equation.second}; tích phải trở lại ${equation.first}.`;
}

/** Câu tìm thành phần dùng phép tính ngược để hình vẽ vẫn khớp chính xác với các số của câu đó. */
function hanaVisualPlan(question: QuizQuestion): HanaVisualPlan {
  const equation = hanaEquation(question);
  if (question.kind !== "missing") {
    return {
      operation: question.operation,
      first: equation.first,
      second: equation.second,
      result: equation.result,
      hiddenPart: equation.missing,
    };
  }

  if (question.operation === "add") {
    const knownAddend = equation.missing === "first" ? equation.second : equation.first;
    return { operation: "add", first: knownAddend, second: question.answer, result: equation.result, hiddenPart: "second" };
  }
  if (question.operation === "subtract") {
    if (equation.missing === "first") {
      return { operation: "add", first: equation.result, second: equation.second, result: question.answer, hiddenPart: "result" };
    }
    return { operation: "add", first: equation.result, second: question.answer, result: equation.first, hiddenPart: "second" };
  }
  if (question.operation === "multiply") {
    const knownFactor = equation.missing === "first" ? equation.second : equation.first;
    return { operation: "multiply", first: knownFactor, second: question.answer, result: equation.result, hiddenPart: "second" };
  }
  if (equation.missing === "first") {
    return { operation: "multiply", first: equation.result, second: equation.second, result: question.answer, hiddenPart: "result" };
  }
  return { operation: "multiply", first: equation.result, second: question.answer, result: equation.first, hiddenPart: "second" };
}

function hanaWorkedExample(question: QuizQuestion, language: Language) {
  const plan = hanaVisualPlan(question);
  const equation = `${plan.first} ${plan.operation === "add" ? "+" : plan.operation === "subtract" ? "−" : plan.operation === "multiply" ? "×" : "÷"} ${plan.second} = ${plan.result}`;
  if (plan.operation === "add") {
    return language === "en"
      ? `${equation} · Put the two exact groups together.`
      : `${equation} · Gộp đúng hai nhóm số lại với nhau.`;
  }
  if (plan.operation === "subtract") {
    return language === "en"
      ? `${equation} · Take away the second group from the first.`
      : `${equation} · Bớt nhóm số thứ hai ra khỏi nhóm số đầu.`;
  }
  if (plan.operation === "multiply") {
    return language === "en"
      ? `${equation} · Make ${plan.first} equal groups of ${plan.second}.`
      : `${equation} · Xếp ${plan.first} nhóm bằng nhau, mỗi nhóm ${plan.second}.`;
  }
  return language === "en"
    ? `${equation} · Share ${plan.first} equally into ${plan.second} groups.`
    : `${equation} · Chia đều ${plan.first} thành ${plan.second} nhóm.`;
}

function HanaQuantity({
  value,
  hidden,
  tone,
}: {
  value: number;
  hidden: boolean;
  tone: "coral" | "violet" | "mint" | "gold";
}) {
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  return (
    <span className={`hana-quantity tone-${tone}${hidden ? " is-hidden" : ""}`}>
      <b>{hidden ? "?" : value}</b>
      {hidden ? <small>?</small> : value <= 24 ? (
        <span className="hana-quantity-dots" aria-hidden="true">
          {Array.from({ length: value }).map((_, index) => <i key={index} />)}
        </span>
      ) : (
        <span className="hana-place-value" aria-label={`${value}`}>
          {hundreds > 0 && <i><b>{hundreds * 100}</b></i>}
          {tens > 0 && <i><b>{tens * 10}</b></i>}
          {ones > 0 && <i><b>{ones}</b></i>}
        </span>
      )}
    </span>
  );
}

function HanaMathVisual({
  question,
  language,
  revealUnknown,
}: {
  question: QuizQuestion;
  language: Language;
  revealUnknown: boolean;
}) {
  const plan = hanaVisualPlan(question);
  const hidden = (part: HanaVisualPlan["hiddenPart"]) => !revealUnknown && plan.hiddenPart === part;
  const visualLabel =
    plan.operation === "add"
      ? language === "en" ? "Exact groups combined" : "Gộp đúng các nhóm số"
      : plan.operation === "subtract"
        ? language === "en" ? "Exact group taken away" : "Bớt đúng nhóm số"
        : plan.operation === "multiply"
          ? language === "en" ? "Exact equal groups" : "Các nhóm bằng nhau"
          : language === "en" ? "Exact equal sharing" : "Chia đều chính xác";

  if (plan.operation === "multiply") {
    return (
      <div className={`hana-math-visual operation-${plan.operation}`} aria-label={visualLabel}>
        <span className="hana-visual-label">{visualLabel}</span>
        <div className="hana-equal-groups" aria-hidden="true">
          {Array.from({ length: Math.min(plan.first, 10) }).map((_, groupIndex) => (
            <span className="hana-group" key={groupIndex}>
              <b>{hidden("second") ? "?" : plan.second}</b>
              <small>{language === "en" ? "in group" : "mỗi nhóm"}</small>
            </span>
          ))}
        </div>
        <span className="hana-visual-equation">
          {hidden("result") ? "?" : plan.result} {language === "en" ? "in all" : "tất cả"}
        </span>
      </div>
    );
  }

  if (plan.operation === "divide") {
    return (
      <div className={`hana-math-visual operation-${plan.operation}`} aria-label={visualLabel}>
        <span className="hana-visual-label">{visualLabel}</span>
        <div className="hana-sharing-model" aria-hidden="true">
          <HanaQuantity value={plan.first} hidden={hidden("first")} tone="gold" />
          <span className="hana-visual-arrow">→</span>
          <span className="hana-share-groups">
            {Array.from({ length: Math.min(plan.second, 9) }).map((_, groupIndex) => (
              <i key={groupIndex}>{hidden("result") ? "?" : plan.result}</i>
            ))}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`hana-math-visual operation-${plan.operation}`} aria-label={visualLabel}>
      <span className="hana-visual-label">{visualLabel}</span>
      <div className="hana-equation-model" aria-hidden="true">
        <HanaQuantity value={plan.first} hidden={hidden("first")} tone={plan.operation === "add" ? "coral" : "violet"} />
        <b className="hana-visual-operator">{plan.operation === "add" ? "+" : "−"}</b>
        <HanaQuantity value={plan.second} hidden={hidden("second")} tone="mint" />
        <b className="hana-visual-operator">=</b>
        <HanaQuantity value={plan.result} hidden={hidden("result")} tone="gold" />
      </div>
    </div>
  );
}

function HanaLearningDialog({
  question,
  chosenAnswer,
  language,
  playerName,
  step,
  isTimedTest,
  onPrevious,
  onNext,
  onRetry,
}: {
  question: QuizQuestion;
  chosenAnswer: number | null;
  language: Language;
  playerName: string;
  step: number;
  isTimedTest: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onRetry: () => void;
}) {
  const instructionPages = question.hintSteps.map(text =>
    translateLearningText(text, language)
  );
  const isLastStep = step === instructionPages.length - 1;
  const pageText =
    instructionPages[step] ?? translateLearningText(question.hint, language);
  const totalPages = instructionPages.length;
  const checkGuidance = hanaCheckGuidance(question, language);
  return (
    <div
      className="hana-learning-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={
        language === "en"
          ? "Hana's step-by-step maths guide"
          : "Hana hướng dẫn Toán từng bước"
      }
    >
      <section className="hana-learning-card" data-i18n-direct>
        <div className="hana-learning-heading">
          <div className="hana-learning-robot" aria-hidden="true">
            <div className="robot-fallback"><span /><span /><i /></div>
          </div>
          <div>
            <p>{language === "en" ? "ROBOT HANA HELPS" : "ROBOT HANA CÙNG BẠN"}</p>
            <h2>
              {language === "en"
                ? `Let’s work it out, ${playerName}!`
                : `${playerName}, mình cùng làm lại nhé!`}
            </h2>
          </div>
          {isTimedTest && (
            <span className="hana-timer-paused">
              {language === "en" ? "Timer paused" : "Đồng hồ tạm dừng"}
            </span>
          )}
        </div>
        <div className="hana-learning-context">
          <strong>{question.expression}</strong>
          <span className="hana-chosen-answer">
            <small>{language === "en" ? "You chose" : "Bạn đã chọn"}</small>
            <b>{chosenAnswer ?? "?"}</b>
          </span>
        </div>
        <div className="hana-learning-step" aria-live="polite">
          <span>{language === "en" ? `Step ${step + 1} of ${totalPages}` : `Bước ${step + 1}/${totalPages}`}</span>
          <strong>
            {language === "en"
              ? "Follow Hana’s clue"
              : "Làm theo gợi ý của Hana"}
          </strong>
          <p>{pageText}</p>
          {isLastStep && (
            <p className="hana-learning-check-note">
              <strong>{language === "en" ? "CHECK YOUR ANSWER" : "CÁCH KIỂM TRA"}</strong>{" "}
              {checkGuidance}
            </p>
          )}
        </div>
        <div className="hana-learning-actions">
          <button type="button" className="hana-retry-now" onClick={onRetry}>
            {language === "en" ? "Try again now" : "Thử lại ngay"}
          </button>
          {step > 0 ? (
            <button type="button" className="hana-secondary-action" onClick={onPrevious}>
              {language === "en" ? "Back" : "Quay lại"}
            </button>
          ) : <span />}
          {isLastStep ? (
            <button type="button" className="hana-primary-action" onClick={onRetry}>
              {language === "en" ? "Try this question again" : "Thử lại câu này"} <ChevronRight size={17} />
            </button>
          ) : (
            <button type="button" className="hana-primary-action" onClick={onNext}>
              {language === "en" ? "Next step" : "Bước tiếp"} <ChevronRight size={17} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
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
  const isTimedTestSummaryDemo = demoParams.has("testsummary");
  const isTimedTestGameDemo = demoParams.has("testgame");
  const isLowSummaryDemo = demoParams.has("summarylow");
  const isZeroSummaryDemo = demoParams.has("summaryzero");
  const isSummaryDemo = demoParams.has("summary") || isLowSummaryDemo || isZeroSummaryDemo || isTimedTestSummaryDemo;
  const isProfileDemo = demoParams.has("profile");
  const isScoreDemo = demoParams.has("score");
  const isGuideDemo = demoParams.has("guide");
  const isHanaGuideDemo = demoParams.has("hanaguide");
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
  const hanaGuideDemoOperation = demoParams.get("operation");
  const hanaGuideDifficulty = demoParams.get("difficulty");
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
  const hasHanaGuideDemoOperation =
    hanaGuideDemoOperation === "add" ||
    hanaGuideDemoOperation === "subtract" ||
    hanaGuideDemoOperation === "multiply" ||
    hanaGuideDemoOperation === "divide";
  const previewDifficulty: Difficulty =
    hanaGuideDifficulty === "challenge"
      ? "challenge"
      : hanaGuideDifficulty === "medium"
        ? "medium"
        : "easy";
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
      : isHanaGuideDemo && hasHanaGuideDemoOperation
        ? hanaGuideDemoOperation
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
                isTimedTestGameDemo ||
                isHanaGuideDemo ||
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
    isTableDemo ? "tables" : isTestSetupDemo || isTimedTestSummaryDemo || isTimedTestGameDemo ? "test" : "practice"
  );
  const [selectedActivity, setSelectedActivity] = useState<ActivityId>(
    isTableDemo
      ? "tables"
      : isTestSetupDemo || isTimedTestSummaryDemo || isTimedTestGameDemo
        ? "test"
          : isMissingDemo || isFormatDemo || isHanaGuideDemo
            ? initialOperation
          : isDemo
            ? "multiply"
            : "add"
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(previewDifficulty);
  const [practiceFormat, setPracticeFormat] =
    useState<PracticeFormat>("standard");
  const [operation, setOperation] = useState<Operation>(initialOperation);
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    isTableDemo
      ? generateTableQuestion({ kind: tableDemoKind, tables: [2, 4, 6] })
      : isMissingDemo
        ? generateMissingComponentQuestion(initialOperation, previewDifficulty)
        : generateQuestion(initialOperation, previewDifficulty)
  );
  const recentQuestionExpressionsRef = useRef<string[]>([question.expression]);
  const lastShownQuestionExpressionRef = useRef(question.expression);
  const lastTableSelectionRef = useRef<string | null>(null);
  const [tableKind, setTableKind] = useState<TablePracticeKind>(tableDemoKind);
  const [selectedTables, setSelectedTables] = useState<number[]>(
    isTableDemo ? [2, 4, 6] : []
  );
  const [answered, setAnswered] = useState<number | null>(() =>
    isHanaGuideDemo
      ? question.options.find(option => option !== question.answer) ?? null
      : null
  );
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">(
    isHanaGuideDemo ? "wrong" : "idle"
  );
  const [testStep, setTestStep] = useState(0);
  const [testCorrect, setTestCorrect] = useState(0);
  const [testComplete, setTestComplete] = useState(isTimedTestSummaryDemo);
  const [testDurationSeconds, setTestDurationSeconds] =
    useState<TestDurationSeconds>(isTimedTestSummaryDemo ? 300 : 120);
  const [testSecondsRemaining, setTestSecondsRemaining] = useState(isTimedTestSummaryDemo ? 0 : 120);
  const [testTimedOut, setTestTimedOut] = useState(isTimedTestSummaryDemo);
  const [showHanaLearningGuide, setShowHanaLearningGuide] =
    useState(isHanaGuideDemo);
  const [hanaLearningStep, setHanaLearningStep] = useState(0);
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
  const [avatarPhotoUrl, setAvatarPhotoUrl] = useState<string | null>(
    readAvatarPhotoPreference
  );
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [isPreparingAvatar, setIsPreparingAvatar] = useState(false);
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
    isMaxRewardDemo
      ? 1000
      : isLowSummaryDemo
        ? 6
        : isZeroSummaryDemo
          ? 0
          : isSummaryDemo || isScoreDemo
            ? 100
            : 0
  );
  const previousSessionPointsRef = useRef(sessionPoints);
  const unlockedBadgeIdsThisSessionRef = useRef<Set<string>>(new Set());
  const penalizedQuestionIdRef = useRef<string | null>(null);
  const pausedTimedTestAtRef = useRef<number | null>(null);
  const [correctCount, setCorrectCount] = useState(
    isMaxRewardDemo
      ? 100
      : isLowSummaryDemo
        ? 2
        : isZeroSummaryDemo
          ? 0
          : isSummaryDemo || isScoreDemo
            ? 10
            : 0
  );
  const [wrongCount, setWrongCount] = useState(
    isMaxRewardDemo
      ? 5
      : isLowSummaryDemo
        ? 8
        : isZeroSummaryDemo
          ? 0
          : isSummaryDemo || isScoreDemo
            ? 2
            : 0
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(
    isMaxRewardDemo
      ? 721
      : isLowSummaryDemo
        ? 145
        : isZeroSummaryDemo
          ? 0
          : isSummaryDemo || isScoreDemo
            ? 93
            : 0
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
  const summaryCaptureRef = useRef<HTMLElement | null>(null);
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
    });
    window.addEventListener("keydown", unlockAudio, {
      capture: true,
    });
    window.addEventListener("touchend", unlockAudio, {
      capture: true,
    });
    window.addEventListener("click", unlockAudio, {
      capture: true,
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
    setPlanetUnlock({ operation, badge: newlyUnlocked });
    playSound("reward");
  }, [operation, playSound, sessionPoints]);

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
      setQuestion(
        freshQuestion(() =>
          generatePracticeQuestion(nextActivity, difficulty, "standard")
        )
      );
      setAnswered(null);
      setFeedback("idle");
      if (sessionStartedAt === null) startFreshSession();
      handleRef.current?.setActivePlanet(nextActivity);
      setScreen("game");
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

  const changePracticeFormatInGame = (nextFormat: PracticeFormat) => {
    if (mode !== "practice") return;
    playSound("tap");
    setPracticeFormat(nextFormat);
    setQuestion(
      freshQuestion(() =>
        generatePracticeQuestion(operation, difficulty, nextFormat)
      )
    );
    setAnswered(null);
    setFeedback("idle");
  };

  const returnToMissionPicker = () => {
    setPracticeFormat("standard");
    setDifficulty("easy");
    setTableKind("multiply");
    setSelectedTables([]);
    lastTableSelectionRef.current = null;
    setAnswered(null);
    setFeedback("idle");
    setTestStep(0);
    setTestCorrect(0);
    setTestComplete(false);
    setTestTimedOut(false);
    setScreen(mode === "test" ? "menu" : "activities");
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
        if (penalizedQuestionIdRef.current !== question.id) {
          penalizedQuestionIdRef.current = question.id;
          setWrongCount(current => current + 1);
          setSessionPoints(current => Math.max(0, current - 2));
        }
        setHanaLearningStep(0);
      }
    },
    [
      answered,
      mode,
      playSound,
      question,
      selectedTables.length,
      testComplete,
    ]
  );

  const openHanaLearningGuide = () => {
    setHanaLearningStep(0);
    setShowHanaLearningGuide(true);
    if (mode === "test" && pausedTimedTestAtRef.current === null) {
      pausedTimedTestAtRef.current = Date.now();
    }
  };

  const retryQuestionAfterHanaGuide = () => {
    if (
      mode === "test" &&
      pausedTimedTestAtRef.current !== null &&
      testEndsAtRef.current !== null
    ) {
      testEndsAtRef.current += Date.now() - pausedTimedTestAtRef.current;
      pausedTimedTestAtRef.current = null;
    }
    setShowHanaLearningGuide(false);
    setHanaLearningStep(0);
    setAnswered(null);
    setFeedback("idle");
  };

  useEffect(() => {
    penalizedQuestionIdRef.current = null;
  }, [question.id]);

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
      if (
        screen !== "game" ||
        showScorePanel ||
        showEndSessionConfirm ||
        showHanaLearningGuide
      )
        return;
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
    showHanaLearningGuide,
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
      showHanaLearningGuide ||
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
  }, [mode, playSound, screen, showHanaLearningGuide, testComplete]);

  useEffect(() => {
    if (sessionStartedAt === null) return;
    const syncClock = () => {
      const isLearningActive =
        screen === "game" &&
        document.visibilityState === "visible" &&
        !showHanaLearningGuide;
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
  }, [screen, sessionStartedAt, showHanaLearningGuide]);

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
    if (avatarPhotoUrl) {
      window.sessionStorage.setItem(AVATAR_PHOTO_SESSION_KEY, avatarPhotoUrl);
    } else {
      window.sessionStorage.removeItem(AVATAR_PHOTO_SESSION_KEY);
    }
  }, [avatarPhotoUrl]);

  const finishSession = () => {
    setShowEndSessionConfirm(false);
    testEndsAtRef.current = null;
    clearSessionDraft();
    setResumeDraft(null);
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
    setAvatarPhotoUrl(null);
    window.sessionStorage.removeItem(AVATAR_PHOTO_SESSION_KEY);
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
    setAvatarPhotoUrl(readAvatarPhotoPreference());
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
  const journeyLevel = journeyLevelForPoints(sessionPoints);
  const nextThemeBadge = THEME_BADGES.find(
    badge => sessionPoints < badge.threshold
  );
  const pointsUntilNextBadge = nextThemeBadge
    ? nextThemeBadge.threshold - sessionPoints
    : 0;
  const levelsUntilNextBadge = nextThemeBadge
    ? Math.max(0, nextThemeBadge.threshold / JOURNEY_LEVEL_POINTS - journeyLevel)
    : 0;
  const selectedAvatar =
    AVATAR_OPTIONS.find(avatar => avatar.id === avatarId) ?? AVATAR_OPTIONS[0];

  const selectAvatarPhoto = useCallback(
    async (file: File) => {
      setAvatarUploadError(null);
      setIsPreparingAvatar(true);
      try {
        const dataUrl = await prepareAvatarPhoto(file);
        if (!isAvatarPhotoUrl(dataUrl)) throw new Error("avatar-file-canvas");
        setAvatarPhotoUrl(dataUrl);
        window.sessionStorage.setItem(AVATAR_PHOTO_SESSION_KEY, dataUrl);
        playSound("reward");
      } catch (error) {
        const code = error instanceof Error ? error.message : "avatar-upload";
        const messages = language === "en"
          ? {
              "avatar-file-type": "Choose a JPG, PNG or WEBP image.",
              "avatar-file-size": "Choose an image smaller than 8 MB.",
              "avatar-file-resolution": "Choose a clearer image, at least 80 × 80 px.",
              "avatar-file-canvas": "This device cannot prepare that image yet.",
              "avatar-upload": "Hana cannot use this photo yet. Please try again.",
            }
          : {
              "avatar-file-type": "Hãy chọn ảnh JPG, PNG hoặc WEBP nhé.",
              "avatar-file-size": "Ảnh cần nhỏ hơn 8 MB nhé.",
              "avatar-file-resolution": "Ảnh cần rõ hơn, ít nhất 80 × 80 px nhé.",
              "avatar-file-canvas": "Thiết bị chưa thể xử lý ảnh này.",
              "avatar-upload": "Hana chưa thể dùng ảnh này. Bạn thử lại nhé.",
            };
        setAvatarUploadError(
          messages[code as keyof typeof messages] ?? messages["avatar-upload"]
        );
      } finally {
        setIsPreparingAvatar(false);
      }
    },
    [language, playSound]
  );
  const sessionThemeBadges = THEME_BADGES.filter(badge =>
    themeBadgesForSession(sessionPoints).includes(badge.id)
  );
  const sessionThemeBadgeIds = sessionThemeBadges.map(badge => badge.id);

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
    const answeredQuestions = correctCount + wrongCount;
    const imageAccuracy = answeredQuestions ? correctCount / answeredQuestions : 0;
    const souvenirMessage =
      answeredQuestions === 0
        ? copy(
            "Hãy bắt đầu vài phép tính để Hana đồng hành cùng bạn nhé!",
            "Solve a few questions so Hana can learn with you!"
          )
        : imageAccuracy >= 0.8
          ? copy(
              `Bạn làm đúng ${correctCount}/${answeredQuestions} câu. Khả năng tính toán của bạn đang rất vững!`,
              `You got ${correctCount}/${answeredQuestions} correct. Your maths skills are growing strong!`
            )
          : imageAccuracy >= 0.5
            ? copy(
                `Bạn làm đúng ${correctCount}/${answeredQuestions} câu. Xem lại câu sai rồi thử lại nhé!`,
                `You got ${correctCount}/${answeredQuestions} correct. Review the missed questions, then try again!`
              )
            : copy(
                `Bạn làm đúng ${correctCount}/${answeredQuestions} câu. Hana sẽ cùng bạn luyện từng bước nhé!`,
                `You got ${correctCount}/${answeredQuestions} correct. Hana will practise step by step with you!`
              );
    const souvenirOperation = question.operation;
    const souvenirSymbol: Record<Operation, string> = {
      add: "+",
      subtract: "−",
      multiply: "×",
      divide: "÷",
    };
    const souvenirPlanet: Record<Operation, { light: string; deep: string; ink: string }> = {
      add: { light: "#ffd4b1", deep: "#ef7d70", ink: "#8c3a4b" },
      subtract: { light: "#e4dcff", deep: "#9b8ce0", ink: "#51417e" },
      multiply: { light: "#b8f5e2", deep: "#4cc7ad", ink: "#17685f" },
      divide: { light: "#fff0a7", deep: "#e6b850", ink: "#88601a" },
    };
    const practiceMissionLabels: Record<Operation, string> = {
      add: copy("Luyện phép cộng", "Addition practice"),
      subtract: copy("Luyện phép trừ", "Subtraction practice"),
      multiply: copy("Luyện phép nhân", "Multiplication practice"),
      divide: copy("Luyện phép chia", "Division practice"),
    };
    const missionLabel =
      mode === "test"
        ? copy("Bài kiểm tra tính giờ", "Timed test")
        : mode === "tables"
          ? tableLabel(tableKind)
          : practiceMissionLabels[souvenirOperation];
    const missionDetail =
      mode === "test"
        ? copy(
            `${difficultyMeta[difficulty].label} · ${formatDuration(testDurationSeconds)}`,
            `${difficulty === "easy" ? "Getting started" : difficulty === "medium" ? "Confident" : "Explorer"} · ${formatDuration(testDurationSeconds)}`
          )
        : answeredQuestions
          ? copy(
              `Độ chính xác ${Math.round(imageAccuracy * 100)}% · ${correctCount}/${answeredQuestions} câu đúng`,
              `${Math.round(imageAccuracy * 100)}% accuracy · ${correctCount}/${answeredQuestions} correct`
            )
          : copy("Sẵn sàng cho chuyến học đầu tiên", "Ready for a first learning flight");
    const newBadge = sessionThemeBadges.at(-1);
    const nextBadge = THEME_BADGES.find(
      badge => !sessionThemeBadgeIds.includes(badge.id)
    );
    const pointsUntilSouvenirBadge = nextBadge
      ? Math.max(0, nextBadge.threshold - sessionPoints)
      : 0;
    const nextBadgeLevel = nextBadge ? nextBadge.threshold / 10 : 0;
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
    const summaryCaptureTarget = summaryCaptureRef.current;
    if (summaryCaptureTarget) {
      try {
        await Promise.race([
          document.fonts?.ready ?? Promise.resolve(),
          new Promise<void>(resolve => window.setTimeout(resolve, 700)),
        ]);
        const capture = await html2canvas(summaryCaptureTarget, {
          backgroundColor: "#111b5a",
          scale: Math.min(2, window.devicePixelRatio || 1),
          useCORS: true,
          logging: false,
          imageTimeout: 0,
          ignoreElements: element => element.hasAttribute("data-souvenir-exclude"),
        });
        const actionsTop = summaryCaptureTarget
          .querySelector<HTMLElement>(".summary-actions")
          ?.getBoundingClientRect().top;
        const summaryTop = summaryCaptureTarget.getBoundingClientRect().top;
        const captureScale = capture.width / Math.max(1, summaryCaptureTarget.clientWidth);
        const croppedHeight = actionsTop
          ? Math.min(
              capture.height,
              Math.ceil(Math.max(0, actionsTop - summaryTop + 20) * captureScale)
            )
          : capture.height;
        const souvenirCanvas = document.createElement("canvas");
        souvenirCanvas.width = capture.width;
        souvenirCanvas.height = croppedHeight;
        const souvenirContext = souvenirCanvas.getContext("2d");
        if (!souvenirContext) throw new Error("Không thể tạo ảnh tổng kết");
        souvenirContext.drawImage(
          capture,
          0,
          0,
          capture.width,
          croppedHeight,
          0,
          0,
          capture.width,
          croppedHeight
        );
        const blob = await new Promise<Blob>((resolve, reject) => {
          souvenirCanvas.toBlob(
            imageBlob =>
              imageBlob
                ? resolve(imageBlob)
                : reject(new Error("Không thể chụp ảnh tổng kết")),
            "image/png"
          );
        });
        await downloadSouvenirBlob(blob);
        return;
      } catch (error) {
        console.warn("Không thể chụp vùng tổng kết, dùng ảnh kỷ niệm dự phòng.", error);
      }
    }
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
      // Không để phông chữ mạng chậm làm nút lưu ảnh kỷ niệm bị chờ vô thời hạn.
      await Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise<void>(resolve => window.setTimeout(resolve, 700)),
      ]);
      const avatarPhotoImage = avatarPhotoUrl
        ? await new Promise<HTMLImageElement | null>(resolve => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.onload = () => resolve(image);
            image.onerror = () => resolve(null);
            image.src = avatarPhotoUrl;
          })
        : null;
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
        if (avatarPhotoImage) {
          const sourceWidth = avatarPhotoImage.naturalWidth || avatarPhotoImage.width;
          const sourceHeight = avatarPhotoImage.naturalHeight || avatarPhotoImage.height;
          const sourceSize = Math.min(sourceWidth, sourceHeight);
          context.drawImage(
            avatarPhotoImage,
            (sourceWidth - sourceSize) / 2,
            (sourceHeight - sourceSize) / 2,
            sourceSize,
            sourceSize,
            x - radius,
            y - radius,
            radius * 2,
            radius * 2
          );
          context.restore();
          context.save();
          context.strokeStyle = "rgba(255, 245, 185, .95)";
          context.lineWidth = 7;
          context.beginPath();
          context.arc(x, y, radius - 3.5, 0, Math.PI * 2);
          context.stroke();
          context.restore();
          return;
        }
        context.fillStyle = "#233875";
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        context.fillStyle = style.accent;
        context.beginPath();
        context.arc(x, y, radius * 0.87, 0, Math.PI * 2);
        context.fill();
        if (selectedAvatar.id === "gia-huy") {
          context.fillStyle = "#4f90cb";
          context.beginPath();
          context.arc(x, y + radius * 0.82, radius * 0.78, Math.PI, Math.PI * 2);
          context.fill();
          context.fillStyle = "#4b5c86";
          context.beginPath();
          context.moveTo(x - radius * 0.57, y - radius * 0.3);
          context.lineTo(x - radius * 0.31, y - radius * 0.72);
          context.lineTo(x - radius * 0.03, y - radius * 0.32);
          context.moveTo(x + radius * 0.03, y - radius * 0.32);
          context.lineTo(x + radius * 0.31, y - radius * 0.72);
          context.lineTo(x + radius * 0.57, y - radius * 0.3);
          context.fill();
          context.fillStyle = "#ffd6af";
          context.beginPath();
          context.arc(x, y, radius * 0.49, 0, Math.PI * 2);
          context.fill();
          context.strokeStyle = "#4b5c86";
          context.lineWidth = radius * 0.045;
          [-0.52, -0.34, 0.34, 0.52].forEach(offset => {
            context.beginPath();
            context.moveTo(x + offset * radius, y + radius * 0.12);
            context.lineTo(x + Math.sign(offset) * radius * 0.12, y + radius * 0.16);
            context.stroke();
          });
          context.fillStyle = "#26345f";
          context.beginPath();
          context.arc(x - radius * 0.17, y - radius * 0.02, radius * 0.055, 0, Math.PI * 2);
          context.arc(x + radius * 0.17, y - radius * 0.02, radius * 0.055, 0, Math.PI * 2);
          context.fill();
          context.strokeStyle = "#9b5162";
          context.lineWidth = radius * 0.04;
          context.beginPath();
          context.arc(x, y + radius * 0.15, radius * 0.14, 0.2, Math.PI - 0.2);
          context.stroke();
        } else if (selectedAvatar.id === "linh-chi") {
          context.save();
          context.translate(x, y - radius * 0.05);
          context.fillStyle = "#ff9ba6";
          for (let petal = 0; petal < 5; petal += 1) {
            context.rotate((Math.PI * 2) / 5);
            context.beginPath();
            context.ellipse(0, -radius * 0.45, radius * 0.22, radius * 0.42, 0, 0, Math.PI * 2);
            context.fill();
          }
          context.restore();
          context.fillStyle = "#ffd96c";
          context.beginPath();
          context.arc(x, y - radius * 0.05, radius * 0.36, 0, Math.PI * 2);
          context.fill();
          context.strokeStyle = "#4aa484";
          context.lineWidth = radius * 0.1;
          context.beginPath();
          context.moveTo(x, y + radius * 0.36);
          context.lineTo(x, y + radius * 0.84);
          context.stroke();
          context.fillStyle = "#26345f";
          context.beginPath();
          context.arc(x - radius * 0.12, y - radius * 0.08, radius * 0.045, 0, Math.PI * 2);
          context.arc(x + radius * 0.12, y - radius * 0.08, radius * 0.045, 0, Math.PI * 2);
          context.fill();
          context.strokeStyle = "#a65b57";
          context.lineWidth = radius * 0.04;
          context.beginPath();
          context.arc(x, y + radius * 0.08, radius * 0.12, 0.2, Math.PI - 0.2);
          context.stroke();
        } else {
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
        }
        context.restore();
      };
      const drawBadgeEmblem = (
        x: number,
        y: number,
        radius: number,
        variant: ThemeBadge["id"] | "journey" | null
      ) => {
        const palette = variant === "level-20-pathfinder"
          ? ["#fff1c4", "#ff9a75", "#c75148"]
          : variant === "level-60-orbit-captain"
            ? ["#f5edff", "#b7a4ef", "#67509c"]
            : variant === "level-80-math-comet"
              ? ["#eafff6", "#79d7bc", "#237b6e"]
              : ["#fff9cf", "#f7c955", "#a8641f"];
        const fill = context.createRadialGradient(x - radius * 0.32, y - radius * 0.34, radius * 0.08, x, y, radius);
        fill.addColorStop(0, palette[0]);
        fill.addColorStop(0.68, palette[1]);
        fill.addColorStop(1, palette[2]);
        context.save();
        context.shadowColor = "rgba(29, 37, 104, .24)";
        context.shadowBlur = 12;
        context.shadowOffsetY = 6;
        context.fillStyle = fill;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.shadowColor = "transparent";
        context.lineWidth = Math.max(3, radius * 0.09);
        context.strokeStyle = "rgba(255,255,255,.72)";
        context.stroke();
        context.translate(x, y);
        context.strokeStyle = "#29316c";
        context.fillStyle = "#29316c";
        context.lineCap = "round";
        context.lineJoin = "round";
        if (variant === "level-20-pathfinder") {
          context.beginPath();
          for (let point = 0; point < 10; point += 1) {
            const angle = -Math.PI / 2 + point * Math.PI / 5;
            const r = point % 2 === 0 ? radius * 0.54 : radius * 0.23;
            const pointX = Math.cos(angle) * r;
            const pointY = Math.sin(angle) * r;
            point ? context.lineTo(pointX, pointY) : context.moveTo(pointX, pointY);
          }
          context.closePath();
          context.fill();
        } else if (variant === "level-60-orbit-captain") {
          context.lineWidth = Math.max(3, radius * 0.07);
          context.beginPath();
          context.ellipse(0, 0, radius * 0.56, radius * 0.23, -0.36, 0, Math.PI * 2);
          context.stroke();
          context.beginPath();
          context.arc(0, 0, radius * 0.21, 0, Math.PI * 2);
          context.fill();
        } else if (variant === "level-80-math-comet") {
          context.beginPath();
          context.moveTo(-radius * 0.62, radius * 0.18);
          context.lineTo(radius * 0.12, -radius * 0.12);
          context.lineTo(-radius * 0.12, radius * 0.46);
          context.closePath();
          context.fill();
          context.beginPath();
          context.arc(radius * 0.28, -radius * 0.24, radius * 0.25, 0, Math.PI * 2);
          context.fill();
        } else if (variant === "journey") {
          context.lineWidth = Math.max(3, radius * 0.09);
          [-0.26, 0, 0.26].forEach((offset, index) => {
            context.beginPath();
            context.moveTo(-radius * (0.58 - index * 0.08), offset * radius);
            context.lineTo(radius * 0.16, offset * radius - radius * 0.08);
            context.stroke();
          });
          context.beginPath();
          context.moveTo(radius * 0.08, -radius * 0.38);
          context.lineTo(radius * 0.2, -radius * 0.12);
          context.lineTo(radius * 0.48, 0);
          context.lineTo(radius * 0.2, radius * 0.12);
          context.lineTo(radius * 0.08, radius * 0.38);
          context.lineTo(-radius * 0.02, radius * 0.12);
          context.lineTo(-radius * 0.24, 0);
          context.lineTo(-radius * 0.02, -radius * 0.12);
          context.closePath();
          context.fill();
        } else {
          context.beginPath();
          context.moveTo(-radius * 0.52, radius * 0.18);
          context.lineTo(-radius * 0.4, -radius * 0.38);
          context.lineTo(-radius * 0.14, -radius * 0.05);
          context.lineTo(0, -radius * 0.52);
          context.lineTo(radius * 0.14, -radius * 0.05);
          context.lineTo(radius * 0.4, -radius * 0.38);
          context.lineTo(radius * 0.52, radius * 0.18);
          context.closePath();
          context.fill();
          context.fillStyle = palette[0];
          context.fillRect(-radius * 0.3, radius * 0.13, radius * 0.6, radius * 0.27);
        }
        context.restore();
      };
      const background = context.createLinearGradient(0, 0, 1080, 1440);
      background.addColorStop(0, "#183a86");
      background.addColorStop(0.56, "#111f62");
      background.addColorStop(1, "#26124f");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(255,255,255,0.34)";
      for (let index = 0; index < 76; index += 1) {
        context.beginPath();
        context.arc(((index * 137) % 1050) + 16, ((index * 71) % 1410) + 14, index % 5 === 0 ? 3 : 1.5, 0, Math.PI * 2);
        context.fill();
      }
      drawOrbit(540, 185, 454, 124, -0.08, "rgba(160, 221, 255, .3)");
      drawOrbit(540, 188, 334, 92, 0.18, "rgba(122, 238, 209, .24)");
      drawPlanet(104, 205, 50, "#ffd7ac", "#ed8778", true);
      drawPlanet(976, 205, 50, "#e7ddff", "#a99be5", true);
      drawPlanet(960, 1360, 48, "#d7fff2", "#5bcbb3", true);
      context.save();
      context.translate(540, 205);
      context.scale(0.65, 0.65);
      drawHana(0, 0);
      context.restore();

      context.fillStyle = "#d8fff2";
      context.font = "800 19px Be Vietnam Pro, Trebuchet MS, sans-serif";
      context.textAlign = "center";
      context.fillText(copy("DẤU ẤN LƯỢT HỌC", "LEARNING FLIGHT MEMENTO"), 540, 66);
      context.fillStyle = "#fff9e3";
      context.font = "800 50px Baloo 2, Trebuchet MS, sans-serif";
      context.fillText(copy("Học Toán Cùng Hana", "Learn Math with Hana"), 540, 120);

      context.shadowColor = "rgba(1, 8, 49, .34)";
      context.shadowBlur = 28;
      context.shadowOffsetY = 14;
      context.fillStyle = "#fffaf0";
      drawRoundedRectangle(context, 58, 282, 964, 1042, 44);
      context.fill();
      context.shadowColor = "transparent";

      const profilePanel = context.createLinearGradient(90, 324, 990, 512);
      profilePanel.addColorStop(0, "#e0faf4");
      profilePanel.addColorStop(1, "#eef4ff");
      context.fillStyle = profilePanel;
      drawRoundedRectangle(context, 90, 324, 900, 188, 30);
      context.fill();
      drawCanvasPlayerAvatar(190, 418, 70);
      context.lineWidth = 7;
      context.strokeStyle = "#ffffff";
      context.beginPath();
      context.arc(190, 418, 73, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = "#267b72";
      context.font = "800 17px Be Vietnam Pro, sans-serif";
      context.textAlign = "left";
      context.fillText(copy("LƯỢT HỌC CỦA BẠN", "YOUR LEARNING SESSION"), 310, 372);
      context.fillStyle = "#1a2b67";
      context.font = "800 42px Baloo 2, sans-serif";
      context.fillText(displayName, 310, 420);
      context.fillStyle = "#5d6f99";
      context.font = "700 19px Be Vietnam Pro, sans-serif";
      drawWrappedText(context, souvenirMessage, 310, 458, 520, 27);
      const currentPlanet = souvenirPlanet[souvenirOperation];
      drawPlanet(902, 402, 42, currentPlanet.light, currentPlanet.deep);
      context.fillStyle = currentPlanet.ink;
      context.font = "800 44px Baloo 2, sans-serif";
      context.textAlign = "center";
      context.fillText(souvenirSymbol[souvenirOperation], 902, 417);

      context.fillStyle = "#eef5ff";
      drawRoundedRectangle(context, 90, 546, 900, 126, 28);
      context.fill();
      drawPlanet(166, 609, 36, currentPlanet.light, currentPlanet.deep);
      context.fillStyle = currentPlanet.ink;
      context.font = "800 36px Baloo 2, sans-serif";
      context.textAlign = "center";
      context.fillText(souvenirSymbol[souvenirOperation], 166, 621);
      context.textAlign = "left";
      context.fillStyle = "#516797";
      context.font = "800 16px Be Vietnam Pro, sans-serif";
      context.fillText(copy("NHIỆM VỤ BẠN VỪA HỌC", "MISSION YOU JUST COMPLETED"), 238, 582);
      context.fillStyle = "#27316d";
      context.font = "800 28px Baloo 2, sans-serif";
      drawWrappedText(context, missionLabel, 238, 618, 680, 32);
      context.fillStyle = "#5d6f99";
      context.font = "700 17px Be Vietnam Pro, sans-serif";
      context.fillText(missionDetail, 238, 654);

      const stats = [
        [copy("Điểm", "Points"), `${sessionPoints}`],
        [copy("Đúng", "Correct"), `${correctCount}`],
        [copy("Sai", "Incorrect"), `${wrongCount}`],
        [copy("Thời gian", "Time"), formatDuration(currentDuration())],
      ];
      stats.forEach(([label, value], index) => {
        const x = 90 + index * 225;
        context.fillStyle = index === 0 ? "#fff0bf" : "#eef5ff";
        drawRoundedRectangle(context, x, 706, 205, 154, 24);
        context.fill();
        context.fillStyle = index === 0 ? "#a0692f" : "#5e709b";
        context.font = "800 17px Be Vietnam Pro, sans-serif";
        context.textAlign = "center";
        context.fillText(label, x + 102, 750);
        context.fillStyle = "#27316d";
        context.font = "800 46px Baloo 2, sans-serif";
        context.fillText(value, x + 102, 814);
      });

      context.fillStyle = "#fff4cf";
      drawRoundedRectangle(context, 90, 898, 900, 182, 30);
      context.fill();
      context.fillStyle = "#a66f2d";
      context.font = "800 17px Be Vietnam Pro, sans-serif";
      context.textAlign = "left";
      context.fillText(copy("PHẦN THƯỞNG CAO NHẤT", "HIGHEST REWARD"), 132, 944);
      drawBadgeEmblem(190, 994, 58, highestReward ? "journey" : null);
      context.fillStyle = "#29316c";
      context.font = "800 29px Baloo 2, sans-serif";
      context.textAlign = "left";
      drawWrappedText(
        context,
        highestReward
          ? `${language === "en" ? "Level" : "Cấp"} ${highestReward.level} · ${rewardLabel(highestReward)}`
          : copy("Cấp hành trình đầu tiên đang chờ bạn!", "Your first Journey Level is waiting!"),
        292,
        986,
        610,
        34
      );
      context.fillStyle = "#756d8d";
      context.font = "700 17px Be Vietnam Pro, sans-serif";
      drawWrappedText(
        context,
        highestReward
          ? rewardDetail(highestReward)
          : copy("Mỗi 10 điểm giúp bạn tiến thêm một Cấp hành trình.", "Every 10 points take you one Journey Level higher."),
        292,
        1040,
        610,
        25
      );

      context.fillStyle = newBadge ? "#e7fbf5" : "#f1edff";
      drawRoundedRectangle(context, 90, 1114, 900, 160, 28);
      context.fill();
      const progressBadge = newBadge ?? nextBadge;
      if (progressBadge) {
        drawBadgeEmblem(174, 1194, 48, progressBadge.id);
        context.textAlign = "left";
        context.fillStyle = newBadge ? "#277569" : "#66598c";
        context.font = "800 16px Be Vietnam Pro, sans-serif";
        context.fillText(
          newBadge ? copy("HUY HIỆU MỚI TRONG LƯỢT NÀY", "NEW BADGE THIS SESSION") : copy("MỤC TIÊU TIẾP THEO", "NEXT JOURNEY GOAL"),
          250,
          1160
        );
        context.fillStyle = "#29316c";
        context.font = "800 27px Baloo 2, sans-serif";
        drawWrappedText(context, language === "en" ? progressBadge.en.label : progressBadge.vi.label, 250, 1194, 620, 31);
        context.fillStyle = "#6e7497";
        context.font = "700 17px Be Vietnam Pro, sans-serif";
        context.fillText(
          newBadge
            ? `${copy("Cấp", "Level")} ${newBadge.threshold / 10} · ${copy("đã mở khóa", "unlocked")}`
            : copy(`Còn ${pointsUntilSouvenirBadge} điểm để mở ở Cấp ${nextBadgeLevel}.`, `${pointsUntilSouvenirBadge} points until Level ${nextBadgeLevel}.`),
          250,
          1244
        );
      } else {
        drawBadgeEmblem(174, 1194, 48, null);
        context.textAlign = "left";
        context.fillStyle = "#8a6d29";
        context.font = "800 16px Be Vietnam Pro, sans-serif";
        context.fillText(copy("BỘ SƯU TẬP HOÀN THÀNH", "BADGE COLLECTION COMPLETE"), 250, 1160);
        context.fillStyle = "#29316c";
        context.font = "800 27px Baloo 2, sans-serif";
        context.fillText(copy("Bạn đã mở đủ 4 huy hiệu!", "You unlocked all 4 badges!"), 250, 1203);
      }
      context.fillStyle = "#b9c8ef";
      context.font = "700 17px Be Vietnam Pro, sans-serif";
      context.textAlign = "center";
      context.fillText(copy("Hana hẹn bạn ở chuyến học tiếp theo!", "Hana will meet you on the next learning flight!"), 540, 1388);

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
  const attemptedQuestions = correctCount + wrongCount;
  const summaryAccuracy = attemptedQuestions ? correctCount / attemptedQuestions : 0;
  const summaryTone =
    attemptedQuestions === 0
      ? "start"
      : summaryAccuracy >= 0.8
        ? "strong"
        : summaryAccuracy >= 0.5
          ? "steady"
          : "practice";
  const summaryHeadline = isTimedTestSummary
    ? {
        lead:
          language === "en"
            ? "Timed test for"
            : "Bài kiểm tra của",
        tail:
          summaryTone === "strong"
            ? copy("Kết quả rất đáng ghi nhận!", "Great result!")
            : summaryTone === "steady"
              ? copy("Cùng xem lại để tiến bộ hơn nhé!", "Review it and grow even more!")
              : copy("Hãy luyện thêm từng bước nhé!", "Let’s practise one step at a time!"),
      }
    : {
        lead:
          language === "en"
            ? "Learning session for"
            : "Lượt học của",
        tail:
          summaryTone === "strong"
            ? copy("rất đáng khen!", "was a strong effort!")
            : summaryTone === "steady"
              ? copy("bạn đã cố gắng thật tốt!", "showed real perseverance!")
              : copy("cùng luyện thêm để tiến bộ nhé!", "let’s keep practising together!"),
      };
  const summaryIntroCopy =
    attemptedQuestions === 0
      ? copy(
          "Hãy bắt đầu vài phép tính để Hana hiểu bạn hơn nhé.",
          "Solve a few questions so Hana can learn with you."
        )
      : summaryTone === "strong"
        ? copy(
            `Bạn làm đúng ${correctCount}/${attemptedQuestions} câu. Khả năng tính toán của bạn đang rất vững!`,
            `You got ${correctCount}/${attemptedQuestions} correct. Your maths skills are growing strong!`
          )
        : summaryTone === "steady"
          ? copy(
              `Bạn làm đúng ${correctCount}/${attemptedQuestions} câu. Hãy xem lại các câu sai rồi thử lại nhé.`,
              `You got ${correctCount}/${attemptedQuestions} correct. Review the missed questions, then try again.`
            )
          : copy(
              `Bạn làm đúng ${correctCount}/${attemptedQuestions} câu. Không sao, Hana sẽ cùng bạn luyện từng bước.`,
              `You got ${correctCount}/${attemptedQuestions} correct. That is okay—Hana will practise step by step with you.`
            );

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
        !showHanaLearningGuide &&
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
                  "Quay lại từ đầu?",
                  "Return to the beginning?"
                )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasSessionPoints
              ? copy(
                  "Điểm và tiến độ của lượt này sẽ được làm mới. Hana sẽ đưa bạn về màn hình đầu tiên.",
                  "This session's points and progress will reset."
                )
              : copy(
                  "Hana sẽ đưa bạn về màn hình đầu tiên để bắt đầu một chuyến học mới.",
                  "Return to the first screen to start again."
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
          <AlertDialogDescription>
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
          soundEnabled={soundEnabled}
          language={language}
        />
      )}
      {screen === "profile" && (
        <PlayerProfileScreen
          name={playerName}
          onNameChange={setPlayerName}
          avatarId={avatarId}
          avatarPhotoUrl={avatarPhotoUrl}
          onAvatarChange={nextAvatarId => {
            setAvatarId(nextAvatarId);
            setAvatarPhotoUrl(null);
          }}
          onAvatarPhotoSelect={selectAvatarPhoto}
          isUploadingAvatar={isPreparingAvatar}
          avatarUploadError={avatarUploadError}
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
          ref={summaryCaptureRef}
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
          <div className="summary-support-line">
            <div className="summary-robot" aria-hidden="true">
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
                : summaryTone === "strong"
                  ? copy("HANA GHI NHẬN SỰ CỐ GẮNG", "HANA NOTICES YOUR EFFORT")
                  : copy("ROBOT HANA ĐỒNG HÀNH", "ROBOT HANA IS WITH YOU")}
            </p>
          </div>
          <h2>
            <span className="summary-heading-player">
              <span>{summaryHeadline.lead}</span>
              <span className="summary-player-identity">
                <PlayerAvatar
                  avatarId={selectedAvatar.id}
                  photoUrl={avatarPhotoUrl}
                  decorative
                />
                <strong>{displayName}</strong>
              </span>
            </span>
            <em>{summaryHeadline.tail}</em>
          </h2>
          <p className="summary-intro">
            {summaryIntroCopy}
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
                  : hasSessionPoints
                    ? `${copy("Cấp", "Level")} 0/${sessionRewards.length}`
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
                      : "HANA CHÚC MỪNG"}
                  </small>
                  <strong>{rewardLabel(highestReward)}</strong>
                  <em>{rewardDetail(highestReward)}</em>
                </span>
              </div>
            ) : (
              <p className="reward-empty">
                {hasSessionPoints
                  ? language === "en"
                    ? `You have ${sessionPoints}/10 points toward Journey Level 1. Keep going!`
                    : `${copy("Còn", "Only")} ${Math.max(1, 10 - (sessionPoints % 10))} ${copy("điểm để đạt Cấp hành trình 1.", "more points to reach Journey Level 1.")}`
                  : language === "en"
                    ? "Solve a few questions to begin your journey."
                    : "Hãy làm vài phép tính để bắt đầu hành trình nhé."}
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
                {sessionThemeBadgeIds.length}/{THEME_BADGES.length}
              </strong>
            </div>
            <div className="collectible-operation-route is-summary" aria-hidden="true">
              <i className="add">+</i><i className="subtract">−</i><i className="multiply">×</i><i className="divide">÷</i>
            </div>
            <div className="theme-badge-row" role="list">
              {THEME_BADGES.map(badge => {
                const badgeCopy = language === "en" ? badge.en : badge.vi;
                const isCollected = sessionThemeBadgeIds.includes(badge.id);
                const isEarnedThisSession = sessionThemeBadges.some(
                  earnedBadge => earnedBadge.id === badge.id
                );
                return (
                  <article
                    key={badge.id}
                    className={`theme-badge-item accent-${badge.accent} ${isCollected ? "is-collected" : "is-locked"}`}
                    role="listitem"
                  >
                    <b className="theme-badge-medallion" aria-hidden="true">
                      <i>{badge.symbol}</i>
                      {!isCollected && <LockKeyhole className="theme-badge-lock" size={15} />}
                    </b>
                    <span>
                      <small className="theme-badge-level">
                        {copy("Cấp", "Level")} {badge.threshold / 10}
                        {isEarnedThisSession
                          ? ` · ${copy("Mới nhận", "New")}`
                          : ""}
                      </small>
                      <strong>{badgeCopy.label}</strong>
                      <small>{badgeCopy.detail}</small>
                      <small className={`theme-badge-status ${isCollected ? "is-collected" : "is-locked"}`}>
                        {isCollected
                          ? copy("Đã mở khóa", "Unlocked")
                          : `${copy("Đang khóa · còn", "Locked ·")} ${Math.max(0, badge.threshold - sessionPoints)} ${copy("điểm", "points")}`}
                      </small>
                    </span>
                  </article>
                );
              })}
            </div>
          </section>
          <div className="summary-actions" data-souvenir-exclude>
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
            <p className="image-save-status" data-souvenir-exclude data-dynamic-text role="status">
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
            className={`mission-orbit-map operation-${question.operation}`}
            aria-hidden="true"
          >
            <span className="mission-orbit-ring ring-one" />
            <span className="mission-orbit-ring ring-two" />
            <span className="mission-orbit-node add">+</span>
            <span className="mission-orbit-node subtract">−</span>
            <span className="mission-orbit-node multiply">×</span>
            <span className="mission-orbit-node divide">÷</span>
          </div>

          <section
            className={`mission-control operation-${question.operation}${isTableMode ? " is-table-mode" : ""}`}
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
                    : operationLabel(question.operation)}{" "}
                  <span>•</span>{" "}
                  {isTableMode
                    ? tableSubtitle(tableKind)
                    : mode === "test"
                      ? copy("Bài kiểm tra tính giờ", "Timed test")
                      : copy("Luyện tập", "Practice")}
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
                  "Xem điểm hiện tại, Cấp hành trình và tiến độ huy hiệu",
                  "View current points, journey level and badge progress"
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
                <small data-dynamic-text>
                  {copy("Chạm để xem", "Tap to view")} <ChevronRight size={13} aria-hidden="true" />
                </small>
              </button>
            </div>
            {!isTableMode && mode === "practice" && (
              <div className="mission-study-controls" data-i18n-direct>
                <section
                  className="mission-study-control-group"
                  aria-label={copy("Chọn loại bài tập", "Choose practice type")}
                >
                  <span>{copy("LOẠI BÀI TẬP", "PRACTICE TYPE")}</span>
                  <div className="mission-format-options">
                    {(Object.keys(practiceFormatMeta) as PracticeFormat[]).map(
                      format => (
                        <button
                          key={format}
                          type="button"
                          aria-pressed={practiceFormat === format}
                          className={practiceFormat === format ? "is-active" : ""}
                          onClick={() => changePracticeFormatInGame(format)}
                        >
                          {practiceFormatName(format, language)}
                        </button>
                      )
                    )}
                  </div>
                </section>
                <section
                  className="mission-study-control-group"
                  aria-label={copy("Chọn mức độ khó", "Choose difficulty")}
                >
                  <span>{copy("MỨC ĐỘ KHÓ", "DIFFICULTY")}</span>
                  <div className="mission-difficulty-options">
                    {(Object.keys(difficultyMeta) as Difficulty[]).map(key => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={difficulty === key}
                        className={difficulty === key ? "is-active" : ""}
                        onClick={() => selectDifficulty(key)}
                      >
                        {difficultyMeta[key].label}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}
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
                    {feedback === "correct" && (
                      <div
                        className="feedback-banner is-correct"
                        data-i18n-direct
                        key={`correct-feedback-${question.id}-${language}`}
                      >
                        <div>
                          <Check size={18} />
                          <span data-dynamic-text>
                            {language === "en"
                              ? `Correct, ${displayName}! +10 points.`
                              : `Đúng rồi, ${displayName}! +10 điểm.`}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="feedback-action is-next"
                          onClick={continueMission}
                        >
                          {mode === "test"
                            ? copy("Câu tiếp", "Next question")
                            : copy("Nhiệm vụ tiếp", "Next mission")}
                          <ChevronRight size={17} />
                        </button>
                      </div>
                    )}
                    {feedback === "wrong" && !showHanaLearningGuide && (
                      <section
                        className="feedback-banner is-wrong"
                        data-i18n-direct
                        key={`wrong-feedback-${question.id}-${language}`}
                      >
                        <div className="feedback-message">
                          <X size={18} />
                          <span>
                            <strong data-dynamic-text>
                              {copy("Chưa đúng", "Not quite")}
                            </strong>
                            <small data-dynamic-text>
                              {copy("−2 điểm", "−2 points")}
                            </small>
                          </span>
                        </div>
                        <div className="wrong-feedback-actions">
                          <button
                            type="button"
                            className="feedback-action is-retry"
                            onClick={retryQuestionAfterHanaGuide}
                          >
                            {copy("Thử lại ngay", "Try again now")}
                          </button>
                          <button
                            type="button"
                            className="feedback-action is-hana-help"
                            onClick={openHanaLearningGuide}
                          >
                            <HelpCircle size={17} />
                            {copy("Xem gợi ý", "See hint")}
                          </button>
                        </div>
                      </section>
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

            {!testComplete && (
              <div
                className="session-bottom-actions"
                aria-label={copy("Điều khiển nhiệm vụ", "Mission controls")}
              >
                <button
                  className="mission-change-button"
                  type="button"
                  onClick={() => {
                    playSound("tap");
                    returnToMissionPicker();
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

      {showHanaLearningGuide && (
        <HanaLearningDialog
          question={question}
          chosenAnswer={answered}
          language={language}
          playerName={displayName}
          step={hanaLearningStep}
          isTimedTest={mode === "test"}
          onPrevious={() => setHanaLearningStep(current => Math.max(0, current - 1))}
          onNext={() =>
            setHanaLearningStep(current =>
              Math.min(question.hintSteps.length - 1, current + 1)
            )
          }
          onRetry={retryQuestionAfterHanaGuide}
        />
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
                        "Ở Luyện tập, chạm Cộng, Trừ, Nhân hoặc Chia để vào ngay Bài bình thường. Bạn có thể đổi sang Tìm thành phần hoặc Cả hai ngay trong lúc học. Với Bảng Nhân và Bảng Chia, hãy chọn bảng trước. Ở Bài kiểm tra, chọn cấp độ và 2, 5 hoặc 10 phút.",
                        "Practice: choose an operation, then switch types. Tables: choose your tables first. Test: choose a level and time."
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
                      "Each correct answer earns +10; a wrong answer costs 2, never below zero. Tap Current points to view your score, answers and study time."
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
                      "Cứ 10 điểm, bạn tăng 1 Cấp. Huy hiệu mở ở Cấp 20, 60, 80 và 100 (200, 600, 800, 1.000 điểm). Mỗi mốc mới mở một hành tinh.",
                      "Every 10 points raises your Journey Level. Badges unlock at Levels 20, 60, 80 and 100 (200, 600, 800 and 1,000 points). Each new milestone opens a planet."
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
                      "Nếu chọn chưa đúng, Hana thường đưa ba bước gợi ý để bạn tự suy nghĩ; phép nhân khó có thể có bốn bước đặt tính. Sau bước cuối, bạn tự thử lại câu đó. Bấm Điểm hiện tại để xem Cấp hành trình và huy hiệu tiếp theo, Đổi nhiệm vụ để giữ điểm, hoặc Kết thúc lượt để xem tổng kết và lưu ảnh kỷ niệm.",
                      "If an answer is not right yet, Hana usually gives three written clues so you can think it through; challenging multiplication can use four column-method steps. After the final step, you try that question yourself. Tap Current points to view your Journey Level and next badge, Change mission to keep your points, or End session to see your summary and save a souvenir image."
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
                  {language === "en"
                    ? "PROGRESS"
                    : `${copy("TIẾN ĐỘ CỦA", "PROGRESS FOR")} ${displayName.toUpperCase()}`}
                </p>
                <h2>{copy("Điểm hiện tại", "Current points")}</h2>
                <p>
                  {nextThemeBadge
                    ? language === "en"
                      ? `Level ${journeyLevel}/100 · ${levelsUntilNextBadge} levels left.`
                      : `Cấp hành trình ${journeyLevel}/100 · còn ${levelsUntilNextBadge} cấp để đạt ${nextThemeBadge.vi.label}.`
                    : copy(
                        "Cấp hành trình 100/100 · bạn đã sưu tập đủ 4 huy hiệu đặc biệt!",
                        "Journey Level 100/100 · you have collected all 4 special badges!"
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
                  {sessionThemeBadgeIds.length}/{THEME_BADGES.length}
                </strong>
              </div>
              <p className="score-journey-note">
                {language === "en"
                  ? `Every 10 points move you forward by 1 Journey Level. ${pointsUntilNextBadge} points remain until the next badge.`
                  : `Mỗi 10 điểm giúp bạn tăng 1 Cấp hành trình. Còn ${pointsUntilNextBadge} điểm để mở huy hiệu tiếp theo.`}
              </p>
              <div className="score-badge-list">
                {THEME_BADGES.map(badge => {
                  const badgeCopy = language === "en" ? badge.en : badge.vi;
                  const isEarned = sessionThemeBadgeIds.includes(badge.id);
                  return (
                    <span className={isEarned ? "is-earned" : "is-locked"} key={badge.id}>
                      <b><i>{badge.symbol}</i>{!isEarned && <LockKeyhole className="score-badge-lock" size={12} />}</b>
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
              "Kết thúc lượt học?",
              "End this learning session?"
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {copy(
              "Hana sẽ lưu kết quả hiện tại và đưa bạn đến màn tổng kết.",
              "Hana saves your results and shows your session summary."
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
