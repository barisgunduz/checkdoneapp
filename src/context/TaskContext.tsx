import React, { createContext, useContext, useEffect, useState } from "react"
import { Task } from "../types/task"
import { loadTasks, saveTasks } from "../services/storage"
import { v4 as uuidv4 } from "uuid"
import * as Notifications from "expo-notifications"
import { useTranslation } from "./LanguageContext"
import { Alert } from "react-native"

type TaskContextType = {
    tasks: Task[]
    addTask: (
        title: string,
        category?: string,
        reminderDate?: string
    ) => Promise<void>
    toggleTask: (id: string) => void
    deleteTask: (id: string) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([])
    const { t } = useTranslation()

    useEffect(() => {
        loadTasks().then(setTasks)
    }, [])

    useEffect(() => {
        saveTasks(tasks)
    }, [tasks])

    const addTask = async (
        title: string,
        category?: string,
        reminderDate?: string
    ) => {
        const newTask: Task = {
            id: uuidv4(),
            title,
            completed: false,
            createdAt: new Date().toISOString(),
            category,
            reminderDate,
        }

        setTasks(prev => [newTask, ...prev])

        if (reminderDate) {
            const granted = await ensureNotificationPermission()

            if (!granted) {
                Alert.alert(
                    t("notifications.permission.deniedTitle"),
                    t("notifications.permission.deniedMessage")
                )
                return
            }

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: t("notifications.taskReminder.title"),
                    body: title,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: new Date(reminderDate),
                },
            })
        }
    }

    const toggleTask = (id: string) => {
        setTasks(prev =>
            prev.map(task => {
                if (task.id === id) {
                    // Eğer tamamlanıyorsa ve hatırlatıcı varsa → bildirimleri iptal et
                    if (!task.completed && task.reminderDate) {
                        Notifications.cancelAllScheduledNotificationsAsync()
                    }

                    return {
                        ...task,
                        completed: !task.completed,
                        completedAt: !task.completed
                            ? new Date().toISOString()
                            : undefined,
                    }
                }
                return task
            })
        )
    }

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id))
    }

    return (
        <TaskContext.Provider value={{ tasks, addTask, toggleTask, deleteTask }}>
            {children}
        </TaskContext.Provider>
    )
}

const ensureNotificationPermission = async () => {
    const current = await Notifications.getPermissionsAsync()
    if (current.status === "granted") return true

    const requested = await Notifications.requestPermissionsAsync()
    return requested.status === "granted"
}

export const useTasks = () => {
    const ctx = useContext(TaskContext)
    if (!ctx) throw new Error("useTasks must be used within TaskProvider")
    return ctx
}
