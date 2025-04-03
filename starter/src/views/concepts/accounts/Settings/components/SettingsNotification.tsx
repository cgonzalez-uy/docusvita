import Checkbox from '@/components/ui/Checkbox'
import Radio from '@/components/ui/Radio'
import Switcher from '@/components/ui/Switcher'
import { getSettingsNotification, saveSettingsNotification } from '@/services/firebase/FirestoreService'
import { useEffect, useState } from 'react'
import { toast } from '@/components/ui/toast'
import { TbMessageCircleCheck } from 'react-icons/tb'
import Button from '@/components/ui/Button'
import type { GetSettingsNotificationResponse } from '../types'

type EmailNotificationFields =
    | 'newsAndUpdate'
    | 'tipsAndTutorial'
    | 'offerAndPromotion'
    | 'followUpReminder'

const emailNotificationOption: {
    label: string
    value: EmailNotificationFields
    desc: string
}[] = [
    {
        label: 'Noticias y actualizaciones',
        value: 'newsAndUpdate',
        desc: 'Novedades sobre productos y actualizaciones de funciones',
    },
    {
        label: 'Consejos y tutoriales',
        value: 'tipsAndTutorial',
        desc: 'Consejos y trucos para aumentar tu eficiencia y rendimiento',
    },
    {
        label: 'Ofertas y promociones',
        value: 'offerAndPromotion',
        desc: 'Promociones sobre precios de productos y últimos descuentos',
    },
    {
        label: 'Recordatorios de seguimiento',
        value: 'followUpReminder',
        desc: 'Recibe notificaciones de todos los recordatorios que se han creado',
    },
]

const notifyMeOption: {
    label: string
    value: string
    desc: string
}[] = [
    {
        label: 'Todos los mensajes nuevos',
        value: 'allNewMessage',
        desc: 'Enviar notificaciones al canal para cada mensaje nuevo',
    },
    {
        label: 'Solo menciones',
        value: 'mentionsOnly',
        desc: 'Solo alertarme en el canal si alguien me menciona en un mensaje',
    },
    {
        label: 'Nada',
        value: 'nothing',
        desc: `No notificarme nada`,
    },
]

const SettingsNotification = () => {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [data, setData] = useState<GetSettingsNotificationResponse>({
        email: [],
        desktop: false,
        unreadMessageBadge: false,
        notifymeAbout: '',
    })

    // Cargar datos de Firestore al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const notificationSettings = await getSettingsNotification()
                if (notificationSettings) {
                    setData(notificationSettings)
                }
            } catch (error) {
                console.error('Error al cargar configuraciones:', error)
                toast.push({
                    title: 'Error',
                    type: 'danger',
                    message: 'No se pudieron cargar las configuraciones de notificación',
                })
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Guardar cambios en Firestore
    const saveChanges = async () => {
        try {
            setSaving(true)
            await saveSettingsNotification(data)
            toast.push({
                title: 'Éxito',
                type: 'success',
                message: 'Configuraciones de notificación guardadas correctamente',
            })
        } catch (error) {
            console.error('Error al guardar configuraciones:', error)
            toast.push({
                title: 'Error',
                type: 'danger',
                message: 'No se pudieron guardar las configuraciones de notificación',
            })
        } finally {
            setSaving(false)
        }
    }

    const handleEmailNotificationOptionChange = (values: string[]) => {
        setData(prev => ({
            ...prev,
            email: values
        }))
    }

    const handleEmailNotificationOptionCheckAll = (value: boolean) => {
        if (value) {
            setData(prev => ({
                ...prev,
                email: [
                    'newsAndUpdate',
                    'tipsAndTutorial',
                    'offerAndPromotion',
                    'followUpReminder',
                ]
            }))
        } else {
            setData(prev => ({
                ...prev,
                email: []
            }))
        }
    }

    const handleDesktopNotificationCheck = (value: boolean) => {
        setData(prev => ({
            ...prev,
            desktop: value
        }))
    }

    const handleUnreadMessagebadgeCheck = (value: boolean) => {
        setData(prev => ({
            ...prev,
            unreadMessageBadge: value
        }))
    }

    const handleNotifyMeChange = (value: string) => {
        setData(prev => ({
            ...prev,
            notifymeAbout: value
        }))
    }

    if (loading) {
        return <div>Cargando configuraciones...</div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4>Notificaciones</h4>
                <Button
                    variant="solid"
                    color="primary"
                    onClick={saveChanges}
                    loading={saving}
                >
                    Guardar cambios
                </Button>
            </div>
            <div className="mt-2">
                <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <h5>Habilitar notificaciones de escritorio</h5>
                        <p>
                            Decide si quieres recibir notificaciones de nuevos
                            mensajes y actualizaciones
                        </p>
                    </div>
                    <div>
                        <Switcher
                            checked={data.desktop}
                            onChange={handleDesktopNotificationCheck}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <h5>Habilitar insignia de notificaciones no leídas</h5>
                        <p>
                            Muestra un indicador rojo en el icono de notificaciones
                            cuando tienes mensajes no leídos
                        </p>
                    </div>
                    <div>
                        <Switcher
                            checked={data.unreadMessageBadge}
                            onChange={handleUnreadMessagebadgeCheck}
                        />
                    </div>
                </div>
                <div className="py-6 border-b border-gray-200 dark:border-gray-600">
                    <h5>Notificarme sobre</h5>
                    <div className="mt-4">
                        <Radio.Group
                            vertical
                            className="flex flex-col gap-6"
                            value={data.notifymeAbout}
                            onChange={handleNotifyMeChange}
                        >
                            {notifyMeOption.map((option) => (
                                <div key={option.value} className="flex gap-4">
                                    <div className="mt-1.5">
                                        <Radio value={option.value} />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="mt-1">
                                            <TbMessageCircleCheck className="text-lg" />
                                        </div>
                                        <div>
                                            <h6>{option.label}</h6>
                                            <p>{option.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Radio.Group>
                    </div>
                </div>
                <div className="flex items-center justify-between py-6">
                    <div>
                        <h5>Notificaciones por email</h5>
                        <p>
                            La aplicación puede enviarte notificaciones por email para
                            cualquier mensaje directo nuevo
                        </p>
                    </div>
                    <div>
                        <Switcher
                            checked={data.email.length > 0}
                            onChange={handleEmailNotificationOptionCheckAll}
                        />
                    </div>
                </div>
                {data.email.length > 0 && (
                    <div className="mt-4">
                        <Checkbox.Group
                            vertical
                            className="flex flex-col gap-6"
                            value={data.email}
                            onChange={handleEmailNotificationOptionChange}
                        >
                            {emailNotificationOption.map((option) => (
                                <Checkbox
                                    key={option.value}
                                    className="flex gap-2"
                                    value={option.value}
                                >
                                    <div>
                                        <h6>{option.label}</h6>
                                        <p>{option.desc}</p>
                                    </div>
                                </Checkbox>
                            ))}
                        </Checkbox.Group>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SettingsNotification