<?php

/**
 * Genre definitions mirroring frontend/src/data/genres.ts.
 * Used by AchievementService for server-side genre completion checks.
 */
return [
    'midwest-emo' => [
        'name' => 'Midwest Emo',
        'scaleIds' => ['major', 'natural-minor', 'major-pentatonic', 'minor-pentatonic', 'dorian', 'lydian', 'mixolydian', 'kumoi'],
    ],
    'metal' => [
        'name' => 'Metal',
        'scaleIds' => ['natural-minor', 'harmonic-minor', 'phrygian', 'phrygian-dominant', 'locrian', 'diminished-hw', 'chromatic', 'hungarian-minor', 'double-harmonic-major', 'persian', 'iwato'],
    ],
    'blues' => [
        'name' => 'Blues',
        'scaleIds' => ['blues', 'minor-pentatonic', 'major-pentatonic', 'major-blues', 'mixolydian', 'dorian', 'bebop-minor'],
    ],
    'jazz' => [
        'name' => 'Jazz',
        'scaleIds' => ['major', 'dorian', 'mixolydian', 'lydian', 'melodic-minor', 'bebop-dominant', 'altered', 'lydian-dominant', 'whole-tone', 'diminished-hw', 'half-whole-diminished', 'bebop-major', 'bebop-minor', 'locrian-natural2', 'lydian-augmented', 'dorian-b2', 'augmented'],
    ],
    'country-folk' => [
        'name' => 'Country / Folk',
        'scaleIds' => ['major', 'major-pentatonic', 'minor-pentatonic', 'mixolydian', 'blues', 'dorian', 'harmonic-major'],
    ],
    'rock' => [
        'name' => 'Rock / Classic Rock',
        'scaleIds' => ['minor-pentatonic', 'blues', 'mixolydian', 'major-pentatonic'],
    ],
    'funk-rnb' => [
        'name' => 'Funk / R&B / Soul',
        'scaleIds' => ['dorian', 'minor-pentatonic', 'mixolydian', 'bebop-dominant'],
    ],
    'classical' => [
        'name' => 'Classical',
        'scaleIds' => ['major', 'harmonic-minor', 'melodic-minor', 'neapolitan-major'],
    ],
    'flamenco-latin' => [
        'name' => 'Flamenco / Latin',
        'scaleIds' => ['phrygian', 'phrygian-dominant', 'flamenco', 'double-harmonic-major'],
    ],
    'prog-math' => [
        'name' => 'Progressive / Math Rock',
        'scaleIds' => ['lydian', 'whole-tone', 'hirajoshi', 'lydian-augmented'],
    ],
    'indie-alt' => [
        'name' => 'Indie / Alternative',
        'scaleIds' => ['major', 'dorian', 'major-pentatonic', 'harmonic-major'],
    ],
    'gospel-neosoul' => [
        'name' => 'Gospel / Neo-Soul',
        'scaleIds' => ['major', 'dorian', 'bebop-dominant', 'melodic-minor'],
    ],
];
