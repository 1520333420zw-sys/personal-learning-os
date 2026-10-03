export interface VoiceLike { lang: string; name: string; default?: boolean; }
export function selectEnglishVoice<T extends VoiceLike>(voices: T[], accent: "GB" | "US"): T | undefined {
  const preferred = accent === "GB" ? ["en-GB", "en_GB"] : ["en-US", "en_US"];
  return voices.find((voice) => preferred.some((tag) => voice.lang.toLowerCase() === tag.toLowerCase()))
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
    ?? voices.find((voice) => voice.default)
    ?? voices[0];
}
export function speakEnglish(text: string, accent: "GB" | "US", rate: .75 | 1 | 1.25): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return false;
  const utterance = new SpeechSynthesisUtterance(text); const voice = selectEnglishVoice(window.speechSynthesis.getVoices(), accent);
  utterance.lang = accent === "GB" ? "en-GB" : "en-US"; utterance.rate = rate; if (voice) utterance.voice = voice;
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance); return true;
}
