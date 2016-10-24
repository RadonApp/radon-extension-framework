export class Metadata {
    constructor(source, id, title, content, media) {
        this.source = source || null;
        this.id = id || null;
        this.title = title || null;

        this.type = {
            content: content || null,
            media: media || null
        };
    }

    dump() {
        return {
            source: this.source ? this.source.dump() : null,

            id: this.id,
            title: this.title,

            type: this.type
        };
    }
}

export class Media extends Metadata {
    constructor(source, id, title, content, media, duration) {
        super(source, id, title, content, media);

        this.duration = duration || null;
    }

    dump() {
        let result = super.dump();

        result.duration = this.duration;

        return result;
    }
}
