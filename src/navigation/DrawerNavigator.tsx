import { createDrawerNavigator } from "@react-navigation/drawer"
import HomeScreen from "../screens/HomeScreen"
import PremiumScreen from "../screens/PremiumScreen"
import CalendarScreen from "../screens/CalendarScreen"
import SettingsScreen from "../screens/SettingsScreen"
import { colors } from "../theme/colors"

const Drawer = createDrawerNavigator()

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
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
            <Drawer.Screen name="Ayarlar" component={SettingsScreen} />
            <Drawer.Screen name="Premium" component={PremiumScreen} />
        </Drawer.Navigator>
    )
}