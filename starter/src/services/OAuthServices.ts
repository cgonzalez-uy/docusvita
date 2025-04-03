import { GoogleAuthProvider, signInWithPopup, GithubAuthProvider } from 'firebase/auth'
import auth from './firebase/FirebaseAuth'
import type { SignInResponse } from '@/@types/auth'

type OAuthResponse = SignInResponse

export async function apiGoogleOauthSignIn(): Promise<OAuthResponse> {
    const provider = new GoogleAuthProvider()
    try {
        const result = await signInWithPopup(auth, provider)
        // El token de acceso de Google
        const credential = GoogleAuthProvider.credentialFromResult(result)
        const token = credential?.accessToken || result.user.refreshToken
        
        return {
            token,
            user: {
                userId: result.user.uid,
                userName: result.user.displayName || result.user.email?.split('@')[0] || '',
                authority: ['USER'],
                avatar: result.user.photoURL || '',
                email: result.user.email || '',
            }
        }
    } catch (error) {
        console.error('Error durante la autenticación con Google:', error)
        throw error
    }
}

export async function apiGithubOauthSignIn(): Promise<OAuthResponse> {
    const provider = new GithubAuthProvider()
    try {
        const result = await signInWithPopup(auth, provider)
        // El token de acceso de GitHub
        const credential = GithubAuthProvider.credentialFromResult(result)
        const token = credential?.accessToken || result.user.refreshToken
        
        return {
            token,
            user: {
                userId: result.user.uid,
                userName: result.user.displayName || result.user.email?.split('@')[0] || '',
                authority: ['USER'],
                avatar: result.user.photoURL || '',
                email: result.user.email || '',
            }
        }
    } catch (error) {
        console.error('Error durante la autenticación con GitHub:', error)
        throw error
    }
}
