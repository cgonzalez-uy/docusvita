import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import FirebaseApp from './FirebaseApp'
import { getAuth } from 'firebase/auth'
import type { GetSettingsNotificationResponse, GetSettingsProfileResponse } from '@/views/concepts/accounts/Settings/types'

// Inicializar Firestore
const db = getFirestore(FirebaseApp)
const auth = getAuth(FirebaseApp)

// Función para obtener el ID del usuario actual
const getCurrentUserId = () => {
    const user = auth.currentUser
    if (!user) {
        throw new Error('No hay usuario autenticado')
    }
    return user.uid
}

// Guardar configuración de notificaciones
export const saveSettingsNotification = async (data: GetSettingsNotificationResponse) => {
    try {
        const userId = getCurrentUserId()
        const userDocRef = doc(db, 'users', userId)
        
        // Verificar si el documento del usuario existe
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
            // Actualizar el documento existente
            await updateDoc(userDocRef, {
                notifications: data
            })
        } else {
            // Crear un nuevo documento
            await setDoc(userDocRef, {
                notifications: data
            })
        }
        
        return true
    } catch (error) {
        console.error('Error al guardar configuración de notificaciones:', error)
        throw error
    }
}

// Obtener configuración de notificaciones
export const getSettingsNotification = async (): Promise<GetSettingsNotificationResponse> => {
    try {
        const userId = getCurrentUserId()
        const userDocRef = doc(db, 'users', userId)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists() && userDoc.data().notifications) {
            return userDoc.data().notifications as GetSettingsNotificationResponse
        }
        
        // Retornar valores por defecto si no existe
        return {
            email: [],
            desktop: false,
            unreadMessageBadge: false,
            notifymeAbout: ''
        }
    } catch (error) {
        console.error('Error al obtener configuración de notificaciones:', error)
        // Retornar valores por defecto en caso de error
        return {
            email: [],
            desktop: false,
            unreadMessageBadge: false,
            notifymeAbout: ''
        }
    }
}

// Guardar perfil de usuario
export const saveSettingsProfile = async (data: GetSettingsProfileResponse) => {
    try {
        const userId = getCurrentUserId()
        const userDocRef = doc(db, 'users', userId)
        
        // Verificar si el documento del usuario existe
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
            // Actualizar el documento existente
            await updateDoc(userDocRef, {
                profile: data
            })
        } else {
            // Crear un nuevo documento
            await setDoc(userDocRef, {
                profile: data
            })
        }
        
        return true
    } catch (error) {
        console.error('Error al guardar perfil de usuario:', error)
        throw error
    }
}

// Obtener perfil de usuario
export const getSettingsProfile = async (): Promise<GetSettingsProfileResponse | null> => {
    try {
        const userId = getCurrentUserId()
        const userDocRef = doc(db, 'users', userId)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists() && userDoc.data().profile) {
            return userDoc.data().profile as GetSettingsProfileResponse
        }
        
        return null
    } catch (error) {
        console.error('Error al obtener perfil de usuario:', error)
        return null
    }
}

// Tipos para la configuración de seguridad
type SecuritySettings = {
    twoFactorEnabled: boolean
    twoFactorType: string
}

// Guardar configuración de seguridad
export const saveSettingsSecurity = async (data: SecuritySettings) => {
    try {
        const userId = getCurrentUserId()
        const userDocRef = doc(db, 'users', userId)
        
        // Verificar si el documento del usuario existe
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
            // Actualizar el documento existente
            await updateDoc(userDocRef, {
                security: data
            })
        } else {
            // Crear un nuevo documento
            await setDoc(userDocRef, {
                security: data
            })
        }
        
        return true
    } catch (error) {
        console.error('Error al guardar configuración de seguridad:', error)
        throw error
    }
}

// Obtener configuración de seguridad
export const getSettingsSecurity = async (): Promise<SecuritySettings> => {
    try {
        const userId = getCurrentUserId()
        const userDocRef = doc(db, 'users', userId)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists() && userDoc.data().security) {
            return userDoc.data().security as SecuritySettings
        }
        
        // Retornar valores por defecto si no existe
        return {
            twoFactorEnabled: false,
            twoFactorType: 'googleAuthenticator'
        }
    } catch (error) {
        console.error('Error al obtener configuración de seguridad:', error)
        // Retornar valores por defecto en caso de error
        return {
            twoFactorEnabled: false,
            twoFactorType: 'googleAuthenticator'
        }
    }
}