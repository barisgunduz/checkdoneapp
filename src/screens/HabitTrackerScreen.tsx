import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors } from "../theme/colors"

export default function HabitTrackerScreen() {
    return (
        <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
            <View style={styles.card}>
                <Text style={styles.title}>Günlük</Text>
                <Text style={styles.subtitle}>
                    Alışkanlık takibi burada yer alacak.
                </Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
        padding: 16,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
    },
    title: {
        color: colors.text,
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    subtitle: {
        color: colors.subtext,
    },
})
