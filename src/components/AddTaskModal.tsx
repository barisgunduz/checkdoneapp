import { useState, useRef, useEffect } from "react"
import {
    Modal,
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native"
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker"
import { colors } from "../theme/colors"
import { DEFAULT_CATEGORIES, CategoryKey } from "../constants/categories"
import { useTranslation } from "../context/LanguageContext"

type Props = {
    visible: boolean
    onClose: () => void
    onAdd: (
        title: string,
        category?: string,
        reminderDate?: string
    ) => void
    initialReminderDate?: string
}

export default function AddTaskModal({
    visible,
    onClose,
    onAdd,
    initialReminderDate,
}: Props) {
    const [title, setTitle] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<
        CategoryKey | undefined
    >()
    const [reminderDate, setReminderDate] = useState<Date | undefined>()
    const [showPicker, setShowPicker] = useState(false)
    const inputRef = useRef<TextInput>(null)
    const { t } = useTranslation()

    useEffect(() => {
        if (visible) {
            setSelectedCategory(undefined)
            setShowPicker(false)

            // 🔥 Takvimden gelen tarih varsa onu bas
            if (initialReminderDate) {
                setReminderDate(new Date(initialReminderDate))
            } else {
                setReminderDate(undefined)
            }

            const timer = setTimeout(() => {
                inputRef.current?.focus()
            }, 100)

            return () => clearTimeout(timer)
        }
    }, [visible, initialReminderDate])

    const handleAdd = () => {
        if (!title.trim()) return

        onAdd(
            title.trim(),
            selectedCategory,
            reminderDate ? reminderDate.toISOString() : undefined
        )

        setTitle("")
        setReminderDate(undefined)
        setSelectedCategory(undefined)
        setShowPicker(false)
        onClose()
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.overlay}
            >
                <View style={styles.modal}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {/* INPUT + DATE BUTTON */}
                        <View style={styles.inputRow}>
                            <TextInput
                                ref={inputRef}
                                placeholder={t("addTask.placeholder")}
                                placeholderTextColor={colors.subtext}
                                value={title}
                                onChangeText={setTitle}
                                style={styles.input}
                                returnKeyType="done"
                                onSubmitEditing={handleAdd}
                                blurOnSubmit={false}
                            />

                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowPicker(true)}
                            >
                                <Text style={styles.dateButtonText}>📅</Text>
                            </TouchableOpacity>
                        </View>

                        {/* SEÇİLİ TARİH LABEL */}
                        {reminderDate && (
                            <Text style={styles.reminderLabel}>
                                ⏰ {reminderDate.toLocaleString()}
                            </Text>
                        )}

                        {/* DATE PICKER */}
                        {showPicker && (
                            <View style={styles.pickerContainer}>
                                <DateTimePicker
                                    value={reminderDate || new Date()}
                                    mode="datetime"
                                    minimumDate={new Date()}
                                    display="spinner"
                                    themeVariant="light"
                                    onChange={(
                                        event: DateTimePickerEvent,
                                        selectedDate?: Date
                                    ) => {
                                        if (selectedDate) {
                                            setReminderDate(selectedDate)
                                        }
                                    }}
                                />

                                <TouchableOpacity
                                    style={styles.pickerDoneButton}
                                    onPress={() => setShowPicker(false)}
                                >
                                    <Text style={styles.pickerDoneText}>
                                        {t("common.confirm")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* KATEGORİLER */}
                        <View style={styles.categoryRow}>
                            {DEFAULT_CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryBtn,
                                        selectedCategory === cat &&
                                        styles.categoryBtnActive,
                                    ]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            selectedCategory === cat &&
                                        styles.categoryTextActive,
                                    ]}
                                >
                                        {t(`categories.${cat}`)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* EKLE */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleAdd}
                        >
                            <Text style={{ color: "#000" }}>{t("addTask.save")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.cancel}>{t("common.cancel")}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    modal: {
        backgroundColor: colors.card,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "80%",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    input: {
        flex: 1,
        backgroundColor: colors.bg,
        color: colors.text,
        padding: 14,
        borderRadius: 12,
        marginRight: 8,
    },
    dateButton: {
        backgroundColor: "#fff",
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    dateButtonText: {
        fontSize: 18,
    },
    reminderLabel: {
        color: colors.subtext,
        marginBottom: 8,
        fontSize: 12,
    },
    pickerContainer: {
        backgroundColor: colors.whiteBg,
        borderRadius: 12,
        padding: 8,
        marginBottom: 12,
    },
    pickerDoneButton: {
        marginTop: 8,
        backgroundColor: "#fff",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    pickerDoneText: {
        color: "#000",
        fontWeight: "600",
    },
    button: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    cancel: {
        color: colors.subtext,
        textAlign: "center",
    },
    categoryRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 12,
    },
    categoryBtn: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginRight: 8,
        marginBottom: 8,
    },
    categoryBtnActive: {
        backgroundColor: "#fff",
        borderColor: "#fff",
    },
    categoryText: {
        color: colors.text,
        fontSize: 13,
    },
    categoryTextActive: {
        color: "#000",
    },
})
