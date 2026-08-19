/**
 * Design philosophy: a bright mission-control console over a calm indigo space
 * map. Visual excitement always supports clear Grade 3 mathematics, never hides it.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import html2canvas from "html2canvas";
import {
  Check,
  ChevronRight,
  Gem,
  HelpCircle,
  Rocket,
  Sparkles,
  Star,
  SlidersHorizontal,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { createGameScene, type GameHandle } from "@/game/scene";
import { getStoredEffectsVolume, getStoredMusicVolume, getStoredSoundPreference, HanaAudio, type SoundEffect } from "@/game/audio";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
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
import { formatDuration, practiceFormatMeta, rewardsForPoints, sessionRewards, type PracticeFormat } from "@/game/session";

const ASSETS = {
  mascot: "/manus-storage/robot-mit_d342b189.png",
  planets: "/manus-storage/toan-planets_2d2902d4.png",
  logo: "/manus-storage/phi-hanh-tinh-logo_cbefb56f.png",
} as const;

type AppScreen = "welcome" | "profile" | "menu" | "format" | "game" | "summary";
type ActivityId = "add" | "subtract" | "multiply" | "divide" | "tables" | "test";
type Language = "vi" | "en";

function LanguageControl({ language, onToggle, className = "" }: { language: Language; onToggle: () => void; className?: string }) {
  const code = language === "vi" ? "VIE" : "ENG";
  const title = language === "vi" ? "Tiếng Việt" : "English";
  return <button className={`language-control ${className}`.trim()} type="button" onClick={onToggle} aria-label={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}>
    <span className="language-glyph">A↔</span><span className="language-code">{code}</span><small>{title}</small>
  </button>;
}

function SoundControl({ enabled, language, onToggle, onSettingsOpen, musicVolume, effectsVolume, onMusicVolumeChange, onEffectsVolumeChange, defaultSettingsOpen = false }: { enabled: boolean; language: Language; onToggle: () => void; onSettingsOpen: () => void; musicVolume: number; effectsVolume: number; onMusicVolumeChange: (volume: number) => void; onEffectsVolumeChange: (volume: number) => void; defaultSettingsOpen?: boolean }) {
  const label = language === "en" ? (enabled ? "Sound on" : "Sound off") : (enabled ? "Âm thanh bật" : "Âm thanh tắt");
  return <Popover defaultOpen={defaultSettingsOpen}>
      <PopoverTrigger asChild><button className={`sound-control ${enabled ? "is-on" : "is-off"}`} data-sound-control type="button" onClick={onSettingsOpen} aria-pressed={enabled} aria-label={language === "en" ? "Open sound settings" : "Mở cài đặt âm thanh"}>
        <span className="sound-glyph">{enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</span><span className="sound-label">{language === "en" ? "Sound" : "Âm thanh"}</span><span className="sound-settings-glyph"><SlidersHorizontal size={13} /></span><small>{language === "en" ? "music & effects" : "nhạc & hiệu ứng"}</small>
      </button></PopoverTrigger>
      <PopoverContent align="end" sideOffset={9} className="sound-settings-panel">
        <div className="sound-settings-heading"><span><SlidersHorizontal size={16} /> {language === "en" ? "Sound settings" : "Cài đặt âm thanh"}</span><small>{language === "en" ? "Choose a comfortable level" : "Chọn mức âm lượng dễ chịu"}</small></div>
        <button className={`sound-master-toggle ${enabled ? "is-on" : "is-off"}`} data-sound-master-toggle type="button" onClick={onToggle} aria-pressed={enabled}><span>{enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</span><b>{label}</b><small>{language === "en" ? "Tap to turn all sound on or off" : "Chạm để bật hoặc tắt toàn bộ âm thanh"}</small></button>
        <label className="sound-slider-row"><span><Volume2 size={15} /><b>{language === "en" ? "Background music" : "Nhạc nền"}</b><em>{musicVolume}%</em></span><Slider className="sound-slider" value={[musicVolume]} min={0} max={100} step={1} aria-label={language === "en" ? "Background music volume" : "Âm lượng nhạc nền"} onValueChange={([value]) => onMusicVolumeChange(value ?? 0)} /></label>
        <label className="sound-slider-row"><span><Sparkles size={15} /><b>{language === "en" ? "Sound effects" : "Hiệu ứng âm thanh"}</b><em>{effectsVolume}%</em></span><Slider className="sound-slider" value={[effectsVolume]} min={0} max={100} step={1} aria-label={language === "en" ? "Sound effects volume" : "Âm lượng hiệu ứng"} onValueChange={([value]) => onEffectsVolumeChange(value ?? 0)} /></label>
      </PopoverContent>
    </Popover>;
}

const textOrigins = new WeakMap<Text, string>();
const englishText: Record<string, string> = {
  "Hướng dẫn": "Guide", "Bắt đầu": "Start", "Xem cách chơi": "How to play", "Cùng Hana": "Learn with Hana", "ôn toán học": "math together",
  "Cộng": "Addition", "Trừ": "Subtraction", "Nhân": "Multiplication", "Chia": "Division", "Trở về": "Back", "Chọn nhiệm vụ": "Choose a mission",
  "Bạn muốn chinh phục điều gì?": "What would you like to explore?", "Chạm vào một thẻ để bắt đầu nhé.": "Tap a card to begin.",
  "Chọn dạng bài": "Choose practice type", "Bạn muốn học thế nào?": "How would you like to learn?", "Bài bình thường": "Standard practice", "Tìm thành phần": "Find the missing number", "Cả hai": "Both types",
  "Đổi nhiệm vụ": "Change mission", "Kết thúc lượt": "End session", "Điểm hiện tại": "Current points",
  "ĐIỂM HIỆN TẠI": "CURRENT POINTS", "Bình thường": "Standard", "ROBOT HANA SẴN SÀNG": "ROBOT HANA IS READY", "ROBOT HANA CHỜ BẠN": "ROBOT HANA IS WAITING",
  "Đúng": "Correct", "Sai": "Incorrect", "Điểm": "Points", "Thời gian": "Time", "Câu": "Question", "Xem tổng kết": "View summary",
  "Nhiệm vụ tiếp": "Next mission", "Thử lại": "Try again", "Xem kết quả": "View results", "Chọn Tất Cả": "Select all", "Bỏ Chọn Tất Cả": "Clear all",
  "Bảng nhân": "Multiplication tables", "Bảng chia": "Division tables", "Cả nhân và chia": "Both multiplication & division",
  "Chọn một hoặc nhiều bảng": "Choose one or more tables", "Chọn bảng để luyện nhé": "Choose a table to practise", "Quay lại chơi tiếp": "Keep playing",
  "Lưu ảnh kỷ niệm": "Save souvenir image", "Chơi lượt mới": "Start a new session", "PHẦN THƯỞNG CAO NHẤT": "TOP REWARD", "Chưa mở": "Locked",
  "Hãy trả lời đúng để nhận quà đầu tiên nhé.": "Answer correctly to unlock your first reward!", "Mình đã hiểu": "Got it!", "Đang tạo ảnh...": "Creating image...",
  "Tên phi hành gia": "Astronaut name", "Cùng Hana bắt đầu": "Start with Hana", "Hana nên gọi bạn là gì nhỉ?": "What should Hana call you?",
  "Hana nên gọi bạn": "What should Hana call", "là gì nhỉ?": "you?", "Lượt học của": "Learning session for", "thật đáng tự hào!": "You should be proud!",
  "HANA CHÚC MỪNG": "HANA CONGRATULATES", "ROBOT HANA CHÚC MỪNG": "ROBOT HANA CONGRATULATES",
  "Chưa chọn bảng": "No table selected", "Đang luyện bảng": "Practising table", "bảng đã chọn": "tables selected", "8 câu thử thách": "8-question challenge",
  "Hoàn thành kiểm tra!": "Test complete!", "Bạn đã hoàn thành 8 nhiệm vụ!": "You completed 8 missions!", "Bay thật giỏi!": "You flew brilliantly!", "Cố gắng rất đáng khen!": "Great effort!",
  "TÌM THÀNH PHẦN CHƯA BIẾT": "FIND THE MISSING NUMBER", "NHIỆM VỤ TOÁN HỌC": "MATH MISSION", "NHIỆM VỤ BẢNG NHÂN VÀ CHIA": "TIMES-TABLE MISSION",
  "Tìm số còn thiếu để hoàn thành phép tính.": "Find the missing number to complete the equation.", "Chọn đáp án đúng để nhận điểm thưởng.": "Choose the correct answer to earn points.",
  "CHÀO MỪNG PHI HÀNH GIA NHỎ": "WELCOME, YOUNG ASTRONAUT", "Cùng Robot Hana chinh phục các hoạt động Cộng, Trừ, Nhân và Chia qua những nhiệm vụ thật vui.": "Join Robot Hana for fun addition, subtraction, multiplication and division missions.",
  "PHÉP TÍNH CỘNG": "ADDITION", "PHÉP TÍNH TRỪ": "SUBTRACTION", "PHÉP TÍNH NHÂN": "MULTIPLICATION", "PHÉP TÍNH CHIA": "DIVISION", "BẢNG NHÂN VÀ CHIA": "MULTIPLICATION & DIVISION TABLES", "8 CÂU THỬ THÁCH": "8-QUESTION CHALLENGE",
  "Gộp các nhóm số và tìm tổng thật nhanh.": "Combine number groups and find the total.", "Tìm phần còn lại với những nhiệm vụ ngắn gọn.": "Find what remains in short missions.", "Xếp các nhóm bằng nhau để nhân thật tự tin.": "Multiply equal groups with confidence.", "Chia đều các nhóm số theo nhiệm vụ.": "Share groups equally in each mission.", "Chọn bảng nhân, bảng chia hoặc cả nhân và chia.": "Choose multiplication tables, division tables, or both.", "Hoàn thành tám nhiệm vụ để nhận thật nhiều sao.": "Complete eight missions to earn lots of stars.",
  "Robot Hana:": "Robot Hana:", "bạn làm được mà!": "you can do it!", "HÀNH TINH NHÂN": "MULTIPLICATION PLANET", "HÀNH TINH CỘNG": "ADDITION PLANET", "HÀNH TINH TRỪ": "SUBTRACTION PLANET", "HÀNH TINH CHIA": "DIVISION PLANET",
  "Làm quen": "Getting started", "Tự tin": "Confident", "Thám hiểm": "Explorer", "Khởi động bảng nhân quen thuộc.": "Start with a familiar multiplication fact.",
  "← Trở về": "← Back", "← Trở về chọn hoạt động": "← Back to activities", "Nhập tên của bạn để Hana đồng hành trong mỗi nhiệm vụ và ghi tên bạn lên thẻ kỷ niệm.": "Enter your name so Hana can join every mission and add it to your souvenir card.",
  "TÊN PHI HÀNH GIA": "ASTRONAUT NAME", "Ví dụ: Minh Anh": "Example: Minh Anh", "Gộp các nhóm và tìm tổng.": "Combine groups and find the total.", "Tìm phần còn lại.": "Find what remains.", "Chọn từng bảng hoặc luyện cả nhân và chia.": "Choose tables or practise both operations.",
  "Xếp những nhóm bằng nhau.": "Arrange equal groups.", "Chia đều các nhóm số.": "Share number groups equally.", "Thử sức và nhận sao.": "Try the challenge and earn stars.", "Robot Hana sẽ đồng hành cùng bạn trong mọi chuyến bay.": "Robot Hana will join you on every flight.",
  "Học Bảng Nhân và Chia": "Learn multiplication & division", "Bài kiểm tra": "Test", "CHỌN NHIỆM VỤ": "CHOOSE A MISSION", "Hãy chọn dạng bài phù hợp để Hana bắt đầu lượt học nhé.": "Choose a practice type so Hana can begin your session.",
  "Tính kết quả của phép tính.": "Calculate the answer.", "Tìm số còn thiếu trong phép tính.": "Find the missing number in the equation.", "Luyện xen kẽ cả hai dạng bài.": "Alternate between both practice types.",
  "Nhân và chia xen kẽ": "Mix multiplication and division", "Phi Hành Tinh": "Math Planet", "Phép Tính": "Adventure",
  "BẢNG CỬU CHƯƠNG": "TIMES TABLES", "PHẦN THƯỞNG GẦN NHẤT": "LATEST REWARDS", "TIẾN ĐỘ CỦA": "PROGRESS FOR",
};

function localizeVisibleText(language: Language) {
  const root = document.querySelector(".game-shell");
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    if (node.parentElement?.closest(".language-control, [data-brand-wordmark], [data-sound-control]")) return;
    const original = textOrigins.get(node) ?? node.nodeValue ?? "";
    if (!textOrigins.has(node)) textOrigins.set(node, original);
    if (language === "vi") { node.nodeValue = original; return; }
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
      .replace(/^(.+), dù đúng hay sai, bạn đã kiên trì hoàn thành một chuyến luyện cùng Hana\.$/, "$1, whether right or wrong, you kept going through a session with Hana.")
      .replace(/^Hana đã cất các huy hiệu của (.+) vào khoang phi thuyền!$/, "Hana has stored $1's badges in the spaceship cabin!")
      .replace(/^Robot Hana: “(.+), bạn làm được mà!”$/, "Robot Hana: “$1, you can do it!”")
      .replace(/^Chưa sao đâu, lượt này giảm 2 điểm\. /, "That is okay. This try loses 2 points. ");
    node.nodeValue = `${leading}${translated}${trailing}`;
  });
}

function translateLearningText(text: string, language: Language) {
  if (language === "vi") return text;
  const direct: Record<string, string> = {
    "Khởi động với một phép cộng nhỏ.": "Warm up with a small addition.", "Gộp hai nhóm số lại với nhau.": "Combine two number groups.", "Hoàn thành phép cộng nhiều chữ số.": "Complete a multi-digit addition.",
    "Gỡ bớt đá vũ trụ khỏi đường bay.": "Clear space rocks from the flight path.", "Tìm số còn lại sau phép trừ.": "Find what remains after subtraction.", "Mở lối đi qua vành đai thiên thạch.": "Open a path through the asteroid belt.",
    "Khởi động bảng nhân quen thuộc.": "Start with a familiar multiplication fact.", "Xếp các nhóm bằng nhau để nhân.": "Multiply equal groups.", "Nhân công suất động cơ phi thuyền.": "Multiply the spaceship engine power.",
    "Chia đều các nhóm số.": "Share number groups equally.", "Chia đều nhiên liệu cho các trạm sao.": "Share fuel equally among star stations.", "Tìm thương của phép chia.": "Find the quotient.",
    "Bạn hãy đếm thêm từng bước từ số lớn hơn.": "Count on step by step from the larger number.", "Bạn hãy đặt tính thẳng cột rồi cộng từ hàng đơn vị.": "Line up the numbers and add from the ones place.", "Bạn hãy cộng từng hàng và nhớ nếu cần.": "Add each place value and regroup when needed.",
    "Bạn hãy đếm lùi từ số đầu tiên.": "Count backwards from the first number.", "Bạn hãy đặt tính thẳng cột rồi trừ từ hàng đơn vị.": "Line up the numbers and subtract from the ones place.", "Nếu không đủ để trừ, bạn hãy đổi 1 chục hoặc 1 trăm nhé.": "Regroup a ten or hundred when needed.",
    "Bạn có thể cộng lặp lại hoặc dùng bảng nhân.": "Use repeated addition or a times table.", "Bạn hãy nhân lần lượt với hàng đơn vị rồi hàng chục.": "Multiply the ones place, then the tens place.", "Bạn hãy đổi phép chia thành phép nhân để kiểm tra đáp án.": "Turn division into multiplication to check your answer.",
    "Số còn thiếu chính là kết quả phép chia.": "The missing number is the division answer.", "Số điền vào dấu hỏi là thương của phép chia.": "The number in the question mark is the quotient.",
    "Sau đó chọn kết quả vừa tìm được.": "Then choose the answer you found.", "Chọn số cuối cùng bạn đếm được.": "Choose the last number you counted.",
  };
  if (direct[text]) return direct[text];
  return text
    .replace(/^Bạn hãy nhớ lại bảng nhân (\d+) nhé\.$/, "Remember the $1 times table.")
    .replace(/^Bạn hãy dùng bảng nhân (\d+) để tìm kết quả chia\.$/, "Use the $1 times table to solve the division.")
    .replace(/^Bạn hãy nghĩ: (\d+) nhân mấy thì được (\d+)\?$/, "Think: $1 times what equals $2?")
    .replace(/^Có (\d+) nhóm bằng nhau, mỗi nhóm có (\d+)\.$/, "There are $1 equal groups with $2 in each group.")
    .replace(/^Bạn có thể cộng (\d+) lặp lại (\d+) lần\.$/, "You can add $1, $2 times.")
    .replace(/^Hoặc dùng bảng nhân (\d+) để tìm kết quả\.$/, "Or use the $1 times table to find the answer.")
    .replace(/^Bắt đầu từ (\d+)\.$/, "Start from $1.")
    .replace(/^Đếm thêm (\d+) bước: mỗi bước tăng thêm 1\.$/, "Count on $1 steps, adding 1 each time.")
    .replace(/^Đếm lùi (\d+) bước, mỗi bước giảm 1\.$/, "Count back $1 steps, taking away 1 each time.")
    .replace(/^Đổi (\d+) ÷ (\d+) thành phép nhân (\d+) × \? = (\d+)\.$/, "Turn $1 ÷ $2 into $3 × ? = $4.")
    .replace(/^Đổi (\d+) ÷ (\d+) thành (\d+) × \? = (\d+)\.$/, "Turn $1 ÷ $2 into $3 × ? = $4.")
    .replace(/^Dùng bảng nhân (\d+) để tìm số còn thiếu\.$/, "Use the $1 times table to find the missing number.")
    .replace(/^Khởi động bảng nhân (\d+)\.$/, "Start the $1 multiplication table.")
    .replace(/^Khởi động bảng chia (\d+)\.$/, "Start the $1 division table.");
}

const activityMeta: Record<ActivityId, { label: string; kicker: string; description: string }> = {
  add: { label: "Cộng", kicker: "PHÉP TÍNH CỘNG", description: "Gộp các nhóm số và tìm tổng thật nhanh." },
  subtract: { label: "Trừ", kicker: "PHÉP TÍNH TRỪ", description: "Tìm phần còn lại với những nhiệm vụ ngắn gọn." },
  multiply: { label: "Nhân", kicker: "PHÉP TÍNH NHÂN", description: "Xếp các nhóm bằng nhau để nhân thật tự tin." },
  divide: { label: "Chia", kicker: "PHÉP TÍNH CHIA", description: "Chia đều các nhóm số theo nhiệm vụ." },
  tables: { label: "Học Bảng Nhân và Chia", kicker: "BẢNG NHÂN VÀ CHIA", description: "Chọn bảng nhân, bảng chia hoặc cả nhân và chia." },
  test: { label: "Bài kiểm tra", kicker: "8 CÂU THỬ THÁCH", description: "Hoàn thành tám nhiệm vụ để nhận thật nhiều sao." },
};

function WelcomeScreen({ onStart, onGuide, language, onLanguageToggle, soundEnabled, onSoundToggle, onSoundSettingsOpen, musicVolume, effectsVolume, onMusicVolumeChange, onEffectsVolumeChange, defaultSoundSettingsOpen }: { onStart: () => void; onGuide: () => void; language: Language; onLanguageToggle: () => void; soundEnabled: boolean; onSoundToggle: () => void; onSoundSettingsOpen: () => void; musicVolume: number; effectsVolume: number; onMusicVolumeChange: (volume: number) => void; onEffectsVolumeChange: (volume: number) => void; defaultSoundSettingsOpen: boolean }) {
  return (
    <section className="welcome-screen" aria-label="Chào mừng đến với Phi Hành Tinh Phép Tính">
      <div className="welcome-operation-stage" aria-hidden="true">
        <span className="welcome-flight-orbit orbit-a" /><span className="welcome-flight-orbit orbit-b" />
        <span className="welcome-operation-planet add">+</span><span className="welcome-operation-planet subtract">−</span><span className="welcome-operation-planet multiply">×</span><span className="welcome-operation-planet divide">÷</span>
      </div>
      <div className="welcome-topbar">
        <div className="mini-brand"><span className="mini-brand-rocket"><Rocket size={19} fill="currentColor" /></span><span data-brand-wordmark>Phi Hành Tinh<br />Phép Tính</span></div>
        <div className="topbar-controls"><button type="button" className="welcome-help" onClick={onGuide}><HelpCircle size={17} /> Hướng dẫn</button><SoundControl enabled={soundEnabled} language={language} onToggle={onSoundToggle} onSettingsOpen={onSoundSettingsOpen} musicVolume={musicVolume} effectsVolume={effectsVolume} onMusicVolumeChange={onMusicVolumeChange} onEffectsVolumeChange={onEffectsVolumeChange} defaultSettingsOpen={defaultSoundSettingsOpen} /><LanguageControl language={language} onToggle={onLanguageToggle} /></div>
      </div>
      <div className="welcome-content">
        <div className="welcome-robot" aria-hidden="true"><div className="robot-fallback"><span /><span /><i /></div><span className="robot-orbit" /></div>
        <p className="welcome-brand-flag" data-brand-wordmark>PHI HÀNH TINH <span>PHÉP TÍNH</span></p>
        <p className="welcome-kicker"><Sparkles size={15} /> CHÀO MỪNG PHI HÀNH GIA NHỎ</p>
        <h2><span>Cùng Hana</span><em>ôn toán học</em></h2>
        <p className="welcome-intro">Cùng Robot Hana chinh phục các hoạt động Cộng, Trừ, Nhân và Chia qua những nhiệm vụ thật vui.</p>
        <div className="welcome-actions">
          <button type="button" className="welcome-primary" onClick={onStart}>Bắt đầu <Rocket size={19} fill="currentColor" /></button>
          <button type="button" className="welcome-secondary" onClick={onGuide}><HelpCircle size={18} /> Xem cách chơi</button>
        </div>
        <div className="welcome-path" aria-label="Bốn hành tinh sẽ khám phá">
          <span className="welcome-path-title">HÀNH TRÌNH 4 HÀNH TINH</span>
          <div className="welcome-path-route">
            <span><b className="orange">+</b> Cộng</span><i /><span><b className="purple">−</b> Trừ</span><i /><span><b className="teal">×</b> Nhân</span><i /><span><b className="yellow">÷</b> Chia</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlayerProfileScreen({ name, onNameChange, onBack, onContinue, language, onLanguageToggle }: { name: string; onNameChange: (name: string) => void; onBack: () => void; onContinue: () => void; language: Language; onLanguageToggle: () => void }) {
  return <section className="profile-screen" aria-label="Đặt tên phi hành gia">
    <button type="button" className="format-back" onClick={onBack}>← Trở về</button>
    <div className="format-brand mini-brand" aria-label="Phi Hành Tinh Phép Tính"><span className="mini-brand-rocket"><Rocket size={17} fill="currentColor" /></span><span>Phi Hành Tinh<br />Phép Tính</span></div>
    <LanguageControl className="screen-language-control" language={language} onToggle={onLanguageToggle} />
    <div className="profile-orbit" aria-hidden="true" />
    <div className="profile-hana"><div className="robot-fallback"><span /><span /><i /></div></div>
    <p className="format-kicker">ROBOT HANA CHỜ BẠN</p>
    <h2>Hana nên gọi bạn<br /><em>là gì nhỉ?</em></h2>
    <p>Nhập tên của bạn để Hana đồng hành trong mỗi nhiệm vụ và ghi tên bạn lên thẻ kỷ niệm.</p>
    <label className="profile-name-field"><span>TÊN PHI HÀNH GIA</span><input value={name} maxLength={18} autoFocus placeholder="Ví dụ: Minh Anh" onChange={(event) => onNameChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && name.trim()) onContinue(); }} /></label>
    <button type="button" className="profile-continue" disabled={!name.trim()} onClick={onContinue}>Cùng Hana bắt đầu <Rocket size={18} /></button>
  </section>;
}

function ActivityMenu({ onBack, onGuide, onChoose, language, onLanguageToggle }: { onBack: () => void; onGuide: () => void; onChoose: (activity: ActivityId) => void; language: Language; onLanguageToggle: () => void }) {
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
        <div className="topbar-controls"><button type="button" className="welcome-help" onClick={onGuide}><HelpCircle size={17} /> Hướng dẫn</button><LanguageControl language={language} onToggle={onLanguageToggle} /></div>
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

function PracticeFormatScreen({ operation, playerName, onBack, onStart, language, onLanguageToggle }: { operation: Operation; playerName: string; onBack: () => void; onStart: (format: PracticeFormat) => void; language: Language; onLanguageToggle: () => void }) {
  const activity = activityMeta[operation];
  const options: Array<{ format: PracticeFormat; symbol: string; description: string }> = [
    { format: "standard", symbol: "✓", description: "Tính kết quả của phép tính." },
    { format: "missing", symbol: "?", description: "Tìm số còn thiếu trong phép tính." },
    { format: "mixed", symbol: "↻", description: "Luyện xen kẽ cả hai dạng bài." },
  ];
  return <section className="format-screen" aria-label="Chọn dạng bài">
    <button type="button" className="format-back" onClick={onBack}>← Trở về chọn hoạt động</button>
    <div className="format-brand mini-brand" aria-label="Phi Hành Tinh Phép Tính"><span className="mini-brand-rocket"><Rocket size={17} fill="currentColor" /></span><span>Phi Hành Tinh<br />Phép Tính</span></div>
    <LanguageControl className="screen-language-control" language={language} onToggle={onLanguageToggle} />
    <div className="format-orbit" aria-hidden="true" />
    <div className="format-hana"><div className="robot-fallback"><span /><span /><i /></div></div>
    <p className="format-kicker">ROBOT HANA SẴN SÀNG</p>
    <h2>{activity.label}<br /><em>Bạn muốn học thế nào?</em></h2>
    <p className="format-intro">{language === "en" ? `${playerName}, choose a practice type before Hana starts your learning session.` : `${playerName}, hãy chọn một dạng bài trước khi Hana khởi động lượt học của bạn.`}</p>
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
  const summaryRef = useRef<HTMLElement>(null);
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
  const isSoundSettingsDemo = demoParams.has("soundsettings");
  const isMaxRewardDemo = demoParams.has("maxrewards");
  const forceCanvasFallback = demoParams.has("nowebgl");
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
  const lastShownQuestionExpressionRef = useRef(question.expression);
  const lastTableSelectionRef = useRef<string | null>(null);
  const [tableKind, setTableKind] = useState<TablePracticeKind>(tableDemoKind);
  const [selectedTables, setSelectedTables] = useState<number[]>(isTableDemo ? [2, 4, 6] : []);
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
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [imageSaveStatus, setImageSaveStatus] = useState("");
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [language, setLanguage] = useState<Language>(() => demoParams.get("lang") === "en" || window.localStorage.getItem("hana-language") === "en" ? "en" : "vi");
  const [soundEnabled, setSoundEnabled] = useState(getStoredSoundPreference);
  const [musicVolume, setMusicVolume] = useState(getStoredMusicVolume);
  const [effectsVolume, setEffectsVolume] = useState(getStoredEffectsVolume);
  const audioRef = useRef<HanaAudio | null>(null);
  const displayName = playerName.trim() || (language === "en" ? "Young astronaut" : "Phi hành gia nhỏ");
  const copy = (vietnamese: string, english: string) => language === "en" ? english : vietnamese;
  const operationLabel = (value: Operation) => language === "en" ? ({ add: "Addition", subtract: "Subtraction", multiply: "Multiplication", divide: "Division" }[value]) : activityMeta[value].label;
  const tableLabel = (value: TablePracticeKind) => language === "en" ? ({ multiply: "Multiplication tables", divide: "Division tables", mixed: "Both multiplication & division" }[value]) : tableKindMeta[value].label;
  const tableSubtitle = (value: TablePracticeKind) => language === "en" ? ({ multiply: "Practise one multiplication table", divide: "Practise one division table", mixed: "Mix multiplication and division" }[value]) : tableKindMeta[value].subtitle;
  const rewardLabel = (reward: (typeof sessionRewards)[number]) => {
    if (language !== "en") return reward.label;
    if (reward.level === 100) return "Hana Captain's Trophy";
    const rewardFamilies = ["Little Star Sticker", "Explorer Badge", "Junior Pilot Trophy"];
    return `${rewardFamilies[(reward.level - 1) % rewardFamilies.length]} · Level ${reward.level}`;
  };
  const rewardDetail = (reward: (typeof sessionRewards)[number]) => language === "en" ? "A new treasure for your space collection." : reward.detail;

  useEffect(() => {
    const audio = new HanaAudio(soundEnabled, musicVolume, effectsVolume);
    audioRef.current = audio;
    return () => audio.dispose();
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
    while ((!isQuestionConsistent(candidate) || recentQuestionExpressionsRef.current.includes(candidate.expression) || candidate.expression === lastShownQuestionExpressionRef.current) && attempts < 50) {
      candidate = buildQuestion();
      attempts += 1;
    }
    if (!isQuestionConsistent(candidate)) throw new Error("Không thể tạo câu hỏi Toán hợp lệ.");
    recentQuestionExpressionsRef.current = [...recentQuestionExpressionsRef.current, candidate.expression].slice(-5);
    lastShownQuestionExpressionRef.current = candidate.expression;
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
    const supportsWebGL = !forceCanvasFallback && Engine.IsSupported;
    if (!supportsWebGL) {
      setWebglUnavailable(true);
      return;
    }

    let engine: Engine;
    try {
      engine = new Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        adaptToDeviceRatio: true,
      });
    } catch (error) {
      console.warn("Thiết bị không hỗ trợ WebGL; dùng nền vũ trụ 2D.", error);
      setWebglUnavailable(true);
      return;
    }

    startedRef.current = true;
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
      .catch((error) => {
        console.warn("Không thể khởi tạo bản đồ hành tinh; dùng nền vũ trụ 2D.", error);
        if (!disposed) {
          engine.dispose();
          startedRef.current = false;
          setWebglUnavailable(true);
        }
      });

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
  }, [forceCanvasFallback, initialOperation, isDemo, isTableDemo]);

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
    const excludedExpressions = [...recentQuestionExpressionsRef.current, lastShownQuestionExpressionRef.current];
    const tableQuestion = freshQuestion(() => generateTableQuestion({ kind: tableKind, tables: selectedTables, excludedExpressions }));
    setOperation(tableQuestion.operation);
    setQuestion(tableQuestion);
    setAnswered(null);
    setFeedback("idle");
    handleRef.current?.setActivePlanet(tableQuestion.operation);
  }, [freshQuestion, mode, selectedTables, tableKind]);

  const startActivity = (nextActivity: ActivityId) => {
    playSound("launch");
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
      setTablePractice(tableKind, []);
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
    playSound("launch");
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
    const isAddingTable = !selectedTables.includes(table);
    const nextTables = selectedTables.includes(table)
      ? (selectedTables.length === 1 ? selectedTables : selectedTables.filter((item) => item !== table))
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
        playSound("correct");
        setFeedback("correct");
        setCorrectCount((current) => current + 1);
        setSessionPoints((current) => current + 10);
        if (mode === "test") setTestCorrect((current) => current + 1);
      } else {
        playSound("wrong");
        setFeedback("wrong");
        setWrongCount((current) => current + 1);
        setSessionPoints((current) => Math.max(0, current - 2));
      }
    },
    [answered, mode, playSound, question.answer, selectedTables.length, testComplete],
  );

  const continueMission = () => {
    if (mode === "tables" && selectedTables.length === 0) return;
    playSound(feedback === "wrong" ? "tap" : "next");
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
    playSound("reward");
    setElapsedSeconds(currentDuration());
    setScreen("summary");
  };

  const earnedRewards = rewardsForPoints(sessionPoints);
  const highestReward = earnedRewards.at(-1);
  const nextReward = sessionRewards.find((reward) => sessionPoints < reward.threshold);
  const pointsUntilReward = nextReward ? nextReward.threshold - sessionPoints : 0;

  useEffect(() => {
    window.localStorage.setItem("hana-language", language);
    document.documentElement.lang = language;
    const frame = window.requestAnimationFrame(() => localizeVisibleText(language));
    return () => window.cancelAnimationFrame(frame);
  }, [language, screen, showGuide, showScorePanel, feedback, question, tableKind, selectedTables.length, difficulty, sessionPoints, correctCount, wrongCount, elapsedSeconds, playerName, isSavingImage, imageSaveStatus]);

  const saveSessionImage = async () => {
    if (isSavingImage) return;
    setIsSavingImage(true);
    setImageSaveStatus("Hana đang tạo ảnh kỷ niệm...");
    const downloadSouvenirBlob = async (blob: Blob) => {
      const fileName = `hanh-trinh-hana-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const canUseNativeShare = window.matchMedia("(pointer: coarse)").matches && typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

      if (canUseNativeShare) {
        try {
          await navigator.share({ title: "Ảnh kỷ niệm cùng Robot Hana", text: `Lượt học của ${displayName}`, files: [file] });
          setImageSaveStatus("Bạn có thể chọn Lưu ảnh trong bảng chia sẻ nhé!");
        } catch (error) {
          if ((error as DOMException).name === "AbortError") setImageSaveStatus("Bạn chưa lưu ảnh. Bấm nút để thử lại nhé.");
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
      setImageSaveStatus("Ảnh đã được gửi vào mục Tải xuống của thiết bị.");
    };
    const drawRoundedRectangle = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
      const corner = Math.min(radius, width / 2, height / 2);
      context.beginPath();
      context.moveTo(x + corner, y);
      context.arcTo(x + width, y, x + width, y + height, corner);
      context.arcTo(x + width, y + height, x, y + height, corner);
      context.arcTo(x, y + height, x, y, corner);
      context.arcTo(x, y, x + width, y, corner);
      context.closePath();
    };
    const drawWrappedText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(" ");
      let line = "";
      let lineY = y;
      words.forEach((word) => {
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
    canvas.width = 1200;
    canvas.height = 790;
    const context = canvas.getContext("2d");
    if (!context) {
      setImageSaveStatus("Thiết bị này chưa thể tạo ảnh. Bạn hãy thử lại trên trình duyệt khác nhé.");
      setIsSavingImage(false);
      return;
    }

    try {
      if (summaryRef.current) {
        try {
          const summaryImage = await html2canvas(summaryRef.current, {
            allowTaint: false,
            backgroundColor: null,
            logging: false,
            scale: Math.min(window.devicePixelRatio || 1, 2),
            useCORS: true,
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth,
          });
          const summaryBlob = await new Promise<Blob>((resolve, reject) => {
            summaryImage.toBlob((imageBlob) => imageBlob ? resolve(imageBlob) : reject(new Error("Không thể tạo ảnh màn tổng kết")), "image/png");
          });
          await downloadSouvenirBlob(summaryBlob);
          return;
        } catch (captureError) {
          console.warn("Không thể chụp toàn bộ màn tổng kết, chuyển sang thẻ dự phòng", captureError);
          setImageSaveStatus("Hana đang dùng thẻ kỷ niệm dự phòng...");
        }
      }
      await document.fonts?.ready;
      const drawOrbit = (x: number, y: number, radiusX: number, radiusY: number, rotation: number, color: string) => {
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
      const drawPlanet = (x: number, y: number, radius: number, lightColor: string, deepColor: string, withRing = false) => {
        context.save();
        context.shadowColor = "rgba(2, 6, 37, .36)";
        context.shadowBlur = 22;
        context.shadowOffsetY = 10;
        const fill = context.createRadialGradient(x - radius * .32, y - radius * .35, radius * .08, x, y, radius);
        fill.addColorStop(0, lightColor);
        fill.addColorStop(.58, deepColor);
        fill.addColorStop(1, "#242b70");
        context.fillStyle = fill;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.shadowColor = "transparent";
        context.fillStyle = "rgba(255,255,255,.18)";
        context.beginPath();
        context.arc(x - radius * .25, y - radius * .28, radius * .25, 0, Math.PI * 2);
        context.fill();
        if (withRing) {
          context.strokeStyle = "rgba(255,255,255,.55)";
          context.lineWidth = 5;
          context.beginPath();
          context.ellipse(x, y, radius * 1.44, radius * .48, -.32, 0, Math.PI * 2);
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
        context.arc(0, 8, 11, .15, Math.PI - .15);
        context.stroke();
        context.fillStyle = "rgba(34, 73, 133, .2)";
        context.beginPath();
        context.ellipse(0, 62, 60, 12, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      };
      const background = context.createLinearGradient(0, 0, 1200, 790);
      background.addColorStop(0, "#101b62");
      background.addColorStop(1, "#2b175e");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(255,255,255,0.26)";
      for (let index = 0; index < 44; index += 1) {
        context.beginPath();
        context.arc((index * 89) % 1180 + 12, (index * 53) % 760 + 18, index % 3 === 0 ? 4 : 2, 0, Math.PI * 2);
        context.fill();
      }
      drawOrbit(600, 164, 485, 160, -.09, "rgba(150, 220, 255, .38)");
      drawOrbit(616, 185, 360, 118, .18, "rgba(124, 238, 210, .31)");
      drawPlanet(141, 146, 67, "#ffd2a6", "#ea7d72", true);
      drawPlanet(1060, 142, 49, "#e6ddff", "#ac9ce4", false);
      drawPlanet(1045, 660, 74, "#d6fff1", "#57c9b0", true);
      drawHana(600, 130);
      context.fillStyle = "#fff9e3";
      context.font = "800 48px Baloo 2, Trebuchet MS, sans-serif";
      context.textAlign = "center";
      context.fillText("Phi Hành Tinh Phép Tính", 600, 250);
      context.fillStyle = "#7de4d1";
      context.font = "800 21px Be Vietnam Pro, Trebuchet MS, sans-serif";
      context.fillText(`KỶ NIỆM LƯỢT HỌC CỦA ${displayName.toUpperCase()} CÙNG ROBOT HANA`, 600, 286);
      context.fillStyle = "#fff8df";
      drawRoundedRectangle(context, 72, 324, 1056, 196, 32);
      context.fill();
      const stats = [["Điểm", `${sessionPoints}`], ["Đúng", `${correctCount}`], ["Sai", `${wrongCount}`], ["Thời gian", formatDuration(currentDuration())]];
      stats.forEach(([label, value], index) => {
        const x = 118 + index * 254;
        context.fillStyle = "#766f94";
        context.font = "700 23px Be Vietnam Pro, sans-serif";
        context.textAlign = "left";
        context.fillText(label, x, 388);
        context.fillStyle = "#292963";
        context.font = "800 64px Baloo 2, sans-serif";
        context.fillText(value, x, 466);
      });
      context.fillStyle = "#f3eee0";
      drawRoundedRectangle(context, 72, 558, 1056, 170, 26);
      context.fill();
      context.fillStyle = "#5f5d89";
      context.font = "700 21px Be Vietnam Pro, sans-serif";
      context.fillText("PHẦN THƯỞNG CAO NHẤT", 220, 610);
      const badgeFill = context.createRadialGradient(150, 655, 8, 150, 655, 58);
      badgeFill.addColorStop(0, "#fffbe0");
      badgeFill.addColorStop(.64, "#ffd66d");
      badgeFill.addColorStop(1, "#ec9a48");
      context.fillStyle = badgeFill;
      context.beginPath();
      context.arc(150, 657, 54, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#8a4211";
      context.font = "800 43px Baloo 2, sans-serif";
      context.textAlign = "center";
      context.fillText(highestReward?.symbol ?? "✦", 150, 672);
      context.fillStyle = "#2b2e69";
      context.font = "800 30px Baloo 2, sans-serif";
      const rewardText = highestReward ? `${highestReward.symbol} ${language === "en" ? "Level" : "Cấp"} ${highestReward.level}: ${rewardLabel(highestReward)}` : language === "en" ? "Answer correctly to unlock your first reward!" : "Hãy trả lời đúng để nhận quà đầu tiên nhé!";
      context.textAlign = "left";
      drawWrappedText(context, rewardText, 220, 656, 840, 38);
      context.fillStyle = "#756d8d";
      context.font = "700 18px Be Vietnam Pro, sans-serif";
      drawWrappedText(context, highestReward ? rewardDetail(highestReward) : language === "en" ? "Solve a few more questions with Hana to unlock your first reward!" : "Cùng Hana làm thêm vài phép tính để mở phần thưởng đầu tiên nhé!", 220, 704, 820, 27);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((imageBlob) => imageBlob ? resolve(imageBlob) : reject(new Error("Không thể tạo tệp PNG")), "image/png");
      });
      await downloadSouvenirBlob(blob);
    } catch (error) {
      console.error("Không thể lưu ảnh kỷ niệm", error);
      setImageSaveStatus("Hana chưa thể lưu ảnh. Bạn hãy thử lại nhé.");
    } finally {
      setIsSavingImage(false);
    }
  };

  const isTableMode = mode === "tables";
  const hasSelectedTables = selectedTables.length > 0;
  const hasAllTables = selectedTables.length === TIMES_TABLES.length;
  const activeActivity = activityMeta[selectedActivity];

  return (
    <main className="game-shell">
      <canvas ref={canvasRef} className={webglUnavailable ? "game-canvas is-hidden" : "game-canvas"} aria-label="Không gian trò chơi toán học" />
      {webglUnavailable && <div className="space-fallback" aria-hidden="true"><span className="fallback-planet coral" /><span className="fallback-planet lavender" /><span className="fallback-planet mint" /><span className="fallback-orbit one" /><span className="fallback-orbit two" /><span className="fallback-stars">✦ · ✧ · ★ · ✦ · ✧</span></div>}
      <div className="space-atmosphere" aria-hidden="true" />

      {screen === "welcome" && <WelcomeScreen onStart={() => { playSound("launch"); setScreen("profile"); }} onGuide={() => { playSound("tap"); setShowGuide(true); }} language={language} onLanguageToggle={() => setLanguage((current) => current === "vi" ? "en" : "vi")} soundEnabled={soundEnabled} onSoundToggle={toggleSound} onSoundSettingsOpen={() => playSound("tap")} musicVolume={musicVolume} effectsVolume={effectsVolume} onMusicVolumeChange={changeMusicVolume} onEffectsVolumeChange={changeEffectsVolume} defaultSoundSettingsOpen={isSoundSettingsDemo} />}
      {screen === "profile" && <PlayerProfileScreen name={playerName} onNameChange={setPlayerName} onBack={() => setScreen("welcome")} onContinue={() => { playSound("launch"); setScreen("menu"); }} language={language} onLanguageToggle={() => setLanguage((current) => current === "vi" ? "en" : "vi")} />}
      {screen === "menu" && <ActivityMenu onBack={() => setScreen("welcome")} onGuide={() => setShowGuide(true)} onChoose={startActivity} language={language} onLanguageToggle={() => setLanguage((current) => current === "vi" ? "en" : "vi")} />}
      {screen === "format" && <PracticeFormatScreen operation={operation} playerName={displayName} onBack={() => setScreen("menu")} onStart={beginPractice} language={language} onLanguageToggle={() => setLanguage((current) => current === "vi" ? "en" : "vi")} />}
      {screen === "summary" && <section ref={summaryRef} className="summary-screen" aria-label="Tổng kết lượt chơi">
        <div className="summary-brand mini-brand" aria-label="Phi Hành Tinh Phép Tính"><span className="mini-brand-rocket"><Rocket size={17} fill="currentColor" /></span><span data-brand-wordmark>Phi Hành Tinh<br />Phép Tính</span></div>
        <LanguageControl className="summary-language-control" language={language} onToggle={() => setLanguage((current) => current === "vi" ? "en" : "vi")} />
        <div className="summary-orbit" aria-hidden="true" />
        <div className="summary-journey" aria-hidden="true"><i className="add">+</i><i className="subtract">−</i><i className="multiply">×</i><i className="divide">÷</i></div>
        <div className="summary-stars" aria-hidden="true"><span>✦</span><span>★</span><span>✦</span></div>
        <div className="summary-robot"><div className="robot-fallback"><span /><span /><i /></div></div>
        <p className="summary-kicker">ROBOT HANA CHÚC MỪNG {displayName.toUpperCase()}</p>
        <h2>Lượt học của {displayName}<br /><em>thật đáng tự hào!</em></h2>
        <p className="summary-intro">{language === "en" ? `${displayName}, whether right or wrong, you kept going through a session with Hana.` : `${displayName}, dù đúng hay sai, bạn đã kiên trì hoàn thành một chuyến luyện cùng Hana.`}</p>
        <p className="summary-hana-line">{language === "en" ? `Hana has stored ${displayName}'s badges in the spaceship cabin!` : `Hana đã cất các huy hiệu của ${displayName} vào khoang phi thuyền!`}</p>
        <div className="summary-stats">
          <div><span>Điểm</span><strong>{sessionPoints}</strong></div>
          <div><span>Đúng</span><strong>{correctCount}</strong></div>
          <div><span>Sai</span><strong>{wrongCount}</strong></div>
          <div><span>Thời gian</span><strong>{formatDuration(elapsedSeconds)}</strong></div>
        </div>
        <section className="reward-board highest-reward-board" aria-label="Phần thưởng cao nhất trong lượt chơi">
          <div className="reward-board-heading"><span>PHẦN THƯỞNG CAO NHẤT</span><strong>{earnedRewards.length ? `Cấp ${highestReward?.level}/${sessionRewards.length}` : "Chưa mở"}</strong></div>
          {highestReward ? <div className="highest-reward"><b>{highestReward.symbol}</b><span><small>HANA CHÚC MỪNG {displayName.toUpperCase()}</small><strong>{rewardLabel(highestReward)}</strong><em>{rewardDetail(highestReward)}</em></span></div> : <p className="reward-empty">{displayName}, bạn hãy trả lời đúng để mở phần thưởng đầu tiên nhé.</p>}
        </section>
        <div className="summary-actions">
          <button type="button" className="save-memory" onClick={saveSessionImage} disabled={isSavingImage}>{isSavingImage ? "Đang tạo ảnh..." : "Lưu ảnh kỷ niệm"} <Sparkles size={18} /></button>
          <button type="button" className="summary-again" onClick={() => { setSessionStartedAt(null); setScreen("menu"); }}>Chơi lượt mới <Rocket size={18} /></button>
        </div>
        {imageSaveStatus && <p className="image-save-status" role="status">{imageSaveStatus}</p>}
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
            <p className="eyebrow">{copy("PHI HÀNH GIA:", "ASTRONAUT:")} {displayName.toUpperCase()}</p>
            <h1>{language === "en" ? <>Math Planet<br />Adventure</> : <>Phi Hành Tinh<br />Phép Tính</>}</h1>
          </div>
        </div>
        <div className="mission-actions">
          <button className="mission-menu-button" type="button" onClick={() => setScreen("menu")}><span>↔</span> Đổi nhiệm vụ</button>
          <button className="mission-menu-button mission-end-button" type="button" onClick={finishSession}><span>■</span> Kết thúc lượt</button>
          <LanguageControl className="mission-language-control" language={language} onToggle={() => setLanguage((current) => current === "vi" ? "en" : "vi")} />
        </div>
        <button className="reward-progress" type="button" onClick={() => setShowScorePanel(true)} aria-label="Xem điểm hiện tại và tiến độ nhận quà">
          <span className="reward-progress-icon">{nextReward?.symbol ?? "♛"}</span>
          <span><small>{copy("ĐIỂM HIỆN TẠI", "CURRENT POINTS")}</small><strong>{sessionPoints}</strong><em>{nextReward ? language === "en" ? `${pointsUntilReward} points until ${rewardLabel(nextReward)}` : `Còn ${pointsUntilReward} điểm nhận ${rewardLabel(nextReward)}` : copy("Đã mở đủ phần thưởng!", "All rewards unlocked!")}</em></span>
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
        <span className="mission-orbit-status">{language === "en" ? `${operationLabel(operation).toUpperCase()} PLANET` : `HÀNH TINH ${operationLabel(operation).toUpperCase()}`}</span>
      </div>

      <aside className="robot-guide" aria-label="Robot Hana hướng dẫn">
        <div className="robot-fallback" aria-hidden="true"><span /><span /><i /></div>
        <div className="robot-note"><span className="robot-note-dot" />{language === "en" ? `Robot Hana: “${displayName}, you can do it!”` : `Robot Hana: “${displayName}, bạn làm được mà!”`}</div>
      </aside>

      <section className="mission-control" aria-label="Bảng điều khiển bài tập">
        <div className="console-topline">
          <div className="mascot-wrap">
            <span className="speech-spark"><Sparkles size={14} /></span>
          </div>
          <div className="console-title">
            <p>{isTableMode ? copy("Học Bảng Nhân và Chia", "Learn multiplication & division") : operationLabel(operation)} <span>•</span> {isTableMode ? tableSubtitle(tableKind) : mode === "test" ? copy("8 câu thử thách", "8-question challenge") : practiceFormatMeta[practiceFormat].shortLabel}</p>
            <h3>{testComplete ? copy("Hoàn thành kiểm tra!", "Test complete!") : isTableMode && !hasSelectedTables ? copy("Hãy chọn ít nhất một bảng để bắt đầu.", "Choose at least one table to begin.") : translateLearningText(question.mission, language)}</h3>
          </div>
          <div className="mission-counter">
            <span>{mode === "test" ? copy("Câu", "Question") : copy("Điểm hiện tại", "Current points")}</span>
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
                    <span>{copy("BẢNG CỬU CHƯƠNG", "TIMES TABLES")}</span>
                    <strong>{tableLabel(tableKind)}</strong>
                  </div>
                  <p>{!hasSelectedTables ? copy("Chưa chọn bảng", "No table selected") : selectedTables.length === 1 ? language === "en" ? `Practising the ${selectedTables[0]} table` : `Đang luyện bảng ${selectedTables[0]}` : language === "en" ? `${selectedTables.length} tables selected` : `${selectedTables.length} bảng đã chọn`}</p>
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
                      {tableLabel(kind)}
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
            <div className="question-panel" key={`prompt-${question.id}`}>
              <span className="question-label">{isTableMode ? "NHIỆM VỤ BẢNG NHÂN VÀ CHIA" : question.kind === "missing" ? "TÌM THÀNH PHẦN CHƯA BIẾT" : "NHIỆM VỤ TOÁN HỌC"}</span>
              <p className="math-expression">{question.expression}</p>
              <p className="math-helper">{question.kind === "missing" ? "Tìm số còn thiếu để hoàn thành phép tính." : "Chọn đáp án đúng để nhận điểm thưởng."}</p>
            </div>
            <div className="answer-grid" key={`answers-${question.id}`} aria-label={`Đáp án cho ${question.expression}`}>
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
                {feedback === "correct" ? <div><Check size={18} /><span>{language === "en" ? `Correct, ${displayName}! +10 points. ${nextReward ? `${pointsUntilReward} points until ${rewardLabel(nextReward)}.` : "You have unlocked every reward!"}` : `Đúng rồi, ${displayName}! +10 điểm. ${nextReward ? `Còn ${pointsUntilReward} điểm để nhận ${rewardLabel(nextReward)}.` : "Bạn đã mở đủ phần thưởng!"}`}</span></div> : <div className="hana-hint">
                  <div className="hana-hint-robot" aria-label="Robot Hana đang gợi ý"><span /><span /><i /></div>
                  <div className="hana-hint-copy"><strong>{language === "en" ? `Robot Hana's hint for ${displayName}:` : `Robot Hana gợi ý cho ${displayName}:`}</strong><span>{language === "en" ? `That is okay. This try loses 2 points. ${translateLearningText(question.hint, language)}` : `Chưa sao đâu, lượt này giảm 2 điểm. ${translateLearningText(question.hint, language)}`}</span><ol>{question.hintSteps.map((step) => <li key={step}>{translateLearningText(step, language)}</li>)}</ol></div>
                </div>}
                <button type="button" className={`feedback-action ${feedback === "correct" ? "is-next" : "is-retry"}`} onClick={continueMission}>
                  {feedback === "correct" ? (mode === "test" && testStep + 1 >= 8 ? copy("Xem kết quả", "View results") : copy("Nhiệm vụ tiếp", "Next mission")) : copy("Thử lại", "Try again")}
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
              <div><p className="eyebrow">{copy("TIẾN ĐỘ CỦA", "PROGRESS FOR")} {displayName.toUpperCase()}</p><h2>{copy("Điểm hiện tại", "Current points")}</h2><p>{nextReward ? language === "en" ? `${pointsUntilReward} points to unlock ${rewardLabel(nextReward)}.` : `Còn ${pointsUntilReward} điểm để mở ${rewardLabel(nextReward)}.` : copy("Bạn đã mở trọn bộ 100 phần thưởng rồi!", "You have unlocked all 100 rewards!")}</p></div>
            </div>
            <div className="score-stats">
              <div><span>Điểm</span><strong>{sessionPoints}</strong></div>
              <div><span>Đúng</span><strong>{correctCount}</strong></div>
              <div><span>Sai</span><strong>{wrongCount}</strong></div>
              <div><span>Thời gian</span><strong>{formatDuration(currentDuration())}</strong></div>
            </div>
            <section className="score-reward-board" aria-label="Phần thưởng đã mở">
              <div><span>PHẦN THƯỞNG GẦN NHẤT</span><strong>{earnedRewards.length}/{sessionRewards.length}</strong></div>
              {earnedRewards.length ? <div className="score-reward-list">{earnedRewards.slice(-6).map((reward) => <span key={reward.id}><b>{reward.symbol}</b><em>{copy("Cấp", "Level")} {reward.level}</em><small>{rewardLabel(reward)}</small></span>)}</div> : <p>{copy("Hãy trả lời đúng để mở phần thưởng đầu tiên nhé.", "Answer correctly to unlock your first reward!")}</p>}
            </section>
            <button type="button" className="primary-action score-continue" onClick={() => setShowScorePanel(false)}>Quay lại chơi tiếp <Rocket size={18} /></button>
          </section>
        </div>
      )}
    </main>
  );
}
