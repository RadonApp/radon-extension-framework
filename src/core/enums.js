export var ContentTypes = {
    Video: 'video',
    Music: 'music',
};

export var MediaTypes = {
    Video: {
        Movie: ContentTypes.Video + ':movie',
        Show: ContentTypes.Video + ':show',
        Season: ContentTypes.Video + ':season',
        Episode: ContentTypes.Video + ':episode',
    },
    Music: {
        Artist: ContentTypes.Music + ':artist',
        Album: ContentTypes.Music + ':album',
        Track: ContentTypes.Music + ':track'
    }
};
