import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Linking, Modal, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors } from "../theme/colors"
import { usePremium } from "../context/PremiumContext"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../types/navigation"
import * as Notifications from "expo-notifications"
import { useTranslation } from "../context/LanguageContext"

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function SettingsScreen() {
    const { isPremium, setPremium } = usePremium()
    const navigation = useNavigation<NavigationProp>()
    const { language, setLanguage, t } = useTranslation()
    const [languageModalVisible, setLanguageModalVisible] = useState(false)

    const [notificationStatus, setNotificationStatus] = useState<
        "granted" | "denied" | "undetermined"
    >("undetermined")

    // 🔔 Bildirim izin durumunu çek
    useEffect(() => {
        const getStatus = async () => {
            const settings = await Notifications.getPermissionsAsync()
            setNotificationStatus(settings.status)
        }

        getStatus()
    }, [])

    const openSystemSettings = () => {
        Linking.openSettings()
    }

    const requestNotificationPermission = async () => {
        const result = await Notifications.requestPermissionsAsync()
        setNotificationStatus(result.status)
    }

    const handleLanguageSelect = (code: "tr" | "en") => {
        setLanguage(code)
        setLanguageModalVisible(false)
    }

    return (
        <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
            <Text style={styles.title}>{t("settings.title")}</Text>

            {/* PREMIUM */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("settings.premium.title")}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>{t("common.status")}</Text>
                    <Text style={styles.value}>
                        {isPremium ? t("settings.premium.active") : t("settings.premium.free")}
                    </Text>
                </View>

                {!isPremium && (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate("Premium")}
                    >
                        <Text style={styles.buttonText}>{t("settings.premium.upgrade")}</Text>
                    </TouchableOpacity>
                )}

                {/* DEV TEST BUTONU */}
                {isPremium && (
                    <TouchableOpacity
                        style={styles.devButton}
                        onPress={() => setPremium(false)}
                    >
                        <Text style={styles.devButtonText}>
                            {t("settings.premium.reset")}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* BİLDİRİMLER */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("settings.notifications.title")}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>{t("common.status")}</Text>
                    <Text style={styles.value}>
                        {notificationStatus === "granted"
                            ? t("settings.notifications.on")
                            : notificationStatus === "denied"
                                ? t("settings.notifications.off")
                                : t("settings.notifications.unknown")}
                    </Text>
                </View>

                <View style={styles.actionsRow}>
                    {notificationStatus !== "granted" && (
                        <TouchableOpacity
                            style={[styles.buttonSecondary, styles.actionButton]}
                            onPress={requestNotificationPermission}
                        >
                            <Text style={styles.buttonSecondaryText}>
                                {t("settings.notifications.enable")}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.buttonSecondary,
                            styles.actionButton,
                            styles.lastActionButton,
                        ]}
                        onPress={openSystemSettings}
                    >
                        <Text style={styles.buttonSecondaryText}>
                            {t("settings.notifications.manage")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* APP LANGUAGE */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("settings.app.title")}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>{t("common.version")}</Text>
                    <Text style={styles.value}>v1.8</Text>
                </View>

                <TouchableOpacity
                    style={styles.buttonSecondary}
                    onPress={() => setLanguageModalVisible(true)}
                >
                    <Text style={styles.buttonSecondaryText}>
                        {t("settings.app.language", {
                            params: { language: t(`languages.${language}`) },
                        })}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal visible={languageModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{t("settings.app.selectLanguage")}</Text>
                        <FlatList
                            data={[
                                { code: "en", label: t("languages.en") },
                                { code: "tr", label: t("languages.tr") },
                            ]}
                            keyExtractor={item => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.languageRow,
                                        item.code === language && styles.languageRowActive,
                                    ]}
                                    onPress={() => handleLanguageSelect(item.code as "tr" | "en")}
                                >
                                    <Text
                                        style={[
                                            styles.languageText,
                                            item.code === language && styles.languageTextActive,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setLanguageModalVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>{t("common.cancel")}</Text>
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
        marginBottom: 20,
    },
    section: {
        marginBottom: 24,
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 16,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    label: {
        color: colors.subtext,
        fontSize: 14,
    },
    value: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "500",
    },
    button: {
        backgroundColor: "#fff",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    buttonText: {
        color: "#000",
        fontWeight: "600",
    },
    devButton: {
        paddingVertical: 10,
        alignItems: "center",
    },
    devButtonText: {
        color: "#ff453a",
        fontSize: 13,
    },
    buttonSecondary: {
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        paddingHorizontal: 12,
    },
    buttonSecondaryText: {
        color: colors.text,
        fontWeight: "500",
    },
    actionsRow: {
        flexDirection: "row",
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
        marginRight: 10,
    },
    lastActionButton: {
        marginRight: 0,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        width: "100%",
    },
    modalTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },
    languageRow: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 8,
    },
    languageRowActive: {
        borderColor: "#fff",
        backgroundColor: "#fff",
    },
    languageText: {
        color: colors.text,
        fontSize: 15,
    },
    languageTextActive: {
        color: "#000",
        fontWeight: "600",
    },
    modalCloseButton: {
        marginTop: 4,
        alignItems: "center",
        paddingVertical: 10,
    },
    modalCloseText: {
        color: colors.subtext,
        fontSize: 14,
    },
})
