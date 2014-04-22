var ECS = {};
var GAME = {};

ECS.AssetManager = Class.extend({
    init: function() {
        this.assetsFolder = 'assets/';
        this.imagesPrefix = 'images/';
        this.audiosPrefix = 'audio/';
        this.imagesToLoad = [];
        this.soundEffectsToLoad = [];
        this.bgmsToLoad = [];
        this.assets = {};
        this.remaining = 0;
    },

    loadImage: function(url) {
        return this.imagesToLoad.push(url);
    },

    loadSoundEffect: function(url) {
        return this.soundEffectsToLoad.push(url);
    },

    loadBGM: function(url) {
        return this.bgmsToLoad.push(url);
    },

    start: function(callback) {
        this.soundManager.setup({
            url: 'vendor/soundmanager2.swf',
            flashVersion: 9,
            waitForWindowLoad: true,
            useHighPerformance: true,
            onready: function() {
                var that = this;
                var onLoadCallback = function() {
                    that.remaining--;
                    if (that.remaining === 0) {
                        return callback();
                    }
                };
                _.forEach(this.imagesToLoad, function(imageUrl) {
                    var image = new Image();
                    image.src = this.assetsFolder + this.imagesPrefix + imageUrl;
                    this.remaining++;
                    image.onload = onLoadCallback;
                    this.assets[imageUrl] = image;
                });

                _.forEach(this.bgmsToLoad, function(bgmUrl) {
                    this.remaining++;
                    window.soundManager.createSound({
                        volume: 100,
                        autoLoad: true,
                        loops: 10000,
                        id: bgmUrl,
                        url: this.assetsFolder + this.audiosPrefix + bgmUrl,
                        onload: onLoadCallback
                    });
                });

                _.forEach(this.soundEffectsToLoad, function(soundEffectUrl) {
                    this.remaining++;
                    window.soundManager.createSound({
                        volume: 100,
                        autoLoad: true,
                        multiShot: true,
                        id: soundEffectUrl,
                        url: this.assetsFolder + this.audiosPrefix + soundEffectUrl,
                        onload: onLoadCallback
                    });
                });

                if (Object.keys(this.assets).length === 0) {
                    return callback();
                }
            }
        });
    }
});

ECS.Input = Class.extend({
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

        this.keys = {};
        this.keyCodeToName = [];
        // Initialize the keys hash using the keycodes
        for (var keyName in this.keyNameToCode) {
            var keyCode = this.keyNameToCode[keyName];
            this.keyCodeToName[keyCode] = keyName;
            this.keys[keyName] = false;
        }
        window.addEventListener('keydown', this.keyDown.bind(this), false);
        window.addEventListener('keyup', this.keyUp.bind(this), false);
        this.eventQueue = [];
    },

    keyDown: function(event) {
        this.eventQueue.push({ kind: 'keyDown', value: event.keyCode });
    },

    keyUp: function(event) {
        this.eventQueue.push({ kind: 'keyUp', value: event.keyCode });
    },

    update: function() {
        for (var keyName in this.keys) {
            if (this.keys[keyName] == 'hit') {
                this.keys[keyName] = 'held';
            }
        }
        for (var i=0; i<this.eventQueue.length; i++) {
            var event = this.eventQueue[i];
            if (event.kind === 'keyUp') {
                this.keys[this.keyCodeToName[event.value]] = false;
            }
            if (event.kind === 'keyDown') {
                this.keys[this.keyCodeToName[event.value]] = 'hit';
            }
        }
        this.eventQueue = [];
    }
});

ECS.genUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);
    });
};

ECS.ListNode = Class.extend({
    init: function(element) {
        this.element = element;
        this.prev = null;
        this.next = null;
    }
});

ECS.OrderedHash = Class.extend({
    init: function() {
        this.head = null;
        this.tail = null;
        this.length = 0;
        this._elements = {};
    },

    add: function(element) {
        var newNode = new ListNode(element);

        if (this.head === null) {
            this.head = this.tail = element;
        }
        else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }

        this.length++;
        this._elements[element.hash] = element;
    },

    remove: function(element) {
        if (!this.has(element)) {
            return;
        }
        var toRemove = this._elements[element.hash];

        if (toRemove.prev  === null) {
            this.head = toRemove.next;
        }
        else {
            toRemove.prev.next = toRemove.next;
        }
        if (toRemove.next === null) {
            this.tail = toRemove.prev;
        }
        else {
            toRemove.next.prev = toRemove.prev;
        }

        this.length--;
        delete this._elements[element.hash];
    },

    has: function(element) {
        return element.hash in this._elements;
    },

    clear: function() {
        this.head = this.tail = null;
        this.length = 0;
        this._elements = {};
    },

    iterate: function(callback) {
        for (var current = this.head; current !== this.tail; current = current.next) {
            callback(current.element);
        }
    }
});

