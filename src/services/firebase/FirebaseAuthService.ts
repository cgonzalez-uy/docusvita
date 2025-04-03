import { firebaseSignIn, firebaseSignUp, firebaseForgotPassword, firebaseResetPassword, firebaseSignOut } from './FirebaseAuth'
import type { SignInCredential, SignUpCredential, ForgotPassword, ResetPassword, SignInResponse, SignUpResponse } from '@/@types/auth'

export async function apiSignInWithFirebase(data: SignInCredential) {
    try {
        const response = await firebaseSignIn(data)
        return response
    } catch (error: any) {
        const errorMessage = error.message || 'Error al iniciar sesión'
        throw errorMessage
    }
}

export async function apiSignUpWithFirebase(data: SignUpCredential) {
    try {
        const response = await firebaseSignUp(data)
        return response
    } catch (error: any) {
        const errorMessage = error.message || 'Error al registrarse'
        throw errorMessage
    }
}

export async function apiForgotPasswordWithFirebase<T>(data: ForgotPassword) {
    try {
        await firebaseForgotPassword(data.email)
        return true as T
    } catch (error: any) {
        const errorMessage = error.message || 'Error al enviar el correo de recuperación'
        throw errorMessage
    }
}

export async function apiResetPasswordWithFirebase<T>(data: ResetPassword, oobCode: string) {
    try {
        await firebaseResetPassword(oobCode, data.password)
        return true as T
    } catch (error: any) {
        const errorMessage = error.message || 'Error al restablecer la contraseña'
        throw errorMessage
    }
}

export async function apiSignOutWithFirebase() {
    try {
        await firebaseSignOut()
        return true
    } catch (error: any) {
        const errorMessage = error.message || 'Error al cerrar sesión'
        throw errorMessage
    }
}