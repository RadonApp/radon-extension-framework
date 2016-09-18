export class Metadata {
    constructor(source, id, title) {
        this.source = source || null;
        this.id = id || null;
        this.title = title || null;
    }

    dump() {
        return {
            source: this.source ? this.source.dump() : null,

            id: this.id,
            title: this.title
        };
    }
}

export class Media extends Metadata {
    constructor(source, id, title, duration) {
        super(source, id, title);

        this.duration = duration || null;
    }

    dump() {
        var result = super.dump();
        result.duration = this.duration;

        return result;
    }
}
