import Alert from '@/components/ui/Alert'
import OtpVerificationForm from './components/OtpVerificationForm'
import sleep from '@/utils/sleep'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'

export const OtpVerificationBase = () => {
    const [otpVerified, setOtpVerified] = useTimeOutMessage()
    const [otpResend, setOtpResend] = useTimeOutMessage()
    const [message, setMessage] = useTimeOutMessage()

    const handleResendOtp = async () => {
        try {
            /** simulate api call with sleep */
            await sleep(500)
            setOtpResend('Te hemos enviado un código de verificación.')
        } catch (errors) {
            setMessage?.(
                typeof errors === 'string' ? errors : '¡Ha ocurrido un error!',
            )
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h3 className="mb-2">Verificación de código</h3>
                <p className="font-semibold heading-text">
                    Hemos enviado un código de verificación a tu correo electrónico.
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            {otpResend && (
                <Alert showIcon className="mb-4" type="info">
                    <span className="break-all">{otpResend}</span>
                </Alert>
            )}
            {otpVerified && (
                <Alert showIcon className="mb-4" type="success">
                    <span className="break-all">{otpVerified}</span>
                </Alert>
            )}
            <OtpVerificationForm
                setMessage={setMessage}
                setOtpVerified={setOtpVerified}
            />
            <div className="mt-4 text-center">
                <span className="font-semibold">¿No recibiste el código? </span>
                <button
                    className="heading-text font-bold underline"
                    onClick={handleResendOtp}
                >
                    Reenviar código
                </button>
            </div>
        </div>
    )
}

const OtpVerification = () => {
    return <OtpVerificationBase />
}

export default OtpVerification
