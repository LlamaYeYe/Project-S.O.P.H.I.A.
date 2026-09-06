(function() {
    const fs = require("fs"),
        appPath = "HOLO/PROJECT_SOPHIA/";

    let pendingTimer = 0,
        active = 1,
        enabled = 0,
        companionId = "YES_MAN",
        retryCount = 0;

    try {
        let config = JSON.parse(fs.readFileSync(appPath + "SOPHIA_CONFIG.JSON"));
        enabled = config.enabled ? 1 : 0;
        companionId = String(config.companion || "YES_MAN").toUpperCase()
    } catch (error) {
    }

    function isMisc() {
        try {
            return (Pip.MODE | 0) === 1 && (Pip.MENUX | 0) === 3
        } catch (error) {
        }

        return 0
    }

    function isSupportedPage() {
        let mode = -1,
            menuX = -1;

        try {
            mode = Pip.MODE | 0;
            menuX = Pip.MENUX | 0
        } catch (error) {
            return 0
        }

        return mode === 0 && menuX >= 0 && menuX < 5 ||
            mode === 1 && (menuX < 3 || menuX === 4) ||
            mode === 2 && (menuX === 2 || menuX === 3)
    }

    function isCustomApp() {
        try {
            return !!(Pip.CURRENT && Pip.CURRENT.notDefault)
        } catch (error) {
        }

        return 1
    }

    function isTransitioning() {
        try {
            return !!(Pip.sleeping || Pip.menuChanging)
        } catch (error) {
        }

        return 1
    }

    function isGameSettings() {
        try {
            return (Pip.MODE | 0) === 2 && (Pip.MENUX | 0) === 0
        } catch (error) {
        }

        return 0
    }

    function clearPendingTimer() {
        if (pendingTimer) {
            clearTimeout(pendingTimer);
            pendingTimer = 0
        }
    }

    function destroyVoiceEngine() {
        let voiceEngine = global.__SE;

        if (voiceEngine && voiceEngine.destroy) {
            try {
                voiceEngine.destroy()
            } catch (error) {
            }
        }

        global.__SE = 0;

        try {
            E.defrag()
        } catch (error) {
        }
    }

    function loadVoiceEngine() {
        let sourceCode,
            engineFactory,
            memory;

        pendingTimer = 0;

        if (!active ||
            !enabled ||
            global.__PipCoSophiaUi ||
            isMisc() ||
            isCustomApp() ||
            !isSupportedPage() ||
            global.__SE) {
            return
        }

        if (isTransitioning()) {
            pendingTimer = setTimeout(loadVoiceEngine, 1800);
            return
        }

        try {
            memory = process.memory();

            if (memory && memory.free < 2750) {
                if (retryCount++ < 2) {
                    pendingTimer = setTimeout(loadVoiceEngine, 2200)
                }
                return
            }

            retryCount = 0;

            try {
                E.defrag()
            } catch (error) {
            }

            sourceCode = fs.readFileSync(appPath + "SOPHIA_VOICE_ENGINE.JS");
            engineFactory = Function("return " + sourceCode) ();
            sourceCode = 0;

            global.__SE = engineFactory(fs, appPath, companionId);
            engineFactory = 0;

            if (global.__SE && global.__SE.nav) global.__SE.nav()
        } catch (error) {
            global.__SE = 0;

            try {
                E.defrag()
            } catch (defragError) {
            }

            if (retryCount++ < 1) {
                pendingTimer = setTimeout(loadVoiceEngine, 2600)
            }
        }
    }

    function onNavigationChange() {
        if (!active) return;

        if (isTransitioning()) {
            clearPendingTimer();
            pendingTimer = setTimeout(onNavigationChange, 1800);
            return
        }

        if (global.__PipCoSophiaUi || isMisc() || isCustomApp() || !enabled) {
            clearPendingTimer();
            retryCount = 0;
            destroyVoiceEngine();
            return
        }

        /*
         * DATA > Settings is not a normal three-line voice context.
         * An already-running engine is allowed to stay alive there only so
         * it can detect an actual Fallout 3 / New Vegas mode change.
         */
        if (isGameSettings()) {
            clearPendingTimer();
            retryCount = 0;

            if (global.__SE && global.__SE.nav) {
                try {
                    global.__SE.nav()
                } catch (error) {
                    destroyVoiceEngine()
                }
            }

            return
        }

        if (!isSupportedPage()) {
            clearPendingTimer();
            retryCount = 0;
            destroyVoiceEngine();
            return
        }

        if (global.__SE) {
            try {
                global.__SE.nav()
            } catch (error) {
                destroyVoiceEngine()
            }

            return
        }

        clearPendingTimer();
        pendingTimer = setTimeout(loadVoiceEngine, 850)
    }

    function kickRouter() {
        onNavigationChange()
    }

    function shutdownRouter() {
        if (!active) return;

        active = 0;

        clearPendingTimer();
        destroyVoiceEngine();

        try {
            Pip.removeListener("mode", onNavigationChange);
            Pip.removeListener("menuX", onNavigationChange)
        } catch (error) {
        }

        if (global.__SR === routerApi) global.__SR = 0
    }

    const routerApi = {
        kick: kickRouter,
        die: shutdownRouter
    };

    global.__SR = routerApi;

    if (!enabled) {
        active = 0;
        global.__SR = 0;
        return 0
    }

    try {
        Pip.on("mode", onNavigationChange);
        Pip.on("menuX", onNavigationChange)
    } catch (error) {
    }

    return routerApi
});
