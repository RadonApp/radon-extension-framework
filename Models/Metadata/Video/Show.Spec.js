import Show from './Show';


describe('Show', () => {
    describe('inherit', () => {
        let base = Show.create('alpha', {
            id: '1',
            revision: '#1',

            keys: {
                id: 1
            },

            title: 'Arrested Development',
            year: 2003,

            createdAt: 1000,
            updatedAt: 2000
        });

        describe('keys', () => {
            it('should support alternatives', () => {
                let show = Show.create('beta', {
                    keys: {
                        id: 2
                    }
                });

                expect(show.inherit(base)).toBe(true);

                expect(show.keys['alpha'].id).toBe(1);
                expect(show.keys['beta'].id).toBe(2);

                expect(show.resolve('alpha').keys.id).toBe(1);
                expect(show.resolve('beta').keys.id).toBe(2);
            });

            it('should throw an error on conflicts', () => {
                let show = Show.create('alpha', {
                    keys: {
                        id: 2
                    }
                });

                expect(() =>
                    show.inherit(base)
                ).toThrow(new Error(
                    'Show.keys["alpha"].id: 2 doesn\'t match 1'
                ));
            });
        });

        describe('title', () => {
            it('should support alternatives', () => {
                let show = Show.create('beta', {
                    title: 'Unbreakable Kimmy Schmidt'
                });

                expect(show.inherit(base)).toBe(true);

                expect(show.title).toBe('Arrested Development');

                expect(show.resolve('alpha').title).toBe('Arrested Development');
                expect(show.resolve('beta').title).toBe('Unbreakable Kimmy Schmidt');
            });
        });

        describe('year', () => {
            it('should support alternatives', () => {
                let show = Show.create('beta', {
                    year: 2004
                });

                expect(show.inherit(base)).toBe(true);

                expect(show.year).toBe(2003);

                expect(show.resolve('alpha').year).toBe(2003);
                expect(show.resolve('beta').year).toBe(2004);
            });
        });
    });
});
