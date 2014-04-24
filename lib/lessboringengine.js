var ECS = {};
var GAME = {
    prefabs: {}
};

ECS.AssetManager = Class.extend({
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

        console.log('in loader');
        window.soundManager.setup({
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
            if (this.keys[keyName] === 'hit') {
                this.keys[keyName] = 'held';
            }
        }
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
    init: function(entity) {
        this.entity = entity;
        this.prev = null;
        this.next = null;
    }
});

ECS.EntityList = Class.extend({
    init: function() {
        this.head = null;
        this.tail = null;
        this.length = 0;
        this._entities = {};
    },

    add: function(entity) {
        var newNode = new ECS.ListNode(entity);

        if (this.head === null) {
            this.head = this.tail = newNode;
        }
        else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }

        this.length++;
        this._entities[entity.uniqueID] = newNode;
    },

    remove: function(entity) {
        if (!this.has(entity)) {
            return;
        }
        var toRemove = this._entities[entity.uniqueID];

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
        delete this._entities[entity.uniqueID];
    },

    has: function(entity) {
        return entity.uniqueID in this._entities;
    },

    clear: function() {
        this.head = this.tail = null;
        this.length = 0;
        this._entities = {};
    },

    iterate: function(callback) {
        for (var current = this.head; current !== null; current = current.next) {
            callback(current.entity);
        }
    }
});

ECS.Entity = Class.extend({
    init: function() {
        this.uniqueID = ECS.genUUID();
        this.components = {};

        this.componentAdded = new signals.Signal();
        this.componentRemoved = new signals.Signal();
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
    _.map(components, entity.addComponent, entity);
    return entity;
};

ECS.Component = Class.extend({
    name: ''
});

ECS.Family = Class.extend({
    init: function(componentNames) {
        this._entities = new ECS.EntityList();
        this._componentNames = _.clone(componentNames);
    },

    iterate: function(callback) {
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
        this.engine = null;
    },
    componentAdded: function(entity, componentName) {},
    componentRemoved: function(entity, componentName) {},
    pause: function() {},
    restart: function() {},
    update: function(dt) {}
});

ECS.Engine = Class.extend({
    init: function() {
        this._entities = new ECS.EntityList();
        this._systemPriorityLevels = [];
        this._families = {};
        this._entitiesToRemove = [];
    },

    addEntity: function(entity) {
        this._entities.add(entity);
        this.addEntityToFamiliesIfMatches(entity);
        entity.componentAdded.add(this._componentAdded, this);
        entity.componentRemoved.add(this._componentRemoved, this);
        for (var componentName in entity.components) {
            this._componentAdded(entity, componentName);
        }
        return this;
    },

    removeEntity: function(entity) {

        // Do all removing of entities after all systems are updated so we can
        // remove things in loops, among other cool things.
        this._entitiesToRemove.push(entity);
    },

    addSystem: function(system, priority) {
        system.engine = this;
        if (this._systemPriorityLevels[priority] === undefined) {
            this._systemPriorityLevels[priority] = [];
        }
        this._systemPriorityLevels[priority].push(system);
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
            family.removeEntity(entity);
        }
    },

    update: function(dt) {
        this.iterateSystems(function(system) {
            system.update(dt);
        });
        this._removeEntitiesMarkedForRemoval();
    },

    iterateSystems: function(callback) {
        for (var priority=0; priority<this._systemPriorityLevels.length; priority++) {
            var priorityLevel = this._systemPriorityLevels[priority];
            if (priorityLevel !== undefined) {
                for (var i=0; i<priorityLevel.length; i++) {
                    var system = priorityLevel[i];
                    callback(system);
                }
            }
        }
    },

    pause: function() {
        this.iterateSystems(function(system) {
            system.pause();
        }.bind(this));
    },

    restart: function() {
        this.iterateSystems(function(system) {
            system.restart();
        }.bind(this));
    },

    clear: function() {
        this.iterateSystems(function(system) {
            system.destroy();
        }.bind(this));
        this._removeEntitiesNow(this._entities);
    },

    removeEntities: function(entityList) {
        entityList.iterate(function(entity) {
            this.removeEntity(entity);
        }.bind(this));
    },

    _removeEntitiesMarkedForRemoval: function() {
        this._removeEntitiesNow(this._entitiesToRemove);
        this._entitiesToRemove = [];
    },

    _removeEntitiesNow: function(entities) {
        _.forEach(entities, function(entity) {
            for (var componentName in entity.components) {
                this._componentRemoved(entity, componentName);
            }
            this._entities.remove(entity);
            this.removeEntityFromFamilies(entity);
            entity.componentAdded.remove(this._componentAdded);
            entity.componentRemoved.remove(this._componentRemoved);
        }.bind(this));
    },

    _componentAdded: function(entity, componentName) {
        this.addEntityToFamiliesIfMatches(entity);
        this.iterateSystems(function(system) {
            system.componentAdded(entity, componentName);
        });
    },

    _componentRemoved: function(entity, componentName) {
        this.removeEntityFromFamilies(entity);
        this.iterateSystems(function(system) {
            system.componentRemoved(entity, componentName);
        });
    }
});

ECS.GameState = Class.extend({
    init: function(game) {
        this.created = false;
        this.game = game;
        this.engine = new ECS.Engine();
    },

    create: function() {
    },

    restart: function() {
    },

    pause: function() {
    },

    destroy: function() {
    }
});

ECS.Game = Class.extend({
    states: [],

    init: function(config) {
        if (config.startingState === undefined) {
            throw new Error('No starting state specified!');
        }
        if (config.selector === undefined) {
            throw new Error('No selector specified!');
        }

        this.assets = new ECS.AssetManager();
        this.input = new ECS.Input();
        this.sound = window.soundManager;
        this.preload = config.preload;
        this.selector = config.selector;
        this.prefabs = config.prefabs;
        this.prefabs.assets = this.assets;

        console.log('Starting asset load');
        if ('preload' in config) {
            this.preload();
        }

        var that = this;
        this.assets.start(function() {
            console.log('loaded assets');
            that.pushState(config.startingState);
            var update = function (dt) {
                requestAnimationFrame(update);
                that.input.update();
                that.currentState.engine.update(dt);
            };
            requestAnimationFrame(update);
        });
    },

    pushState: function(state) {
        var previousState = this.states[this.states.length-1];
        if (previousState) {
            previousState.pause();
            previousState.engine.pause();
        }
        state.game = this;
        state.assets = this.assets;
        state.input = this.input;
        state.sound = this.sound;
        state.selector = this.selector;
        state.prefabs = this.prefabs;
        this.states.push(state);
        if (!state.created) {
            state.create();
            state.created = true;
        }
        else {
            state.restart();
            state.engine.restart();
        }
        this.currentState = state;
    },

    popStateAndPause: function() {
        var previousState = this.states.pop();
        if (previousState) {
            previousState.engine.pause();
            previousState.pause();
        }
        var nextState = this.states[this.states.length-1];
        if (nextState) {
            nextState.restart();
            nextState.engine.restart();
        }
        this.currentState = nextState;
        return previousState;
    },

    popStateAndDestroy: function() {
        var previousState = this.states.pop();
        if (previousState) {
            previousState.engine.destroy();
            previousState.destroy();
        }
        var nextState = this.states[this.states.length-1];
        if (nextState) {
            nextState.restart();
            nextState.engine.restart();
        }
        this.currentState = nextState;
        return previousState;
    }
});

ECS.assetManager = new ECS.AssetManager();
