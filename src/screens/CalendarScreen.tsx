import React, { useState, useMemo } from "react"
import {
    StyleSheet,
    Alert,
    View,
    Text,
    FlatList,
    TouchableOpacity,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Calendar } from "react-native-calendars"
import { colors } from "../theme/colors"
import { usePremium } from "../context/PremiumContext"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../types/navigation"
import { useTasks } from "../context/TaskContext"
import TaskItem from "../components/TaskItem"
import AddTaskModal from "../components/AddTaskModal"
import { useTranslation } from "../context/LanguageContext"

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function CalendarScreen() {
    const { isPremium } = usePremium()
    const { tasks, toggleTask, deleteTask, addTask } = useTasks()
    const navigation = useNavigation<NavigationProp>()
    const { t } = useTranslation()

    const today = new Date().toISOString().split("T")[0]

    const [currentMonth, setCurrentMonth] = useState(today)
    const [selectedDate, setSelectedDate] = useState(today)
    const [modalVisible, setModalVisible] = useState(false)

    const showPremiumAlert = () => {
        Alert.alert(
            t("calendar.premiumRequired.title"),
            t("calendar.premiumRequired.message"),
            [
                { text: t("common.cancel"), style: "cancel" },
                {
                    text: t("common.premiumUpgrade"),
                    onPress: () => navigation.navigate("Premium"),
                },
            ]
        )
    }

    // 🔎 Seçilen günün taskleri
    const selectedDayTasks = useMemo(() => {
        return tasks.filter((task) => {
            const taskDate = task.reminderDate
                ? task.reminderDate.split("T")[0]
                : task.createdAt.split("T")[0]

            return taskDate === selectedDate
        })
    }, [tasks, selectedDate])

    // 🟢 Takvimde nokta göstermek için markedDates
    const markedDates = useMemo(() => {
        const marks: any = {}

        // Gün bazlı taskleri grupla
        const tasksByDate: Record<string, typeof tasks> = {}

        tasks.forEach((task) => {
            const taskDate = task.reminderDate
                ? task.reminderDate.split("T")[0]
                : task.createdAt.split("T")[0]

            if (!tasksByDate[taskDate]) {
                tasksByDate[taskDate] = []
            }

            tasksByDate[taskDate].push(task)
        })

        // Her gün için durum hesapla
        Object.keys(tasksByDate).forEach((date) => {
            const dayTasks = tasksByDate[date]

            const hasCompleted = dayTasks.some((t) => t.completed)
            const hasActive = dayTasks.some((t) => !t.completed)

            if (hasCompleted && hasActive) {
                // Çift nokta
                marks[date] = {
                    marked: true,
                    dots: [
                        { key: "active", color: "#fff" },
                        { key: "completed", color: "#30D158" },
                    ],
                }
            } else if (hasCompleted) {
                marks[date] = {
                    marked: true,
                    dotColor: "#30D158",
                }
            } else if (hasActive) {
                marks[date] = {
                    marked: true,
                    dotColor: "#fff",
                }
            }
        })

        // Seçili günü override et
        marks[selectedDate] = {
            ...(marks[selectedDate] || {}),
            selected: true,
            selectedColor: "#30D158",
        }

        return marks
    }, [tasks, selectedDate])

    // ➕ Takvimden görev ekleme
    const handleAddTask = (
        title: string,
        category?: string,
        reminderDate?: string
    ) => {
        if (selectedDate < today) {
            Alert.alert(t("calendar.error.title"), t("calendar.error.past"))
            return
        }

        addTask(title, category, reminderDate)
    }

    return (
        <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
            <Calendar
                current={currentMonth}
                hideExtraDays
                firstDay={1}
                markedDates={markedDates}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                onPressArrowLeft={(subtractMonth) => {
                    if (!isPremium) {
                        showPremiumAlert()
                    } else {
                        subtractMonth()
                    }
                }}
                onPressArrowRight={(addMonth) => {
                    if (!isPremium) {
                        showPremiumAlert()
                    } else {
                        addMonth()
                    }
                }}
                theme={{
                    backgroundColor: colors.bg,
                    calendarBackground: colors.bg,
                    textSectionTitleColor: colors.subtext,
                    dayTextColor: colors.text,
                    todayTextColor: "#30D158",
                    monthTextColor: colors.text,
                    arrowColor: colors.text,
                    textDisabledColor: colors.border,
                    selectedDayBackgroundColor: "#30D158",
                    selectedDayTextColor: "#000",
                }}
            />

            {/* 📋 Seçilen günün görevleri */}
            <View style={styles.listContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t("calendar.tasksTitle")}</Text>

                    {/* ➕ Takvim + buton */}
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => {
                            if (selectedDate < today) {
                                Alert.alert(
                                    t("calendar.error.title"),
                                    t("calendar.error.past")
                                )
                                return
                            }
                            setModalVisible(true)
                        }}
                    >
                        <Text style={styles.addBtnText}>+</Text>
                    </TouchableOpacity>
                </View>

                {selectedDayTasks.length === 0 ? (
                    <Text style={styles.emptyText}>{t("calendar.empty")}</Text>
                ) : (
                    <FlatList
                        data={selectedDayTasks}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TaskItem
                                task={item}
                                onToggle={() => toggleTask(item.id)}
                                onDelete={() => deleteTask(item.id)}
                            />
                        )}
                    />
                )}
            </View>

            {/* 🧩 Modal */}
            <AddTaskModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={handleAddTask}
                initialReminderDate={selectedDate}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
        padding: 16,
    },
    listContainer: {
        flex: 1,
        marginTop: 12,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "600",
    },
    addBtn: {
        backgroundColor: "#fff",
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    addBtnText: {
        fontSize: 18,
        color: "#000",
        fontWeight: "bold",
    },
    emptyText: {
        color: colors.subtext,
        textAlign: "center",
        marginTop: 20,
    },
})
