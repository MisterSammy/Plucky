import { GENRES } from '@/data/genres';

export interface AwardDefinition {
    key: string;
    category: 'genre_exploration' | 'genre_completion' | 'milestone';
    title: string;
    description: string;
    tier?: string;
    genreId?: string;
}

export const TIER_THRESHOLDS: Record<string, number> = {
    bronze: 1,
    silver: 5,
    gold: 10,
    diamond: 100,
};

export const TIER_COLORS: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    diamond: '#b9f2ff',
};

export const TIER_ORDER = ['bronze', 'silver', 'gold', 'diamond'] as const;

// Build all award definitions
function buildAwards(): AwardDefinition[] {
    const awards: AwardDefinition[] = [];

    // Genre Exploration (13 awards)
    for (const genre of GENRES) {
        awards.push({
            key: `explore:${genre.id}`,
            category: 'genre_exploration',
            title: `Explore ${genre.name}`,
            description: `Complete any 1 scale from ${genre.name}`,
            genreId: genre.id,
        });
    }

    // Genre Completion Tiers (13 x 4 = 52 awards)
    for (const genre of GENRES) {
        for (const tier of TIER_ORDER) {
            awards.push({
                key: `genre:${genre.id}:${tier}`,
                category: 'genre_completion',
                title: `${genre.name} ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
                description: `Complete each of ${genre.name}'s ${genre.scaleIds.length} scales ${TIER_THRESHOLDS[tier]}x`,
                tier,
                genreId: genre.id,
            });
        }
    }

    // Practice Milestones (9 awards)
    const milestones: { key: string; title: string; description: string }[] = [
        { key: 'milestone:sessions:10', title: '10 Sessions', description: 'Complete 10 practice sessions' },
        { key: 'milestone:sessions:50', title: '50 Sessions', description: 'Complete 50 practice sessions' },
        { key: 'milestone:sessions:100', title: '100 Sessions', description: 'Complete 100 practice sessions' },
        { key: 'milestone:sessions:500', title: '500 Sessions', description: 'Complete 500 practice sessions' },
        { key: 'milestone:scales:10', title: '10 Scales', description: 'Practice 10 unique scales' },
        { key: 'milestone:scales:25', title: '25 Scales', description: 'Practice 25 unique scales' },
        { key: 'milestone:scales:52', title: 'All 52 Scales', description: 'Practice every scale in the library' },
        { key: 'milestone:streak:7', title: '7-Day Streak', description: 'Practice 7 days in a row' },
        { key: 'milestone:streak:30', title: '30-Day Streak', description: 'Practice 30 days in a row' },
    ];

    for (const m of milestones) {
        awards.push({
            key: m.key,
            category: 'milestone',
            title: m.title,
            description: m.description,
        });
    }

    return awards;
}

export const ALL_AWARDS = buildAwards();

export const GENRE_EXPLORATION_AWARDS = ALL_AWARDS.filter(a => a.category === 'genre_exploration');
export const GENRE_COMPLETION_AWARDS = ALL_AWARDS.filter(a => a.category === 'genre_completion');
export const MILESTONE_AWARDS = ALL_AWARDS.filter(a => a.category === 'milestone');
