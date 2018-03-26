import {Artist, Album} from 'neon-extension-framework/models/item/music';


describe('Album', () => {
    let artist = Artist.create('test', {
        keys: {
            id: '1'
        },

        title: 'Gorillaz'
    });

    describe('construct', function() {
        it('instance', function() {
            let item = new Album();

            // Ensure title is null
            expect(item.title).toBe(null);

            // Ensure artist is null
            expect(item.artist).toBe(null);
        });

        it('with values', function() {
            let item = new Album({
                title: 'Humanz'
            });

            // Ensure title is defined
            expect(item.title).toBe('Humanz');
            expect(item.resolve('test').title).toBe('Humanz');

            // Ensure artist is null
            expect(item.artist).toBe(null);
        });

        it('with children', function() {
            let item = new Album({
                title: 'Humanz',
                artist
            });

            // Ensure title is defined
            expect(item.title).toBe('Humanz');
            expect(item.resolve('test').title).toBe('Humanz');

            // Ensure artist title is defined
            expect(item.artist.title).toBe('Gorillaz');
            expect(item.artist.values.title).toBe('Gorillaz');
            expect(item.artist.resolve('test').title).toBe('Gorillaz');
        });
    });

    describe('create', function() {
        it('instance', function() {
            let item = Album.create('test');

            // Ensure title is null
            expect(item.title).toBe(null);

            // Ensure artist is null
            expect(item.artist).toBe(null);
        });

        it('with values', function() {
            let item = Album.create('test', {
                title: 'Humanz'
            });

            // Ensure title is defined
            expect(item.title).toBe('Humanz');
            expect(item.resolve('test').title).toBe('Humanz');

            // Ensure artist is null
            expect(item.artist).toBe(null);
        });

        it('with children', function() {
            let item = Album.create('test', {
                title: 'Humanz',
                artist
            });

            // Ensure title is defined
            expect(item.title).toBe('Humanz');
            expect(item.resolve('test').title).toBe('Humanz');

            // Ensure artist title is defined
            expect(item.artist.title).toBe('Gorillaz');
            expect(item.artist.values.title).toBe('Gorillaz');
            expect(item.artist.resolve('test').title).toBe('Gorillaz');
        });

        it('validates the "source" parameter', function() {
            expect(function() {
                Album.create(5)
            }).toThrow(
                new Error('Invalid value provided for the "source" parameter (expected string)')
            );
        });
    });

    describe('createSelectors', function() {
        it('with identifier', function() {
            let selectors = Album.create('test', {
                id: '2',
                title: 'Humanz',
                artist
            }).createSelectors();

            expect(selectors.length).toBe(1);

            expect(selectors[0]).toEqual({
                '_id': '2'
            });
        });

        it('with artist identifier', function() {
            let selectors = Album.create('test', {
                keys: {
                    id: '2'
                },

                title: 'Humanz',

                // Artist
                artist: new Artist({
                    id: '1',
                    title: 'Gorillaz'
                })
            }).createSelectors();

            expect(selectors.length).toBe(2);

            expect(selectors[0]).toEqual({
                'type': 'music/album',
                'keys.test.id': '2'
            });

            expect(selectors[1]).toEqual({
                'type': 'music/album',
                'keys.item.slug': 'humanz',

                'artist._id': '1'
            });
        });

        it('with keys', function() {
            let selectors = Album.create('test', {
                keys: {
                    id: '2'
                },

                title: 'Humanz',
                artist
            }).createSelectors();

            expect(selectors.length).toBe(3);

            expect(selectors[0]).toEqual({
                'type': 'music/album',
                'keys.test.id': '2'
            });

            expect(selectors[1]).toEqual({
                'type': 'music/album',
                'keys.item.slug': 'humanz',

                'artist.keys.test.id': '1'
            });

            expect(selectors[2]).toEqual({
                'type': 'music/album',
                'keys.item.slug': 'humanz',

                'artist.keys.item.slug': 'gorillaz'
            });
        });
    });

    describe('matches', function() {
        let base = Album.create('alpha', {
            id: '2',
            revision: '#1',

            keys: {
                id: 2
            },

            title: 'Demon Days',

            // Artist
            artist: Artist.create('alpha', {
                id: '1',
                revision: '#1',

                keys: {
                    id: 1
                },

                title: 'Gorillaz'
            })
        });

        it('matches identifier', function() {
            let album = Album.create('alpha', {
                id: '2'
            });

            expect(base.matches(album)).toBe(true);
        });

        it('matches slug', function() {
            let album = Album.create('alpha', {
                title: 'Demon Days',

                // Artist
                artist: Artist.create('alpha', {
                    title: 'Gorillaz'
                })
            });

            expect(base.matches(album)).toBe(true);
        });

        it('matches key', function() {
            let album = Album.create('alpha', {
                keys: {
                    id: 2
                },

                // Artist
                artist: Artist.create('alpha', {
                    keys: {
                        id: 1
                    }
                })
            });

            expect(base.matches(album)).toBe(true);
        });
    });
});
