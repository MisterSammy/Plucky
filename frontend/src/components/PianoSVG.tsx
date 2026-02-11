import { memo, useMemo } from 'react';
import { DEGREE_COLORS } from '@/lib/music';
import {
    WHITE_KEY_WIDTH,
    BLACK_KEY_WIDTH,
    WHITE_KEY_HEIGHT,
    BLACK_KEY_HEIGHT,
    PIANO_TOP_PADDING,
    pianoKeyX,
    countWhiteKeys,
} from '@/lib/piano';
import type { PianoKeyPosition, NoteWithOctave } from '@/types';

interface PianoSVGProps {
    positions: PianoKeyPosition[];
    allKeys: { midi: number; note: string; noteWithOctave: string; isBlackKey: boolean }[];
    onNoteClick: (position: PianoKeyPosition) => void;
    activeNoteIndex?: number | null;
    highlightRoot?: boolean;
    showAllNotes?: boolean;
    detectedNoteWithOctave?: NoteWithOctave | null;
    hitDegrees?: Set<number>;
    startOctave: number;
    endOctave: number;
}

export default memo(function PianoSVG({
    positions,
    allKeys,
    onNoteClick,
    activeNoteIndex,
    highlightRoot = true,
    showAllNotes = false,
    detectedNoteWithOctave,
    hitDegrees,
    startOctave,
    endOctave,
}: PianoSVGProps) {
    const numWhiteKeys = countWhiteKeys(startOctave, endOctave);
    const width = numWhiteKeys * WHITE_KEY_WIDTH;
    const height = WHITE_KEY_HEIGHT + PIANO_TOP_PADDING + 30;
    const startMidi = allKeys.length > 0 ? allKeys[0].midi : 0;

    const positionByMidi = useMemo(() => {
        const map = new Map<number, PianoKeyPosition>();
        for (const pos of positions) {
            map.set(pos.midi, pos);
        }
        return map;
    }, [positions]);

    const whiteKeys = allKeys.filter(k => !k.isBlackKey);
    const blackKeys = allKeys.filter(k => k.isBlackKey);

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto"
            role="img"
            aria-label="Piano keyboard with scale notes highlighted"
        >
            {/* White keys */}
            {whiteKeys.map((key) => {
                const x = pianoKeyX(key.midi, startMidi);
                const pos = positionByMidi.get(key.midi);
                const isActive = pos && activeNoteIndex !== null && activeNoteIndex !== undefined && pos.degree === activeNoteIndex + 1;
                const isDetected = detectedNoteWithOctave === key.noteWithOctave && pos;
                const isHit = pos && (hitDegrees?.has(pos.degree) ?? false);

                return (
                    <g
                        key={`white-${key.midi}`}
                        onClick={() => pos && onNoteClick(pos)}
                        style={{ cursor: pos ? 'pointer' : 'default' }}
                    >
                        <rect
                            x={x}
                            y={PIANO_TOP_PADDING}
                            width={WHITE_KEY_WIDTH - 1}
                            height={WHITE_KEY_HEIGHT}
                            fill={isActive ? '#e0e0e0' : '#ffffff'}
                            stroke="#333"
                            strokeWidth={1}
                            rx={2}
                        />
                        {/* Scale note indicator */}
                        {pos && (
                            <>
                                {isHit && (
                                    <circle
                                        cx={x + WHITE_KEY_WIDTH / 2 - 0.5}
                                        cy={PIANO_TOP_PADDING + WHITE_KEY_HEIGHT - 28}
                                        r={17}
                                        fill="none"
                                        stroke="#22C55E"
                                        strokeWidth={2.5}
                                        opacity={0.85}
                                    />
                                )}
                                {isDetected && (
                                    <circle
                                        cx={x + WHITE_KEY_WIDTH / 2 - 0.5}
                                        cy={PIANO_TOP_PADDING + WHITE_KEY_HEIGHT - 28}
                                        r={19}
                                        fill="none"
                                        stroke="#22C55E"
                                        strokeWidth={3}
                                        opacity={0.8}
                                    >
                                        <animate attributeName="r" values="16;22;16" dur="1s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                                    </circle>
                                )}
                                {isActive && (
                                    <circle
                                        cx={x + WHITE_KEY_WIDTH / 2 - 0.5}
                                        cy={PIANO_TOP_PADDING + WHITE_KEY_HEIGHT - 28}
                                        r={18}
                                        fill="none"
                                        stroke={DEGREE_COLORS[(pos.degree - 1) % DEGREE_COLORS.length]}
                                        strokeWidth={2}
                                        opacity={0.6}
                                        className="animate-ping"
                                    />
                                )}
                                <circle
                                    cx={x + WHITE_KEY_WIDTH / 2 - 0.5}
                                    cy={PIANO_TOP_PADDING + WHITE_KEY_HEIGHT - 28}
                                    r={pos.isRoot && highlightRoot ? 14 : 12}
                                    fill={DEGREE_COLORS[(pos.degree - 1) % DEGREE_COLORS.length]}
                                    opacity={0.9}
                                    stroke={pos.isRoot && highlightRoot ? '#fff' : 'none'}
                                    strokeWidth={pos.isRoot && highlightRoot ? 2 : 0}
                                />
                                <text
                                    x={x + WHITE_KEY_WIDTH / 2 - 0.5}
                                    y={PIANO_TOP_PADDING + WHITE_KEY_HEIGHT - 24}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize={9}
                                    fontWeight={pos.isRoot ? 'bold' : 'normal'}
                                    fontFamily="system-ui"
                                    pointerEvents="none"
                                >
                                    {pos.note}
                                </text>
                            </>
                        )}
                        {/* Show note name on all white keys when showAllNotes is on */}
                        {showAllNotes && !pos && (
                            <text
                                x={x + WHITE_KEY_WIDTH / 2 - 0.5}
                                y={PIANO_TOP_PADDING + WHITE_KEY_HEIGHT - 8}
                                textAnchor="middle"
                                fill="#9CA3AF"
                                fontSize={8}
                                fontFamily="system-ui"
                                opacity={0.5}
                            >
                                {key.note}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Black keys (rendered on top) */}
            {blackKeys.map((key) => {
                const x = pianoKeyX(key.midi, startMidi);
                const pos = positionByMidi.get(key.midi);
                const isActive = pos && activeNoteIndex !== null && activeNoteIndex !== undefined && pos.degree === activeNoteIndex + 1;
                const isDetected = detectedNoteWithOctave === key.noteWithOctave && pos;
                const isHit = pos && (hitDegrees?.has(pos.degree) ?? false);

                return (
                    <g
                        key={`black-${key.midi}`}
                        onClick={() => pos && onNoteClick(pos)}
                        style={{ cursor: pos ? 'pointer' : 'default' }}
                    >
                        <rect
                            x={x}
                            y={PIANO_TOP_PADDING}
                            width={BLACK_KEY_WIDTH}
                            height={BLACK_KEY_HEIGHT}
                            fill={isActive ? '#555' : '#1a1a1a'}
                            stroke="#000"
                            strokeWidth={1}
                            rx={2}
                        />
                        {/* Scale note indicator */}
                        {pos && (
                            <>
                                {isHit && (
                                    <circle
                                        cx={x + BLACK_KEY_WIDTH / 2}
                                        cy={PIANO_TOP_PADDING + BLACK_KEY_HEIGHT - 20}
                                        r={14}
                                        fill="none"
                                        stroke="#22C55E"
                                        strokeWidth={2.5}
                                        opacity={0.85}
                                    />
                                )}
                                {isDetected && (
                                    <circle
                                        cx={x + BLACK_KEY_WIDTH / 2}
                                        cy={PIANO_TOP_PADDING + BLACK_KEY_HEIGHT - 20}
                                        r={16}
                                        fill="none"
                                        stroke="#22C55E"
                                        strokeWidth={3}
                                        opacity={0.8}
                                    >
                                        <animate attributeName="r" values="12;18;12" dur="1s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                                    </circle>
                                )}
                                {isActive && (
                                    <circle
                                        cx={x + BLACK_KEY_WIDTH / 2}
                                        cy={PIANO_TOP_PADDING + BLACK_KEY_HEIGHT - 20}
                                        r={15}
                                        fill="none"
                                        stroke={DEGREE_COLORS[(pos.degree - 1) % DEGREE_COLORS.length]}
                                        strokeWidth={2}
                                        opacity={0.6}
                                        className="animate-ping"
                                    />
                                )}
                                <circle
                                    cx={x + BLACK_KEY_WIDTH / 2}
                                    cy={PIANO_TOP_PADDING + BLACK_KEY_HEIGHT - 20}
                                    r={pos.isRoot && highlightRoot ? 11 : 9}
                                    fill={DEGREE_COLORS[(pos.degree - 1) % DEGREE_COLORS.length]}
                                    opacity={0.9}
                                    stroke={pos.isRoot && highlightRoot ? '#fff' : 'none'}
                                    strokeWidth={pos.isRoot && highlightRoot ? 2 : 0}
                                />
                                <text
                                    x={x + BLACK_KEY_WIDTH / 2}
                                    y={PIANO_TOP_PADDING + BLACK_KEY_HEIGHT - 16.5}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize={7}
                                    fontWeight={pos.isRoot ? 'bold' : 'normal'}
                                    fontFamily="system-ui"
                                    pointerEvents="none"
                                >
                                    {pos.note}
                                </text>
                            </>
                        )}
                    </g>
                );
            })}

            {/* Octave labels below the keyboard */}
            {Array.from({ length: endOctave - startOctave + 1 }, (_, i) => {
                const octave = startOctave + i;
                // Find the C key in this octave to position the label
                const cKey = allKeys.find(k => k.note === 'C' && k.noteWithOctave === `C${octave}`);
                if (!cKey) return null;
                const x = pianoKeyX(cKey.midi, startMidi);
                return (
                    <text
                        key={`octave-${octave}`}
                        x={x + WHITE_KEY_WIDTH / 2 - 0.5}
                        y={PIANO_TOP_PADDING + WHITE_KEY_HEIGHT + 16}
                        textAnchor="middle"
                        fill="#6B7280"
                        fontSize={10}
                        fontFamily="system-ui"
                    >
                        C{octave}
                    </text>
                );
            })}
        </svg>
    );
})
