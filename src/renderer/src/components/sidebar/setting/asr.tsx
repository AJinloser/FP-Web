import { Stack, Text, NumberInput } from '@chakra-ui/react'
import { Field } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { useEffect } from 'react'
import { settingStyles } from './setting-styles'
import { useASRSettings } from '@/hooks/use-asr-settings'

// Type definitions
interface ASRProps {
  onSave?: (callback: () => void) => () => void
  onCancel?: (callback: () => void) => () => void
}

interface NumberFieldProps {
  label: string
  value: number | string
  onChange: (value: string) => void
  min?: number
  max?: number
}

// Reusable components
const NumberField = ({ label, value, onChange, min, max }: NumberFieldProps): JSX.Element => (
  <Field
    {...settingStyles.live2d.field}
    label={<Text {...settingStyles.live2d.fieldLabel}>{label}</Text>}
  >
    <NumberInput.Root
      {...settingStyles.live2d.numberInput.root}
      value={value.toString()}
      onValueChange={(details) => onChange(details.value)}
      min={min}
      max={max}
    >
      <NumberInput.Input {...settingStyles.live2d.numberInput.input} />
      <NumberInput.Control>
        <NumberInput.IncrementTrigger />
        <NumberInput.DecrementTrigger />
      </NumberInput.Control>
    </NumberInput.Root>
  </Field>
)

// Main component
function ASR({ onSave, onCancel }: ASRProps): JSX.Element {
  const {
    localSettings,
    voiceInterruptionOn,
    setVoiceInterruptionOn,
    handleInputChange,
    handleSave,
    handleCancel
  } = useASRSettings()

  useEffect(() => {
    if (!onSave || !onCancel) return

    const cleanupSave = onSave(handleSave)
    const cleanupCancel = onCancel(handleCancel)

    return (): void => {
      cleanupSave?.()
      cleanupCancel?.()
    }
  }, [onSave, onCancel, handleSave, handleCancel])

  return (
    <Stack {...settingStyles.live2d.container}>
      <Field
        {...settingStyles.live2d.field}
        label={<Text {...settingStyles.live2d.fieldLabel}>Voice Interruption</Text>}
      >
        <Switch
          {...settingStyles.live2d.switch}
          checked={voiceInterruptionOn}
          onCheckedChange={(details) => setVoiceInterruptionOn(details.checked)}
          value="voice-interruption"
        />
      </Field>

      <NumberField
        label="Speech Prob. Threshold"
        value={localSettings.positiveSpeechThreshold}
        onChange={(value) => handleInputChange('positiveSpeechThreshold', value)}
        min={1}
        max={100}
      />

      <NumberField
        label="Negative Speech Threshold"
        value={localSettings.negativeSpeechThreshold}
        onChange={(value) => handleInputChange('negativeSpeechThreshold', value)}
        min={0}
        max={100}
      />

      <NumberField
        label="Redemption Frames"
        value={localSettings.redemptionFrames}
        onChange={(value) => handleInputChange('redemptionFrames', value)}
        min={1}
        max={100}
      />
    </Stack>
  )
}

export default ASR
