import DefaultTo from 'lodash-es/defaultTo';
import Debounce from 'lodash-es/debounce';
import EventEmitter from 'eventemitter3';
import ForEach from 'lodash-es/forEach';
import IsFunction from 'lodash-es/isFunction';
import IsNil from 'lodash-es/isNil';

import Log from '../core/logger';


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

        // Parse options
        options = options || {};

        this.parent = DefaultTo(options.parent, null);
        this.path = DefaultTo(options.path, null);
        this.root = DefaultTo(options.root, null);

        this.children = DefaultTo(options.children, []);

        this.head = DefaultTo(options.head, false);
        this.tail = DefaultTo(options.tail, false);

        this.text = DefaultTo(options.text, false);

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

        // Observe children additions/removals
        this._observe(observer, node, { childList: true }, observer);

        // Observe document loaded
        if(node === document) {
            document.addEventListener('DOMContentLoaded', this._onDocumentLoaded.bind(this));
        }

        // Observe text nodes
        if(this.text) {
            ForEach(Array.from(node.childNodes), (node) => {
                // Observe character changes
                this._observe(observer, node, { characterData: true }, observer);
            });
        }
    }

    unobserve(node) {
        // Observe children additions/removals
        this._unobserve(node);

        // Observe text nodes
        if(this.text) {
            ForEach(Array.from(node.childNodes), (node) => {
                // Observe character changes
                this._unobserve(node);
            });
        }
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
        let event = new Event('added', this, node);

        this.emit('added', event);
        this.emit('mutation', event);
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
        let event = new Event('removed', this, node);

        this.emit('removed', event);
        this.emit('mutation', event);
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
            if(mutation.type === 'characterData') {
                this._onCharacterData(mutation);
            } else if(mutation.type === 'childList') {
                this._onChildList(mutation);
            }
        });
    }

    _onCharacterData(mutation) {
        let event = new Event('changed', this, mutation.target);

        this.emit('changed', event);
        this.emit('mutation', event);
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

        return current.start();
    }
}
