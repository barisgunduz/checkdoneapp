import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItemList,
} from "@react-navigation/drawer"
import { View, Text, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import HomeScreen from "../screens/HomeScreen"
import PremiumScreen from "../screens/PremiumScreen"
import CalendarScreen from "../screens/CalendarScreen"
import SettingsScreen from "../screens/SettingsScreen"
import PomodoroScreen from "../screens/PomodoroScreen"
import ReminderScreen from "../screens/ReminderScreen"
import HabitTrackerScreen from "../screens/HabitTrackerScreen"
import { colors } from "../theme/colors"

const Drawer = createDrawerNavigator()

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={props => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.bg,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: "600",
                },

                drawerStyle: {
                    backgroundColor: colors.bg,
                    width: 260,
                },

                drawerActiveBackgroundColor: colors.card,
                drawerActiveTintColor: colors.text,
                drawerInactiveTintColor: colors.subtext,

                drawerLabelStyle: {
                    fontSize: 15,
                    marginLeft: -8,
                },

                drawerItemStyle: {
                    borderRadius: 12,
                    marginHorizontal: 8,
                    marginVertical: 4,
                },
            }}
        >
            <Drawer.Screen name="Ana Liste" component={HomeScreen} />
            <Drawer.Screen name="Takvim" component={CalendarScreen} />
            <Drawer.Screen name="Pomodoro" component={PomodoroScreen} />
            <Drawer.Screen name="Hatırlatıcı" component={ReminderScreen} />
            <Drawer.Screen name="Günlük" component={HabitTrackerScreen} />
            <Drawer.Screen name="Ayarlar" component={SettingsScreen} />
            <Drawer.Screen name="Premium" component={PremiumScreen} />
        </Drawer.Navigator>
    )
}

function CustomDrawerContent(props: any) {
    const insets = useSafeAreaInsets()

    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={[
                styles.drawerContent,
                {
                    paddingTop: insets.top + 12,
                    paddingBottom: insets.bottom + 12,
                },
            ]}
        >
            <View style={styles.inner}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>CHECKDONEHUB</Text>
                </View>

                <DrawerItemList {...props} />

                <View style={styles.flexSpacer} />

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>v1.9.2</Text>
                </View>
            </View>
        </DrawerContentScrollView>
    )
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    inner: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.border,
        borderRadius: 12,
        marginHorizontal: 8,
        marginBottom: 8,
    },
    headerText: {
        color: colors.whiteText,
        letterSpacing: 1.2,
        fontSize: 16,
        fontWeight: "700",
    },
    flexSpacer: {
        flex: 1,
    },
    versionContainer: {
        marginTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    versionText: {
        color: colors.subtext,
        fontSize: 12,
    },
})
