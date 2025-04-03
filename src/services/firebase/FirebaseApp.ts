import { initializeApp } from 'firebase/app'
import FirebaseConfig from '@/configs/firebase.config'

const FirebaseApp = initializeApp(FirebaseConfig)

export default FirebaseApp