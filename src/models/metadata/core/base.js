export class Metadata {
    constructor(source, id, title) {
        this.source = source || null;
        this.id = id || null;
        this.title = title || null;
    }
}

export class Media extends Metadata {
    constructor(source, id, title, duration) {
        super(source, id, title);

        this.duration = duration || null;
    }
}
