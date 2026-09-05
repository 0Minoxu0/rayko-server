(async () => {
  const { parentPort } = await import('worker_threads');
  const { WebSocket } = await import('ws');
  const { HttpsProxyAgent } = await import('https-proxy-agent');
  const { SocksProxyAgent } = await import('socks-proxy-agent');
  const url = await import('url');
  const fetchModule = await import('node-fetch');
  const realFetch = fetchModule.default || fetchModule;

  let autoStartCount = 0;
  let autoStartMode = false;

  // ===== CHECK FOR COMMAND LINE ARGUMENTS =====
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      autoStartCount = parseInt(args[i + 1]);
      autoStartMode = true;
      break;
    }
  }

  // Force exit on any uncaught issue
  const forceKill = (reason) => {
    console.error(`FORCED EXIT: ${reason}`);
    const max = setTimeout(() => {}, 0);
    for (let i = 0; i <= max; i++) { clearTimeout(i); clearInterval(i); }
    
    global.window = null;
    global.document = null;
    currentBotInterface = null;
    
    process.exit(1);
  };

  process.on('uncaughtException', (err) => forceKill(err.message));
  process.on('unhandledRejection', (err) => forceKill(err.message));

  let isPaused = false;
  let currentBotInterface = {};
  let spawnWatchdog = null;
  let portalTimeout = null;
  let devastate = () => {
    if (destroyed) return;
    destroyed = true;
    clearInterval(mainInterval);
    
    parentPort.removeAllListeners('message');

    if (gameSocket) {
        try { gameSocket.close(); } catch(e){}
        gameSocket = null;
    }

    const max = setTimeout(() => {}, 0);
    for (let i = 0; i <= max; i++) {
        clearTimeout(i);
        clearInterval(i);
    }

    inputs.length = 0;
    allElements.length = 0;

    currentBotInterface = null;
    target = null;
    global.window = null;
    global.document = null;
    
    process.exit(0);
  };

  let target = {
    tank: 'basic',
    followMouse: true,
    feed: false,
    shift: false,
    mouseDown: false,
    rMouseDown: false,
    autofire: false,
    autospin: false,
    override: false,
    manualMode: false,
    manualX: 0,
    manualY: 0,
    chatSpam: "",
    forceFollowPlayer: true
  };
  let lastChatAt = 0;

  let lastAutofire = false;
  let lastAutospin = false;
  let lastOverride = false;
  let destroyed = false;
  let mainInterval = null;

