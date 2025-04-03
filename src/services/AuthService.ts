import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import { apiSignInWithFirebase, apiSignUpWithFirebase, apiForgotPasswordWithFirebase, apiResetPasswordWithFirebase, apiSignOutWithFirebase } from './firebase/FirebaseAuthService'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    SignUpResponse,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential) {
    try {
        // Intenta usar Firebase primero
        return await apiSignInWithFirebase(data)
    } catch (error) {
        // Si falla, usa el método API como respaldo
        return ApiService.fetchDataWithAxios<SignInResponse>({
            url: endpointConfig.signIn,
            method: 'post',
            data,
        })
    }
}

export async function apiSignUp(data: SignUpCredential) {
    try {
        // Intenta usar Firebase primero
        return await apiSignUpWithFirebase(data)
    } catch (error) {
        // Si falla, usa el método API como respaldo
        return ApiService.fetchDataWithAxios<SignUpResponse>({
            url: endpointConfig.signUp,
            method: 'post',
            data,
        })
    }
}

export async function apiSignOut() {
    try {
        // Intenta usar Firebase primero
        await apiSignOutWithFirebase()
        return true
    } catch (error) {
        // Si falla, usa el método API como respaldo
        return ApiService.fetchDataWithAxios({
            url: endpointConfig.signOut,
            method: 'post',
        })
    }
}

export async function apiForgotPassword<T>(data: ForgotPassword) {
    try {
        // Intenta usar Firebase primero
        return await apiForgotPasswordWithFirebase<T>(data)
    } catch (error) {
        // Si falla, usa el método API como respaldo
        return ApiService.fetchDataWithAxios<T>({
            url: endpointConfig.forgotPassword,
            method: 'post',
            data,
        })
    }
}

export async function apiResetPassword<T>(data: ResetPassword, oobCode?: string) {
    try {
        // Intenta usar Firebase primero si se proporciona el código oob
        if (oobCode) {
            return await apiResetPasswordWithFirebase<T>(data, oobCode)
        }
        // Si no hay código oob, usa el método API
        return ApiService.fetchDataWithAxios<T>({
            url: endpointConfig.resetPassword,
            method: 'post',
            data,
        })
    } catch (error) {
        // Si falla, usa el método API como respaldo
        return ApiService.fetchDataWithAxios<T>({
            url: endpointConfig.resetPassword,
            method: 'post',
            data,
        })
    }
}
