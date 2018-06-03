import DefaultTo from 'lodash-es/defaultTo';
import Debounce from 'lodash-es/debounce';
import EventEmitter from 'eventemitter3';
import ForEach from 'lodash-es/forEach';
import IsFunction from 'lodash-es/isFunction';
import IsNil from 'lodash-es/isNil';

import Log from '../Core/Logger';


class Event {
    constructor(event, record, node) {
        this.event = event;

        this.record = record;
        this.node = node;
    }
}

class NodeObserver extends EventEmitter {
    constructor(options) {
        super();

        this.attributes = new EventEmitter();

        // Parse options
        this.options = {
            attributes: [],
            text: false,

            ...(options || {})
        };

        this.parent = DefaultTo(options.parent, null);
        this.path = DefaultTo(options.path, null);
        this.root = DefaultTo(options.root, null);

        this.children = DefaultTo(options.children, []);

        this.head = DefaultTo(options.head, false);
        this.tail = DefaultTo(options.tail, false);

        this._initialNodes = DefaultTo(options.nodes, []);

        // Public Attributes
        this.observer = null;
        this.started = false;
        this.nodes = [];

        // Reset observer
        this.reset();

        // Retrieve selector
        this.selector = !IsNil(this.path) ?
            this.path.substring(this.path.lastIndexOf(' ') + 1) :
            null;

        // Create debounced reset function
        this.resetDebounced = Debounce(this.reset.bind(this), 250, {
            maxWait: 500
        });

        // Bind to parent events
        if(!IsNil(this.parent)) {
            this.parent.on('child.added', this._parentChildAdded.bind(this));
            this.parent.on('child.removed', this._parentChildRemoved.bind(this));
        }
    }

    start() {
        if(this.started) {
            return this;
        }

        Log.trace('[%s] Start', this.path);

        // Update state
        this.started = true;

        // Ensure parent has started observing
        if(!IsNil(this.parent)) {
            this.parent.start();
        }

        // Add initial nodes
        ForEach(this._initialNodes, (node) =>
            this.add(node)
        );

        // Process parent nodes (if parent exists)
        if(!IsNil(this.parent)) {
            ForEach(this.parent.nodes, (node) => {
                this._parentChildAdded(node);
            });
        }

        return this;
    }

    reset() {
        let previous = this.observer;

        // Create mutation observer
        let observer = new MutationObserver(this._onMutations.bind(this));

        ForEach(this.nodes, (node) => {
            this.observe(node, observer);
        });

        // Set current observer
        this.observer = observer;

        // Disconnect previous observer from nodes
        if(!IsNil(previous)) {
            previous.disconnect();
        }
    }

    matches(node) {
        if(IsNil(node) || !(node instanceof Element)) {
            return false;
        }

        if(!IsFunction(node.matches)) {
            throw new Error('Element.matches(selector) is not supported');
        }

        return node.matches(this.selector);
    }

    observe(node, observer = null) {
        observer = observer || this.observer;

        // Build mutations object
        let mutations = { childList: true };

        if(this.options.text) {
            mutations.characterData = true;
            mutations.subtree = true;
        }

        if(this.options.attributes && this.options.attributes.length > 0) {
            mutations.attributeFilter = this.options.attributes;
        }

        // Observe node
        this._observe(observer, node, mutations);

        // Observe document loaded
        if(node === document) {
            document.addEventListener('DOMContentLoaded', this._onDocumentLoaded.bind(this));
        }
    }

    unobserve(node) {
        // Un-observe node
        this._unobserve(node);
    }

    add(node) {
        if(this.nodes.indexOf(node) >= 0) {
            Log.debug('[%s] Duplicate node addition for:', this.path, node);
            return;
        }

        Log.trace('[%s] Add:', this.path, node);

        // Observe node
        this.observe(node);

        // Add child nodes
        ForEach(node.childNodes, (node) => {
            this.emit('child.added', node);
        });

        // Emit events
        this.emit('added', new Event('added', this, node));
        this.emit('mutation', new Event('mutation', this, node));
    }

    remove(node) {
        if(this.nodes.indexOf(node) < 0) {
            Log.debug('[%s] Duplicate node removal for:', this.path, node);
            return;
        }

        Log.trace('[%s] Remove:', this.path, node);

        // Observe node
        this.unobserve(node);

        // Remove child nodes
        ForEach(node.childNodes, (node) => {
            this.emit('child.removed', node);
        });

        // Emit events
        this.emit('removed', new Event('removed', this, node));
        this.emit('mutation', new Event('mutation', this, node));
    }