ECS.Entity = Class.extend({
    init: function() {
        this.uniqueID = ECS.genUUID();
        this.components = {};

        this.componentAdded = new Signal();
        this.componentRemoved = new Signal();
    },

    addComponent: function(component) {
        if (component.name === '') {
            throw new Error('This component does not have a name set.');
        }
        if (component.name in this.components) {
            throw new Error('This component is already attached to this entity!');
        }
        this.components[component.name] = component;
        this.componentAdded.dispatch(component.name);
        return this;
    },

    hasComponent: function(componentName) {
        return componentName in this.components;
    },

    removeComponent: function(componentName) {
        if (this.hasComponent(componentName)) {
            delete this.components[componentName];
            this.componentRemoved.dispatch(this, componentName);
        }
        else {
            throw new Error('This component is not a part of this entity!');
        }
    }
});

ECS.Entity.createWithComponents = function(/* components */) {
    var components = Array.prototype.slice.call(arguments);
    var entity = new ECS.Entity();
    _.map(components, entity.addComponent);
    return entity;
};

ECS.Component = Class.extend({
    name: ''
});

ECS.Family = Class.extend({
    init: function(componentNames) {
        this._entities = new ECS.OrderedHash();
        this._componentNames = _.clone(componentNames);
    },

    iterateEntities: function(callback) {
        this._entities.iterate(callback);
    },

    addEntityIfMatches: function(entity) {
        var hasAll = true;
        if (this._entities.has(entity)) {
            return;
        }
        _.forEach(this._componentNames, function(componentName) {
            if (!entity.hasComponent(componentName)) {
                hasAll = false;
                return false;
            }
        });

        if (hasAll) {
            this._entities.add(entity);
        }
    },

    removeEntity: function(entity) {
        this._entities.remove(entity);
    }
});

ECS.System = Class.extend({
    init: function() {
        this.world = null;
    },

    update: function(dt) {
        throw new Error('System update method not defined.');
    }
});

ECS.World = Class.extend({
    init: function() {
        this._entities = new ECS.OrderedHash();
        this._systemPriorityLevels = [];
        this._families = {};
    },

    addEntity: function(entity) {
        this._entities.add(entity);
        this.addEntityToFamiliesIfMatches(entity);
        entity.componentAdded.add(this._componentAdded, this);
        entity.componentRemoved.add(this._componentRemoved, this);
        return this;
    },

    removeEntity: function(entity) {
        this._entities.remove(entity);
        this.removeEntityFromFamilies(entity);
        entity.componentAdded.remove(this._componentAdded);
        entity.componentRemoved.remove(this._componentRemoved);
    },

    addSystem: function(system, priority) {
        system.world = this;
        if (this.systems[priority] === undefined) {
            this.systems[priority] = [];
        }
        this.systems[priority].push(system);
        return this;
    },

    removeSystem: function(system) {
        _.forEach(this._systems, function(systems, priority) {
            _.remove(systems, system);
        });
    },

    getEntities: function(/* componentNames */) {
        var componentNames = Array.prototype.slice.call(arguments);
        var familyKey = componentNames.join(',');
        // Check out this glorious family caching action
        if (!(familyKey in this._families)) {
            var newFamily = new ECS.Family(componentNames);
            this._families[familyKey] = newFamily;
            this._entities.iterate(function(entity) {
                newFamily.addEntityIfMatches(entity);
            });
        }
        return this._families[familyKey];
    },

    addEntityToFamiliesIfMatches: function(entity) {
        for (var familyKey in this._families) {
            var family = this._families[familyKey];
            family.addEntityIfMatches(entity);
        }
    },

    removeEntityFromFamilies: function(entity) {
        for (var familyKey in this._families) {
            var family = this._families[familyKey];
            family.remove(entity);
        }
    },

    update: function(dt) {
        for (var priority=0; priority<this.systems.length; priority++) {
            var priorityList = this.systems[priority];
            if (priorityList !== undefined) {
                for (var i=0; i<priorityList.length; i++) {
                    var system = priorityList[i];
                    system.update(dt);
                }
            }
        }
    },

    _componentAdded: function(entity, componentName) {
        this.addEntityToFamiliesIfMatches(entity);
    },

    _componentRemoved: function(entity, componentName) {
        this.removeEntityFromFamilies(entity);
    }
});

ECS.assetManager = new ECS.AssetManager();