const builds = {
    basic: "0/0/3/9/9/9/9/3",
    triangle: "0/2/3/7/7/7/7/7",
    smasher: "12/12/0/0/0/0/3/12/2/1"
  };

  const upgrade_map = {
    1: 50,
    2: 90,
    3: 120,
    4: 180
  };

  const tanks = {
    basic: {
      path: "",
      build: ""
    },

    // OTHER
    pursuer: {
      path: "uyiy",
      build: "0/0/0/0/0/0/0/9/0/0"
    },
    anni: {
      path: "kyu",
      build: builds.basic
    },
    shotgun: {
      path: "kj",
      build: builds.basic
    },
    penta: {
      path: "yuy",
      build: builds.basic
    },
    spread: {
      path: "yuu",
      build: builds.basic
    },
    octo: {
      path: "hyyc",
      build: "3/3/0/7/8/7/9/3/1/1"
    },
    autogunner: {
      path: "iiy",
      build: builds.basic
    },
    triplet: {
      path: "yuj",
      build: builds.basic
    },
    predator: {
      path: "uuy",
      build: builds.basic
    },
    triplex: {
      path: "yjy",
      build: builds.basic
    },
    quadruplex: {
      path: "yju",
      build: builds.basic
    },
    machinegunner: {
      path: "iih",
      build: builds.basic
    },
    beekeeper: {
      path: "iyi",
      build: builds.basic
    },
    atomizer: {
      path:"ihi",
      build: builds.basic
    },
    focal: {
      path:"ihh",
      build: builds.basic
    },
    cyclone: {
      path: "hyuc",
      build: builds.basic
    },
    dust_storm: {
      path: "hyuuc",
      build: builds.basic
    },
    autosmasher: {
      path: ["r", [3, 3], "i"],
      build: builds.basic
    },
    septatrap: {
      path: "hjic",
      build: "0/6/0/9/9/9/9"
    },

    // ANNIES
    obliterator: {
      path: "vkyuy",
      build: builds.basic
    },
    compound: {
      path: "kyui",
      build: builds.basic
    },
    wiper: {
      path: "kyuj",
      build: builds.basic
    },
    stomper: {
      path: ["k", "y", "u", [1, 3]],
      build: builds.basic
    },
    autoanni: {
      path: ["k", "y", "u", [2, 3]],
      build: builds.basic
    },
    shaver: {
      path: ["k", "y", "u", [2, 4]],
      build: builds.basic
    },
    eradicator: {
      path: ["k", "y", "u", [1, 4]],
      build: builds.basic
    },

    // FOR CRASH
    whirlwind: {
      path: "chyuk",
      build: "9/9/0/0/0/0/9"
    },
    tempest: {
      path: "chyuh",
      build: "9/9/0/0/0/0/9"
    },
    septamech: {
      path: "chjkh",
      build: "9/9/0/0/0/0/9"
    },
    doubleequalizer: {
      path: "yjyk",
      build: "9/9/0/0/0/0/9"
    },
    rigger: {
      path: "yjkk",
      build: "9/9/0/0/0/0/9"
    },
    doublespread: {
      path: "yuuy",
      build: "9/9/0/0/0/0/9"
    },
    palisade: {
      path: ["h", "j", "y", [3, 3]],
      build: "9/9/0/0/0/0/9"
    },

    // SMASHERS
    megasmasher: {
      path: ["r", [3, 3], "y"],
      build: builds.smasher
    },
    spike: {
      path: ["r", [3, 3], "u"],
      build: builds.basic
    },
    autoshasher: {
      path: ["r", [3, 3], "i"],
      build: builds.basic
    },
    landmine: {
      path: ["r", [3, 3], "h"],
      build: builds.basic
    },

    thorn: {
      path: ["r", [2, 3], "u", "y"],
      build: builds.basic
    },
    megaspike: {
      path: ["r", [2, 3], "u", "u"],
      build: builds.basic
    },
    claymore: {
      path: ["r", [2, 3], "u", "i"],
      build: builds.basic
    },
    spear: {
      path: ["r", [2, 3], "u", "j"],
      build: builds.basic
    },
    prick: {
      path: ["r", [2, 3], "u", "k"],
      build: builds.basic
    },

    slammer: {
      path: [[2, 3], "k", "y"],
      build: "8/10/12/0/0/0/0/12"
    },
    basher: {
      path: [[2, 3], "j", "j"],
      build: "8/10/12/0/0/0/0/12"
    },
    physician: {
      path: [[2, 3], [3, 3]],
      build: "0/12/0/0/0/0/12/12/3/3"
    },

    // DPS
    toppler: {
      path: "uijh",
      build: builds.basic
    },
    crack: {
      path: "yuyj",
      build: builds.basic
    },
    autooperator: {
      path: [[1, 3], "j", "j", [2, 3]],
      build: builds.basic
    },
    lorry: {
      path: "ihyy",
      build: "3/3/0/7/8/7/9/3/1/1"
    },

    // BUILDERS
    engineer: {
      path: "kui",
      build: builds.basic
    },
    assembler: {
      path: "kuj",
      build: builds.basic
    },
    architect: {
      path: "kuk",
      build: builds.basic
    },

    // AUTO
    auto5: {
      path: "hiy",
      build: builds.basic
    },
    mega3: {
      path: "hiu",
      build: builds.basic
    },
    auto6: {
      path: "hiiy",
      build: builds.basic
    },

    auto7: {
      path: "hiyy",
      build: builds.basic
    },
    mega5: {
      path: "hiyu",
      build: builds.basic
    },
    autoauto4: {
      path: "hiii",
      build: builds.basic
    },
    hurler3: {
      path: "hiui",
      build: builds.basic
    },
    batter4: {
      path: "hiiu",
      build: builds.basic
    },

    // LAUNCHERS
    skimmer: {
      path: "khy",
      build: builds.basic
    },
    twister: {
      path: "khu",
      build: builds.basic
    },
    swarmer: {
      path: "khi",
      build: builds.basic
    },
    sidewinder: {
      path: "khh",
      build: builds.basic
    },
    fieldgun: {
      path: "khj",
      build: builds.basic
    },

    // AR LAUNCHERS
    spinner: {
      path: "khju",
      build: builds.basic
    },
    helix_ar: {
      path: "khuh",
      build: builds.basic
    },
    hypertwister: {
      path: "khui",
      build: builds.basic
    },
    gyro: {
      path: "khuk",
      build: builds.basic
    },
    coli: {
      path: ["k", "h", "u", [3, 3]],
      build: builds.basic
    },

    hyperskimmer: {
      path: "khyi",
      build: builds.basic
    },
    skidder: {
      path: "khjy",
      build: builds.basic
    },
    ream: {
      path: "khyh",
      build: builds.basic
    },

    hyperswarmer: {
      path: "khih",
      build: builds.basic
    },
    molotov: {
      path: "khij",
      build: builds.basic
    },

    firework: {
      path: "khky",
      build: builds.basic
    },
    levi: {
      path: "khkh",
      build: builds.basic
    },

    hypercluster: {
      path: ["k", "h", [4, 2], "h"],
      build: builds.basic
    },
    neutron: {
      path: ["k", "h", [4, 2], [1, 4]],
      build: builds.basic
    },

    // DRONES
    overczar: {
      path: "jyyy",
      build: builds.basic
    },
    infestor: {
      path: "jii",
      build: "0/0/3/9/9/9/9/3"
    },
    tyrant: {
      path: "jyyk",
      build: builds.basic
    },
    autooverlord: {
      path: "jyyj",
      build: builds.basic
    },
    megaautooverseer: {
      path: "jyiy",
      build: builds.basic
    },
    tripleautooverseer: {
      path: "jyiu",
      build: builds.basic
    },
    tripleautopen: {
      path: "jyiu",
      build: builds.basic
    },
    autooverdrive: {
      path: "jyhh",
      build: builds.basic
    },
    headman: {
      path: "jkyy",
      build: builds.basic
    },
    overcheese: {
      path: "jkyu",
      build: builds.basic
    },
    overstorm: {
      path: "jjyu",
      build: builds.basic
    },

    // NECRO
    diviner: {
      path: "jiyy",
      build: builds.basic
    },
    autonecro: {
      path: "jiyi",
      build: builds.basic
    },
    necrodrive: {
      path: "jiyh",
      build: builds.basic
    },
    megaautounderdrive: {
      path: "jiiy",
      build: builds.basic
    },
    tripleautounderdrive: {
      path: "jiiu",
      build: builds.basic
    },

    pentamancer: {
      path: "jiky",
      build: builds.basic
    },
    pentadrive: {
      path: "jikh",
      build: builds.basic
    },
    warlock: {
      path: "jikj",
      build: builds.basic
    },
    autopentaseer: {
      path: "jiki",
      build: builds.basic
    },

    // CARRIER
    warship: {
      path: "juuy",
      build: builds.basic
    },
    battlerdrive: {
      path: "jjiu",
      build: builds.basic
    },
    bismarck: {
      path: "juku",
      build: builds.basic
    },
    proddrive: {
      path: "jjjj",
      build: builds.basic
    },
    manufacture: {
      path: "jukj",
      build: builds.basic
    },
    dirigible: {
      path: "jukk",
      build: builds.basic
    },
    autobattleship: {
      path: "juhh",
      build: builds.basic
    },
    autoprod: {
      path: "juki",
      build: builds.basic
    },
    autocruiserdrive: {
      path: "jjih",
      build: builds.basic
    },


    // TRI ANGLE
    rocket: {
      path: "huuy",
      build: "8/8/0/0/0/0/8/8/2/8"
    },
    fighter: {
      path: "huy",
      build: builds.triangle
    },
    bomber: {
      path: "huh",
      build: builds.triangle
    },
    autotriangle: {
      path: "huj",
      build: builds.triangle
    },
    surfer: {
      path: "huk",
      build: builds.triangle
    },
    eagle: {
      path: "kk",
      build: builds.triangle
    },
    phoenix: {
      path: "ihu",
      build: builds.triangle
    },
    vulture: {
      path: "uij",
      build: builds.triangle
    },

    // ARMS RACE TRI ANGLE
    // surfer
    browser: {
      path: "huky",
      build: builds.triangle
    },
    surferdrive: {
      path: "huki",
      build: builds.triangle
    },
    roller: {
      path: "hukh",
      build: builds.triangle
    },
    strider: {
      path: "hukk",
      build: builds.triangle
    },

    // auto tri angle
    megaautotriangle: {
      path: "hujy",
      build: builds.triangle
    },
    tripleautotriangle: {
      path: "huju",
      build: builds.triangle
    },
    autofighter: {
      path: "huji",
      build: builds.triangle
    },
    autobomber: {
      path: "hujk",
      build: builds.triangle
    },

    // taser
    kicker: {
      path: "uikj",
      build: builds.triangle
    },
    electrocutor: {
      path: "uiki",
      build: builds.triangle
    },

    // eagle
    autoeagle: {
      path: "kkk",
      build: builds.triangle
    },
    griffin: {
      path: "kkh",
      build: builds.triangle
    },
    autoassassin: {
      path: "uyh",
      build: builds.basic
    },
    single: {
      path: "uyj",
      build:builds.basic
    },

    // BASIC & TREE TANKS
    twin: {
      path: "y",
      build: builds.basic
    },
    doubletwin: {
      path: "yy",
      build: builds.basic
    },
    tripleshot: {
      path: "yu",
      build: builds.basic
    },
    sniper: {
      path: "u",
      build: builds.basic
    },
    ranger: {
      path: "uyy",
      build: builds.basic
    },
    machinegun: {
      path: "i",
      build: builds.basic
    },
    sprayer: {
      path: "ih",
      build: builds.basic
    },
    redistributor: {
      path: "ihy",
      build: builds.basic
    },
    flankguard: {
      path: "h",
      build: builds.basic
    },
    hexatank: {
      path: "hy",
      build: builds.basic
    },
    octotank: {
      path: "hyy",
      build: "3/3/0/7/8/7/9/3/1/1"
    },
    hexatrapper: {
      path: "hyi",
      build: builds.basic
    },
    triangle: {
      path: "hu",
      build: builds.basic
    },
    booster: {
      path: "huu",
      build: builds.triangle
    },
    falcon: {
      path: "hui",
      build: builds.triangle
    },
    auto3: {
      path: "hui",
      build: builds.basic
    },
    auto4: {
      path: "hii",
      build: builds.basic
    },
    banshee: {
      path: "huih",
      build: builds.basic
    },
    trapguard: {
      path: "hh",
      build: builds.basic
    },
    buchwhacker: {
      path: "hhy",
      build: builds.basic
    },
    gunnertrapper: {
      path: "hhu",
      build: builds.basic
    },
    conqueror: {
      path: "hhj",
      build: builds.basic
    },
    bulwark: {
      path: "hhk",
      build: builds.basic
    },
    parapet: {
      path: "hhjy",
      build: "3/3/0/7/8/7/8/5/1/0"
    },
    tritrapper: {
      path: "hj",
      build: builds.basic
    },
    fortress: {
      path: "hjy",
      build: builds.basic
    },
    septatrapper: {
      path: "hji",
      build: builds.basic
    },
    tripletwin: {
      path: "hk",
      build: builds.basic
    },
    director: {
      path: "j",
      build: builds.basic
    },
    pounder: {
      path: "k",
      build: builds.basic
    },
    automingler: {
      path: "hykj",
      build: "2/3/2/7/8/7/9/3/1/0"
    },
    mingler: {
      path: "hyk",
      build: builds.basic
    },
    underseer: {
      path: "ji",
      build: builds.basic
    },
    rocketeer: {
      path: "khk",
      build: builds.basic
    },
    destroyer: {
      path: "ky",
      build: builds.basic
    },
    launcher: {
      path: "kh",
      build: builds.basic
    },
    gale: {
      path: "hyyi",
      build: "3/3/0/7/8/7/9/3/1/1"
    },

    gunner: {
      path: "ii",
      build: builds.basic
    },
    nailgun: {
      path: "iiu",
      build: builds.basic
    },
    pincer: {
      path: "iiuk",
      build: builds.basic
    },
    nona: {
      path: "hjiy",
      build: builds.basic
    },
    septamachine: {
      path: "hjiu",
      build: builds.basic
    },
    assassin: {
      path: "uy",
      build: builds.basic
    },
    stalker: {
      path: "uyi",
      build: builds.basic
    },
    healer: {
      path: "x",
      build: builds.basic
    },

    overseer: {
      path: "jy",
      build: builds.basic
    },
    cruiser: {
      path: "ju",
      build: builds.basic
    },
    spawner: {
      path: "jh",
      build: builds.basic
    },
    directordrive: {
      path: "jj",
      build: builds.basic
    },
    honcho: {
      path: "jk",
      build: builds.basic
    },
    manager: {
      path: "jx",
      build: builds.basic
    },
    foundry: {
      path: "jh",
      build: builds.basic
    },
    topbanana: {
      path: "jh",
      build: builds.basic
    },
    shopper: {
      path: "jh k",
      build: builds.basic
    },
    megaspawner: {
      path: "jhi",
      build: builds.basic
    },
    ultraspawner: {
      path: "jhiy",
      build: builds.basic
    },
    chemist: {
      path: [[2, 3], [1, 2], [1, 2]],
      build: "3/3/0/7/8/7/9/3/1/1"
    },
    jerker: {
      path: [[2, 1], [3, 1], [2, 3], [3, 3]],
      build: builds.smasher
    },
    limpet: {
      path: [[2, 3], [1, 2], [1, 1]],
      build: builds.smasher
    }
  };

  const options = { start: () => {} };

  WebAssembly.instantiateStreaming = false;
  const arras = (function () {
    const log = function () {
      global.console.log(`[headless]`, ...arguments);
    };

    let app = false;
    const wasm = function () {
      return {
        arrayBuffer: function () {
          return app;
        }
      };
    };
    let lastStatus = 0, statusData = '';
    const getStatus = function (f, s) {
      let now = global.performance.now();
      if (statusData && now - lastStatus < 15000) {
        return {
          then: function () {
            return {
              then: function (f) {
                let i = JSON.parse(statusData);
                s(i);
                f(i);
              }
            };
          }
        };
      }
      let then = function () {};
      realFetch(f).then(x => x.text()).then(x => {
        statusData = x;
        let i = JSON.parse(x);
        s(i);
        then(i);
      });
      return {
        then: function () {
          return {
            then: function (f) {
              then = f;
            }
          };
        }
      };
    };

    let ready = false, script = false, o = [], then = function (f) {
      if (ready) {
        f();
      } else {
        o.push(f);
      }
    };

    const initializeAndRunQueue = function () {
      ready = true;
      for (let i = 0, l = o.length; i < l; i++) {
        o[i]();
      }
      o = [];
      then = function (f) {
        f();
      };
    };

    let prerequisites = 0;
    const onPrerequisiteLoaded = function () {
      prerequisites++;
      if (prerequisites === 2) {
        initializeAndRunQueue();
      }
    };

    realFetch('https://arras.io/app.wasm').then(x => {
      x.arrayBuffer().then(x => {
        app = x;
        onPrerequisiteLoaded();
      });
    });

    const loadScript = function () {
      const activateBot = (scriptContent) => {
        script = scriptContent;
        onPrerequisiteLoaded();
      };

      const extractScriptFromHtml = (html) => {
        const scriptTagStart = html.indexOf('<script>');
        if (scriptTagStart === -1) return null;
        let scriptContent = html.slice(scriptTagStart + 8);
        const scriptTagEnd = scriptContent.indexOf('</script');
        if (scriptTagEnd === -1) return null;
        scriptContent = scriptContent.slice(0, scriptTagEnd);
        return scriptContent;
      };

      realFetch('https://arras.io').then(x => x.text()).then(html => {
        const extractedScript = extractScriptFromHtml(html);
        if (extractedScript) {
          activateBot(extractedScript);
        }
      }).catch(err => {
        log('FATAL: Could not fetch from arras.io.', err);
      });
    };
    loadScript();

    let trigger = {};
    const run = function (x, config, oa) {
      const log = function () {
        global.console.log(`[headless ${config.id}]`, ...arguments);
      };

      let inGame = false;

      // Détection si le bot s'appelle "zombie" (insensible à la casse, ex: zombie 1, ZombieX, etc.)
      const isZombie = config.name && /zombie/i.test(config.name);
      const zombiePhrases = [
        "Braiiiiins...",
        "Must consume brains...",
        "Uuuugh...",
        "Fresh meat...",
        "Grrr... brains..."
      ];

      const internalBotInterface = {
        log: log,
        getLevel: () => lastSeenLevel,
        isInGame: () => inGame,
        simulateKey: (code) => {
          if (trigger.keydown && trigger.keyup) {
            trigger.keydown(code);
            setTimeout(() => trigger.keyup(code), 50);
          }
        }
      };

      let destroy = function () {
        if (destroyed) { return; }
        destroyed = true;
        
        clearInterval(mainInterval);
        if (portalTimeout) { global.clearTimeout(portalTimeout); portalTimeout = null; }
        
        if (gameSocket) {
            try { gameSocket.close(); } catch(e){}
            gameSocket = null;
        }

        parentPort.removeAllListeners('message');

        const max = setTimeout(() => {}, 0);
        for (let j = 0; j <= max; j++) {
            clearTimeout(j);
            clearInterval(j);
        }

        inputs.length = 0;
        allElements.length = 0;

        currentBotInterface = null;
        target = null;
        global.window = null;
        global.document = null;
        
        process.exit(0); 
      };
      
      devastate = destroy;

      spawnWatchdog = global.setTimeout(() => {
          if (!inGame) {
              log("WATCHDOG: Failed to spawn in 30s. Terminating...");
              devastate();
          }
      }, 30000);

      const setInterval = new Proxy(global.setInterval, {
        apply: function (a, b, c) {
          if (destroyed) { return; }
          return Reflect.apply(a, b, c);
        }
      }), setTimeout = new Proxy(global.setTimeout, {
        apply: function (a, b, c) {
          if (destroyed) { return; }
          return Reflect.apply(a, b, c);
        }
      });

      const elementListeners = new WeakMap();
      const allElements = [];
      const handleListener = function (type, f, element) {
        if (!element) return;
        if (!elementListeners.has(element)) {
          elementListeners.set(element, {});
        }
        const listeners = elementListeners.get(element);
        if (!listeners[type]) {
          listeners[type] = [];
        }
        listeners[type].push(f);
      };

      const broadcastEvent = (type, event) => {
        const targets = [global.window, global.document, ...allElements];
        for (const target of targets) {
          const listeners = elementListeners.get(target);
          if (listeners && listeners[type]) {
            for (const f of listeners[type]) {
              try { f.call(target, event); } catch (e) { }
            }
          }
        }
      };

      trigger = {
        mousemove: function (clientX, clientY) {
          broadcastEvent('mousemove', { isTrusted: true, clientX: clientX, clientY: clientY });
        },
        mousedown: function (clientX, clientY, button) {
          broadcastEvent('mousedown', { isTrusted: true, clientX: clientX, clientY: clientY, button: button });
        },
        mouseup: function (clientX, clientY, button) {
          broadcastEvent('mouseup', { isTrusted: true, clientX: clientX, clientY: clientY, button: button });
        },
        keydown: function (code, repeat) {
          broadcastEvent('keydown', { isTrusted: true, code: code, key: '', repeat: repeat || false, preventDefault: function () { } });
        },
        keyup: function (code, repeat) {
          broadcastEvent('keyup', { isTrusted: true, code: code, key: '', repeat: repeat || false, preventDefault: function () { } });
        }
      };

      global.window = global.parent = global.top = {
        WebAssembly,
        googletag: {
          cmd: { push: function (f) { try { f(); } catch (e) { } } },
          defineSlot: function () { return this; },
          addService: function () { return this; },
          display: function () { return this; },
          pubads: function () { return this; },
          enableSingleRequest: function () { return this; },
          collapseEmptyDivs: function () { return this; },
          enableServices: function () { return this; }
        },
        arrasAdDone: true
      };

      global.crypto = global.window.crypto = { getRandomValues: function (a) { return a; } };
      global.addEventListener = global.window.addEventListener = function (type, f) { handleListener(type, f, global.window); };
      global.removeEventListener = global.window.removeEventListener = function (type, f) {};
      global.Image = global.window.Image = function () { return {}; };

      let inputs = [], setValue = function (str) {
        for (let i = 0, l = inputs.length; i < l; i++) {
          const input = inputs[i];
          input.value = str;
          const listeners = elementListeners.get(input);
          if (listeners) {
            const event = { target: input, isTrusted: true };
            if (listeners.input) {
              for (const f of listeners.input) { try { f.call(input, event); } catch (e) { } }
            }
            if (listeners.change) {
              for (const f of listeners.change) { try { f.call(input, event); } catch (e) { } }
            }
          }
        }
      };

      let position = [0, 0, 5], died = false, died2 = false, ignore = false, disconnected = false, connected = false, upgrade = false, reconnectCount = 0, isUpgrading = false, isDreadnought = false, dreadStatsApplied = false, dreadStage = 0, dreadCooldown = 0, lastSeenLevel = 0;
      let innerWidth = global.window.innerWidth = 500;
      let innerHeight = global.window.innerHeight = 500;

      let st = 2, lx = 0, gd = 1, canvasRef = {}, sr = 1, s = 1;

      const g = function () {
        let w = innerWidth;
        let h = innerHeight;
        if (!canvasRef.width) canvasRef.width = w;
        if (w * 0.5625 > h) {
          s = 888.888888888 / w;
        } else {
          s = 500 / h;
        }
        sr = canvasRef.width / w;
      };
      g();

      global.document = global.window.document = (function () {
        const emptyFunc = () => {};
        const emptyStyle = { setProperty: emptyFunc };

        const simulatedContext2D = {
          isContextLost: () => false,
          fillText: function () {
            if (ignore) { return; }
            const textString = arguments[0];
            if (typeof textString !== 'string') return;

            if (inGame && !died) {
              let levelMatch = textString.match(/(?:Lvl|Level)\s+(\d+)/);
              if (levelMatch) {
                let parsedLevel = parseInt(levelMatch[1]);
                if (parsedLevel > lastSeenLevel) {
                  lastSeenLevel = parsedLevel;
                }
              }

              let expectedDreadText = config.name ? config.name + " - Dreadnought" : " - Dreadnought";
              if ((textString === expectedDreadText || textString === "Dreadnought" || /^(?:Lvl|Level)\s+\d+\s+Dreadnought$/.test(textString)) && !isDreadnought) {
                isDreadnought = true;
                dreadStatsApplied = false;
                dreadStage = 0; 
                dreadCooldown = Date.now() + 1000; 
              }

              if (isDreadnought && !dreadStatsApplied && Date.now() > dreadCooldown) {
                  dreadStatsApplied = true;
                  let statDelay = 0;
                  const dreadStats = [2, 3, 6, 9, 10, 12, 6, 11, 1, 0];
                  for (let i = 1; i <= dreadStats.length; i++) {
                    const statValue = dreadStats[i - 1];
                    let keyNum = i === 10 ? 0 : i;
                    for (let s = 0; s < statValue; s++) {
                      setTimeout(() => controller.press("Digit" + keyNum), statDelay);
                      statDelay += 20; 
                    }
                  }
              }
            }

            if (this.font === 'bold 7px Ubuntu' && this.fillStyle === 'rgb(255,255,255)') {
              if (textString === `You have spawned! Welcome to the game.`) {
                hasJoined = firstJoin = true;
                if (spawnWatchdog) { clearTimeout(spawnWatchdog); spawnWatchdog = null; }
                position[0] = position[1] = 0;
              } else if (textString === 'You have traveled through a portal!') {
                position[0] = position[1] = 0;
              }
              if (!died && (
                (textString.startsWith('The server was ') && textString.endsWith('% active'))
                || textString.startsWith('Survived for ')
                || textString.startsWith('Succumbed to ')
                || textString === 'You have self-destructed.'
                || textString === `Vanished into thin air`
                || textString.startsWith('You have been killed by '))) {
                died = true;
                isDreadnought = false; 
                dreadStatsApplied = false;
                dreadStage = 0; 
                dreadCooldown = 0; 
                lastSeenLevel = 0;
              }
            }

            if (this.font === 'bold 7.5px Ubuntu' && this.fillStyle === 'rgb(231,137,109)') {
              if (textString === 'You have been temporarily banned from the game.' || textString === 'Your IP address have been blacklisted due to suspicious activities.') {
                disconnected = true;
                destroy();
              } else if (textString.startsWith('The connection closed due to ') || textString.startsWith('The server was ')) {
                disconnected = true;
                if (!destroyed) {
                  parentPort.postMessage({ type: "proxy_failed", url: config.proxy.url });
                  devastate();
                  process.exit(1); 
                }
              }
            }

            if (this.font === 'bold 5.1px Ubuntu' && this.fillStyle === 'rgb(255,255,255)') {
              if (textString.startsWith('Coordinates: (')) {
                if (died2) {
                  hasJoined = true;
                }
                let b = textString.slice(14), l = b.length;
                if (b[l - 1] === ')') {
                  b = b.slice(0, l - 1).split(', ');
                  if (b.length === 2) {
                    position[0] = parseFloat(b[0]);
                    position[1] = parseFloat(b[1]);
                    position[2] = 5;
                  }
                }
              }
            }
          },
          measureText: (text) => ({ width: text.length }),
          clearRect: emptyFunc, strokeRect: emptyFunc, fillRect: emptyFunc,
          save: emptyFunc, translate: emptyFunc, clip: emptyFunc, restore: emptyFunc,
          beginPath: emptyFunc,
          moveTo: function () {
            canvasRef = this.canvas;
            if (st > 0) {
              st--;
              if (st === 1) {
                lx = arguments[0];
              } else {
                const diff = arguments[0] - lx;
                if (diff !== 0) {
                  gd = sr / diff;
                }
              }
            }
          },
          lineTo: emptyFunc, rect: emptyFunc,
          arc: emptyFunc, ellipse: emptyFunc, roundRect: emptyFunc, closePath: emptyFunc,
          fill: emptyFunc, stroke: emptyFunc, strokeText: emptyFunc, drawImage: emptyFunc,
        };

        const createElement = function (tag, options) {
          const element = {
            tag: tag ? tag.toLowerCase() : '',
            appended: false,
            value: '',
            checked: false,
            style: emptyStyle,
            addEventListener: (type, f) => handleListener(type, f, element),
            setAttribute: emptyFunc,
            appendChild: (e) => { e.appended = true; },
            focus: emptyFunc,
            blur: emptyFunc,
            remove: emptyFunc,
            getBoundingClientRect: () => ({
              width: innerWidth, height: innerHeight, top: 0, left: 0, bottom: innerHeight, right: innerWidth,
            }),
          };

          if (element.tag === 'canvas') {
            element.toDataURL = () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAADElEQVQImWNgoBMAAABpAAFEI8ARAAAAAElFTkSuQmCC';
            element.getContext = (type) => {
              if (type === '2d') {
                simulatedContext2D.canvas = element;
                return simulatedContext2D;
              }
              return null;
            };
          }

          if (element.tag === 'input') {
            inputs.push(element);
          }
          allElements.push(element);

          if (options) {
            Object.assign(element, options);
          }

          return element;
        };

        const doc = createElement('document', {
          createElement: createElement,
          body: null,
          fonts: { load: () => true },
          referrer: '',
        });
        doc.body = createElement('body');

        return doc;
      })();

      global.location = global.window.location = {
        hostname: 'arras.io',
        hash: config.hash,
        query: ''
      };
      let lastHash = global.location.hash;
      global.prompt = global.window.prompt = function () {};
      let devicePixelRatio = global.window.devicePixelRatio = 1;
      let a = false;
      global.requestAnimationFrame = global.window.requestAnimationFrame = function (f) {
        st = 2;
        g();
        a = f;
      };
      global.performance = {
        time: 0,
        now: function () { return this.time; }
      };

      let proxyAgent = null;
      if (config.proxy && config.proxy.url) {
        const proxyUrl = new url.URL(config.proxy.url);
        if (proxyUrl.protocol.startsWith('socks')) {
          proxyAgent = new SocksProxyAgent(config.proxy.url);
        } else if (proxyUrl.protocol.startsWith('http')) {
          proxyAgent = new HttpsProxyAgent(config.proxy.url, {
              keepAlive: true,
              keepAliveMsecs: 1000,
              scheduling: 'lifo'
          });
        }
      }

      let i = 0, controller = {
        x: 250,
        y: 250,
        mouseDown: function (button) { trigger.mousedown(controller.x, controller.y, button); },
        mouseUp: function (button) { trigger.mouseup(controller.x, controller.y, button); },
        click: async function (x, y) {
          trigger.mousedown(x, y, 0);
          await new Promise(r => setTimeout(r, 50));
          trigger.mouseup(x, y, 0);
        },
        press: function (code) {
          trigger.keydown(code);
          trigger.keyup(code);
        },
        chat: function (str) {
          if (!str) return;
          controller.press('Enter');
          global.performance.time += 200;
          if (typeof a === 'function') a();

          setValue(str);
          global.performance.time += 200;
          if (typeof a === 'function') a();

          controller.press('Enter');
          global.performance.time += 200;
          if (typeof a === 'function') a();

          setValue("");
        },
        moveDirection: function (x, y) {
          trigger[x < 0 ? 'keydown' : 'keyup']('KeyA');
          trigger[y < 0 ? 'keydown' : 'keyup']('KeyW');
          trigger[x > 0 ? 'keydown' : 'keyup']('KeyD');
          trigger[y > 0 ? 'keydown' : 'keyup']('KeyS');
        },
        iv: 4 / Math.PI,
        dv: Math.PI / 4,
        ix: [1, 1, 0, -1, -1, -1, 0, 1],
        iy: [0, 1, 1, 1, 0, -1, -1, -1],
        moveVector: function (x, y) {
          let d = Math.atan2(y, x);
          let h = (Math.round(d * controller.iv) % 8 + 8) % 8;
          let x2 = controller.ix[h];
          let y2 = controller.iy[h];
          controller.moveDirection(x2, y2);
          return h * controller.dv;
        }
      }, statusRecieved = false, firstJoin = false, hasJoined = false, timeouts = {};

      async function waitTime(timeout) {
        await new Promise(resolve => setTimeout(resolve, timeout));
      }

      function getDir(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
      }

      function stopMoving() {
        for (const key of "WASD") {
          trigger.keyup("Key" + key);
        }
      }

      // === MODIFICATION : GESTION DE LA VITESSE DE MOUVEMENT RÉDUITE ===
      let lastMoveState = { W: false, A: false, S: false, D: false };
      let moveTickCounter = 0;

      function pathfind(x, y) {
        moveTickCounter++;
        // On n'actualise les inputs de mouvement qu'une fois sur 2 pour ralentir la réactivité / vitesse ressentie
        if (moveTickCounter % 1 !== 0) return; // Vitesse , change le chiffre apres Counter pour ralentir plus c haut plus c lent 

        const angle = getDir(position[0], position[1], x, y);
        let hold = {};

        if (angle >= -Math.PI / 8 && angle < Math.PI / 8) {
          hold["KeyD"] = true;
        } else if (angle >= Math.PI / 8 && angle < 3 * Math.PI / 8) {
          hold["KeyS"] = true;
          hold["KeyD"] = true;
        } else if (angle >= 3 * Math.PI / 8 && angle < 5 * Math.PI / 8) {
          hold["KeyS"] = true;
        } else if (angle >= 5 * Math.PI / 8 && angle < 7 * Math.PI / 8) {
          hold["KeyS"] = true;
          hold["KeyA"] = true;
        } else if (angle >= 7 * Math.PI / 8 || angle < -7 * Math.PI / 8) {
          hold["KeyA"] = true;
        } else if (angle >= -7 * Math.PI / 8 && angle < -5 * Math.PI / 8) {
          hold["KeyW"] = true;
          hold["KeyA"] = true;
        } else if (angle >= -5 * Math.PI / 8 && angle < -3 * Math.PI / 8) {
          hold["KeyW"] = true;
        } else {
          hold["KeyW"] = true;
          hold["KeyD"] = true;
        }

        for (let key of "WASD") {
          let keyName = "Key" + key;
          let shouldHold = !!hold[keyName];
          if (lastMoveState[key] !== shouldHold) {
            trigger[shouldHold ? "keydown" : "keyup"](keyName);
            lastMoveState[key] = shouldHold;
          }
        }
      }

      async function onJoin() {
        if (isUpgrading) return;
        isUpgrading = true;

        await waitTime(600);
        
        if (isDreadnought) {
            isUpgrading = false; 
            return; 
        }

        block = true; 
        died2 = false; 

        controller.press('KeyL');
        position[2] = 5;

        reconnectCount = 0;

        for (const key of tanks[target.tank].path) {
          if (key === "wait") {
            await waitTime(1000);
          } else if (key instanceof Array) {
            await waitTime(500);
            await controller.click(upgrade_map[key[0]], upgrade_map[key[1]]);
            await waitTime(500);
          } else {
            controller.press("Key" + key.toUpperCase());
            await waitTime(500);
          }
        }

        let build;
        if (target.feed) {
          build = [0, 0, 12, 0, 0, 0, 0, 8];
          controller.press("KeyR");
        } else {
          build = tanks[target.tank].build.split("/");
        }

        let i2 = 0;
        for (let idx = 1; idx <= build.length; idx++) {
          const stat = parseInt(build[i2]);
          let displayIdx = idx;
          if (displayIdx == 10) displayIdx = 0;

          for (let i3 = 0; i3 < stat; i3++) {
            controller.press("Digit" + displayIdx);
          }
          if (displayIdx == 0) break;
          i2++;
        }

        for (const key of config.keysHold) {
          trigger.keydown("Key" + key.toUpperCase());
        }

        inGame = true;

        if (target.autofire) {
          controller.press("KeyE");
        }
        lastAutofire = target.autofire;

        if (target.autospin) {
          controller.press("KeyC");
        }
        lastAutospin = target.autospin;

        if (target.override) {
          controller.press("KeyR");
        }
        lastOverride = target.override;

        block = false; 
        isUpgrading = false;
        hasJoined = false; 
      }

      let block = false;
      mainInterval = setInterval(function () {
        if (block || isPaused) {
          return;
        }

        if (a) {
          switch (i) {
            case 1: {
              setValue(config.name);
              controller.press("Enter");
              break;
            }
          }
          if (lastHash !== global.location.hash) {
            lastHash = global.location.hash;
          }
          let at = timeouts[i];
          if (at) {
            delete timeouts[i];
            for (let idx = 0, l = at.length; idx < l; idx++) {
              at[idx]();
            }
          }
          position[2]--;
          if (position[2] < 0) {
            controller.press('KeyL');
          }
          if (hasJoined) {
            hasJoined = false;
            if (isUpgrading) return;
            firstJoin = false;

            if (!target.tank || !tanks[target.tank]) {
              target.tank = 'basic';
            }

            const path = tanks[target.tank].path;
            if (Array.isArray(path) && path.some(key => Array.isArray(key))) {
              setTimeout(onJoin, 1200);
            } else {
              onJoin();
            }
          }

          if (target.triggerUpgrade) {
            target.triggerUpgrade = false; 
            if (isDreadnought) {
                if (dreadStage === 0) {
                  controller.press("KeyU");
                  dreadStage = 0.5;
                } else if (dreadStage === 0.5) {
                  controller.press("KeyU");
                  dreadStage = 1;
                } else if (dreadStage === 1) {
                  controller.press("KeyI");
                  dreadStage = 2;
                } else if (dreadStage === 2) {
                  controller.press("KeyY");
                  dreadStage = 3;
                } else if (dreadStage === 3) {
                  controller.press("KeyY");
                  dreadStage = 4;
                }
            }
          }

          if (inGame && config.type === 'follow') {
            // === COMPORTEMENT SPÉCIAL ZOMBIE ===
            if (isZombie) {
              // Mouvement erratique de zombie dans tous les sens
              let randomAngle = Math.random() * Math.PI * 2;
              let erraticX = position[0] + Math.cos(randomAngle) * 300;
              let erraticY = position[1] + Math.sin(randomAngle) * 300;
              
              pathfind(erraticX, erraticY);

              // Souris saccadée et erratique
              controller.x = (innerWidth / 2) + (Math.random() - 0.5) * 400;
              controller.y = (innerHeight / 2) + (Math.random() - 0.5) * 400;
              trigger.mousemove(controller.x, controller.y);

              // Autofire activé de force pour attaquer agressivement
              if (!target.autofire) {
                controller.press("KeyE");
                lastAutofire = true;
              }

              // Spam de chat zombie toutes les 4 secondes
              if (Date.now() - lastChatAt > 4000) {
                lastChatAt = Date.now();
                const randomPhrase = zombiePhrases[Math.floor(Math.random() * zombiePhrases.length)];
                controller.chat(randomPhrase);
              }
            } else {
              // === COMPORTEMENT STANDARD ===
              let moveTarget = { x: 0, y: 0 };
              let aimTarget = { x: 0, y: 0 };
              let valid = false;

              if (target.manualMode) {
                moveTarget.x = aimTarget.x = target.manualX;
                moveTarget.y = aimTarget.y = target.manualY;
                valid = true;
              } else if (target.x !== undefined && target.x !== null) {
                moveTarget.x = target.x;
                moveTarget.y = target.y;
                aimTarget.x = target.x + target.mouseX;
                aimTarget.y = target.y + target.mouseY;

                if (target.followMouse) {
                  moveTarget.x = aimTarget.x;
                  moveTarget.y = aimTarget.y;
                }

                // Follow Mouse must take priority over the optional
                // force-follow-player mode. Previously this block always
                // overwrote the mouse target, so the controller checkbox
                // appeared to do nothing.
                if (target.forceFollowPlayer && !target.followMouse) {
                  let angle = Math.atan2(target.mouseY, target.mouseX);
                  let offset = (target.shieldOffset || 0) * 80; 
                  moveTarget.x = target.x + (Math.cos(angle) * offset);
                  moveTarget.y = target.y + (Math.sin(angle) * offset);
                }
                valid = true;
              }

              if (valid) {
                pathfind(moveTarget.x, moveTarget.y);

                let angle;
                if (target.shift) {
                  angle = Math.atan2(target.mouseY, target.mouseX);
                } else {
                  angle = getDir(position[0], position[1], aimTarget.x, aimTarget.y);
                }

                controller.x = (innerWidth / 2) + Math.cos(angle) * 200;
                controller.y = (innerHeight / 2) + Math.sin(angle) * 200;
                trigger.mousemove(controller.x, controller.y);
              }
            }

            controller[target.mouseDown && !target.feed ? "mouseDown" : "mouseUp"]();
            controller[target.rMouseDown && !target.feed ? "mouseDown" : "mouseUp"](2);

            if (target.autofire !== lastAutofire) {
              controller.press("KeyE");
              lastAutofire = target.autofire;
            }
            if (target.autospin !== lastAutospin) {
              controller.press("KeyC");
              lastAutospin = target.autospin;
            }
            if (target.override !== lastOverride) {
              controller.press("KeyR");
              lastOverride = target.override;
            }

            if (!isZombie && target.chatSpam && Date.now() - lastChatAt > 3000) {
              lastChatAt = Date.now();
              controller.chat(target.chatSpam);
            }
          }

          if (died) {
            inGame = false;
            stopMoving();
            block = true;
            ignore = true;
            let index = 0;
            let interval = setInterval(function () {
              if (destroyed) {
                clearInterval(interval);
                return;
              }
              for (let k = 0; k < 30; k++) {
                let r = 100 + 900 * Math.random(), q = 100 + 900 * Math.random(), p = 0.5 + Math.random();
                innerWidth = global.window.innerWidth = r;
                innerHeight = global.window.innerHeight = q;
                devicePixelRatio = global.window.devicePixelRatio = p;
                global.performance.time += 9000;
                a();
              }
              index++;
              if (index >= 2) {
                clearInterval(interval);
                end();
              }
            }, 30);
            
            let end = function () {
              innerWidth = global.window.innerWidth = 500;
              innerHeight = global.window.innerHeight = 500;
              devicePixelRatio = global.window.devicePixelRatio = 1;
              if (config.autoRespawn) {
                died2 = true;
                const interv = setInterval(() => {
                  controller.press('Enter');
                  controller.press('Escape');
                  if (!died2) {
                    clearInterval(interv);
                  }
                }, 4000);
              }
              block = false;
              ignore = false;
              global.performance.time += 9000;
              a();
              if (statusRecieved) { i++; }
            };
            died = false;
            return;
          }
          global.performance.time += 9000;
          a();
          if (statusRecieved) {
            i++;
          }
        }
      }, 100);

      const storageMap = new Map();
      storageMap.set('optIncognito', 'false');
      
      global.localStorage = global.window.localStorage = {
        setItem: function (key, val) { storageMap.set(String(key), String(val)); },
        getItem: function (key) {
          const k = String(key);
          if (storageMap.has(k)) return storageMap.get(k);
          return null;
        },
        removeItem: function(key) { storageMap.delete(String(key)); },
        clear: function() {
          storageMap.clear();
          storageMap.set('optIncognito', 'false');
        }
      };

      global.fetch = global.window.fetch = new Proxy(realFetch, {
        apply: function (a, b, args) {
          let reqUrl = args[0];

          if (reqUrl.startsWith('./')) {
            reqUrl = args[0] = 'https://arras.io' + reqUrl.slice(1);
          } else if (reqUrl.startsWith('/')) {
            reqUrl = args[0] = 'https://arras.io' + reqUrl;
          }

          let options = args[1] || {};
          if (proxyAgent) {
            options.agent = proxyAgent;
          }
          args[1] = options;

          if (reqUrl.includes('app.wasm')) { return wasm(); }

          if (reqUrl.endsWith('/clientCount')) {
            return new Promise(resolve => resolve({
              json: async () => ({ "ok": true, "clients": 7777 })
            }));
          }

          const fetchPromise = Reflect.apply(a, b, args);

          if (reqUrl.endsWith('/status')) {
            return fetchPromise.then(async response => {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const cloned = response.clone();
                cloned.json().then(item => {
                  if (item.ok && item.status) {
                    statusRecieved = true;
                  }
                }).catch(() => { });
                return response;
              } else {
                return {
                  ok: true,
                  status: 200,
                  headers: new Map([['content-type', 'application/json']]),
                  json: async () => ({ ok: false, status: {} }),
                  text: async () => JSON.stringify({ ok: false, status: {} }),
                  arrayBuffer: async () => Buffer.from(JSON.stringify({ ok: false, status: {} })),
                  clone: function () { return this; }
                };
              }
            }).catch(() => {
              return {
                ok: false,
                json: async () => ({ ok: false }),
                clone: function () { return this; }
              };
            });
          }

          return fetchPromise;
        }
      });

      global.navigator = global.window.navigator = {};
      let gameSocket = false;

      global.WebSocket = global.window.WebSocket = new Proxy(WebSocket, {
        construct: function (a, b, c) {
          let fullUrl = b[0];
          let time = Math.round(Date.now() / 1000);
          
          let queryIdx = fullUrl.indexOf("/?");
          if (queryIdx !== -1) {
            fullUrl = fullUrl.slice(0, queryIdx);
          }
          fullUrl += "/?a=3&b=8f8d16adff17e2b9&t=" + time;

          let host = new url.URL(fullUrl).host;

          let h = {
            headers: {
              'user-agent': `Mozilla/5.0 (X11; CrOS x86_64 14588.123.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome 101.0.0.0 Safari/537.36`,
              'accept-encoding': 'gzip, deflate, br',
              'accept-language': 'en-US,en;q=0.9',
              'cache-control': 'no-cache',
              'connection': 'Upgrade',
              'origin': 'https://arras.io',
              'pragma': 'no-cache',
              'upgrade': 'websocket',
              'Sec-WebSocket-Protocol': b[1] ? b[1].join(', ') : '',
              'host': host
            },
            followRedirects: true,
            keepAlive: true,
            keepAliveInitialDelay: 5000,
            origin: 'https://arras.io',
          };

          if (proxyAgent) { h.agent = proxyAgent; }

          const newArgs = [fullUrl, b[1], h];
          const d = Reflect.construct(a, newArgs, c);

          d.addEventListener('open', function () {
            connected = true;
          });

          d.addEventListener('close', function () {
            if (gameSocket === d) { gameSocket = null; }
    
            if (portalTimeout) global.clearTimeout(portalTimeout);

            portalTimeout = global.setTimeout(() => {
                if (!gameSocket && !destroyed) {
                    if (typeof devastate === 'function') { devastate(); } else { process.exit(0); }
                }
                portalTimeout = null;
            }, 5000);
          });

          let closed = false;
          d.addEventListener('message', function (e) { Array.from(new Uint8Array(e.data)); });
          d.send = new Proxy(d.send, { apply: function (f, g, h) { return Reflect.apply(f, g, h); } });
          d.close = new Proxy(d.close, {
            apply: function (f, g, h) {
              if (closed) { return; }
              closed = true;
              Reflect.apply(f, g, h);
            }
          });
          gameSocket = d;
          return d;
        }
      });

      eval(x);
      let ca = oa || {};
      ca.window = global.window;
      ca.destroy = destroy;
      ca.controller = controller;
      ca.trigger = trigger;
      return Object.assign(ca, internalBotInterface);
    };

    let arrasObj = {
      then: (cb) => {
        then(() => cb(arrasObj));
      },
      create: function (o) {
        o.id = o.id !== undefined ? o.id : 0;
        return run(script, o);
      }
    };
    if (options.start) {
      options.start(arrasObj);
    }
    return arrasObj;
  })();

  parentPort.on('message', (message) => {
    if (message.type == 'start') {
      const config = message.config;
      options.token = config.token;
      options.loadFromCache = config.loadFromCache;
      options.cache = config.cache;
      options.arrasCache = config.arrasCache;

      arras.then(function () {
        currentBotInterface = arras.create(config);
      });
    } else if (message.type === 'pause') {
      isPaused = message.paused;
} else if (message.type === 'key_command') {
      const key = message.key;
      if (key === 'KeyX') {
        target.forceFollowPlayer = !target.forceFollowPlayer;
      }
      if (key === 'KeyP') {
        target.triggerUpgrade = true;
        return; 
      }
      if (key === 'KeyH') {
        if (currentBotInterface.getLevel) {
            currentBotInterface.log(`Current Level: ${currentBotInterface.getLevel()}`);
        }
        return; 
      }
      // ============================
      if (currentBotInterface.simulateKey) {
        currentBotInterface.simulateKey(key);
      }
    } else if (message.type == 'position') {
      target.x = message.x;
      target.y = message.y;
      target.mouseX = message.mouseX;
      target.mouseY = message.mouseY;
      target.mouseDown = message.mouseDown;
      target.rMouseDown = message.rMouseDown;
      // Accept the explicit field from the updated server while keeping
      // compatibility with the original "mouse" field.
      target.followMouse = message.followMouse !== undefined
        ? message.followMouse
        : message.mouse;
      target.feed = message.feeding;
      target.shift = message.shift;
      target.autofire = message.autofire;
      target.autospin = message.autospin;
      target.override = message.override;
      target.manualMode = message.manualMode;
      target.manualX = message.manualX;
      target.manualY = message.manualY;
      target.shieldOffset = message.shieldOffset;
    } else if (message.type == 'tankselect') {
      target.tank = message.tank;
    } else if (message.type == 'chat') {
      target.chatSpam = message.spam ? message.message : "";
      if (message.message && !message.spam) {
        if (currentBotInterface && currentBotInterface.isInGame && currentBotInterface.isInGame() && currentBotInterface.controller && currentBotInterface.controller.chat) {
          currentBotInterface.controller.chat(message.message);
        }
      }
    } else if (message.type == 'destroy') {
      devastate();
      process.exit();
    }
  });
})();