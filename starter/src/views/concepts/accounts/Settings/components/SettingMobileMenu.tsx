import Select from '@/components/ui/Select'
import { useSettingsStore } from '../store/settingsStore'
import {
    TbUserSquare,
    TbLock,
    TbBell,
} from 'react-icons/tb'
import type { View } from '../types'

type Option = {
    value: View
    label: string
}

const options: Option[] = [
    { value: 'profile', label: 'Perfil' },
    { value: 'security', label: 'Seguridad' },
    { value: 'notification', label: 'Notificaciones' },
]

const getIcon = (icon: string) => {
    switch (icon) {
        case 'profile':
            return <TbUserSquare className="text-xl" />
        case 'security':
            return <TbLock className="text-xl" />
        case 'notification':
            return <TbBell className="text-xl" />
        default:
            return <TbUserSquare className="text-xl" />
    }
}

const SettingMobileMenu = () => {
    const { currentView, setCurrentView } = useSettingsStore()

    const onViewChange = (selected: Option) => {
        setCurrentView(selected.value)
    }

    return (
        <Select<Option>
            options={options}
            value={options.filter((option) => option.value === currentView)}
            onChange={(selected) => onViewChange(selected as Option)}
            className="mb-4"
            customOptions={{
                render: (option) => (
                    <div className="flex items-center gap-2">
                        {getIcon(option.value)}
                        <span>{option.label}</span>
                    </div>
                ),
            }}
        />
    )
}

export default SettingMobileMenu