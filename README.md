# Project S.O.P.H.I.A. v1.0.0 — Detached Router / Activation Fix

This build keeps the v2.3.0 low-memory direction but replaces its wake callback architecture.

The persistent router is compiled independently from APP.JS, so it cannot keep the S.O.P.H.I.A. UI closure alive after the holotape closes. Its mode/menuX event callback no longer shares the same 0/1 argument values that were previously used as start/stop commands. This removes a race where normal firmware mode values could accidentally stop or re-arm S.O.P.H.I.A.

MISC and other holotapes keep the transient voice engine destroyed. The router has no timer while blocked. When the user returns to a supported firmware page, it loads the saved companion automatically after navigation settles.

All five companions and the combined STATUS/ENG banks are preserved. Hardware testing on firmware 1.1.6 is required before calling this stable.
