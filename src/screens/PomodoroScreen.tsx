import React, { useEffect, useMemo, useRef, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Animated,
    Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Svg, { Circle } from "react-native-svg"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { colors } from "../theme/colors"

type Mode = "focus" | "short" | "long"

const DURATIONS: Record<Mode, number> = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
}

const SOUNDS = ["Rain", "White Noise", "Cafe", "Forest"]

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const STORAGE_KEY = "pomodoro:stats"

type Stats = {
    date: string
    pomodoros: number
    focusMinutes: number
    streak: number
    lastCompletedDate?: string
}

export default function PomodoroScreen() {
    const [mode, setMode] = useState<Mode>("focus")
    const [seconds, setSeconds] = useState(DURATIONS.focus)
    const [isRunning, setIsRunning] = useState(false)
    const [session, setSession] = useState(1)
    const [activeSound, setActiveSound] = useState<string | null>(null)
    const [stats, setStats] = useState<Stats>(defaultStats())

    const totalSeconds = useMemo(() => DURATIONS[mode], [mode])
    const progress = useRef(new Animated.Value(1)).current

    // Load stats once
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((value) => {
            if (value) {
                try {
                    const parsed: Stats = JSON.parse(value)
                    setStats(normalizeDaily(parsed))
                } catch {
                    setStats(defaultStats())
                }
            }
        })
    }, [])

    // Tick effect
    useEffect(() => {
        if (!isRunning) return

        const id = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    handleComplete()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(id)
    }, [isRunning])

    // Animate progress ring
    useEffect(() => {
        const ratio = seconds / totalSeconds
        Animated.timing(progress, {
            toValue: ratio,
            duration: 250,
            useNativeDriver: false,
        }).start()
    }, [seconds, totalSeconds, progress])

    // Reset timer when mode changes
    useEffect(() => {
        setSeconds(DURATIONS[mode])
        setIsRunning(false)
    }, [mode])

    const handleComplete = (options?: { award?: boolean }) => {
        const award = options?.award ?? true
        const elapsed = Math.max(totalSeconds - seconds, 0)

        setIsRunning(false)
        if (mode === "focus") {
            if (award) {
                updateStatsOnFocusComplete(elapsed)
            }

            setSession((prev) => Math.min(prev + 1, 4))
            setMode("short")
            setSeconds(DURATIONS.short)
        } else {
            setMode("focus")
            setSeconds(DURATIONS.focus)
        }
    }

    const toggleRun = () => setIsRunning((prev) => !prev)

    const reset = () => {
        setSeconds(DURATIONS[mode])
        setIsRunning(false)
    }

    const skip = () => {
        handleComplete({ award: false })
    }

    const formatted = formatTime(seconds)
    const nextBreak =
        mode === "focus"
            ? `${Math.ceil(seconds / 60)} min`
            : `${Math.ceil(DURATIONS.focus / 60)} min`

    const size = 260
    const strokeWidth = 16
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    const strokeDashoffset = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    })

    return (
        <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>

            {/* Mode selector */}
            <View style={styles.tabs}>
                {(["focus", "short", "long"] as Mode[]).map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[
                            styles.tab,
                            mode === item && styles.tabActive,
                        ]}
                        onPress={() => setMode(item)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                mode === item && styles.tabTextActive,
                            ]}
                        >
                            {labelForMode(item)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Timer */}
            <View style={styles.timerWrapper}>
                <View style={styles.timerShadow}>
                    <Svg width={size} height={size}>
                        <Circle
                            stroke={colors.border}
                            fill="none"
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            strokeWidth={strokeWidth}
                        />
                        <AnimatedCircle
                            stroke="#30D158"
                            fill="none"
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </Svg>

                    <View style={styles.timerContent}>
                        <Text style={styles.timerText}>{formatted}</Text>
                        <Text style={styles.timerLabel}>
                            {mode === "focus" ? "Focus" : "Break"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={toggleRun}
                >
                    <Text style={styles.primaryText}>
                        {isRunning ? "PAUSE" : "START"}
                    </Text>
                </TouchableOpacity>
                <View style={styles.secondaryRow}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
                        <Text style={styles.secondaryText}>RESET</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={skip}>
                        <Text style={styles.secondaryText}>SKIP</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Session info */}
            <View style={styles.sessionInfo}>
                <Text style={styles.infoText}>Session {session} / 4</Text>
                <Text style={styles.infoText}>Next break in {nextBreak}</Text>
            </View>

            {/* Sounds */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ambient</Text>
                <FlatList
                    data={SOUNDS}
                    keyExtractor={(item) => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.soundList}
                    renderItem={({ item }) => {
                        const active = activeSound === item
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.soundChip,
                                    active && styles.soundChipActive,
                                ]}
                                onPress={() => toggleSound(item)}
                            >
                                <Text
                                    style={[
                                        styles.soundText,
                                        active && styles.soundTextActive,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )
                    }}
                />
            </View>

            {/* Stats */}
            <View style={styles.statsCard}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Pomodoros</Text>
                    <Text style={styles.statValue}>{stats.pomodoros}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Focus Time</Text>
                    <Text style={styles.statValue}>
                        {formatMinutes(stats.focusMinutes)}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Streak</Text>
                    <Text style={styles.statValue}>{stats.streak}d</Text>
                </View>
            </View>
        </SafeAreaView>
    )
    function updateStatsOnFocusComplete(elapsedSeconds: number) {
        const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
        setStats((prev) => {
            const normalized = normalizeDaily(prev)
            const today = todayISO()
            const yesterday = yesterdayISO()

            let streak = normalized.streak
            if (normalized.lastCompletedDate === today) {
                streak = normalized.streak
            } else if (normalized.lastCompletedDate === yesterday) {
                streak = normalized.streak + 1
            } else {
                streak = 1
            }

            const next: Stats = {
                ...normalized,
                date: today,
                pomodoros: normalized.pomodoros + 1,
                focusMinutes: normalized.focusMinutes + elapsedMinutes,
                streak,
                lastCompletedDate: today,
            }

            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            return next
        })
    }

    function toggleSound(item: string) {
        setActiveSound((prev) => (prev === item ? null : item))
        Alert.alert(
            "Ses yakında",
            "Ortam sesleri için ses dosyası eklenmedi. Dosyalar eklendiğinde otomatik çalacak."
        )
    }
}

