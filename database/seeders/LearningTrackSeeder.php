<?php

namespace Database\Seeders;

use App\Models\LearningTrack;
use Illuminate\Database\Seeder;

class LearningTrackSeeder extends Seeder
{
    public function run(): void
    {
        $tracks = [
            [
                'slug' => 'beginner',
                'name' => 'First Scales',
                'description' => 'Master the essential scales every guitarist needs. Start with pentatonics, build up to full 7-note scales, and learn your first two modes.',
                'difficulty' => 'beginner',
                'color' => 'emerald',
                'sort_order' => 1,
                'scales' => [
                    ['scale_id' => 'major-pentatonic', 'suggested_root' => 'C', 'tip' => 'The happiest 5-note scale. Great for melodies.'],
                    ['scale_id' => 'minor-pentatonic', 'suggested_root' => 'A', 'tip' => 'The most-used guitar scale in rock and blues.'],
                    ['scale_id' => 'major', 'suggested_root' => 'C', 'tip' => 'The foundation. All other scales relate to this.'],
                    ['scale_id' => 'natural-minor', 'suggested_root' => 'A', 'tip' => 'The relative minor of C major. Same notes, different feel.'],
                    ['scale_id' => 'blues', 'suggested_root' => 'A', 'tip' => 'Minor pentatonic plus the "blue note." Pure soul.'],
                    ['scale_id' => 'major-blues', 'suggested_root' => 'C', 'tip' => 'Major pentatonic with a chromatic twist.'],
                    ['scale_id' => 'dorian', 'suggested_root' => 'D', 'tip' => 'Minor mode with a bright 6th. The funk scale.'],
                    ['scale_id' => 'mixolydian', 'suggested_root' => 'G', 'tip' => 'Major with a flat 7th. Classic rock and country.'],
                ],
            ],
            [
                'slug' => 'intermediate',
                'name' => 'Modes & Harmony',
                'description' => 'Explore all seven modes, harmonic minor variations, and exotic pentatonics. These scales unlock more sophisticated musical expression.',
                'difficulty' => 'intermediate',
                'color' => 'amber',
                'sort_order' => 2,
                'scales' => [
                    ['scale_id' => 'harmonic-minor', 'suggested_root' => 'A', 'tip' => 'Raised 7th creates tension. Neoclassical essential.'],
                    ['scale_id' => 'melodic-minor', 'suggested_root' => 'A', 'tip' => 'Jazzy minor. Raised 6th and 7th going up.'],
                    ['scale_id' => 'phrygian', 'suggested_root' => 'E', 'tip' => 'Spanish/metal flavor from the flat 2nd.'],
                    ['scale_id' => 'lydian', 'suggested_root' => 'F', 'tip' => 'Dreamy, floating #4. The "movie soundtrack" mode.'],
                    ['scale_id' => 'locrian', 'suggested_root' => 'B', 'tip' => 'The darkest mode. Diminished 5th = maximum tension.'],
                    ['scale_id' => 'phrygian-dominant', 'suggested_root' => 'E', 'tip' => 'Flamenco meets metal. Flat 2 with major 3rd.'],
                    ['scale_id' => 'harmonic-major', 'suggested_root' => 'C', 'tip' => 'Major with a flat 6th. Bittersweet surprise.'],
                    ['scale_id' => 'dorian-sharp4', 'suggested_root' => 'D', 'tip' => 'Dorian plus a raised 4th. Angular and interesting.'],
                    ['scale_id' => 'hirajoshi', 'suggested_root' => 'E', 'tip' => 'Japanese pentatonic. Hauntingly beautiful intervals.'],
                    ['scale_id' => 'whole-tone', 'suggested_root' => 'C', 'tip' => 'All whole steps. Dreamlike, Debussy-esque.'],
                ],
            ],
            [
                'slug' => 'advanced',
                'name' => 'Jazz, Exotic & Beyond',
                'description' => 'Bebop, altered dominants, diminished patterns, and scales from across the globe. For players ready to push beyond conventional harmony.',
                'difficulty' => 'advanced',
                'color' => 'violet',
                'sort_order' => 3,
                'scales' => [
                    ['scale_id' => 'bebop-dominant', 'suggested_root' => 'C', 'tip' => 'Chromatic passing tone keeps lines smooth over changes.'],
                    ['scale_id' => 'bebop-major', 'suggested_root' => 'C', 'tip' => 'Major scale with an extra #5 passing tone.'],
                    ['scale_id' => 'bebop-minor', 'suggested_root' => 'D', 'tip' => 'Dorian with chromatic major 3rd. Smooth jazz lines.'],
                    ['scale_id' => 'lydian-dominant', 'suggested_root' => 'F', 'tip' => 'Lydian + flat 7. Works over #11 chords.'],
                    ['scale_id' => 'altered', 'suggested_root' => 'G', 'tip' => 'Every extension altered. Maximum dominant tension.'],
                    ['scale_id' => 'lydian-augmented', 'suggested_root' => 'C', 'tip' => 'Bright, wide. #4 and #5 together.'],
                    ['scale_id' => 'diminished-hw', 'suggested_root' => 'C', 'tip' => 'Half-whole symmetry. 8 notes, 4-fold symmetry.'],
                    ['scale_id' => 'half-whole-diminished', 'suggested_root' => 'G', 'tip' => 'Jazz dominant diminished sound.'],
                    ['scale_id' => 'hungarian-minor', 'suggested_root' => 'A', 'tip' => 'Two augmented 2nds. Neoclassical metal staple.'],
                    ['scale_id' => 'double-harmonic-major', 'suggested_root' => 'D', 'tip' => 'Byzantine scale. Intensely exotic.'],
                    ['scale_id' => 'persian', 'suggested_root' => 'C', 'tip' => 'Mysterious, ornate. Diminished 5th with major 7th.'],
                    ['scale_id' => 'enigmatic', 'suggested_root' => 'C', 'tip' => "Verdi's experiment. Rising chromatic tension."],
                ],
            ],
        ];

        foreach ($tracks as $trackData) {
            $scales = $trackData['scales'];
            unset($trackData['scales']);

            $track = LearningTrack::create($trackData);

            foreach ($scales as $index => $scale) {
                $track->scales()->create([
                    ...$scale,
                    'sort_order' => $index + 1,
                ]);
            }
        }
    }
}
