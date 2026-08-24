# S.O.P.H.I.A. V3 — VOICE72 Memory-Safe Test

PROJECT SOPHIA / YES MAN V3 TEST RULES  
  
- 72 user-selected MP3 recordings converted to 16 kHz mono signed 16-bit PCM in one bank.  
- No background Pip.on(knob1) or Pip.onExclusive(knob1) in YES_MAN_SERVICE.JS.  
- No setInterval in YES_MAN_SERVICE.JS. One scheduled setTimeout exists at a time.  
- Maximum 3 CPU/highlight responses per unchanged highlight.  
- After response 1 and response 2, next response is delayed by a fresh random 1-30 seconds.  
- Highlight change resets the counter and cancels the old context naturally on next check.  
- MAP silent. STATUS RAD silent. RADIO/FM silent. Other active audio/video blocks playback and does not consume the 3-response limit.  
- STATUS CND/EFF/CLK/ENG detection is passive only; if firmware does not expose a safely readable subpage field, Sophia stays silent rather than taking knob ownership.  
- FO3/FNV mode-change lines are included. The service only triggers them when the firmware exposes a recognizable string-valued game-mode field or selected setting text; numeric mode values are intentionally not guessed.  


V3.2 runtime update: Yes Man voice extraction is chunked/yielded to reduce UI pauses during scrolling. Follow-up delays are now random 1-30 seconds.


V3.23 LOW-MEMORY TEST
- Persistent service is loaded with Function() global scope so it cannot retain the S.O.P.H.I.A. UI closure.
- Standalone remove handler lets UI/menu objects be reclaimed after exit.
- Removed obsolete YES_MAN_CPU.JS and YES_MAN_READER.JS legacy path.
- Preserves V3.22 hardware-proven menu/status/mode behavior.
