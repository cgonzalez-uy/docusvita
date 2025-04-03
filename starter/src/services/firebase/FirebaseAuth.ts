import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    confirmPasswordReset,
    signOut,
} from 'firebase/auth'
import FirebaseApp from './FirebaseApp'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'

const auth = getAuth(FirebaseApp)

export const firebaseSignIn = async (data: SignInCredential) => {
    return signInWithEmailAndPassword(auth, data.email, data.password)
        .then((userCredential) => {
            const user = userCredential.user
            return {
                user: {
                    userId: user.uid,
                    userName: user.displayName || user.email?.split('@')[0] || '',
                    authority: ['USER'],
                    avatar: user.photoURL || '',
                    email: user.email || '',
                },
                token: user.refreshToken,
            }
        })
}

export const firebaseSignUp = async (data: SignUpCredential) => {
    return createUserWithEmailAndPassword(auth, data.email, data.password)
        .then((userCredential) => {
            const user = userCredential.user
            return {
                user: {
                    userId: user.uid,
                    userName: data.userName || user.email?.split('@')[0] || '',
                    authority: ['USER'],
                    avatar: user.photoURL || '',
                    email: user.email || '',
                },
                token: user.refreshToken,
            }
        })
}

export const firebaseForgotPassword = async (email: string) => {
    return sendPasswordResetEmail(auth, email)
        .then(() => true)
}

export const firebaseResetPassword = async (oobCode: string, newPassword: string) => {
    return confirmPasswordReset(auth, oobCode, newPassword)
        .then(() => true)
}

export const firebaseSignOut = async () => {
    return signOut(auth)
        .then(() => true)
}

export default auth