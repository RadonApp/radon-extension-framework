import Artist from 'neon-extension-framework/models/item/music/artist';


describe('Artist', () => {
    describe('create', () => {
        it('instance', () => {
            let artist = Artist.create('alpha', {
                id: '1',
                revision: '#1',

                keys: {
                    id: 1
                },

                title: 'Gorillaz',

                createdAt: 1000,
                updatedAt: 2000
            });

            // Item
            expect(artist.id).toBe('1');
            expect(artist.revision).toBe('#1');

            expect(artist.keys['alpha']).toEqual({ id: 1 });

            expect(artist.title).toBe('Gorillaz');
            expect(artist.createdAt).toBe(1000);
            expect(artist.updatedAt).toBe(2000);

            // Metadata
            expect(artist.resolve('alpha').id).toBeUndefined();
            expect(artist.resolve('alpha').revision).toBeUndefined();

            expect(artist.resolve('alpha').keys).toEqual({ id: 1 });

            expect(artist.resolve('alpha').title).toBe('Gorillaz');
            expect(artist.resolve('alpha').createdAt).toBeUndefined();
            expect(artist.resolve('alpha').updatedAt).toBe(2000);
        })
    });

    describe('inherit', () => {
        let base = Artist.create('alpha', {
            id: '1',
            revision: '#1',

            title: 'Gorillaz',

            createdAt: 1000,
            updatedAt: 2000
        });

        describe('title', () => {
            it('can\'t be updated', () => {
                let artist = Artist.create('alpha', {
                    keys: {
                        id: 1
                    },

                    title: 'gorillaz',
                });

                expect(artist.inherit(base)).toBe(true);

                // Item
                expect(artist.keys['alpha']).toEqual({id: 1});
                expect(artist.title).toBe('Gorillaz');

                // Metadata
                expect(artist.resolve('alpha').keys).toEqual({id: 1});
                expect(artist.resolve('alpha').title).toBe('Gorillaz');
            });
        });

        describe('updatedAt', () => {
            it('changes can be applied', () => {
                let artist = Artist.create('alpha', {
                    keys: {
                        id: 1
                    },

                    updatedAt: 2001
                });

                expect(artist.inherit(base)).toBe(true);

                // Item
                expect(artist.keys['alpha']).toEqual({id: 1});
                expect(artist.title).toBe('Gorillaz');

                expect(artist.updatedAt).toBe(2001);

                // Metadata
                expect(artist.resolve('alpha').keys).toEqual({id: 1});
                expect(artist.resolve('alpha').title).toBe('Gorillaz');

                expect(artist.resolve('alpha').updatedAt).toBe(2001);
            });

            it('changes are deferred', () => {
                let artist = Artist.create('alpha', {
                    title: 'gorillaz',

                    updatedAt: 2001
                });

                expect(artist.inherit(base)).toBe(false);

                // Item
                expect(artist.title).toBe('Gorillaz');

                expect(artist.updatedAt).toBe(2000);

                // Metadata
                expect(artist.resolve('alpha').updatedAt).toBe(2000);
            });
        });
    });

    describe('createSelectors', function() {
        it('with identifier', function() {
            let selectors = Artist.create('test', {
                id: '1',
                title: 'Gorillaz'
            }).createSelectors();

            // Check selector count
            expect(selectors.length).toBe(1);

            // Identifier Selector
            expect(selectors[0]).toEqual({
                '_id': '1'
            });
        });

        it('with keys', function() {
            let selectors = Artist.create('test', {
                keys: {
                    id: '1'
                },

                title: 'Gorillaz'
            }).createSelectors();

            // Check selector count
            expect(selectors.length).toBe(2);

            // Key Selector
            expect(selectors[0]).toEqual({
                'type': 'music/artist',
                'keys.test.id': '1'
            });

            // Slug Selector
            expect(selectors[1]).toEqual({
                'type': 'music/artist',
                'keys.item.slug': 'gorillaz'
            });
        });
    });
});
