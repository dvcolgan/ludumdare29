window.UTIL = {
    AssetManager: Class.extend({
        init: function() {
            this.imagesToLoad = {};
            this.soundEffectsToLoad = {};
            this.bgmsToLoad = {};
            this.assets = {};
            this.remaining = 0;
        },

        cloneTexture: function(assetKey, newAssetKey) {
            var newTexture = this.assets[assetKey].clone();
            this.assets[newAssetKey] = newTexture;
            return newTexture;
        },

        loadImage: function(key, filepath) {
            this.imagesToLoad[key] = filepath;
        },

        loadSoundEffect: function(key, filepath) {
            this.soundEffectsToLoad[key] = filepath;
        },

        loadBGM: function(key, filepath) {
            this.bgmsToLoad[key] = filepath;
        },

        addTexture: function(key, texture) {
            this.assets[key] = texture;
        },

        start: function(callback, context) {
            var that = this;

            this.soundManager = window.soundManager;
            this.soundManager.setup({
                url: 'vendor/soundmanager2.swf',
                flashVersion: 9,
                waitForWindowLoad: true,
                useHighPerformance: true,
                onready: function() {
                    console.log('sound manager loaded');
                    var onLoadCallback = function(data) {
                        console.log('loaded', data);
                        that.remaining--;
                        if (that.remaining === 0) {
                            return callback();
                        }
                    };
                    var key;
                    for (key in that.imagesToLoad) {
                        that.remaining++;
                        that.assets[key] = THREE.ImageUtils.loadTexture(that.imagesToLoad[key], undefined, onLoadCallback);
                    }

                    for (key in that.bgmsToLoad) {
                        that.remaining++;
                        window.soundManager.createSound({
                            volume: 100,
                            autoLoad: true,
                            loops: 10000,
                            id: key,
                            url: that.bgmsToLoad[key]
                        }).load({ onload: onLoadCallback });
                    }

                    for (key in that.soundEffectsToLoad) {
                        that.remaining++;
                        console.log(that.remaining);
                        window.soundManager.createSound({
                            volume: 100,
                            multiShot: true,
                            id: key,
                            url: that.soundEffectsToLoad[key]
                        }).load({ onload: onLoadCallback });
                    }

                    if (Object.keys(that.assets).length === 0) {
                        return callback();
                    }
                }
            });
        }
    }),

    Input: Class.extend({
        init: function() {
            this.keyNameToCode = {
                'backspace': 8,
                'tab': 9,
                'enter': 13,
                'shift': 16,
                'ctrl': 17,
                'alt': 18,
                'pause': 19,
                'capslock': 20,
                'escape': 27,
                'space': 32,
                'pageUp': 33,
                'pageDown': 34,
                'end': 35,
                'home': 36,
                'left': 37,
                'up': 38,
                'right': 39,
                'down': 40,
                'insert': 45,
                'delete': 46,
                '_0': 48,
                '_1': 49,
                '_2': 50,
                '_3': 51,
                '_4': 52,
                '_5': 53,
                '_6': 54,
                '_7': 55,
                '_8': 56,
                '_9': 57,
                'a': 65,
                'b': 66,
                'c': 67,
                'd': 68,
                'e': 69,
                'f': 70,
                'g': 71,
                'h': 72,
                'i': 73,
                'j': 74,
                'k': 75,
                'l': 76,
                'm': 77,
                'n': 78,
                'o': 79,
                'p': 80,
                'q': 81,
                'r': 82,
                's': 83,
                't': 84,
                'u': 85,
                'v': 86,
                'w': 87,
                'x': 88,
                'y': 89,
                'z': 90,
                'leftWindows': 91,
                'rightWindows': 92,
                'select': 93,
                'numpad0': 96,
                'numpad1': 97,
                'numpad2': 98,
                'numpad3': 99,
                'numpad4': 100,
                'numpad5': 101,
                'numpad6': 102,
                'numpad7': 103,
                'numpad8': 104,
                'numpad9': 105,
                'multiply': 106,
                'add': 107,
                'subtract': 109,
                'decimal': 110,
                'divide': 111,
                'f1': 112,
                'f2': 113,
                'f3': 114,
                'f4': 115,
                'f5': 116,
                'f6': 117,
                'f7': 118,
                'f8': 119,
                'f9': 120,
                'f10': 121,
                'f11': 122,
                'f12': 123,
                'numLock': 144,
                'scrollLock': 145,
                'semicolon': 186,
                'equal': 187,
                'comma': 188,
                'dash': 189,
                'period': 190,
                'slash': 191,
                'grave': 192,
                'leftBracket': 219,
                'backslash': 220,
                'rightBracket': 221,
                'quote': 222
            };

            //this.gamepadButtonToCode = {
            //    'a': 0,
            //    'b': 1,
            //    'x': 2,
            //    'y': 3,
            //    'up': 12,
            //    'down': 13,
            //    'left': 14,
            //    'right': 15
            //};

            //this.gamepad = {};
            //this.buttonCodeToName = [];

            this.keys = {};
            this.keyCodeToName = [];

            this.mouse = {};
            this.mouse.movementX = 0;
            this.mouse.movementY = 0;

            // Initialize the keys hash using the keycodes
            for (var keyName in this.keyNameToCode) {
                var keyCode = this.keyNameToCode[keyName];
                this.keyCodeToName[keyCode] = keyName;
                this.keys[keyName] = false;
            }
            //for (var buttonName in this.gamepadButtonToCode) {
            //    var buttonCode = this.gamepadButtonToCode[buttonName];
            //    this.buttonCodeToName[buttonCode] = buttonName;
            //    this.gamepad[buttonName] = false;
            //}
            window.addEventListener('keydown', this.keyDown.bind(this), false);
            window.addEventListener('keyup', this.keyUp.bind(this), false);
            window.addEventListener('mousemove', this.mouseMove.bind(this), false);
            this.eventQueue = [];
        },

        mouseMove: function(event) {
            this.eventQueue.push({
                kind: 'mouseMove',
                movementX: event.movementX || event.mozMovementX || event.webkitMovementX || 0,
                movementY: event.movementY || event.mozMovementY || event.webkitMovementY || 0
            });
        },

        keyDown: function(event) {
            this.eventQueue.push({ kind: 'keyDown', value: event.keyCode });
        },

        keyUp: function(event) {
            this.eventQueue.push({ kind: 'keyUp', value: event.keyCode });
        },

        update: function() {
            for (var keyName in this.keys) {
                if (this.keys[keyName] === 'hit') {
                    this.keys[keyName] = 'held';
                }
            }
            this.mouse.movementX = 0;
            this.mouse.movementY = 0;

            for (var i=0; i<this.eventQueue.length; i++) {
                var event = this.eventQueue[i];
                if (event.kind === 'keyUp') {
                    this.keys[this.keyCodeToName[event.value]] = false;
                }
                if (event.kind === 'keyDown') {
                    var currentValue = this.keys[this.keyCodeToName[event.value]];
                    if (currentValue === false) {
                        this.keys[this.keyCodeToName[event.value]] = 'hit';
                    }
                }
                if (event.kind === 'mouseMove') {
                    this.mouse.movementX += event.movementX;
                    this.mouse.movementY += event.movementY;
                }
            }
            this.eventQueue = [];
        }
    }),

    getPointerLock: function(element) {
        element.requestPointerLock = element.requestPointerLock ||
                                     element.mozRequestPointerLock ||
                                     element.webkitRequestPointerLock;
        element.requestPointerLock();
    },

    exitPointerLock: function() {
        document.exitPointerLock = document.exitPointerLock ||
                                   document.mozExitPointerLock ||
                                   document.webkitExitPointerLock;
        document.exitPointerLock();
    }

};
