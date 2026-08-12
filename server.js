(async () => {
    const { Worker } = await import('worker_threads');
    const { WebSocketServer } = await import('ws');
    const { pack, unpack } = await import('msgpackr');
    const http = await import('http');
    const fs = await import('fs');

    // ============================================================
    // CONFIG
    // ============================================================

    const ADMIN_CODE_B64 =
        'eFE3TG05VnIyS3A4WmQ0VGY2TmMxV3k1SHMwQmQzVWE3SnE5UmsyRnA4WG00Vno3TG4xVGM2UXc5WWgzRHM1';

    const DEMO_CODE_B64 =
        'RnJlZUFjY2Vzcw==';

    const SIGNATURE_B64 =
        'QnkgUmF5a28=';

    // Render fournit automatiquement PORT.
    // En local, le serveur utilisera 8082.
    const PORT =
        Number(process.env.PORT) || 8082;

    const HOST =
        '0.0.0.0';

    const WORKER_FILE =
        './index.js';

    const DEFAULT_TANK =
        'auto6';

    const DEFAULT_NAME =
        "Rayko's Bot";

    const ADMIN_ACCESS =
        'full';

    const DEMO_ACCESS =
        'demo';

    const WORKER_MEMORY_MB =
        200;

    const RESPAWN_DELAY =
        200;

    const SPAWN_DELAY =
        120;

    // ============================================================
    // COLORS
    // ============================================================

    const RESET =
        '\x1b[0m';

    const RED =
        '\x1b[91m';

    const GREEN =
        '\x1b[92m';

    const YELLOW =
        '\x1b[93m';

    const BLUE =
        '\x1b[94m';

    const MAGENTA =
        '\x1b[95m';

    const CYAN =
        '\x1b[96m';

    const GRAY =
        '\x1b[90m';

    // ============================================================
    // BASE64
    // ============================================================

    function decodeBase64(value) {
        return Buffer
            .from(value, 'base64')
            .toString('utf8');
    }

    // ============================================================
    // PROXIES
    // ============================================================

    let proxies = [];

    try {
        const proxyFile =
            fs.readFileSync(
                'proxies.txt',
                'utf8'
            );

        proxies = proxyFile
            .split(/\r?\n/)
            .map(proxy => proxy.trim())
            .filter(Boolean)
            .map(proxy => {

                // Déjà au format URL
                if (
                    /^(http|https|socks4|socks5):\/\//i.test(proxy)
                ) {
                    return proxy;
                }

                const parts =
                    proxy.split(':');

                // IP:PORT:USER:PASS
                if (parts.length === 4) {
                    return (
                        `http://${parts[2]}:${parts[3]}@` +
                        `${parts[0]}:${parts[1]}`
                    );
                }

                // IP:PORT
                if (parts.length === 2) {
                    return (
                        `http://${parts[0]}:${parts[1]}`
                    );
                }

                return null;
            })
            .filter(Boolean);

        console.log(
            `${GREEN}Successfully loaded ${proxies.length} proxies from proxies.txt${RESET}`
        );

    } catch (error) {
        console.error(
            `${RED}CRITICAL: Failed to read proxies.txt.${RESET}`,
            error.message
        );

        process.exit(1);
    }

    if (proxies.length === 0) {
        console.error(
            `${RED}CRITICAL: No proxies available.${RESET}`
        );

        process.exit(1);
    }

    // ============================================================
    // HTTP SERVER
    // ============================================================

    const httpServer =
        http.createServer(
            (request, response) => {

                response.writeHead(
                    426,
                    {
                        'Content-Type':
                            'text/plain'
                    }
                );

                response.end(
                    'Rayko Server'
                );
            }
        );

    // ============================================================
    // RANDOM
    // ============================================================

    function randomInt(min, max) {
        return Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;
    }

    // ============================================================
    // CLIENTS
    // ============================================================

    const clients =
        new Map();

    // ============================================================
    // WEBSOCKET SERVER
    // ============================================================

    const websocketServer =
        new WebSocketServer({
            server:
                httpServer
        });

    // ============================================================
    // CONNECTION
    // ============================================================

    websocketServer.on(
        'connection',
        (socket, request) => {

            const remoteAddress =
                request.socket.remoteAddress ||
                'unknown';

            console.log(
                `${CYAN}${remoteAddress}${RESET} connected`
            );

            // ====================================================
            // CREATE CLIENT
            // ====================================================

            if (
                !clients.has(remoteAddress)
            ) {

                clients.set(
                    remoteAddress,
                    {
                        workers: [],

                        botSlots:
                            new Map(),

                        tank:
                            DEFAULT_TANK,

                        tanks: [],

                        tankIdx:
                            0,

                        proxyIdx:
                            0,

                        accessLevel:
                            DEMO_ACCESS,

                        botHash:
                            null,

                        botName:
                            DEFAULT_NAME,

                        targetBotCount:
                            0,

                        // IMPORTANT :
                        // Les bots continuent à respawn
                        // même si le WebSocket disparaît.
                        respawnEnabled:
                            true
                    }
                );
            }

            const client =
                clients.get(
                    remoteAddress
                );

            let challenge =
                null;

            let authenticated =
                false;

            // ====================================================
            // SEND
            // ====================================================

            function send(...data) {

                if (
                    socket.readyState ===
                    socket.OPEN
                ) {
                    socket.send(
                        pack(data)
                    );
                }
            }

            // ====================================================
            // CLOSE CONNECTION
            // ====================================================

            function closeConnection() {
                try {
                    socket.close();
                } catch {
                    // Ignore
                }
            }

            // ====================================================
            // WORKER LOGS
            // ====================================================

            function attachWorkerLogs(
                worker,
                botNumber
            ) {

                const shouldHideLog =
                    line => {

                        const text =
                            line.trim();

                        if (
                            text === 'Stop!'
                        ) {
                            return true;
                        }

                        if (
                            text.startsWith(
                                'Hackers have been known to trick people here'
                            )
                        ) {
                            return true;
                        }

                        if (
                            text.startsWith(
                                'Hackers have been known to trick people into running malicious scripts here'
                            )
                        ) {
                            return true;
                        }

                        return false;
                    };

                // ------------------------------------------------
                // STDOUT
                // ------------------------------------------------

                if (worker.stdout) {

                    worker.stdout.on(
                        'data',
                        chunk => {

                            const text =
                                chunk.toString();

                            const lines =
                                text.split(/\r?\n/);

                            for (
                                const line of lines
                            ) {

                                if (!line.trim()) {
                                    continue;
                                }

                                if (
                                    shouldHideLog(line)
                                ) {
                                    continue;
                                }

                                console.log(
                                    `${CYAN}[INDEX Worker ${botNumber}]${RESET} ${line}`
                                );
                            }
                        }
                    );
                }

                // ------------------------------------------------
                // STDERR
                // ------------------------------------------------

                if (worker.stderr) {

                    worker.stderr.on(
                        'data',
                        chunk => {

                            const text =
                                chunk.toString();

                            const lines =
                                text.split(/\r?\n/);

                            for (
                                const line of lines
                            ) {

                                if (!line.trim()) {
                                    continue;
                                }

                                if (
                                    shouldHideLog(line)
                                ) {
                                    continue;
                                }

                                console.error(
                                    `${RED}[INDEX Worker ${botNumber} ERROR]${RESET} ${line}`
                                );
                            }
                        }
                    );
                }
            }

            // ====================================================
            // GET NEXT FREE SLOT
            // ====================================================

            function getNextFreeSlot() {

                let slotId =
                    0;

                while (
                    client.botSlots.has(slotId)
                ) {
                    slotId++;
                }

                return slotId;
            }

            // ====================================================
            // SCHEDULE RESPAWN
            // ====================================================

            function scheduleRespawn(
                slotId,
                hash,
                botName
            ) {

                if (
                    !client.respawnEnabled
                ) {
                    return;
                }

                if (!hash) {
                    console.log(
                        `${RED}[Bot ${slotId + 1}] Cannot respawn: no hash.${RESET}`
                    );

                    return;
                }

                if (
                    client.botSlots.has(slotId)
                ) {
                    return;
                }

                console.log(
                    `${YELLOW}[Bot ${slotId + 1}] Respawn scheduled in ${RESPAWN_DELAY}ms.${RESET}`
                );

                setTimeout(
                    () => {

                        // IMPORTANT :
                        // Aucun test WebSocket ici.
                        // Le bot peut respawn même si
                        // Tampermonkey est déconnecté.

                        if (
                            !client.respawnEnabled
                        ) {
                            return;
                        }

                        if (!hash) {
                            return;
                        }

                        if (
                            client.botSlots.has(slotId)
                        ) {
                            return;
                        }

                        console.log(
                            `${CYAN}[Bot ${slotId + 1}] Respawning...${RESET}`
                        );

                        spawnBotSlot(
                            slotId,
                            hash,
                            botName
                        );

                    },
                    RESPAWN_DELAY
                );
            }

            // ====================================================
            // SPAWN ONE BOT
            // ====================================================

            function spawnBotSlot(
                slotId,
                hash,
                botName
            ) {

                if (
                    !client.respawnEnabled
                ) {
                    return;
                }

                if (!hash) {

                    console.log(
                        `${RED}[Bot ${slotId + 1}] No hash available.${RESET}`
                    );

                    return;
                }

                if (
                    client.botSlots.has(slotId)
                ) {
                    return;
                }

                // ------------------------------------------------
                // PROXY
                // ------------------------------------------------

                if (
                    client.proxyIdx >=
                    proxies.length
                ) {
                    client.proxyIdx = 0;
                }

                const proxy =
                    proxies[
                        client.proxyIdx %
                        proxies.length
                    ];

                client.proxyIdx++;

                let worker;

                // ------------------------------------------------
                // CREATE WORKER
                // ------------------------------------------------

                try {

                    worker =
                        new Worker(
                            WORKER_FILE,
                            {
                                stdout:
                                    true,

                                stderr:
                                    true,

                                resourceLimits:
                                {
                                    maxOldGenerationSizeMb:
                                        WORKER_MEMORY_MB
                                }
                            }
                        );

                } catch (error) {

                    console.error(
                        `${RED}[Bot ${slotId + 1}] Failed to create Worker:${RESET}`,
                        error.message
                    );

                    scheduleRespawn(
                        slotId,
                        hash,
                        botName
                    );

                    return;
                }

                const botNumber =
                    slotId + 1;

                // ------------------------------------------------
                // SAVE WORKER
                // ------------------------------------------------

                client.botSlots.set(
                    slotId,
                    worker
                );

                client.workers.push(
                    worker
                );

                attachWorkerLogs(
                    worker,
                    botNumber
                );

                // =================================================
                // WORKER ERROR
                // =================================================

                worker.on(
                    'error',
                    error => {

                        console.error(
                            `${RED}[Worker ${botNumber} ERROR]${RESET}`,
                            error.message
                        );
                    }
                );

                // =================================================
                // WORKER EXIT
                // =================================================

                worker.on(
                    'exit',
                    code => {

                        console.log(
                            `${YELLOW}[Worker ${botNumber}] exited with code ${code}${RESET}`
                        );

                        // Retirer le worker de la liste
                        client.workers =
                            client.workers.filter(
                                item =>
                                    item !== worker
                            );

                        // Retirer uniquement si ce worker
                        // correspond toujours au slot.
                        if (
                            client.botSlots.get(
                                slotId
                            ) === worker
                        ) {

                            client.botSlots.delete(
                                slotId
                            );
                        }

                        // ------------------------------------------------
                        // STOP MANUEL
                        // ------------------------------------------------

                        if (
                            !client.respawnEnabled
                        ) {

                            console.log(
                                `${GRAY}[Bot ${botNumber}] intentional shutdown - no respawn.${RESET}`
                            );

                            return;
                        }

                        // ------------------------------------------------
                        // AUTO RESPAWN
                        // ------------------------------------------------

                        // IMPORTANT :
                        // On NE vérifie PAS :
                        //
                        // authenticated
                        // socket.readyState
                        //
                        // Le serveur respawn donc le bot même
                        // après déconnexion du client.

                        if (!client.botHash) {

                            console.log(
                                `${RED}[Bot ${botNumber}] Cannot respawn: client botHash is missing.${RESET}`
                            );

                            return;
                        }

                        console.log(
                            `${RED}[Bot ${botNumber}] DISCONNECTED / EXITED${RESET}`
                        );

                        console.log(
                            `${YELLOW}[Bot ${botNumber}] Automatic respawn in ${RESPAWN_DELAY}ms...${RESET}`
                        );

                        scheduleRespawn(
                            slotId,
                            client.botHash,
                            client.botName
                        );
                    }
                );

                // =================================================
                // LOG
                // =================================================

                console.log(
                    `${GREEN}[Bot ${botNumber}] spawned -> Worker ${botNumber}${RESET}`
                );

                console.log(
                    `${BLUE}[Bot ${botNumber}] Proxy: ${proxy}${RESET}`
                );

                // =================================================
                // TANK
                // =================================================

                let selectedTank =
                    client.tank;

                if (
                    client.tanks.length > 0
                ) {

                    selectedTank =
                        client.tanks[
                            client.tankIdx
                        ];

                    client.tankIdx++;

                    if (
                        client.tankIdx >=
                        client.tanks.length
                    ) {
                        client.tankIdx = 0;
                    }
                }

                try {

                    worker.postMessage(
                        {
                            type:
                                'tankselect',

                            tank:
                                selectedTank
                        }
                    );

                } catch (error) {

                    console.error(
                        `${RED}[Bot ${botNumber}] Tank message error:${RESET}`,
                        error.message
                    );
                }

                // =================================================
                // START
                // =================================================

                try {

                    worker.postMessage(
                        {
                            type:
                                'start',

                            config:
                            {
                                id:
                                    slotId,

                                proxy:
                                {
                                    type:
                                        'http',

                                    url:
                                        proxy
                                },

                                hash:
                                    `#${hash}`,

                                name:
                                    botName,

                                stats:
                                [
                                    0,
                                    0,
                                    3,
                                    9,
                                    9,
                                    9,
                                    9,
                                    3
                                ],

                                type:
                                    'follow',

                                token:
                                    'follow-8fe6ca',

                                autoFire:
                                    false,

                                autoRespawn:
                                    true,

                                keys:
                                    [],

                                keysHold:
                                    [],

                                tank:
                                    'Auto4',

                                chatSpam:
                                    '',

                                squadId:
                                    hash,

                                reconnectAttempts:
                                    5,

                                reconnectDelay:
                                    5000
                            }
                        }
                    );

                } catch (error) {

                    console.error(
                        `${RED}[Bot ${botNumber}] Start message error:${RESET}`,
                        error.message
                    );
                }
            }

            // ====================================================
            // SPAWN MULTIPLE BOTS
            // ====================================================

            function spawnAdditionalBots(
                count,
                hash,
                botName
            ) {

                if (
                    count <= 0
                ) {
                    return;
                }

                let nextSlot =
                    getNextFreeSlot();

                client.targetBotCount +=
                    count;

                console.log(
                    `${MAGENTA}[Server] Adding ${count} bots${RESET}`
                );

                console.log(
                    `${GRAY}Existing bots: ${client.botSlots.size}${RESET}`
                );

                console.log(
                    `${GRAY}Target bots: ${client.targetBotCount}${RESET}`
                );

                console.log();

                for (
                    let i = 0;
                    i < count;
                    i++
                ) {

                    const slotId =
                        nextSlot++;

                    setTimeout(
                        () => {

                            if (
                                !client.respawnEnabled
                            ) {
                                return;
                            }

                            // IMPORTANT :
                            // Plus de vérification du WebSocket ici.
                            // Le spawn initial peut terminer même si
                            // le client se déconnecte entre-temps.

                            if (
                                client.botSlots.has(
                                    slotId
                                )
                            ) {
                                return;
                            }

                            spawnBotSlot(
                                slotId,
                                hash,
                                botName
                            );

                        },
                        i * SPAWN_DELAY
                    );
                }
            }

            // ====================================================
            // MESSAGE
            // ====================================================

            socket.on(
                'message',
                message => {

                    try {

                        const data =
                            unpack(message);

                        if (
                            !Array.isArray(data) ||
                            data.length === 0
                        ) {
                            return;
                        }

                        const command =
                            data.shift();

                        switch (command) {

                            // ====================================
                            // CHALLENGE
                            // ====================================

                            case 'M': {

                                if (
                                    challenge !== null ||
                                    data[0] !== 72011
                                ) {

                                    closeConnection();

                                    return;
                                }

                                challenge =
                                    randomInt(
                                        512,
                                        1023
                                    );

                                send(
                                    'M',
                                    challenge
                                );

                                break;
                            }

                            // ====================================
                            // AUTH
                            // ====================================

                            case 'C': {

                                const receivedChallenge =
                                    data[0];

                                const receivedCode =
                                    data[1];

                                if (
                                    receivedChallenge !==
                                    (challenge ^ 845)
                                ) {

                                    closeConnection();

                                    console.log(
                                        `${RED}${remoteAddress}${RESET} true noob (challenge failed)`
                                    );

                                    break;
                                }

                                if (
                                    receivedCode ===
                                    decodeBase64(
                                        ADMIN_CODE_B64
                                    )
                                ) {

                                    authenticated =
                                        true;

                                    client.accessLevel =
                                        ADMIN_ACCESS;

                                    send(
                                        'AUTH',
                                        ADMIN_ACCESS
                                    );

                                    console.log(
                                        `${GREEN}${remoteAddress}${RESET} verified with FULL access [Admin]`
                                    );

                                } else if (
                                    receivedCode ===
                                    decodeBase64(
                                        DEMO_CODE_B64
                                    )
                                ) {

                                    authenticated =
                                        true;

                                    client.accessLevel =
                                        DEMO_ACCESS;

                                    send(
                                        'AUTH',
                                        DEMO_ACCESS
                                    );

                                    console.log(
                                        `${YELLOW}${remoteAddress}${RESET} verified with DEMO access [FreeAccess]`
                                    );

                                } else {

                                    closeConnection();

                                    console.log(
                                        `${RED}${remoteAddress}${RESET} rejected: invalid secret code`
                                    );
                                }

                                break;
                            }

                            // ====================================
                            // TANK
                            // ====================================

                            case 'Z': {

                                if (
                                    !authenticated
                                ) {
                                    break;
                                }

                                client.tank =
                                    data[0];

                                if (
                                    Array.isArray(
                                        client.tank
                                    )
                                ) {

                                    client.tanks =
                                        client.tank;

                                    client.tankIdx =
                                        0;

                                    if (
                                        client.tanks.length === 0
                                    ) {
                                        break;
                                    }

                                    for (
                                        const worker
                                        of client.workers
                                    ) {

                                        const tank =
                                            client.tanks[
                                                client.tankIdx
                                            ];

                                        try {

                                            worker.postMessage(
                                                {
                                                    type:
                                                        'tankselect',

                                                    tank:
                                                        tank
                                                }
                                            );

                                        } catch (error) {

                                            console.error(
                                                `${RED}[Server] Tank error:${RESET}`,
                                                error.message
                                            );
                                        }

                                        client.tankIdx++;

                                        if (
                                            client.tankIdx >=
                                            client.tanks.length
                                        ) {
                                            client.tankIdx = 0;
                                        }
                                    }

                                } else {

                                    client.tanks =
                                        [];

                                    for (
                                        const worker
                                        of client.workers
                                    ) {

                                        try {

                                            worker.postMessage(
                                                {
                                                    type:
                                                        'tankselect',

                                                    tank:
                                                        client.tank
                                                }
                                            );

                                        } catch (error) {

                                            console.error(
                                                `${RED}[Server] Tank error:${RESET}`,
                                                error.message
                                            );
                                        }
                                    }
                                }

                                break;
                            }

                            // ====================================
                            // SPAWN / ADD BOTS
                            // ====================================

                            case 'F': {

                                if (
                                    !authenticated
                                ) {
                                    break;
                                }

                                const hash =
                                    data[0];

                                let botCount =
                                    parseInt(
                                        data[1],
                                        10
                                    ) || 1;

                                const botName =
                                    data[2] ||
                                    DEFAULT_NAME;

                                if (
                                    client.accessLevel ===
                                    DEMO_ACCESS
                                ) {
                                    botCount = 1;
                                }

                                if (
                                    botCount < 1
                                ) {
                                    botCount = 1;
                                }

                                client.botHash =
                                    hash;

                                client.botName =
                                    botName;

                                client.respawnEnabled =
                                    true;

                                console.log();

                                console.log(
                                    `${MAGENTA}[${client.accessLevel.toUpperCase()}] ADDING ${botCount} BOTS${RESET}`
                                );

                                console.log(
                                    `${GRAY}Hash: #${hash}${RESET}`
                                );

                                console.log(
                                    `${GRAY}Name: ${botName}${RESET}`
                                );

                                console.log(
                                    `${GRAY}Currently alive: ${client.botSlots.size}${RESET}`
                                );

                                console.log();

                                spawnAdditionalBots(
                                    botCount,
                                    hash,
                                    botName
                                );

                                break;
                            }

                            // ====================================
                            // DESTROY
                            // ====================================

                            case 'B': {

                                if (
                                    !authenticated
                                ) {
                                    break;
                                }

                                console.log();

                                console.log(
                                    `${RED}[Server] Destroying ${client.botSlots.size} bots...${RESET}`
                                );

                                // IMPORTANT :
                                // Désactive le respawn AVANT
                                // de demander aux workers de sortir.
                                client.respawnEnabled =
                                    false;

                                for (
                                    const [
                                        slotId,
                                        worker
                                    ]
                                    of client.botSlots
                                ) {

                                    console.log(
                                        `${RED}[Bot ${slotId + 1}] destroying...${RESET}`
                                    );

                                    try {

                                        worker.postMessage(
                                            {
                                                type:
                                                    'destroy'
                                            }
                                        );

                                    } catch (error) {

                                        console.error(
                                            `${RED}[Bot ${slotId + 1}] destroy error:${RESET}`,
                                            error.message
                                        );
                                    }
                                }

                                client.botSlots.clear();

                                client.workers =
                                    [];

                                client.targetBotCount =
                                    0;

                                client.botHash =
                                    null;

                                client.botName =
                                    DEFAULT_NAME;

                                console.log();

                                console.log(
                                    `${GREEN}[Server] All bots stopped.${RESET}`
                                );

                                console.log(
                                    `${GRAY}[Server] Bot counter reset to 0.${RESET}`
                                );

                                console.log();

                                break;
                            }

                            // ====================================
                            // POSITION
                            // ====================================

                            case 'A': {

                                if (
                                    !authenticated
                                ) {
                                    break;
                                }

                                setImmediate(
                                    () => {

                                        for (
                                            const worker
                                            of client.workers
                                        ) {

                                            try {

                                                worker.postMessage(
                                                    {
                                                        type:
                                                            'position',

                                                        x:
                                                            data[0],

                                                        y:
                                                            data[1],

                                                        mouseX:
                                                            data[2],

                                                        mouseY:
                                                            data[3],

                                                        mouseDown:
                                                            data[4],

                                                        rMouseDown:
                                                            data[5],

                                                        mouse:
                                                            data[6],

                                                        feeding:
                                                            data[7],

                                                        shift:
                                                            data[8],

                                                        autofire:
                                                            data[9],

                                                        autospin:
                                                            data[10],

                                                        manualMode:
                                                            data[11],

                                                        manualX:
                                                            data[12],

                                                        manualY:
                                                            data[13],

                                                        shieldOffset:
                                                            data[14]
                                                    }
                                                );

                                            } catch (error) {

                                                console.error(
                                                    `${RED}[Server] Position error:${RESET}`,
                                                    error.message
                                                );
                                            }
                                        }
                                    }
                                );

                                break;
                            }

                            // ====================================
                            // CHAT
                            // ====================================

                            case 'T': {

                                if (
                                    !authenticated ||
                                    client.accessLevel !==
                                    ADMIN_ACCESS
                                ) {
                                    break;
                                }

                                for (
                                    const worker
                                    of client.workers
                                ) {

                                    try {

                                        worker.postMessage(
                                            {
                                                type:
                                                    'chat',

                                                message:
                                                    data[0],

                                                spam:
                                                    data[1]
                                            }
                                        );

                                    } catch (error) {

                                        console.error(
                                            `${RED}[Server] Chat error:${RESET}`,
                                            error.message
                                        );
                                    }
                                }

                                break;
                            }

                            // ====================================
                            // UNKNOWN COMMAND
                            // ====================================

                            default: {

                                console.log(
                                    `${RED}[Server] Unknown command: ${command}${RESET}`
                                );

                                closeConnection();

                                break;
                            }
                        }

                    } catch (error) {

                        console.error(
                            `${RED}[Server] Message error:${RESET}`,
                            error
                        );
                    }
                }
            );

            // ====================================================
            // SOCKET CLOSE
            // ====================================================

            socket.on(
                'close',
                () => {

                    console.log(
                        `${YELLOW}${remoteAddress}${RESET} disconnected`
                    );

                    // IMPORTANT :
                    // NE PAS désactiver respawnEnabled ici.
                    // NE PAS supprimer les workers.
                    // Les bots restent indépendants du client.

                    console.log(
                        `${CYAN}[Server] Client disconnected, bots kept alive.${RESET}`
                    );

                    console.log(
                        `${GRAY}[Server] Automatic respawn remains ENABLED.${RESET}`
                    );
                }
            );

            // ====================================================
            // SOCKET ERROR
            // ====================================================

            socket.on(
                'error',
                error => {

                    console.error(
                        `${RED}[WebSocket]${RESET}`,
                        error.message
                    );
                }
            );
        }
    );

    // ============================================================
    // SERVER START
    // ============================================================

    httpServer.listen(
        PORT,
        HOST,
        () => {

            console.log();

            console.log(
                `${MAGENTA}========================================${RESET}`
            );

            console.log(
                `${MAGENTA}          RAYKO'S SERVER${RESET}`
            );

            console.log(
                `${MAGENTA}========================================${RESET}`
            );

            console.log();

            console.log(
                `${GREEN}Server listening on ${HOST}:${PORT}${RESET}`
            );

            console.log(
                `${GRAY}Environment PORT: ${process.env.PORT || 'not set (using 8082)'}${RESET}`
            );

            console.log(
                `${GRAY}Worker file: ${WORKER_FILE}${RESET}`
            );

            console.log(
                `${GRAY}Proxy count: ${proxies.length}${RESET}`
            );

            console.log(
                `${GRAY}Worker memory: ${WORKER_MEMORY_MB} MB${RESET}`
            );

            console.log(
                `${GRAY}Respawn delay: ${RESPAWN_DELAY} ms${RESET}`
            );

            console.log(
                `${CYAN}Automatic respawn after client disconnect: ENABLED${RESET}`
            );

            console.log();

        }
    );
})();
