import { useState, useRef, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Form, FormItem } from '@/components/ui/Form'
import classNames from '@/utils/classNames'
import sleep from '@/utils/sleep'
import isLastChild from '@/utils/isLastChild'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import { getSettingsSecurity, saveSettingsSecurity } from '@/services/firebase/FirestoreService'
import { toast } from '@/components/ui/toast'
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'

type PasswordSchema = {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

const authenticatorList = [
    {
        label: 'Google Authenticator',
        value: 'googleAuthenticator',
        img: '/img/others/google.png',
        desc: 'Utiliza la aplicación Google Authenticator para generar códigos de seguridad temporales para inicios de sesión seguros.',
    },
]

const validationSchema: ZodType<PasswordSchema> = z
    .object({
        currentPassword: z
            .string()
            .min(1, { message: '¡Por favor ingresa tu contraseña actual!' }),
        newPassword: z
            .string()
            .min(1, { message: '¡Por favor ingresa tu nueva contraseña!' }),
        confirmNewPassword: z
            .string()
            .min(1, { message: '¡Por favor confirma tu nueva contraseña!' }),
    })
    .refine((data) => data.confirmNewPassword === data.newPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmNewPassword'],
    })

const SettingsSecurity = () => {
    const [selected2FaType, setSelected2FaType] = useState(
        'googleAuthenticator',
    )
    const [confirmationOpen, setConfirmationOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(false)

    const formRef = useRef<HTMLFormElement>(null)

    const {
        getValues,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<PasswordSchema>({
        resolver: zodResolver(validationSchema),
    })

    // Cargar datos de Firestore al montar el componente
    useEffect(() => {
        const fetchSecuritySettings = async () => {
            try {
                setLoading(true)
                const securitySettings = await getSettingsSecurity()
                if (securitySettings) {
                    setSelected2FaType(securitySettings.twoFactorType)
                }
            } catch (error) {
                console.error('Error al cargar configuración de seguridad:', error)
                toast.push({
                    title: 'Error',
                    type: 'danger',
                    message: 'No se pudo cargar la configuración de seguridad',
                })
            } finally {
                setLoading(false)
            }
        }

        fetchSecuritySettings()
    }, [])

    // Guardar configuración de 2FA en Firestore
    const save2FASettings = async (type: string) => {
        try {
            setLoading(true)
            await saveSettingsSecurity({
                twoFactorEnabled: true,
                twoFactorType: type
            })
            setSelected2FaType(type)
            toast.push({
                title: 'Éxito',
                type: 'success',
                message: 'Configuración de verificación en dos pasos actualizada',
            })
        } catch (error) {
            console.error('Error al guardar configuración de 2FA:', error)
            toast.push({
                title: 'Error',
                type: 'danger',
                message: 'No se pudo guardar la configuración de verificación en dos pasos',
            })
        } finally {
            setLoading(false)
        }
    }

    const handlePostSubmit = async () => {
        setIsSubmitting(true)
        try {
            const values = getValues()
            const auth = getAuth()
            const user = auth.currentUser
            
            if (!user || !user.email) {
                throw new Error('No hay usuario autenticado')
            }
            
            // Primero reautenticamos al usuario para operaciones sensibles
            const credential = EmailAuthProvider.credential(
                user.email,
                values.currentPassword
            )
            
            // Reautenticar al usuario
            await reauthenticateWithCredential(user, credential)
            
            // Actualizar la contraseña
            await updatePassword(user, values.newPassword)
            
            toast.push({
                title: 'Éxito',
                type: 'success',
                message: 'Contraseña actualizada correctamente',
            })
        } catch (error: any) {
            console.error('Error al actualizar contraseña:', error)
            
            // Mensajes de error específicos
            let errorMessage = 'No se pudo actualizar la contraseña'
            
            if (error.code === 'auth/wrong-password') {
                errorMessage = 'La contraseña actual es incorrecta'
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'La nueva contraseña es demasiado débil'
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'Por seguridad, debes volver a iniciar sesión antes de cambiar tu contraseña'
            }
            
            toast.push({
                title: 'Error',
                type: 'danger',
                message: errorMessage,
            })
        } finally {
            setConfirmationOpen(false)
            setIsSubmitting(false)
        }
    }

    const onSubmit = async () => {
        setConfirmationOpen(true)
    }

    return (
        <div>
            <div className="mb-8">
                <h4>Contraseña</h4>
                <p>
                    Recuerda, tu contraseña es tu llave digital para tu cuenta.
                    ¡Mantenla segura!
                </p>
            </div>
            <Form
                ref={formRef}
                className="mb-8"
                onSubmit={handleSubmit(onSubmit)}
            >
                <FormItem
                    label="Contraseña actual"
                    invalid={Boolean(errors.currentPassword)}
                    errorMessage={errors.currentPassword?.message}
                >
                    <Controller
                        name="currentPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Nueva contraseña"
                    invalid={Boolean(errors.newPassword)}
                    errorMessage={errors.newPassword?.message}
                >
                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Confirmar nueva contraseña"
                    invalid={Boolean(errors.confirmNewPassword)}
                    errorMessage={errors.confirmNewPassword?.message}
                >
                    <Controller
                        name="confirmNewPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="flex justify-end">
                    <Button variant="solid" type="submit">
                        Actualizar
                    </Button>
                </div>
            </Form>
            <ConfirmDialog
                isOpen={confirmationOpen}
                type="warning"
                title="Actualizar contraseña"
                confirmButtonProps={{
                    loading: isSubmitting,
                    onClick: handlePostSubmit,
                }}
                onClose={() => setConfirmationOpen(false)}
                onRequestClose={() => setConfirmationOpen(false)}
                onCancel={() => setConfirmationOpen(false)}
            >
                <p>¿Estás seguro de que quieres cambiar tu contraseña?</p>
            </ConfirmDialog>
            <div className="mb-8">
                <h4>Verificación en dos pasos</h4>
                <p>
                    Tu cuenta tiene un gran valor para los hackers. Habilita la verificación
                    en dos pasos para proteger tu cuenta.
                </p>
                <div className="mt-8">
                    {authenticatorList.map((authOption, index) => (
                        <div
                            key={authOption.value}
                            className={classNames(
                                'py-6 border-gray-200 dark:border-gray-600',
                                !isLastChild(authenticatorList, index) &&
                                    'border-b',
                            )}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        size={35}
                                        className="bg-transparent"
                                        src={authOption.img}
                                    />
                                    <div>
                                        <h6>{authOption.label}</h6>
                                        <p>{authOption.desc}</p>
                                    </div>
                                </div>
                                <Button
                                    variant={
                                        selected2FaType === authOption.value
                                            ? 'solid'
                                            : 'twoTone'
                                    }
                                    onClick={() => save2FASettings(authOption.value)}
                                    loading={loading && selected2FaType !== authOption.value}
                                >
                                    {selected2FaType === authOption.value
                                        ? 'Habilitado'
                                        : 'Habilitar'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SettingsSecurity