import React, { useEffect, useMemo, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors } from "../theme/colors"
import { Habit, HabitCompletionMap } from "../types/habit"
import {
    loadHabitCompletions,
    loadHabits,
    saveHabitCompletions,
    saveHabits,
} from "../services/storage"
import { v4 as uuidv4 } from "uuid"
import ProgressBar from "../components/ProgressBar"
import { usePremium } from "../context/PremiumContext"
import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../types/navigation"
import { useTranslation } from "../context/LanguageContext"

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">

const REMINDER_ID_KEY = "HABIT_REMINDER_ID"
const REMINDER_DATE_KEY = "HABIT_REMINDER_DATE"

const todayKey = () => new Date().toISOString().split("T")[0]

const getCheckTime = () => {
    const now = new Date()
    const target = new Date(now)
    target.setHours(20, 0, 0, 0)
    return target
}

const calculateStreaks = (
    habitId: string,
    completions: HabitCompletionMap
): { current: number; best: number } => {
    const habitDays = completions[habitId] || {}
    const completedDates = Object.entries(habitDays)
        .filter(([, done]) => done)
        .map(([date]) => date)
        .sort()

    if (completedDates.length === 0) return { current: 0, best: 0 }

    // Best streak
    let best = 1
    let run = 1
    for (let i = 1; i < completedDates.length; i++) {
        const prev = new Date(completedDates[i - 1])
        const curr = new Date(completedDates[i])
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        if (diff === 1) {
            run += 1
            best = Math.max(best, run)
        } else {
            run = 1
        }
    }

    // Current streak (counts today if completed)
    let current = 0
    const today = new Date(todayKey())
    while (true) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - current)
        const key = checkDate.toISOString().split("T")[0]
        if (habitDays[key]) {
            current += 1
        } else {
            break
        }
    }

    return { current, best }
}

