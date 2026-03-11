import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors } from "../theme/colors"
import { usePremium } from "../context/PremiumContext"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../types/navigation"
import { useState, useMemo } from "react"
import { useTranslation } from "../context/LanguageContext"

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Premium">

const PROMO_CODE = "CHECKDONE30"
const TL_PRICE = 49
const USD_RATE = 44

export default function PremiumScreen() {
    const {
        isPremium,
        setPremium,
        premiumStartedAt,
        setPremiumStartedAt,
        resetPremium, // DEV
    } = usePremium()

    const navigation = useNavigation<NavigationProp>()
    const [code, setCode] = useState("")
    const { t, language } = useTranslation()

    // 📅 Tarih hesaplama
    const { startDate, expiryDate, remainingDays } = useMemo(() => {
        if (!premiumStartedAt) {
            return {
                startDate: null,
                expiryDate: null,
                remainingDays: null,
            }
        }

        const start = new Date(premiumStartedAt)
        const expiry = new Date(start)
        expiry.setDate(expiry.getDate() + 30)

        const today = new Date()
        const diffTime = expiry.getTime() - today.getTime()
        const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

        return {
            startDate: start.toLocaleDateString(),
            expiryDate: expiry.toLocaleDateString(),
            remainingDays: diffDays,
        }
    }, [premiumStartedAt])

    const handleUpgrade = () => {
        const now = new Date().toISOString()
        setPremium(true)
        setPremiumStartedAt(now)
        navigation.goBack()
    }

    const handlePromo = () => {
        if (code.trim().toUpperCase() === PROMO_CODE) {
            const now = new Date().toISOString()
            setPremium(true)
            setPremiumStartedAt(now)
            Alert.alert(
                t("premium.promo.success.title"),
                t("premium.promo.success.message")
            )
            setCode("")
            navigation.goBack()
        } else {
            Alert.alert(
                t("premium.promo.error.title"),
                t("premium.promo.error.message")
            )
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
            {!isPremium ? (
                <>
                    <Text style={styles.title}>{t("premium.title")}</Text>
                    <Text style={styles.subtitle}>{t("premium.subtitle")}</Text>

                    <View style={styles.heroCard}>
                        <View style={styles.pricePill}>
                            <Text style={styles.priceValue}>
                                {language === "en"
                                    ? `$${(TL_PRICE / USD_RATE).toFixed(2)}`
                                    : `₺${TL_PRICE}`}
                            </Text>
                            <Text style={styles.pricePeriod}>{t("premium.price.period")}</Text>
                        </View>
                        <Text style={styles.priceNote}>{t("premium.price.fxNote")}</Text>
                        <TouchableOpacity style={styles.ctaButton} onPress={handleUpgrade}>
                            <Text style={styles.ctaText}>✨ {t("premium.button.upgrade")}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.benefitsCard}>
                        <Text style={styles.cardTitle}>{t("premium.cardTitle")}</Text>
                        {[
                            t("premium.feature.tasks"),
                            t("premium.feature.noAds"),
                            t("premium.feature.reminders"),
                            t("premium.feature.categories"),
                            t("premium.feature.archive"),
                        ].map(item => (
                            <View style={styles.benefitRow} key={item}>
                                <Text style={styles.benefitIcon}>✅</Text>
                                <Text style={styles.feature}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    {/* 🎁 PROMO CODE */}
                    <View style={styles.promoBox}>
                        <View style={styles.promoHeader}>
                            <Text style={styles.promoIcon}>🎁</Text>
                            <Text style={styles.promoTitle}>{t("premium.promo.title")}</Text>
                        </View>
                        <View style={styles.promoInputWrap}>
                            <TextInput
                                value={code}
                                onChangeText={setCode}
                                placeholder={t("premium.promo.placeholder")}
                                placeholderTextColor={colors.subtext}
                                style={styles.promoInput}
                                autoCapitalize="characters"
                                returnKeyType="done"
                            />
                            <TouchableOpacity style={styles.promoButton} onPress={handlePromo}>
                                <Text style={styles.promoButtonText}>{t("premium.promo.button")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.small}>{t("premium.promo.note")}</Text>
                </>
            ) : (
                <>
                    <Text style={styles.title}>{t("premium.active.title")}</Text>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t("premium.info.title")}</Text>

                        <Text style={styles.feature}>
                            {t("premium.info.start", { params: { date: startDate || "-" } })}
                        </Text>
                        <Text style={styles.feature}>
                            {t("premium.info.renew", { params: { date: expiryDate || "-" } })}
                        </Text>
                        <Text style={styles.feature}>
                            {t("premium.info.remaining", {
                                params: { days: remainingDays ?? "-" },
                            })}
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t("premium.perks.title")}</Text>
                        <Text style={styles.feature}>{t("premium.feature.tasks")}</Text>
                        <Text style={styles.feature}>{t("premium.feature.reminders")}</Text>
                        <Text style={styles.feature}>{t("premium.feature.categories")}</Text>
                        <Text style={styles.feature}>{t("premium.feature.archive")}</Text>
                    </View>

                    {/* DEV RESET */}
                    <TouchableOpacity
                        style={styles.devButton}
                        onPress={() => {
                            resetPremium()
                            navigation.goBack()
                        }}
                    >
                        <Text style={styles.devButtonText}>{t("premium.dev.reset")}</Text>
                    </TouchableOpacity>
                </>
            )}

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.cancel}>{t("premium.back")}</Text>
            </TouchableOpacity>
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
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle: {
        color: colors.subtext,
        marginBottom: 24,
        fontSize: 15,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardTitle: {
        color: colors.text,
        fontSize: 16,
        marginBottom: 12,
        fontWeight: "600",
    },
    feature: {
        color: colors.text,
        marginBottom: 8,
        fontSize: 15,
    },
    heroCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pricePill: {
        flexDirection: "row",
        alignItems: "flex-end",
        alignSelf: "flex-start",
        backgroundColor: "#fff",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
    },
    priceValue: {
        color: "#000",
        fontSize: 26,
        fontWeight: "800",
    },
    pricePeriod: {
        color: "#000",
        marginLeft: 6,
        marginBottom: 2,
        fontWeight: "600",
    },
    priceNote: {
        color: colors.subtext,
        marginTop: 10,
        marginBottom: 14,
        fontSize: 12,
    },
    ctaButton: {
        backgroundColor: "#fff",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    ctaText: {
        color: "#000",
        fontWeight: "700",
        fontSize: 16,
    },
    benefitsCard: {
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    benefitRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    benefitIcon: {
        marginRight: 10,
        fontSize: 16,
    },
    small: {
        color: colors.subtext,
        textAlign: "center",
        marginTop: 12,
        fontSize: 12,
    },
    cancel: {
        color: colors.subtext,
        textAlign: "center",
        marginTop: 20,
    },
    promoBox: {
        marginTop: 10,
        backgroundColor: colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
    },
    promoHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    promoIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    promoTitle: {
        color: colors.text,
        fontWeight: "700",
    },
    promoInputWrap: {
        flexDirection: "row",
        alignItems: "center",
    },
    promoInput: {
        flex: 1,
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginRight: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    promoButton: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#fff",
        minWidth: 90,
    },
    promoButtonText: {
        color: "#000",
        fontWeight: "600",
        fontSize: 14,
    },
    devButton: {
        backgroundColor: "#ff453a",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    devButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
})
