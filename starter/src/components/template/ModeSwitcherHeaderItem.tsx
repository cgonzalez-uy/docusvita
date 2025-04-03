import ModeSwitcher from './ThemeConfigurator/ModeSwitcher'
import withHeaderItem from '@/utils/hoc/withHeaderItem'

const _ModeSwitcherHeaderItem = () => {
    return (
        <div className="flex items-center">
            <ModeSwitcher />
        </div>
    )
}

const ModeSwitcherHeaderItem = withHeaderItem(_ModeSwitcherHeaderItem)

export default ModeSwitcherHeaderItem