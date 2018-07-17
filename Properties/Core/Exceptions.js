export class PropertyConflictError extends Error {
    constructor(message, options) {
        super(message);

        // Parse options
        options = options || {};

        this.property = options.property || null;
    }
}