export default function HabitTrackerScreen() {
    const [habits, setHabits] = useState<Habit[]>([])
    const [completions, setCompletions] = useState<HabitCompletionMap>({})
    const [modalVisible, setModalVisible] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [reminderId, setReminderId] = useState<string | null>(null)
    const navigation = useNavigation<NavigationProp>()
    const { isPremium } = usePremium()
    const { t } = useTranslation()

    // Initial load
    useEffect(() => {
        loadHabits().then(setHabits)
        loadHabitCompletions().then(setCompletions)
        restoreReminder()
    }, [])

    // Persist changes
    useEffect(() => {
        saveHabits(habits)
    }, [habits])

    useEffect(() => {
        saveHabitCompletions(completions)
        handleReminderScheduling()
    }, [completions, habits, isPremium])

    const today = todayKey()

    const total = habits.length
    const completedToday = useMemo(
        () =>
            habits.filter(habit => completions[habit.id]?.[today]).length,
        [habits, completions, today]
    )

    const progressPercent = total === 0 ? 0 : Math.round((completedToday / total) * 100)

    const maxHabits = isPremium ? 20 : 10

    const restoreReminder = async () => {
        const storedDate = await AsyncStorage.getItem(REMINDER_DATE_KEY)
        const storedId = await AsyncStorage.getItem(REMINDER_ID_KEY)

        if (storedDate !== today && storedId) {
            await Notifications.cancelScheduledNotificationAsync(storedId)
            await AsyncStorage.multiRemove([REMINDER_DATE_KEY, REMINDER_ID_KEY])
            setReminderId(null)
            return
        }

        if (storedDate === today && storedId) {
            setReminderId(storedId)
        }
    }

    const scheduleReminder = async () => {
        if (!isPremium || total === 0) return

        const checkTime = getCheckTime()
        if (new Date() >= checkTime) return

        const permission = await Notifications.requestPermissionsAsync()
        if (permission.status !== "granted") return

        if (reminderId) {
            await Notifications.cancelScheduledNotificationAsync(reminderId)
        }

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: t("habits.reminder.title"),
                body: t("habits.reminder.body"),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: checkTime,
            },
        })

        setReminderId(id)
        await AsyncStorage.multiSet([
            [REMINDER_ID_KEY, id],
            [REMINDER_DATE_KEY, today],
        ])
    }

    const cancelReminder = async () => {
        if (reminderId) {
            await Notifications.cancelScheduledNotificationAsync(reminderId)
            setReminderId(null)
            await AsyncStorage.multiRemove([REMINDER_ID_KEY, REMINDER_DATE_KEY])
        }
    }

    const handleReminderScheduling = async () => {
        if (!isPremium) {
            await cancelReminder()
            return
        }

        const checkTime = getCheckTime()
        if (new Date() >= checkTime) return

        const belowThreshold = total > 0 && completedToday / Math.max(total, 1) < 0.5
        if (belowThreshold) {
            await scheduleReminder()
        } else {
            await cancelReminder()
        }
    }

    const toggleHabit = (id: string) => {
        setCompletions(prev => {
            const current = prev[id]?.[today] || false
            const habitMap = prev[id] ? { ...prev[id] } : {}
            habitMap[today] = !current
            return { ...prev, [id]: habitMap }
        })
    }

    const handleAddHabit = () => {
        if (!newTitle.trim()) return

        if (habits.length >= maxHabits) {
            Alert.alert(
                t("habits.limit.title"),
                isPremium
                    ? t("habits.limit.cap")
                    : t("habits.limit.max"),
                isPremium
                    ? [{ text: t("common.ok") }]
                    : [
                        { text: t("common.cancel"), style: "cancel" },
                        {
                            text: t("common.premiumUpgrade"),
                            onPress: () => navigation.navigate("Premium"),
                        },
                    ]
            )
            return
        }

        const newHabit: Habit = {
            id: uuidv4(),
            title: newTitle.trim(),
            createdAt: new Date().toISOString(),
        }

        setHabits(prev => [newHabit, ...prev])
        setNewTitle("")
        setModalVisible(false)
    }

    const streakForHabit = (habitId: string) => calculateStreaks(habitId, completions)

    return (
        <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
            <Text style={styles.title}>{t("habits.title")}</Text>
            <Text style={styles.counter}>
                {t("habits.counter", {
                    params: { completed: completedToday, total, percent: progressPercent },
                })}
            </Text>
            <ProgressBar completed={completedToday} total={Math.max(total, 1)} />

            {habits.length === 0 && (
                <Text style={styles.empty}>{t("habits.empty")}</Text>
            )}

            <FlatList
                data={habits}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 120 }}
                renderItem={({ item }) => {
                    const done = completions[item.id]?.[today]
                    const streak = streakForHabit(item.id)

                    return (
                        <TouchableOpacity
                            style={[styles.habitItem, done && styles.habitItemDone]}
                            onPress={() => toggleHabit(item.id)}
                        >
                            <View style={styles.habitLeft}>
                                <View
                                    style={[styles.checkbox, done && styles.checkboxChecked]}
                                >
                                    {done && <Text style={styles.checkboxMark}>✓</Text>}
                                </View>
                                <Text style={styles.habitTitle}>{item.title}</Text>
                            </View>

                            {isPremium && (
                                <View style={styles.streakBox}>
                                    <Text style={styles.streakText}>
                                        {t("habits.streak", {
                                            params: { current: streak.current, best: streak.best },
                                        })}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                }}
            />

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t("habits.modal.title")}</Text>
                        <TextInput
                            placeholder={t("habits.modal.placeholder")}
                            placeholderTextColor={colors.subtext}
                            style={styles.input}
                            value={newTitle}
                            onChangeText={setNewTitle}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleAddHabit}
                        />

                        <TouchableOpacity style={styles.addButton} onPress={handleAddHabit}>
                            <Text style={styles.addButtonText}>{t("common.add")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(false)
                                setNewTitle("")
                            }}
                        >
                            <Text style={styles.cancel}>{t("common.cancel")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
        padding: 16,
    },
    title: {
        color: colors.text,
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
    },
    counter: {
        color: colors.subtext,
        marginBottom: 10,
    },
    empty: {
        color: colors.subtext,
        marginTop: 40,
        textAlign: "center",
    },
    habitItem: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    habitItemDone: {
        borderColor: "#4CAF50",
    },
    habitLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.subtext,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: "#4CAF50",
        borderColor: "#4CAF50",
    },
    checkboxMark: {
        color: "#fff",
        fontWeight: "700",
    },
    habitTitle: {
        color: colors.text,
        fontSize: 16,
        maxWidth: 170,
    },
    streakBox: {
        backgroundColor: colors.border,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    streakText: {
        color: colors.subtext,
        fontSize: 12,
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 40,
        backgroundColor: "#fff",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    fabText: {
        fontSize: 28,
        color: "#000",
        marginTop: Platform.OS === "ios" ? -2 : 0,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: colors.card,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
    },
    input: {
        backgroundColor: colors.bg,
        color: colors.text,
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    addButtonText: {
        color: "#000",
        fontWeight: "600",
    },
    cancel: {
        color: colors.subtext,
        textAlign: "center",
    },
})
