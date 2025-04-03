import { useMemo, useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Upload from '@/components/ui/Upload'
import Input from '@/components/ui/Input'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import { Form, FormItem } from '@/components/ui/Form'
import NumericInput from '@/components/shared/NumericInput'
import { countryList } from '@/constants/countries.constant'
import { components } from 'react-select'
import type { ControlProps, OptionProps } from 'react-select'
import { apiGetSettingsProfile } from '@/services/AccountsService'
import { getSettingsProfile, saveSettingsProfile } from '@/services/firebase/FirestoreService'
import sleep from '@/utils/sleep'
import { toast } from '@/components/ui/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { HiOutlineUser } from 'react-icons/hi'
import { TbPlus } from 'react-icons/tb'
import type { ZodType } from 'zod'
import type { GetSettingsProfileResponse } from '../types'

type ProfileSchema = {
    firstName: string
    lastName: string
    email: string
    dialCode: string
    phoneNumber: string
    img: string
    country: string
    address: string
    postcode: string
    city: string
}

type CountryOption = {
    label: string
    dialCode: string
    value: string
}

const { Control } = components

const validationSchema: ZodType<ProfileSchema> = z.object({
    firstName: z.string().min(1, { message: 'Nombre requerido' }),
    lastName: z.string().min(1, { message: 'Apellido requerido' }),
    email: z
        .string()
        .min(1, { message: 'Email requerido' })
        .email({ message: 'Email inválido' }),
    dialCode: z.string().min(1, { message: 'Por favor seleccione su código de país' }),
    phoneNumber: z
        .string()
        .min(1, { message: 'Por favor ingrese su número de teléfono' }),
    country: z.string().min(1, { message: 'Por favor seleccione un país' }),
    address: z.string().min(1, { message: 'Dirección requerida' }),
    postcode: z.string().min(1, { message: 'Código postal requerido' }),
    city: z.string().min(1, { message: 'Ciudad requerida' }),
    img: z.string(),
})

const CustomSelectOption = (
    props: OptionProps<CountryOption> & { variant: 'country' | 'phone' },
) => {
    return (
        <DefaultOption<CountryOption>
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    <Avatar
                        shape="circle"
                        size={20}
                        src={`/img/countries/${data.value}.png`}
                    />
                    {props.variant === 'country' && <span>{label}</span>}
                    {props.variant === 'phone' && <span>{data.dialCode}</span>}
                </span>
            )}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<CountryOption>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Avatar
                    className="ltr:ml-4 rtl:mr-4"
                    shape="circle"
                    size={20}
                    src={`/img/countries/${selected.value}.png`}
                />
            )}
            {children}
        </Control>
    )
}