function formatTime(sec: number) {
    const minutes = Math.floor(sec / 60)
    const seconds = sec % 60
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function labelForMode(mode: Mode) {
    if (mode === "focus") return "Focus"
    if (mode === "short") return "Short Break"
    return "Long Break"
}

function formatMinutes(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours === 0) return `${minutes}m`
    return `${hours}h${minutes.toString().padStart(2, "0")}m`
}

function todayISO() {
    return new Date().toISOString().split("T")[0]
}

function yesterdayISO() {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().split("T")[0]
}

function defaultStats(): Stats {
    return {
        date: todayISO(),
        pomodoros: 0,
        focusMinutes: 0,
        streak: 0,
        lastCompletedDate: undefined,
    }
}

function normalizeDaily(stats: Stats): Stats {
    const today = todayISO()
    if (stats.date === today) return stats
    return {
        ...stats,
        date: today,
        pomodoros: 0,
        focusMinutes: 0,
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
        padding: 16,
    },
    header: {
        marginBottom: 12,
    },
    title: {
        color: colors.text,
        fontSize: 28,
        fontWeight: "700",
    },
    subtitle: {
        color: colors.subtext,
        marginTop: 2,
    },
    tabs: {
        flexDirection: "row",
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 6,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    tabActive: {
        backgroundColor: "#1F1F22",
    },
    tabText: {
        color: colors.subtext,
        fontWeight: "600",
    },
    tabTextActive: {
        color: colors.text,
    },
    timerWrapper: {
        alignItems: "center",
        marginVertical: 8,
    },
    timerShadow: {
        width: 280,
        height: 280,
        borderRadius: 140,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.card,
        padding: 10,
    },
    timerContent: {
        position: "absolute",
        alignItems: "center",
    },
    timerText: {
        color: colors.text,
        fontSize: 48,
        fontWeight: "700",
    },
    timerLabel: {
        color: colors.subtext,
        marginTop: 4,
    },
    controls: {
        marginTop: 16,
    },
    button: {
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
    },
    primaryButton: {
        backgroundColor: "#30D158",
    },
    primaryText: {
        color: "#000",
        fontWeight: "700",
        letterSpacing: 1,
    },
    secondaryRow: {
        flexDirection: "row",
        marginTop: 10,
    },
    secondaryButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: 5,
    },
    secondaryText: {
        color: colors.text,
        fontWeight: "600",
        letterSpacing: 0.8,
    },
    sessionInfo: {
        marginTop: 12,
        alignItems: "center",
        gap: 4,
    },
    infoText: {
        color: colors.subtext,
    },
    section: {
        marginTop: 18,
    },
    sectionTitle: {
        color: colors.text,
        fontWeight: "600",
        marginBottom: 8,
    },
    soundList: {
        paddingRight: 6,
    },
    soundChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 10,
    },
    soundChipActive: {
        borderColor: "#30D158",
        backgroundColor: "#1F1F22",
    },
    soundText: {
        color: colors.text,
        fontWeight: "600",
    },
    soundTextActive: {
        color: "#30D158",
    },
    statsCard: {
        marginTop: 18,
        backgroundColor: colors.card,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: colors.border,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statLabel: {
        color: colors.subtext,
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "700",
    },
})
