import {Artist, Album, Track} from 'neon-extension-framework/models/item/music';


describe('Track', () => {
    describe('create', () => {
        it('instance', () => {
            let track = Track.create('alpha', {
                id: '3',
                revision: '#1',

                keys: {
                    id: 3
                },

                title: 'Feel Good Inc',
                duration: 225400,
                number: 6,

                createdAt: 1000,
                updatedAt: 2000
            });

            // Item
            expect(track.id).toBe('3');
            expect(track.revision).toBe('#1');

            expect(track.keys['alpha']).toEqual({ id: 3 });

            expect(track.title).toBe('Feel Good Inc');
            expect(track.duration).toBe(225400);
            expect(track.number).toBe(6);

            expect(track.createdAt).toBe(1000);
            expect(track.updatedAt).toBe(2000);

            // Metadata
            expect(track.resolve('alpha').id).toBeUndefined();
            expect(track.resolve('alpha').revision).toBeUndefined();

            expect(track.resolve('alpha').keys).toEqual({ id: 3 });

            expect(track.resolve('alpha').title).toBe('Feel Good Inc');
            expect(track.resolve('alpha').duration).toBe(225400);
            expect(track.resolve('alpha').number).toBe(6);

            expect(track.resolve('alpha').createdAt).toBeUndefined();
            expect(track.resolve('alpha').updatedAt).toBe(2000);
        })

        it('with children', () => {
            let artist = Artist.create('alpha', {
                title: 'Gorillaz'
            });

            let album = Album.create('alpha', {
                title: 'Demon Days',

                artist
            });

            let track = Track.create('alpha', {
                title: 'Feel Good Inc',

                artist,
                album
            });

            expect(track.title).toBe('Feel Good Inc');

            expect(track.album.title).toBe('Demon Days');
            expect(track.album.artist.title).toBe('Gorillaz');

            expect(track.artist.title).toBe('Gorillaz');
        });

        it('with metadata', () => {
            let artist = Artist.create('alpha', {
                title: 'Gorillaz'
            });

            let album = Album.create('alpha', {
                title: 'Demon Days',

                artist
            });

            let track = Track.create('alpha', {
                title: 'Feel Good Inc',

                genres: [
                    'alternative rock',
                    'funk rock'
                ],

                artist,
                album
            });

            // Item
            expect(track.title).toBe('Feel Good Inc');
            expect(track.genres).toBeUndefined();

            expect(track.album.title).toBe('Demon Days');
            expect(track.album.artist.title).toBe('Gorillaz');

            expect(track.artist.title).toBe('Gorillaz');

            // Metadata
            expect(track.resolve('alpha').get('genres')).toEqual([
                'alternative rock',
                'funk rock'
            ]);
        });
    });

    describe('decode', () => {
        describe('document', () => {
            it('basic', () => {
                let track = Track.fromDocument({
                    _id: '3',
                    _rev: '#1',

                    title: 'Feel Good Inc'
                });

                expect(track.id).toBe('3');
                expect(track.revision).toBe('#1');

                expect(track.title).toBe('Feel Good Inc');
                expect(track.resolve('alpha').title).toBe('Feel Good Inc');
            });

            it('with children', () => {

            });
        });

        describe('plain object', () => {
            it('basic', () => {
                let track = Track.fromPlainObject({
                    id: '3',
                    revision: '#1',

                    title: 'Feel Good Inc'
                });

                expect(track.id).toBe('3');
                expect(track.revision).toBe('#1');

                expect(track.title).toBe('Feel Good Inc');
                expect(track.resolve('alpha').title).toBe('Feel Good Inc');
            });

            it('with children', () => {

            });
        });
    });

    describe('encode', () => {
        let artist = Artist.create('alpha', {
            id: '1',
            title: 'Gorillaz'
        });

        let album = Album.create('alpha', {
            id: '2',
            title: 'Demon Days',

            artist
        });

        describe('document', () => {
            it('basic', () => {
                let track = Track.create('alpha', {
                    id: '3',
                    title: 'Feel Good Inc',

                    genres: ['alternative rock', 'funk rock'],

                    createdAt: 1000,
                    updatedAt: 2000,

                    artist,
                    album
                });

                expect(track.toDocument()).toEqual({
                    _id: '3',
                    title: 'Feel Good Inc',

                    createdAt: 1000,
                    updatedAt: 2000,

                    metadata: {
                        alpha: {
                            genres: ['alternative rock', 'funk rock'],
                        }
                    },

                    artist: {
                        _id: '1',
                        title: 'Gorillaz'
                    },

                    album: {
                        _id: '2',
                        title: 'Demon Days',

                        artist: {
                            _id: '1',
                            title: 'Gorillaz'
                        },
                    }
                });
            });

            it('with children', () => {

            });
        });

        describe('plain object', () => {
            it('basic', () => {
                let track = Track.create('alpha', {
                    title: 'Feel Good Inc'
                });

                expect(track.toPlainObject()).toEqual({
                    title: 'Feel Good Inc'
                });
            });

            it('with children', () => {

            });
        });
    });

    describe('inherit', () => {
        let base = new Track({
            id: '3',
            revision: '#1',

            title: 'Feel Good Inc',
            duration: 225400,
            number: 6,

            createdAt: 1000,
            updatedAt: 2000
        }, {
            alpha: {
                title: 'Feel Good Inc',
                duration: 225400,
                number: 6
            }
        });

        describe('duration', () => {
            it('can be reduced', () => {
                let track = Track.create('alpha', {
                    keys: {
                        id: 3
                    },

                    duration: 223000
                });

                expect(track.inherit(base)).toBe(true);

                // Item
                expect(track.keys['alpha']).toEqual({ id: 3 });
                expect(track.duration).toBe(223000);

                // Metadata
                expect(track.resolve('alpha').keys).toEqual({ id: 3 });
                expect(track.resolve('alpha').duration).toBe(223000);
            });

            it('can\'t be increased', () => {
                let track = Track.create('alpha', {
                    keys: {
                        id: 3
                    },

                    duration: 227000
                });

                expect(track.inherit(base)).toBe(true);

                // Item
                expect(track.keys['alpha']).toEqual({ id: 3 });
                expect(track.duration).toBe(225400);

                // Metadata
                expect(track.resolve('alpha').keys).toEqual({ id: 3 });
                expect(track.resolve('alpha').duration).toBe(225400);
            });
        });

        describe('number', () => {
            it('can\'t be updated', () => {
                let track = Track.create('alpha', {
                    keys: {
                        id: 3
                    },

                    number: 5
                });

                expect(track.inherit(base)).toBe(true);

                // Item
                expect(track.keys['alpha']).toEqual({ id: 3 });
                expect(track.number).toBe(6);

                // Metadata
                expect(track.resolve('alpha').keys).toEqual({ id: 3 });
                expect(track.resolve('alpha').number).toBe(6);
            });
        });

        describe('title', () => {
            it('can\'t be updated', () => {
                let track = Track.create('alpha', {
                    keys: {
                        id: 3
                    },

                    title: 'feel good inc'
                });

                expect(track.inherit(base)).toBe(true);

                // Item
                expect(track.keys['alpha']).toEqual({ id: 3 });
                expect(track.title).toBe('Feel Good Inc');

                // Metadata
                expect(track.resolve('alpha').keys).toEqual({ id: 3 });
                expect(track.resolve('alpha').title).toBe('Feel Good Inc');
            });
        });
    });
});
