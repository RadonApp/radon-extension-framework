import {createArtistTitle, matchItemByTitle, matchTitle, resolveArtists, resolveTitle} from './Metadata';


describe('Utilities', () => {
    describe('Metadata', () => {
        describe('createArtistTitle', () => {
            it('should join multiple values', () => {
                expect(createArtistTitle(['Danger'])).toBe('Danger');
                expect(createArtistTitle(['Danger', 'Vyle'])).toBe('Danger & Vyle');

                expect(createArtistTitle([
                    'Lil Wayne',
                    'X Ambassadors',
                    'Ty Dolla $ign',
                    'Logic'
                ])).toBe(
                    'Lil Wayne, X Ambassadors, Ty Dolla $ign & Logic'
                );
            });

            it('should handle nil values', () => {
                expect(createArtistTitle()).toBe(null);
                expect(createArtistTitle(null)).toBe(null);
            });

            it('should handle string values', () => {
                expect(createArtistTitle('Danger')).toBe('Danger');
            });
        });

        describe('matchItemByTitle', () => {
            it('should match exact title', () => {
                expect(matchItemByTitle([
                    { title: 'Sucker For Pain' }
                ], 'Sucker For Pain')).toEqual({
                    title: 'Sucker For Pain'
                });
            });

            it('should match with brackets', () => {
                expect(matchItemByTitle([
                    { title: 'Power And The Passion' }
                ], 'Power And The Passion (Remastered Version)')).toEqual({
                    title: 'Power And The Passion'
                });
            });
        });

        describe('matchTitle', () => {
            it('should match exact', () => {
                expect(matchTitle('Sucker For Pain', 'Sucker For Pain')).toBeTruthy();
            });

            it('should match case-insensitive', () => {
                expect(matchTitle('Sucker for Pain', 'Sucker For Pain')).toBeTruthy();
                expect(matchTitle('Sucker For Pain', 'Sucker for Pain')).toBeTruthy();
            });

            it('should match ampersand', () => {
                expect(matchTitle('Power And The Passion', 'Power & The Passion')).toBeTruthy();
                expect(matchTitle('Power & The Passion', 'Power And The Passion')).toBeTruthy();
            });

            it('should match credits', () => {
                expect(matchTitle(
                    'Sucker For Pain (with Logic, Ty Dolla $ign & X Ambassadors)',
                    'Sucker For Pain (feat. X Ambassadors, Ty Dolla $ign & Logic)')
                ).toBeTruthy();

                expect(matchTitle(
                    'Sucker For Pain (feat. X Ambassadors, Ty Dolla $ign & Logic)',
                    'Sucker For Pain (with Logic, Ty Dolla $ign & X Ambassadors)')
                ).toBeTruthy();
            });

            it('should match with artist', () => {
                expect(matchTitle(
                    'Bastille - World Gone Mad (from Bright: The Album) [Official Music Video]',
                    'World Gone Mad'
                )).toBeTruthy();

                expect(matchTitle(
                    'World Gone Mad',
                    'Bastille - World Gone Mad (from Bright: The Album) [Official Music Video]'
                )).toBeTruthy();
            });

            it('should match with featured suffix', () => {
                expect(matchTitle(
                    'Coming Home ft Maverick Sabre in the Live Lounge',
                    'Coming Home'
                )).toBeTruthy();

                expect(matchTitle(
                    'Coming Home',
                    'Coming Home ft Maverick Sabre in the Live Lounge'
                )).toBeTruthy();
            });

            it('should match with artist and featured suffix', () => {
                expect(matchTitle(
                    'Gorgon City - Coming Home ft Maverick Sabre in the Live Lounge',
                    'Coming Home'
                )).toBeTruthy();

                expect(matchTitle(
                    'Coming Home',
                    'Gorgon City - Coming Home ft Maverick Sabre in the Live Lounge'
                )).toBeTruthy();
            });

            it('should match with brackets', () => {
                expect(matchTitle(
                    'Power And The Passion (Remastered Version)',
                    'Power And The Passion'
                )).toBeTruthy();

                expect(matchTitle(
                    'Power And The Passion',
                    'Power And The Passion (Remastered Version)'
                )).toBeTruthy();
            });
        });

        describe('resolveArtists', () => {
            it('should remove credited artists', () => {
                expect(resolveArtists((
                    'Sucker For Pain (with Logic, Ty Dolla $ign & X Ambassadors) ' +
                    '(feat. X Ambassadors, Ty Dolla $ign & Logic)'
                ), [
                    { id: 1, title: 'Lil Wayne' },
                    { id: 2, title: 'X Ambassadors' },
                    { id: 3, title: 'Ty Dolla $ign' },
                    { id: 4, title: 'Logic' }
                ])).toEqual([
                    { id: 1, title: 'Lil Wayne' }
                ]);
            });

            it('should remove similar artists', () => {
                expect(resolveArtists('Broken People', [
                    { id: 1, title: 'Rag\'n\'Bone Man & Logic' },
                    { id: 2, title: 'Logic' }
                ])).toEqual([
                    { id: 1, title: 'Rag\'n\'Bone Man & Logic' }
                ]);
            });
        });

        describe('resolveTitle', () => {
            it('should resolve title', () => {
                expect(resolveTitle('Sucker For Pain')).toEqual([
                    'sucker for pain'
                ]);
            });

            it('should resolve title with credits', () => {
                expect(resolveTitle(
                    'Sucker For Pain (with Logic, Ty Dolla $ign & X Ambassadors)'
                )).toEqual([
                    'sucker for pain with logic ty dolla ign and x ambassadors',
                    'sucker for pain'
                ]);

                expect(resolveTitle(
                    'Sucker For Pain (feat. X Ambassadors, Ty Dolla $ign & Logic)'
                )).toEqual([
                    'sucker for pain feat x ambassadors ty dolla ign and logic',
                    'sucker for pain'
                ]);
            });

            it('should resolve title with tags', () => {
                expect(resolveTitle(
                    'Sucker For Pain [Explicit] (with Logic, Ty Dolla $ign & X Ambassadors)'
                )).toEqual([
                    'sucker for pain explicit with logic ty dolla ign and x ambassadors',
                    'sucker for pain explicit',
                    'sucker for pain'
                ]);
            });

            it('should resolve title with artist', () => {
                expect(resolveTitle(
                    'Bastille - World Gone Mad (from Bright: The Album) [Official Music Video]'
                )).toEqual([
                    'bastille world gone mad from bright the album official music video',
                    'bastille world gone mad',
                    'world gone mad',
                    'bastille'
                ]);
            });

            it('should resolve title with featured suffix', () => {
                expect(resolveTitle(
                    'Coming Home ft Maverick Sabre in the Live Lounge'
                )).toEqual([
                    'coming home ft maverick sabre in the live lounge',
                    'coming home'
                ]);
            });

            it('should resolve title with artist and featured suffix', () => {
                expect(resolveTitle(
                    'Gorgon City - Coming Home ft Maverick Sabre in the Live Lounge'
                )).toEqual([
                    'gorgon city coming home ft maverick sabre in the live lounge',
                    'gorgon city coming home',
                    'coming home',
                    'gorgon city'
                ]);
            });
        });
    });
});
