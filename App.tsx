import "react-native-get-random-values"
import React, { useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { TaskProvider } from "./src/context/TaskContext"
import { PremiumProvider } from "./src/context/PremiumContext"
import HomeScreen from "./src/screens/HomeScreen"
import PremiumScreen from "./src/screens/PremiumScreen"
import { RootStackParamList } from "./src/types/navigation"
import * as Notifications from "expo-notifications"
import DrawerNavigator from "./src/navigation/DrawerNavigator"
import { LanguageProvider } from "./src/context/LanguageContext"

const Stack = createNativeStackNavigator<RootStackParamList>()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export default function App() {
  return (
    <LanguageProvider>
      <PremiumProvider>
        <TaskProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Main" component={DrawerNavigator} />
              <Stack.Screen name="Premium" component={PremiumScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </TaskProvider>
      </PremiumProvider>
    </LanguageProvider>
  )
}