const SettingsProfile = () => {
    const [loading, setLoading] = useState(false)
    const [profileData, setProfileData] = useState<GetSettingsProfileResponse | null>(null)

    const dialCodeList = useMemo(() => {
        const newCountryList: Array<CountryOption> = JSON.parse(
            JSON.stringify(countryList),
        )

        return newCountryList.map((country) => {
            country.label = country.dialCode
            return country
        })
    }, [])

    const beforeUpload = (files: FileList | null) => {
        let valid: string | boolean = true

        const allowedFileType = ['image/jpeg', 'image/png']
        if (files) {
            for (const file of files) {
                if (!allowedFileType.includes(file.type)) {
                    valid = '¡Por favor suba un archivo .jpeg o .png!'
                }
            }
        }

        return valid
    }

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
    } = useForm<ProfileSchema>({
        resolver: zodResolver(validationSchema),
    })

    // Cargar datos de Firestore al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const profile = await getSettingsProfile()
                if (profile) {
                    setProfileData(profile)
                    reset(profile)
                }
            } catch (error) {
                console.error('Error al cargar perfil:', error)
                toast.push({
                    title: 'Error',
                    type: 'danger',
                    message: 'No se pudo cargar la información del perfil',
                })
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const onSubmit = async (values: ProfileSchema) => {
        try {
            setLoading(true)
            
            // Validar el formulario completo con Zod
            const validationResult = validationSchema.safeParse(values)
            if (!validationResult.success) {
                const errorMessages = validationResult.error.issues
                    .map(issue => `${issue.path.join('.')}: ${issue.message}`)
                    .join('\n')
                throw new Error(`Errores de validación:\n${errorMessages}`)
            }
            
            // Validar el formulario antes de enviar
            const isValid = await validationSchema.safeParseAsync(values)
            if (!isValid.success) {
                throw new Error('Por favor complete todos los campos correctamente')
            }
            
            // Preparar datos completos para Firestore
            const completeProfileData: GetSettingsProfileResponse = {
                ...(profileData || {}),
                id: profileData?.id || '',
                name: `${values.firstName} ${values.lastName}`,
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                dialCode: values.dialCode,
                phoneNumber: values.phoneNumber,
                img: values.img,
                country: values.country,
                address: values.address,
                postcode: values.postcode,
                city: values.city,
                location: profileData?.location || '',
                birthday: profileData?.birthday || ''
            }
            
            // Mostrar mensaje de guardando
            toast.push({
                title: 'Guardando',
                type: 'info',
                message: 'Guardando los cambios del perfil...',
                duration: 3000
            })
            
            // Guardar en Firestore con timeout
            await Promise.race([
                saveSettingsProfile(completeProfileData),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout al guardar en Firestore')), 5000))
            ])
            
            setProfileData(completeProfileData)
            toast.push({
                title: 'Éxito',
                type: 'success',
                message: 'Perfil actualizado correctamente',
                duration: 5000
            })
        } catch (error) {
            console.error('Error al guardar perfil:', error)
            let errorMessage = 'No se pudo guardar la información del perfil'
            
            if (error instanceof Error) {
                errorMessage = error.message
            } else if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = error.message as string
            }
            
            toast.push({
                title: 'Error',
                type: 'danger',
                message: errorMessage,
                duration: 10000
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <h4 className="mb-8">Información personal</h4>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-8">
                    <Controller
                        name="img"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center gap-4">
                                <Avatar
                                    size={90}
                                    className="border-4 border-white bg-gray-100 text-gray-300 shadow-lg"
                                    icon={<HiOutlineUser />}
                                    src={field.value}
                                />
                                <div className="flex items-center gap-2">
                                    <Upload
                                        showList={false}
                                        uploadLimit={1}
                                        beforeUpload={beforeUpload}
                                        onChange={(files) => {
                                            if (files.length > 0) {
                                                field.onChange(
                                                    URL.createObjectURL(
                                                        files[0],
                                                    ),
                                                )
                                            }
                                        }}
                                    >
                                        <Button
                                            variant="solid"
                                            size="sm"
                                            type="button"
                                            icon={<TbPlus />}
                                        >
                                            Subir imagen
                                        </Button>
                                    </Upload>
                                    <Button
                                        size="sm"
                                        type="button"
                                        variant="plain"
                                        onClick={() => field.onChange('')}
                                    >
                                        Eliminar
                                    </Button>
                                    <Button
                                        block
                                        variant="solid"
                                        type="submit"
                                        loading={isSubmitting || loading}
                                        className="mt-8"
                                    >
                                        Guardar cambios
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FormItem
                        label="Nombre"
                        invalid={Boolean(errors.firstName)}
                        errorMessage={errors.firstName?.message}
                    >
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                        />
                    </FormItem>
                </div>
            </Form>
        </>
            <FormItem
                label="Apellido"
                invalid={Boolean(errors.lastName)}
                errorMessage={errors.lastName?.message}
            >
                <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                />
            </FormItem>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FormItem
                        label="Nombre"
                        invalid={Boolean(errors.firstName)}
                        errorMessage={errors.firstName?.message}
                    >
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                        />
                    </FormItem>
                </div>
            </Form>
        </>
                <FormItem
                        label="Apellido"
                        invalid={Boolean(errors.lastName)}
                        errorMessage={errors.lastName?.message}
                    >
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                        />
                    </FormItem>
                    <FormItem
                        label="Email"
                        invalid={Boolean(errors.email)}
                        errorMessage={errors.email?.message}
                    >
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                        />
                    </FormItem>
                    <FormItem
                        label="Número de teléfono"
                        invalid={
                            Boolean(errors.dialCode) ||
                            Boolean(errors.phoneNumber)
                        }
                        errorMessage={
                            errors.dialCode?.message ||
                            errors.phoneNumber?.message
                        }
                    >
                        <div className="flex gap-4">
                            <div style={{ minWidth: 120 }}>
                                <Controller
                                    name="dialCode"
                                    control={control}
                                    render={({ field }) => (
                                        <Select<CountryOption>
                                            value={dialCodeList.filter(
                                                (c) =>
                                                    c.dialCode === field.value,
                                            )}
                                            options={dialCodeList}
                                            onChange={(option) => {
                                                field.onChange(
                                                    option?.dialCode,
                                                )
                                            }}
                                            components={{
                                                Option: (props) => (
                                                    <CustomSelectOption
                                                        {...props}
                                                        variant="phone"
                                                    />
                                                ),
                                                Control: CustomControl,
                                            }}
                                        />
                                    )}
                                />
                            </div>
                            <div className="w-full">
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericInput
                                            placeholder="Número de teléfono"
                                            {...field}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </FormItem>
                </div>
            </Form>
        </>
                <div className="mt-6 mb-6">
                    <h4>Dirección</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FormItem
                        label="País"
                        invalid={Boolean(errors.country)}
                        errorMessage={errors.country?.message}
                    >
                        <Controller
                            name="country"
                            control={control}
                            render={({ field }) => (
                                <Select<CountryOption>
                                    value={countryList.filter(
                                        (c) => c.value === field.value,
                                    )}
                                    options={countryList}
                                    onChange={(option) => {
                                        field.onChange(option?.value)
                                    }}
                                    components={{
                                        Option: (props) => (
                                            <CustomSelectOption
                                                {...props}
                                                variant="country"
                                            />
                                        ),
                                        Control: CustomControl,
                                    }}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Ciudad"
                        invalid={Boolean(errors.city)}
                        errorMessage={errors.city?.message}
                    >
                        <Controller
                            name="city"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                        />
                    </FormItem>
                    <FormItem
                        label="Dirección"
                        invalid={Boolean(errors.address)}
                        errorMessage={errors.address?.message}
                    >
                        <Controller
                            name="address"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                        />
                    </FormItem>
                    <FormItem
                        label="Código postal"
                        invalid={Boolean(errors.postcode)}
                        errorMessage={errors.postcode?.message}
                    >
                        <Controller
                            name="postcode"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                        />
                    </FormItem>
                </div>
            </Form>
        </>
                <div className="flex justify-end mt-6">
                    <Button 
                        loading={loading || isSubmitting} 
                        variant="solid" 
                        type="submit"
                        disabled={loading || isSubmitting}
                    >
                        {loading ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </div>
            </Form>
        </>
    )
}

export default SettingsProfile