    all(selector = null) {
        if(IsNil(selector)) {
            selector = this.selector;
        }

        let result = [];

        for(let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i];

            if(node instanceof Element && node.matches(selector)) {
                result.push(node);
            }
        }

        return result;
    }

    children(selector) {
        if(IsNil(selector)) {
            throw new Error('Missing required "selector" parameter');
        }

        let result = [];

        for(let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i];

            result.push(...Array.from(node.querySelectorAll(selector)));
        }

        return result;
    }

    first(selector = null) {
        if(IsNil(selector)) {
            selector = this.selector;
        }

        for(let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i];

            if(node instanceof Element && node.matches(selector)) {
                return node;
            }
        }

        return null;
    }

    onAttributeChanged(type, callback) {
        this.attributes.on(type, callback);

        return this;
    }

    // region Event Handlers

    _onDocumentLoaded() {
        Log.trace('[%s] Document Loaded', this.path);

        // Emit current nodes
        ForEach(document.childNodes, (node) => {
            this.emit('child.added', node);
        });
    }

    _onMutations(mutations) {
        // Process mutations
        ForEach(mutations, (mutation) => {
            // Emit "mutation" event
            this.emit('mutation', new Event('mutation', this, mutation.target));

            // Process mutation
            if(mutation.type === 'attributes') {
                this._onAttributes(mutation);
            } else if(mutation.type === 'characterData') {
                this._onCharacterData(mutation);
            } else if(mutation.type === 'childList') {
                this._onChildList(mutation);
            } else {
                Log.warn('[%s] Unknown mutation: %o', this.path, mutation);
            }
        });
    }

    _onAttributes(mutation) {
        // Emit "changed" event
        this.attributes.emit(mutation.attributeName, new Event('changed', this, mutation.target));
    }

    _onCharacterData(mutation) {
        // Emit "changed" event
        this.emit('changed', new Event('changed', this, mutation.target));
    }

    _onChildList(mutation) {
        // Process added nodes
        ForEach(mutation.addedNodes, (node) => {
            this.emit('child.added', node);
        });

        // Process removed nodes
        ForEach(mutation.removedNodes, (node) => {
            this.emit('child.removed', node);
        });
    }

    _parentChildAdded(node) {
        if(IsNil(node) || !(node instanceof Element)) {
            return;
        }

        // Find matching nodes
        let nodes;

        if(!this.matches(node)) {
            nodes = Array.from(node.querySelectorAll(this.selector));
        } else {
            nodes = [node];
        }

        // Add nodes
        ForEach(nodes, (node) => {
            this.add(node);
        });
    }

    _parentChildRemoved(node) {
        if(IsNil(node) || !(node instanceof Element)) {
            return;
        }

        // Find matching nodes
        let nodes;

        if(!this.matches(node)) {
            nodes = Array.from(node.querySelectorAll(this.selector));
        } else {
            nodes = [node];
        }

        // Remove nodes
        ForEach(nodes, (node) => {
            this.remove(node);
        });
    }

    // endregion

    // region Private Methods

    _observe(observer, node, mutations) {
        if(this.nodes.indexOf(node) >= 0) {
            return;
        }

        // Add node to array
        this.nodes.push(node);

        // Observe node
        observer.observe(node, mutations);
    }

    _unobserve(node) {
        let index = this.nodes.indexOf(node);

        if(index < 0) {
            return;
        }

        // Remove node from array
        this.nodes.splice(index, 1);

        // Reset mutation observer
        this.resetDebounced();
    }

    // endregion
}

export default class DocumentObserver {
    static observe(root, selector, options) {
        options = {
            start: true,

            ...(options || {})
        };

        // Ensure `root` is a node observer
        if(!(root instanceof NodeObserver)) {
            root = new NodeObserver({
                nodes: [root],
                tail: true
            });
        }

        // Create element records
        let current = root;

        let selectors = selector.split(' ');
        let path = [];

        ForEach(selectors, (selector, i) => {
            // Add `selector` to `path`
            path.push(selector);

            // Create element record
            let record;

            if(i < selectors.length - 1) {
                record = new NodeObserver({
                    parent: current,
                    path: path.join(' '),
                    root
                });
            } else {
                record = new NodeObserver({
                    ...(options || {}),

                    parent: current,
                    path: path.join(' '),
                    root,

                    head: true
                });
            }

            current.children.push(record);
            current = record;
        });

        if(options.start) {
            return current.start();
        }

        return current;
    }
}
