(async () => {
    const { Worker } = await import('worker_threads');
    const { WebSocketServer } = await import('ws');
    const { pack, unpack } = await import('msgpackr');
    const http = await import('http');
    const fs = await import('fs');

    // ============================================================
    // CONFIG
    // ============================================================

    const PORT = 8082;

    const AUTH_VALIDATE_URL =
        process.env.AUTH_VALIDATE_URL ||
        'http://127.0.0.1:8080/auth/validate';

    const USAGE_FILE =
        './usage_counts.json';

    const WORKER_FILE =
        './index.js';

    const DEFAULT_TANK =
        'basic';

    const DEFAULT_NAME =
        "⟦𝑹⟧ Rayko's Bot";

    const ROLE_ACCESS =
        'authorized';

    const DEMO_ACCESS =
        'demo';

    const WORKER_MEMORY_MB =
        200;

    const RESPAWN_DELAY =
        100;

    const SPAWN_DELAY =
        100;

    // ============================================================
    // COLORS
    // ============================================================

    const RESET = '\x1b[0m';
    const RED = '\x1b[91m';
    const GREEN = '\x1b[92m';
    const YELLOW = '\x1b[93m';
    const BLUE = '\x1b[94m';
    const MAGENTA = '\x1b[95m';
    const CYAN = '\x1b[96m';
    const GRAY = '\x1b[90m';

    // ============================================================
    // RANDOM BOT NAMES
    // ============================================================

    const RANDOM_BOT_FIRST_NAMES = [
        'Jason', 'Hugo', 'Alice', 'Buck', 'Lucas', 'Emma',
        'Nathan', 'Jack', 'Leo', 'Mia', 'Noah', 'Olivia',
        'Ethan', 'Sophia', 'Liam', 'Ava', 'Mason', 'Isabella',
        'Logan', 'Charlotte', 'Benjamin', 'Amelia', 'Henry',
        'Harper', 'Daniel', 'Evelyn', 'Matthew', 'Abigail',
        'Samuel', 'Emily', 'David', 'Ella', 'Joseph', 'Scarlett',
        'Owen', 'Grace', 'Wyatt', 'Chloe', 'John', 'Victoria',
        'Luke', 'Riley', 'Gabriel', 'Aria', 'Isaac', 'Lily',
        'Anthony', 'Zoey', 'Dylan', 'Hannah', 'Carter', 'Layla',
        'Julian', 'Nora', 'Caleb', 'Aurora', 'Ryan', 'Penelope',
        'Adam', 'Stella', 'Andrew', 'Maya', 'Christopher', 'Ellie',
        'Joshua', 'Hazel', 'Thomas', 'Luna', 'Charles', 'Lucy',
        'Michael', 'Claire', 'Alexander', 'Sophie', 'Nicholas',
        'Anna', 'James', 'Leah', 'William', 'Sarah', 'Robert',
        'Madison', 'Eli', 'Natalie', 'Jacob', 'Ruby', 'Eva',
        'Naomi', 'Isaiah', 'Ivy', 'Connor', 'Jasmine', 'Evan',
        'Julia', 'Adrian', 'Lydia', 'Nathaniel', 'Clara', 'Aaron',
        'Elise', 'Brandon', 'Sadie', 'Christian', 'Piper',
        'Jonathan', 'Quinn', 'Cameron', 'Peyton', 'Dominic',
        'Molly', 'Austin', 'Samantha', 'Jordan', 'Caroline',
        'Tyler', 'Madeline', 'Blake', 'Kennedy', 'Colton', 'Willow',
        'Gavin', 'Reagan', 'Hunter', 'Faith', 'Cooper', 'Ariana',
        'Parker', 'Kaylee', 'Easton', 'Hailey', 'Xavier', 'Brianna',
        'Jace', 'Nevaeh', 'Nolan', 'Adeline', 'Grayson', 'Genesis',
        'Lincoln', 'Emery', 'Miles', 'Melanie', 'Jaxon', 'Valerie',
        'Hudson', 'Isla', 'Asher', 'Vivian', 'Mateo', 'Delilah',
        'Gabriella', 'Jade', 'Sawyer', 'Cora', 'Declan', 'Athena',
        'Weston', 'Maria', 'Kai', 'Isabelle', 'Silas', 'Bennett',
        'Rose', 'Waylon', 'Natalia', 'Luca', 'Eliana', 'Micah',
        'Josephine', 'Roman', 'Iris', 'Damian', 'Lillian', 'Theo',
        'Max', 'Eleanor', 'Finn', 'Addison', 'Elliot', 'Beau',
        'Aubrey', 'Jonah', 'Savannah', 'Emmett', 'Brooklyn', 'Axel',
        'Ryder', 'Skylar', 'Leon', 'Kinsley', 'Arthur', 'Everleigh',
        'Milo', 'Aaliyah', 'Londyn', 'Felix', 'Raelynn', 'Oscar',
        'Sienna', 'Louis', 'Camila', 'Maxwell', 'Eliza', 'Rosalie',
        'Leonardo', 'Adriana', 'Wesley', 'Lyla', 'Vincent', 'Lola',
        'Jasper', 'Cecilia', 'Lorenzo', 'Genevieve', 'Charlie',
        'Maeve', 'Cole', 'Poppy', 'Millie', 'Alex', 'Esme',
        'Zachary', 'Daisy', 'Edward', 'Freya', 'Franklin', 'Phoebe',
        'George', 'Isabel', 'Amara', 'Margot', 'Eloise', 'Wren',
        'Albert', 'Elsie', 'Calvin', 'Mabel', 'Elliott', 'Ada',
        'Simon', 'Lena', 'Victor', 'Nina', 'Marcus', 'Lila', 'Eric',
        'Kevin', 'Louise', 'Brian', 'Amelie', 'Camille', 'Derek',
        'Manon', 'Alexis', 'Juliette', 'Maxime', 'Antoine', 'Ines',
        'Zoé', 'Léa', 'Lou', 'Raphael', 'Paul', 'Mathis', 'Agathe',
        'Nicolas', 'Jeanne', 'Lina', 'Mila', 'Enzo', 'Chloé', 'Tom',
        'Alexandre', 'Anais', 'Margaux', 'Jules', 'Baptiste',
        'Clémence', 'Lucie'
    ];

    const RANDOM_BOT_LAST_NAMES = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
        'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez',
        'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
        'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez',
        'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez',
        'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
        'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
        'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
        'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez',
        'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz',
        'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
        'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz',
        'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly',
        'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
        'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett',
        'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez',
        'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross',
        'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell',
        'Sullivan', 'Bell', 'Coleman', 'Butler', 'Henderson',
        'Barnes', 'Fisher', 'Vasquez', 'Simmons', 'Romero', 'Jordan',
        'Patterson', 'Alexander', 'Hamilton', 'Graham', 'Reynolds',
        'Griffin', 'Wallace', 'Moreno', 'West', 'Cole', 'Hayes',
        'Bryant', 'Herrera', 'Gibson', 'Ellis', 'Tran', 'Medina',
        'Aguilar', 'Stevens', 'Murray', 'Ford', 'Castro', 'Marshall',
        'Owens', 'Harrison', 'Fernandez', 'McDonald', 'Woods',
        'Washington', 'Kennedy', 'Wells', 'Vargas', 'Henry', 'Chen',
        'Freeman', 'Webb', 'Tucker', 'Guzman', 'Burns', 'Crawford',
        'Olson', 'Simpson', 'Porter', 'Hunter', 'Gordon', 'Mendez',
        'Silva', 'Shaw', 'Snyder', 'Mason', 'Dixon', 'Munoz', 'Hunt',
        'Hicks', 'Holmes', 'Palmer', 'Wagner', 'Black', 'Robertson',
        'Boyd', 'Rose', 'Stone', 'Salazar', 'Fox', 'Warren', 'Mills',
        'Meyer', 'Rice', 'Schmidt', 'Garza', 'Daniels', 'Ferguson',
        'Nichols', 'Stephens', 'Soto', 'Weaver', 'Ryan', 'Gardner',
        'Payne', 'Grant', 'Dunn', 'Kelley', 'Spencer', 'Hawkins',
        'Arnold', 'Pierce', 'Vazquez', 'Hansen', 'Peters', 'Santos',
        'Hart', 'Bradley', 'Knight', 'Elliott', 'Cunningham',
        'Duncan', 'Armstrong', 'Hudson', 'Carroll', 'Lane', 'Riley',
        'Andrews', 'Alvarado', 'Ray', 'Delgado', 'Berry', 'Perkins',
        'Hoffman', 'Johnston', 'Matthews', 'Pena', 'Richards',
        'Contreras', 'Willis', 'Carpenter', 'Lawrence', 'Sandoval',
        'Guerrero', 'George', 'Chapman', 'Rios', 'Estrada', 'Ortega',
        'Watkins', 'Greene', 'Norton', 'Middleton', 'Sparks',
        'Manning', 'Parks', 'Vaughn', 'Meyers', 'Schultz', 'Douglas',
        'Fleming', 'Jensen', 'Hancock', 'Morrison', 'Stephenson',
        'Garrett', 'Harper', 'Bates', 'Mack', 'Hale', 'Cameron',
        'Bentley', 'Bishop', 'McKenzie', 'McCarthy', 'Maldonado',
        'McDaniel', 'McLean', 'Roth', 'Fritz', 'Schneider', 'Keller',
        'Weber', 'Klein', 'Wolf', 'Schwartz', 'Zimmerman', 'Krause',
        'Kruger', 'Fischer', 'Becker', 'Hartmann', 'Richter', 'Braun',
        'Hoffmann', 'Schmitt', 'Neumann', 'Kaiser', 'Vogel', 'Dupont',
        'Bernard', 'Dubois', 'Robert', 'Richard', 'Petit', 'Durand',
        'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel',
        'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard',
        'Andre', 'Lefevre', 'Mercier', 'Dupuis', 'Lambert', 'Bonnet',
        'Francois', 'Martins', 'Legrand', 'Garnier', 'Faure',
        'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Roussel',
        'Nicolas', 'Perrin', 'Morin', 'Mathieu', 'Clement', 'Gauthier',
        'Dumont', 'Fontaine', 'Chevalier', 'Robin', 'Masson',
        'Gerard', 'Boyer', 'Denis', 'Lemaire', 'Duval', 'Joly',
        'Giraud', 'Roger', 'Renard', 'Marchand', 'Aubry', 'Barbier',
        'Arnaud', 'Picard', 'Lemoine', 'Philippe'
    ];

    const RANDOM_BOT_NAMES =
        RANDOM_BOT_FIRST_NAMES.flatMap(
            firstName =>
                RANDOM_BOT_LAST_NAMES.map(
                    lastName =>
                        `${firstName} ${lastName}`
                )
        );

    // ============================================================
    // PERSISTENT BOT USAGE
    // ============================================================

    function loadUsageCounts() {

        try {

            const data =
                JSON.parse(
                    fs.readFileSync(
                        USAGE_FILE,
                        'utf8'
                    )
                );

            return data &&
                typeof data === 'object' &&
                !Array.isArray(data)
                ? data
                : {};

        } catch (error) {

            return {};
        }
    }

    const usageCounts =
        loadUsageCounts();

    function getTotalBotsUsed(userId) {

        return Number(
            usageCounts[String(userId)] || 0
        );
    }

    function addBotUsage(userId, count) {

        if (
            !userId ||
            count <= 0
        ) {
            return 0;
        }

        const key =
            String(userId);

        usageCounts[key] =
            getTotalBotsUsed(key) +
            count;

        try {

            const tempFile =
                `${USAGE_FILE}.tmp`;

            fs.writeFileSync(
                tempFile,
                JSON.stringify(
                    usageCounts,
                    null,
                    2
                ),
                'utf8'
            );

            fs.renameSync(
                tempFile,
                USAGE_FILE
            );

        } catch (error) {

            console.error(
                `${RED}[Usage] Failed to save usage counts:${RESET}`,
                error.message
            );
        }

        return usageCounts[key];
    }

    // ============================================================
    // DISCORD ACCESS VALIDATION
    // ============================================================

    async function validateDiscordAccessToken(token) {

        if (
            typeof token !== 'string' ||
            token.length < 20 ||
            token.length > 4096
        ) {
            return null;
        }

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                5000
            );

        try {

            const response =
                await fetch(
                    AUTH_VALIDATE_URL,
                    {
                        method: 'POST',

                        headers: {
                            'Authorization':
                                `Bearer ${token}`,

                            'Accept':
                                'application/json'
                        },

                        signal:
                            controller.signal
                    }
                );

            if (!response.ok) {
                return null;
            }

            const result =
                await response.json();

            return result.valid === true
                ? result
                : null;

        } catch (error) {

            console.error(
                `${RED}[Auth] Validation failed:${RESET}`,
                error.message
            );

            return null;

        } finally {

            clearTimeout(timeout);
        }
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

        proxies =
            proxyFile
                .split(/\r?\n/)
                .map(
                    proxy => proxy.trim()
                )
                .filter(Boolean)
                .map(proxy => {

                    if (
                        /^(http|https|socks4|socks5):\/\//i.test(proxy)
                    ) {
                        return proxy;
                    }

                    const parts =
                        proxy.split(':');

                    if (
                        parts.length === 4
                    ) {

                        return (
                            `http://${parts[2]}:${parts[3]}@` +
                            `${parts[0]}:${parts[1]}`
                        );
                    }

                    if (
                        parts.length === 2
                    ) {

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

    if (
        proxies.length === 0
    ) {

        console.error(
            `${RED}CRITICAL: No proxies available.${RESET}`
        );

        process.exit(1);
    }

    // ============================================================
    // HTTP SERVER
    // ============================================================

    function proxyAuthRequest(request, response) {
        const target = new URL(
            `http://127.0.0.1:8080${request.url}`
        );

        const headers = {
            ...request.headers,
            host: '127.0.0.1:8080'
        };

        const proxyRequest = http.request(
            {
                hostname: '127.0.0.1',
                port: 8080,
                path: target.pathname + target.search,
                method: request.method,
                headers
            },
            proxyResponse => {
                response.writeHead(
                    proxyResponse.statusCode || 502,
                    proxyResponse.headers
                );

                proxyResponse.pipe(response);
            }
        );

        proxyRequest.on(
            'error',
            error => {
                console.error(
                    `${RED}[Auth Proxy] ${RESET}${error.message}`
                );

                if (!response.headersSent) {
                    response.writeHead(
                        502,
                        {
                            'Content-Type':
                                'text/plain; charset=utf-8'
                        }
                    );
                }

                response.end(
                    'Auth service unavailable'
                );
            }
        );

        request.pipe(proxyRequest);
    }

    const publicAuthPaths = new Set([
        '/auth/discord/start',
        '/auth/discord/callback',
        '/auth/poll',
        '/auth/health'
    ]);

    const httpServer = http.createServer(
        (request, response) => {

            const pathname = new URL(
                request.url,
                `http://${request.headers.host || 'localhost'}`
            ).pathname;

            if (publicAuthPaths.has(pathname)) {
                return proxyAuthRequest(
                    request,
                    response
                );
            }

            response.writeHead(
                302,
                {
                    Location:
                        'https://discord.gg/hUtPRYBGt'
                }
            );

            response.end();
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
                request.socket.remoteAddress;

            console.log(
                `${CYAN}${remoteAddress}${RESET} connected`
            );

            const client = {

                workers:
                    [],

                botSlots:
                    new Map(),

                botNames:
                    new Map(),

                lastRandomBotName:
                    null,

                tank:
                    DEFAULT_TANK,

                tanks:
                    [],

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

                customBuild:
                    "0/0/3/9/9/9/9/3",

                targetBotCount:
                    0,

                discordUserId:
                    null,

                respawnEnabled:
                    true
            };

            let challenge =
                null;

            let authenticated =
                false;

            function send(...data) {

                if (
                    socket.readyState ===
                    socket.OPEN
                ) {

                    try {

                        socket.send(
                            pack(data)
                        );

                    } catch (error) {

                        console.error(
                            `${RED}[WebSocket] Send error:${RESET}`,
                            error.message
                        );
                    }
                }
            }

            function closeConnection() {

                try {

                    socket.close();

                } catch (error) {
                    // Ignore
                }
            }

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

                                if (
                                    !line.trim()
                                ) {
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

                                if (
                                    !line.trim()
                                ) {
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

            function getRandomBotName() {

                let randomBotName;

                do {

                    randomBotName =
                        RANDOM_BOT_NAMES[
                            Math.floor(
                                Math.random() *
                                RANDOM_BOT_NAMES.length
                            )
                        ];

                } while (
                    randomBotName ===
                    client.lastRandomBotName
                );

                client.lastRandomBotName =
                    randomBotName;

                return randomBotName;
            }

            function formatBotName(
                botName,
                slotId
            ) {

                const botNumber =
                    slotId + 1;

                const nameTemplate =
                    String(
                        botName ||
                        DEFAULT_NAME
                    );

                const randomBotName =
                    /\[random\]/i.test(
                        nameTemplate
                    )
                        ? getRandomBotName()
                        : null;

                return nameTemplate
                    .replace(
                        /\[random\]/gi,
                        randomBotName
                    )
                    .replace(
                        /\[count\]/gi,
                        String(botNumber)
                    );
            }

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

                const resolvedBotName =
                    client.botNames.get(slotId) ||
                    formatBotName(
                        botName,
                        slotId
                    );

                client.botNames.set(
                    slotId,
                    resolvedBotName
                );

                if (
                    client.proxyIdx >=
                    proxies.length
                ) {

                    client.proxyIdx =
                        0;
                }

                const proxy =
                    proxies[
                        client.proxyIdx %
                        proxies.length
                    ];

                client.proxyIdx++;

                let worker;

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

                worker.on(
                    'error',
                    error => {

                        console.error(
                            `${RED}[Worker ${botNumber} ERROR]${RESET} ${error.message}`
                        );
                    }
                );

                worker.on(
                    'exit',
                    code => {

                        console.log(
                            `${YELLOW}[Worker ${botNumber}] exited with code ${code}${RESET}`
                        );

                        client.workers =
                            client.workers.filter(
                                item =>
                                    item !== worker
                            );

                        if (
                            client.botSlots.get(
                                slotId
                            ) === worker
                        ) {

                            client.botSlots.delete(
                                slotId
                            );
                        }

                        if (
                            !client.respawnEnabled
                        ) {

                            console.log(
                                `${GRAY}[Bot ${botNumber}] intentional shutdown - no respawn.${RESET}`
                            );

                            return;
                        }

                        if (
                            !authenticated ||
                            socket.readyState !==
                            socket.OPEN
                        ) {
                            return;
                        }

                        console.log(
                            `${RED}[Bot ${botNumber}] DISCONNECTED${RESET}`
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

                console.log(
                    `${GREEN}[Bot ${botNumber}] spawned -> Worker ${botNumber}${RESET}`
                );

                console.log(
                    `${BLUE}[Bot ${botNumber}] Proxy: ${proxy}${RESET}`
                );

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

                        client.tankIdx =
                            0;
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
                                        proxy.startsWith('socks')
                                            ? 'socks'
                                            : 'http',

                                    url:
                                        proxy
                                },

                                hash:
                                    `#${hash}`,

                                name:
                                    resolvedBotName,

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

                                customBuild:
                                    client.customBuild,

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
                    return;
                }

                if (
                    client.botSlots.has(slotId)
                ) {
                    return;
                }

                setTimeout(
                    () => {

                        if (
                            !client.respawnEnabled
                        ) {
                            return;
                        }

                        if (
                            !authenticated ||
                            socket.readyState !==
                            socket.OPEN
                        ) {
                            return;
                        }

                        if (
                            client.botSlots.has(
                                slotId
                            )
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

                            if (
                                !authenticated ||
                                socket.readyState !==
                                socket.OPEN
                            ) {
                                return;
                            }

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

                            case 'C': {

                                const receivedChallenge =
                                    data[0];

                                const receivedToken =
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

                                validateDiscordAccessToken(
                                    receivedToken
                                )
                                    .then(
                                        authResult => {

                                            if (!authResult) {

                                                send(
                                                    'AUTH',
                                                    'rejected'
                                                );

                                                closeConnection();

                                                console.log(
                                                    `${RED}${remoteAddress}${RESET} rejected: Discord role validation failed`
                                                );

                                                return;
                                            }

                                            authenticated =
                                                true;

                                            client.accessLevel =
                                                ROLE_ACCESS;

                                            client.discordUserId =
                                                authResult.user_id;

                                            const totalBotsUsed =
                                                getTotalBotsUsed(
                                                    authResult.user_id
                                                );

                                            send(
                                                'AUTH',
                                                ROLE_ACCESS,
                                                totalBotsUsed
                                            );

                                            console.log(
                                                `${GREEN}${remoteAddress}${RESET} verified with Discord role (${authResult.user_id})`
                                            );
                                        }
                                    )
                                    .catch(
                                        error => {

                                            console.error(
                                                `${RED}[Auth] Unexpected validation error:${RESET}`,
                                                error.message
                                            );

                                            send(
                                                'AUTH',
                                                'rejected'
                                            );

                                            closeConnection();
                                        }
                                    );

                                break;
                            }

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

                                            client.tankIdx =
                                                0;
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

                                const customBuild =
                                    data[3];

                                if (customBuild) {
                                    client.customBuild = customBuild;
                                }

                                if (
                                    client.accessLevel ===
                                    DEMO_ACCESS
                                ) {

                                    botCount =
                                        1;
                                }

                                if (
                                    botCount < 1
                                ) {

                                    botCount =
                                        1;
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
                                    `${GRAY}Build: ${client.customBuild}${RESET}`
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

                                const totalBotsUsed =
                                    addBotUsage(
                                        client.discordUserId,
                                        botCount
                                    );

                                send(
                                    'USAGE',
                                    totalBotsUsed
                                );

                                break;
                            }

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

                                client.botNames.clear();

                                client.lastRandomBotName =
                                    null;

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

                                                        followMouse:
                                                            data[6],

                                                        feeding:
                                                            data[7],

                                                        shift:
                                                            data[8],

                                                        autofire:
                                                            data[9],

                                                        autospin:
                                                            data[10],

                                                        override:
                                                            data[11],

                                                        manualMode:
                                                            data[12],

                                                        manualX:
                                                            data[13],

                                                        manualY:
                                                            data[14],

                                                        shieldOffset:
                                                            data[15]
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

                            case 'T': {

                                if (
                                    !authenticated ||
                                    client.accessLevel !==
                                    ROLE_ACCESS
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

            socket.on(
                'close',
                () => {

                    console.log(
                        `${YELLOW}${remoteAddress}${RESET} disconnected`
                    );

                    console.log(
                        `${CYAN}[Server] Client disconnected, bots kept alive.${RESET}`
                    );
                }
            );

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

    httpServer.listen(
        PORT,
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
                `${GREEN}Server listening on port ${PORT}${RESET}`
            );

            console.log(
                `${GRAY}Auth validation URL: ${AUTH_VALIDATE_URL}${RESET}`
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

            console.log();
        }
    );

})();
